import OpenAI from 'openai';
import { defaultDietPlan } from '../data/defaultDietPlan';

interface User {
  age?: number;
  weight?: number;
  height?: number;
  gender?: string;
  nationality?: string;
  goal?: string;
  activityLevel?: string;
  preferences: string[];
}

interface DietPlanInput {
  name: string;
  preferences: string[];
  customRequirements?: string;
}

interface GeneratedMeal {
  day: string;
  mealType: string;
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  ingredients: string[];
  instructions: string;
  prepTime: number;
  cookTime: number;
  servings: number;
}

export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    
    console.log('OpenAI API Key length:', process.env.OPENAI_API_KEY.length);
    console.log('OpenAI API Key starts with:', process.env.OPENAI_API_KEY.substring(0, 10) + '...');
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateDietPlan(user: User, input: DietPlanInput) {
    try {
      console.log("Generating complete diet plan in single request with optimized format");
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo', // Use cheaper model for cost efficiency
        messages: [
          {
            role: 'system',
            content: `You are a nutritionist. Create a 7-day diet plan with 4 meals per day (28 total). 
            
CRITICAL: Use COMPACT format. Keep descriptions short (max 10 words). Keep instructions brief (max 15 words). 
Response must be ONLY valid JSON with no additional text or markdown.`
          },
          {
            role: 'user',
            content: this.createCompactDietPlanPrompt(user, input)
          }
        ],
        temperature: 0.3,
        max_tokens: 4000  // Increased for full response but compact format
      });

      console.log("OpenAI Response Status:", response.choices[0].finish_reason);
      const content = response.choices[0].message.content;
      
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      // Clean and extract JSON from the response
      const cleanedContent = this.extractJSON(content);
      const parsedResponse = JSON.parse(cleanedContent);
      return this.formatDietPlanResponse(parsedResponse);
      
    } catch (error) {
      console.error('OpenAI API error, using default diet plan:', error);
      
      // Use default diet plan when AI service fails
      return this.getDefaultDietPlan();
    }
  }

  private createCompactDietPlanPrompt(user: User, input: DietPlanInput): string {
    const userInfo = `User: ${user.age}yo, ${user.weight}kg, ${user.gender}, ${user.goal || 'general health'}
Preferences: ${user.preferences.join(', ') || 'none'}, ${input.preferences.join(', ') || 'none'}
Requirements: ${input.customRequirements || 'none'}`;

    return `${userInfo}

Create 28 meals (7 days × 4 meals). Use SHORT descriptions/instructions.

JSON format:
{
  "description": "7-day plan",
  "meals": [
    {
      "day": "MONDAY",
      "mealType": "BREAKFAST",
      "name": "Meal name",
      "description": "Short desc",
      "calories": 300,
      "protein": 15,
      "carbs": 40,
      "fat": 10,
      "fiber": 5,
      "ingredients": ["item1", "item2", "item3"],
      "instructions": "Brief cooking steps",
      "prepTime": 10,
      "cookTime": 15,
      "servings": 1
    }
  ]
}

Days: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
Meals: BREAKFAST, LUNCH, DINNER, SNACK (4 per day = 28 total)
Keep ALL text concise to fit response limit.`;
  }

  async regenerateMeal(user: User, existingMeal: any, customRequirements?: string) {
    const prompt = this.createMealRegenerationPrompt(user, existingMeal, customRequirements);

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a professional nutritionist. Generate a single meal that replaces the existing one while maintaining similar nutritional value. 

CRITICAL: Your response must be ONLY valid JSON format with no additional text, explanations, or markdown formatting. Do not wrap the JSON in code blocks or add any text before or after the JSON.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1000
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      // Clean and extract JSON from the response
      const cleanedContent = this.extractJSON(content);
      const parsedResponse = JSON.parse(cleanedContent);
      return this.formatMealResponse(parsedResponse);
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to regenerate meal with AI');
    }
  }

  private createDietPlanPrompt(user: User, input: DietPlanInput): string {
    const userInfo = `
User Profile:
- Age: ${user.age || 'Not specified'}
- Weight: ${user.weight || 'Not specified'}kg
- Height: ${user.height || 'Not specified'}cm
- Gender: ${user.gender || 'Not specified'}
- Nationality: ${user.nationality || 'Not specified'}
- Goal: ${user.goal || 'Not specified'}
- Activity Level: ${user.activityLevel || 'Not specified'}
- Dietary Preferences: ${user.preferences.join(', ') || 'None specified'}
- Additional Preferences: ${input.preferences.join(', ') || 'None'}
- Custom Requirements: ${input.customRequirements || 'None'}
`;

    return `${userInfo}

Create a comprehensive 7-day diet plan with 4 meals per day (breakfast, lunch, dinner, snack) for each day of the week (Monday through Sunday).

Requirements:
1. Consider the user's profile, goals, and preferences
2. Ensure nutritional balance and appropriate calorie distribution
3. Include variety across the week
4. Provide realistic, achievable meals
5. Consider cultural preferences based on nationality
6. Account for dietary restrictions and preferences

Return the response in this exact JSON format:
{
  "description": "Brief description of the diet plan",
  "meals": [
    {
      "day": "MONDAY",
      "mealType": "BREAKFAST",
      "name": "Meal name",
      "description": "Brief description",
      "calories": 350,
      "protein": 15.5,
      "carbs": 45.0,
      "fat": 12.0,
      "fiber": 8.0,
      "ingredients": ["ingredient1", "ingredient2"],
      "instructions": "Cooking instructions",
      "prepTime": 10,
      "cookTime": 15,
      "servings": 1
    }
  ]
}

Generate all 28 meals (7 days × 4 meals per day). Ensure day values are: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY and mealType values are: BREAKFAST, LUNCH, DINNER, SNACK.`;
  }

  private createMealRegenerationPrompt(user: User, existingMeal: any, customRequirements?: string): string {
    return `
User Profile:
- Age: ${user.age || 'Not specified'}
- Weight: ${user.weight || 'Not specified'}kg
- Height: ${user.height || 'Not specified'}cm
- Gender: ${user.gender || 'Not specified'}
- Nationality: ${user.nationality || 'Not specified'}
- Goal: ${user.goal || 'Not specified'}
- Activity Level: ${user.activityLevel || 'Not specified'}
- Dietary Preferences: ${user.preferences.join(', ') || 'None specified'}

Current Meal to Replace:
- Name: ${existingMeal.name}
- Type: ${existingMeal.mealType}
- Day: ${existingMeal.day}
- Calories: ${existingMeal.calories}
- Description: ${existingMeal.description}

Custom Requirements: ${customRequirements || 'Generate a similar but different meal'}

Generate a replacement meal that:
1. Is appropriate for the same meal type and maintains similar nutritional value
2. Is different from the existing meal
3. Considers the user's preferences and requirements
4. Follows any custom requirements provided

Return the response in this exact JSON format:
{
  "name": "New meal name",
  "description": "Brief description",
  "calories": 350,
  "protein": 15.5,
  "carbs": 45.0,
  "fat": 12.0,
  "fiber": 8.0,
  "ingredients": ["ingredient1", "ingredient2"],
  "instructions": "Cooking instructions",
  "prepTime": 10,
  "cookTime": 15,
  "servings": 1
}`;
  }

  private extractJSON(content: string): string {
    console.log("Extracting JSON from content:", content.substring(0, 200) + "...");
    
    // Remove markdown code blocks if present
    let cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Remove any leading/trailing whitespace
    cleaned = cleaned.trim();
    
    // Look for both object and array patterns
    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');
    const lastBrace = cleaned.lastIndexOf('}');
    const lastBracket = cleaned.lastIndexOf(']');
    
    let startChar, endChar, startIndex, endIndex;
    
    // Determine if we have an array or object format
    if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
      // Array format
      startChar = '[';
      endChar = ']';
      startIndex = firstBracket;
      endIndex = lastBracket;
    } else {
      // Object format
      startChar = '{';
      endChar = '}';
      startIndex = firstBrace;
      endIndex = lastBrace;
    }
    
    console.log(`Looking for ${startChar}...${endChar} pattern. Start at:`, startIndex, "End at:", endIndex);
    
    if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
      console.error("No valid JSON structure found in content:", cleaned);
      throw new Error('No valid JSON found in OpenAI response');
    }
    
    const extracted = cleaned.substring(startIndex, endIndex + 1);
    console.log("Extracted JSON length:", extracted.length);
    console.log("Extracted JSON preview:", extracted.substring(0, 100) + "...");
    
    return extracted;
  }

  private getDefaultDietPlan() {
    console.log("Using default diet plan as fallback");
    console.log("Default diet plan has", defaultDietPlan.meals.length, "meals");
    return this.formatDietPlanResponse(defaultDietPlan);
  }

  private formatDietPlanResponse(response: any) {
    return {
      description: response.description || 'AI-generated diet plan',
      meals: response.meals.map((meal: any) => ({
        day: meal.day,
        mealType: meal.mealType,
        name: meal.name,
        description: meal.description,
        calories: Math.round(meal.calories) || 0,
        protein: parseFloat(meal.protein.toFixed(1)) || 0,
        carbs: parseFloat(meal.carbs.toFixed(1)) || 0,
        fat: parseFloat(meal.fat.toFixed(1)) || 0,
        fiber: parseFloat(meal.fiber.toFixed(1)) || 0,
        ingredients: Array.isArray(meal.ingredients) ? meal.ingredients : [],
        instructions: meal.instructions || '',
        prepTime: Math.round(meal.prepTime) || 0,
        cookTime: Math.round(meal.cookTime) || 0,
        servings: Math.round(meal.servings) || 1
      }))
    };
  }

  private formatMealResponse(response: any) {
    return {
      name: response.name,
      description: response.description,
      calories: Math.round(response.calories) || 0,
      protein: parseFloat(response.protein.toFixed(1)) || 0,
      carbs: parseFloat(response.carbs.toFixed(1)) || 0,
      fat: parseFloat(response.fat.toFixed(1)) || 0,
      fiber: parseFloat(response.fiber.toFixed(1)) || 0,
      ingredients: Array.isArray(response.ingredients) ? response.ingredients : [],
      instructions: response.instructions || '',
      prepTime: Math.round(response.prepTime) || 0,
      cookTime: Math.round(response.cookTime) || 0,
      servings: Math.round(response.servings) || 1
    };
  }
}
