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

    // Initialize ChatOpenAI with optimized model for speed and cost
    this.chatModel = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4o', // Faster and more cost-effective than gpt-5
      temperature: 0.7, // Balanced creativity
      maxTokens: 2500, // Optimized for 4 meals per request
      streaming: true, // Enable streaming for faster response
      timeout: 60000, // 1 minute timeout per request
      maxRetries: 2, // Retry on timeout
    });

    // Initialize JSON output parser
    this.jsonParser = new JsonOutputParser();

    console.log('✅ Modern AI Service initialized with GPT-4o and LangChain');
  }

  async generateDietPlan(user: User, input: DietPlanInput) {
    try {
      console.log('🤖 Generating complete diet plan using LangChain...');
      console.log('⏱️  This may take 2-3 minutes for a complete plan...');
      
      // Create structured prompt template
      const dietPlanPrompt = PromptTemplate.fromTemplate(`
        Create a 7-day diet plan with exactly 28 meals (4 meals per day: BREAKFAST, LUNCH, SNACK, DINNER).

        User: Age {age}, Weight {weight}kg, Height {height}cm, Gender {gender}, Nationality {nationality}
        Goal: {goal}, Activity: {activityLevel}
        Preferences: {userPreferences}, {inputPreferences}
        Requirements: {customRequirements}

        Requirements:
        1. Exactly 28 meals: 7 days × 4 meals (BREAKFAST, LUNCH, SNACK, DINNER)
        2. CRITICAL: Each day must have DIFFERENT meals - NO DUPLICATES across days
        3. Create VARIETY: Different ingredients, cooking methods, and flavors for each day
        4. Consider user profile and preferences
        5. Realistic, culturally appropriate meals
        6. Proper nutritional values

        Days: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
        Meal types: BREAKFAST, LUNCH, SNACK, DINNER

        ENSURE VARIETY ACROSS THE WEEK:
        - Monday's breakfast should be different from Tuesday's, Wednesday's, etc.
        - Each day should have a unique set of meals
        - Vary proteins, carbs, and vegetables throughout the week
        - Use different cooking methods (grilled, baked, steamed, raw, etc.)

        CRITICAL: Respond with ONLY valid JSON. No markdown, no explanations.
        
        {{
          "description": "Brief plan description (10-200 chars)",
          "meals": [
            {{
              "day": "MONDAY",
              "mealType": "BREAKFAST",
              "name": "Meal name",
              "description": "Brief description",
              "calories": 400,
              "protein": 25,
              "carbs": 45,
              "fat": 15,
              "fiber": 8,
              "ingredients": ["ingredient1", "ingredient2"],
              "instructions": "Cooking steps",
              "prepTime": 15,
              "cookTime": 30,
              "servings": 2
            }}
          ]
        }}
      `);

      // Create the processing chain - but handle JSON parsing manually for better debugging
      const chain = RunnableSequence.from([
        dietPlanPrompt,
        this.chatModel,
      ]);

      // Execute the chain with user data
      console.log('📡 Sending request to OpenAI...');
      const startTime = Date.now();
      const rawResponse = await Promise.race([
        chain.invoke({
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
      }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout - generating fallback plan')), 240000)
        )
      ]);
      
      const elapsedTime = Date.now() - startTime;
      console.log(`✅ Received response in ${(elapsedTime / 1000).toFixed(2)}s`);

      // Parse JSON manually with better error handling
      let result;
      try {
        const content = (rawResponse as any)?.content || rawResponse;
        if (typeof content === 'string') {
          // Try to extract JSON from markdown code blocks if present
          const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
          let jsonString = jsonMatch ? jsonMatch[1] : content;
          
          // Handle truncated JSON by attempting to close it
          if (!jsonString.trim().endsWith('}')) {
            // Count open and close braces
            const openBraces = (jsonString.match(/\{/g) || []).length;
            const closeBraces = (jsonString.match(/\}/g) || []).length;
            const missingBraces = openBraces - closeBraces;
            
            // Add missing closing braces
            if (missingBraces > 0) {
              jsonString += ']' + '}'.repeat(missingBraces);
            }
          }
          
          result = JSON.parse(jsonString);
        } else if (typeof content === 'object') {
          result = content;
        } else {
          throw new Error('Unexpected response format');
        }
      } catch (parseError: any) {
        console.error('❌ JSON parsing error:', parseError);
        throw new Error(`Failed to parse AI response as JSON: ${parseError.message}`);
      }

      // Check if we have enough meals before validation
      if (!result.meals || result.meals.length < 28) {
        throw new Error(`Incomplete meal plan: only ${result.meals?.length || 0} out of 28 required meals`);
      }

      // Validate the response with Zod schema
      const validatedResult = DietPlanSchema.parse(result);

      return this.formatDietPlanResponse(validatedResult);

    } catch (error: any) {
      console.error('❌ LangChain AI service error, using fallback:', error);
      
      // If it's a timeout error, use streaming approach as fallback
      if (error?.message?.includes('timeout') || error?.message?.includes('Request timeout')) {
        console.log('⚠️ Timeout detected - switching to chunk-based generation...');
        try {
          return await this.generateDietPlanInChunks(user, input);
        } catch (chunkError) {
          console.error('❌ Chunk-based generation also failed:', chunkError);
        }
      }
      
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

      // Create the processing chain (without jsonParser since we'll parse manually from stream)
      const chain = RunnableSequence.from([
        mealPrompt,
        this.chatModel,
      ]);

      // Execute the chain with streaming
      let streamedContent = '';
      const streamResponse = await chain.stream({
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

      // Collect streamed chunks
      for await (const chunk of streamResponse) {
        const content = chunk?.content || '';
        streamedContent += content;
      }

      // Parse JSON from streamed content
      let result;
      try {
        const jsonMatch = streamedContent.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        const jsonString = jsonMatch ? jsonMatch[1] : streamedContent;
        result = JSON.parse(jsonString);
      } catch (parseError: any) {
        throw new Error(`Failed to parse AI response: ${parseError.message}`);
      }

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

  // Streaming method to generate diet plan day by day
  async generateDietPlanStream(
    user: User | null,
    input: DietPlanInput,
    onProgress: (event: { type: string; data: any }) => void
  ) {
    try {
      console.log('🔄 Starting streaming diet plan generation...');
      
      const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
      const mealTypes = ['BREAKFAST', 'LUNCH', 'SNACK', 'DINNER'];
      const allMeals: any[] = [];

      // Send initial event
      onProgress({
        type: 'start',
        data: { totalDays: days.length }
      });

      // Generate meals for each day
      for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
        const day = days[dayIndex];
        console.log(`📅 Generating meals for ${day}...`);

        onProgress({
          type: 'progress',
          data: {
            day,
            dayIndex,
            totalDays: days.length,
            message: `Generating meals for ${day}...`
          }
        });

        const dayMeals: any[] = [];

        // Build context of previously generated meals to avoid duplicates
        const previousMealsContext = allMeals.length > 0
          ? `\nAvoid duplicating: ${allMeals.slice(-4).map(m => m.name).join(', ')}`
          : '';

        // Generate ALL 4 meals for the day in a SINGLE request (much faster!)
        const dayPrompt = PromptTemplate.fromTemplate(`
          Create 4 meals for {day}: BREAKFAST, LUNCH, SNACK, and DINNER.

          User: Age {age}, {weight}kg, {height}cm, {gender}, {nationality}
          Goal: {goal}, Activity: {activityLevel}
          Preferences: {userPreferences}, {inputPreferences}
          Requirements: {customRequirements}
          {previousMealsContext}

          Day {dayNumber} of 7. Create varied, realistic meals.

          JSON format (no markdown):
          [
            {{"mealType":"BREAKFAST","name":"...","description":"...","calories":400,"protein":25,"carbs":45,"fat":15,"fiber":8,"ingredients":["..."],"instructions":"...","prepTime":10,"cookTime":15,"servings":1}},
            {{"mealType":"LUNCH","name":"...","description":"...","calories":500,"protein":35,"carbs":50,"fat":20,"fiber":10,"ingredients":["..."],"instructions":"...","prepTime":15,"cookTime":20,"servings":1}},
            {{"mealType":"DINNER","name":"...","description":"...","calories":550,"protein":40,"carbs":45,"fat":22,"fiber":8,"ingredients":["..."],"instructions":"...","prepTime":20,"cookTime":30,"servings":1}},
            {{"mealType":"SNACK","name":"...","description":"...","calories":200,"protein":10,"carbs":20,"fat":10,"fiber":5,"ingredients":["..."],"instructions":"...","prepTime":5,"cookTime":0,"servings":1}}
          ]
        `);

        const chain = RunnableSequence.from([dayPrompt, this.chatModel]);

        try {
          // Stream all 4 meals for this day in ONE request
          let streamedContent = '';
          
          const streamResponse = await chain.stream({
            day,
            dayNumber: dayIndex + 1,
            age: user?.age || 'Not specified',
            weight: user?.weight || 'Not specified',
            height: user?.height || 'Not specified',
            gender: user?.gender || 'Not specified',
            nationality: user?.nationality || 'Not specified',
            goal: user?.goal || 'General health',
            activityLevel: user?.activityLevel || 'Moderate',
            userPreferences: user?.preferences?.join(', ') || 'None',
            inputPreferences: input.preferences.join(', ') || 'None',
            customRequirements: input.customRequirements || 'None',
            previousMealsContext,
          });
          
          // Collect streamed chunks
          for await (const chunk of streamResponse) {
            const content = chunk?.content || '';
            streamedContent += content;
            
            // Update progress periodically
            if (streamedContent.length % 100 === 0) {
              onProgress({
                type: 'meal_streaming',
                data: {
                  day,
                  progress: streamedContent.length,
                  message: `Generating meals for ${day}...`
                }
              });
            }
          }

          // Parse the streamed response (array of 4 meals)
          let mealsArray;
          try {
            const jsonMatch = streamedContent.match(/```(?:json)?\s*(\[[\s\S]*\])\s*```/);
            const jsonString = jsonMatch ? jsonMatch[1] : streamedContent.trim();
            mealsArray = JSON.parse(jsonString);
          } catch (parseError: any) {
            console.error(`Parse error for ${day}:`, parseError);
            throw parseError;
          }

          // Process each meal from the batch
          if (Array.isArray(mealsArray) && mealsArray.length === 4) {
            for (const mealData of mealsArray) {
              const meal = {
                day,
                mealType: mealData.mealType,
                ...this.formatMealResponse(mealData)
              };
              dayMeals.push(meal);
              allMeals.push(meal);
            }
          } else {
            throw new Error(`Expected 4 meals, got ${mealsArray?.length || 0}`);
          }

        } catch (dayError) {
          console.error(`Error generating meals for ${day}:`, dayError);
          // Use fallback meals for the entire day
          for (const mealType of mealTypes) {
            const fallbackMeal = this.getFallbackMeal(day, mealType);
            dayMeals.push(fallbackMeal);
            allMeals.push(fallbackMeal);
          }
        }

        // Send the completed day's meals
        onProgress({
          type: 'day_complete',
          data: {
            day,
            dayIndex,
            meals: dayMeals,
            totalDays: days.length
          }
        });
      }

      // Send final complete event with all meals
      onProgress({
        type: 'plan_complete',
        data: {
          description: `Personalized ${days.length}-day diet plan tailored to your goals and preferences`,
          meals: allMeals,
          totalMeals: allMeals.length
        }
      });

      console.log('✅ Streaming diet plan generation complete');

    } catch (error) {
      console.error('❌ Streaming generation error:', error);
      onProgress({
        type: 'error',
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
  }

  // Generate diet plan in smaller chunks to avoid timeout
  private async generateDietPlanInChunks(user: User, input: DietPlanInput) {
    console.log('📦 Generating diet plan in chunks (2 days at a time)...');
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    const mealTypes = ['BREAKFAST', 'LUNCH', 'SNACK', 'DINNER'];
    const allMeals: any[] = [];

    // Process 2 days at a time
    for (let i = 0; i < days.length; i += 2) {
      const chunkDays = days.slice(i, i + 2);
      console.log(`🔄 Processing days ${i + 1}-${Math.min(i + 2, days.length)}...`);

      for (const day of chunkDays) {
        for (const mealType of mealTypes) {
          try {
            const mealPrompt = PromptTemplate.fromTemplate(`
              Create a {mealType} meal for {day}.

              User: Age {age}, Weight {weight}kg, Height {height}cm, {gender}, {nationality}
              Goal: {goal}, Activity: {activityLevel}
              Preferences: {userPreferences}

              CRITICAL: Respond with ONLY valid JSON:
              {{
                "name": "Meal name",
                "description": "Brief description",
                "calories": 400,
                "protein": 25,
                "carbs": 45,
                "fat": 15,
                "fiber": 8,
                "ingredients": ["ingredient1", "ingredient2"],
                "instructions": "Steps",
                "prepTime": 15,
                "cookTime": 30,
                "servings": 2
              }}
            `);

            const chain = RunnableSequence.from([mealPrompt, this.chatModel]);
            const rawResponse = await Promise.race([
              chain.invoke({
                day,
                mealType,
                age: user.age || 'Not specified',
                weight: user.weight || 'Not specified',
                height: user.height || 'Not specified',
                gender: user.gender || 'Not specified',
                nationality: user.nationality || 'Not specified',
                goal: user.goal || 'General health',
                activityLevel: user.activityLevel || 'Moderate',
                userPreferences: user.preferences.join(', ') || 'None',
              }),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Meal timeout')), 30000))
            ]);

            const content = (rawResponse as any)?.content || rawResponse;
            let mealData;
            if (typeof content === 'string') {
              const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
              const jsonString = jsonMatch ? jsonMatch[1] : content;
              mealData = JSON.parse(jsonString);
            } else {
              mealData = content;
            }

            allMeals.push({
              day,
              mealType,
              ...this.formatMealResponse(mealData)
            });
          } catch (error) {
            console.error(`Error generating ${mealType} for ${day}, using fallback`);
            allMeals.push(this.getFallbackMeal(day, mealType));
          }
        }
      }

      // Small delay between chunks to avoid rate limits
      if (i + 2 < days.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return {
      description: `Personalized 7-day diet plan tailored to your goals`,
      meals: allMeals
    };
  }

  private getFallbackMeal(day: string, mealType: string): any {
    const fallbackMeals: any = {
      BREAKFAST: {
        name: 'Healthy Breakfast Bowl',
        description: 'Nutritious breakfast option',
        calories: 350,
        protein: 15,
        carbs: 45,
        fat: 12,
        fiber: 8,
        ingredients: ['Oats', 'Berries', 'Nuts', 'Yogurt'],
        instructions: 'Mix ingredients and enjoy',
        prepTime: 10,
        cookTime: 5,
        servings: 1
      },
      LUNCH: {
        name: 'Balanced Lunch',
        description: 'Well-rounded lunch meal',
        calories: 450,
        protein: 30,
        carbs: 40,
        fat: 18,
        fiber: 6,
        ingredients: ['Chicken', 'Vegetables', 'Rice', 'Olive oil'],
        instructions: 'Prepare and cook ingredients',
        prepTime: 15,
        cookTime: 20,
        servings: 1
      },
      DINNER: {
        name: 'Wholesome Dinner',
        description: 'Satisfying dinner option',
        calories: 500,
        protein: 35,
        carbs: 45,
        fat: 20,
        fiber: 7,
        ingredients: ['Fish', 'Vegetables', 'Quinoa', 'Spices'],
        instructions: 'Cook ingredients properly',
        prepTime: 15,
        cookTime: 25,
        servings: 1
      },
      SNACK: {
        name: 'Healthy Snack',
        description: 'Nutritious snack option',
        calories: 180,
        protein: 8,
        carbs: 20,
        fat: 9,
        fiber: 4,
        ingredients: ['Nuts', 'Fruit', 'Yogurt'],
        instructions: 'Combine and enjoy',
        prepTime: 5,
        cookTime: 0,
        servings: 1
      }
    };

    return {
      day,
      mealType,
      ...fallbackMeals[mealType]
    };
  }
}