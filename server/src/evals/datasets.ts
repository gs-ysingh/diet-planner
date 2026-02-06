import { Client } from 'langsmith';
import { DATASET_NAMES } from './config';

// User profile types for test cases
interface TestUser {
  age: number | null;
  weight: number | null;
  height: number | null;
  gender: string | null;
  nationality: string | null;
  goal: string | null;
  activityLevel: string | null;
  preferences: string[];
}

interface TestInput {
  name: string;
  preferences: string[];
  customRequirements?: string;
}

export interface DietPlanTestCase {
  id: string;
  name: string;
  user: TestUser;
  input: TestInput;
  expectedBehavior: {
    minCaloriesPerDay: number;
    maxCaloriesPerDay: number;
    shouldRespectPreferences: string[];
    shouldAvoid: string[];
  };
}

export interface MealRegenerationTestCase {
  id: string;
  name: string;
  user: TestUser;
  existingMeal: {
    name: string;
    mealType: string;
    day: string;
    calories: number;
    description: string;
  };
  customRequirements?: string;
  expectedBehavior: {
    calorieRange: { min: number; max: number };
    shouldBeDifferent: boolean;
  };
}

// Test cases for diet plan generation
export const dietPlanTestCases: DietPlanTestCase[] = [
  {
    id: 'weight-loss-sedentary',
    name: 'Weight Loss - Sedentary Adult',
    user: {
      age: 35,
      weight: 85,
      height: 175,
      gender: 'male',
      nationality: 'American',
      goal: 'WEIGHT_LOSS',
      activityLevel: 'SEDENTARY',
      preferences: ['low-carb'],
    },
    input: {
      name: 'Weight Loss Plan',
      preferences: ['high-protein', 'low-sugar'],
      customRequirements: 'Focus on sustainable weight loss',
    },
    expectedBehavior: {
      minCaloriesPerDay: 1200,
      maxCaloriesPerDay: 1800,
      shouldRespectPreferences: ['low-carb', 'high-protein'],
      shouldAvoid: ['high-sugar', 'fried foods'],
    },
  },
  {
    id: 'muscle-gain-active',
    name: 'Muscle Gain - Active Adult',
    user: {
      age: 28,
      weight: 70,
      height: 180,
      gender: 'male',
      nationality: 'Indian',
      goal: 'MUSCLE_GAIN',
      activityLevel: 'VERY_ACTIVE',
      preferences: ['high-protein', 'vegetarian'],
    },
    input: {
      name: 'Muscle Building Plan',
      preferences: ['high-calorie', 'protein-rich'],
      customRequirements: 'Vegetarian meals with adequate protein for muscle building',
    },
    expectedBehavior: {
      minCaloriesPerDay: 2500,
      maxCaloriesPerDay: 3500,
      shouldRespectPreferences: ['vegetarian', 'high-protein'],
      shouldAvoid: ['meat', 'fish', 'chicken'],
    },
  },
  {
    id: 'maintenance-moderate',
    name: 'Maintenance - Moderate Activity',
    user: {
      age: 42,
      weight: 68,
      height: 165,
      gender: 'female',
      nationality: 'Japanese',
      goal: 'MAINTENANCE',
      activityLevel: 'MODERATE',
      preferences: ['balanced', 'asian-cuisine'],
    },
    input: {
      name: 'Balanced Maintenance Plan',
      preferences: ['traditional Japanese', 'seasonal ingredients'],
      customRequirements: 'Include traditional Japanese dishes',
    },
    expectedBehavior: {
      minCaloriesPerDay: 1600,
      maxCaloriesPerDay: 2200,
      shouldRespectPreferences: ['asian-cuisine', 'balanced'],
      shouldAvoid: [],
    },
  },
  {
    id: 'diabetic-friendly',
    name: 'Diabetic Friendly - Low Glycemic',
    user: {
      age: 55,
      weight: 78,
      height: 170,
      gender: 'male',
      nationality: 'British',
      goal: 'HEALTH_IMPROVEMENT',
      activityLevel: 'LIGHT',
      preferences: ['low-glycemic', 'diabetic-friendly'],
    },
    input: {
      name: 'Diabetic Friendly Plan',
      preferences: ['low-sugar', 'complex-carbs', 'high-fiber'],
      customRequirements: 'All meals should be diabetic-friendly with low glycemic index',
    },
    expectedBehavior: {
      minCaloriesPerDay: 1500,
      maxCaloriesPerDay: 2000,
      shouldRespectPreferences: ['low-glycemic', 'low-sugar', 'high-fiber'],
      shouldAvoid: ['white rice', 'white bread', 'sugary'],
    },
  },
  {
    id: 'vegan-athlete',
    name: 'Vegan Athlete',
    user: {
      age: 25,
      weight: 65,
      height: 172,
      gender: 'female',
      nationality: 'German',
      goal: 'ATHLETIC_PERFORMANCE',
      activityLevel: 'VERY_ACTIVE',
      preferences: ['vegan', 'whole-foods'],
    },
    input: {
      name: 'Vegan Athletic Performance Plan',
      preferences: ['plant-based protein', 'energy-dense'],
      customRequirements: 'Strictly vegan with focus on athletic performance and recovery',
    },
    expectedBehavior: {
      minCaloriesPerDay: 2200,
      maxCaloriesPerDay: 3000,
      shouldRespectPreferences: ['vegan', 'plant-based'],
      shouldAvoid: ['meat', 'dairy', 'eggs', 'honey'],
    },
  },
  {
    id: 'keto-weight-loss',
    name: 'Keto Diet for Weight Loss',
    user: {
      age: 38,
      weight: 92,
      height: 178,
      gender: 'male',
      nationality: 'Mexican',
      goal: 'WEIGHT_LOSS',
      activityLevel: 'MODERATE',
      preferences: ['keto', 'low-carb'],
    },
    input: {
      name: 'Ketogenic Weight Loss Plan',
      preferences: ['high-fat', 'very-low-carb'],
      customRequirements: 'Strictly ketogenic with under 20g net carbs per day',
    },
    expectedBehavior: {
      minCaloriesPerDay: 1500,
      maxCaloriesPerDay: 2200,
      shouldRespectPreferences: ['keto', 'low-carb', 'high-fat'],
      shouldAvoid: ['bread', 'rice', 'pasta', 'sugar', 'fruit'],
    },
  },
  {
    id: 'mediterranean-heart-health',
    name: 'Mediterranean Diet for Heart Health',
    user: {
      age: 60,
      weight: 75,
      height: 168,
      gender: 'female',
      nationality: 'Italian',
      goal: 'HEALTH_IMPROVEMENT',
      activityLevel: 'LIGHT',
      preferences: ['mediterranean', 'heart-healthy'],
    },
    input: {
      name: 'Mediterranean Heart Health Plan',
      preferences: ['olive oil', 'fish', 'whole grains'],
      customRequirements: 'Focus on heart-healthy Mediterranean cuisine',
    },
    expectedBehavior: {
      minCaloriesPerDay: 1400,
      maxCaloriesPerDay: 1900,
      shouldRespectPreferences: ['mediterranean', 'heart-healthy'],
      shouldAvoid: ['processed foods', 'red meat'],
    },
  },
  {
    id: 'gluten-free-celiac',
    name: 'Gluten-Free for Celiac Disease',
    user: {
      age: 32,
      weight: 62,
      height: 160,
      gender: 'female',
      nationality: 'Australian',
      goal: 'MAINTENANCE',
      activityLevel: 'MODERATE',
      preferences: ['gluten-free'],
    },
    input: {
      name: 'Gluten-Free Maintenance Plan',
      preferences: ['celiac-safe', 'whole-foods'],
      customRequirements: 'Strictly gluten-free - no wheat, barley, rye, or cross-contamination',
    },
    expectedBehavior: {
      minCaloriesPerDay: 1600,
      maxCaloriesPerDay: 2100,
      shouldRespectPreferences: ['gluten-free'],
      shouldAvoid: ['wheat', 'barley', 'rye', 'bread', 'pasta'],
    },
  },
];

