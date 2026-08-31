import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, TextField, Button, Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Chip, AppBar, Toolbar,
  MenuItem, Select, InputLabel, FormControl,
  Dialog, DialogTitle, DialogContent, DialogActions, Skeleton
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getAllAssets, getDashboardSummary, createAsset, deleteAsset } from '../api/assetApi';
import AlertNotifier from './AlertNotifier';
import { useAuth } from '../context/AuthContext';

const statusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'ONLINE': case 'UP': return { bg: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)', text: '#E8F5E9', border: '#4CAF50' };
    case 'WARNING': return { bg: 'linear-gradient(135deg, #E65100 0%, #F57C00 100%)', text: '#FFF3E0', border: '#FF9800' };
    case 'CRITICAL': case 'DOWN': return { bg: 'linear-gradient(135deg, #880E4F 0%, #C2185B 100%)', text: '#FCE4EC', border: '#E91E63' };
    default: return { bg: 'linear-gradient(135deg, #263238 0%, #37474F 100%)', text: '#ECEFF1', border: '#607D8B' };
  }
};

function Dashboard() {
  const navigate = useNavigate();
  const { isAdmin, logoutUser } = useAuth();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({ totalAssets: 0, uptimePercent: 0, activeAlerts: 0 });
  const [formData, setFormData] = useState({
    assetName: '', assetType: '', ipAddress: '',
    cpuUsage: '', memoryUsage: '', diskUsage: '', networkUsage: '', assetStatus: ''
  });

  // --- Search / filter state ---
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // --- Delete confirmation state ---
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchAssets = () => {
    getAllAssets()
      .then((response) => { setAssets(response.data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  };

  useEffect(() => { fetchAssets(); }, []);
  useEffect(() => { getDashboardSummary().then((res) => setSummary(res.data)); }, [assets]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    createAsset(formData)
      .then(() => {
        setFormData({ assetName: '', assetType: '', ipAddress: '', cpuUsage: '', memoryUsage: '', diskUsage: '', networkUsage: '', assetStatus: '' });
        fetchAssets();
      })
      .catch((err) => alert('Error creating asset: ' + (err.response?.data?.message || err.message)));
  };

  const requestDelete = (asset) => setConfirmDelete(asset);

  const confirmDeleteAsset = () => {
    if (!confirmDelete) return;
    deleteAsset(confirmDelete.id)
      .then(() => { fetchAssets(); setConfirmDelete(null); })
      .catch((err) => { alert('Error deleting asset: ' + (err.response?.data?.message || err.message)); setConfirmDelete(null); });
  };

  const filteredAssets = assets.filter((asset) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      term === '' ||
      asset.assetName?.toLowerCase().includes(term) ||
      asset.assetType?.toLowerCase().includes(term) ||
      asset.ipAddress?.toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === 'ALL' || asset.assetStatus?.toUpperCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (error) return <Typography sx={{ p: 3 }} color="error">Error: {error}</Typography>;

  return (
    <Box sx={{ bgcolor: '#EEF2F1', minHeight: '100vh' }}>
      <AlertNotifier />
      <AppBar position="static" sx={{ bgcolor: '#1E2E2C' }} elevation={0}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>
              Cloud security monitoring system with incident management assistance
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.65, fontFamily: 'monospace' }}>
              Infrastructure Monitoring
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              onClick={() => navigate('/alerts')}
              sx={{ color: '#EEF2F1', borderColor: '#4A7A73' }}
              variant="outlined"
              size="small"
            >
              Alert History
            </Button>
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

        {/* Summary Cards */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Assets', value: summary.totalAssets, color: '#1E2E2C', clickable: false },
            { label: 'Uptime', value: `${summary.uptimePercent}%`, color: '#2E7D32', clickable: false },
            { label: 'Active Alerts', value: summary.activeAlerts, color: summary.activeAlerts > 0 ? '#C62828' : 'inherit', clickable: true }
          ].map((card, idx) => (
            <Card
              key={idx}
              elevation={0}
              onClick={card.clickable ? () => navigate('/alerts') : undefined}
              sx={{
                border: '1px solid #D8E0DE',
                borderRadius: 2,
                width: 220,
                cursor: card.clickable ? 'pointer' : 'default',
                transition: 'transform 0.15s, box-shadow 0.15s',
                '&:hover': card.clickable ? { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' } : {}
              }}
            >
              <CardContent>
                <Typography variant="overline" color="text.secondary">{card.label}</Typography>
                {loading ? (
                  <Skeleton variant="text" width="60%" height={60} />
                ) : (
                  <Typography variant="h3" sx={{ fontWeight: 700, color: card.color }}>
                    {card.value}
                  </Typography>
                )}
                {card.clickable && !loading && (
                  <Typography variant="caption" sx={{ color: '#4A7A73', textDecoration: 'underline' }}>
                    Click to view history →
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Add Asset Form - Admin Only */}
        {isAdmin && (
          <Card elevation={0} sx={{ mb: 4, border: '1px solid #D8E0DE', borderRadius: 2 }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3, color: '#1E2E2C' }}>
              Register New Asset
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 900 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}><TextField fullWidth size="small" label="Asset Name" name="assetName" value={formData.assetName} onChange={handleChange} required /></Grid>
                <Grid item xs={12} sm={4}><TextField fullWidth size="small" label="Asset Type" name="assetType" value={formData.assetType} onChange={handleChange} /></Grid>
                <Grid item xs={12} sm={4}><TextField fullWidth size="small" label="IP Address" name="ipAddress" value={formData.ipAddress} onChange={handleChange} sx={{ '& input': { fontFamily: 'monospace' } }} /></Grid>
                <Grid item xs={6} sm={3}><TextField fullWidth size="small" type="number" label="CPU %" name="cpuUsage" value={formData.cpuUsage} onChange={handleChange} /></Grid>
                <Grid item xs={6} sm={3}><TextField fullWidth size="small" type="number" label="Memory %" name="memoryUsage" value={formData.memoryUsage} onChange={handleChange} /></Grid>
                <Grid item xs={6} sm={3}><TextField fullWidth size="small" type="number" label="Disk %" name="diskUsage" value={formData.diskUsage} onChange={handleChange} /></Grid>
                <Grid item xs={6} sm={3}><TextField fullWidth size="small" type="number" label="Network" name="networkUsage" value={formData.networkUsage} onChange={handleChange} /></Grid>
                <Grid item xs={12}><TextField fullWidth size="small" label="Status (ONLINE/WARNING/CRITICAL)" name="assetStatus" value={formData.assetStatus} onChange={handleChange} /></Grid>
              </Grid>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button
                  variant="contained"
                  type="submit"
                  sx={{ bgcolor: '#2F4F4B', px: 6, py: 1.2, '&:hover': { bgcolor: '#3D615C' } }}
                >
                  Add Asset
                </Button>
              </Box>
            </Box>
            </CardContent>
          </Card>
        )}

        {/* Usage Chart */}
        <Card elevation={0} sx={{ mb: 4, border: '1px solid #D8E0DE', borderRadius: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#1E2E2C', textAlign: 'center' }}>
              Resource Usage by Asset
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={assets}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5EAE9" />
                <XAxis dataKey="assetName" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="cpuUsage" fill="#1E2E2C" name="CPU %" radius={[3, 3, 0, 0]} isAnimationActive={true} animationDuration={1000} />
                <Bar dataKey="memoryUsage" fill="#4A7A73" name="Memory %" radius={[3, 3, 0, 0]} isAnimationActive={true} animationDuration={1000} />
                <Bar dataKey="diskUsage" fill="#A9BFB9" name="Disk %" radius={[3, 3, 0, 0]} isAnimationActive={true} animationDuration={1000} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Assets Table */}
        <Card elevation={0} sx={{ border: '1px solid #D8E0DE', borderRadius: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#1E2E2C', textAlign: 'center' }}>
              Current Assets
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              <TextField
                size="small"
                label="Search by name, type, or IP"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ minWidth: 260 }}
              />
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="ALL">All Statuses</MenuItem>
                  <MenuItem value="ONLINE">Online</MenuItem>
                  <MenuItem value="WARNING">Warning</MenuItem>
                  <MenuItem value="CRITICAL">Critical</MenuItem>
                  <MenuItem value="OFFLINE">Offline</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Typography variant="caption" sx={{ display: 'block', mb: 1, color: '#607068' }}>
              Showing {loading ? <Skeleton width={20} display="inline-block" /> : filteredAssets.length} of {loading ? <Skeleton width={20} display="inline-block" /> : assets.length} assets
            </Typography>

            <TableContainer component={Paper} elevation={0}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: '#F5F8F7' } }}>
                    <TableCell>ID</TableCell><TableCell>Name</TableCell><TableCell>Type</TableCell>
                    <TableCell>IP</TableCell><TableCell>CPU %</TableCell><TableCell>Memory %</TableCell>
                    <TableCell>Disk %</TableCell><TableCell>Network</TableCell><TableCell>Status</TableCell>
                    {isAdmin && <TableCell align="right">Action</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAssets.map((asset) => {
                    const sc = statusColor(asset.assetStatus);
                    return (
                      <TableRow key={asset.id} hover>
                        <TableCell sx={{ fontFamily: 'monospace' }}>{asset.id}</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{asset.assetName}</TableCell>
                        <TableCell>{asset.assetType}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>{asset.ipAddress}</TableCell>
                        <TableCell>{asset.cpuUsage}</TableCell>
                        <TableCell>{asset.memoryUsage}</TableCell>
                        <TableCell>{asset.diskUsage}</TableCell>
                        <TableCell>{asset.networkUsage}</TableCell>
                        <TableCell>
                          <Chip label={asset.assetStatus} size="small" sx={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`, fontWeight: 600, boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }} />
                        </TableCell>
                        {isAdmin && (
                          <TableCell align="right">
                            <Button color="error" size="small" onClick={() => requestDelete(asset)}>Delete</Button>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={`skeleton-${i}`}>
                        <TableCell colSpan={10}><Skeleton animation="wave" height={35} /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredAssets.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} align="center" sx={{ color: '#8A9A95', py: 3 }}>
                        No assets match your search/filter.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Delete Asset?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{confirmDelete?.assetName}</strong>? This can't be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button onClick={confirmDeleteAsset} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Dashboard;