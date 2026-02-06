// LangSmith Evaluation Suite for Diet Planner
// =============================================
//
// This module provides comprehensive evaluation capabilities for the diet planner AI.
//
// Quick Start:
// ------------
// 1. Set your environment variables:
//    - OPENAI_API_KEY (required)
//    - LANGSMITH_API_KEY (optional, for LangSmith integration)
//
// 2. Run evaluations:
//    - npm run eval quick      # Quick local test
//    - npm run eval local      # Full local testing
//    - npm run eval setup      # Create LangSmith datasets
//    - npm run eval diet-plan  # Run with LangSmith tracking

export * from './config';
export * from './datasets';
export * from './evaluators';

// Re-export specific items for convenience
export {
  getLangSmithClient,
  setupLangSmithEnv,
  LANGSMITH_PROJECT,
  DATASET_NAMES,
} from './config';

export {
  createDatasets,
  getDietPlanTestCases,
  getMealRegenerationTestCases,
  type DietPlanTestCase,
  type MealRegenerationTestCase,
} from './datasets';

export {
  // Structure evaluators
  evaluateMealCount,
  evaluateDayCoverage,
  evaluateMealTypeCoverage,

  // Nutritional evaluators
  evaluateDailyCalories,
  evaluateProteinAdequacy,
  evaluateMacroBalance,

  // Variety evaluators
  evaluateMealVariety,
  evaluateIngredientDiversity,

  // Preference evaluators
  evaluatePreferenceAdherence,
  evaluateVegetarianCompliance,

  // Quality evaluators
  evaluateFieldCompleteness,
  evaluateInstructionQuality,

  // Meal regeneration evaluators
  evaluateMealDifference,
  evaluateCalorieConsistency,

  // Aggregate evaluators
  runAllDietPlanEvaluators,
  runAllMealRegenEvaluators,
} from './evaluators';
