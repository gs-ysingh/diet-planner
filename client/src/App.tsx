import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import DietPlans from './pages/DietPlans';
import CreatePlan from './pages/CreatePlan';
import Landing from './pages/Landing';
import { dietPlannerTheme } from './theme/dietPlannerTheme';
import './App.css';



interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return !user ? <>{children}</> : <Navigate to="/dashboard" />;
};

const AppContent: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/diet-plans"
          element={
            <ProtectedRoute>
              <DietPlans />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-plan"
          element={
            <ProtectedRoute>
              <CreatePlan />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={dietPlannerTheme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
