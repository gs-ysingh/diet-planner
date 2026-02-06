import 'dotenv/config';

// Set environment variables BEFORE importing LangSmith modules
process.env.LANGCHAIN_TRACING_V2 = 'true';
process.env.LANGSMITH_TRACING = 'true';

import { Client } from 'langsmith';
import { evaluate } from 'langsmith/evaluation';
// Note: Don't use traceable with evaluate() - they conflict

import {
  getLangSmithClient,
  setupLangSmithEnv,
  LANGSMITH_PROJECT,
  DATASET_NAMES,
} from './config';
import {
  createDatasets,
  getDietPlanTestCases,
  getMealRegenerationTestCases,
  DietPlanTestCase,
  MealRegenerationTestCase,
} from './datasets';
import {
  runAllDietPlanEvaluators,
  runAllMealRegenEvaluators,
  evaluateMealCount,
  evaluateDayCoverage,
  evaluateMealTypeCoverage,
  evaluateDailyCalories,
  evaluateProteinAdequacy,
  evaluateMacroBalance,
  evaluateMealVariety,
  evaluateIngredientDiversity,
  evaluatePreferenceAdherence,
  evaluateVegetarianCompliance,
  evaluateFieldCompleteness,
  evaluateInstructionQuality,
} from './evaluators';

// Import the AI service
import { ModernAIService } from '../services/ai.service';

// =============================================================================
// TARGET FUNCTIONS (What we're evaluating)
// =============================================================================

// Mock mode flag - set via --mock argument
let useMockData = false;

export function setMockMode(enabled: boolean) {
  useMockData = enabled;
}

// Mock diet plan for testing without OpenAI calls
const mockDietPlan = {
  description: 'Mock diet plan for testing',
  meals: Array.from({ length: 28 }, (_, i) => ({
    day: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'][Math.floor(i / 4)],
    mealType: ['BREAKFAST', 'LUNCH', 'SNACK', 'DINNER'][i % 4],
    name: `Test Meal ${i + 1}`,
    description: 'A healthy test meal',
    calories: 400 + (i * 10),
    protein: 25,
    carbs: 45,
    fat: 15,
    fiber: 8,
    ingredients: ['ingredient1', 'ingredient2', 'ingredient3'],
    instructions: 'Mix all ingredients and cook for 20 minutes until done.',
    prepTime: 10,
    cookTime: 20,
    servings: 2,
  })),
};

/**
 * Target function for diet plan generation
 * Note: Do NOT use traceable wrapper - evaluate() handles tracing internally
 */
async function generateDietPlanTarget(inputs: { user: any; input: any }) {
  if (useMockData) {
    console.log('  🧪 Using mock data (no OpenAI call)');
    return mockDietPlan;
  }
  const aiService = new ModernAIService();
  const result = await aiService.generateDietPlan(inputs.user, inputs.input);
  return result;
}

/**
 * Target function for meal regeneration
 * Note: Do NOT use traceable wrapper - evaluate() handles tracing internally
 */
async function regenerateMealTarget(inputs: { user: any; existingMeal: any; customRequirements?: string }) {
  if (useMockData) {
    console.log('  🧪 Using mock data (no OpenAI call)');
    return mockDietPlan.meals[0];
  }
  const aiService = new ModernAIService();
  const result = await aiService.regenerateMeal(
    inputs.user,
    inputs.existingMeal,
    inputs.customRequirements
  );
  return result;
}

// =============================================================================
// EVALUATION FUNCTIONS
// =============================================================================

/**
 * Run evaluation for diet plan generation
 */
