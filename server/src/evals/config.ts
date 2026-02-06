import { Client } from 'langsmith';
import { wrapOpenAI } from 'langsmith/wrappers';
import OpenAI from 'openai';

// LangSmith configuration
export const LANGSMITH_PROJECT = 'diet-planner-evals';

// Initialize LangSmith client
export function getLangSmithClient(): Client {
  if (!process.env.LANGSMITH_API_KEY) {
    throw new Error(
      'LANGSMITH_API_KEY is required. Get your key from https://smith.langchain.com/settings'
    );
  }

  return new Client({
    apiKey: process.env.LANGSMITH_API_KEY,
    apiUrl: process.env.LANGSMITH_ENDPOINT || 'https://api.smith.langchain.com',
  });
}

// Get wrapped OpenAI client for tracing
export function getTracedOpenAI(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required');
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  return wrapOpenAI(openai);
}

// Environment setup helper
export function setupLangSmithEnv() {
  // Enable LangChain/LangSmith tracing
  process.env.LANGCHAIN_TRACING_V2 = 'true';
  process.env.LANGSMITH_TRACING = 'true';
  process.env.LANGCHAIN_PROJECT = LANGSMITH_PROJECT;

  console.log('LangSmith tracing enabled for project:', LANGSMITH_PROJECT);
}

// Dataset names
export const DATASET_NAMES = {
  DIET_PLAN_GENERATION: 'diet-plan-generation',
  MEAL_REGENERATION: 'meal-regeneration',
  USER_PREFERENCES: 'user-preference-adherence',
} as const;
