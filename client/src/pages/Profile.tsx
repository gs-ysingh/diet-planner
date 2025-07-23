import React, { useState, useEffect } from 'react';
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
  MenuItem,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { Gender, Goal, ActivityLevel } from '../types';

const validationSchema = yup.object({
  name: yup.string().required('Name is required'),
  age: yup.number().positive('Age must be positive').integer('Age must be an integer'),
  weight: yup.number().positive('Weight must be positive'),
  height: yup.number().positive('Height must be positive'),
});

const dietaryOptions = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo',
  'Low-Carb', 'Low-Fat', 'High-Protein', 'Mediterranean', 'Halal', 'Kosher'
];

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      setSelectedPreferences(user.preferences || []);
    }
  }, [user]);

  const formik = useFormik({
    initialValues: {
      name: user?.name || '',
      age: user?.age?.toString() || '',
      weight: user?.weight?.toString() || '',
      height: user?.height?.toString() || '',
      gender: user?.gender || '',
      nationality: user?.nationality || '',
      goal: user?.goal || '',
      activityLevel: user?.activityLevel || '',
    },
    enableReinitialize: true,
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      setSuccess('');

      try {
        const updateData = {
          name: values.name,
          age: values.age ? parseInt(values.age) : undefined,
          weight: values.weight ? parseFloat(values.weight) : undefined,
          height: values.height ? parseFloat(values.height) : undefined,
          gender: values.gender as Gender || undefined,
          nationality: values.nationality || undefined,
          goal: values.goal as Goal || undefined,
          activityLevel: values.activityLevel as ActivityLevel || undefined,
          preferences: selectedPreferences,
        };

        await updateUser(updateData);
        setSuccess('Profile updated successfully!');
      } catch (err: any) {
        setError(err.message || 'Failed to update profile');
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

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6">Loading profile...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#2e7d32', fontWeight: 600 }}>
          Profile Settings
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Update your personal information to get more accurate diet recommendations.
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

        <Box component="form" onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="name"
                label="Full Name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
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
              <Typography variant="h6" gutterBottom>
                Dietary Preferences
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select your dietary preferences and restrictions:
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

          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                bgcolor: '#2e7d32',
                '&:hover': { bgcolor: '#1b5e20' },
                px: 4,
                py: 1.5,
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Update Profile'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;
