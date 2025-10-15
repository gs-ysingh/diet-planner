import { createTheme, ThemeOptions } from '@mui/material/styles';

// Define custom color palette
const colors = {
  primary: {
    50: '#e8f5f3',
    100: '#c6e6e0',
    200: '#a0d5cc',
    300: '#7ac4b7',
    400: '#5eb8a7',
    500: '#16a085', // Main primary color
    600: '#149077',
    700: '#117e66',
    800: '#0e6c56',
    900: '#0a4e3d',
  },
  secondary: {
    50: '#fef7e8',
    100: '#fdecc6',
    200: '#fce0a0',
    300: '#fbd379',
    400: '#fac95c',
    500: '#f39c12', // Main secondary color
    600: '#e89210',
    700: '#dc850d',
    800: '#d0790b',
    900: '#bf6506',
  },
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  accent: {
    purple: '#8e44ad',
    purpleLight: '#bb8fce',
    purpleDark: '#7d3c98',
  },
};

// Define typography scale
const typography = {
  fontFamily: '"Inter", "SF Pro Display", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", sans-serif',
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightSemiBold: 600,
  fontWeightBold: 700,
  fontWeightExtraBold: 800,
};

// Define spacing scale
const spacing = (factor: number) => `${0.25 * factor}rem`;

// Define shadow system
const shadows = [
  'none',
  '0px 2px 4px rgba(0, 0, 0, 0.04)',
  '0px 4px 8px rgba(0, 0, 0, 0.06)',
  '0px 8px 16px rgba(0, 0, 0, 0.08)',
  '0px 12px 24px rgba(0, 0, 0, 0.10)',
  '0px 16px 32px rgba(0, 0, 0, 0.12)',
  '0px 20px 40px rgba(0, 0, 0, 0.14)',
  '0px 24px 48px rgba(0, 0, 0, 0.16)',
  '0px 32px 64px rgba(0, 0, 0, 0.18)',
  '0px 40px 80px rgba(0, 0, 0, 0.20)',
  '0px 48px 96px rgba(0, 0, 0, 0.22)',
  '0px 56px 112px rgba(0, 0, 0, 0.24)',
  '0px 64px 128px rgba(0, 0, 0, 0.26)',
  '0px 72px 144px rgba(0, 0, 0, 0.28)',
  '0px 80px 160px rgba(0, 0, 0, 0.30)',
  '0px 88px 176px rgba(0, 0, 0, 0.32)',
  '0px 96px 192px rgba(0, 0, 0, 0.34)',
  '0px 104px 208px rgba(0, 0, 0, 0.36)',
  '0px 112px 224px rgba(0, 0, 0, 0.38)',
  '0px 120px 240px rgba(0, 0, 0, 0.40)',
  '0px 128px 256px rgba(0, 0, 0, 0.42)',
  '0px 136px 272px rgba(0, 0, 0, 0.44)',
  '0px 144px 288px rgba(0, 0, 0, 0.46)',
  '0px 152px 304px rgba(0, 0, 0, 0.48)',
  '0px 160px 320px rgba(0, 0, 0, 0.50)',
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
      main: '#27ae60',
      light: '#58d68d',
      dark: '#229954',
    },
    warning: {
      main: '#e67e22',
      light: '#f0b27a',
      dark: '#ca6f1e',
    },
    error: {
      main: '#e74c3c',
      light: '#f1948a',
      dark: '#cb4335',
    },
    info: {
      main: '#3498db',
      light: '#85c1e9',
      dark: '#2980b9',
    },
    background: {
      default: '#fafbfc',
      paper: '#ffffff',
    },
    text: {
      primary: colors.neutral[800],
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
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
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
          borderRadius: 12,
          fontWeight: typography.fontWeightSemiBold,
          fontSize: '0.875rem',
          padding: '12px 24px',
          boxShadow: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: `0 8px 25px ${colors.primary[500]}30`,
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[700]} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.primary[800]} 100%)`,
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
            backgroundColor: `${colors.primary[500]}08`,
          },
        },
      },
    },
    // Card component
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          background: 'rgba(255, 255, 255, 0.95)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    // TextField component
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            transition: 'all 0.3s ease',
            '& fieldset': {
              borderColor: `${colors.primary[500]}33`,
              borderWidth: '2px',
            },
            '&:hover fieldset': {
              borderColor: `${colors.primary[500]}66`,
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.primary[500],
              boxShadow: `0 0 0 3px ${colors.primary[500]}1A`,
            },
          },
          '& .MuiInputLabel-root': {
            fontWeight: typography.fontWeightMedium,
          },
        },
      },
    },
    // Paper component
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        },
        elevation2: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        },
        elevation3: {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.10)',
        },
      },
    },
    // Chip component
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontWeight: typography.fontWeightMedium,
          height: 32,
        },
        filled: {
          backgroundColor: `${colors.primary[500]}1A`,
          color: colors.primary[700],
          '&:hover': {
            backgroundColor: `${colors.primary[500]}33`,
          },
        },
      },
    },
    // AppBar component
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 2px 20px rgba(0, 0, 0, 0.04)',
          color: colors.neutral[800],
        },
      },
    },
    // Dialog component
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
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
          borderRadius: 12,
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
  primary: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[700]} 100%)`,
  secondary: `linear-gradient(135deg, ${colors.secondary[500]} 0%, ${colors.secondary[700]} 100%)`,
  accent: `linear-gradient(135deg, ${colors.accent.purple} 0%, ${colors.accent.purpleDark} 100%)`,
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  glass: 'rgba(255, 255, 255, 0.95)',
};