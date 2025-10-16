// Password validation and security utilities
export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isValid: boolean;
}

export const validatePasswordStrength = (password: string): PasswordStrength => {
  const feedback: string[] = [];
  let score = 0;

  // Minimum length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Password should be at least 8 characters long');
  }

  // Uppercase letter check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add at least one uppercase letter');
  }

  // Lowercase letter check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add at least one lowercase letter');
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add at least one number');
  }

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add at least one special character (!@#$%^&*(),.?":{}|<>)');
  }

  // Common password patterns
  const commonPatterns = [
    'password', '123456', 'qwerty', 'abc123', 'letmein',
    'admin', 'welcome', 'login', 'pass', 'test'
  ];
  
  if (commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
    feedback.push('Avoid common password patterns');
    score = Math.max(0, score - 1);
  }

  const isValid = score >= 3 && password.length >= 8;

  return {
    score,
    feedback,
    isValid
  };
};

export const getPasswordStrengthColor = (score: number): string => {
  switch (score) {
    case 0:
    case 1:
      return '#f44336'; // red
    case 2:
      return '#ff9800'; // orange
    case 3:
      return '#2196f3'; // blue
    case 4:
    case 5:
      return '#4caf50'; // green
    default:
      return '#f44336';
  }
};

export const getPasswordStrengthText = (score: number): string => {
  switch (score) {
    case 0:
    case 1:
      return 'Weak';
    case 2:
      return 'Fair';
    case 3:
      return 'Good';
    case 4:
    case 5:
      return 'Strong';
    default:
      return 'Weak';
  }
};