async function runDietPlanEvaluation(
  client: Client,
  options: {
    datasetName?: string;
    experimentPrefix?: string;
    maxConcurrency?: number;
    testCases?: DietPlanTestCase[];
  } = {}
): Promise<void> {
  const {
    datasetName = DATASET_NAMES.DIET_PLAN_GENERATION,
    experimentPrefix = 'diet-plan-eval',
    maxConcurrency = 1, // Sequential to avoid rate limits
    testCases,
  } = options;

  console.log('\n========================================');
  console.log('DIET PLAN GENERATION EVALUATION');
  console.log('========================================\n');

  // Create individual evaluator functions that match LangSmith's expected signature
  const evaluators = [
    async ({ outputs, referenceOutputs }: { outputs: any; referenceOutputs?: any }) => {
      return evaluateMealCount({ outputs });
    },
    async ({ outputs }: { outputs: any }) => {
      return evaluateDayCoverage({ outputs });
    },
    async ({ outputs }: { outputs: any }) => {
      return evaluateMealTypeCoverage({ outputs });
    },
    async ({ outputs, referenceOutputs }: { outputs: any; referenceOutputs?: any }) => {
      return evaluateDailyCalories({ outputs, referenceOutputs });
    },
    async ({ outputs }: { outputs: any }) => {
      return evaluateProteinAdequacy({ outputs });
    },
    async ({ outputs }: { outputs: any }) => {
      return evaluateMacroBalance({ outputs });
    },
    async ({ outputs }: { outputs: any }) => {
      return evaluateMealVariety({ outputs });
    },
    async ({ outputs }: { outputs: any }) => {
      return evaluateIngredientDiversity({ outputs });
    },
    async ({ outputs, referenceOutputs }: { outputs: any; referenceOutputs?: any }) => {
      return evaluatePreferenceAdherence({ outputs, referenceOutputs });
    },
    async ({ inputs, outputs }: { inputs: any; outputs: any }) => {
      return evaluateVegetarianCompliance({ inputs, outputs });
    },
    async ({ outputs }: { outputs: any }) => {
      return evaluateFieldCompleteness({ outputs });
    },
    async ({ outputs }: { outputs: any }) => {
      return evaluateInstructionQuality({ outputs });
    },
  ];

  if (testCases) {
    // Run directly on provided test cases
    console.log(`Running on ${testCases.length} test cases...`);

    for (const testCase of testCases) {
      console.log(`\n--- Test Case: ${testCase.name} ---`);
      console.log(`User: ${testCase.user.gender}, ${testCase.user.age}yo, Goal: ${testCase.user.goal}`);

      try {
        const output = await generateDietPlanTarget({
          user: testCase.user,
          input: testCase.input,
        });

        const results = runAllDietPlanEvaluators({
          inputs: { user: testCase.user, input: testCase.input },
          outputs: output,
          referenceOutputs: { expectedBehavior: testCase.expectedBehavior },
        });

        console.log('\nResults:');
        for (const result of results) {
          const score = Number(result.score) || 0;
          const status = score === 1 ? '✅' : score >= 0.7 ? '⚠️' : '❌';
          console.log(`  ${status} ${result.key}: ${(score * 100).toFixed(0)}% - ${result.comment}`);
        }

        const avgScore = results.reduce((sum, r) => sum + (Number(r.score) || 0), 0) / results.length;
        console.log(`\n  Overall Score: ${(avgScore * 100).toFixed(1)}%`);
      } catch (error) {
        console.error(`  ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  } else {
    // Run using LangSmith dataset
    console.log(`Using dataset: ${datasetName}`);
    console.log(`Experiment prefix: ${experimentPrefix}`);

    try {
      const results = await evaluate(generateDietPlanTarget, {
        data: datasetName,
        evaluators,
        experimentPrefix,
        maxConcurrency,
        client,
      });

      console.log('\nEvaluation complete!');
      console.log('View results at: https://smith.langchain.com');
    } catch (error) {
      console.error('Evaluation failed:', error);
      throw error;
    }
  }
}

/**
 * Run evaluation for meal regeneration
 */
async function runMealRegenerationEvaluation(
  client: Client,
  options: {
    datasetName?: string;
    experimentPrefix?: string;
    maxConcurrency?: number;
    testCases?: MealRegenerationTestCase[];
  } = {}
): Promise<void> {
  const {
    datasetName = DATASET_NAMES.MEAL_REGENERATION,
    experimentPrefix = 'meal-regen-eval',
    maxConcurrency = 1,
    testCases,
  } = options;

  console.log('\n========================================');
  console.log('MEAL REGENERATION EVALUATION');
  console.log('========================================\n');

  if (testCases) {
    console.log(`Running on ${testCases.length} test cases...`);

    for (const testCase of testCases) {
      console.log(`\n--- Test Case: ${testCase.name} ---`);
      console.log(`Original meal: ${testCase.existingMeal.name} (${testCase.existingMeal.calories} cal)`);

      try {
        const output = await regenerateMealTarget({
          user: testCase.user,
          existingMeal: testCase.existingMeal,
          customRequirements: testCase.customRequirements,
        });

        const results = runAllMealRegenEvaluators({
          inputs: testCase,
          outputs: output,
          referenceOutputs: { expectedBehavior: testCase.expectedBehavior },
        });

        console.log(`New meal: ${output.name} (${output.calories} cal)`);
        console.log('\nResults:');
        for (const result of results) {
          const score = Number(result.score) || 0;
          const status = score === 1 ? '✅' : '❌';
          console.log(`  ${status} ${result.key}: ${(score * 100).toFixed(0)}% - ${result.comment}`);
        }
      } catch (error) {
        console.error(`  ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  } else {
    console.log(`Using dataset: ${datasetName}`);
    // Similar to diet plan evaluation but for meal regeneration
  }
}

/**
 * Quick evaluation with a single test case
 */
async function runQuickEval(): Promise<void> {
  console.log('\n========================================');
  console.log('QUICK EVALUATION (Single Test Case)');
  console.log('========================================\n');

  const testCase = getDietPlanTestCases()[0]; // Use first test case
  console.log(`Test Case: ${testCase.name}`);

  try {
    const output = await generateDietPlanTarget({
      user: testCase.user,
      input: testCase.input,
    });

    console.log(`\nGenerated ${output.meals?.length || 0} meals`);

    const results = runAllDietPlanEvaluators({
      inputs: { user: testCase.user, input: testCase.input },
      outputs: output,
      referenceOutputs: { expectedBehavior: testCase.expectedBehavior },
    });

    console.log('\n--- Evaluation Results ---');
    let passed = 0;
    let failed = 0;

    for (const result of results) {
      const score = Number(result.score) || 0;
      const status = score === 1 ? '✅' : score >= 0.7 ? '⚠️' : '❌';
      if (score === 1) passed++;
      else failed++;
      console.log(`${status} ${result.key}: ${(score * 100).toFixed(0)}%`);
      console.log(`   ${result.comment}`);
    }

    const avgScore = results.reduce((sum, r) => sum + (Number(r.score) || 0), 0) / results.length;
    console.log(`\n--- Summary ---`);
    console.log(`Passed: ${passed}/${results.length}`);
    console.log(`Overall Score: ${(avgScore * 100).toFixed(1)}%`);
  } catch (error) {
    console.error('Quick eval failed:', error);
  }
}

// =============================================================================
// MAIN ENTRY POINT
// =============================================================================

async function main() {
  console.log('\n🧪 Diet Planner LangSmith Evaluation Suite\n');

  // Parse command line arguments
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  // Setup environment
  setupLangSmithEnv();

  let client: Client | null = null;

  // Only initialize client for commands that need it
  if (command !== 'quick' && command !== 'local') {
    try {
      client = getLangSmithClient();
      console.log('✅ Connected to LangSmith\n');
    } catch (error) {
      console.error('❌ Failed to connect to LangSmith:', error);
      if (command !== 'help') {
        console.log('\nTip: For local testing without LangSmith, use: npm run eval:quick');
        process.exit(1);
      }
    }
  }

  // Parse --limit flag (e.g., "diet-plan --limit=1")
  const limitArg = args.find(a => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined;
  if (limit) {
    console.log(`⚡ Running with limit: ${limit} test case(s)`);
  }

  // Parse --mock flag (skip OpenAI calls, use mock data)
  const mockMode = args.includes('--mock');
  if (mockMode) {
    setMockMode(true);
    console.log(`🧪 Mock mode: Using fake data (no OpenAI API calls)`);
  }
  console.log('');

  switch (command) {
    case 'setup':
      // Create datasets in LangSmith
      if (client) {
        await createDatasets(client);
        console.log('\n✅ Datasets created successfully!');
        console.log('View at: https://smith.langchain.com/datasets');
      }
      break;

    case 'diet-plan':
      // Run diet plan evaluation (with optional limit)
      if (client) {
        if (limit) {
          // Run limited test cases locally with tracing
          const limitedTestCases = getDietPlanTestCases().slice(0, limit);
          await runDietPlanEvaluation(client, { testCases: limitedTestCases });
        } else {
          await runDietPlanEvaluation(client);
        }
      }
      break;

    case 'debug-ls':
      // Debug LangSmith evaluate() function with mock data
      if (client) {
        console.log('Debugging LangSmith evaluate() with mock data...\n');
        setMockMode(true);

        // Test 1: Simple target function without traceable wrapper
        console.log('Test 1: Simple function (no traceable)');
        const simpleTarget = async (inputs: any) => {
          return mockDietPlan;
        };

        try {
          await evaluate(simpleTarget, {
            data: DATASET_NAMES.DIET_PLAN_GENERATION,
            evaluators: [
              async ({ outputs }: { outputs: any }) => ({
                key: 'meal_count',
                score: outputs?.meals?.length === 28 ? 1 : 0,
              }),
            ],
            experimentPrefix: 'debug-simple',
            maxConcurrency: 1,
            client,
          });
          console.log('✅ Test 1 passed\n');
        } catch (error: any) {
          console.error('❌ Test 1 failed:', error.message, '\n');
        }

        // Test 2: With full evaluators
        console.log('Test 2: With full evaluators');

        try {
          await evaluate(generateDietPlanTarget, {
            data: DATASET_NAMES.DIET_PLAN_GENERATION,
            evaluators: [
              async ({ outputs }: { outputs: any }) => evaluateMealCount({ outputs }),
              async ({ outputs }: { outputs: any }) => evaluateDayCoverage({ outputs }),
              async ({ outputs }: { outputs: any }) => evaluateMealVariety({ outputs }),
            ],
            experimentPrefix: 'debug-full',
            maxConcurrency: 1,
            client,
          });
          console.log('✅ Test 2 passed\n');
        } catch (error: any) {
          console.error('❌ Test 2 failed:', error.message, '\n');
        }
      }
      break;

    case 'meal-regen':
      // Run meal regeneration evaluation
      if (client) {
        await runMealRegenerationEvaluation(client);
      }
      break;

    case 'all':
      // Run all evaluations
      if (client) {
        await runDietPlanEvaluation(client);
        await runMealRegenerationEvaluation(client);
      }
      break;

    case 'quick':
      // Quick local evaluation without LangSmith
      await runQuickEval();
      break;

    case 'local':
      // Run all test cases locally without LangSmith
      console.log('Running local evaluation (no LangSmith required)...\n');

      const dietPlanTestCases = getDietPlanTestCases().slice(0, 2); // Limit for testing
      await runDietPlanEvaluation(null as any, { testCases: dietPlanTestCases });

      const mealRegenTestCases = getMealRegenerationTestCases().slice(0, 2);
      await runMealRegenerationEvaluation(null as any, { testCases: mealRegenTestCases });
      break;

    case 'help':
    default:
      console.log(`
Usage: npm run eval [command] [options]

Commands:
  setup       Create/update datasets in LangSmith
  diet-plan   Run diet plan generation evaluation
  meal-regen  Run meal regeneration evaluation
  all         Run all evaluations
  quick       Quick single test case (no LangSmith needed, no OpenAI call)
  local       Run test cases locally (no LangSmith needed)
  help        Show this help message

Options:
  --limit=N   Limit to N test cases (saves tokens for debugging)
  --mock      Use mock data instead of calling OpenAI (free, for debugging)

Environment Variables Required:
  LANGSMITH_API_KEY   Your LangSmith API key (for setup, diet-plan, meal-regen, all)
  OPENAI_API_KEY      Your OpenAI API key (always required)

Examples:
  npm run eval setup                    # First time setup
  npm run eval diet-plan                # Run all 8 diet plan evals
  npm run eval diet-plan --limit=1      # Run only 1 test case
  npm run eval diet-plan --mock         # Test LangSmith integration (no OpenAI cost)
  npm run eval diet-plan --mock --limit=1  # Debug with 1 mock case
  npm run eval quick                    # Quick local test
  npm run eval local --limit=1          # Local test with 1 case
`);
      break;
  }
}

// Run main
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
