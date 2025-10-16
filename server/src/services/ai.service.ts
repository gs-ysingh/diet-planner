import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { z } from 'zod';
import { defaultDietPlan } from '../data/defaultDietPlan';

// Zod schemas for structured output
const MealSchema = z.object({
  day: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(200),
  calories: z.number().min(50).max(2000),
  protein: z.number().min(0).max(200),
  carbs: z.number().min(0).max(300),
  fat: z.number().min(0).max(150),
  fiber: z.number().min(0).max(50),
  ingredients: z.array(z.string()).min(1).max(15),
  instructions: z.string().min(10).max(500),
  prepTime: z.number().min(0).max(120),
  cookTime: z.number().min(0).max(240),
  servings: z.number().min(1).max(8),
});

const DietPlanSchema = z.object({
  description: z.string().min(10).max(200),
  meals: z.array(MealSchema).length(28), // Exactly 28 meals (7 days × 4 meals)
});

const SingleMealSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(200),
  calories: z.number().min(50).max(2000),
  protein: z.number().min(0).max(200),
  carbs: z.number().min(0).max(300),
  fat: z.number().min(0).max(150),
  fiber: z.number().min(0).max(50),
  ingredients: z.array(z.string()).min(1).max(15),
  instructions: z.string().min(10).max(500),
  prepTime: z.number().min(0).max(120),
  cookTime: z.number().min(0).max(240),
  servings: z.number().min(1).max(8),
});

interface User {
  age?: number | null;
  weight?: number | null;
  height?: number | null;
  gender?: string | null;
  nationality?: string | null;
  goal?: string | null;
  activityLevel?: string | null;
  preferences: string[];
}

interface DietPlanInput {
  name: string;
  preferences: string[];
  customRequirements?: string;
}

