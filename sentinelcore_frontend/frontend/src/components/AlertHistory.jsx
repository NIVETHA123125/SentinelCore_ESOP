import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Stack,
  Alert as MuiAlert,
  Snackbar,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { getAllAlerts, resolveAlert } from '../api/alertApi';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

const severityBadgeStyle = (severity) => {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL':
      return { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' };
    case 'HIGH':
      return { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' };
    case 'MEDIUM':
      return { bg: '#F0FDFA', text: '#0F766E', border: '#99F6E4' };
    default:
      return { bg: '#F8FAFC', text: '#64748B', border: '#E2E8F0' };
  }
};

const formatMessage = (msg) => {
  if (!msg) return '—';
  // If message has CPU, Mem, Disk info, format cleanly
  return msg.replace(/\s+/g, ' ').trim();
};

export default function AlertHistory() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'OPEN' | 'RESOLVED'
  const { addNotification } = useNotifications();
  const [actionMessage, setActionMessage] = useState(null);
  const [resolvingAll, setResolvingAll] = useState(false);

  const fetchAlerts = () => {
    return getAllAlerts()
      .then((res) => {
        setAlerts(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load alerts', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleResolve = (id, assetName) => {
    resolveAlert(id)
      .then(() => {
        setActionMessage(`Alert #${id} for "${assetName}" marked as RESOLVED`);
        addNotification({
          type: 'RESOLVED',
          title: `Alert Resolved: ${assetName || 'Asset'}`,
          message: `Alert #${id} for "${assetName}" was marked as RESOLVED.`,
          assetName,
          severity: 'RESOLVED',
          alertId: id,
        });
        fetchAlerts();
      })
      .catch((err) => {
        alert('Error resolving alert: ' + (err.response?.data?.message || err.message));
      });
  };

  const handleResolveAll = () => {
    const openAlerts = alerts.filter((a) => a.status?.toUpperCase() === 'OPEN');
    if (openAlerts.length === 0) return;
    setResolvingAll(true);
    Promise.all(openAlerts.map((a) => resolveAlert(a.id)))
      .then(() => {
        setActionMessage(`Successfully resolved all ${openAlerts.length} open alert(s)`);
        addNotification({
          type: 'RESOLVED',
          title: 'All Open Alerts Resolved',
          message: `Batch cleared: ${openAlerts.length} alert(s) marked as RESOLVED.`,
          severity: 'RESOLVED',
        });
        fetchAlerts();
      })
      .catch((err) => {
        alert('Error resolving alerts: ' + (err.response?.data?.message || err.message));
      })
      .finally(() => {
        setResolvingAll(false);
      });
  };

  const openCount = alerts.filter((a) => a.status?.toUpperCase() === 'OPEN').length;
  const resolvedCount = alerts.filter((a) => a.status?.toUpperCase() === 'RESOLVED').length;

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'OPEN') return a.status?.toUpperCase() === 'OPEN';
    if (filter === 'RESOLVED') return a.status?.toUpperCase() === 'RESOLVED';
    return true;
  });

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden', bgcolor: '#F8FAFA' }}>
      <Sidebar />

      {/* Main Content Area */}
      <Box sx={{ flex: 1, height: '100vh', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header Bar */}
        <TopHeader
          breadcrumb="Alert History"
          onRefresh={fetchAlerts}
        />

        {/* Page Container */}
        <Box sx={{ p: { xs: 2.5, md: 3.5 }, maxWidth: 1200, width: '100%', mx: 'auto', boxSizing: 'border-box' }}>
          {/* Overview Title Banner */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: '#0F766E',
                letterSpacing: '0.12em',
                fontSize: '0.68rem',
                textTransform: 'uppercase',
                display: 'block',
                mb: 0.4,
              }}
            >
              INCIDENT AUDIT
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: '#0F172A',
                letterSpacing: '-0.02em',
                fontSize: '1.65rem',
                lineHeight: 1.2,
                mb: 0.5,
              }}
            >
              Alert History & Incident Lifecycle
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.84rem' }}>
              Complete audit trail tracking when security alerts were triggered and resolved across your cloud infrastructure.
            </Typography>
          </Box>

          {/* Filter Pills & Summary Card */}
          <Card
            elevation={0}
            sx={{
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              overflow: 'hidden',
              mb: 3,
            }}
          >
            <Box
              sx={{
                p: 1.8,
                px: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1.5,
                borderBottom: '1px solid #F1F5F9',
                bgcolor: '#FCFDFD',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.78rem' }}>
                  Filter by Lifecycle:
                </Typography>
                <Stack direction="row" spacing={0.8}>
                  <Button
                    size="small"
                    variant={filter === 'ALL' ? 'contained' : 'outlined'}
                    onClick={() => setFilter('ALL')}
                    sx={{
                      borderRadius: '6px',
                      textTransform: 'none',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      py: 0.4,
                      px: 1.2,
                      bgcolor: filter === 'ALL' ? '#0F766E' : '#FFFFFF',
                      borderColor: filter === 'ALL' ? '#0F766E' : '#E2E8F0',
                      color: filter === 'ALL' ? '#FFFFFF' : '#475569',
                      boxShadow: 'none',
                      '&:hover': { bgcolor: filter === 'ALL' ? '#0D655E' : '#F8FAFC', boxShadow: 'none' },
                    }}
                  >
                    All ({alerts.length})
                  </Button>
                  <Button
                    size="small"
                    variant={filter === 'OPEN' ? 'contained' : 'outlined'}
                    onClick={() => setFilter('OPEN')}
                    sx={{
                      borderRadius: '6px',
                      textTransform: 'none',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      py: 0.4,
                      px: 1.2,
                      bgcolor: filter === 'OPEN' ? '#DC2626' : '#FFFFFF',
                      borderColor: filter === 'OPEN' ? '#DC2626' : '#E2E8F0',
                      color: filter === 'OPEN' ? '#FFFFFF' : '#DC2626',
                      boxShadow: 'none',
                      '&:hover': { bgcolor: filter === 'OPEN' ? '#B91C1C' : '#FEF2F2', boxShadow: 'none' },
                    }}
                  >
                    Open ({openCount})
                  </Button>
                  <Button
                    size="small"
                    variant={filter === 'RESOLVED' ? 'contained' : 'outlined'}
                    onClick={() => setFilter('RESOLVED')}
                    sx={{
                      borderRadius: '6px',
                      textTransform: 'none',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      py: 0.4,
                      px: 1.2,
                      bgcolor: filter === 'RESOLVED' ? '#16A34A' : '#FFFFFF',
                      borderColor: filter === 'RESOLVED' ? '#16A34A' : '#E2E8F0',
                      color: filter === 'RESOLVED' ? '#FFFFFF' : '#16A34A',
                      boxShadow: 'none',
                      '&:hover': { bgcolor: filter === 'RESOLVED' ? '#15803D' : '#ECFDF5', boxShadow: 'none' },
                    }}
                  >
                    Resolved ({resolvedCount})
                  </Button>
                </Stack>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {isAdmin && openCount > 0 && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handleResolveAll}
                    disabled={resolvingAll}
                    startIcon={<DoneAllIcon sx={{ fontSize: 15 }} />}
                    sx={{
                      borderRadius: '6px',
                      textTransform: 'none',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      py: 0.35,
                      px: 1.4,
                      borderColor: '#99F6E4',
                      bgcolor: '#F0FDFA',
                      color: '#0F766E',
                      '&:hover': {
                        bgcolor: '#CCFBF1',
                        borderColor: '#0F766E',
                      },
                    }}
                  >
                    {resolvingAll ? 'Resolving...' : `Resolve All Open (${openCount})`}
                  </Button>
                )}
                <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.72rem' }}>
                  Auto-refreshes every 15 seconds
                </Typography>
              </Box>
            </Box>

            {/* Table */}
            {loading ? (
              <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={32} sx={{ color: '#0F766E' }} />
              </Box>
            ) : (
              <TableContainer component={Box}>
                <Table sx={{ width: '100%', tableLayout: 'auto' }} size="small">
                  <TableHead>
                    <TableRow sx={{ '& th': { bgcolor: '#F8FAFC', color: '#64748B', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', py: 1.2 } }}>
                      <TableCell sx={{ width: 80 }}>ID</TableCell>
                      <TableCell sx={{ width: 160 }}>Asset Name</TableCell>
                      <TableCell sx={{ width: 110 }}>Severity</TableCell>
                      <TableCell sx={{ minWidth: 320 }}>Incident Message</TableCell>
                      <TableCell sx={{ width: 110 }}>Status</TableCell>
                      <TableCell sx={{ width: 160 }}>Alert Created</TableCell>
                      <TableCell sx={{ width: 160 }}>Alert Resolved</TableCell>
                      {isAdmin && <TableCell align="right" sx={{ width: 100 }}>Action</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAlerts.map((a) => {
                      const sev = severityBadgeStyle(a.severity);
                      const isOpen = a.status?.toUpperCase() === 'OPEN';

                      return (
                        <TableRow
                          key={a.id}
                          hover
                          sx={{
                            '&:hover': { bgcolor: '#F8FAFC' },
                            transition: 'background-color 0.1s',
                          }}
                        >
                          <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, color: '#64748B', fontSize: '0.78rem' }}>
                            #{a.id}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.82rem' }}>
                            {a.assetName || 'System Asset'}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={a.severity}
                              size="small"
                              sx={{
                                bgcolor: sev.bg,
                                color: sev.text,
                                border: `1px solid ${sev.border}`,
                                fontWeight: 600,
                                fontSize: '0.66rem',
                                height: 22,
                                px: 0.3,
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: '#475569', fontSize: '0.8rem', lineHeight: 1.4 }}>
                            {formatMessage(a.message)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={isOpen ? <ErrorOutlineIcon sx={{ fontSize: '13px !important', color: '#DC2626 !important' }} /> : <CheckCircleOutlineIcon sx={{ fontSize: '13px !important', color: '#059669 !important' }} />}
                              label={a.status}
                              size="small"
                              sx={{
                                bgcolor: isOpen ? '#FEF2F2' : '#ECFDF5',
                                color: isOpen ? '#DC2626' : '#059669',
                                border: `1px solid ${isOpen ? '#FECACA' : '#A7F3D0'}`,
                                fontWeight: 600,
                                fontSize: '0.66rem',
                                height: 22,
                                px: 0.3,
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#0F172A' }}>
                            {a.createdAt ? new Date(a.createdAt).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            }) : '—'}
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                            {a.resolvedAt ? (
                              <Typography component="span" sx={{ color: '#059669', fontWeight: 600, fontSize: '0.75rem', fontFamily: 'monospace' }}>
                                {new Date(a.resolvedAt).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit',
                                })}
                              </Typography>
                            ) : (
                              <Chip
                                label="Active / Unresolved"
                                size="small"
                                sx={{
                                  bgcolor: '#FFFBEB',
                                  color: '#D97706',
                                  border: '1px solid #FDE68A',
                                  fontSize: '0.66rem',
                                  fontWeight: 600,
                                  height: 20,
                                }}
                              />
                            )}
                          </TableCell>
                          {isAdmin && (
                            <TableCell align="right">
                              {isOpen ? (
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={() => handleResolve(a.id, a.assetName)}
                                  sx={{
                                    bgcolor: '#0F766E',
                                    color: '#FFFFFF',
                                    fontWeight: 600,
                                    fontSize: '0.72rem',
                                    textTransform: 'none',
                                    borderRadius: '5px',
                                    px: 1.2,
                                    py: 0.2,
                                    boxShadow: 'none',
                                    '&:hover': { bgcolor: '#0D655E', boxShadow: 'none' },
                                  }}
                                >
                                  Resolve
                                </Button>
                              ) : (
                                <Typography variant="caption" sx={{ color: '#94A3B8', fontStyle: 'italic', fontSize: '0.72rem' }}>
                                  Resolved
                                </Typography>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}

                    {filteredAlerts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={isAdmin ? 8 : 7} align="center" sx={{ py: 6, color: '#94A3B8' }}>
                          <Typography variant="subtitle2" sx={{ color: '#475569', fontWeight: 600, fontSize: '0.85rem' }}>
                            No alerts matching filter "{filter}"
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.75rem' }}>
                            All monitored assets are operating safely within defined thresholds.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>
        </Box>
      </Box>

      {/* Snackbar notification on resolution */}
      <Snackbar
        open={Boolean(actionMessage)}
        autoHideDuration={4000}
        onClose={() => setActionMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MuiAlert severity="success" onClose={() => setActionMessage(null)} sx={{ width: '100%', bgcolor: '#0F172A', color: '#FFFFFF' }}>
          {actionMessage}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}
