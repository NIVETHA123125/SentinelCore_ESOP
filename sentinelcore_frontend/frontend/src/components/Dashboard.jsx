import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, TextField, Button, Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Chip, AppBar, Toolbar,
  MenuItem, Select, InputLabel, FormControl,
  Dialog, DialogTitle, DialogContent, DialogActions, Skeleton, IconButton
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getAllAssets, getDashboardSummary, createAsset, deleteAsset, resolveCriticalAsset, updateAsset } from '../api/assetApi';
import AlertNotifier from './AlertNotifier';
import { useAuth } from '../context/AuthContext';

const statusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'ONLINE': case 'UP': return { bg: '#1B5E20', text: '#A5D6A7', border: '#2E7D32' };
    case 'WARNING': return { bg: '#7A4F01', text: '#FFCC80', border: '#F57C00' };
    case 'CRITICAL': case 'DOWN': return { bg: '#C62828', text: '#FFCDD2', border: '#E53935' };
    default: return { bg: '#37474F', text: '#CFD8DC', border: '#546E7A' };
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

  // --- Inline edit state: { assetId, field, value } ---
  const [editingCell, setEditingCell] = useState(null);

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
    const cpu = parseFloat(formData.cpuUsage) || 0;
    const mem = parseFloat(formData.memoryUsage) || 0;
    const disk = parseFloat(formData.diskUsage) || 0;

    let initialStatus = formData.assetStatus;
    if (!initialStatus) {
      if (cpu >= 90 || mem >= 90 || disk >= 90) {
        initialStatus = 'CRITICAL';
      } else if (cpu >= 70 || mem >= 70 || disk >= 70) {
        initialStatus = 'WARNING';
      } else {
        initialStatus = 'ONLINE';
      }
    }

    createAsset({ ...formData, assetStatus: initialStatus })
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

  const handleResolveCritical = (assetId) => {
    resolveCriticalAsset(assetId)
      .then(() => {
        fetchAssets();
      })
      .catch((err) => alert('Error resolving alert: ' + (err.response?.data?.message || err.message)));
  };

  const startEditing = (assetId, field, currentValue) => {
    setEditingCell({ assetId, field, value: currentValue ?? '' });
  };

  const cancelEditing = () => setEditingCell(null);

  const handleEditSave = (asset) => {
    if (!editingCell) return;

    const cpu = editingCell.field === 'cpuUsage' ? (parseFloat(editingCell.value) || 0) : (asset.cpuUsage ?? 0);
    const mem = editingCell.field === 'memoryUsage' ? (parseFloat(editingCell.value) || 0) : (asset.memoryUsage ?? 0);
    const disk = editingCell.field === 'diskUsage' ? (parseFloat(editingCell.value) || 0) : (asset.diskUsage ?? 0);

    let calculatedStatus = 'ONLINE';
    if (cpu >= 90 || mem >= 90 || disk >= 90) {
      calculatedStatus = 'CRITICAL';
    } else if (cpu >= 70 || mem >= 70 || disk >= 70) {
      calculatedStatus = 'WARNING';
    }

    const updatedData = {
      assetName: asset.assetName,
      assetType: asset.assetType,
      ipAddress: asset.ipAddress,
      cpuUsage: cpu,
      memoryUsage: mem,
      diskUsage: disk,
      networkUsage: asset.networkUsage,
      assetStatus: calculatedStatus
    };

    updateAsset(asset.id, updatedData)
      .then(() => {
        setEditingCell(null);
        fetchAssets();
      })
      .catch((err) => alert('Error updating asset: ' + (err.response?.data?.message || err.message)));
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
              <ShieldIcon sx={{ fontSize: 22, color: '#4A7A73' }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.5, lineHeight: 1.2 }}>
                SentinelCore
              </Typography>
              <Typography variant="caption" sx={{ color: '#9FB8B3', fontFamily: 'monospace' }}>
                Cloud Security & Infrastructure Monitoring
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            {isAdmin ? (
              <Chip
                label="ADMIN"
                size="small"
                sx={{
                  bgcolor: '#B08D57',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.68rem',
                  letterSpacing: '0.06em',
                  height: 24,
                  '& .MuiChip-label': { px: 1 },
                }}
              />
            ) : (
              <Chip
                label="VIEWER"
                size="small"
                sx={{
                  bgcolor: 'rgba(74, 122, 115, 0.25)',
                  color: '#EEF2F1',
                  fontWeight: 600,
                  fontSize: '0.68rem',
                  letterSpacing: '0.06em',
                  height: 24,
                  border: '1px solid rgba(74, 122, 115, 0.4)',
                  '& .MuiChip-label': { px: 1 },
                }}
              />
            )}
            <Button
              onClick={logoutUser}
              sx={{
                color: '#EEF2F1',
                borderColor: '#4A7A73',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#A5D6A7',
                  bgcolor: 'rgba(74, 122, 115, 0.15)',
                },
              }}
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
            { label: 'Active Alerts', value: summary.activeAlerts, color: summary.activeAlerts > 0 ? '#C62828' : 'inherit', clickable: false }
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

        {/* Usage Chart - Visible to all roles */}
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
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>IP</TableCell>
                    <TableCell>CPU %</TableCell>
                    <TableCell>Memory %</TableCell>
                    <TableCell>Disk %</TableCell>
                    <TableCell>Network</TableCell>
                    <TableCell>Status</TableCell>
                    {/* Role-gated: Admin sees Resolve & Action (Delete) columns; Viewer sees read-only table */}
                    {isAdmin && <TableCell align="center">Resolve</TableCell>}
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
                        {['cpuUsage', 'memoryUsage', 'diskUsage'].map((field) => (
                          <TableCell key={field}>
                            {editingCell && editingCell.assetId === asset.id && editingCell.field === field ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <TextField
                                  size="small"
                                  type="number"
                                  value={editingCell.value}
                                  onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleEditSave(asset);
                                    if (e.key === 'Escape') cancelEditing();
                                  }}
                                  autoFocus
                                  sx={{ width: 80, '& input': { py: 0.5, px: 1, fontSize: 13 } }}
                                />
                                <IconButton size="small" onClick={() => handleEditSave(asset)} sx={{ color: '#2E7D32' }}>
                                  <CheckIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" onClick={cancelEditing} sx={{ color: '#C62828' }}>
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            ) : (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                {asset[field]}
                                {isAdmin && (
                                  <IconButton
                                    size="small"
                                    onClick={() => startEditing(asset.id, field, asset[field])}
                                    sx={{ opacity: 0.4, '&:hover': { opacity: 1 }, p: 0.3 }}
                                  >
                                    <EditIcon sx={{ fontSize: 15 }} />
                                  </IconButton>
                                )}
                              </Box>
                            )}
                          </TableCell>
                        ))}
                        <TableCell>{asset.networkUsage}</TableCell>
                        <TableCell>
                          <Chip
                            label={asset.assetStatus}
                            size="small"
                            sx={{
                              bgcolor: sc.bg,
                              color: sc.text,
                              border: `1px solid ${sc.border}`,
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                            }}
                          />
                        </TableCell>

                        {/* Admin-only: Resolve critical alerts button */}
                        {isAdmin && (
                          <TableCell align="center">
                            {asset.assetStatus?.toUpperCase() === 'CRITICAL' ? (
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => handleResolveCritical(asset.id)}
                                sx={{
                                  bgcolor: '#C62828',
                                  color: '#FFFFFF',
                                  fontWeight: 700,
                                  fontSize: '0.75rem',
                                  px: 1.5,
                                  py: 0.4,
                                  textTransform: 'none',
                                  boxShadow: 'none',
                                  '&:hover': { bgcolor: '#B71C1C' }
                                }}
                              >
                                Resolve
                              </Button>
                            ) : (asset.assetStatus?.toUpperCase() === 'ONLINE' || asset.assetStatus?.toUpperCase() === 'UP') ? (
                              <Chip
                                label="Resolved"
                                size="small"
                                sx={{
                                  bgcolor: '#2E7D32',
                                  color: '#FFFFFF',
                                  fontWeight: 600,
                                  fontSize: '0.75rem'
                                }}
                              />
                            ) : (
                              <Typography variant="caption" sx={{ color: '#9E9E9E' }}>—</Typography>
                            )}
                          </TableCell>
                        )}

                        {/* Admin-only: Delete asset button */}
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
                        <TableCell colSpan={isAdmin ? 11 : 9}><Skeleton animation="wave" height={35} /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredAssets.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 11 : 9} align="center" sx={{ color: '#8A9A95', py: 3 }}>
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