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
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { DietPlanInput } from '../types';

const validationSchema = yup.object({
  name: yup.string().required('Plan name is required'),
  weekStart: yup.string().required('Start date is required'),
});

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [activeStep, setActiveStep] = useState(0);
  const [complexity, setComplexity] = useState('');

  const steps = ['Plan Details', 'Preferences', 'Generate Plan'];

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      weekStart: new Date().toISOString().split('T')[0], // Format: YYYY-MM-DD
      customRequirements: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      setSuccess('');

      try {
        const planInput: DietPlanInput = {
          name: values.name,
          description: values.description,
          weekStart: new Date(values.weekStart).toISOString(),
          preferences: [...selectedPreferences, complexity].filter(Boolean),
          customRequirements: values.customRequirements,
        };

        const result = await apiService.generateDietPlan(planInput);
        
        if (result.success) {
          setSuccess('Diet plan generated successfully!');
          setTimeout(() => {
            navigate('/diet-plans');
          }, 2000);
        } else {
          setError(result.error || 'Failed to generate diet plan');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to generate diet plan');
      } finally {
        setLoading(false);
      }
    },
  });

  const handlePreferenceToggle = (preference: string) => {
    setSelectedPreferences(prev =>
      prev.includes(preference)
        ? prev.filter(p => p !== preference)
        : [...prev, preference]
    );
  };

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate step 1
      if (!formik.values.name || !formik.values.weekStart) {
        formik.setTouched({ name: true, weekStart: true });
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
              <TextField
                fullWidth
                id="name"
                label="Plan Name"
                name="name"
                placeholder="My Healthy Week, Summer Cut Plan, etc."
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                label="Description (Optional)"
                name="description"
                multiline
                rows={3}
                placeholder="Describe your goals or any specific requirements..."
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="weekStart"
                label="Week Start Date"
                name="weekStart"
                type="date"
                value={formik.values.weekStart}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.weekStart && Boolean(formik.errors.weekStart)}
                helperText={formik.touched.weekStart && formik.errors.weekStart}
                InputLabelProps={{
                  shrink: true,
                }}
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
                {dietaryOptions.map((option) => (
                  <Chip
                    key={option}
                    label={option}
                    clickable
                    color={selectedPreferences.includes(option) ? 'primary' : 'default'}
                    onClick={() => handlePreferenceToggle(option)}
                    sx={{ mb: 1 }}
                  />
                ))}
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
              <TextField
                fullWidth
                id="customRequirements"
                label="Custom Requirements (Optional)"
                name="customRequirements"
                multiline
                rows={4}
                placeholder="Any specific foods you want included/excluded, cooking methods, cultural preferences, etc."
                value={formik.values.customRequirements}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
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
                <strong>Name:</strong> {formik.values.name}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Start Date:</strong> {new Date(formik.values.weekStart).toDateString()}
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
              {formik.values.description && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Description:</strong> {formik.values.description}
                </Typography>
              )}
            </Paper>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#2e7d32', fontWeight: 600 }}>
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

        <Box component="form" onSubmit={formik.handleSubmit}>
          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0}
            >
              Back
            </Button>

            <Box sx={{ flex: '1 1 auto' }} />

            {activeStep === steps.length - 1 ? (
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  bgcolor: '#2e7d32',
                  '&:hover': { bgcolor: '#1b5e20' },
                  minWidth: 120,
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Generate Plan'
                )}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{
                  bgcolor: '#2e7d32',
                  '&:hover': { bgcolor: '#1b5e20' },
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
