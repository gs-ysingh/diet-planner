import { createTheme, ThemeOptions } from '@mui/material/styles';

// Define custom color palette - Professional and modern
const colors = {
  primary: {
    50: '#e8f4f8',
    100: '#c8e4ee',
    200: '#a5d3e4',
    300: '#82c1d9',
    400: '#67b3d1',
    500: '#4ca6c9', // Main primary color - Professional blue
    600: '#4599bd',
    700: '#3c89af',
    800: '#337aa1',
    900: '#235e86',
  },
  secondary: {
    50: '#fff3e0',
    100: '#ffe0b3',
    200: '#ffcc80',
    300: '#ffb74d',
    400: '#ffa726',
    500: '#ff9800', // Main secondary color - Vibrant orange
    600: '#fb8c00',
    700: '#f57c00',
    800: '#ef6c00',
    900: '#e65100',
  },
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  accent: {
    green: '#10b981',
    greenLight: '#6ee7b7',
    greenDark: '#059669',
    purple: '#8b5cf6',
    purpleLight: '#c4b5fd',
    purpleDark: '#6d28d9',
  },
};

// Define typography scale - Modern and clean
const typography = {
  fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", -apple-system, BlinkMacSystemFont, sans-serif',
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightSemiBold: 600,
  fontWeightBold: 700,
  fontWeightExtraBold: 800,
};

// Define spacing scale
const spacing = (factor: number) => `${0.25 * factor}rem`;

// Define shadow system - Softer and more professional
const shadows = [
  'none',
  '0px 1px 3px rgba(0, 0, 0, 0.05)',
  '0px 2px 6px rgba(0, 0, 0, 0.06)',
  '0px 4px 12px rgba(0, 0, 0, 0.07)',
  '0px 8px 16px rgba(0, 0, 0, 0.08)',
  '0px 12px 24px rgba(0, 0, 0, 0.09)',
  '0px 16px 32px rgba(0, 0, 0, 0.10)',
  '0px 20px 40px rgba(0, 0, 0, 0.11)',
  '0px 24px 48px rgba(0, 0, 0, 0.12)',
  '0px 32px 64px rgba(0, 0, 0, 0.13)',
  '0px 40px 80px rgba(0, 0, 0, 0.14)',
  '0px 48px 96px rgba(0, 0, 0, 0.15)',
  '0px 56px 112px rgba(0, 0, 0, 0.16)',
  '0px 64px 128px rgba(0, 0, 0, 0.17)',
  '0px 72px 144px rgba(0, 0, 0, 0.18)',
  '0px 80px 160px rgba(0, 0, 0, 0.19)',
  '0px 88px 176px rgba(0, 0, 0, 0.20)',
  '0px 96px 192px rgba(0, 0, 0, 0.21)',
  '0px 104px 208px rgba(0, 0, 0, 0.22)',
  '0px 112px 224px rgba(0, 0, 0, 0.23)',
  '0px 120px 240px rgba(0, 0, 0, 0.24)',
  '0px 128px 256px rgba(0, 0, 0, 0.25)',
  '0px 136px 272px rgba(0, 0, 0, 0.26)',
  '0px 144px 288px rgba(0, 0, 0, 0.27)',
  '0px 152px 304px rgba(0, 0, 0, 0.28)',
];

