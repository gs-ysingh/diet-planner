import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthPayload } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateUser: (userData: any) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        setToken(storedToken);
        apiService.setToken(storedToken);
        try {
          const userData = await apiService.getMe();
          setUser(userData);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          localStorage.removeItem('authToken');
          apiService.clearToken();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const authData: AuthPayload = await apiService.login(email, password);
      setToken(authData.token);
      setUser(authData.user);
      apiService.setToken(authData.token);
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const authData: AuthPayload = await apiService.register(userData);
      setToken(authData.token);
      setUser(authData.user);
      apiService.setToken(authData.token);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    apiService.clearToken();
  };

  const updateUser = async (userData: any) => {
    try {
      const updatedUser = await apiService.updateProfile(userData);
      setUser(updatedUser);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    updateUser,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
