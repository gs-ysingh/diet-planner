import { EvaluationResult } from 'langsmith/evaluation';

// Meal interface matching the app's schema
interface Meal {
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

interface DietPlanOutput {
  description: string;
  meals: Meal[];
}

interface ExpectedBehavior {
  minCaloriesPerDay: number;
  maxCaloriesPerDay: number;
  shouldRespectPreferences: string[];
  shouldAvoid: string[];
}

// =============================================================================
// STRUCTURE EVALUATORS
// =============================================================================

/**
 * Evaluates if the diet plan has exactly 28 meals (7 days x 4 meals)
 */
export function evaluateMealCount(params: {
  outputs: DietPlanOutput;
}): EvaluationResult {
  const { outputs } = params;
  const meals = outputs?.meals || [];
  const expectedCount = 28;
  const actualCount = meals.length;
  const score = actualCount === expectedCount ? 1 : 0;

  return {
    key: 'meal_count',
    score,
    comment: `Expected ${expectedCount} meals, got ${actualCount}`,
  };
}

/**
 * Evaluates if all 7 days are covered
 */
export function evaluateDayCoverage(params: {
  outputs: DietPlanOutput;
}): EvaluationResult {
  const { outputs } = params;
  const meals = outputs?.meals || [];
  const expectedDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  const coveredDays = new Set(meals.map((m) => m.day));
  const missingDays = expectedDays.filter((d) => !coveredDays.has(d));
  const score = missingDays.length === 0 ? 1 : (7 - missingDays.length) / 7;

  return {
    key: 'day_coverage',
    score,
    comment: missingDays.length === 0
      ? 'All 7 days covered'
      : `Missing days: ${missingDays.join(', ')}`,
  };
}

/**
 * Evaluates if all meal types are covered for each day
 */
export function evaluateMealTypeCoverage(params: {
  outputs: DietPlanOutput;
}): EvaluationResult {
  const { outputs } = params;
  const meals = outputs?.meals || [];
  const expectedMealTypes = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  let totalExpected = days.length * expectedMealTypes.length;
  let covered = 0;
  const issues: string[] = [];

  for (const day of days) {
    const dayMeals = meals.filter((m) => m.day === day);
    const dayMealTypes = new Set(dayMeals.map((m) => m.mealType));

    for (const mealType of expectedMealTypes) {
      if (dayMealTypes.has(mealType)) {
        covered++;
      } else {
        issues.push(`${day}: missing ${mealType}`);
      }
    }
  }

  const score = covered / totalExpected;

  return {
    key: 'meal_type_coverage',
    score,
    comment: issues.length === 0
      ? 'All meal types covered for all days'
      : `Issues: ${issues.slice(0, 5).join('; ')}${issues.length > 5 ? '...' : ''}`,
  };
}

// =============================================================================
// NUTRITIONAL EVALUATORS
// =============================================================================

/**
 * Evaluates if daily calories are within expected range
 */
export function evaluateDailyCalories(params: {
  outputs: DietPlanOutput;
  referenceOutputs?: { expectedBehavior: ExpectedBehavior };
}): EvaluationResult {
  const { outputs, referenceOutputs } = params;
  const meals = outputs?.meals || [];
  const { minCaloriesPerDay = 1200, maxCaloriesPerDay = 2500 } =
    referenceOutputs?.expectedBehavior || {};

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  let daysInRange = 0;
  const details: string[] = [];

  for (const day of days) {
    const dayMeals = meals.filter((m) => m.day === day);
    const dailyCalories = dayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);

    if (dailyCalories >= minCaloriesPerDay && dailyCalories <= maxCaloriesPerDay) {
      daysInRange++;
    } else {
      details.push(`${day}: ${dailyCalories} cal (expected ${minCaloriesPerDay}-${maxCaloriesPerDay})`);
    }
  }

  const score = daysInRange / days.length;

  return {
    key: 'daily_calories_in_range',
    score,
    comment: details.length === 0
      ? `All days within ${minCaloriesPerDay}-${maxCaloriesPerDay} cal range`
      : `Out of range: ${details.join('; ')}`,
  };
}

/**
 * Evaluates protein content adequacy
 */
