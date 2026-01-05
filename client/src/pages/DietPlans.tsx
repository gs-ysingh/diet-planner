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
  Edit,
  Restaurant,
  CalendarToday,
  ExpandMore,
  AccessTime,
  LocalFireDepartment,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { DietPlan, DayOfWeek, MealType } from '../types';

const DietPlans: React.FC = () => {
  const navigate = useNavigate();
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; planId: string | null }>({
    open: false,
    planId: null,
  });
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchDietPlans();
  }, []);

  const fetchDietPlans = async () => {
    try {
      const plans = await apiService.getAllDietPlans();
      setDietPlans(plans);
    } catch (err: any) {
      setError('Failed to load diet plans');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetActive = async (planId: string) => {
    try {
      await apiService.setActiveDietPlan(planId);
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
    MealType.DINNER,
    MealType.SNACK,
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
          My Diet Plans
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/create-plan')}
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

      {dietPlans.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Restaurant sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No Diet Plans Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Create your first AI-powered diet plan to get started.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/create-plan')}
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
      ) : (
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
                      >
                        {pdfLoading === plan.id ? (
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

                  {/* Week Overview */}
                  <Box sx={{ mb: 2 }}>
                    {daysOfWeek.map((day) => {
                      const dayMeals = getMealsByDay(plan, day);
                      if (dayMeals.length === 0) return null;

                      return (
                        <Accordion key={day} sx={{ mb: 1 }}>
                          <AccordionSummary
                            expandIcon={<ExpandMore />}
                            sx={{ bgcolor: '#f5f5f5' }}
                          >
                            <Typography sx={{ fontWeight: 500 }}>
                              {day.charAt(0) + day.slice(1).toLowerCase()}
                            </Typography>
                            <Typography sx={{ ml: 2, color: 'text.secondary' }}>
                              {dayMeals.length} meals
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Grid container spacing={2}>
                              {mealTypeOrder.map((mealType) => {
                                const meal = dayMeals.find(m => m.mealType === mealType);
                                if (!meal) return null;

                                return (
                                  <Grid item xs={12} sm={6} md={3} key={mealType}>
                                    <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
                                      <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                                        {mealType}
                                      </Typography>
                                      <Typography variant="h6" sx={{ mb: 1, fontSize: '1rem' }}>
                                        {meal.name}
                                      </Typography>
                                      {meal.calories && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                          <LocalFireDepartment sx={{ fontSize: 16, color: '#ff6f00' }} />
                                          <Typography variant="caption">
                                            {meal.calories} cal
                                          </Typography>
                                        </Box>
                                      )}
                                      {(meal.prepTime || meal.cookTime) && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                          <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                                          <Typography variant="caption" color="text.secondary">
                                            {(meal.prepTime || 0) + (meal.cookTime || 0)} min
                                          </Typography>
                                        </Box>
                                      )}
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
