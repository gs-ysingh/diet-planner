import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiService } from '../services/api';
import { CheckCircleOutline, ErrorOutline } from '@mui/icons-material';

const EmailVerification: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError('Invalid verification token');
        setVerifying(false);
        return;
      }

      try {
        const response = await apiService.verifyEmail(token);
        setSuccess(true);
        
        // Auto-login the user after successful verification
        localStorage.setItem('token', response.token);
        
        // Wait a moment before redirecting
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } catch (err: any) {
        setError(err.message || 'Email verification failed');
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  if (!token) {
    return (
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
            <Box sx={{ textAlign: 'center' }}>
              <ErrorOutline sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
              <Alert severity="error">
                <Typography variant="body1">
                  Invalid or missing verification token.
                </Typography>
              </Alert>
              <Button
                fullWidth
                variant="contained"
                onClick={() => navigate('/login')}
                sx={{
                  mt: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                Go to Login
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
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
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
          }}
        >
          {verifying ? (
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress size={64} sx={{ mb: 3, color: '#667eea' }} />
              <Typography variant="h5" gutterBottom>
                Verifying your email...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please wait while we verify your email address
              </Typography>
            </Box>
          ) : success ? (
            <Box sx={{ textAlign: 'center', width: '100%' }}>
              <CheckCircleOutline
                sx={{
                  fontSize: 80,
                  color: 'success.main',
                  mb: 2,
                }}
              />
              <Typography
                variant="h4"
                gutterBottom
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700,
                }}
              >
                Email Verified! 🎉
              </Typography>
              <Alert severity="success" sx={{ mt: 2, mb: 3 }}>
                <Typography variant="body1">
                  Your email has been successfully verified. Redirecting you to the dashboard...
                </Typography>
              </Alert>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', width: '100%' }}>
              <ErrorOutline
                sx={{
                  fontSize: 80,
                  color: 'error.main',
                  mb: 2,
                }}
              />
              <Typography variant="h5" gutterBottom color="error">
                Verification Failed
              </Typography>
              <Alert severity="error" sx={{ mt: 2, mb: 3 }}>
                {error}
              </Alert>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                The verification link may have expired or is invalid.
              </Typography>
              <Button
                fullWidth
                variant="contained"
                onClick={() => navigate('/login')}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #66398d 100%)',
                  },
                }}
              >
                Go to Login
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default EmailVerification;
