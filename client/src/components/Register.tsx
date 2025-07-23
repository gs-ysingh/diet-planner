import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Link,
  Alert,
  CircularProgress,
  Grid,
  MenuItem,
  Chip,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Gender, Goal, ActivityLevel } from '../types';

const validationSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'Password should be at least 6 characters').required('Password is required'),
  age: yup.number().positive('Age must be positive').integer('Age must be an integer'),
  weight: yup.number().positive('Weight must be positive'),
  height: yup.number().positive('Height must be positive'),
});

const dietaryOptions = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo',
  'Low-Carb', 'Low-Fat', 'High-Protein', 'Mediterranean', 'Halal', 'Kosher'
];

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      age: '',
      weight: '',
      height: '',
      gender: '',
      nationality: '',
      goal: '',
      activityLevel: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      try {
        const registrationData = {
          ...values,
          age: values.age ? parseInt(values.age) : undefined,
          weight: values.weight ? parseFloat(values.weight) : undefined,
          height: values.height ? parseFloat(values.height) : undefined,
          gender: values.gender as Gender || undefined,
          goal: values.goal as Goal || undefined,
          activityLevel: values.activityLevel as ActivityLevel || undefined,
          preferences: selectedPreferences,
        };
        await register(registrationData);
        navigate('/dashboard');
      } catch (err: any) {
        setError(err.message || 'Registration failed');
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

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 4,
          marginBottom: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h4" sx={{ mb: 2, color: '#2e7d32' }}>
            Create Your Account
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
            Join us to start your personalized nutrition journey
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="name"
                  label="Full Name"
                  name="name"
                  autoComplete="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  id="age"
                  label="Age"
                  name="age"
                  type="number"
                  value={formik.values.age}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.age && Boolean(formik.errors.age)}
                  helperText={formik.touched.age && formik.errors.age}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  id="weight"
                  label="Weight (kg)"
                  name="weight"
                  type="number"
                  value={formik.values.weight}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.weight && Boolean(formik.errors.weight)}
                  helperText={formik.touched.weight && formik.errors.weight}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  id="height"
                  label="Height (cm)"
                  name="height"
                  type="number"
                  value={formik.values.height}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.height && Boolean(formik.errors.height)}
                  helperText={formik.touched.height && formik.errors.height}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  id="gender"
                  label="Gender"
                  name="gender"
                  value={formik.values.gender}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <MenuItem value="">Select Gender</MenuItem>
                  <MenuItem value={Gender.MALE}>Male</MenuItem>
                  <MenuItem value={Gender.FEMALE}>Female</MenuItem>
                  <MenuItem value={Gender.OTHER}>Other</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="nationality"
                  label="Nationality"
                  name="nationality"
                  value={formik.values.nationality}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  id="goal"
                  label="Fitness Goal"
                  name="goal"
                  value={formik.values.goal}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <MenuItem value="">Select Goal</MenuItem>
                  <MenuItem value={Goal.WEIGHT_LOSS}>Weight Loss</MenuItem>
                  <MenuItem value={Goal.WEIGHT_GAIN}>Weight Gain</MenuItem>
                  <MenuItem value={Goal.MUSCLE_GAIN}>Muscle Gain</MenuItem>
                  <MenuItem value={Goal.MAINTENANCE}>Maintenance</MenuItem>
                  <MenuItem value={Goal.ATHLETIC_PERFORMANCE}>Athletic Performance</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  id="activityLevel"
                  label="Activity Level"
                  name="activityLevel"
                  value={formik.values.activityLevel}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <MenuItem value="">Select Activity Level</MenuItem>
                  <MenuItem value={ActivityLevel.SEDENTARY}>Sedentary</MenuItem>
                  <MenuItem value={ActivityLevel.LIGHTLY_ACTIVE}>Lightly Active</MenuItem>
                  <MenuItem value={ActivityLevel.MODERATELY_ACTIVE}>Moderately Active</MenuItem>
                  <MenuItem value={ActivityLevel.VERY_ACTIVE}>Very Active</MenuItem>
                  <MenuItem value={ActivityLevel.EXTREMELY_ACTIVE}>Extremely Active</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Dietary Preferences (Optional)
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
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
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                bgcolor: '#2e7d32',
                '&:hover': { bgcolor: '#1b5e20' },
                py: 1.5,
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link
                component="button"
                variant="body2"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/login');
                }}
                sx={{ color: '#2e7d32' }}
              >
                Already have an account? Sign In
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
