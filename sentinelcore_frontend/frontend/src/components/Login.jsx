import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, Button, Alert
} from '@mui/material';
import { login } from '../api/authApi';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    login(formData)
      .then((response) => {
        const { token, username, role } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        localStorage.setItem('role', role);
        onLogin(token);
        navigate('/dashboard');
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
        bgcolor: '#EEF2F1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Card elevation={0} sx={{ border: '1px solid #D8E0DE', borderRadius: 2, width: 380 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: '#1E2E2C', mb: 0.5, textAlign: 'center' }}
          >
            Cloud monitoring system with incident management assistance
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: '#4A7A73', mb: 3, textAlign: 'center', fontFamily: 'monospace' }}
          >
            Sign in to continue
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
              sx={{ bgcolor: '#2F4F4B', py: 1.2, '&:hover': { bgcolor: '#3D615C' } }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Login;