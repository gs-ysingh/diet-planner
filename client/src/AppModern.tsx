// Modern App.tsx with all providers and latest patterns
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Toaster } from 'sonner';
import { motion } from 'framer-motion';

// Providers
import { QueryProvider } from './providers/QueryProvider';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import Header from './components/Header';

// Pages
import Landing from './pages/Landing';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './pages/Dashboard';
import DietPlans from './pages/DietPlans';
import CreatePlan from './pages/CreatePlan';
import CreatePlanModern from './pages/CreatePlanModern';
import Profile from './pages/Profile';

// Modern Material-UI theme with 2024 design trends
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    secondary: {
      main: '#ff6b35',
      light: '#ff8a65',
      dark: '#e64a19',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    success: {
      main: '#4caf50',
    },
    error: {
      main: '#f44336',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        Loading...
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

// Page transition wrapper
const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

// App Layout Component
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  return (
    <>
      {user && <Header />}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.main>
    </>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <QueryProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <AppLayout>
              <Routes>
                {/* Public Routes */}
                <Route 
                  path="/" 
                  element={
                    <PageTransition>
                      <Landing />
                    </PageTransition>
                  } 
                />
                <Route 
                  path="/login" 
                  element={
                    <PageTransition>
                      <Login />
                    </PageTransition>
                  } 
                />
                <Route 
                  path="/register" 
                  element={
                    <PageTransition>
                      <Register />
                    </PageTransition>
                  } 
                />

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <PageTransition>
                        <Dashboard />
                      </PageTransition>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/diet-plans"
                  element={
                    <ProtectedRoute>
                      <PageTransition>
                        <DietPlans />
                      </PageTransition>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create-plan"
                  element={
                    <ProtectedRoute>
                      <PageTransition>
                        <CreatePlan />
                      </PageTransition>
                    </ProtectedRoute>
                  }
                />
                {/* Modern version of create plan */}
                <Route
                  path="/create-plan-modern"
                  element={
                    <ProtectedRoute>
                      <PageTransition>
                        <CreatePlanModern />
                      </PageTransition>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <PageTransition>
                        <Profile />
                      </PageTransition>
                    </ProtectedRoute>
                  }
                />

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AppLayout>
          </Router>
        </AuthProvider>

        {/* Modern Toast Notifications */}
        <Toaster
          position="top-right"
          expand
          richColors
          closeButton
          toastOptions={{
            style: {
              background: '#ffffff',
              border: '1px solid #e0e0e0',
              borderRadius: '12px',
              fontFamily: theme.typography.fontFamily,
            },
          }}
        />
      </ThemeProvider>
    </QueryProvider>
  );
};

export default App;