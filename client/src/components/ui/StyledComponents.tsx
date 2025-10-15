import React from 'react';
import { styled, Box, BoxProps, Card, CardProps, Button, ButtonProps, CircularProgress } from '@mui/material';
import { motion, MotionProps } from 'framer-motion';
import { gradients, colors, animations } from '../../theme/dietPlannerTheme';

// Animated Box Component
export const AnimatedBox = styled(motion.div)<BoxProps & MotionProps>`
  display: flex;
  flex-direction: column;
`;

// Glass Morphism Container
export const GlassContainer = styled(Box)(({ theme }) => ({
  background: gradients.glass,
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  padding: theme.spacing(3),
}));

// Enhanced Card with hover effects
export const EnhancedCard = styled(Card)<CardProps>(({ theme }) => ({
  borderRadius: 20,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(10px)',
  background: gradients.glass,
  transition: `all 0.3s ${animations.easeInOut}`,
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
  },
}));

// Gradient Button
export const GradientButton = styled(Button)<ButtonProps>(({ theme, variant, color }) => {
  const getGradient = () => {
    if (color === 'secondary') return gradients.secondary;
    return gradients.primary;
  };

  return {
    borderRadius: 12,
    fontWeight: 600,
    fontSize: '0.875rem',
    padding: '12px 24px',
    boxShadow: 'none',
    transition: `all 0.3s ${animations.easeInOut}`,
    textTransform: 'none',
    background: variant === 'contained' ? getGradient() : 'transparent',
    '&:hover': {
      boxShadow: `0 8px 25px ${color === 'secondary' ? colors.secondary[500] : colors.primary[500]}30`,
      transform: 'translateY(-2px)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  };
});

// Feature Icon Container
export const FeatureIcon = styled(Box)(({ theme }) => ({
  width: 64,
  height: 64,
  margin: '0 auto 20px',
  background: gradients.primary,
  borderRadius: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 28,
  color: 'white',
  transition: `all 0.3s ${animations.easeInOut}`,
  '&:hover': {
    transform: 'scale(1.05) rotate(5deg)',
  },
}));

// Loading Spinner Component
interface LoadingSpinnerProps {
  size?: number;
  color?: 'primary' | 'secondary';
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 40, 
  color = 'primary', 
  text = 'Loading...' 
}) => (
  <Box 
    display="flex" 
    flexDirection="column" 
    alignItems="center" 
    justifyContent="center" 
    gap={2}
    p={4}
  >
    <CircularProgress 
      size={size} 
      color={color}
      sx={{
        animation: 'spin 1s linear infinite',
        '@keyframes spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      }}
    />
    {text && (
      <Box 
        component="span" 
        sx={{ 
          color: 'text.secondary', 
          fontWeight: 500,
          fontSize: '0.875rem'
        }}
      >
        {text}
      </Box>
    )}
  </Box>
);

// Animated Counter Component
interface AnimatedCounterProps {
  from: number;
  to: number;
  duration?: number;
  suffix?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ 
  from, 
  to, 
  duration = 2, 
  suffix = '' 
}) => {
  const [count, setCount] = React.useState(from);

  React.useEffect(() => {
    const increment = (to - from) / (duration * 60); // 60fps
    const timer = setInterval(() => {
      setCount(prev => {
        const next = prev + increment;
        if (next >= to) {
          clearInterval(timer);
          return to;
        }
        return next;
      });
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [from, to, duration]);

  return (
    <Box
      component="span"
      sx={{
        fontSize: '2.5rem',
        fontWeight: 700,
        color: 'primary.main',
        fontFamily: 'monospace',
      }}
    >
      {Math.floor(count)}{suffix}
    </Box>
  );
};

// Gradient Text Component
export const GradientText = styled(Box)(({ theme }) => ({
  background: gradients.primary,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  fontWeight: 700,
}));

// Hero Section Container
export const HeroContainer = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(10, 2.5),
  background: 'linear-gradient(135deg, rgba(22, 160, 133, 0.1) 0%, rgba(243, 156, 18, 0.1) 100%)',
  borderRadius: 30,
  margin: theme.spacing(2.5),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><defs><radialGradient id="a" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%2316a085" stop-opacity="0.1"/><stop offset="100%" stop-color="%2316a085" stop-opacity="0"/></radialGradient></defs><circle cx="200" cy="200" r="100" fill="url(%23a)"/><circle cx="800" cy="300" r="150" fill="url(%23a)"/><circle cx="400" cy="700" r="120" fill="url(%23a)"/></svg>')`,
    opacity: 0.5,
    pointerEvents: 'none',
  },
}));

// Floating Action Button
export const FloatingActionButton = styled(Button)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(4),
  right: theme.spacing(4),
  borderRadius: '50%',
  width: 56,
  height: 56,
  minWidth: 'unset',
  background: gradients.primary,
  color: 'white',
  boxShadow: '0 8px 25px rgba(22, 160, 133, 0.3)',
  zIndex: 1000,
  transition: `all 0.3s ${animations.easeInOut}`,
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: '0 12px 35px rgba(22, 160, 133, 0.4)',
  },
}));

// Status Badge Component
interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, children }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success': return colors.primary[500];
      case 'warning': return colors.secondary[500];
      case 'error': return '#e74c3c';
      case 'info': return '#3498db';
      default: return colors.neutral[500];
    }
  };

  return (
    <Box
      component="span"
      sx={{
        backgroundColor: `${getStatusColor()}1A`,
        color: getStatusColor(),
        padding: '4px 12px',
        borderRadius: 20,
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      {children}
    </Box>
  );
};

// Page Transition Wrapper
interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
);

// Statistics Card Component
interface StatsCardProps {
  title: string;
  value: number;
  suffix?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  suffix = '', 
  icon, 
  trend = 'neutral', 
  trendValue 
}) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return colors.primary[500];
      case 'down': return '#e74c3c';
      default: return colors.neutral[500];
    }
  };

  return (
    <EnhancedCard sx={{ textAlign: 'center', p: 3 }}>
      {icon && (
        <FeatureIcon sx={{ mb: 2 }}>
          {icon}
        </FeatureIcon>
      )}
      <Box sx={{ mb: 1 }}>
        <AnimatedCounter from={0} to={value} suffix={suffix} />
      </Box>
      <Box sx={{ color: 'text.secondary', fontWeight: 500, mb: 1 }}>
        {title}
      </Box>
      {trendValue && (
        <Box sx={{ color: getTrendColor(), fontSize: '0.875rem', fontWeight: 600 }}>
          {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendValue}
        </Box>
      )}
    </EnhancedCard>
  );
};