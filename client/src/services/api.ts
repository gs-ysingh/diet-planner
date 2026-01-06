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

  async verifyEmail(token: string): Promise<AuthPayload> {
    const query = `
      mutation VerifyEmail($token: String!) {
        verifyEmail(token: $token) {
          token
          user {
            id
            email
            name
            emailVerified
            createdAt
            updatedAt
          }
        }
      }
    `;

    const data = await this.makeRequest(query, { token });
    return data.verifyEmail;
  }

  async resendVerification(email: string): Promise<boolean> {
    const query = `
      mutation ResendVerification($email: String!) {
        resendVerification(email: $email)
      }
    `;

    const data = await this.makeRequest(query, { email });
    return data.resendVerification;
  }

  async forgotPassword(email: string): Promise<boolean> {
    const query = `
      mutation ForgotPassword($email: String!) {
        forgotPassword(email: $email)
      }
    `;

    const data = await this.makeRequest(query, { email });
    return data.forgotPassword;
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const query = `
      mutation ResetPassword($token: String!, $newPassword: String!) {
        resetPassword(token: $token, newPassword: $newPassword)
      }
    `;

    const data = await this.makeRequest(query, { token, newPassword });
    return data.resetPassword;
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

  async generateCSV(dietPlanId: string): Promise<string> {
    const query = `
      mutation GenerateCSV($dietPlanId: ID!) {
        generateCSV(dietPlanId: $dietPlanId)
      }
    `;

    const data = await this.makeRequest(query, { dietPlanId });
    return data.generateCSV;
  }

  // Streaming diet plan generation
  async generateDietPlanStream(
    input: DietPlanInput,
    onProgress: (event: { type: string; data: any }) => void
  ): Promise<void> {
    const API_STREAM_URL = process.env.REACT_APP_GRAPHQL_ENDPOINT?.replace('/graphql', '/api/generate-diet-plan-stream') 
      || 'http://localhost:4000/api/generate-diet-plan-stream';

    return new Promise((resolve, reject) => {
      fetch(API_STREAM_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { Authorization: `Bearer ${this.token}` })
        },
        body: JSON.stringify({ input })
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const reader = response.body?.getReader();
          const decoder = new TextDecoder();

          if (!reader) {
            throw new Error('Response body reader not available');
          }

          const readStream = async () => {
            try {
              while (true) {
                const { done, value } = await reader.read();
                
                if (done) {
                  resolve();
                  break;
                }

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                  if (line.startsWith('data: ')) {
                    try {
                      const eventData = JSON.parse(line.substring(6));
                      onProgress(eventData);

                      if (eventData.type === 'complete') {
                        resolve();
                        return;
                      }

                      if (eventData.type === 'error') {
                        reject(new Error(eventData.error || 'Streaming error'));
                        return;
                      }
                    } catch (parseError) {
                      console.error('Error parsing SSE data:', parseError);
                    }
                  }
                }
              }
            } catch (streamError) {
              reject(streamError);
            }
          };

          readStream();
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  // Save the generated diet plan to database
  async saveDietPlan(input: DietPlanInput, meals: any[]): Promise<{ success: boolean; dietPlan?: DietPlan; error?: string }> {
    const query = `
      mutation SaveDietPlan($input: SaveDietPlanInput!) {
        saveDietPlan(input: $input) {
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

    const saveInput = {
      name: input.name,
      description: input.description,
      weekStart: input.weekStart,
      meals
    };

    const data = await this.makeRequest(query, { input: saveInput });
    return data.saveDietPlan;
  }
}

export const apiService = new ApiService();
