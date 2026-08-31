import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, Container, Typography, keyframes } from '@mui/material';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SecurityIcon from '@mui/icons-material/Security';

// Define the pulsing animation for the status dot
const pulse = keyframes`
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(74, 122, 115, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(74, 122, 115, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(74, 122, 115, 0); }
`;

const LandingPage = () => {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const themeColors = {
    background: '#1E2E2C',
    cardBackground: '#2A3F3C',
    primary: '#4A7A73',
    primaryHover: '#2F4F4B',
    textLight: '#EEF2F1',
    textMuted: '#9FB8B3',
    borderColor: 'rgba(238, 242, 241, 0.15)',
  };

  const fonts = {
    sans: '"Inter", sans-serif',
    mono: '"JetBrains Mono", monospace',
    display: '"Space Grotesk", sans-serif',
  };

  const features = [
    {
      tag: '[MONITOR]',
      title: 'Infrastructure Monitoring',
      description: 'Real-time CPU, memory, disk, and network tracking across all registered assets.',
      icon: <MonitorHeartIcon sx={{ fontSize: 32, color: themeColors.primary }} />
    },
    {
      tag: '[ALERT]',
      title: 'Automated Alerting',
      description: 'Scheduled health checks that automatically raise and route alerts upon threshold breaches.',
      icon: <NotificationsActiveIcon sx={{ fontSize: 32, color: themeColors.primary }} />
    },
    {
      tag: '[AUTH]',
      title: 'Secure Access',
      description: 'Robust JWT authentication with strict role-based access control protecting operations.',
      icon: <SecurityIcon sx={{ fontSize: 32, color: themeColors.primary }} />
    }
  ];

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        bgcolor: themeColors.background, 
        color: themeColors.textLight,
        fontFamily: fonts.sans,
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          pt: 4,
          pb: 12,
          borderBottom: `1px solid ${themeColors.borderColor}`,
        }}
      >
        <Container maxWidth="lg">
          {/* Status Bar */}
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 12,
              fontFamily: fonts.mono,
              fontSize: '0.85rem',
              color: themeColors.primary,
              letterSpacing: '0.05em'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box 
                sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  bgcolor: themeColors.primary,
                  animation: `${pulse} 2s infinite`,
                  '@media (prefers-reduced-motion: reduce)': {
                    animation: 'none'
                  }
                }} 
              />
              SYSTEM STATUS &middot; OPERATIONAL
            </Box>
            <Box>
              {time.toLocaleTimeString('en-US', { hour12: false })}
            </Box>
          </Box>

          {/* Hero Content */}
          <Box sx={{ maxWidth: '800px', mx: 'auto', textAlign: 'center' }}>
            <Typography 
              variant="h1" 
              sx={{ 
                fontFamily: fonts.display,
                fontWeight: 800, 
                fontSize: { xs: '3rem', md: '4.5rem' },
                lineHeight: 1.1,
                mb: 4, 
                letterSpacing: '-0.03em', 
                background: `linear-gradient(135deg, #A5D6A7 0%, ${themeColors.primary} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Cloud Security Monitoring System
            </Typography>
            <Typography 
              sx={{ 
                fontFamily: fonts.sans,
                color: themeColors.textMuted, 
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                mb: 6, 
                maxWidth: '600px', 
                mx: 'auto',
                lineHeight: 1.6 
              }}
            >
              Comprehensive infrastructure monitoring coupled with intelligent incident management. Secure and observe your environments in real-time.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/login')}
              sx={{
                bgcolor: themeColors.primary,
                color: '#fff',
                fontFamily: fonts.mono,
                px: 5,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                borderRadius: 1,
                boxShadow: 'none',
                transition: 'all 0.2s',
                '&:hover': { 
                  bgcolor: themeColors.primaryHover,
                  boxShadow: 'none',
                  transform: 'translateX(4px)'
                },
                '&:focus-visible': {
                  outline: `2px solid ${themeColors.textLight}`,
                  outlineOffset: '2px',
                }
              }}
            >
              Login &rarr;
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, 
            gap: 4 
          }}
        >
          {features.map((feature, index) => (
            <Card 
              key={index}
              elevation={0}
              sx={{
                bgcolor: themeColors.cardBackground,
                border: `1px solid ${themeColors.borderColor}`,
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: themeColors.primary,
                  transform: 'translateY(-4px)',
                }
              }}
            >
              <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                  <Typography 
                    sx={{ 
                      fontFamily: fonts.mono, 
                      color: themeColors.primary, 
                      fontSize: '0.8rem',
                      letterSpacing: '0.1em'
                    }}
                  >
                    {feature.tag}
                  </Typography>
                  {feature.icon}
                </Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontFamily: fonts.display,
                    fontWeight: 700, 
                    color: themeColors.textLight, 
                    mb: 2,
                    letterSpacing: '-0.01em'
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography 
                  sx={{ 
                    fontFamily: fonts.sans,
                    color: themeColors.textMuted, 
                    lineHeight: 1.6,
                    fontSize: '0.95rem'
                  }}
                >
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>

      {/* Footer / Trust Section */}
      <Box 
        sx={{ 
          borderTop: `1px solid ${themeColors.borderColor}`, 
          bgcolor: '#182422',
          py: 6,
          mt: 4,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Typography 
            sx={{ 
              fontFamily: fonts.mono, 
              color: themeColors.primary, 
              fontSize: '0.9rem',
              letterSpacing: '0.1em',
              mb: 3
            }}
          >
            TRUSTED INFRASTRUCTURE MONITORING
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, opacity: 0.6, flexWrap: 'wrap' }}>
            <Typography sx={{ fontFamily: fonts.sans, fontWeight: 600 }}>Zero-Downtime Design</Typography>
            <Typography sx={{ fontFamily: fonts.sans, fontWeight: 600 }}>End-to-End Encryption</Typography>
            <Typography sx={{ fontFamily: fonts.sans, fontWeight: 600 }}>Real-Time Intelligence</Typography>
          </Box>
          <Typography 
            sx={{ 
              fontFamily: fonts.sans, 
              color: themeColors.textMuted, 
              fontSize: '0.85rem',
              mt: 6
            }}
          >
            &copy; {new Date().getFullYear()} SentinelCore Security Systems. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
