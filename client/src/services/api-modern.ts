// Modern API service using TanStack Query v5
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { DietPlan, DietPlanInput, User, AuthResponse } from '../types';

// API Base Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Query Keys - centralized and type-safe
export const queryKeys = {
  auth: ['auth'] as const,
  user: (id: string) => ['user', id] as const,
  dietPlans: {
    all: ['diet-plans'] as const,
    byUser: (userId: string) => ['diet-plans', 'user', userId] as const,
    detail: (id: string) => ['diet-plans', 'detail', id] as const,
  },
} as const;

// API Functions
const api = {
  // Auth
  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    const { data } = await apiClient.post('/auth/login', credentials);
    return data;
  },

  register: async (userData: { 
    email: string; 
    password: string; 
    name: string; 
  }): Promise<AuthResponse> => {
    const { data } = await apiClient.post('/auth/register', userData);
    return data;
  },

  // User
  getCurrentUser: async (): Promise<User> => {
    const { data } = await apiClient.get('/auth/me');
    return data;
  },

  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const { data } = await apiClient.put('/user/profile', userData);
    return data;
  },

  // Diet Plans
  getDietPlans: async (): Promise<DietPlan[]> => {
    const { data } = await apiClient.get('/diet-plans');
    return data;
  },

  getDietPlan: async (id: string): Promise<DietPlan> => {
    const { data } = await apiClient.get(`/diet-plans/${id}`);
    return data;
  },

  generateDietPlan: async (planInput: DietPlanInput): Promise<DietPlan> => {
    const { data } = await apiClient.post('/diet-plans/generate', planInput);
    return data;
  },

  deleteDietPlan: async (id: string): Promise<void> => {
    await apiClient.delete(`/diet-plans/${id}`);
  },

  downloadDietPlan: async (id: string): Promise<Blob> => {
    const { data } = await apiClient.get(`/diet-plans/${id}/download`, {
      responseType: 'blob',
    });
    return data;
  },
};

// React Query Hooks - Modern API layer

// Auth Hooks
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.login,
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      queryClient.setQueryData(queryKeys.auth, data.user);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth });
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.register,
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      queryClient.setQueryData(queryKeys.auth, data.user);
    },
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.auth,
    queryFn: api.getCurrentUser,
    enabled: !!localStorage.getItem('token'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.updateProfile,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(queryKeys.auth, updatedUser);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth });
    },
  });
};

// Diet Plan Hooks
export const useDietPlans = () => {
  return useQuery({
    queryKey: queryKeys.dietPlans.all,
    queryFn: api.getDietPlans,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useDietPlan = (id: string) => {
  return useQuery({
    queryKey: queryKeys.dietPlans.detail(id),
    queryFn: () => api.getDietPlan(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGenerateDietPlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.generateDietPlan,
    onSuccess: (newPlan) => {
      // Optimistic update - add to cache
      queryClient.setQueryData(queryKeys.dietPlans.all, (oldData: DietPlan[] = []) => [
        newPlan,
        ...oldData,
      ]);
      
      // Invalidate to refetch from server
      queryClient.invalidateQueries({ queryKey: queryKeys.dietPlans.all });
    },
  });
};

export const useDeleteDietPlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.deleteDietPlan,
    onSuccess: (_, deletedId) => {
      // Optimistic update - remove from cache
      queryClient.setQueryData(queryKeys.dietPlans.all, (oldData: DietPlan[] = []) =>
        oldData.filter(plan => plan.id !== deletedId)
      );
      
      // Remove specific plan from cache
      queryClient.removeQueries({ queryKey: queryKeys.dietPlans.detail(deletedId) });
    },
  });
};

export const useDownloadDietPlan = () => {
  return useMutation({
    mutationFn: api.downloadDietPlan,
    onSuccess: (blob, planId) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `diet-plan-${planId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
};

// Prefetching utilities
export const prefetchDietPlans = (queryClient: any) => {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.dietPlans.all,
    queryFn: api.getDietPlans,
    staleTime: 2 * 60 * 1000,
  });
};

export const prefetchDietPlan = (queryClient: any, id: string) => {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.dietPlans.detail(id),
    queryFn: () => api.getDietPlan(id),
    staleTime: 5 * 60 * 1000,
  });
};

// Export for backward compatibility (if needed during migration)
export const apiService = api;