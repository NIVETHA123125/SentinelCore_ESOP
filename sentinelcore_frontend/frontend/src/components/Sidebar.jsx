import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  Divider,
  Button
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import StorageIcon from '@mui/icons-material/Storage';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import BugReportIcon from '@mui/icons-material/BugReport';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { username, role, isAdmin, logoutUser } = useAuth();
  const { unreadCount } = useNotifications();

  const currentPath = location.pathname;

  const initials = username
    ? username.slice(0, 2).toUpperCase()
    : (isAdmin ? 'AD' : 'US');

  const navItemStyles = (isActive) => ({
    borderRadius: '8px',
    mb: 0.6,
    px: 1.5,
    py: 0.85,
    color: isActive ? '#0F766E' : '#475569',
    bgcolor: isActive ? '#E6F4F1' : 'transparent',
    fontWeight: isActive ? 600 : 500,
    fontSize: '0.85rem',
    '&:hover': {
      bgcolor: isActive ? '#DCF0EC' : '#F1F5F9',
      color: isActive ? '#0F766E' : '#0F172A',
    },
    transition: 'all 0.15s ease',
  });

  return (
    <Box
      sx={{
        width: 240,
        minWidth: 240,
        maxWidth: 240,
        height: '100vh',
        bgcolor: '#FFFFFF',
        borderRight: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        zIndex: 100,
      }}
    >
      {/* Brand Header */}
      <Box sx={{ p: 2.2, display: 'flex', alignItems: 'center', gap: 1.2 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '7px',
            bgcolor: '#0F766E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(15, 118, 110, 0.2)',
          }}
        >
          <ShieldIcon sx={{ color: '#FFFFFF', fontSize: 18 }} />
        </Box>
        <Box>
          <Typography
            variant="body1"
            sx={{ fontWeight: 700, color: '#0F172A', lineHeight: 1.2, letterSpacing: '-0.2px', fontSize: '0.95rem' }}
          >
            SentinelCore
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: '#94A3B8', fontSize: '0.7rem', display: 'block', letterSpacing: '0.2px' }}
          >
            Cloud Security System
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: '#F1F5F9' }} />

      {/* Navigation Links */}
      <Box sx={{ flex: 1, px: 1.8, py: 2, overflowY: 'auto' }}>
        {/* Workspace Group */}
        <Typography
          variant="caption"
          sx={{
            px: 1,
            mb: 0.8,
            display: 'block',
            fontWeight: 700,
            fontSize: '0.66rem',
            letterSpacing: '0.08em',
            color: '#94A3B8',
            textTransform: 'uppercase',
          }}
        >
          Workspace
        </Typography>

        <List disablePadding>
          <ListItemButton
            onClick={() => navigate('/dashboard')}
            sx={navItemStyles(currentPath === '/dashboard')}
          >
            <ListItemIcon sx={{ minWidth: 32, color: currentPath === '/dashboard' ? '#0F766E' : '#64748B' }}>
              <SpaceDashboardIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText
              primary="Dashboard"
              primaryTypographyProps={{ fontSize: '0.84rem', fontWeight: currentPath === '/dashboard' ? 600 : 500 }}
            />
          </ListItemButton>

          <ListItemButton
            onClick={() => navigate('/assets')}
            sx={navItemStyles(currentPath === '/assets')}
          >
            <ListItemIcon sx={{ minWidth: 32, color: currentPath === '/assets' ? '#0F766E' : '#64748B' }}>
              <StorageIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText
              primary="Assets"
              primaryTypographyProps={{ fontSize: '0.84rem', fontWeight: currentPath === '/assets' ? 600 : 500 }}
            />
          </ListItemButton>

          <ListItemButton
            onClick={() => navigate('/alerts')}
            sx={navItemStyles(currentPath === '/alerts')}
          >
            <ListItemIcon sx={{ minWidth: 32, color: currentPath === '/alerts' ? '#0F766E' : '#64748B' }}>
              <NotificationsActiveIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText
              primary="Alert History"
              primaryTypographyProps={{ fontSize: '0.84rem', fontWeight: currentPath === '/alerts' ? 600 : 500 }}
            />
            {unreadCount > 0 && (
              <Chip
                label={unreadCount}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  bgcolor: '#DC2626',
                  color: '#FFFFFF',
                  ml: 0.8,
                  px: 0.3,
                  '& .MuiChip-label': { px: 0.6 },
                }}
              />
            )}
          </ListItemButton>

          <ListItemButton
            onClick={() => navigate('/incidents')}
            sx={navItemStyles(currentPath === '/incidents')}
          >
            <ListItemIcon sx={{ minWidth: 32, color: currentPath === '/incidents' ? '#0F766E' : '#64748B' }}>
              <ReportProblemIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText
              primary="Incidents"
              primaryTypographyProps={{ fontSize: '0.84rem', fontWeight: currentPath === '/incidents' ? 600 : 500 }}
            />
          </ListItemButton>

          <ListItemButton
            onClick={() => navigate('/vulnerabilities')}
            sx={navItemStyles(currentPath === '/vulnerabilities')}
          >
            <ListItemIcon sx={{ minWidth: 32, color: currentPath === '/vulnerabilities' ? '#0F766E' : '#64748B' }}>
              <BugReportIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText
              primary="Vulnerabilities"
              primaryTypographyProps={{ fontSize: '0.84rem', fontWeight: currentPath === '/vulnerabilities' ? 600 : 500 }}
            />
          </ListItemButton>
        </List>
      </Box>

      <Divider sx={{ borderColor: '#F1F5F9' }} />

      {/* Bottom Profile & Actions */}
      <Box sx={{ p: 1.8 }}>
        {/* User Card */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.2,
            p: 1,
            borderRadius: '8px',
            bgcolor: '#F8FAFC',
            mb: 1.2,
          }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: '#0F766E',
              color: '#FFFFFF',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            {initials}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: '#0F172A', lineHeight: 1.2, fontSize: '0.82rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
            >
              {username || (isAdmin ? 'admin' : 'user')}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                fontWeight: 600,
                fontSize: '0.64rem',
                color: '#64748B',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {role || (isAdmin ? 'ROLE_ADMIN' : 'ROLE_USER')}
            </Typography>
          </Box>
        </Box>

        {/* Logout Button */}
        <Button
          fullWidth
          variant="outlined"
          size="small"
          onClick={logoutUser}
          startIcon={<LogoutIcon sx={{ fontSize: 14 }} />}
          sx={{
            borderColor: '#E2E8F0',
            color: '#64748B',
            textTransform: 'none',
            fontSize: '0.78rem',
            fontWeight: 500,
            borderRadius: '7px',
            py: 0.6,
            '&:hover': {
              borderColor: '#DC2626',
              color: '#DC2626',
              bgcolor: 'rgba(220, 38, 38, 0.04)',
            },
          }}
        >
          Log out
        </Button>
      </Box>
    </Box>
  );
}
