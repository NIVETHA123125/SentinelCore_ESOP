import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, Button, Alert, Tabs, Tab
} from '@mui/material';
import { login } from '../api/authApi';
import { useAuth } from '../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  // 0 = User, 1 = Admin
  const [tabIndex, setTabIndex] = useState(0);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const isAdminMode = tabIndex === 1;

  // Use the original deep slate-teal theme for both tabs
  const themeColors = {
    bg: '#EEF2F1',
    border: '#D8E0DE',
    textPrimary: '#1E2E2C',
    textSecondary: '#4A7A73',
    buttonBg: '#2F4F4B',
    buttonHover: '#3D615C',
    activeTab: '#4A7A73',
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
        const { accessToken, refreshToken, username, role } = response.data;

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
        bgcolor: themeColors.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.3s ease',
      }}
    >
      <Card elevation={0} sx={{ border: `1px solid ${themeColors.border}`, borderRadius: 2, width: 380, overflow: 'hidden' }}>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            bgcolor: '#ffffff',
            borderBottom: `1px solid ${themeColors.border}`,
            '& .MuiTabs-indicator': {
              backgroundColor: themeColors.activeTab,
            }
          }}
        >
          <Tab label="User Login" sx={{ fontWeight: 600, '&.Mui-selected': { color: '#4A7A73' } }} />
          <Tab label="Admin Login" sx={{ fontWeight: 600, '&.Mui-selected': { color: '#4A7A73' } }} />
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
  );
}

export default Login;
