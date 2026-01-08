interface DietPlan {
  id: string;
  name: string;
  description?: string;
  weekStart: Date;
  weekEnd: Date;
  user: {
    name: string;
    email: string;
    age?: number;
    weight?: number;
    height?: number;
    goal?: string;
  };
  meals: Array<{
    day: string;
    mealType: string;
    name: string;
    description?: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    ingredients: string[];
    instructions?: string;
    prepTime?: number;
    cookTime?: number;
    servings?: number;
  }>;
}

export class CSVService {
  generateDietPlanCSV(dietPlan: DietPlan): string {
    const rows: string[] = [];
    
    // Add header information
    rows.push(`Diet Plan: ${this.escapeCSV(dietPlan.name)}`);
    if (dietPlan.description) {
      rows.push(`Description: ${this.escapeCSV(dietPlan.description)}`);
    }
    rows.push(`Week: ${this.formatDate(dietPlan.weekStart)} - ${this.formatDate(dietPlan.weekEnd)}`);
    rows.push(`User: ${this.escapeCSV(dietPlan.user.name)} (${dietPlan.user.email})`);
    if (dietPlan.user.age || dietPlan.user.weight || dietPlan.user.height || dietPlan.user.goal) {
      const userDetails = [];
      if (dietPlan.user.age) userDetails.push(`Age: ${dietPlan.user.age}`);
      if (dietPlan.user.weight) userDetails.push(`Weight: ${dietPlan.user.weight} kg`);
      if (dietPlan.user.height) userDetails.push(`Height: ${dietPlan.user.height} cm`);
      if (dietPlan.user.goal) userDetails.push(`Goal: ${dietPlan.user.goal}`);
      rows.push(userDetails.join(', '));
    }
    rows.push(''); // Empty line separator
    
    // Add meals table header
    const headers = [
      'Day',
      'Meal Type',
      'Meal Name',
      'Description',
      'Calories',
      'Protein (g)',
      'Carbs (g)',
      'Fat (g)',
      'Fiber (g)',
      'Prep Time (min)',
      'Cook Time (min)',
      'Servings',
      'Ingredients',
      'Instructions'
    ];
    rows.push(headers.join(','));
    
    // Sort meals by day and meal type
    const daysOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    const mealTypeOrder = ['BREAKFAST', 'LUNCH', 'SNACK', 'DINNER'];
    
    const sortedMeals = [...dietPlan.meals].sort((a, b) => {
      const dayCompare = daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day);
      if (dayCompare !== 0) return dayCompare;
      return mealTypeOrder.indexOf(a.mealType) - mealTypeOrder.indexOf(b.mealType);
    });
    
    // Add meal rows
    for (const meal of sortedMeals) {
      const row = [
        this.formatDay(meal.day),
        this.formatMealType(meal.mealType),
        this.escapeCSV(meal.name),
        this.escapeCSV(meal.description || ''),
        meal.calories?.toString() || '',
        meal.protein?.toString() || '',
        meal.carbs?.toString() || '',
        meal.fat?.toString() || '',
        meal.fiber?.toString() || '',
        meal.prepTime?.toString() || '',
        meal.cookTime?.toString() || '',
        meal.servings?.toString() || '',
        this.escapeCSV(meal.ingredients.join('; ')),
        this.escapeCSV(meal.instructions || '')
      ];
      rows.push(row.join(','));
    }
    
    return rows.join('\n');
  }
  
  private escapeCSV(value: string): string {
    if (!value) return '';
    // If the value contains comma, newline, or double quote, wrap it in quotes
    if (value.includes(',') || value.includes('\n') || value.includes('"')) {
      // Escape double quotes by doubling them
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
  
  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  private formatDay(day: string): string {
    return day.charAt(0) + day.slice(1).toLowerCase();
  }
  
  private formatMealType(mealType: string): string {
    return mealType.charAt(0) + mealType.slice(1).toLowerCase();
  }
}
