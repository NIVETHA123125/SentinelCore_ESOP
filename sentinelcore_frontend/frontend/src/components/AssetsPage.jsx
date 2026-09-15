import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, TextField, Button, Grid, Card,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, Chip,
  MenuItem, Select, InputLabel, FormControl,
  Dialog, DialogTitle, DialogContent, DialogActions, Skeleton, IconButton,
  Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlined';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getAllAssets, getDashboardSummary, createAsset, deleteAsset, resolveCriticalAsset, updateAsset } from '../api/assetApi';
import { getAllAlerts } from '../api/alertApi';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import { useAuth } from '../context/AuthContext';

const statusBadgeStyle = (status) => {
  switch (status?.toUpperCase()) {
    case 'ONLINE': case 'UP':
      return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' };
    case 'WARNING':
      return { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' };
    case 'CRITICAL': case 'DOWN':
      return { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' };
    default:
      return { bg: '#F8FAFC', text: '#64748B', border: '#E2E8F0' };
  }
};

export default function AssetsPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openAlertsCount, setOpenAlertsCount] = useState(0);

  // --- Add Asset Dialog Modal State ---
  const [openAddModal, setOpenAddModal] = useState(false);
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
    return getAllAssets()
      .then((response) => {
        setAssets(response.data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const fetchAlerts = () => {
    return getAllAlerts()
      .then((res) => {
        const openOnes = (res.data || []).filter((a) => a.status?.toUpperCase() === 'OPEN');
        setOpenAlertsCount(openOnes.length);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchAssets();
    fetchAlerts();
  }, []);

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
        setOpenAddModal(false);
        fetchAssets();
      })
      .catch((err) => alert('Error creating asset: ' + (err.response?.data?.message || err.message)));
  };

  const requestDelete = (asset) => setConfirmDelete(asset);

  const confirmDeleteAsset = () => {
    if (!confirmDelete) return;
    deleteAsset(confirmDelete.id)
      .then(() => {
        fetchAssets();
        setConfirmDelete(null);
      })
      .catch((err) => {
        alert('Error deleting asset: ' + (err.response?.data?.message || err.message));
        setConfirmDelete(null);
      });
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

  const totalAssetsCount = assets.length;
  const onlineAssetsCount = assets.filter((a) => (a.assetStatus || '').toUpperCase() === 'ONLINE' || (a.assetStatus || '').toUpperCase() === 'UP').length;
  const warningAssetsCount = assets.filter((a) => (a.assetStatus || '').toUpperCase() === 'WARNING').length;
  const criticalAssetsCount = assets.filter((a) => (a.assetStatus || '').toUpperCase() === 'CRITICAL' || (a.assetStatus || '').toUpperCase() === 'DOWN').length;

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

  const chartData = assets.map((a) => ({
    name: a.assetName,
    CPU: a.cpuUsage,
    Memory: a.memoryUsage,
    Disk: a.diskUsage,
  }));

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error">Error loading assets: {error}</Typography>
        <Button onClick={fetchAssets} sx={{ mt: 2 }} variant="outlined">Retry</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden', bgcolor: '#F8FAFA' }}>
      <Sidebar />

      {/* Main Content Area */}
      <Box sx={{ flex: 1, height: '100vh', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header Bar */}
        <TopHeader
          breadcrumb="Assets"
          onRefresh={() => Promise.all([fetchAssets(), fetchAlerts()])}
        />

        {/* Page Container */}
        <Box sx={{ p: { xs: 2.5, md: 3.5 }, maxWidth: 1200, width: '100%', mx: 'auto', boxSizing: 'border-box' }}>
          {/* Overview Header */}
          <Box sx={{ mb: 3, textAlign: 'center' }}>
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
              INVENTORY
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
              Infrastructure Assets
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.84rem' }}>
              Manage, monitor, and configure cloud servers, databases, and microservices.
            </Typography>
          </Box>

          {/* 4 Summary Stat Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 2, mb: 3, width: '100%' }}>
            <Card elevation={0} sx={{ borderRadius: '10px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 1.8, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#94A3B8', fontSize: '0.66rem', textTransform: 'uppercase' }}>TOTAL ASSETS</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#0F172A', my: 0.4 }}>{loading ? <Skeleton width={40} sx={{ mx: 'auto' }} /> : totalAssetsCount}</Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.7rem' }}>All Monitored</Typography>
            </Card>
            <Card elevation={0} sx={{ borderRadius: '10px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 1.8, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#94A3B8', fontSize: '0.66rem', textTransform: 'uppercase' }}>ONLINE</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#16A34A', my: 0.4 }}>{loading ? <Skeleton width={40} sx={{ mx: 'auto' }} /> : onlineAssetsCount}</Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.7rem' }}>Operational</Typography>
            </Card>
            <Card elevation={0} sx={{ borderRadius: '10px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 1.8, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#94A3B8', fontSize: '0.66rem', textTransform: 'uppercase' }}>WARNING</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#D97706', my: 0.4 }}>{loading ? <Skeleton width={40} sx={{ mx: 'auto' }} /> : warningAssetsCount}</Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.7rem' }}>Threshold Exceeded</Typography>
            </Card>
            <Card elevation={0} sx={{ borderRadius: '10px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 1.8, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#94A3B8', fontSize: '0.66rem', textTransform: 'uppercase' }}>CRITICAL</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#DC2626', my: 0.4 }}>{loading ? <Skeleton width={40} sx={{ mx: 'auto' }} /> : criticalAssetsCount}</Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.7rem' }}>Requires Action</Typography>
            </Card>
          </Box>

          {/* Full Assets Table Card */}
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
            {/* Table Toolbar */}
            <Box
              sx={{
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 1.5,
                borderBottom: '1px solid #F1F5F9',
                bgcolor: '#FCFDFD',
              }}
            >
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.92rem', lineHeight: 1.2 }}>
                  All Infrastructure Assets ({assets.length})
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.74rem' }}>
                  View metrics, edit thresholds inline, or manage server lifecycle
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  placeholder="Search name, type, IP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ width: 200, bgcolor: '#FFFFFF', '& .MuiInputBase-input': { fontSize: '0.8rem', py: 0.8 } }}
                />

                <FormControl size="small" sx={{ width: 130, bgcolor: '#FFFFFF' }}>
                  <InputLabel sx={{ fontSize: '0.8rem' }}>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{ fontSize: '0.8rem', height: 35 }}
                  >
                    <MenuItem value="ALL">All Statuses</MenuItem>
                    <MenuItem value="ONLINE">Online</MenuItem>
                    <MenuItem value="WARNING">Warning</MenuItem>
                    <MenuItem value="CRITICAL">Critical</MenuItem>
                  </Select>
                </FormControl>

                {isAdmin && (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                    onClick={() => setOpenAddModal(true)}
                    sx={{
                      bgcolor: '#0F766E',
                      color: '#FFFFFF',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      textTransform: 'none',
                      borderRadius: '6px',
                      px: 1.8,
                      py: 0.7,
                      boxShadow: 'none',
                      '&:hover': { bgcolor: '#0D655E', boxShadow: 'none' },
                    }}
                  >
                    Add Asset
                  </Button>
                )}
              </Box>
            </Box>

            {/* Assets Table */}
            <TableContainer component={Box}>
              <Table sx={{ width: '100%' }} size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { bgcolor: '#F8FAFC', color: '#64748B', fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', py: 1.2 } }}>
                    <TableCell>Asset Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>IP Address</TableCell>
                    <TableCell align="right">CPU</TableCell>
                    <TableCell align="right">Memory</TableCell>
                    <TableCell align="right">Disk</TableCell>
                    <TableCell align="right">Network</TableCell>
                    <TableCell>Status</TableCell>
                    {isAdmin && <TableCell align="right">Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAssets.map((asset) => {
                    const badge = statusBadgeStyle(asset.assetStatus);
                    const isCritical = (asset.assetStatus || '').toUpperCase() === 'CRITICAL';

                    return (
                      <TableRow
                        key={asset.id}
                        hover
                        sx={{
                          '&:hover': { bgcolor: '#F8FAFC' },
                          transition: 'background-color 0.1s',
                        }}
                      >
                        <TableCell sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.82rem' }}>
                          {asset.assetName}
                        </TableCell>
                        <TableCell sx={{ color: '#64748B', fontSize: '0.8rem' }}>
                          {asset.assetType}
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', color: '#64748B', fontSize: '0.78rem' }}>
                          {asset.ipAddress}
                        </TableCell>

                        {/* Editable CPU */}
                        <TableCell align="right">
                          {isAdmin && editingCell?.assetId === asset.id && editingCell?.field === 'cpuUsage' ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                              <TextField
                                size="small"
                                type="number"
                                value={editingCell.value}
                                onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
                                sx={{ width: 65, '& input': { p: 0.5, fontSize: '0.78rem' } }}
                              />
                              <IconButton size="small" color="primary" onClick={() => handleEditSave(asset)}><CheckIcon fontSize="small" /></IconButton>
                              <IconButton size="small" onClick={cancelEditing}><CloseIcon fontSize="small" /></IconButton>
                            </Box>
                          ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                              <Typography sx={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600, color: (parseFloat(asset.cpuUsage) || 0) >= 90 ? '#DC2626' : '#0F172A' }}>
                                {asset.cpuUsage}%
                              </Typography>
                              {isAdmin && (
                                <IconButton size="small" onClick={() => startEditing(asset.id, 'cpuUsage', asset.cpuUsage)} sx={{ p: 0.2, color: '#94A3B8' }}>
                                  <EditIcon sx={{ fontSize: 13 }} />
                                </IconButton>
                              )}
                            </Box>
                          )}
                        </TableCell>

                        {/* Editable Memory */}
                        <TableCell align="right">
                          {isAdmin && editingCell?.assetId === asset.id && editingCell?.field === 'memoryUsage' ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                              <TextField
                                size="small"
                                type="number"
                                value={editingCell.value}
                                onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
                                sx={{ width: 65, '& input': { p: 0.5, fontSize: '0.78rem' } }}
                              />
                              <IconButton size="small" color="primary" onClick={() => handleEditSave(asset)}><CheckIcon fontSize="small" /></IconButton>
                              <IconButton size="small" onClick={cancelEditing}><CloseIcon fontSize="small" /></IconButton>
                            </Box>
                          ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                              <Typography sx={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600, color: (parseFloat(asset.memoryUsage) || 0) >= 90 ? '#DC2626' : '#0F172A' }}>
                                {asset.memoryUsage}%
                              </Typography>
                              {isAdmin && (
                                <IconButton size="small" onClick={() => startEditing(asset.id, 'memoryUsage', asset.memoryUsage)} sx={{ p: 0.2, color: '#94A3B8' }}>
                                  <EditIcon sx={{ fontSize: 13 }} />
                                </IconButton>
                              )}
                            </Box>
                          )}
                        </TableCell>

                        {/* Editable Disk */}
                        <TableCell align="right">
                          {isAdmin && editingCell?.assetId === asset.id && editingCell?.field === 'diskUsage' ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                              <TextField
                                size="small"
                                type="number"
                                value={editingCell.value}
                                onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
                                sx={{ width: 65, '& input': { p: 0.5, fontSize: '0.78rem' } }}
                              />
                              <IconButton size="small" color="primary" onClick={() => handleEditSave(asset)}><CheckIcon fontSize="small" /></IconButton>
                              <IconButton size="small" onClick={cancelEditing}><CloseIcon fontSize="small" /></IconButton>
                            </Box>
                          ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                              <Typography sx={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600, color: '#0F172A' }}>
                                {asset.diskUsage}%
                              </Typography>
                              {isAdmin && (
                                <IconButton size="small" onClick={() => startEditing(asset.id, 'diskUsage', asset.diskUsage)} sx={{ p: 0.2, color: '#94A3B8' }}>
                                  <EditIcon sx={{ fontSize: 13 }} />
                                </IconButton>
                              )}
                            </Box>
                          )}
                        </TableCell>

                        <TableCell align="right" sx={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#64748B' }}>
                          {asset.networkUsage} MB/s
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={asset.assetStatus}
                            size="small"
                            sx={{
                              bgcolor: badge.bg,
                              color: badge.text,
                              border: `1px solid ${badge.border}`,
                              fontWeight: 600,
                              fontSize: '0.68rem',
                              height: 22,
                              px: 0.4,
                            }}
                          />
                        </TableCell>

                        {isAdmin && (
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.8 }}>
                              {isCritical && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleResolveCritical(asset.id)}
                                  sx={{
                                    borderColor: '#0F766E',
                                    color: '#0F766E',
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    py: 0.2,
                                    px: 0.8,
                                    borderRadius: '4px',
                                    '&:hover': { bgcolor: '#F0FDFA' }
                                  }}
                                >
                                  Resolve
                                </Button>
                              )}

                              <IconButton
                                size="small"
                                onClick={() => requestDelete(asset)}
                                sx={{
                                  color: '#DC2626',
                                  p: 0.4,
                                  '&:hover': { bgcolor: 'rgba(220, 38, 38, 0.06)' },
                                }}
                              >
                                <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Box>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}

                  {filteredAssets.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 9 : 8} align="center" sx={{ py: 4, color: '#94A3B8' }}>
                        No infrastructure assets found matching query.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>

          {/* Hardware Distribution Chart */}
          {chartData.length > 0 && (
            <Card
              elevation={0}
              sx={{
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                bgcolor: '#FFFFFF',
                p: 2.5,
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                mb: 3,
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.92rem', mb: 0.2 }}>
                Hardware Resource Distribution
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.74rem', display: 'block', mb: 2 }}>
                Comparative CPU, Memory, and Disk metrics across all assets
              </Typography>
              <Box sx={{ width: '100%', height: 240, minWidth: 0, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} domain={[0, 100]} />
                    <RechartsTooltip />
                    <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: 8 }} />
                    <Bar dataKey="CPU" fill="#0F766E" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Memory" fill="#D97706" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Disk" fill="#64748B" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          )}
        </Box>
      </Box>

      {/* Add Asset Modal */}
      <Dialog
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '12px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#0F172A', fontSize: '1.1rem', pb: 0.5 }}>
          Add Infrastructure Asset
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 1 }}>
            <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.82rem', mb: 2 }}>
              Register a new server, database, or network node to SentinelCore monitoring.
            </Typography>
            <Grid container spacing={1.8}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Asset Name"
                  name="assetName"
                  value={formData.assetName}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Asset Type"
                  name="assetType"
                  value={formData.assetType}
                  onChange={handleChange}
                  placeholder="e.g. Server, Database"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="IP Address"
                  name="ipAddress"
                  value={formData.ipAddress}
                  onChange={handleChange}
                  placeholder="e.g. 192.168.1.10"
                  required
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="CPU %"
                  name="cpuUsage"
                  type="number"
                  value={formData.cpuUsage}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Memory %"
                  name="memoryUsage"
                  type="number"
                  value={formData.memoryUsage}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Disk %"
                  name="diskUsage"
                  type="number"
                  value={formData.diskUsage}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Network MB/s"
                  name="networkUsage"
                  type="number"
                  value={formData.networkUsage}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status (Optional)</InputLabel>
                  <Select
                    name="assetStatus"
                    value={formData.assetStatus}
                    label="Status (Optional)"
                    onChange={handleChange}
                  >
                    <MenuItem value="">Auto calculate from metrics</MenuItem>
                    <MenuItem value="ONLINE">ONLINE</MenuItem>
                    <MenuItem value="WARNING">WARNING</MenuItem>
                    <MenuItem value="CRITICAL">CRITICAL</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1 }}>
            <Button onClick={() => setOpenAddModal(false)} sx={{ color: '#64748B', textTransform: 'none', fontSize: '0.82rem' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                bgcolor: '#0F766E',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '0.82rem',
                textTransform: 'none',
                borderRadius: '6px',
                px: 2,
                '&:hover': { bgcolor: '#0D655E' },
              }}
            >
              Create Asset
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        PaperProps={{ sx: { borderRadius: '12px', p: 0.5 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#0F172A', fontSize: '1rem' }}>
          Delete Asset?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.84rem' }}>
            Are you sure you want to remove <strong>{confirmDelete?.assetName}</strong> ({confirmDelete?.ipAddress}) from SentinelCore? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmDelete(null)} sx={{ color: '#64748B', textTransform: 'none', fontSize: '0.82rem' }}>
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteAsset}
            variant="contained"
            sx={{
              bgcolor: '#DC2626',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '0.82rem',
              textTransform: 'none',
              borderRadius: '6px',
              '&:hover': { bgcolor: '#B91C1C' },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