// Test cases for meal regeneration
export const mealRegenerationTestCases: MealRegenerationTestCase[] = [
  {
    id: 'regen-breakfast-variety',
    name: 'Regenerate Breakfast - Different Variety',
    user: {
      age: 30,
      weight: 70,
      height: 175,
      gender: 'male',
      nationality: 'American',
      goal: 'MAINTENANCE',
      activityLevel: 'MODERATE',
      preferences: ['healthy'],
    },
    existingMeal: {
      name: 'Oatmeal with Berries',
      mealType: 'BREAKFAST',
      day: 'MONDAY',
      calories: 350,
      description: 'Classic oatmeal topped with fresh berries and honey',
    },
    expectedBehavior: {
      calorieRange: { min: 300, max: 400 },
      shouldBeDifferent: true,
    },
  },
  {
    id: 'regen-lunch-high-protein',
    name: 'Regenerate Lunch - High Protein Request',
    user: {
      age: 28,
      weight: 80,
      height: 182,
      gender: 'male',
      nationality: 'British',
      goal: 'MUSCLE_GAIN',
      activityLevel: 'VERY_ACTIVE',
      preferences: ['high-protein'],
    },
    existingMeal: {
      name: 'Grilled Chicken Salad',
      mealType: 'LUNCH',
      day: 'WEDNESDAY',
      calories: 450,
      description: 'Fresh salad with grilled chicken breast',
    },
    customRequirements: 'Need more protein, at least 40g',
    expectedBehavior: {
      calorieRange: { min: 400, max: 500 },
      shouldBeDifferent: true,
    },
  },
  {
    id: 'regen-dinner-vegetarian',
    name: 'Regenerate Dinner - Vegetarian Alternative',
    user: {
      age: 35,
      weight: 65,
      height: 168,
      gender: 'female',
      nationality: 'Indian',
      goal: 'MAINTENANCE',
      activityLevel: 'MODERATE',
      preferences: ['vegetarian'],
    },
    existingMeal: {
      name: 'Grilled Salmon with Vegetables',
      mealType: 'DINNER',
      day: 'FRIDAY',
      calories: 520,
      description: 'Pan-seared salmon with roasted vegetables',
    },
    customRequirements: 'Make it vegetarian',
    expectedBehavior: {
      calorieRange: { min: 470, max: 570 },
      shouldBeDifferent: true,
    },
  },
];

