import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  keyframes,
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
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
      icon: <MonitorHeartIcon sx={{ fontSize: 26, color: themeColors.primary }} />,
    },
    {
      tag: '[ALERT]',
      title: 'Automated Alerting',
      description: 'Scheduled health checks that automatically raise and route alerts upon threshold breaches.',
      icon: <NotificationsActiveIcon sx={{ fontSize: 26, color: themeColors.primary }} />,
    },
    {
      tag: '[AUTH]',
      title: 'Secure Access',
      description: 'Robust JWT authentication with strict role-based access control protecting operations.',
      icon: <SecurityIcon sx={{ fontSize: 26, color: themeColors.primary }} />,
    },
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
      {/* Top Navigation Bar */}
      <Box
        component="nav"
        sx={{
          borderBottom: `1px solid ${themeColors.borderColor}`,
          py: 2,
          px: { xs: 2, sm: 4, md: 6 },
          bgcolor: 'rgba(30, 46, 44, 0.95)',
          backdropFilter: 'blur(8px)',
          position: 'sticky',
          top: 0,
          zIndex: 1100,
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: { xs: 0 },
          }}
        >
          {/* Logo + Wordmark */}
          <Box
            onClick={() => navigate('/')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                bgcolor: 'rgba(74, 122, 115, 0.2)',
                border: '1px solid rgba(74, 122, 115, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldIcon sx={{ fontSize: 22, color: themeColors.primary }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: themeColors.textLight,
                fontFamily: fonts.display,
              }}
            >
              SentinelCore
            </Typography>
          </Box>

          {/* Login Button */}
          <Button
            variant="contained"
            onClick={() => navigate('/login')}
            sx={{
              bgcolor: themeColors.primaryHover,
              color: themeColors.textLight,
              border: `1px solid ${themeColors.primary}`,
              px: 3,
              py: 0.8,
              fontSize: '0.9rem',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 1.5,
              boxShadow: 'none',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: themeColors.primary,
                borderColor: '#A5D6A7',
                boxShadow: '0 4px 12px rgba(74, 122, 115, 0.3)',
              },
            }}
          >
            Login
          </Button>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box
        sx={{
          pt: 4,
          pb: 10,
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
              mb: 8,
              fontFamily: fonts.mono,
              fontSize: '0.85rem',
              color: themeColors.primary,
              letterSpacing: '0.05em',
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
                    animation: 'none',
                  },
                }}
              />
              SYSTEM STATUS &middot; OPERATIONAL
            </Box>
            <Box>{time.toLocaleTimeString('en-US', { hour12: false })}</Box>
          </Box>

          {/* Hero Content */}
          <Box sx={{ maxWidth: '820px', mx: 'auto', textAlign: 'center' }}>
            <Typography
              variant="h1"
              sx={{
                fontFamily: fonts.display,
                fontWeight: 800,
                fontSize: { xs: '2.8rem', sm: '3.6rem', md: '4.5rem' },
                lineHeight: 1.1,
                mb: 3,
                letterSpacing: '-0.03em',
                background: `linear-gradient(135deg, #A5D6A7 0%, ${themeColors.primary} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Cloud Security Monitoring System
            </Typography>

            {/* Hero Tagline */}
            <Typography
              sx={{
                fontFamily: fonts.sans,
                color: themeColors.textMuted,
                fontSize: { xs: '1.05rem', md: '1.25rem' },
                mb: 3.5,
                maxWidth: '640px',
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              Comprehensive infrastructure monitoring coupled with intelligent incident management. Secure and observe your environments in real-time.
            </Typography>

            {/* Stat Strip */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: { xs: 1.5, sm: 2 },
                bgcolor: 'rgba(74, 122, 115, 0.12)',
                border: '1px solid rgba(74, 122, 115, 0.3)',
                borderRadius: '50px',
                px: { xs: 2.5, sm: 3.5 },
                py: 1,
                mb: 5,
                color: '#A5D6A7',
                fontFamily: fonts.mono,
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                letterSpacing: '0.03em',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              <span>10 assets monitored</span>
              <Box component="span" sx={{ color: themeColors.primary, fontWeight: 'bold' }}>&middot;</Box>
              <span>99.9% uptime</span>
              <Box component="span" sx={{ color: themeColors.primary, fontWeight: 'bold' }}>&middot;</Box>
              <span>real-time alerts</span>
            </Box>

            {/* Hero Action Button */}
            <Box>
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
                  borderRadius: 1.5,
                  boxShadow: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: themeColors.primaryHover,
                    boxShadow: '0 8px 24px rgba(74, 122, 115, 0.3)',
                    transform: 'translateY(-2px)',
                  },
                  '&:focus-visible': {
                    outline: `2px solid ${themeColors.textLight}`,
                    outlineOffset: '2px',
                  },
                }}
              >
                Login &rarr;
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 4,
          }}
        >
          {features.map((feature, index) => (
            <Card
              key={index}
              elevation={0}
              sx={{
                bgcolor: themeColors.cardBackground,
                border: `1px solid rgba(74, 122, 115, 0.22)`,
                borderRadius: 2.5,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  borderColor: themeColors.primary,
                  transform: 'translateY(-6px)',
                  boxShadow: '0 12px 28px rgba(0, 0, 0, 0.3)',
                  '& .feature-icon-box': {
                    bgcolor: 'rgba(74, 122, 115, 0.3)',
                    borderColor: '#A5D6A7',
                    transform: 'scale(1.05)',
                  },
                },
              }}
            >
              <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3.5,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: fonts.mono,
                      color: themeColors.primary,
                      fontSize: '0.8rem',
                      letterSpacing: '0.1em',
                      fontWeight: 600,
                    }}
                  >
                    {feature.tag}
                  </Typography>

                  {/* Icon with treatment box */}
                  <Box
                    className="feature-icon-box"
                    sx={{
                      width: 46,
                      height: 46,
                      borderRadius: 2,
                      bgcolor: 'rgba(74, 122, 115, 0.15)',
                      border: '1px solid rgba(74, 122, 115, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {feature.icon}
                  </Box>
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: fonts.display,
                    fontWeight: 700,
                    color: themeColors.textLight,
                    mb: 1.5,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: fonts.sans,
                    color: themeColors.textMuted,
                    lineHeight: 1.6,
                    fontSize: '0.95rem',
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
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography
            sx={{
              fontFamily: fonts.mono,
              color: themeColors.primary,
              fontSize: '0.9rem',
              letterSpacing: '0.1em',
              mb: 3,
            }}
          >
            TRUSTED INFRASTRUCTURE MONITORING
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 4,
              opacity: 0.7,
              flexWrap: 'wrap',
            }}
          >
            <Typography sx={{ fontFamily: fonts.sans, fontWeight: 600 }}>Zero-Downtime Design</Typography>
            <Typography sx={{ fontFamily: fonts.sans, fontWeight: 600 }}>End-to-End Encryption</Typography>
            <Typography sx={{ fontFamily: fonts.sans, fontWeight: 600 }}>Real-Time Intelligence</Typography>
          </Box>
          <Typography
            sx={{
              fontFamily: fonts.sans,
              color: themeColors.textMuted,
              fontSize: '0.85rem',
              mt: 6,
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
