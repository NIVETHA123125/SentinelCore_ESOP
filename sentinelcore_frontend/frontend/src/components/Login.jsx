import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Tabs,
  Tab,
  Stack,
  Chip,
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SecurityIcon from '@mui/icons-material/Security';
import { login } from '../api/authApi';
import { useAuth } from '../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { loginUser, logoutUser } = useAuth();

  // Clear any existing session when the login page mounts
  // This ensures a fresh login experience every time
  useEffect(() => {
    logoutUser();
  }, []);
  // 0 = User, 1 = Admin
  const [tabIndex, setTabIndex] = useState(0);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const isAdminMode = tabIndex === 1;

  // Use the established SentinelCore palette
  const themeColors = {
    bg: '#EEF2F1',
    border: '#D8E0DE',
    textPrimary: '#1E2E2C',
    textSecondary: '#4A7A73',
    buttonBg: '#2F4F4B',
    buttonHover: '#3D615C',
    activeTab: '#4A7A73',
    adminGold: '#B08D57',
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
    setError(null); // Clear errors when switching tabs
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    login(formData.username, formData.password)
      .then((response) => {
        const { accessToken, refreshToken, role } = response.data;

        // Client-side role validation against the selected tab
        const actualRoleIsAdmin = role === 'ROLE_ADMIN';
        if (isAdminMode && !actualRoleIsAdmin) {
          setError('Access Denied: Account does not have administrative privileges.');
          setLoading(false);
          return;
        }
        if (!isAdminMode && actualRoleIsAdmin) {
          setError('Please use the Admin login tab for administrative accounts.');
          setLoading(false);
          return;
        }

        // Store tokens using AuthContext
        loginUser(accessToken, refreshToken);

        // Role-based redirect
        if (actualRoleIsAdmin) {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      })
      .catch(() => {
        setError('Invalid username or password');
        setLoading(false);
      });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        bgcolor: '#FFFFFF',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
      }}
    >
      {/* Left Panel - SentinelCore Branding (Completely covers left side) */}
      <Box
        sx={{
          flex: { xs: 'none', md: 1 },
          width: { xs: '100%', md: '50%' },
          minHeight: { xs: 'auto', md: '100vh' },
          bgcolor: '#1E2E2C',
          color: '#EEF2F1',
          p: { xs: 4, sm: 6, md: 8 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          order: { xs: 2, md: 1 },
          boxSizing: 'border-box',
        }}
      >
        <Box sx={{ maxWidth: 480, mx: { xs: 'auto', md: '0' }, width: '100%' }}>
          {/* Logo / Wordmark */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: 'rgba(74, 122, 115, 0.2)',
                border: '1px solid rgba(74, 122, 115, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldIcon sx={{ fontSize: 26, color: '#4A7A73' }} />
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#EEF2F1',
              }}
            >
              SentinelCore
            </Typography>
          </Box>

          {/* One-line Tagline */}
          <Typography
            variant="body1"
            sx={{
              color: '#9FB8B3',
              mb: 5,
              lineHeight: 1.6,
              fontSize: '1rem',
            }}
          >
            Real-time cloud security posture and automated infrastructure telemetry monitoring.
          </Typography>

          {/* 3 Feature Bullets */}
          <Stack spacing={3}>
            {/* Bullet 1: Real-time monitoring */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box
                sx={{
                  p: 1.2,
                  borderRadius: 2,
                  bgcolor: 'rgba(74, 122, 115, 0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  mt: 0.2,
                }}
              >
                <MonitorHeartIcon sx={{ fontSize: 22, color: '#4A7A73' }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 600, color: '#EEF2F1', fontSize: '0.95rem' }}>
                  Real-time monitoring
                </Typography>
                <Typography sx={{ color: '#9FB8B3', fontSize: '0.85rem', mt: 0.3, lineHeight: 1.4 }}>
                  Continuous tracking of CPU, memory, disk, and cluster health metrics.
                </Typography>
              </Box>
            </Box>

            {/* Bullet 2: Automated alerting */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box
                sx={{
                  p: 1.2,
                  borderRadius: 2,
                  bgcolor: 'rgba(74, 122, 115, 0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  mt: 0.2,
                }}
              >
                <NotificationsActiveIcon sx={{ fontSize: 22, color: '#4A7A73' }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 600, color: '#EEF2F1', fontSize: '0.95rem' }}>
                  Automated alerting
                </Typography>
                <Typography sx={{ color: '#9FB8B3', fontSize: '0.85rem', mt: 0.3, lineHeight: 1.4 }}>
                  Immediate threshold breach detection with automated resolution workflows.
                </Typography>
              </Box>
            </Box>

            {/* Bullet 3: JWT-secured access */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box
                sx={{
                  p: 1.2,
                  borderRadius: 2,
                  bgcolor: 'rgba(74, 122, 115, 0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  mt: 0.2,
                }}
              >
                <SecurityIcon sx={{ fontSize: 22, color: '#4A7A73' }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 600, color: '#EEF2F1', fontSize: '0.95rem' }}>
                  JWT-secured access
                </Typography>
                <Typography sx={{ color: '#9FB8B3', fontSize: '0.85rem', mt: 0.3, lineHeight: 1.4 }}>
                  Cryptographically verified credentials with granular role-based permissions.
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Box>
      </Box>

      {/* Right Panel - Login Credentials (White background with the original box) */}
      <Box
        sx={{
          flex: { xs: 'none', md: 1 },
          width: { xs: '100%', md: '50%' },
          minHeight: { xs: 'auto', md: '100vh' },
          bgcolor: '#FFFFFF',
          p: { xs: 3, sm: 5 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          order: { xs: 1, md: 2 },
          boxSizing: 'border-box',
        }}
      >
        <Card
          elevation={0}
          sx={{
            border: `1px solid ${themeColors.border}`,
            borderRadius: 2,
            width: '100%',
            maxWidth: 390,
            overflow: 'hidden',
            bgcolor: '#FFFFFF',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              bgcolor: '#FFFFFF',
              borderBottom: `1px solid ${themeColors.border}`,
              '& .MuiTabs-indicator': {
                backgroundColor: isAdminMode ? themeColors.adminGold : themeColors.activeTab,
              },
            }}
          >
            <Tab
              label="User Login"
              sx={{
                fontWeight: 600,
                '&.Mui-selected': { color: '#4A7A73' },
              }}
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <span>Admin Login</span>
                  <Chip
                    label="ADMIN"
                    size="small"
                    sx={{
                      bgcolor: themeColors.adminGold,
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '0.62rem',
                      height: 18,
                      '& .MuiChip-label': { px: 0.7 },
                    }}
                  />
                </Box>
              }
              sx={{
                fontWeight: 600,
                '&.Mui-selected': { color: themeColors.adminGold },
              }}
            />
          </Tabs>

          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: themeColors.textPrimary, mb: 0.5, textAlign: 'center' }}
            >
              SentinelCore SecureOps
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: themeColors.textSecondary, mb: 3, textAlign: 'center', fontFamily: 'monospace' }}
            >
              {isAdminMode ? 'Authorized personnel only' : 'Sign in to continue'}
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                size="small"
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                size="small"
                type="password"
                label="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                sx={{ mb: 3 }}
              />
              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={loading}
                sx={{
                  bgcolor: themeColors.buttonBg,
                  py: 1.2,
                  '&:hover': { bgcolor: themeColors.buttonHover },
                  transition: 'background-color 0.3s ease',
                }}
              >
                {loading ? 'Signing in...' : (isAdminMode ? 'Admin Sign In' : 'Sign In')}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

export default Login;