export function evaluateProteinAdequacy(params: {
  outputs: DietPlanOutput;
}): EvaluationResult {
  const { outputs } = params;
  const meals = outputs?.meals || [];
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  // Minimum recommended daily protein: 50g
  const minDailyProtein = 50;
  let adequateDays = 0;
  const details: string[] = [];

  for (const day of days) {
    const dayMeals = meals.filter((m) => m.day === day);
    const dailyProtein = dayMeals.reduce((sum, m) => sum + (m.protein || 0), 0);

    if (dailyProtein >= minDailyProtein) {
      adequateDays++;
    } else {
      details.push(`${day}: ${dailyProtein.toFixed(1)}g`);
    }
  }

  const score = adequateDays / days.length;

  return {
    key: 'protein_adequacy',
    score,
    comment: details.length === 0
      ? `All days have adequate protein (>=${minDailyProtein}g)`
      : `Low protein days: ${details.join('; ')}`,
  };
}

/**
 * Evaluates macronutrient balance
 */
export function evaluateMacroBalance(params: {
  outputs: DietPlanOutput;
}): EvaluationResult {
  const { outputs } = params;
  const meals = outputs?.meals || [];

  const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalProtein = meals.reduce((sum, m) => sum + (m.protein || 0), 0);
  const totalCarbs = meals.reduce((sum, m) => sum + (m.carbs || 0), 0);
  const totalFat = meals.reduce((sum, m) => sum + (m.fat || 0), 0);

  // Calculate macro percentages (protein: 4cal/g, carbs: 4cal/g, fat: 9cal/g)
  const proteinCals = totalProtein * 4;
  const carbsCals = totalCarbs * 4;
  const fatCals = totalFat * 9;
  const totalMacroCals = proteinCals + carbsCals + fatCals;

  if (totalMacroCals === 0) {
    return {
      key: 'macro_balance',
      score: 0,
      comment: 'No macronutrient data available',
    };
  }

  const proteinPct = (proteinCals / totalMacroCals) * 100;
  const carbsPct = (carbsCals / totalMacroCals) * 100;
  const fatPct = (fatCals / totalMacroCals) * 100;

  // Ideal ranges: Protein 10-35%, Carbs 45-65%, Fat 20-35%
  const proteinScore = proteinPct >= 10 && proteinPct <= 35 ? 1 : 0.5;
  const carbsScore = carbsPct >= 35 && carbsPct <= 70 ? 1 : 0.5;
  const fatScore = fatPct >= 15 && fatPct <= 40 ? 1 : 0.5;

  const score = (proteinScore + carbsScore + fatScore) / 3;

  return {
    key: 'macro_balance',
    score,
    comment: `Protein: ${proteinPct.toFixed(1)}%, Carbs: ${carbsPct.toFixed(1)}%, Fat: ${fatPct.toFixed(1)}%`,
  };
}

// =============================================================================
// VARIETY EVALUATORS
// =============================================================================

/**
 * Evaluates meal name uniqueness/variety
 */
export function evaluateMealVariety(params: {
  outputs: DietPlanOutput;
}): EvaluationResult {
  const { outputs } = params;
  const meals = outputs?.meals || [];

  const mealNames = meals.map((m) => m.name?.toLowerCase().trim());
  const uniqueNames = new Set(mealNames);

  // Penalize duplicate meal names
  const uniquenessRatio = uniqueNames.size / Math.max(mealNames.length, 1);

  // Find duplicates for reporting
  const nameCounts: Record<string, number> = {};
  mealNames.forEach((name) => {
    nameCounts[name] = (nameCounts[name] || 0) + 1;
  });
  const duplicates = Object.entries(nameCounts)
    .filter(([, count]) => count > 1)
    .map(([name, count]) => `"${name}" (${count}x)`);

  return {
    key: 'meal_variety',
    score: uniquenessRatio,
    comment: duplicates.length === 0
      ? `All ${uniqueNames.size} meals are unique`
      : `Duplicates found: ${duplicates.slice(0, 5).join(', ')}`,
  };
}

/**
 * Evaluates ingredient diversity across the week
 */
export function evaluateIngredientDiversity(params: {
  outputs: DietPlanOutput;
}): EvaluationResult {
  const { outputs } = params;
  const meals = outputs?.meals || [];

  const allIngredients: string[] = [];
  meals.forEach((m) => {
    if (Array.isArray(m.ingredients)) {
      allIngredients.push(...m.ingredients.map((i) => i.toLowerCase().trim()));
    }
  });

  const uniqueIngredients = new Set(allIngredients);

  // Expect at least 40 unique ingredients for a diverse week
  const expectedMinIngredients = 40;
  const score = Math.min(uniqueIngredients.size / expectedMinIngredients, 1);

  return {
    key: 'ingredient_diversity',
    score,
    comment: `${uniqueIngredients.size} unique ingredients used (target: ${expectedMinIngredients}+)`,
  };
}

// =============================================================================
// PREFERENCE ADHERENCE EVALUATORS
// =============================================================================

/**
 * Evaluates if the plan respects dietary preferences
 */
