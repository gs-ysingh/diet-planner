import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add,
  Delete,
  GetApp,
  Restaurant,
  CalendarToday,
  ExpandMore,
  AccessTime,
  LocalFireDepartment,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { DietPlan, DayOfWeek, MealType } from '../types';
import {
  trackDietPlanExport,
  trackDietPlanDelete,
  trackCreatePlanClick,
  trackButtonClick,
} from '../utils/analytics';
import { useEngagementTracking } from '../hooks/useAnalytics';
import { useAuth } from '../contexts/AuthContext';

const DietPlans: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; planId: string | null }>({
    open: false,
    planId: null,
  });
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);
  const [csvLoading, setCsvLoading] = useState<string | null>(null);

  // Track engagement time on Diet Plans page
  useEngagementTracking('Diet Plans');

  useEffect(() => {
    fetchDietPlans();
  }, [user]);

  const fetchDietPlans = async () => {
    try {
      if (user) {
        // Fetch saved plans for authenticated users
        const plans = await apiService.getAllDietPlans();
        setDietPlans(plans);
      } else {
        // Load current plan from localStorage for unauthenticated users
        const pending = localStorage.getItem('pendingDietPlan');
        if (pending) {
          const { planInput, meals } = JSON.parse(pending);
          setCurrentPlan({ planInput, meals });
        }
      }
    } catch (err: any) {
      // Don't show error for unauthenticated users - they just won't see saved plans
      if (user) {
        setError('Failed to load diet plans');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetActive = async (planId: string) => {
    try {
      await apiService.setActiveDietPlan(planId);
      trackButtonClick('Set Active Plan', 'Diet Plans');
      fetchDietPlans(); // Refresh the list
    } catch (err: any) {
      setError('Failed to set active plan');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.planId) return;

    try {
      await apiService.deleteDietPlan(deleteDialog.planId);
      trackDietPlanDelete(deleteDialog.planId);
      setDietPlans(prev => prev.filter(plan => plan.id !== deleteDialog.planId));
      setDeleteDialog({ open: false, planId: null });
    } catch (err: any) {
      setError('Failed to delete diet plan');
      console.error(err);
    }
  };

  const handleGeneratePDF = async (planId: string, planName: string) => {
    setPdfLoading(planId);
    try {
      const base64PDF = await apiService.generatePDF(planId);
      
      // Track PDF export
      trackDietPlanExport(planId, 'PDF');
      
      // Convert base64 to blob and download
      const binaryString = window.atob(base64PDF);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${planName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_diet_plan.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError('Failed to generate PDF');
      console.error(err);
    } finally {
      setPdfLoading(null);
    }
  };

  const handleGenerateCSV = async (planId: string, planName: string) => {
    setCsvLoading(planId);
    try {
      const csvContent = await apiService.generateCSV(planId);
      
      // Track CSV export
      trackDietPlanExport(planId, 'CSV');
      
      // Create a blob and download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${planName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_diet_plan.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError('Failed to generate CSV');
      console.error(err);
    } finally {
      setCsvLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getMealsByDay = (plan: DietPlan, day: DayOfWeek) => {
    return plan.meals.filter(meal => meal.day === day);
  };

  const daysOfWeek: DayOfWeek[] = [
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
    DayOfWeek.SATURDAY,
    DayOfWeek.SUNDAY,
  ];

  const mealTypeOrder: MealType[] = [
    MealType.BREAKFAST,
    MealType.LUNCH,
    MealType.SNACK,
    MealType.DINNER,
  ];

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading your diet plans...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ color: '#212121', fontWeight: 700 }}>
          {user ? 'My Diet Plans' : 'Your Diet Plan'}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            trackCreatePlanClick();
            navigate('/create-plan');
          }}
          sx={{
            bgcolor: '#4ca6c9',
            '&:hover': { bgcolor: '#3c89af' },
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 'none',
          }}
        >
          Create New Plan
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Show prompt to sign up for unauthenticated users */}
      {!user && currentPlan && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Sign up or log in to save your plan permanently and access it across devices!
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              size="small"
              onClick={() => navigate('/register', { state: { from: '/diet-plans' } })}
              sx={{
                bgcolor: '#4ca6c9',
                '&:hover': { bgcolor: '#3c89af' },
              }}
            >
              Sign Up
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate('/login', { state: { from: '/diet-plans' } })}
            >
              Log In
            </Button>
          </Box>
        </Alert>
      )}

      {/* Show current plan for unauthenticated users */}
      {!user && currentPlan && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                      {currentPlan.planInput.name}
                      <Chip
                        label="Current Plan"
                        color="primary"
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                    {currentPlan.planInput.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {currentPlan.planInput.description}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <Chip
                    icon={<CalendarToday />}
                    label={`Week starting ${formatDate(currentPlan.planInput.weekStart)}`}
                    variant="outlined"
                  />
                  <Chip
                    icon={<Restaurant />}
                    label={`${currentPlan.meals.length} meals`}
                    variant="outlined"
                  />
                </Box>

                {/* Download buttons for unauthenticated users */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <Button
                    variant="outlined"
                    startIcon={<GetApp />}
                    onClick={() => navigate('/register', { state: { from: '/diet-plans' } })}
                    size="small"
                  >
                    Download PDF
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<GetApp />}
                    onClick={() => navigate('/register', { state: { from: '/diet-plans' } })}
                    size="small"
                  >
                    Download CSV
                  </Button>
                  <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center', ml: 1 }}>
                    (Sign up to download)
                  </Typography>
                </Box>

                {/* Display meals by day */}
                {daysOfWeek.map((day, dayIndex) => {
                  const dayMeals = currentPlan.meals.filter((m: any) => m.day === day);
                  if (dayMeals.length === 0) return null;

                  const sortedMeals = dayMeals.sort((a: any, b: any) => 
                    mealTypeOrder.indexOf(a.mealType) - mealTypeOrder.indexOf(b.mealType)
                  );

                  return (
                    <Accordion key={day} defaultExpanded={dayIndex === 0} sx={{ mb: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography sx={{ fontWeight: 600 }}>{day}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          {sortedMeals.map((meal: any, index: number) => (
                            <Grid item xs={12} md={6} key={index}>
                              <Card variant="outlined">
                                <CardContent>
                                  <Chip
                                    label={meal.mealType}
                                    size="small"
                                    sx={{ mb: 1, bgcolor: '#4ca6c9', color: 'white' }}
                                  />
                                  <Typography variant="h6" sx={{ mb: 1 }}>
                                    {meal.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    {meal.description}
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    <Chip
                                      icon={<LocalFireDepartment />}
                                      label={`${meal.calories} cal`}
                                      size="small"
                                      variant="outlined"
                                    />
                                    <Chip
                                      label={`${meal.protein}g protein`}
                                      size="small"
                                      variant="outlined"
                                    />
                                    <Chip
                                      label={`${meal.carbs}g carbs`}
                                      size="small"
                                      variant="outlined"
                                    />
                                    <Chip
                                      label={`${meal.fat}g fat`}
                                      size="small"
                                      variant="outlined"
                                    />
                                    {meal.prepTime && (
                                      <Chip
                                        icon={<AccessTime />}
                                        label={`${meal.prepTime + (meal.cookTime || 0)} min`}
                                        size="small"
                                        variant="outlined"
                                      />
                                    )}
                                  </Box>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Show empty state for unauthenticated users without a plan */}
      {!user && !currentPlan && (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Restaurant sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No Diet Plan Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Create your first AI-powered diet plan to get started.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              trackCreatePlanClick();
              navigate('/create-plan');
            }}
            sx={{
              bgcolor: '#4ca6c9',
              '&:hover': { bgcolor: '#3c89af' },
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'none',
            }}
          >
            Create Your First Plan
          </Button>
        </Card>
      )}

      {/* Show saved plans for authenticated users */}
      {user && dietPlans.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Restaurant sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No Saved Diet Plans
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Create your first AI-powered diet plan to get started.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              trackCreatePlanClick();
              navigate('/create-plan');
            }}
            sx={{
              bgcolor: '#4ca6c9',
              '&:hover': { bgcolor: '#3c89af' },
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'none',
            }}
          >
            Create Your First Plan
          </Button>
        </Card>
      ) : user && (
        <Grid container spacing={3}>
          {dietPlans.map((plan) => (
            <Grid item xs={12} key={plan.id}>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                        {plan.name}
                        {plan.isActive && (
                          <Chip
                            label="Active"
                            color="primary"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Typography>
                      {plan.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {plan.description}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        onClick={() => handleGeneratePDF(plan.id, plan.name)}
                        disabled={pdfLoading === plan.id}
                        color="primary"
                        title="Download as PDF"
                      >
                        {pdfLoading === plan.id ? (
                          <CircularProgress size={20} />
                        ) : (
                          <GetApp />
                        )}
                      </IconButton>
                      <IconButton
                        onClick={() => handleGenerateCSV(plan.id, plan.name)}
                        disabled={csvLoading === plan.id}
                        color="secondary"
                        title="Download as CSV"
                      >
                        {csvLoading === plan.id ? (
                          <CircularProgress size={20} />
                        ) : (
                          <GetApp />
                        )}
                      </IconButton>
                      <IconButton
                        onClick={() => setDeleteDialog({ open: true, planId: plan.id })}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Chip
                      icon={<CalendarToday />}
                      label={`${formatDate(plan.weekStart)} - ${formatDate(plan.weekEnd)}`}
                      variant="outlined"
                    />
                    <Typography variant="body2" color="text.secondary">
                      {plan.meals.length} meals planned
                    </Typography>
                  </Box>

                  {/* Week Overview - Modern Accordion */}
                  <Box sx={{ mb: 2 }}>
                    {daysOfWeek.map((day, index) => {
                      const dayMeals = getMealsByDay(plan, day);
                      if (dayMeals.length === 0) return null;

                      const totalCalories = dayMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
                      const totalProtein = dayMeals.reduce((sum, meal) => sum + (meal.protein || 0), 0);

                      return (
                        <Accordion 
                          key={day}
                          defaultExpanded={index === 0}
                          sx={{ 
                            mb: 2,
                            borderRadius: '12px !important',
                            border: '1px solid #e0e0e0',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              transform: 'translateY(-2px)',
                            },
                            '&:before': {
                              display: 'none',
                            },
                            '&.Mui-expanded': {
                              margin: '0 0 16px 0',
                            },
                          }}
                        >
                          <AccordionSummary
                            expandIcon={
                              <ExpandMore 
                                sx={{ 
                                  color: '#4ca6c9',
                                  transition: 'transform 0.3s ease',
                                }}
                              />
                            }
                            sx={{ 
                              background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                              minHeight: '72px',
                              px: 3,
                              py: 1.5,
                              '&:hover': {
                                background: 'linear-gradient(135deg, #f0f8ff 0%, #ffffff 100%)',
                              },
                              '& .MuiAccordionSummary-content': {
                                my: 1.5,
                                alignItems: 'center',
                              },
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                              {/* Day number badge */}
                              <Box
                                sx={{
                                  minWidth: 40,
                                  height: 40,
                                  borderRadius: '10px',
                                  background: 'linear-gradient(135deg, #4ca6c9 0%, #3c89af 100%)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  fontWeight: 700,
                                  fontSize: '0.875rem',
                                  boxShadow: '0 2px 6px rgba(76, 166, 201, 0.3)',
                                }}
                              >
                                {index + 1}
                              </Box>
                              
                              {/* Day name */}
                              <Box sx={{ flex: 1 }}>
                                <Typography 
                                  sx={{ 
                                    fontWeight: 600,
                                    fontSize: '1.125rem',
                                    color: '#212121',
                                    mb: 0.5,
                                  }}
                                >
                                  {day.charAt(0) + day.slice(1).toLowerCase()}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                  <Chip
                                    size="small"
                                    label={`${dayMeals.length} meals`}
                                    sx={{
                                      bgcolor: '#e3f2fd',
                                      color: '#1976d2',
                                      fontWeight: 500,
                                      fontSize: '0.75rem',
                                      height: 24,
                                    }}
                                  />
                                  <Chip
                                    size="small"
                                    icon={<LocalFireDepartment sx={{ fontSize: 14 }} />}
                                    label={`${totalCalories} cal`}
                                    sx={{
                                      bgcolor: '#fff3e0',
                                      color: '#e65100',
                                      fontWeight: 500,
                                      fontSize: '0.75rem',
                                      height: 24,
                                    }}
                                  />
                                  <Chip
                                    size="small"
                                    label={`${totalProtein.toFixed(0)}g protein`}
                                    sx={{
                                      bgcolor: '#f3e5f5',
                                      color: '#6a1b9a',
                                      fontWeight: 500,
                                      fontSize: '0.75rem',
                                      height: 24,
                                    }}
                                  />
                                </Box>
                              </Box>
                            </Box>
                          </AccordionSummary>
                          
                          <AccordionDetails
                            sx={{
                              p: 3,
                              pt: 2,
                              bgcolor: '#fafafa',
                            }}
                          >
                            <Grid container spacing={2}>
                              {mealTypeOrder.map((mealType) => {
                                const meal = dayMeals.find(m => m.mealType === mealType);
                                if (!meal) return null;

                                // Define meal type colors and icons
                                const mealConfig = {
                                  BREAKFAST: { color: '#ff9800', bgColor: '#fff3e0', emoji: '☀️' },
                                  LUNCH: { color: '#4caf50', bgColor: '#e8f5e9', emoji: '🍽️' },
                                  DINNER: { color: '#673ab7', bgColor: '#f3e5f5', emoji: '🌙' },
                                  SNACK: { color: '#ff5722', bgColor: '#fbe9e7', emoji: '🍎' },
                                };

                                const config = mealConfig[mealType as keyof typeof mealConfig];

                                return (
                                  <Grid item xs={12} sm={6} md={3} key={mealType}>
                                    <Card 
                                      sx={{ 
                                        height: '100%',
                                        borderRadius: 3,
                                        border: 'none',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                        transition: 'all 0.3s ease',
                                        overflow: 'hidden',
                                        '&:hover': {
                                          boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
                                          transform: 'translateY(-4px)',
                                        },
                                      }}
                                    >
                                      {/* Meal type header */}
                                      <Box
                                        sx={{
                                          bgcolor: config.bgColor,
                                          py: 1.5,
                                          px: 2,
                                          borderBottom: `2px solid ${config.color}`,
                                        }}
                                      >
                                        <Typography 
                                          variant="subtitle2" 
                                          sx={{ 
                                            color: config.color,
                                            fontWeight: 700,
                                            fontSize: '0.875rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                          }}
                                        >
                                          <span>{config.emoji}</span>
                                          {mealType}
                                        </Typography>
                                      </Box>
                                      
                                      {/* Meal content */}
                                      <Box sx={{ p: 2 }}>
                                        <Typography 
                                          variant="h6" 
                                          sx={{ 
                                            mb: 1.5, 
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            color: '#212121',
                                            lineHeight: 1.3,
                                          }}
                                        >
                                          {meal.name}
                                        </Typography>
                                        
                                        {meal.description && (
                                          <Typography 
                                            variant="caption" 
                                            sx={{ 
                                              display: 'block',
                                              mb: 1.5,
                                              color: 'text.secondary',
                                              lineHeight: 1.4,
                                            }}
                                          >
                                            {meal.description.length > 60 
                                              ? `${meal.description.substring(0, 60)}...` 
                                              : meal.description}
                                          </Typography>
                                        )}
                                        
                                        {/* Nutrition info */}
                                        <Box sx={{ 
                                          display: 'flex', 
                                          flexDirection: 'column',
                                          gap: 1,
                                        }}>
                                          {meal.calories && (
                                            <Box sx={{ 
                                              display: 'flex', 
                                              alignItems: 'center', 
                                              gap: 1,
                                              p: 1,
                                              bgcolor: '#fff3e0',
                                              borderRadius: 1.5,
                                            }}>
                                              <LocalFireDepartment sx={{ fontSize: 18, color: '#ff6f00' }} />
                                              <Typography variant="caption" sx={{ fontWeight: 600, color: '#e65100' }}>
                                                {meal.calories} calories
                                              </Typography>
                                            </Box>
                                          )}
                                          
                                          {(meal.prepTime || meal.cookTime) && (
                                            <Box sx={{ 
                                              display: 'flex', 
                                              alignItems: 'center', 
                                              gap: 1,
                                              p: 1,
                                              bgcolor: '#e3f2fd',
                                              borderRadius: 1.5,
                                            }}>
                                              <AccessTime sx={{ fontSize: 18, color: '#1976d2' }} />
                                              <Typography variant="caption" sx={{ fontWeight: 600, color: '#1565c0' }}>
                                                {(meal.prepTime || 0) + (meal.cookTime || 0)} minutes
                                              </Typography>
                                            </Box>
                                          )}
                                          
                                          {/* Macros */}
                                          {(meal.protein || meal.carbs || meal.fat) && (
                                            <Box sx={{ 
                                              display: 'flex', 
                                              gap: 1,
                                              mt: 0.5,
                                              flexWrap: 'wrap',
                                            }}>
                                              {meal.protein && (
                                                <Chip
                                                  label={`P: ${meal.protein}g`}
                                                  size="small"
                                                  sx={{
                                                    fontSize: '0.7rem',
                                                    height: 22,
                                                    bgcolor: '#f3e5f5',
                                                    color: '#6a1b9a',
                                                    fontWeight: 600,
                                                  }}
                                                />
                                              )}
                                              {meal.carbs && (
                                                <Chip
                                                  label={`C: ${meal.carbs}g`}
                                                  size="small"
                                                  sx={{
                                                    fontSize: '0.7rem',
                                                    height: 22,
                                                    bgcolor: '#e8f5e9',
                                                    color: '#2e7d32',
                                                    fontWeight: 600,
                                                  }}
                                                />
                                              )}
                                              {meal.fat && (
                                                <Chip
                                                  label={`F: ${meal.fat}g`}
                                                  size="small"
                                                  sx={{
                                                    fontSize: '0.7rem',
                                                    height: 22,
                                                    bgcolor: '#fce4ec',
                                                    color: '#c2185b',
                                                    fontWeight: 600,
                                                  }}
                                                />
                                              )}
                                            </Box>
                                          )}
                                        </Box>
                                      </Box>
                                    </Card>
                                  </Grid>
                                );
                              })}
                            </Grid>
                          </AccordionDetails>
                        </Accordion>
                      );
                    })}
                  </Box>
                </CardContent>
                <CardActions>
                  {!plan.isActive && (
                    <Button
                      onClick={() => handleSetActive(plan.id)}
                      color="primary"
                    >
                      Set as Active
                    </Button>
                  )}
                  <Button
                    onClick={() => handleGeneratePDF(plan.id, plan.name)}
                    disabled={pdfLoading === plan.id}
                    startIcon={pdfLoading === plan.id ? <CircularProgress size={16} /> : <GetApp />}
                  >
                    Download PDF
                  </Button>
                  <Button
                    onClick={() => handleGenerateCSV(plan.id, plan.name)}
                    disabled={csvLoading === plan.id}
                    startIcon={csvLoading === plan.id ? <CircularProgress size={16} /> : <GetApp />}
                    color="secondary"
                  >
                    Download CSV
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, planId: null })}
      >
        <DialogTitle>Delete Diet Plan</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this diet plan? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, planId: null })}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DietPlans;