export class ModernAIService {
  private chatModel: ChatOpenAI;
  private jsonParser: JsonOutputParser;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    // Initialize ChatOpenAI with latest model and optimized settings
    this.chatModel = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4o-mini', // Latest cost-effective model
      temperature: 0.3,
      maxTokens: 4000,
      streaming: false,
    });

    // Initialize JSON output parser
    this.jsonParser = new JsonOutputParser();

    console.log('✅ Modern AI Service initialized with GPT-4o-mini and LangChain');
  }

  async generateDietPlan(user: User, input: DietPlanInput) {
    try {
      console.log('🤖 Generating complete diet plan using LangChain...');
      
      // Create structured prompt template
      const dietPlanPrompt = PromptTemplate.fromTemplate(`
        You are an expert nutritionist and meal planner. Create a comprehensive 7-day diet plan with exactly 28 meals (4 meals per day for 7 days).

        User Profile:
        - Age: {age} years
        - Weight: {weight} kg
        - Height: {height} cm
        - Gender: {gender}
        - Nationality: {nationality}
        - Goal: {goal}
        - Activity Level: {activityLevel}
        - Dietary Preferences: {userPreferences}
        - Additional Preferences: {inputPreferences}
        - Custom Requirements: {customRequirements}

        Requirements:
        1. Create exactly 28 meals: 7 days × 4 meals (BREAKFAST, LUNCH, DINNER, SNACK)
        2. Consider user's profile, goals, and all preferences
        3. Ensure nutritional balance and appropriate calorie distribution
        4. Include variety across the week while maintaining consistency with preferences
        5. Provide realistic, culturally appropriate meals
        6. Account for all dietary restrictions and preferences
        7. Ensure each meal has proper nutritional values and detailed ingredients
        8. Keep descriptions concise but informative
        9. Provide clear, step-by-step cooking instructions

        Days must be: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
        Meal types must be: BREAKFAST, LUNCH, DINNER, SNACK

        {formatInstructions}
      `);

      // Create the processing chain
      const chain = RunnableSequence.from([
        dietPlanPrompt,
        this.chatModel,
        this.jsonParser,
      ]);

      // Execute the chain with user data
      const result = await chain.invoke({
        age: user.age || 'Not specified',
        weight: user.weight || 'Not specified',
        height: user.height || 'Not specified',
        gender: user.gender || 'Not specified',
        nationality: user.nationality || 'Not specified',
        goal: user.goal || 'General health and wellness',
        activityLevel: user.activityLevel || 'Moderate',
        userPreferences: user.preferences.join(', ') || 'None',
        inputPreferences: input.preferences.join(', ') || 'None',
        customRequirements: input.customRequirements || 'None',
        formatInstructions: 'Respond with valid JSON only, no additional text or formatting.',
      });

      // Validate the response with Zod schema
      const validatedResult = DietPlanSchema.parse(result);

      console.log('✅ Successfully generated diet plan with LangChain');
      console.log(`📊 Generated ${validatedResult.meals.length} meals`);
      
      return this.formatDietPlanResponse(validatedResult);

    } catch (error) {
      console.error('❌ LangChain AI service error, using fallback:', error);
      return this.getDefaultDietPlan();
    }
  }

  async regenerateMeal(user: User, existingMeal: any, customRequirements?: string) {
    try {
      console.log('🔄 Regenerating meal using LangChain...');

      // Create meal regeneration prompt template
      const mealPrompt = PromptTemplate.fromTemplate(`
        You are an expert nutritionist. Generate a single replacement meal that maintains similar nutritional value but is completely different from the existing meal.

        User Profile:
        - Age: {age} years
        - Weight: {weight} kg
        - Height: {height} cm
        - Gender: {gender}
        - Nationality: {nationality}
        - Goal: {goal}
        - Activity Level: {activityLevel}
        - Dietary Preferences: {userPreferences}

        Current Meal to Replace:
        - Name: {existingMealName}
        - Type: {existingMealType}
        - Day: {existingDay}
        - Calories: {existingCalories}
        - Description: {existingDescription}

        Custom Requirements: {customRequirements}

        Requirements:
        1. Create a completely different meal appropriate for {existingMealType} on {existingDay}
        2. Maintain similar calorie range (±50 calories from {existingCalories})
        3. Consider user's dietary preferences and restrictions
        4. Ensure nutritional balance appropriate for the meal type
        5. Follow any custom requirements provided
        6. Make it culturally appropriate based on user's nationality
        7. Provide detailed ingredients and clear cooking instructions

        {formatInstructions}
      `);

      // Create the processing chain
      const chain = RunnableSequence.from([
        mealPrompt,
        this.chatModel,
        this.jsonParser,
      ]);

      // Execute the chain
      const result = await chain.invoke({
        age: user.age || 'Not specified',
        weight: user.weight || 'Not specified',
        height: user.height || 'Not specified',
        gender: user.gender || 'Not specified',
        nationality: user.nationality || 'Not specified',
        goal: user.goal || 'General health',
        activityLevel: user.activityLevel || 'Moderate',
        userPreferences: user.preferences.join(', ') || 'None',
        existingMealName: existingMeal.name,
        existingMealType: existingMeal.mealType,
        existingDay: existingMeal.day,
        existingCalories: existingMeal.calories,
        existingDescription: existingMeal.description,
        customRequirements: customRequirements || 'Generate a similar but different meal with variety',
        formatInstructions: 'Respond with valid JSON only, no additional text or formatting.',
      });

      // Validate the response with Zod schema
      const validatedResult = SingleMealSchema.parse(result);

      console.log('✅ Successfully regenerated meal with LangChain');
      return this.formatMealResponse(validatedResult);

    } catch (error) {
      console.error('❌ LangChain meal regeneration error:', error);
      throw new Error(`Failed to regenerate meal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private getDefaultDietPlan() {
    console.log('📋 Using default diet plan as fallback');
    return this.formatDietPlanResponse(defaultDietPlan);
  }

  private formatDietPlanResponse(response: any) {
    return {
      description: response.description || 'AI-generated personalized diet plan',
      meals: response.meals.map((meal: any) => ({
        day: meal.day,
        mealType: meal.mealType,
        name: meal.name,
        description: meal.description,
        calories: Math.round(meal.calories),
        protein: parseFloat(meal.protein.toFixed(1)),
        carbs: parseFloat(meal.carbs.toFixed(1)),
        fat: parseFloat(meal.fat.toFixed(1)),
        fiber: parseFloat(meal.fiber.toFixed(1)),
        ingredients: Array.isArray(meal.ingredients) ? meal.ingredients : [],
        instructions: meal.instructions,
        prepTime: Math.round(meal.prepTime),
        cookTime: Math.round(meal.cookTime),
        servings: Math.round(meal.servings)
      }))
    };
  }

  private formatMealResponse(response: any) {
    return {
      name: response.name,
      description: response.description,
      calories: Math.round(response.calories),
      protein: parseFloat(response.protein.toFixed(1)),
      carbs: parseFloat(response.carbs.toFixed(1)),
      fat: parseFloat(response.fat.toFixed(1)),
      fiber: parseFloat(response.fiber.toFixed(1)),
      ingredients: Array.isArray(response.ingredients) ? response.ingredients : [],
      instructions: response.instructions,
      prepTime: Math.round(response.prepTime),
      cookTime: Math.round(response.cookTime),
      servings: Math.round(response.servings)
    };
  }

  // Advanced method for nutritional analysis (future enhancement)
  async analyzeNutritionalBalance(meals: any[]) {
    try {
      const analysisPrompt = PromptTemplate.fromTemplate(`
        Analyze the nutritional balance of this meal plan and provide recommendations for improvement:
        
        Meals: {mealsData}
        
        Provide a brief analysis of:
        1. Overall calorie distribution
        2. Macronutrient balance (protein, carbs, fat)
        3. Micronutrient coverage
        4. Suggestions for improvement
        
        Keep the response concise and actionable.
      `);

      const analysisChain = analysisPrompt.pipe(this.chatModel);
      
      const analysis = await analysisChain.invoke({
        mealsData: JSON.stringify(meals.slice(0, 5)), // Limit data to prevent token overflow
      });

      return String(analysis.content || 'Analysis unavailable');
    } catch (error) {
      console.error('❌ Nutritional analysis error:', error);
      return 'Nutritional analysis temporarily unavailable.';
    }
  }

  // Method to get AI-powered meal suggestions based on remaining ingredients
  async suggestMealsFromIngredients(ingredients: string[], mealType: string = 'DINNER') {
    try {
      const suggestionPrompt = PromptTemplate.fromTemplate(`
        Suggest 3 creative and nutritious {mealType} meals using these available ingredients:
        
        Available ingredients: {ingredients}
        
        For each meal, provide:
        - Name
        - Brief description
        - Estimated prep time
        - Key nutritional benefits
        
        Make the suggestions practical and delicious.
      `);

      const suggestionChain = suggestionPrompt.pipe(this.chatModel);
      
      const suggestions = await suggestionChain.invoke({
        mealType,
        ingredients: ingredients.join(', '),
      });

      return String(suggestions.content || 'Suggestions unavailable');
    } catch (error) {
      console.error('❌ Meal suggestion error:', error);
      return 'Meal suggestions temporarily unavailable.';
    }
  }
}