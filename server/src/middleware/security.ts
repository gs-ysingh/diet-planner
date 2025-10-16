import { AuthenticationError } from 'apollo-server-express';

export interface SecurityValidation {
  isValid: boolean;
  errors: string[];
}

export const validatePasswordSecurity = (password: string): SecurityValidation => {
  const errors: string[] = [];
  
  // Check minimum length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  // Check for number
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // Check for special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Check for common passwords
  const commonPasswords = [
    'password', '123456', 'password123', 'admin', 'qwerty', 
    'abc123', 'letmein', 'welcome', '12345678', 'iloveyou',
    'princess', 'rockyou', '123123', 'baseball', 'football'
  ];
  
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    errors.push('Password contains common patterns that are not secure');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return input;
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove angle brackets to prevent XSS
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const rateLimitCheck = (attempts: Map<string, { count: number; lastAttempt: number }>, identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean => {
  const now = Date.now();
  const userAttempts = attempts.get(identifier);
  
  if (!userAttempts) {
    attempts.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Reset if window has passed
  if (now - userAttempts.lastAttempt > windowMs) {
    attempts.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Increment count
  userAttempts.count++;
  userAttempts.lastAttempt = now;
  
  return userAttempts.count <= maxAttempts;
};

// Store for tracking login attempts
export const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

export const checkLoginRateLimit = (email: string): void => {
  if (!rateLimitCheck(loginAttempts, email)) {
    throw new AuthenticationError('Too many login attempts. Please try again later.');
  }
};