// Create the main theme
export const dietPlannerTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.primary[500],
      light: colors.primary[300],
      dark: colors.primary[700],
      contrastText: '#ffffff',
    },
    secondary: {
      main: colors.secondary[500],
      light: colors.secondary[300],
      dark: colors.secondary[700],
      contrastText: '#ffffff',
    },
    success: {
      main: '#10b981',
      light: '#6ee7b7',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f59e0b',
      light: '#fcd34d',
      dark: '#d97706',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444',
      light: '#fca5a5',
      dark: '#dc2626',
      contrastText: '#ffffff',
    },
    info: {
      main: '#3b82f6',
      light: '#93c5fd',
      dark: '#2563eb',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: colors.neutral[900],
      secondary: colors.neutral[600],
    },
    divider: colors.neutral[200],
    grey: colors.neutral,
  },
  typography: {
    fontFamily: typography.fontFamily,
    h1: {
      fontWeight: typography.fontWeightBold,
      fontSize: '3rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: typography.fontWeightBold,
      fontSize: '2.25rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: typography.fontWeightSemiBold,
      fontSize: '1.875rem',
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: typography.fontWeightSemiBold,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: typography.fontWeightSemiBold,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: typography.fontWeightSemiBold,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      fontWeight: typography.fontWeightRegular,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      fontWeight: typography.fontWeightRegular,
    },
    button: {
      fontWeight: typography.fontWeightSemiBold,
      fontSize: '0.875rem',
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
      fontWeight: typography.fontWeightRegular,
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: typography.fontWeightSemiBold,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
    },
  },
  spacing,
  shape: {
    borderRadius: 16,
  },
  shadows: shadows as any,
  components: {
    // Global CSS baseline
    MuiCssBaseline: {
      styleOverrides: `
        * {
          box-sizing: border-box;
        }
        html {
          scroll-behavior: smooth;
        }
        body {
          background: #f8fafc;
          min-height: 100vh;
        }
        #root {
          min-height: 100vh;
        }
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: ${colors.neutral[100]};
        }
        ::-webkit-scrollbar-thumb {
          background: ${colors.primary[300]};
          border-radius: 20px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${colors.primary[500]};
        }
        ::selection {
          background-color: ${colors.primary[200]};
        }
      `,
    },
    // Button component
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: typography.fontWeightSemiBold,
          fontSize: '0.9375rem',
          padding: '10px 24px',
          boxShadow: 'none',
          textTransform: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(76, 166, 201, 0.25)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          background: colors.primary[500],
          '&:hover': {
            background: colors.primary[600],
          },
        },
        containedSecondary: {
          background: colors.secondary[500],
          '&:hover': {
            background: colors.secondary[600],
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
            backgroundColor: `${colors.primary[50]}`,
          },
        },
        text: {
          '&:hover': {
            backgroundColor: `${colors.primary[50]}`,
          },
        },
      },
    },
    // Card component
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          background: '#ffffff',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    // TextField component
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: '#ffffff',
            transition: 'all 0.2s ease',
            '& fieldset': {
              borderColor: colors.neutral[300],
              borderWidth: '1.5px',
            },
            '&:hover fieldset': {
              borderColor: colors.primary[400],
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.primary[500],
              borderWidth: '2px',
            },
          },
          '& .MuiInputLabel-root': {
            fontWeight: typography.fontWeightMedium,
            color: colors.neutral[600],
          },
        },
      },
    },
    // Paper component
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
        },
        elevation2: {
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
        },
        elevation3: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.10)',
        },
      },
    },
    // Chip component
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: typography.fontWeightMedium,
          height: 28,
          fontSize: '0.8125rem',
        },
        filled: {
          backgroundColor: colors.primary[50],
          color: colors.primary[700],
          '&:hover': {
            backgroundColor: colors.primary[100],
          },
        },
      },
    },
    // AppBar component
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          color: colors.neutral[900],
        },
      },
    },
    // Dialog component
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        },
      },
    },
    // Tab component
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: typography.fontWeightSemiBold,
          fontSize: '0.875rem',
        },
      },
    },
    // Alert component
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: typography.fontWeightMedium,
        },
      },
    },
  },
} as ThemeOptions);

// Export color utilities for use in components
export { colors, typography };

// Export custom breakpoints
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
};

// Export animation utilities
export const animations = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
};

// Export gradient utilities
export const gradients = {
  primary: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
  secondary: `linear-gradient(135deg, ${colors.secondary[500]} 0%, ${colors.secondary[600]} 100%)`,
  accent: `linear-gradient(135deg, ${colors.accent.green} 0%, ${colors.accent.greenDark} 100%)`,
  background: '#f8fafc',
  glass: 'rgba(255, 255, 255, 0.98)',
};