// Create or update datasets in LangSmith
export async function createDatasets(client: Client): Promise<void> {
  console.log('Creating/updating LangSmith datasets...\n');

  // First, list existing datasets
  console.log('Checking existing datasets...');
  try {
    const datasets = await client.listDatasets();
    const datasetList: string[] = [];
    for await (const dataset of datasets) {
      datasetList.push(dataset.name);
    }
    console.log(`Found ${datasetList.length} existing datasets: ${datasetList.join(', ') || 'none'}\n`);
  } catch (err) {
    console.log('Could not list datasets:', err);
  }

  // Create diet plan generation dataset
  try {
    const dietPlanDataset = await client.createDataset(DATASET_NAMES.DIET_PLAN_GENERATION, {
      description: 'Test cases for diet plan generation with various user profiles and goals',
    });
    console.log(`✅ Created dataset: ${DATASET_NAMES.DIET_PLAN_GENERATION} (ID: ${dietPlanDataset.id})`);

    // Add examples to the dataset
    for (const testCase of dietPlanTestCases) {
      await client.createExample(
        { user: testCase.user, input: testCase.input },
        { expectedBehavior: testCase.expectedBehavior },
        {
          datasetId: dietPlanDataset.id,
          metadata: { testCaseId: testCase.id, testCaseName: testCase.name },
        }
      );
    }
    console.log(`   Added ${dietPlanTestCases.length} examples to diet plan dataset`);
  } catch (error: any) {
    if (error.message?.includes('already exists') || error.status === 409) {
      console.log(`ℹ️  Dataset ${DATASET_NAMES.DIET_PLAN_GENERATION} already exists`);
      // Try to get the existing dataset
      try {
        const existing = await client.readDataset({ datasetName: DATASET_NAMES.DIET_PLAN_GENERATION });
        console.log(`   Found existing dataset with ID: ${existing.id}`);
      } catch (e) {
        console.log('   Could not read existing dataset');
      }
    } else {
      console.error('Error creating diet plan dataset:', error.message);
      throw error;
    }
  }

  // Create meal regeneration dataset
  try {
    const mealRegenDataset = await client.createDataset(DATASET_NAMES.MEAL_REGENERATION, {
      description: 'Test cases for single meal regeneration scenarios',
    });
    console.log(`✅ Created dataset: ${DATASET_NAMES.MEAL_REGENERATION} (ID: ${mealRegenDataset.id})`);

    for (const testCase of mealRegenerationTestCases) {
      await client.createExample(
        {
          user: testCase.user,
          existingMeal: testCase.existingMeal,
          customRequirements: testCase.customRequirements,
        },
        { expectedBehavior: testCase.expectedBehavior },
        {
          datasetId: mealRegenDataset.id,
          metadata: { testCaseId: testCase.id, testCaseName: testCase.name },
        }
      );
    }
    console.log(`   Added ${mealRegenerationTestCases.length} examples to meal regeneration dataset`);
  } catch (error: any) {
    if (error.message?.includes('already exists') || error.status === 409) {
      console.log(`ℹ️  Dataset ${DATASET_NAMES.MEAL_REGENERATION} already exists`);
    } else {
      throw error;
    }
  }
}

// Export test cases for direct use
export function getDietPlanTestCases(): DietPlanTestCase[] {
  return dietPlanTestCases;
}

export function getMealRegenerationTestCases(): MealRegenerationTestCase[] {
  return mealRegenerationTestCases;
}
