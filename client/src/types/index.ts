export interface User {
  id: string;
  email: string;
  name: string;
  age?: number;
  weight?: number;
  height?: number;
  gender?: Gender;
  nationality?: string;
  goal?: Goal;
  activityLevel?: ActivityLevel;
  preferences: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DietPlan {
  id: string;
  userId: string;
  name: string;
  description?: string;
  weekStart: string;
  weekEnd: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  meals: Meal[];
}

export interface Meal {
  id: string;
  dietPlanId: string;
  day: DayOfWeek;
  mealType: MealType;
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
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export enum Goal {
  WEIGHT_LOSS = 'WEIGHT_LOSS',
  WEIGHT_GAIN = 'WEIGHT_GAIN',
  MUSCLE_GAIN = 'MUSCLE_GAIN',
  MAINTENANCE = 'MAINTENANCE',
  ATHLETIC_PERFORMANCE = 'ATHLETIC_PERFORMANCE'
}

export enum ActivityLevel {
  SEDENTARY = 'SEDENTARY',
  LIGHTLY_ACTIVE = 'LIGHTLY_ACTIVE',
  MODERATELY_ACTIVE = 'MODERATELY_ACTIVE',
  VERY_ACTIVE = 'VERY_ACTIVE',
  EXTREMELY_ACTIVE = 'EXTREMELY_ACTIVE'
}

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY'
}

export enum MealType {
  BREAKFAST = 'BREAKFAST',
  LUNCH = 'LUNCH',
  DINNER = 'DINNER',
  SNACK = 'SNACK'
}

export interface AuthPayload {
  token: string;
  user: User;
}

export interface UserRegistrationInput {
  email: string;
  password: string;
  name: string;
  age?: number;
  weight?: number;
  height?: number;
  gender?: Gender;
  nationality?: string;
  goal?: Goal;
  activityLevel?: ActivityLevel;
  preferences?: string[];
}

export interface UserUpdateInput {
  name?: string;
  age?: number;
  weight?: number;
  height?: number;
  gender?: Gender;
  nationality?: string;
  goal?: Goal;
  activityLevel?: ActivityLevel;
  preferences?: string[];
}

export interface DietPlanInput {
  name: string;
  description?: string;
  weekStart: string;
  preferences?: string[];
  customRequirements?: string;
}

export interface MealUpdateInput {
  id: string;
  name?: string;
  description?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  ingredients?: string[];
  instructions?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}
