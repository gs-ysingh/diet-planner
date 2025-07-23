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
    <AppBar position="sticky" sx={{ bgcolor: '#2e7d32' }}>
      <Container maxWidth="lg">
        <Toolbar>
          <Restaurant sx={{ mr: 2 }} />
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            Diet Planner
          </Typography>

          {user ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                color="inherit"
                onClick={() => navigate('/dashboard')}
                sx={{
                  backgroundColor: isActive('/dashboard') ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                }}
              >
                Dashboard
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate('/diet-plans')}
                sx={{
                  backgroundColor: isActive('/diet-plans') ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                }}
              >
                My Plans
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate('/create-plan')}
                sx={{
                  backgroundColor: isActive('/create-plan') ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                }}
              >
                Create Plan
              </Button>

              <Tooltip title="Account">
                <IconButton
                  size="large"
                  onClick={handleMenu}
                  color="inherit"
                  sx={{ ml: 2 }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      fontSize: '1rem',
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
              >
                <MenuItem onClick={handleProfile}>
                  <AccountCircle sx={{ mr: 1 }} />
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ExitToApp sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                color="inherit"
                onClick={() => navigate('/login')}
                sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
              >
                Login
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate('/register')}
                sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
              >
                Register
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
