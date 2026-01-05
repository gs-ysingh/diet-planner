import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  scalar DateTime
  scalar JSON

  type User {
    id: ID!
    email: String!
    name: String!
    age: Int
    weight: Float
    height: Float
    gender: Gender
    nationality: String
    goal: Goal
    activityLevel: ActivityLevel
    preferences: [String!]!
    emailVerified: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    dietPlans: [DietPlan!]!
  }

  type DietPlan {
    id: ID!
    userId: String!
    name: String!
    description: String
    weekStart: DateTime!
    weekEnd: DateTime!
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    user: User!
    meals: [Meal!]!
  }

  type Meal {
    id: ID!
    dietPlanId: String!
    day: DayOfWeek!
    mealType: MealType!
    name: String!
    description: String
    calories: Int
    protein: Float
    carbs: Float
    fat: Float
    fiber: Float
    ingredients: [String!]!
    instructions: String
    prepTime: Int
    cookTime: Int
    servings: Int
    dietPlan: DietPlan!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type DietPlanGenerationResult {
    success: Boolean!
    dietPlan: DietPlan
    error: String
  }

  enum Gender {
    MALE
    FEMALE
    OTHER
  }

  enum Goal {
    WEIGHT_LOSS
    WEIGHT_GAIN
    MUSCLE_GAIN
    MAINTENANCE
    ATHLETIC_PERFORMANCE
  }

  enum ActivityLevel {
    SEDENTARY
    LIGHTLY_ACTIVE
    MODERATELY_ACTIVE
    VERY_ACTIVE
    EXTREMELY_ACTIVE
  }

  enum DayOfWeek {
    MONDAY
    TUESDAY
    WEDNESDAY
    THURSDAY
    FRIDAY
    SATURDAY
    SUNDAY
  }

  enum MealType {
    BREAKFAST
    LUNCH
    DINNER
    SNACK
  }

  input UserRegistrationInput {
    email: String!
    password: String!
    name: String!
    age: Int
    weight: Float
    height: Float
    gender: Gender
    nationality: String
    goal: Goal
    activityLevel: ActivityLevel
    preferences: [String!]
  }

  input UserUpdateInput {
    name: String
    age: Int
    weight: Float
    height: Float
    gender: Gender
    nationality: String
    goal: Goal
    activityLevel: ActivityLevel
    preferences: [String!]
  }

  input DietPlanInput {
    name: String!
    description: String
    weekStart: DateTime!
    preferences: [String!]
    customRequirements: String
  }

  input MealInput {
    day: DayOfWeek!
    mealType: MealType!
    name: String!
    description: String
    calories: Int
    protein: Float
    carbs: Float
    fat: Float
    fiber: Float
    ingredients: [String!]!
    instructions: String
    prepTime: Int
    cookTime: Int
    servings: Int
  }

  input SaveDietPlanInput {
    name: String!
    description: String
    weekStart: DateTime!
    meals: [MealInput!]!
  }

  input MealUpdateInput {
    id: ID!
    name: String
    description: String
    calories: Int
    protein: Float
    carbs: Float
    fat: Float
    fiber: Float
    ingredients: [String!]
    instructions: String
    prepTime: Int
    cookTime: Int
    servings: Int
  }

  type Query {
    me: User
    getDietPlan(id: ID!): DietPlan
    getActiveDietPlan: DietPlan
    getAllDietPlans: [DietPlan!]!
    getMealsByDay(dietPlanId: ID!, day: DayOfWeek!): [Meal!]!
  }

  type Mutation {
    register(input: UserRegistrationInput!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    verifyEmail(token: String!): AuthPayload!
    resendVerification(email: String!): Boolean!
    forgotPassword(email: String!): Boolean!
    resetPassword(token: String!, newPassword: String!): Boolean!
    updateProfile(input: UserUpdateInput!): User!
    generateDietPlan(input: DietPlanInput!): DietPlanGenerationResult!
    saveDietPlan(input: SaveDietPlanInput!): DietPlanGenerationResult!
    updateDietPlan(id: ID!, input: DietPlanInput!): DietPlan!
    deleteDietPlan(id: ID!): Boolean!
    setActiveDietPlan(id: ID!): DietPlan!
    updateMeal(input: MealUpdateInput!): Meal!
    regenerateMeal(mealId: ID!, customRequirements: String): Meal!
    generatePDF(dietPlanId: ID!): String! # Returns base64 encoded PDF
  }
`;
