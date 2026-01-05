import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { DietPlanInput } from '../types';

// Modern Zod validation schema
const dietPlanSchema = z.object({
  name: z.string().min(1, 'Plan name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  weekStart: z.string()
    .min(1, 'Start date is required')
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime()) && parsedDate >= new Date(new Date().setHours(0, 0, 0, 0));
    }, 'Please select a valid date that is today or in the future'),
  customRequirements: z.string().optional(),
});

type DietPlanFormData = z.infer<typeof dietPlanSchema>;

const dietaryOptions = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo',
  'Low-Carb', 'Low-Fat', 'High-Protein', 'Mediterranean', 'Halal', 'Kosher',
  'Nut-Free', 'Soy-Free', 'Low-Sodium', 'Diabetic-Friendly'
];

const mealComplexityOptions = [
  'Quick & Simple (under 30 min)',
  'Moderate (30-60 min)',
  'Complex (60+ min)',
  'Mixed complexity'
];

const CreatePlan: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);

  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [activeStep, setActiveStep] = useState(0);
  const [complexity, setComplexity] = useState('');
  
  // Streaming state
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamProgress, setStreamProgress] = useState<{
    currentDay?: string;
    dayIndex?: number;
    totalDays?: number;
    message?: string;
    completedDays?: any[];
    allMeals?: any[];
  }>({});

  const steps = ['Plan Details', 'Preferences', 'Generate Plan'];

  // Modern React Hook Form with Zod validation
  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    watch,
    formState: { isSubmitting },
    trigger,
  } = useForm<DietPlanFormData>({
    resolver: zodResolver(dietPlanSchema),
    defaultValues: {
      name: '',
      description: '',
      weekStart: '',
      customRequirements: '',
    },
    mode: 'onChange',
  });

  // Watch form fields to reactively update button state
  const watchedFields = watch(['name', 'weekStart']);

  // Set default date after form initialization
  React.useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setValue('weekStart', today);
  }, [setValue]);

  // Ensure weekStart has a default value
  React.useEffect(() => {
    const currentWeekStart = getValues('weekStart');
    if (!currentWeekStart) {
      const today = new Date().toISOString().split('T')[0];
      setValue('weekStart', today);
    }
  }, [setValue, getValues]);

  // Simple validation check for required fields - now reactive to form changes
  const canSubmit = React.useMemo(() => {
    const [name, weekStart] = watchedFields;
    return Boolean(
      name?.trim() && 
      weekStart?.trim() && 
      !isSubmitting
    );
  }, [watchedFields, isSubmitting]);

  const onSubmit = async (data: DietPlanFormData) => {
    setError('');
    setSuccess('');
    setIsGenerating(true);
    setStreamProgress({});

    try {
      const planInput: DietPlanInput = {
        name: data.name,
        description: data.description || '',
        weekStart: new Date(data.weekStart).toISOString(),
        preferences: [...selectedPreferences, complexity].filter(Boolean),
        customRequirements: data.customRequirements || '',
      };

      const completedDays: any[] = [];
      let allMeals: any[] = [];

      // Use streaming API
      await apiService.generateDietPlanStream(planInput, (event) => {
        console.log('Stream event:', event);

        switch (event.type) {
          case 'start':
            setStreamProgress({
              totalDays: event.data.totalDays,
              message: 'Starting diet plan generation...'
            });
            break;

          case 'progress':
            setStreamProgress(prev => ({
              ...prev,
              currentDay: event.data.day,
              dayIndex: event.data.dayIndex,
              message: event.data.message
            }));
            break;

          case 'day_complete':
            completedDays.push({
              day: event.data.day,
              meals: event.data.meals
            });
            setStreamProgress(prev => ({
              ...prev,
              completedDays: [...completedDays]
            }));
            break;

          case 'plan_complete':
            allMeals = event.data.meals;
            setStreamProgress(prev => ({
              ...prev,
              allMeals,
              message: 'Saving diet plan...'
            }));
            break;

          case 'error':
            throw new Error(event.data.error);
        }
      });

      // Save the complete plan to database
      const result = await apiService.saveDietPlan(planInput, allMeals);
      
      if (result.success) {
        setSuccess('Diet plan generated and saved successfully!');
        setTimeout(() => {
          navigate('/diet-plans');
        }, 2000);
      } else {
        setError(result.error || 'Failed to save diet plan');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate diet plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreferenceToggle = React.useCallback((preference: string) => {
    setSelectedPreferences(prev => {
      const isSelected = prev.includes(preference);
      let newPrefs;
      
      if (isSelected) {
        newPrefs = prev.filter(p => p !== preference);
      } else {
        newPrefs = [...prev, preference];
      }
      
      return newPrefs;
    });
  }, []);

  const handleNext = async () => {
    if (activeStep === 0) {
      // Validate step 1 with React Hook Form
      const isStepValid = await trigger(['name', 'weekStart']);
      if (!isStepValid) {
        return;
      }
    }
    setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep(prev => Math.max(prev - 1, 0));
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                key="name-field"
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Plan Name"
                    placeholder="My Healthy Week, Summer Cut Plan, etc."
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                key="description-field"
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Description (Optional)"
                    multiline
                    rows={3}
                    placeholder="Describe your goals or any specific requirements..."
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                key="weekStart-field"
                name="weekStart"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Week Start Date"
                    type="date"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Dietary Preferences
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select any dietary restrictions or preferences you have:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {dietaryOptions.map((option) => {
                  const isSelected = selectedPreferences.includes(option);
                  return (
                    <Chip
                      key={option}
                      label={option}
                      clickable
                      variant={isSelected ? 'filled' : 'outlined'}
                      color={isSelected ? 'primary' : 'default'}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handlePreferenceToggle(option);
                      }}
                      sx={{ 
                        mb: 1,
                        cursor: 'pointer',
                        userSelect: 'none',
                        '&:hover': {
                          backgroundColor: isSelected 
                            ? 'primary.dark' 
                            : 'action.hover'
                        },
                        '&:active': {
                          transform: 'scale(0.95)'
                        }
                      }}
                    />
                  );
                })}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Meal Complexity</InputLabel>
                <Select
                  value={complexity}
                  label="Meal Complexity"
                  onChange={(e) => setComplexity(e.target.value)}
                >
                  {mealComplexityOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="customRequirements"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Custom Requirements (Optional)"
                    multiline
                    rows={4}
                    placeholder="Any specific foods you want included/excluded, cooking methods, cultural preferences, etc."
                  />
                )}
              />
            </Grid>
          </Grid>
        );

      case 2:
        const formValues = getValues(); // Get current form values directly
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            {!isGenerating ? (
              <>
                <Typography variant="h5" gutterBottom>
                  Ready to Generate Your Diet Plan!
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  We'll create a personalized weekly meal plan based on your preferences and requirements.
                  This may take a few moments.
                </Typography>
                
                <Paper variant="outlined" sx={{ p: 3, mb: 3, textAlign: 'left' }}>
                  <Typography variant="h6" gutterBottom>
                    Plan Summary:
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Name:</strong> {formValues.name}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Start Date:</strong> {
                      (() => {
                        const dateValue = formValues.weekStart;
                        if (!dateValue) {
                          return 'Not selected';
                        }
                        const date = new Date(dateValue);
                        if (isNaN(date.getTime())) {
                          return 'Invalid date';
                        }
                        return date.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        });
                      })()
                    }
                  </Typography>
                  {selectedPreferences.length > 0 && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Preferences:</strong> {selectedPreferences.join(', ')}
                    </Typography>
                  )}
                  {complexity && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Complexity:</strong> {complexity}
                    </Typography>
                  )}
                  {formValues.description && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Description:</strong> {formValues.description}
                    </Typography>
                  )}
                </Paper>
              </>
            ) : (
              <>
                <Typography variant="h5" gutterBottom>
                  Generating Your Diet Plan...
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  {streamProgress.message || 'Starting generation...'}
                </Typography>
                
                <Box sx={{ width: '100%', mb: 3 }}>
                  <CircularProgress 
                    variant={streamProgress.totalDays ? "determinate" : "indeterminate"}
                    value={streamProgress.totalDays ? ((streamProgress.dayIndex || 0) / streamProgress.totalDays) * 100 : undefined}
                    size={80}
                    sx={{ mb: 2 }}
                  />
                  {streamProgress.totalDays && (
                    <Typography variant="body2" color="text.secondary">
                      Day {(streamProgress.dayIndex || 0) + 1} of {streamProgress.totalDays}
                    </Typography>
                  )}
                </Box>

                {streamProgress.completedDays && streamProgress.completedDays.length > 0 && (
                  <Paper variant="outlined" sx={{ p: 3, textAlign: 'left', maxHeight: 400, overflow: 'auto' }}>
                    <Typography variant="h6" gutterBottom>
                      Generated Days:
                    </Typography>
                    {streamProgress.completedDays.map((dayData, index) => (
                      <Box key={index} sx={{ mb: 2, pb: 2, borderBottom: index < streamProgress.completedDays!.length - 1 ? '1px solid #e0e0e0' : 'none' }}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary">
                          {dayData.day}
                        </Typography>
                        <Box sx={{ pl: 2 }}>
                          {dayData.meals.map((meal: any, mealIndex: number) => (
                            <Typography key={mealIndex} variant="body2" sx={{ mb: 0.5 }}>
                              • {meal.mealType}: {meal.name}
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                    ))}
                  </Paper>
                )}
              </>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#212121', fontWeight: 700 }}>
          Create New Diet Plan
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Let our AI create a personalized weekly meal plan tailored to your preferences and goals.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          {/* Hidden Controllers to ensure all fields are registered */}
          <Box sx={{ display: 'none' }}>
            <Controller
              name="weekStart"
              control={control}
              render={({ field }) => (
                <input 
                  {...field} 
                  type="date"
                  value={field.value || ''}
                />
              )}
            />
          </Box>

          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0 || isGenerating}
            >
              Back
            </Button>

            <Box sx={{ flex: '1 1 auto' }} />

            {activeStep === steps.length - 1 ? (
              <Button
                type="submit"
                variant="contained"
                disabled={!canSubmit || isGenerating}
                sx={{
                  bgcolor: '#4ca6c9',
                  '&:hover': { bgcolor: '#3c89af' },
                  minWidth: 120,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: 'none',
                }}
              >
                {isGenerating ? (
                  <>
                    <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                    Generating...
                  </>
                ) : (
                  'Generate Plan'
                )}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{
                  bgcolor: '#4ca6c9',
                  '&:hover': { bgcolor: '#3c89af' },
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: 'none',
                }}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreatePlan;
