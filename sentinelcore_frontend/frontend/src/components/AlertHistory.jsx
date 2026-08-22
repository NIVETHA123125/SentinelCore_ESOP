import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Button, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Chip, AppBar, Toolbar,
  MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import { getAllAlerts, resolveAlert } from '../api/alertApi';
import AlertNotifier from './AlertNotifier';
import { useAuth } from '../context/AuthContext';

const severityColor = (severity) => {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL': return { bg: '#7F1D1D', text: '#FCA5A5' };
    case 'HIGH': return { bg: '#8C2F1B', text: '#FFAB91' };
    case 'MEDIUM': return { bg: '#7A4F01', text: '#FFCC80' };
    case 'LOW': return { bg: '#37474F', text: '#CFD8DC' };
    default: return { bg: '#37474F', text: '#CFD8DC' };
  }
};

const alertStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'OPEN': return { bg: '#7F1D1D', text: '#FCA5A5' };
    case 'ACKNOWLEDGED': return { bg: '#7A4F01', text: '#FFCC80' };
    case 'RESOLVED': return { bg: '#1B5E20', text: '#A5D6A7' };
    default: return { bg: '#37474F', text: '#CFD8DC' };
  }
};

function AlertHistory() {
  const navigate = useNavigate();
  const { logoutUser, isAdmin } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [alertStatusFilter, setAlertStatusFilter] = useState('ALL');

  const fetchAlerts = () => {
    getAllAlerts()
      .then((response) => {
        setAlerts(response.data);
        setAlertsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load alert history', err);
        setAlertsLoading(false);
      });
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleResolve = (alertId) => {
    resolveAlert(alertId)
      .then(() => fetchAlerts())
      .catch((err) => alert('Error resolving alert: ' + err.message));
  };

  const filteredAlerts = alerts.filter(
    (a) => alertStatusFilter === 'ALL' || a.status?.toUpperCase() === alertStatusFilter
  );

  return (
    <Box sx={{ bgcolor: '#EEF2F1', minHeight: '100vh' }}>
      <AlertNotifier />
      <AppBar position="static" sx={{ bgcolor: '#1E2E2C' }} elevation={0}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              onClick={() => navigate('/dashboard')}
              sx={{ color: '#EEF2F1', borderColor: '#4A7A73' }}
              variant="outlined"
              size="small"
            >
              ← Dashboard
            </Button>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>
                Cloud Security Monitoring System
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.65, fontFamily: 'monospace' }}>
                Alert History & Incident Management
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              onClick={logoutUser}
              sx={{ color: '#EEF2F1', borderColor: '#4A7A73' }}
              variant="outlined"
              size="small"
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, sm: 3, md: 8 } }}>
        <Card elevation={0} sx={{ border: '1px solid #D8E0DE', borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E2E2C' }}>
                Incident Alert History ({alerts.length} Total Alerts)
              </Typography>

              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={alertStatusFilter}
                  label="Filter by Status"
                  onChange={(e) => setAlertStatusFilter(e.target.value)}
                >
                  <MenuItem value="ALL">All Alerts</MenuItem>
                  <MenuItem value="OPEN">Open</MenuItem>
                  <MenuItem value="ACKNOWLEDGED">Acknowledged</MenuItem>
                  <MenuItem value="RESOLVED">Resolved</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {alertsLoading ? (
              <Typography sx={{ textAlign: 'center', color: '#8A9A95', py: 4 }}>
                Loading alert history...
              </Typography>
            ) : (
              <TableContainer component={Paper} elevation={0}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: '#F5F8F7' } }}>
                      <TableCell>ID</TableCell>
                      <TableCell>Asset Name</TableCell>
                      <TableCell>Severity</TableCell>
                      <TableCell>Message</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Created At</TableCell>
                      <TableCell>Resolved At</TableCell>
                      {isAdmin && <TableCell align="right">Action</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAlerts.map((a) => {
                      const sevC = severityColor(a.severity);
                      const stC = alertStatusColor(a.status);
                      return (
                        <TableRow key={a.id} hover>
                          <TableCell sx={{ fontFamily: 'monospace' }}>{a.id}</TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>{a.assetName}</TableCell>
                          <TableCell>
                            <Chip label={a.severity} size="small" sx={{ bgcolor: sevC.bg, color: sevC.text, fontWeight: 600 }} />
                          </TableCell>
                          <TableCell sx={{ maxWidth: 280 }}>{a.message}</TableCell>
                          <TableCell>
                            <Chip label={a.status} size="small" sx={{ bgcolor: stC.bg, color: stC.text, fontWeight: 600 }} />
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                            {a.createdAt ? new Date(a.createdAt).toLocaleString() : '-'}
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                            {a.resolvedAt ? new Date(a.resolvedAt).toLocaleString() : '-'}
                          </TableCell>
                          {isAdmin && (
                            <TableCell align="right">
                              {a.status?.toUpperCase() === 'OPEN' && (
                                <Button size="small" variant="contained" sx={{ bgcolor: '#2F4F4B' }} onClick={() => handleResolve(a.id)}>
                                  Resolve
                                </Button>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                    {filteredAlerts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={isAdmin ? 8 : 7} align="center" sx={{ color: '#8A9A95', py: 4 }}>
                          No alerts match this filter.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default AlertHistory;
