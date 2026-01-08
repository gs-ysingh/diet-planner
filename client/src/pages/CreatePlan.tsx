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
import {
  trackCreatePlanStart,
  trackCreatePlanSuccess,
  trackCreatePlanError,
  trackPlanGenerationProgress,
  trackButtonClick,
} from '../utils/analytics';
import { useEngagementTracking } from '../hooks/useAnalytics';

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

const locationOptions = [
  'Indian',
  'Chinese',
  'Japanese',
  'Thai',
  'Korean',
  'Vietnamese',
  'Malaysian',
  'Indonesian',
  'Filipino',
  'Italian',
  'French',
  'Spanish',
  'Greek',
  'Turkish',
  'Mexican',
  'Brazilian',
  'Argentinian',
  'Peruvian',
  'American',
  'British',
  'German',
  'Portuguese',
  'Lebanese',
  'Moroccan',
  'Ethiopian',
  'Nigerian',
  'South African',
  'Caribbean',
  'Middle Eastern',
  'Mediterranean',
  'Scandinavian',
  'Russian',
  'Polish',
  'Ukrainian',
  'Australian',
  'New Zealand',
  'Pakistani',
  'Bangladeshi',
  'Sri Lankan',
  'Nepalese',
  'Tibetan',
  'Burmese',
  'Singaporean',
  'Cambodian',
  'Laotian',
  'Mongolian',
  'Persian/Iranian',
  'Afghan',
  'Arabian',
  'Egyptian',
  'Tunisian',
  'Algerian',
  'Kenyan',
  'Jamaican',
  'Cuban',
  'Puerto Rican',
  'Dominican',
  'Colombian',
  'Venezuelan',
  'Chilean',
  'Ecuadorian',
  'Bolivian',
  'Uruguayan',
  'Costa Rican',
  'Guatemalan',
  'Salvadoran',
  'Honduran',
  'Nicaraguan',
  'Panamanian',
  'Belgian',
  'Dutch',
  'Swiss',
  'Austrian',
  'Hungarian',
  'Czech',
  'Romanian',
  'Bulgarian',
  'Croatian',
  'Serbian',
  'Bosnian',
  'Albanian',
  'Macedonian',
  'Slovenian',
  'Slovak',
  'Lithuanian',
  'Latvian',
  'Estonian',
  'Finnish',
  'Swedish',
  'Norwegian',
  'Danish',
  'Icelandic',
  'Irish',
  'Scottish',
  'Welsh',
  'Canadian',
  'Cajun/Creole',
  'Soul Food',
  'Tex-Mex',
  'Global/Fusion'
];

const mealTypeOptions = [
  'Traditional',
  'Modern Fusion',
  'Plant-Based',
  'Comfort Food',
  'Gourmet',
  'Street Food',
  'Home-Style Cooking',
  'Quick & Easy',
  'Meal Prep Friendly',
  'Restaurant-Style'
];

