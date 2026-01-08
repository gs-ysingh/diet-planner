import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AuthenticationError, ForbiddenError, UserInputError } from 'apollo-server-express';
import { ModernAIService } from '../services/ai.service';
import { PDFService } from '../services/pdf.service';
import { CSVService } from '../services/csv.service';
import { emailService } from '../services/email.service';
import { validatePasswordSecurity, sanitizeInput, validateEmail, checkLoginRateLimit } from '../middleware/security';
import crypto from 'crypto';

const prisma = new PrismaClient();
const aiService = new ModernAIService();
const pdfService = new PDFService();
const csvService = new CSVService();

interface Context {
  user?: {
    id: string;
    email: string;
  };
}

const generateToken = (userId: string, email: string): string => {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
};

// Fallback diet plan when OpenAI fails
const createFallbackDietPlan = (user: any, input: any) => {
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  const mealTypes = ['BREAKFAST', 'LUNCH', 'SNACK', 'DINNER'];
  
  const fallbackMeals = {
    BREAKFAST: [
      { name: 'Oatmeal with Berries', calories: 350, protein: 12, carbs: 55, fat: 8, fiber: 8 },
      { name: 'Greek Yogurt Parfait', calories: 300, protein: 20, carbs: 35, fat: 8, fiber: 5 },
      { name: 'Whole Grain Toast with Avocado', calories: 320, protein: 10, carbs: 40, fat: 15, fiber: 10 }
    ],
    LUNCH: [
      { name: 'Grilled Chicken Salad', calories: 450, protein: 35, carbs: 15, fat: 25, fiber: 6 },
      { name: 'Quinoa Bowl with Vegetables', calories: 400, protein: 15, carbs: 60, fat: 12, fiber: 8 },
      { name: 'Turkey and Hummus Wrap', calories: 380, protein: 25, carbs: 45, fat: 12, fiber: 6 }
    ],
    DINNER: [
      { name: 'Baked Salmon with Sweet Potato', calories: 500, protein: 35, carbs: 40, fat: 20, fiber: 6 },
      { name: 'Lean Beef Stir-fry', calories: 480, protein: 30, carbs: 35, fat: 22, fiber: 5 },
      { name: 'Grilled Chicken with Brown Rice', calories: 450, protein: 40, carbs: 45, fat: 12, fiber: 4 }
    ],
    SNACK: [
      { name: 'Apple with Almond Butter', calories: 200, protein: 6, carbs: 25, fat: 12, fiber: 5 },
      { name: 'Greek Yogurt with Nuts', calories: 180, protein: 15, carbs: 12, fat: 8, fiber: 2 },
      { name: 'Hummus with Vegetables', calories: 150, protein: 6, carbs: 18, fat: 8, fiber: 4 }
    ]
  };

  const meals: any[] = [];
  days.forEach((day, dayIndex) => {
    mealTypes.forEach((mealType, mealIndex) => {
      const fallbackOptions = fallbackMeals[mealType as keyof typeof fallbackMeals];
      const selectedMeal = fallbackOptions[dayIndex % fallbackOptions.length];
      
      meals.push({
        day,
        mealType,
        name: selectedMeal.name,
        description: `Healthy ${mealType.toLowerCase()} option`,
        calories: selectedMeal.calories,
        protein: selectedMeal.protein,
        carbs: selectedMeal.carbs,
        fat: selectedMeal.fat,
        fiber: selectedMeal.fiber,
        ingredients: ['Main ingredient', 'Supporting ingredients'],
        instructions: 'Prepare according to standard cooking methods',
        prepTime: 10,
        cookTime: 15,
        servings: 1
      });
    });
  });

  return {
    description: 'Balanced diet plan with healthy meal options',
    meals
  };
};

