import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
} from '@mui/material';
import { AccountCircle, Restaurant, ExitToApp } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { trackAuth } from '../utils/analytics';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    trackAuth('logout');
    logout();
    navigate('/');
    handleClose();
  };

  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        bgcolor: 'white',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ py: 1 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              '&:hover': { opacity: 0.8 },
              transition: 'opacity 0.2s',
            }}
            onClick={() => navigate('/')}
          >
            <Restaurant sx={{ mr: 1.5, color: '#4ca6c9', fontSize: 28 }} />
            <Typography
              variant="h6"
              component="div"
              sx={{ 
                fontWeight: 700,
                color: '#212121',
                fontSize: '1.25rem',
              }}
            >
              Diet Planner
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {user ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                onClick={() => navigate('/dashboard')}
                sx={{
                  color: isActive('/dashboard') ? '#4ca6c9' : '#757575',
                  fontWeight: isActive('/dashboard') ? 600 : 500,
                  backgroundColor: isActive('/dashboard') ? 'rgba(76, 166, 201, 0.08)' : 'transparent',
                  '&:hover': { 
                    backgroundColor: 'rgba(76, 166, 201, 0.08)',
                    color: '#4ca6c9',
                  },
                  textTransform: 'none',
                  px: 2,
                  borderRadius: 2,
                }}
              >
                Dashboard
              </Button>
              <Button
                onClick={() => navigate('/diet-plans')}
                sx={{
                  color: isActive('/diet-plans') ? '#4ca6c9' : '#757575',
                  fontWeight: isActive('/diet-plans') ? 600 : 500,
                  backgroundColor: isActive('/diet-plans') ? 'rgba(76, 166, 201, 0.08)' : 'transparent',
                  '&:hover': { 
                    backgroundColor: 'rgba(76, 166, 201, 0.08)',
                    color: '#4ca6c9',
                  },
                  textTransform: 'none',
                  px: 2,
                  borderRadius: 2,
                }}
              >
                My Plans
              </Button>
              <Button
                onClick={() => navigate('/create-plan')}
                sx={{
                  color: isActive('/create-plan') ? '#4ca6c9' : '#757575',
                  fontWeight: isActive('/create-plan') ? 600 : 500,
                  backgroundColor: isActive('/create-plan') ? 'rgba(76, 166, 201, 0.08)' : 'transparent',
                  '&:hover': { 
                    backgroundColor: 'rgba(76, 166, 201, 0.08)',
                    color: '#4ca6c9',
                  },
                  textTransform: 'none',
                  px: 2,
                  borderRadius: 2,
                }}
              >
                Create Plan
              </Button>

              <Tooltip title="Account">
                <IconButton
                  size="large"
                  onClick={handleMenu}
                  sx={{ ml: 1 }}
                >
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: '#4ca6c9',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                    }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                sx={{
                  '& .MuiPaper-root': {
                    mt: 1,
                    minWidth: 180,
                  },
                }}
              >
                <MenuItem onClick={handleProfile}>
                  <AccountCircle sx={{ mr: 1.5, color: '#757575' }} />
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ExitToApp sx={{ mr: 1.5, color: '#757575' }} />
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                onClick={() => navigate('/login')}
                sx={{ 
                  color: '#757575',
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': { 
                    backgroundColor: 'rgba(76, 166, 201, 0.08)',
                    color: '#4ca6c9',
                  },
                  px: 2.5,
                  borderRadius: 2,
                }}
              >
                Login
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/register')}
                sx={{ 
                  bgcolor: '#4ca6c9',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': { 
                    bgcolor: '#3c89af',
                  },
                  px: 2.5,
                  borderRadius: 2,
                  boxShadow: 'none',
                }}
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
