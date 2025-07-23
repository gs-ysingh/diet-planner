import axios from 'axios';
import { AuthPayload, UserRegistrationInput, DietPlanInput, User, DietPlan, MealUpdateInput, Meal, UserUpdateInput } from '../types';

const API_BASE_URL = process.env.REACT_APP_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` })
    };
  }

  private async makeRequest(query: string, variables?: any) {
    try {
      const response = await axios.post(
        API_BASE_URL,
        { query, variables },
        { headers: this.getHeaders() }
      );

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.errors?.[0]?.message || error.message);
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // Auth methods
  async register(input: UserRegistrationInput): Promise<AuthPayload> {
    const query = `
      mutation Register($input: UserRegistrationInput!) {
        register(input: $input) {
          token
          user {
            id
            email
            name
            age
            weight
            height
            gender
            nationality
            goal
            activityLevel
            preferences
            createdAt
            updatedAt
          }
        }
      }
    `;

    const data = await this.makeRequest(query, { input });
    return data.register;
  }

  async login(email: string, password: string): Promise<AuthPayload> {
    const query = `
      mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          token
          user {
            id
            email
            name
            age
            weight
            height
            gender
            nationality
            goal
            activityLevel
            preferences
            createdAt
            updatedAt
          }
        }
      }
    `;

    const data = await this.makeRequest(query, { email, password });
    return data.login;
  }

  // User methods
  async getMe(): Promise<User> {
    const query = `
      query Me {
        me {
          id
          email
          name
          age
          weight
          height
          gender
          nationality
          goal
          activityLevel
          preferences
          createdAt
          updatedAt
        }
      }
    `;

    const data = await this.makeRequest(query);
    return data.me;
  }

  async updateProfile(input: UserUpdateInput): Promise<User> {
    const query = `
      mutation UpdateProfile($input: UserUpdateInput!) {
        updateProfile(input: $input) {
          id
          email
          name
          age
          weight
          height
          gender
          nationality
          goal
          activityLevel
          preferences
          createdAt
          updatedAt
        }
      }
    `;

    const data = await this.makeRequest(query, { input });
    return data.updateProfile;
  }

  // Diet Plan methods
  async generateDietPlan(input: DietPlanInput): Promise<{ success: boolean; dietPlan?: DietPlan; error?: string }> {
    const query = `
      mutation GenerateDietPlan($input: DietPlanInput!) {
        generateDietPlan(input: $input) {
          success
          dietPlan {
            id
            name
            description
            weekStart
            weekEnd
            isActive
            createdAt
            updatedAt
            meals {
              id
              day
              mealType
              name
              description
              calories
              protein
              carbs
              fat
              fiber
              ingredients
              instructions
              prepTime
              cookTime
              servings
            }
          }
          error
        }
      }
    `;

    const data = await this.makeRequest(query, { input });
    return data.generateDietPlan;
  }

  async getAllDietPlans(): Promise<DietPlan[]> {
    const query = `
      query GetAllDietPlans {
        getAllDietPlans {
          id
          name
          description
          weekStart
          weekEnd
          isActive
          createdAt
          updatedAt
          meals {
            id
            day
            mealType
            name
            description
            calories
            protein
            carbs
            fat
            fiber
            ingredients
            instructions
            prepTime
            cookTime
            servings
          }
        }
      }
    `;

    const data = await this.makeRequest(query);
    return data.getAllDietPlans;
  }

  async getActiveDietPlan(): Promise<DietPlan | null> {
    const query = `
      query GetActiveDietPlan {
        getActiveDietPlan {
          id
          name
          description
          weekStart
          weekEnd
          isActive
          createdAt
          updatedAt
          meals {
            id
            day
            mealType
            name
            description
            calories
            protein
            carbs
            fat
            fiber
            ingredients
            instructions
            prepTime
            cookTime
            servings
          }
        }
      }
    `;

    const data = await this.makeRequest(query);
    return data.getActiveDietPlan;
  }

  async setActiveDietPlan(id: string): Promise<DietPlan> {
    const query = `
      mutation SetActiveDietPlan($id: ID!) {
        setActiveDietPlan(id: $id) {
          id
          name
          description
          weekStart
          weekEnd
          isActive
          createdAt
          updatedAt
          meals {
            id
            day
            mealType
            name
            description
            calories
            protein
            carbs
            fat
            fiber
            ingredients
            instructions
            prepTime
            cookTime
            servings
          }
        }
      }
    `;

    const data = await this.makeRequest(query, { id });
    return data.setActiveDietPlan;
  }

  async deleteDietPlan(id: string): Promise<boolean> {
    const query = `
      mutation DeleteDietPlan($id: ID!) {
        deleteDietPlan(id: $id)
      }
    `;

    const data = await this.makeRequest(query, { id });
    return data.deleteDietPlan;
  }

  // Meal methods
  async updateMeal(input: MealUpdateInput): Promise<Meal> {
    const query = `
      mutation UpdateMeal($input: MealUpdateInput!) {
        updateMeal(input: $input) {
          id
          day
          mealType
          name
          description
          calories
          protein
          carbs
          fat
          fiber
          ingredients
          instructions
          prepTime
          cookTime
          servings
        }
      }
    `;

    const data = await this.makeRequest(query, { input });
    return data.updateMeal;
  }

  async regenerateMeal(mealId: string, customRequirements?: string): Promise<Meal> {
    const query = `
      mutation RegenerateMeal($mealId: ID!, $customRequirements: String) {
        regenerateMeal(mealId: $mealId, customRequirements: $customRequirements) {
          id
          day
          mealType
          name
          description
          calories
          protein
          carbs
          fat
          fiber
          ingredients
          instructions
          prepTime
          cookTime
          servings
        }
      }
    `;

    const data = await this.makeRequest(query, { mealId, customRequirements });
    return data.regenerateMeal;
  }

  async generatePDF(dietPlanId: string): Promise<string> {
    const query = `
      mutation GeneratePDF($dietPlanId: ID!) {
        generatePDF(dietPlanId: $dietPlanId)
      }
    `;

    const data = await this.makeRequest(query, { dietPlanId });
    return data.generatePDF;
  }
}

export const apiService = new ApiService();