export const resolvers = {
  Query: {
    me: async (_: any, __: any, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }

      return await prisma.user.findUnique({
        where: { id: context.user.id },
        include: {
          dietPlans: {
            include: {
              meals: true
            }
          }
        }
      });
    },

    getDietPlan: async (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }

      const dietPlan = await prisma.dietPlan.findUnique({
        where: { id },
        include: {
          user: true,
          meals: true
        }
      });

      if (!dietPlan || dietPlan.userId !== context.user.id) {
        throw new ForbiddenError('Diet plan not found or access denied');
      }

      return dietPlan;
    },

    getActiveDietPlan: async (_: any, __: any, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }

      return await prisma.dietPlan.findFirst({
        where: {
          userId: context.user.id,
          isActive: true
        },
        include: {
          user: true,
          meals: {
            orderBy: [
              { day: 'asc' },
              { mealType: 'asc' }
            ]
          }
        }
      });
    },

    getAllDietPlans: async (_: any, __: any, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }

      return await prisma.dietPlan.findMany({
        where: { userId: context.user.id },
        include: {
          user: true,
          meals: true
        },
        orderBy: { createdAt: 'desc' }
      });
    },

    getMealsByDay: async (_: any, { dietPlanId, day }: { dietPlanId: string; day: string }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }

      const dietPlan = await prisma.dietPlan.findUnique({
        where: { id: dietPlanId }
      });

      if (!dietPlan || dietPlan.userId !== context.user.id) {
        throw new ForbiddenError('Diet plan not found or access denied');
      }

      return await prisma.meal.findMany({
        where: {
          dietPlanId,
          day: day as any
        },
        include: {
          dietPlan: true
        },
        orderBy: { mealType: 'asc' }
      });
    }
  },

  Mutation: {
    register: async (_: any, { input }: { input: any }) => {
      // Validate and sanitize inputs
      const email = sanitizeInput(input.email).toLowerCase();
      const name = sanitizeInput(input.name);
      
      // Validate email format
      if (!validateEmail(email)) {
        throw new UserInputError('Invalid email format');
      }
      
      // Validate password security
      const passwordValidation = validatePasswordSecurity(input.password);
      if (!passwordValidation.isValid) {
        throw new UserInputError(`Password requirements not met: ${passwordValidation.errors.join(', ')}`);
      }
      
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        throw new UserInputError('User with this email already exists');
      }

      const hashedPassword = await bcrypt.hash(input.password, 12);
      
      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');

      const user = await prisma.user.create({
        data: {
          ...input,
          email,
          name,
          password: hashedPassword,
          preferences: input.preferences || [],
          verificationToken,
          emailVerified: false
        }
      });
      
      // Send verification email (don't await to not block response)
      emailService.sendVerificationEmail(user.email, user.name, verificationToken)
        .catch(err => console.error('Failed to send verification email:', err));

      const token = generateToken(user.id, user.email);

      return {
        token,
        user
      };
    },

    login: async (_: any, { email, password }: { email: string; password: string }) => {
      const sanitizedEmail = sanitizeInput(email).toLowerCase();
      
      // Check rate limiting for login attempts
      checkLoginRateLimit(sanitizedEmail);
      
      // Validate email format
      if (!validateEmail(sanitizedEmail)) {
        throw new AuthenticationError('Invalid email or password');
      }
      
      const user = await prisma.user.findUnique({
        where: { email: sanitizedEmail }
      });

      if (!user) {
        throw new AuthenticationError('Invalid email or password');
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        throw new AuthenticationError('Invalid email or password');
      }

      const token = generateToken(user.id, user.email);

      return {
        token,
        user
      };
    },

    verifyEmail: async (_: any, { token }: { token: string }) => {
      const user = await prisma.user.findUnique({
        where: { verificationToken: token }
      });

      if (!user) {
        throw new UserInputError('Invalid or expired verification token');
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          verificationToken: null
        }
      });

      const authToken = generateToken(updatedUser.id, updatedUser.email);

      return {
        token: authToken,
        user: updatedUser
      };
    },

    resendVerification: async (_: any, { email }: { email: string }) => {
      const sanitizedEmail = sanitizeInput(email).toLowerCase();
      
      if (!validateEmail(sanitizedEmail)) {
        throw new UserInputError('Invalid email format');
      }

      const user = await prisma.user.findUnique({
        where: { email: sanitizedEmail }
      });

      if (!user) {
        // Don't reveal if user exists or not for security
        return true;
      }

      if (user.emailVerified) {
        throw new UserInputError('Email is already verified');
      }

      // Generate new verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');

      await prisma.user.update({
        where: { id: user.id },
        data: { verificationToken }
      });

      await emailService.sendVerificationEmail(user.email, user.name, verificationToken);

      return true;
    },

    forgotPassword: async (_: any, { email }: { email: string }) => {
      const sanitizedEmail = sanitizeInput(email).toLowerCase();
      
      if (!validateEmail(sanitizedEmail)) {
        throw new UserInputError('Invalid email format');
      }

      const user = await prisma.user.findUnique({
        where: { email: sanitizedEmail }
      });

      if (!user) {
        // Don't reveal if user exists or not for security
        return true;
      }

      // Generate reset token and expiry (1 hour from now)
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry
        }
      });

      await emailService.sendPasswordResetEmail(user.email, user.name, resetToken);

      return true;
    },

    resetPassword: async (_: any, { token, newPassword }: { token: string; newPassword: string }) => {
      // Validate password security
      const passwordValidation = validatePasswordSecurity(newPassword);
      if (!passwordValidation.isValid) {
        throw new UserInputError(`Password requirements not met: ${passwordValidation.errors.join(', ')}`);
      }

      const user = await prisma.user.findUnique({
        where: { resetToken: token }
      });

      if (!user || !user.resetTokenExpiry) {
        throw new UserInputError('Invalid or expired reset token');
      }

      // Check if token has expired
      if (user.resetTokenExpiry < new Date()) {
        throw new UserInputError('Reset token has expired');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null
        }
      });

      // Send confirmation email (don't await)
      emailService.sendPasswordChangedConfirmation(user.email, user.name)
        .catch(err => console.error('Failed to send password changed confirmation:', err));

      return true;
    },

    updateProfile: async (_: any, { input }: { input: any }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }

      return await prisma.user.update({
        where: { id: context.user.id },
        data: {
          ...input,
          preferences: input.preferences || []
        }
      });
    },

    generateDietPlan: async (_: any, { input }: { input: any }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }

      try {
        const user = await prisma.user.findUnique({
          where: { id: context.user.id }
        });

        if (!user) {
          throw new Error('User not found');
        }

        // Deactivate existing active diet plans
        await prisma.dietPlan.updateMany({
          where: {
            userId: context.user.id,
            isActive: true
          },
          data: { isActive: false }
        });

        let generatedPlan;
        try {
          // Generate diet plan using Modern AI Service with LangChain
          generatedPlan = await aiService.generateDietPlan(user, input);
        } catch (aiError) {
          console.error('AI service failed, using fallback:', aiError);
          // Fallback to a basic diet plan structure
          generatedPlan = createFallbackDietPlan(user, input);
        }

        // Calculate week end date
        const weekStart = new Date(input.weekStart);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        // Create diet plan in database
        const dietPlan = await prisma.dietPlan.create({
          data: {
            userId: context.user.id,
            name: input.name,
            description: input.description || generatedPlan.description,
            weekStart,
            weekEnd,
            isActive: true,
            meals: {
              create: generatedPlan.meals
            }
          },
          include: {
            user: true,
            meals: true
          }
        });

        return {
          success: true,
          dietPlan,
          error: null
        };
      } catch (error) {
        console.error('Error generating diet plan:', error);
        return {
          success: false,
          dietPlan: null,
          error: 'Failed to generate diet plan. Please try again.'
        };
      }
    },

    saveDietPlan: async (_: any, { input }: { input: any }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }

      try {
        // Deactivate existing active diet plans
        await prisma.dietPlan.updateMany({
          where: {
            userId: context.user.id,
            isActive: true
          },
          data: { isActive: false }
        });

        // Calculate week end date
        const weekStart = new Date(input.weekStart);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        // Create diet plan in database
        const dietPlan = await prisma.dietPlan.create({
          data: {
            userId: context.user.id,
            name: input.name,
            description: input.description || 'Personalized diet plan',
            weekStart,
            weekEnd,
            isActive: true,
            meals: {
              create: input.meals
            }
          },
          include: {
            user: true,
            meals: true
          }
        });

        return {
          success: true,
          dietPlan,
          error: null
        };
      } catch (error) {
        console.error('Error saving diet plan:', error);
        return {
          success: false,
          dietPlan: null,
          error: 'Failed to save diet plan. Please try again.'
        };
      }
    },

    updateDietPlan: async (_: any, { id, input }: { id: string; input: any }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }

      const dietPlan = await prisma.dietPlan.findUnique({
        where: { id }
      });

      if (!dietPlan || dietPlan.userId !== context.user.id) {
        throw new ForbiddenError('Diet plan not found or access denied');
      }

      const weekEnd = new Date(input.weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      return await prisma.dietPlan.update({
        where: { id },
        data: {
          name: input.name,
          description: input.description,
          weekStart: input.weekStart,
          weekEnd
        },
        include: {
          user: true,
          meals: true
        }
      });
    },

    deleteDietPlan: async (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }

      const dietPlan = await prisma.dietPlan.findUnique({
        where: { id }
      });

      if (!dietPlan || dietPlan.userId !== context.user.id) {
        throw new ForbiddenError('Diet plan not found or access denied');
      }

      await prisma.dietPlan.delete({
        where: { id }
      });

      return true;
    },

    setActiveDietPlan: async (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }

      // Deactivate all existing plans
      await prisma.dietPlan.updateMany({
        where: {
          userId: context.user.id,
          isActive: true
        },
        data: { isActive: false }
      });

      // Activate the selected plan
      return await prisma.dietPlan.update({
        where: { id },
        data: { isActive: true },
        include: {
          user: true,
          meals: true
        }
      });
    },

    updateMeal: async (_: any, { input }: { input: any }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }

      const meal = await prisma.meal.findUnique({
        where: { id: input.id },
        include: { dietPlan: true }
      });

      if (!meal || meal.dietPlan.userId !== context.user.id) {
        throw new ForbiddenError('Meal not found or access denied');
      }

      return await prisma.meal.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description,
          calories: input.calories,
          protein: input.protein,
          carbs: input.carbs,
          fat: input.fat,
          fiber: input.fiber,
          ingredients: input.ingredients || [],
          instructions: input.instructions,
          prepTime: input.prepTime,
          cookTime: input.cookTime,
          servings: input.servings
        },
        include: {
          dietPlan: true
        }
      });
    },

    regenerateMeal: async (_: any, { mealId, customRequirements }: { mealId: string; customRequirements?: string }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }

      const meal = await prisma.meal.findUnique({
        where: { id: mealId },
        include: { dietPlan: { include: { user: true } } }
      });

      if (!meal || meal.dietPlan.userId !== context.user.id) {
        throw new ForbiddenError('Meal not found or access denied');
      }

      try {
        const regeneratedMeal = await aiService.regenerateMeal(
          meal.dietPlan.user,
          meal,
          customRequirements
        );

        return await prisma.meal.update({
          where: { id: mealId },
          data: regeneratedMeal,
          include: {
            dietPlan: true
          }
        });
      } catch (error) {
        console.error('Error regenerating meal:', error);
        throw new Error('Failed to regenerate meal. Please try again.');
      }
    },

    generatePDF: async (_: any, { dietPlanId }: { dietPlanId: string }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }

      const dietPlan = await prisma.dietPlan.findUnique({
        where: { id: dietPlanId },
        include: {
          user: true,
          meals: {
            orderBy: [
              { day: 'asc' },
              { mealType: 'asc' }
            ]
          }
        }
      });

      if (!dietPlan || dietPlan.userId !== context.user.id) {
        throw new ForbiddenError('Diet plan not found or access denied');
      }

      try {
        // Convert null values to undefined for PDF service compatibility
        const pdfCompatiblePlan = {
          ...dietPlan,
          description: dietPlan.description || undefined,
          user: {
            ...dietPlan.user,
            age: dietPlan.user.age || undefined,
            weight: dietPlan.user.weight || undefined,
            height: dietPlan.user.height || undefined,
            goal: dietPlan.user.goal || undefined,
          },
          meals: dietPlan.meals.map(meal => ({
            ...meal,
            description: meal.description || undefined,
            calories: meal.calories || undefined,
            protein: meal.protein || undefined,
            carbs: meal.carbs || undefined,
            fat: meal.fat || undefined,
            fiber: meal.fiber || undefined,
            instructions: meal.instructions || undefined,
            prepTime: meal.prepTime || undefined,
            cookTime: meal.cookTime || undefined,
            servings: meal.servings || undefined,
          }))
        };
        
        const pdfBuffer = await pdfService.generateDietPlanPDF(pdfCompatiblePlan);
        return pdfBuffer.toString('base64');
      } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('Failed to generate PDF. Please try again.');
      }
    },
    generateCSV: async (_: any, { dietPlanId }: { dietPlanId: string }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }

      const dietPlan = await prisma.dietPlan.findUnique({
        where: { id: dietPlanId },
        include: {
          user: true,
          meals: {
            orderBy: [
              { day: 'asc' },
              { mealType: 'asc' }
            ]
          }
        }
      });

      if (!dietPlan || dietPlan.userId !== context.user.id) {
        throw new ForbiddenError('Diet plan not found or access denied');
      }

      try {
        // Convert null values to undefined for CSV service compatibility
        const csvCompatiblePlan = {
          ...dietPlan,
          description: dietPlan.description || undefined,
          user: {
            ...dietPlan.user,
            age: dietPlan.user.age || undefined,
            weight: dietPlan.user.weight || undefined,
            height: dietPlan.user.height || undefined,
            goal: dietPlan.user.goal || undefined,
          },
          meals: dietPlan.meals.map(meal => ({
            ...meal,
            description: meal.description || undefined,
            calories: meal.calories || undefined,
            protein: meal.protein || undefined,
            carbs: meal.carbs || undefined,
            fat: meal.fat || undefined,
            fiber: meal.fiber || undefined,
            instructions: meal.instructions || undefined,
            prepTime: meal.prepTime || undefined,
            cookTime: meal.cookTime || undefined,
            servings: meal.servings || undefined,
          }))
        };
        
        const csvContent = csvService.generateDietPlanCSV(csvCompatiblePlan);
        return csvContent;
      } catch (error) {
        console.error('Error generating CSV:', error);
        throw new Error('Failed to generate CSV. Please try again.');
      }
    }
  }
};
