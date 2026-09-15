import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Popover,
  Paper,
  Divider,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Badge,
  CircularProgress,
  Snackbar,
  Alert as MuiAlert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlined';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ShieldIcon from '@mui/icons-material/Shield';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { getOpenAlerts, resolveAlert } from '../api/alertApi';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export default function TopHeader({ breadcrumb = 'Security Dashboard', onRefresh }) {
  const navigate = useNavigate();
  const { isAdmin, username, role } = useAuth();
  const {
    notifications,
    unreadCount,
    clearNotifications,
    removeNotification,
    addNotification,
  } = useNotifications();

  // --- Refresh Animation & Feedback ---
  const [spinning, setSpinning] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // --- Notification Popover State ---
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [recentOpenAlerts, setRecentOpenAlerts] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [resolvingAll, setResolvingAll] = useState(false);

  // --- Help & Documentation Dialog State ---
  const [openHelpDialog, setOpenHelpDialog] = useState(false);
  const [helpTab, setHelpTab] = useState(0); // 0: Docs, 1: Help Guide, 2: Thresholds, 3: Lifecycle, 4: RBAC, 5: Demo Script
  const [copiedDocs, setCopiedDocs] = useState(false);

  const handleRefreshClick = () => {
    setSpinning(true);
    if (onRefresh) {
      Promise.resolve(onRefresh())
        .catch((err) => console.error('Refresh error:', err))
        .finally(() => {
          setTimeout(() => setSpinning(false), 500);
        });
    } else {
      setTimeout(() => setSpinning(false), 500);
    }
    setToastMessage('Metrics and alerts refreshed');
  };

  const handleOpenHelpModal = () => {
    setHelpTab(0);
    setOpenHelpDialog(true);
  };

  const handleOpenNotifications = (e) => {
    setNotifAnchor(e.currentTarget);
    setLoadingNotifs(true);
    getOpenAlerts()
      .then((res) => {
        setRecentOpenAlerts(res.data || []);
        setLoadingNotifs(false);
      })
      .catch((err) => {
        console.error('Failed to fetch open alerts', err);
        setLoadingNotifs(false);
      });
  };

  const handleCloseNotifications = () => {
    setNotifAnchor(null);
  };

  const handleResolveFromMenu = (alertId, assetName) => {
    resolveAlert(alertId)
      .then(() => {
        setRecentOpenAlerts((prev) => prev.filter((a) => a.id !== alertId));
        addNotification({
          type: 'RESOLVED',
          title: `Alert Resolved: ${assetName || 'Asset'}`,
          message: `Incident #${alertId} was marked as RESOLVED.`,
          assetName,
          severity: 'RESOLVED',
          alertId,
        });
        setToastMessage(`Alert #${alertId} marked as RESOLVED`);
        if (onRefresh) onRefresh();
      })
      .catch((err) => {
        alert('Error resolving alert: ' + (err.response?.data?.message || err.message));
      });
  };

  const handleResolveAllOpen = () => {
    setResolvingAll(true);
    getOpenAlerts()
      .then((res) => {
        const list = res.data || [];
        if (list.length === 0) {
          setToastMessage('No open alerts to resolve');
          setResolvingAll(false);
          return;
        }
        Promise.all(list.map((a) => resolveAlert(a.id)))
          .then(() => {
            setRecentOpenAlerts([]);
            addNotification({
              type: 'RESOLVED',
              title: 'All Open Alerts Resolved',
              message: `Cleared ${list.length} open incident(s).`,
              severity: 'RESOLVED',
            });
            setToastMessage(`Resolved all ${list.length} open alert(s)`);
            if (onRefresh) onRefresh();
          })
          .catch((err) => {
            alert('Error resolving alerts: ' + (err.response?.data?.message || err.message));
          })
          .finally(() => setResolvingAll(false));
      })
      .catch(() => setResolvingAll(false));
  };

  const isNotifOpen = Boolean(notifAnchor);

  const handleCopyDocumentation = () => {
    const docText = `
SentinelCore Cloud Security & Observability Platform
===================================================

1. SYSTEM ARCHITECTURE & 7 SECURITY PILLARS
- Stateless Authentication: Dual-Token JWT (15-min Access Token + 7-day Refresh Token via HMAC-SHA256).
- Credential Protection: BCrypt Password Hashing (Work Factor 10 + cryptographic salt).
- Method-Level RBAC: Enforced via Spring Security @PreAuthorize("hasRole('ADMIN')").
- Self-Healing Session: Axios response interceptor seamlessly catches 401s and requests silent token refresh.
- SQL Safety: Fully parameterized Spring Data JPA repositories (Zero SQL concatenation).
- Information Disclosure Protection: Centralized exception handler sanitizes DB errors and prevents stack trace leakage.
- Threat Detection: Automated 60-second daemon sweeps metrics with 3-minute anti-flooding rate limiting.

2. METRICS & ALERT THRESHOLDS
- CRITICAL: >= 90% CPU, Memory, or Disk. Generates urgent alerts and notifications.
- WARNING: >= 70% CPU, Memory, or Disk. Flags degradation prior to system failure.
- ONLINE: < 70% utilization across all monitored resources. Normal operating state.

3. REST API ENDPOINTS
- POST /api/auth/login        : Authenticate user & issue tokens
- POST /api/auth/refresh      : Refresh access token silently
- GET  /api/assets            : Retrieve all monitored infrastructure assets
- POST /api/assets            : Register new cloud asset (Admin only)
- PUT  /api/assets/{id}       : Update asset metrics & specs (Admin only)
- DELETE /api/assets/{id}     : Decommission infrastructure asset (Admin only)
- GET  /api/alerts            : Fetch complete alert audit history
- GET  /api/alerts/open       : Fetch active unacknowledged incidents
- PUT  /api/alerts/{id}/resolve : Resolve security incident and record audit timestamp (Admin only)

4. ROLE-BASED ACCESS CONTROL (RBAC)
- ROLE_ADMIN: Full CRUD on assets, inline metric editing, alert resolution, system administration.
- ROLE_USER: Read-only access to Dashboards, Asset Inventory, and Alert History.
    `.trim();

    navigator.clipboard.writeText(docText).then(() => {
      setCopiedDocs(true);
      setTimeout(() => setCopiedDocs(false), 2500);
      setToastMessage('Documentation copied to clipboard');
    });
  };

  return (
    <>
      <Box
        sx={{
          height: 52,
          minHeight: 52,
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          px: 3.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        {/* Breadcrumb */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <Typography
            onClick={() => navigate('/dashboard')}
            variant="body2"
            sx={{
              color: '#94A3B8',
              fontSize: '0.82rem',
              cursor: 'pointer',
              '&:hover': { color: '#0F766E' },
            }}
          >
            Workspace
          </Typography>
          <Typography variant="body2" sx={{ color: '#CBD5E1', fontSize: '0.82rem' }}>
            /
          </Typography>
          <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 600, fontSize: '0.82rem' }}>
            {breadcrumb}
          </Typography>
        </Box>

        {/* Quick Action Icons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* 1. Refresh Button with Smooth Spin */}
          <Tooltip title="Refresh metrics & alerts">
            <IconButton
              size="small"
              onClick={handleRefreshClick}
              sx={{
                color: '#64748B',
                p: 0.6,
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                '&:hover': { color: '#0F766E', bgcolor: '#F8FAFC', borderColor: '#CBD5E1' },
              }}
            >
              <RefreshIcon
                sx={{
                  fontSize: 17,
                  transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: spinning ? 'rotate(360deg)' : 'none',
                }}
              />
            </IconButton>
          </Tooltip>

          {/* 2. Help & Documentation Button */}
          <Tooltip title="Help & Documentation">
            <IconButton
              size="small"
              onClick={handleOpenHelpModal}
              sx={{
                color: '#64748B',
                p: 0.6,
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                '&:hover': { color: '#0F766E', bgcolor: '#F8FAFC', borderColor: '#CBD5E1' },
              }}
            >
              <HelpOutlineIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>

          {/* 4. Notification Bell with Event-Driven Badge */}
          <Tooltip title={unreadCount > 0 ? `${unreadCount} New Notification${unreadCount > 1 ? 's' : ''}` : 'No new notifications'}>
            <IconButton
              size="small"
              onClick={handleOpenNotifications}
              sx={{
                color: unreadCount > 0 ? '#DC2626' : '#64748B',
                p: 0.6,
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                bgcolor: unreadCount > 0 ? '#FEF2F2' : 'transparent',
                borderColor: unreadCount > 0 ? '#FECACA' : '#E2E8F0',
                '&:hover': {
                  bgcolor: unreadCount > 0 ? '#FEE2E2' : '#F8FAFC',
                  borderColor: unreadCount > 0 ? '#FCA5A5' : '#CBD5E1',
                },
              }}
            >
              <Badge
                badgeContent={unreadCount}
                color="error"
                max={99}
                invisible={unreadCount === 0}
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.62rem',
                    height: 16,
                    minWidth: 16,
                    px: 0.3,
                  },
                }}
              >
                <NotificationsNoneIcon sx={{ fontSize: 17 }} />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* 5. Role Badge */}
          <Chip
            label={isAdmin ? 'ADMIN' : 'VIEWER'}
            size="small"
            sx={{
              bgcolor: isAdmin ? '#B08D57' : '#0F766E',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.64rem',
              letterSpacing: '0.04em',
              height: 24,
              px: 0.5,
              borderRadius: '4px',
            }}
          />
        </Box>
      </Box>

      {/* Notifications Popover Dropdown */}
      <Popover
        open={isNotifOpen}
        anchorEl={notifAnchor}
        onClose={handleCloseNotifications}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            width: 400,
            maxWidth: '92vw',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 10px 28px rgba(15, 23, 42, 0.1)',
            mt: 1,
            overflow: 'hidden',
          },
        }}
      >
        <Box
          sx={{
            p: 1.8,
            bgcolor: '#FCFDFD',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsNoneIcon sx={{ color: '#0F766E', fontSize: 18 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.88rem' }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={`${unreadCount} new`}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.64rem',
                  fontWeight: 700,
                  bgcolor: '#FEF2F2',
                  color: '#DC2626',
                  border: '1px solid #FECACA',
                }}
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {notifications.length > 0 && (
              <Button
                size="small"
                startIcon={<DeleteSweepOutlinedIcon sx={{ fontSize: 14 }} />}
                onClick={clearNotifications}
                sx={{
                  fontSize: '0.7rem',
                  color: '#64748B',
                  fontWeight: 600,
                  textTransform: 'none',
                  p: 0.4,
                  px: 0.8,
                  '&:hover': { color: '#DC2626', bgcolor: '#FEF2F2' },
                }}
              >
                Clear All
              </Button>
            )}
          </Box>
        </Box>

        {/* Real-Time Event Notifications List */}
        <Box sx={{ maxHeight: 280, overflowY: 'auto' }}>
          {notifications.length > 0 ? (
            <Stack divider={<Divider sx={{ borderColor: '#F1F5F9' }} />}>
              {notifications.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    p: 1.6,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.2,
                    bgcolor: item.read ? 'transparent' : '#F8FAFC',
                    '&:hover': { bgcolor: '#F1F5F9' },
                  }}
                >
                  <Box sx={{ mt: 0.2 }}>
                    {item.type === 'CRITICAL' ? (
                      <ErrorOutlineIcon sx={{ color: '#DC2626', fontSize: 18 }} />
                    ) : item.type === 'RESOLVED' ? (
                      <CheckCircleOutlineIcon sx={{ color: '#16A34A', fontSize: 18 }} />
                    ) : (
                      <WarningAmberIcon sx={{ color: '#D97706', fontSize: 18 }} />
                    )}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.3 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.8rem' }}>
                        {item.title}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => removeNotification(item.id)}
                        sx={{ p: 0.2, color: '#94A3B8', '&:hover': { color: '#64748B' } }}
                      >
                        <CloseIcon sx={{ fontSize: 13 }} />
                      </IconButton>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#475569', display: 'block', fontSize: '0.74rem', lineHeight: 1.35 }}>
                      {item.message}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.66rem', fontFamily: 'monospace', mt: 0.5, display: 'block' }}>
                      {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          ) : (
            <Box sx={{ py: 3.5, px: 3, textAlign: 'center', color: '#94A3B8' }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 28, color: '#16A34A', mb: 0.6 }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.82rem' }}>
                No New Notifications
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 0.3 }}>
                Notifications trigger when an alert is created, critical, or resolved.
              </Typography>
            </Box>
          )}
        </Box>

        {/* Admin Clear / Resolve All Open Alerts Section */}
        {isAdmin && recentOpenAlerts.length > 0 && (
          <>
            <Divider sx={{ borderColor: '#F1F5F9' }} />
            <Box sx={{ p: 1.5, bgcolor: '#FFFBEB', borderTop: '1px solid #FEF3C7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#92400E', display: 'block' }}>
                  {recentOpenAlerts.length} Open Alert{recentOpenAlerts.length > 1 ? 's' : ''} in Database
                </Typography>
                <Typography variant="caption" sx={{ color: '#B45309', fontSize: '0.68rem' }}>
                  Awaiting administrator acknowledgment
                </Typography>
              </Box>
              <Button
                size="small"
                variant="contained"
                disabled={resolvingAll}
                startIcon={<DoneAllIcon sx={{ fontSize: 14 }} />}
                onClick={handleResolveAllOpen}
                sx={{
                  bgcolor: '#0F766E',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  textTransform: 'none',
                  borderRadius: '6px',
                  py: 0.4,
                  px: 1.2,
                  '&:hover': { bgcolor: '#0D655E' },
                }}
              >
                {resolvingAll ? 'Resolving...' : 'Clear Open Alerts'}
              </Button>
            </Box>
          </>
        )}

        <Divider sx={{ borderColor: '#F1F5F9' }} />
        <Box sx={{ p: 1, textAlign: 'center', bgcolor: '#FCFDFD' }}>
          <Button
            fullWidth
            size="small"
            endIcon={<ArrowForwardIcon sx={{ fontSize: '13px !important' }} />}
            onClick={() => {
              handleCloseNotifications();
              navigate('/alerts');
            }}
            sx={{
              color: '#0F766E',
              fontWeight: 600,
              fontSize: '0.78rem',
              textTransform: 'none',
              py: 0.6,
            }}
          >
            View all in Alert History
          </Button>
        </Box>
      </Popover>

      {/* Help & Documentation Dialog */}
      <Dialog
        open={openHelpDialog}
        onClose={() => setOpenHelpDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '12px', overflow: 'hidden' } }}
      >
        <DialogTitle
          sx={{
            p: 2.5,
            pb: 1.5,
            bgcolor: '#FCFDFD',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: '6px',
                bgcolor: '#0F766E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldIcon sx={{ color: '#FFFFFF', fontSize: 18 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '1.05rem', lineHeight: 1.2 }}>
                SentinelCore Documentation & Help Guide
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.72rem' }}>
                Cloud Security Monitoring & Infrastructure Observability
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={() => setOpenHelpDialog(false)} sx={{ color: '#94A3B8' }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>

        <Box sx={{ borderBottom: 1, borderColor: '#F1F5F9', px: 2.5, bgcolor: '#FCFDFD' }}>
          <Tabs
            value={helpTab}
            onChange={(e, val) => setHelpTab(val)}
            textColor="primary"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 42,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.82rem',
                minHeight: 42,
                py: 1,
              },
            }}
          >
            <Tab label="📘 System Documentation" />
            <Tab label="❓ Help & User Guide" />
            <Tab label="⚡ Alert Thresholds" />
            <Tab label="🔄 Incident Lifecycle & MTTR" />
            <Tab label="🛡️ Role Permissions (RBAC)" />
            <Tab label="🎯 Presentation Walkthrough" />
          </Tabs>
        </Box>

        <DialogContent sx={{ p: 3, maxHeight: 440, overflowY: 'auto' }}>
          {/* TAB 0: SYSTEM DOCUMENTATION & ARCHITECTURE */}
          {helpTab === 0 && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, fontSize: '0.96rem' }}>
                Defense-in-Depth Architecture & 7 Security Pillars
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569', mb: 2, fontSize: '0.84rem', lineHeight: 1.6 }}>
                SentinelCore employs an enterprise defense-in-depth design across authentication, data integrity, access control, and telemetry pipelines:
              </Typography>

              <Stack spacing={1.5} sx={{ mb: 3 }}>
                <Paper elevation={0} sx={{ p: 1.5, border: '1px solid #E2E8F0', borderRadius: '8px', bgcolor: '#F8FAFC' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F766E', fontSize: '0.82rem' }}>
                    1. Stateless Dual-Token Authentication (JWT)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#475569', display: 'block', mt: 0.3, lineHeight: 1.4 }}>
                    Short-lived 15-minute Access Tokens with HMAC-SHA256 signature, paired with 7-day Refresh Tokens stored safely in cookies to maintain session continuity via silent background refresh.
                  </Typography>
                </Paper>

                <Paper elevation={0} sx={{ p: 1.5, border: '1px solid #E2E8F0', borderRadius: '8px', bgcolor: '#F8FAFC' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F766E', fontSize: '0.82rem' }}>
                    2. Cryptographic Credential Protection (BCrypt Cost 10)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#475569', display: 'block', mt: 0.3, lineHeight: 1.4 }}>
                    Zero plain-text password storage. Each credential is salted and hashed using BCrypt work factor 10, completely thwarting rainbow table and dictionary exploits.
                  </Typography>
                </Paper>

                <Paper elevation={0} sx={{ p: 1.5, border: '1px solid #E2E8F0', borderRadius: '8px', bgcolor: '#F8FAFC' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F766E', fontSize: '0.82rem' }}>
                    3. Two-Tier Role-Based Access Control (RBAC)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#475569', display: 'block', mt: 0.3, lineHeight: 1.4 }}>
                    Strict server-side validation via Spring Security <code>@PreAuthorize("hasRole('ADMIN')")</code> on mutation endpoints, paired with intelligent client-side UI gating.
                  </Typography>
                </Paper>

                <Paper elevation={0} sx={{ p: 1.5, border: '1px solid #E2E8F0', borderRadius: '8px', bgcolor: '#F8FAFC' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F766E', fontSize: '0.82rem' }}>
                    4. Operational Security & Anti-Flooding Engine
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#475569', display: 'block', mt: 0.3, lineHeight: 1.4 }}>
                    Background daemon checks telemetry every 60 seconds. A mandatory 3-minute cooldown prevents alert flooding and notification storms while tracking critical breaches.
                  </Typography>
                </Paper>
              </Stack>

              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, fontSize: '0.88rem' }}>
                Core REST API Endpoints Reference
              </Typography>
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#475569' }}>METHOD</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#475569' }}>ENDPOINT</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#475569' }}>ACCESS</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#475569' }}>DESCRIPTION</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell><Chip label="POST" size="small" sx={{ bgcolor: '#EFF6FF', color: '#1D4ED8', fontWeight: 700, fontSize: '0.62rem', height: 18 }} /></TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>/api/auth/login</TableCell>
                      <TableCell sx={{ fontSize: '0.72rem' }}>Public</TableCell>
                      <TableCell sx={{ fontSize: '0.72rem' }}>Authenticates user, returns JWT tokens</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><Chip label="GET" size="small" sx={{ bgcolor: '#ECFDF5', color: '#047857', fontWeight: 700, fontSize: '0.62rem', height: 18 }} /></TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>/api/assets</TableCell>
                      <TableCell sx={{ fontSize: '0.72rem' }}>Authenticated</TableCell>
                      <TableCell sx={{ fontSize: '0.72rem' }}>Fetches all monitored servers and metrics</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><Chip label="POST" size="small" sx={{ bgcolor: '#EFF6FF', color: '#1D4ED8', fontWeight: 700, fontSize: '0.62rem', height: 18 }} /></TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>/api/assets</TableCell>
                      <TableCell sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#B08D57' }}>Admin</TableCell>
                      <TableCell sx={{ fontSize: '0.72rem' }}>Registers a new infrastructure asset</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><Chip label="PUT" size="small" sx={{ bgcolor: '#FFFBEB', color: '#B45309', fontWeight: 700, fontSize: '0.62rem', height: 18 }} /></TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>/api/assets/{'{id}'}</TableCell>
                      <TableCell sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#B08D57' }}>Admin</TableCell>
                      <TableCell sx={{ fontSize: '0.72rem' }}>Inline updates metrics, name, or IP</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><Chip label="DELETE" size="small" sx={{ bgcolor: '#FEF2F2', color: '#B91C1C', fontWeight: 700, fontSize: '0.62rem', height: 18 }} /></TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>/api/assets/{'{id}'}</TableCell>
                      <TableCell sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#B08D57' }}>Admin</TableCell>
                      <TableCell sx={{ fontSize: '0.72rem' }}>Decommissions asset from monitoring</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><Chip label="GET" size="small" sx={{ bgcolor: '#ECFDF5', color: '#047857', fontWeight: 700, fontSize: '0.62rem', height: 18 }} /></TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>/api/alerts</TableCell>
                      <TableCell sx={{ fontSize: '0.72rem' }}>Authenticated</TableCell>
                      <TableCell sx={{ fontSize: '0.72rem' }}>Retrieves all audit history with timestamps</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><Chip label="GET" size="small" sx={{ bgcolor: '#ECFDF5', color: '#047857', fontWeight: 700, fontSize: '0.62rem', height: 18 }} /></TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>/api/alerts/open</TableCell>
                      <TableCell sx={{ fontSize: '0.72rem' }}>Authenticated</TableCell>
                      <TableCell sx={{ fontSize: '0.72rem' }}>Fetches active unresolved incidents</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><Chip label="PUT" size="small" sx={{ bgcolor: '#FFFBEB', color: '#B45309', fontWeight: 700, fontSize: '0.62rem', height: 18 }} /></TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>/api/alerts/{'{id}'}/resolve</TableCell>
                      <TableCell sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#B08D57' }}>Admin</TableCell>
                      <TableCell sx={{ fontSize: '0.72rem' }}>Resolves incident and stamps resolvedAt</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* TAB 1: HELP & USER GUIDE */}
          {helpTab === 1 && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, fontSize: '0.96rem' }}>
                SentinelCore Platform User Guide
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569', mb: 2, fontSize: '0.84rem', lineHeight: 1.6 }}>
                Follow this guide to navigate the workspace, manage infrastructure assets, audit incidents, and utilize live controls:
              </Typography>

              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F766E', fontSize: '0.86rem' }}>
                    1. Security Dashboard (/dashboard)
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.82rem', lineHeight: 1.5, mt: 0.3 }}>
                    The executive overview displays real-time health across all monitored servers. Check the 4 KPI summary cards (Total Assets, Operational Online, Offline, and Critical Alerts). Inspect the live system performance progress bars (System Uptime, Average CPU Usage, Average Memory Usage) and the Recent Assets widget.
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F766E', fontSize: '0.86rem' }}>
                    2. Infrastructure Assets Inventory (/assets)
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.82rem', lineHeight: 1.5, mt: 0.3 }}>
                    The dedicated inventory table allows full hardware and metric auditing. Use the search bar to filter by server name or IP address. Click the status tabs (All, Online, Degraded, Critical, Offline) to isolate systems. Administrators can double-click or click the edit icon on CPU, RAM, Disk, or Status to make instantaneous inline updates.
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F766E', fontSize: '0.86rem' }}>
                    3. Alert History & Incident Audit (/alerts)
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.82rem', lineHeight: 1.5, mt: 0.3 }}>
                    Track complete incident lifecycles. Each breach generates a timestamped "Alert Created" record. When an Administrator resolves the issue, an exact "Alert Resolved" timestamp is recorded. Filter by Lifecycle status: All, Open, or Resolved.
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F766E', fontSize: '0.86rem' }}>
                    4. Quick Action Header Bar
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.82rem', lineHeight: 1.5, mt: 0.3 }}>
                    - <strong>Refresh (↻)</strong>: Triggers immediate data re-synchronization with live visual feedback.<br />
                    - <strong>Documentation (📄)</strong>: Opens the comprehensive Architecture & API reference.<br />
                    - <strong>Help (?)</strong>: Opens this operational guide.<br />
                    - <strong>Notification Bell (🔔)</strong>: Displays active incident count and allows inline 1-click resolution for Administrators.
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}

          {/* TAB 2: ALERT THRESHOLDS */}
          {helpTab === 2 && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, fontSize: '0.96rem' }}>
                Automated Monitoring & Metric Threshold Rules
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569', mb: 2, fontSize: '0.84rem' }}>
                The automated monitoring daemon evaluates CPU, Memory, and Disk utilization continuously:
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5, mb: 2.5 }}>
                <Paper elevation={0} sx={{ p: 2, border: '1px solid #FECACA', bgcolor: '#FEF2F2', borderRadius: '8px' }}>
                  <Typography variant="subtitle2" sx={{ color: '#DC2626', fontWeight: 700, fontSize: '0.84rem' }}>
                    CRITICAL (≥ 90%)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#7F1D1D', display: 'block', mt: 0.5, lineHeight: 1.4 }}>
                    CPU, Memory, or Disk ≥ 90%. Instantly triggers urgent security incidents, logs to audit history, and alerts administrators.
                  </Typography>
                </Paper>
                <Paper elevation={0} sx={{ p: 2, border: '1px solid #FDE68A', bgcolor: '#FFFBEB', borderRadius: '8px' }}>
                  <Typography variant="subtitle2" sx={{ color: '#D97706', fontWeight: 700, fontSize: '0.84rem' }}>
                    WARNING (≥ 70%)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#78350F', display: 'block', mt: 0.5, lineHeight: 1.4 }}>
                    Resource usage ≥ 70% and &lt; 90%. Flags degradation so engineers can remediate capacity before failure occurs.
                  </Typography>
                </Paper>
                <Paper elevation={0} sx={{ p: 2, border: '1px solid #A7F3D0', bgcolor: '#ECFDF5', borderRadius: '8px' }}>
                  <Typography variant="subtitle2" sx={{ color: '#059669', fontWeight: 700, fontSize: '0.84rem' }}>
                    ONLINE (&lt; 70%)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#064E3B', display: 'block', mt: 0.5, lineHeight: 1.4 }}>
                    All metrics within optimal operating conditions. Heartbeat confirms healthy response from cloud node.
                  </Typography>
                </Paper>
              </Box>

              <Paper elevation={0} sx={{ p: 2, border: '1px solid #E2E8F0', bgcolor: '#F8FAFC', borderRadius: '8px' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5, fontSize: '0.84rem' }}>
                  Anti-Flooding Rate Limiting (3-Minute Cooldown)
                </Typography>
                <Typography variant="caption" sx={{ color: '#475569', display: 'block', lineHeight: 1.5 }}>
                  To prevent notification storms and Denial-of-Service against external alert channels, SentinelCore enforces a 3-minute silence window per asset:
                  <code>lastNotificationAt.isBefore(now.minusMinutes(3))</code>. This guarantees timely notification without saturating operational staff.
                </Typography>
              </Paper>
            </Box>
          )}

          {/* TAB 3: INCIDENT LIFECYCLE & MTTR */}
          {helpTab === 3 && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, fontSize: '0.96rem' }}>
                Incident Lifecycle & MTTR Audit Trail
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569', mb: 2, fontSize: '0.84rem', lineHeight: 1.6 }}>
                Every anomaly detected by the monitoring daemon transitions through a verifiable lifecycle:
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Chip label="1. THRESHOLD BREACH" size="small" sx={{ bgcolor: '#FEF2F2', color: '#DC2626', fontWeight: 700, fontSize: '0.72rem' }} />
                  <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.82rem' }}>
                    Automated daemon detects CPU/RAM/Disk ≥ 90% or host unreachable.
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Chip label="2. INCIDENT CREATED" size="small" sx={{ bgcolor: '#FFFBEB', color: '#D97706', fontWeight: 700, fontSize: '0.72rem' }} />
                  <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.82rem' }}>
                    Alert stored in DB with exact <code>createdAt</code> timestamp and status <code>OPEN</code>.
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Chip label="3. NOTIFICATION DISPATCH" size="small" sx={{ bgcolor: '#EFF6FF', color: '#1D4ED8', fontWeight: 700, fontSize: '0.72rem' }} />
                  <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.82rem' }}>
                    Bell badge increments; active incidents appear in notification popover and live toast.
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Chip label="4. RESOLVED & AUDITED" size="small" sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 700, fontSize: '0.72rem' }} />
                  <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.82rem' }}>
                    Admin clicks "Resolve", immediately stamping <code>resolvedAt</code>. Lifecycle audit preserved.
                  </Typography>
                </Box>
              </Box>

              <Paper elevation={0} sx={{ p: 2, border: '1px solid #E2E8F0', bgcolor: '#F8FAFC', borderRadius: '8px' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5, fontSize: '0.84rem' }}>
                  Mean Time to Resolution (MTTR) Formula
                </Typography>
                <Typography variant="caption" sx={{ color: '#475569', display: 'block', fontFamily: 'monospace' }}>
                  MTTR = Total Duration of Incidents (resolvedAt - createdAt) / Total Number of Incidents
                </Typography>
              </Paper>
            </Box>
          )}

          {/* TAB 4: ROLE PERMISSIONS (RBAC) */}
          {helpTab === 4 && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, fontSize: '0.96rem' }}>
                Two-Tier Role-Based Access Control Matrix
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569', mb: 2, fontSize: '0.84rem', lineHeight: 1.6 }}>
                Privileges are verified cryptographically via Spring Security <code>@PreAuthorize</code> on the backend and mapped to user roles on the frontend:
              </Typography>

              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.74rem', color: '#475569' }}>ACTION / CAPABILITY</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.74rem', color: '#B08D57', textAlign: 'center' }}>ROLE_ADMIN</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.74rem', color: '#0F766E', textAlign: 'center' }}>ROLE_USER (VIEWER)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontSize: '0.78rem' }}>View Security Dashboard & Aggregated KPIs</TableCell>
                      <TableCell sx={{ textAlign: 'center', color: '#16A34A', fontWeight: 700 }}>✓ Allowed</TableCell>
                      <TableCell sx={{ textAlign: 'center', color: '#16A34A', fontWeight: 700 }}>✓ Allowed</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontSize: '0.78rem' }}>Browse Assets Inventory & Filter by Status</TableCell>
                      <TableCell sx={{ textAlign: 'center', color: '#16A34A', fontWeight: 700 }}>✓ Allowed</TableCell>
                      <TableCell sx={{ textAlign: 'center', color: '#16A34A', fontWeight: 700 }}>✓ Allowed</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontSize: '0.78rem' }}>View Alert History & Incident Timestamps</TableCell>
                      <TableCell sx={{ textAlign: 'center', color: '#16A34A', fontWeight: 700 }}>✓ Allowed</TableCell>
                      <TableCell sx={{ textAlign: 'center', color: '#16A34A', fontWeight: 700 }}>✓ Allowed</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontSize: '0.78rem' }}>Register New Infrastructure Asset</TableCell>
                      <TableCell sx={{ textAlign: 'center', color: '#16A34A', fontWeight: 700 }}>✓ Allowed</TableCell>
                      <TableCell sx={{ textAlign: 'center', color: '#DC2626', fontWeight: 700 }}>✗ Forbidden</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontSize: '0.78rem' }}>Inline Edit Asset Metrics (CPU, RAM, Disk, Status)</TableCell>
                      <TableCell sx={{ textAlign: 'center', color: '#16A34A', fontWeight: 700 }}>✓ Allowed</TableCell>
                      <TableCell sx={{ textAlign: 'center', color: '#DC2626', fontWeight: 700 }}>✗ Read-Only</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontSize: '0.78rem' }}>Decommission / Delete Monitored Asset</TableCell>
                      <TableCell sx={{ textAlign: 'center', color: '#16A34A', fontWeight: 700 }}>✓ Allowed</TableCell>
                      <TableCell sx={{ textAlign: 'center', color: '#DC2626', fontWeight: 700 }}>✗ Forbidden</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontSize: '0.78rem' }}>Resolve Active Security Incidents</TableCell>
                      <TableCell sx={{ textAlign: 'center', color: '#16A34A', fontWeight: 700 }}>✓ Allowed</TableCell>
                      <TableCell sx={{ textAlign: 'center', color: '#DC2626', fontWeight: 700 }}>✗ Read-Only</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* TAB 5: PRESENTATION WALKTHROUGH SCRIPT */}
          {helpTab === 5 && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, fontSize: '0.96rem' }}>
                Live Demo Walkthrough Script (For Evaluators & Reviewers)
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569', mb: 2, fontSize: '0.84rem', lineHeight: 1.6 }}>
                Follow this exact 3-step sequence during project presentations to clearly prove SentinelCore's defense-in-depth security:
              </Typography>

              <Stack spacing={2}>
                <Paper elevation={0} sx={{ p: 2, border: '1px solid #E2E8F0', borderRadius: '8px', bgcolor: '#F8FAFC' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F766E', fontSize: '0.84rem' }}>
                    Step 1: Viewer Login (viewer / viewer123)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#475569', display: 'block', mt: 0.5, lineHeight: 1.5 }}>
                    Log in as Viewer. Demonstrate that the interface is read-only. Notice the absence of the "Register Asset" button and the disabled "Resolve" actions in Alert History.
                  </Typography>
                </Paper>

                <Paper elevation={0} sx={{ p: 2, border: '1px solid #E2E8F0', borderRadius: '8px', bgcolor: '#F8FAFC' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F766E', fontSize: '0.84rem' }}>
                    Step 2: Network Tab Inspection (DevTools F12)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#475569', display: 'block', mt: 0.5, lineHeight: 1.5 }}>
                    Open Chrome/Edge DevTools (F12) → Network tab. Click "Refresh". Highlight the <code>Authorization: Bearer &lt;JWT&gt;</code> header on API requests, explaining stateless authentication and HMAC-SHA256 signature verification.
                  </Typography>
                </Paper>

                <Paper elevation={0} sx={{ p: 2, border: '1px solid #E2E8F0', borderRadius: '8px', bgcolor: '#B08D57' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#B08D57', fontSize: '0.84rem' }}>
                    Step 3: Admin Login (admin / admin123) & Incident Resolution
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#475569', display: 'block', mt: 0.5, lineHeight: 1.5 }}>
                    Switch to Admin. Demonstrate privileged controls: inline cell editing in Assets, registering a new server, clicking the Notification bell to resolve an active incident, and verifying the audit timestamp in Alert History.
                  </Typography>
                </Paper>
              </Stack>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: '1px solid #F1F5F9', bgcolor: '#FCFDFD', display: 'flex', justifyContent: 'space-between' }}>
          <Button
            startIcon={copiedDocs ? <CheckIcon sx={{ fontSize: 16 }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
            onClick={handleCopyDocumentation}
            sx={{
              color: copiedDocs ? '#16A34A' : '#64748B',
              fontSize: '0.78rem',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': { color: '#0F766E' },
            }}
          >
            {copiedDocs ? 'Copied to Clipboard!' : 'Copy Documentation'}
          </Button>
          <Button
            onClick={() => setOpenHelpDialog(false)}
            variant="contained"
            sx={{
              bgcolor: '#0F766E',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '0.8rem',
              textTransform: 'none',
              borderRadius: '6px',
              px: 2.5,
              '&:hover': { bgcolor: '#0D655E' },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Toast Feedback */}
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={3000}
        onClose={() => setToastMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MuiAlert
          severity="success"
          onClose={() => setToastMessage(null)}
          sx={{
            width: '100%',
            bgcolor: '#0F172A',
            color: '#FFFFFF',
            borderRadius: '8px',
            fontSize: '0.82rem',
            '& .MuiAlert-icon': { color: '#10B981' },
          }}
        >
          {toastMessage}
        </MuiAlert>
      </Snackbar>
    </>
  );
}
