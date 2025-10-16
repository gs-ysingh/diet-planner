import React from 'react';
import { Box, LinearProgress, Typography, List, ListItem } from '@mui/material';
import { Check as CheckIcon, Clear as ClearIcon } from '@mui/icons-material';
import { PasswordStrength, getPasswordStrengthColor, getPasswordStrengthText } from '../../utils/passwordSecurity';

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength;
  password: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ strength, password }) => {
  if (!password) return null;

  const progressValue = (strength.score / 5) * 100;
  const strengthColor = getPasswordStrengthColor(strength.score);
  const strengthText = getPasswordStrengthText(strength.score);

  return (
    <Box sx={{ mt: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="caption" sx={{ mr: 1, minWidth: 60 }}>
          Strength:
        </Typography>
        <Box sx={{ flexGrow: 1, mr: 1 }}>
          <LinearProgress
            variant="determinate"
            value={progressValue}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: strengthColor,
                borderRadius: 3,
              },
            }}
          />
        </Box>
        <Typography
          variant="caption"
          sx={{
            color: strengthColor,
            fontWeight: 600,
            minWidth: 50,
          }}
        >
          {strengthText}
        </Typography>
      </Box>

      {strength.feedback.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            Password Requirements:
          </Typography>
          <List dense sx={{ py: 0 }}>
            {[
              'At least 8 characters',
              'One uppercase letter',
              'One lowercase letter', 
              'One number',
              'One special character'
            ].map((requirement, index) => {
              const isComplete = !strength.feedback.some((fb: string) => 
                (requirement.includes('8 characters') && fb.includes('8 characters')) ||
                (requirement.includes('uppercase') && fb.includes('uppercase')) ||
                (requirement.includes('lowercase') && fb.includes('lowercase')) ||
                (requirement.includes('number') && fb.includes('number')) ||
                (requirement.includes('special') && fb.includes('special'))
              );
              
              return (
                <ListItem key={index} sx={{ py: 0, px: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    {isComplete ? (
                      <CheckIcon sx={{ fontSize: 16, color: '#4caf50', mr: 1 }} />
                    ) : (
                      <ClearIcon sx={{ fontSize: 16, color: '#f44336', mr: 1 }} />
                    )}
                    <Typography
                      variant="caption"
                      sx={{
                        color: isComplete ? '#4caf50' : '#f44336',
                        textDecoration: isComplete ? 'line-through' : 'none',
                        opacity: isComplete ? 0.7 : 1,
                      }}
                    >
                      {requirement}
                    </Typography>
                  </Box>
                </ListItem>
              );
            })}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default PasswordStrengthIndicator;