import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Paper,
} from '@mui/material';
import { Add, Restaurant, TrendingUp, CalendarToday } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { DietPlan } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activePlan, setActivePlan] = useState<DietPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchActivePlan = async () => {
      try {
        const plan = await apiService.getActiveDietPlan();
        setActivePlan(plan);
      } catch (err: any) {
        setError('Failed to load active diet plan');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivePlan();
  }, []);

  const getTodaysMeals = () => {
    if (!activePlan) return [];
    
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    return activePlan.meals.filter(meal => meal.day === today);
  };

  const todaysMeals = getTodaysMeals();

  const getWelcomeMessage = () => {
    if (!user) return 'Welcome!';
    
    const hour = new Date().getHours();
    let greeting = 'Hello';
    
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';
    else greeting = 'Good evening';
    
    return `${greeting}, ${user.name}!`;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading your dashboard...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Welcome Section */}
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #4ca6c9 0%, #3c89af 100%)',
          color: 'white',
          p: { xs: 3, md: 5 },
          mb: 4,
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            background: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
            {getWelcomeMessage()}
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 400, fontSize: { xs: '1rem', md: '1.25rem' } }}>
            {activePlan
              ? `Your current plan: ${activePlan.name}`
              : "Let's create your first personalized diet plan"
            }
          </Typography>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!activePlan ? (
        /* No Active Plan */
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 4, md: 6 }, 
            textAlign: 'center',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
          }}
        >
          <Restaurant sx={{ fontSize: 80, color: '#e0e0e0', mb: 3 }} />
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#212121' }}>
            No Active Diet Plan
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto', fontSize: '1.05rem' }}>
            Create your first AI-powered personalized diet plan to get started on your nutrition journey.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<Add />}
            onClick={() => navigate('/create-plan')}
            sx={{
              bgcolor: '#4ca6c9',
              '&:hover': { bgcolor: '#3c89af' },
              px: 4,
              py: 1.75,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.05rem',
              fontWeight: 600,
              boxShadow: 'none',
            }}
          >
            Create Your First Plan
          </Button>
        </Paper>
      ) : (
        /* Active Plan Dashboard */
        <Grid container spacing={3}>
          {/* Plan Overview */}
          <Grid item xs={12} md={8}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Today's Meals
                  </Typography>
                  <Chip
                    icon={<CalendarToday />}
                    label={new Date().toLocaleDateString('en-US', { 
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric'
                    })}
                    color="primary"
                  />
                </Box>
                
                {todaysMeals.length === 0 ? (
                  <Typography color="text.secondary">
                    No meals scheduled for today.
                  </Typography>
                ) : (
                  <Grid container spacing={2}>
                    {todaysMeals.map((meal) => (
                      <Grid item xs={12} sm={6} key={meal.id}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              boxShadow: 2,
                              transform: 'translateY(-2px)',
                            },
                          }}
                          onClick={() => navigate('/diet-plans')}
                        >
                          <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                            {meal.mealType}
                          </Typography>
                          <Typography variant="h6" sx={{ mb: 1 }}>
                            {meal.name}
                          </Typography>
                          {meal.calories && (
                            <Typography variant="body2" color="text.secondary">
                              {meal.calories} calories
                            </Typography>
                          )}
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Quick Actions
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Restaurant />}
                      onClick={() => navigate('/diet-plans')}
                      sx={{ py: 1.5 }}
                    >
                      View Current Plan
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={() => navigate('/create-plan')}
                      sx={{ py: 1.5 }}
                    >
                      Create New Plan
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<TrendingUp />}
                      onClick={() => navigate('/profile')}
                      sx={{ py: 1.5 }}
                    >
                      Update Profile
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Plan Info */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Current Plan Details
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Plan Name
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {activePlan.name}
                  </Typography>
                </Box>
                {activePlan.description && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1">
                      {activePlan.description}
                    </Typography>
                  </Box>
                )}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Week Period
                  </Typography>
                  <Typography variant="body1">
                    {new Date(activePlan.weekStart).toLocaleDateString()} - {' '}
                    {new Date(activePlan.weekEnd).toLocaleDateString()}
                  </Typography>
                </Box>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => navigate('/diet-plans')}
                  sx={{
                    bgcolor: '#4ca6c9',
                    '&:hover': { bgcolor: '#3c89af' },
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: 'none',
                  }}
                >
                  View Full Plan
                </Button>
              </CardContent>
            </Card>

            {/* User Stats */}
            {user && (
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Your Profile
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {user.goal && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Goal:
                        </Typography>
                        <Typography variant="body2">
                          {user.goal.replace('_', ' ')}
                        </Typography>
                      </Box>
                    )}
                    {user.weight && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Weight:
                        </Typography>
                        <Typography variant="body2">
                          {user.weight} kg
                        </Typography>
                      </Box>
                    )}
                    {user.height && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Height:
                        </Typography>
                        <Typography variant="body2">
                          {user.height} cm
                        </Typography>
                      </Box>
                    )}
                    {user.activityLevel && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Activity:
                        </Typography>
                        <Typography variant="body2">
                          {user.activityLevel.replace('_', ' ')}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate('/profile')}
                    sx={{ mt: 2 }}
                  >
                    Update Profile
                  </Button>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Dashboard;
