// Modern CreatePlan component with React Hook Form + Zod + TanStack Query
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
import { motion, AnimatePresence } from 'framer-motion';
import { useGenerateDietPlan } from '../services/api-modern';
import { toast } from 'sonner';

// Modern Zod validation schema with comprehensive validation
const dietPlanSchema = z.object({
  name: z
    .string()
    .min(1, 'Plan name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_.,!]+$/, 'Invalid characters in plan name'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  weekStart: z
    .string()
    .min(1, 'Start date is required')
    .refine((date) => {
      const selected = new Date(date);
      const today = new Date();
      return selected >= today;
    }, 'Start date must be today or in the future'),
  customRequirements: z
    .string()
    .max(1000, 'Requirements must be less than 1000 characters')
    .optional(),
});

type DietPlanFormData = z.infer<typeof dietPlanSchema>;

const dietaryOptions = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo',
  'Low-Carb', 'Low-Fat', 'High-Protein', 'Mediterranean', 'Halal', 'Kosher',
  'Nut-Free', 'Soy-Free', 'Low-Sodium', 'Diabetic-Friendly', 'Raw Food',
  'Intermittent Fasting', 'Anti-Inflammatory', 'Heart-Healthy'
];

const mealComplexityOptions = [
  'Quick & Simple (under 30 min)',
  'Moderate (30-60 min)', 
  'Complex (60+ min)',
  'Mixed complexity'
];

const goalOptions = [
  'Weight Loss',
  'Weight Gain',
  'Muscle Building',
  'Maintenance',
  'Athletic Performance',
  'General Health'
];

// Animation variants
const stepVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 }
};

const CreatePlanModern: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [complexity, setComplexity] = useState('');
  const [goal, setGoal] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  const steps = ['Plan Details', 'Preferences & Goals', 'Review & Generate'];

  // Modern React Query mutation
  const generatePlanMutation = useGenerateDietPlan();

  // React Hook Form with Zod validation
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid, isDirty },
    trigger,
  } = useForm<DietPlanFormData>({
    resolver: zodResolver(dietPlanSchema),
    defaultValues: {
      name: '',
      description: '',
      weekStart: new Date().toISOString().split('T')[0],
      customRequirements: '',
    },
    mode: 'onChange',
  });

  const watchedValues = watch();

  // Form submission with modern error handling
  const onSubmit = async (data: DietPlanFormData) => {
    try {
      const planInput = {
        name: data.name,
        description: data.description || '',
        weekStart: new Date(data.weekStart).toISOString(),
        preferences: [...selectedPreferences, complexity, goal].filter(Boolean),
        customRequirements: data.customRequirements || '',
      };

      await generatePlanMutation.mutateAsync(planInput);
      
      toast.success('Diet plan generated successfully!', {
        description: 'Redirecting to your plans...',
      });
      
      setTimeout(() => navigate('/diet-plans'), 1500);
      
    } catch (error: any) {
      toast.error('Failed to generate diet plan', {
        description: error.message || 'Please try again',
      });
    }
  };

  const handlePreferenceToggle = (preference: string) => {
    setSelectedPreferences(prev =>
      prev.includes(preference)
        ? prev.filter(p => p !== preference)
        : [...prev, preference]
    );
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      const isStepValid = await trigger(['name', 'weekStart']);
      if (!isStepValid) return;
    }
    setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep(prev => Math.max(prev - 1, 0));
  };

  const renderStepContent = (step: number) => {
    const content = (() => {
      switch (step) {
        case 0:
          return (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Controller
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
                      InputProps={{
                        'aria-describedby': 'name-helper-text',
                      }}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Description (Optional)"
                      multiline
                      rows={3}
                      placeholder="Describe your goals or any specific requirements..."
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
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
                      InputLabelProps={{ shrink: true }}
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
                  Health Goals
                </Typography>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Primary Goal</InputLabel>
                  <Select
                    value={goal}
                    label="Primary Goal"
                    onChange={(e) => setGoal(e.target.value)}
                  >
                    {goalOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Dietary Preferences
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Select any dietary restrictions or preferences:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  {dietaryOptions.map((option) => (
                    <Chip
                      key={option}
                      label={option}
                      clickable
                      color={selectedPreferences.includes(option) ? 'primary' : 'default'}
                      onClick={() => handlePreferenceToggle(option)}
                      sx={{ 
                        mb: 1,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        }
                      }}
                    />
                  ))}
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth sx={{ mb: 2 }}>
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
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Custom Requirements (Optional)"
                      multiline
                      rows={4}
                      placeholder="Any specific foods you want included/excluded, cooking methods, cultural preferences, allergies, etc."
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          );

        case 2:
          return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h5" gutterBottom>
                Ready to Generate Your Personalized Diet Plan! 🍽️
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Our AI will create a customized weekly meal plan tailored to your preferences.
                This may take a few moments.
              </Typography>
              
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 3, 
                  mb: 3, 
                  textAlign: 'left',
                  background: 'linear-gradient(145deg, #f5f5f5 0%, #ffffff 100%)'
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ color: '#2e7d32', fontWeight: 600 }}>
                  Plan Summary:
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Name:</strong> {watchedValues.name}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Start Date:</strong> {new Date(watchedValues.weekStart).toDateString()}
                </Typography>
                {goal && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Goal:</strong> {goal}
                  </Typography>
                )}
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
                {watchedValues.description && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Description:</strong> {watchedValues.description}
                  </Typography>
                )}
              </Paper>

              {generatePlanMutation.error && (
                <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>
                  {(generatePlanMutation.error as any)?.message || 'Failed to generate plan'}
                </Alert>
              )}
            </Box>
          );

        default:
          return null;
      }
    })();

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={stepVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          {content}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper sx={{ p: 4, borderRadius: 2, boxShadow: 3 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{ 
              color: '#2e7d32', 
              fontWeight: 600,
              textAlign: 'center',
              mb: 2
            }}
          >
            Create New Diet Plan
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ mb: 4, textAlign: 'center' }}
          >
            Let our AI create a personalized weekly meal plan tailored to your preferences and goals.
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel 
                  sx={{
                    '& .MuiStepLabel-label': {
                      fontWeight: index === activeStep ? 600 : 400,
                    }
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {renderStepContent(activeStep)}

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mt: 4,
              pt: 3,
              borderTop: '1px solid #e0e0e0'
            }}>
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={activeStep === 0}
                sx={{ minWidth: 100 }}
              >
                Back
              </Button>

              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                alignItems: 'center',
                fontSize: '0.875rem',
                color: 'text.secondary'
              }}>
                {isDirty && !isValid && (
                  <Typography variant="caption" color="error">
                    Please fill in all required fields
                  </Typography>
                )}
                Step {activeStep + 1} of {steps.length}
              </Box>

              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={generatePlanMutation.isPending || !isValid}
                  sx={{
                    bgcolor: '#2e7d32',
                    '&:hover': { bgcolor: '#1b5e20' },
                    minWidth: 140,
                    py: 1.5,
                  }}
                >
                  {generatePlanMutation.isPending ? (
                    <>
                      <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                      Generating...
                    </>
                  ) : (
                    '✨ Generate Plan'
                  )}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={activeStep === 0 && (!watchedValues.name || !watchedValues.weekStart)}
                  sx={{
                    bgcolor: '#2e7d32',
                    '&:hover': { bgcolor: '#1b5e20' },
                    minWidth: 100,
                  }}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default CreatePlanModern;