const CreatePlan: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);

  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [activeStep, setActiveStep] = useState(0);
  const [complexity, setComplexity] = useState('');
  const [location, setLocation] = useState('');
  const [mealType, setMealType] = useState('');
  
  // Track engagement time on this page
  useEngagementTracking('Create Plan Page');
  
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
    setStreamProgress({ 
      message: 'Initializing AI generation...',
      completedDays: [],
      allMeals: []
    });

    // Track that plan creation has started
    trackCreatePlanStart(data.name);

    try {
      const planInput: DietPlanInput = {
        name: data.name,
        description: data.description || '',
        weekStart: new Date(data.weekStart).toISOString(),
        preferences: [...selectedPreferences, complexity, location && `Location: ${location}`, mealType && `Meal Type: ${mealType}`].filter(Boolean),
        customRequirements: data.customRequirements || '',
      };

      // Use streaming API for progressive meal generation
      trackPlanGenerationProgress('start', undefined);
      
      const completedMeals: any[] = [];
      const completedDays: string[] = [];

      await apiService.generateDietPlanStream(planInput, (event) => {
        console.log('Stream event:', event);

        if (event.type === 'start') {
          setStreamProgress({
            message: 'Starting diet plan generation...',
            totalDays: event.data.totalDays,
            dayIndex: 0,
            completedDays: [],
            allMeals: []
          });
          trackPlanGenerationProgress('start', undefined);
        }

        if (event.type === 'progress') {
          setStreamProgress(prev => ({
            ...prev,
            currentDay: event.data.day,
            dayIndex: event.data.dayIndex,
            totalDays: event.data.totalDays,
            message: event.data.message || `Generating meals for ${event.data.day}...`,
          }));
          trackPlanGenerationProgress('day_start', event.data.day);
        }

        if (event.type === 'meal_streaming') {
          setStreamProgress(prev => ({
            ...prev,
            currentDay: event.data.day,
            message: event.data.message || `Generating meals for ${event.data.day}...`,
          }));
        }

        if (event.type === 'day_complete') {
          const newMeals = event.data.meals;
          completedMeals.push(...newMeals);
          completedDays.push(event.data.day);

          setStreamProgress(prev => ({
            ...prev,
            completedDays: [...completedDays],
            allMeals: [...completedMeals],
            message: `✓ ${event.data.day} complete! (${completedDays.length}/${event.data.totalDays} days)`,
          }));
          trackPlanGenerationProgress('day_complete', event.data.day);
        }

        if (event.type === 'plan_complete') {
          const allMeals = event.data.meals;
          
          setStreamProgress(prev => ({
            ...prev,
            message: 'Saving your diet plan...',
            allMeals: allMeals,
          }));

          // Save the generated plan to database
          trackPlanGenerationProgress('saving', undefined);
          apiService.saveDietPlan(planInput, allMeals)
            .then(result => {
              if (result.success) {
                trackCreatePlanSuccess(data.name, planInput.preferences);
                trackPlanGenerationProgress('plan_complete', undefined);
                
                setSuccess('Diet plan generated and saved successfully!');
                setTimeout(() => {
                  navigate('/diet-plans');
                }, 2000);
              } else {
                throw new Error(result.error || 'Failed to save diet plan');
              }
            })
            .catch(saveError => {
              trackCreatePlanError(saveError.message || 'Failed to save diet plan');
              setError(saveError.message || 'Failed to save diet plan');
            })
            .finally(() => {
              setIsGenerating(false);
            });
        }
      });

    } catch (err: any) {
      // Track error
      trackCreatePlanError(err.message || 'Failed to generate diet plan');
      setError(err.message || 'Failed to generate diet plan');
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
        // Track when a preference is selected
        trackButtonClick(`Preference: ${preference}`, 'Create Plan - Step 2');
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
    
    // Track navigation between steps
    trackButtonClick(`Next Step ${activeStep + 1}`, 'Create Plan Form');
    
    setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    trackButtonClick(`Back to Step ${activeStep - 1}`, 'Create Plan Form');
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
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Location/Cuisine Region</InputLabel>
                <Select
                  value={location}
                  label="Location/Cuisine Region"
                  onChange={(e) => {
                    setLocation(e.target.value);
                    trackButtonClick(`Location: ${e.target.value}`, 'Create Plan - Step 2');
                  }}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {locationOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Meal Style</InputLabel>
                <Select
                  value={mealType}
                  label="Meal Style"
                  onChange={(e) => {
                    setMealType(e.target.value);
                    trackButtonClick(`Meal Style: ${e.target.value}`, 'Create Plan - Step 2');
                  }}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {mealTypeOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Meal Complexity</InputLabel>
                <Select
                  value={complexity}
                  label="Meal Complexity"
                  onChange={(e) => setComplexity(e.target.value)}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
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
                  {location && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Location/Cuisine:</strong> {location}
                    </Typography>
                  )}
                  {mealType && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Meal Style:</strong> {mealType}
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
                
                <Box sx={{ width: '100%', mb: 3, textAlign: 'center' }}>
                  <CircularProgress 
                    variant={streamProgress.totalDays ? "determinate" : "indeterminate"}
                    value={streamProgress.totalDays ? (((streamProgress.dayIndex || 0) + 1) / streamProgress.totalDays) * 100 : undefined}
                    size={80}
                    sx={{ mb: 2 }}
                  />
                  
                  {streamProgress.totalDays && (
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      Day {(streamProgress.dayIndex || 0) + 1} of {streamProgress.totalDays}
                      {' '}
                      ({Math.round((((streamProgress.dayIndex || 0) + 1) / streamProgress.totalDays) * 100)}%)
                    </Typography>
                  )}
                  
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    {streamProgress.message || 'Generating your personalized diet plan...'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {streamProgress.message?.includes('Generating') && !streamProgress.message?.includes('complete') ? (
                      <>⚡ Streaming from AI... This is faster than before!</>
                    ) : (
                      <>Please don't close this page.</>
                    )}
                  </Typography>
                </Box>

                {/* Display completed days */}
                {streamProgress.completedDays && streamProgress.completedDays.length > 0 && (
                  <Paper variant="outlined" sx={{ p: 3, mt: 3, maxHeight: '400px', overflow: 'auto', textAlign: 'left' }}>
                    <Typography variant="h6" gutterBottom sx={{ color: 'success.main', display: 'flex', alignItems: 'center' }}>
                      ✓ Completed Days ({streamProgress.completedDays.length}/{streamProgress.totalDays || 7})
                    </Typography>
                    
                    {streamProgress.completedDays.map((day: string, index: number) => {
                      const dayMeals = (streamProgress.allMeals || []).filter((meal: any) => meal.day === day);
                      
                      // Sort meals in the correct order: BREAKFAST, LUNCH, SNACK, DINNER
                      const mealOrder = ['BREAKFAST', 'LUNCH', 'SNACK', 'DINNER'];
                      const sortedDayMeals = dayMeals.sort((a: any, b: any) => 
                        mealOrder.indexOf(a.mealType) - mealOrder.indexOf(b.mealType)
                      );
                      
                      return (
                        <Box key={day} sx={{ mb: 3, pb: 2, borderBottom: index < streamProgress.completedDays!.length - 1 ? '1px solid #e0e0e0' : 'none' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>
                            {day}
                          </Typography>
                          <Grid container spacing={1}>
                            {sortedDayMeals.map((meal: any, mealIdx: number) => (
                              <Grid item xs={12} sm={6} key={mealIdx}>
                                <Box sx={{ 
                                  p: 1.5, 
                                  bgcolor: 'grey.50', 
                                  borderRadius: 1,
                                  border: '1px solid',
                                  borderColor: 'grey.200'
                                }}>
                                  <Typography variant="caption" sx={{ 
                                    color: 'primary.main', 
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    fontSize: '0.7rem'
                                  }}>
                                    {meal.mealType}
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                                    {meal.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                    {meal.calories} cal • {meal.protein}g protein
                                  </Typography>
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      );
                    })}
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