export function evaluatePreferenceAdherence(params: {
  outputs: DietPlanOutput;
  referenceOutputs?: { expectedBehavior: ExpectedBehavior };
}): EvaluationResult {
  const { outputs, referenceOutputs } = params;
  const meals = outputs?.meals || [];
  const shouldAvoid = referenceOutputs?.expectedBehavior?.shouldAvoid || [];

  if (shouldAvoid.length === 0) {
    return {
      key: 'preference_adherence',
      score: 1,
      comment: 'No specific ingredients to avoid',
    };
  }

  const violations: string[] = [];

  for (const meal of meals) {
    const mealText = [
      meal.name,
      meal.description,
      ...(meal.ingredients || []),
      meal.instructions,
    ]
      .join(' ')
      .toLowerCase();

    for (const avoid of shouldAvoid) {
      if (mealText.includes(avoid.toLowerCase())) {
        violations.push(`${meal.name}: contains "${avoid}"`);
      }
    }
  }

  const score = violations.length === 0 ? 1 : Math.max(0, 1 - violations.length / meals.length);

  return {
    key: 'preference_adherence',
    score,
    comment: violations.length === 0
      ? `No violations found for: ${shouldAvoid.join(', ')}`
      : `Violations: ${violations.slice(0, 5).join('; ')}`,
  };
}

/**
 * Evaluates vegetarian compliance if requested
 */
export function evaluateVegetarianCompliance(params: {
  inputs: { user: { preferences: string[] }; input: { preferences: string[] } };
  outputs: DietPlanOutput;
}): EvaluationResult {
  const { inputs, outputs } = params;
  const allPrefs = [
    ...(inputs?.user?.preferences || []),
    ...(inputs?.input?.preferences || []),
  ].map((p) => p.toLowerCase());

  const isVegetarian = allPrefs.some((p) =>
    ['vegetarian', 'vegan', 'plant-based'].includes(p)
  );

  if (!isVegetarian) {
    return {
      key: 'vegetarian_compliance',
      score: 1,
      comment: 'Not a vegetarian plan - skipped',
    };
  }

  const meals = outputs?.meals || [];
  const meatKeywords = [
    'chicken',
    'beef',
    'pork',
    'lamb',
    'fish',
    'salmon',
    'tuna',
    'shrimp',
    'bacon',
    'turkey',
    'steak',
    'meat',
    'seafood',
  ];

  const violations: string[] = [];

  for (const meal of meals) {
    const mealText = [
      meal.name,
      meal.description,
      ...(meal.ingredients || []),
    ]
      .join(' ')
      .toLowerCase();

    for (const meat of meatKeywords) {
      if (mealText.includes(meat)) {
        violations.push(`${meal.name}: contains "${meat}"`);
        break;
      }
    }
  }

  const score = violations.length === 0 ? 1 : Math.max(0, 1 - violations.length / meals.length);

  return {
    key: 'vegetarian_compliance',
    score,
    comment: violations.length === 0
      ? 'All meals are vegetarian-compliant'
      : `Non-vegetarian meals: ${violations.slice(0, 5).join('; ')}`,
  };
}

// =============================================================================
// QUALITY EVALUATORS
// =============================================================================

/**
 * Evaluates if meals have complete required fields
 */
export function evaluateFieldCompleteness(params: {
  outputs: DietPlanOutput;
}): EvaluationResult {
  const { outputs } = params;
  const meals = outputs?.meals || [];

  const requiredFields = [
    'day',
    'mealType',
    'name',
    'description',
    'calories',
    'protein',
    'carbs',
    'fat',
    'ingredients',
    'instructions',
  ];

  let totalFields = meals.length * requiredFields.length;
  let filledFields = 0;
  const issues: string[] = [];

  for (const meal of meals) {
    for (const field of requiredFields) {
      const value = (meal as any)[field];
      if (value !== undefined && value !== null && value !== '' && !(Array.isArray(value) && value.length === 0)) {
        filledFields++;
      } else {
        issues.push(`${meal.name || 'Unknown'}: missing ${field}`);
      }
    }
  }

  const score = totalFields > 0 ? filledFields / totalFields : 0;

  return {
    key: 'field_completeness',
    score,
    comment: issues.length === 0
      ? 'All required fields are populated'
      : `Missing fields: ${issues.slice(0, 5).join('; ')}${issues.length > 5 ? '...' : ''}`,
  };
}

/**
 * Evaluates instruction quality (length and detail)
 */
export function evaluateInstructionQuality(params: {
  outputs: DietPlanOutput;
}): EvaluationResult {
  const { outputs } = params;
  const meals = outputs?.meals || [];

  const minInstructionLength = 30;
  let adequateInstructions = 0;
  const shortInstructions: string[] = [];

  for (const meal of meals) {
    const instructionLength = meal.instructions?.length || 0;
    if (instructionLength >= minInstructionLength) {
      adequateInstructions++;
    } else {
      shortInstructions.push(`${meal.name}: ${instructionLength} chars`);
    }
  }

  const score = meals.length > 0 ? adequateInstructions / meals.length : 0;

  return {
    key: 'instruction_quality',
    score,
    comment: shortInstructions.length === 0
      ? `All instructions are detailed (>=${minInstructionLength} chars)`
      : `Short instructions: ${shortInstructions.slice(0, 5).join('; ')}`,
  };
}

// =============================================================================
// MEAL REGENERATION EVALUATORS
// =============================================================================

/**
 * Evaluates if regenerated meal is different from original
 */
export function evaluateMealDifference(params: {
  inputs: { existingMeal: { name: string } };
  outputs: { name: string };
}): EvaluationResult {
  const { inputs, outputs } = params;

  const originalName = inputs?.existingMeal?.name?.toLowerCase().trim() || '';
  const newName = outputs?.name?.toLowerCase().trim() || '';

  const isDifferent = originalName !== newName;

  return {
    key: 'meal_difference',
    score: isDifferent ? 1 : 0,
    comment: isDifferent
      ? `Successfully generated different meal: "${outputs?.name}"`
      : `Generated same meal as original: "${originalName}"`,
  };
}

/**
 * Evaluates if regenerated meal calories are within range of original
 */
export function evaluateCalorieConsistency(params: {
  inputs: { existingMeal: { calories: number } };
  outputs: { calories: number };
  referenceOutputs?: { expectedBehavior: { calorieRange: { min: number; max: number } } };
}): EvaluationResult {
  const { inputs, outputs, referenceOutputs } = params;

  const originalCalories = inputs?.existingMeal?.calories || 0;
  const newCalories = outputs?.calories || 0;

  const { min, max } = referenceOutputs?.expectedBehavior?.calorieRange || {
    min: originalCalories - 50,
    max: originalCalories + 50,
  };

  const isInRange = newCalories >= min && newCalories <= max;

  return {
    key: 'calorie_consistency',
    score: isInRange ? 1 : 0,
    comment: `New calories: ${newCalories} (expected ${min}-${max}, original: ${originalCalories})`,
  };
}

// =============================================================================
// AGGREGATE EVALUATOR
// =============================================================================

/**
 * Runs all diet plan evaluators and returns combined results
 */
export function runAllDietPlanEvaluators(params: {
  inputs: any;
  outputs: DietPlanOutput;
  referenceOutputs?: { expectedBehavior: ExpectedBehavior };
}): EvaluationResult[] {
  const results: EvaluationResult[] = [];

  // Structure evaluators
  results.push(evaluateMealCount({ outputs: params.outputs }));
  results.push(evaluateDayCoverage({ outputs: params.outputs }));
  results.push(evaluateMealTypeCoverage({ outputs: params.outputs }));

  // Nutritional evaluators
  results.push(evaluateDailyCalories({
    outputs: params.outputs,
    referenceOutputs: params.referenceOutputs,
  }));
  results.push(evaluateProteinAdequacy({ outputs: params.outputs }));
  results.push(evaluateMacroBalance({ outputs: params.outputs }));

  // Variety evaluators
  results.push(evaluateMealVariety({ outputs: params.outputs }));
  results.push(evaluateIngredientDiversity({ outputs: params.outputs }));

  // Preference evaluators
  results.push(evaluatePreferenceAdherence({
    outputs: params.outputs,
    referenceOutputs: params.referenceOutputs,
  }));
  results.push(evaluateVegetarianCompliance({
    inputs: params.inputs,
    outputs: params.outputs,
  }));

  // Quality evaluators
  results.push(evaluateFieldCompleteness({ outputs: params.outputs }));
  results.push(evaluateInstructionQuality({ outputs: params.outputs }));

  return results;
}

/**
 * Runs all meal regeneration evaluators
 */
export function runAllMealRegenEvaluators(params: {
  inputs: any;
  outputs: any;
  referenceOutputs?: any;
}): EvaluationResult[] {
  const results: EvaluationResult[] = [];

  results.push(evaluateMealDifference({
    inputs: params.inputs,
    outputs: params.outputs,
  }));

  results.push(evaluateCalorieConsistency({
    inputs: params.inputs,
    outputs: params.outputs,
    referenceOutputs: params.referenceOutputs,
  }));

  return results;
}
