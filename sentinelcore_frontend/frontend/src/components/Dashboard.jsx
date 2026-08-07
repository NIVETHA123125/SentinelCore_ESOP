import { useState, useEffect } from 'react';
import {
  Container, Typography, TextField, Button, Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Chip, AppBar, Toolbar
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getAllAssets, getDashboardSummary, createAsset, deleteAsset } from '../api/assetApi';

const statusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'ONLINE': case 'UP': return { bg: '#1B5E20', text: '#A5D6A7' };
    case 'WARNING': return { bg: '#7A4F01', text: '#FFCC80' };
    case 'CRITICAL': case 'DOWN': return { bg: '#7F1D1D', text: '#FCA5A5' };
    default: return { bg: '#37474F', text: '#CFD8DC' };
  }
};

function Dashboard() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({ totalAssets: 0, uptimePercent: 0, activeAlerts: 0 });
  const [formData, setFormData] = useState({
    assetName: '', assetType: '', ipAddress: '',
    cpuUsage: '', memoryUsage: '', diskUsage: '', networkUsage: '', assetStatus: ''
  });

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
      .catch((err) => alert('Error creating asset: ' + err.message));
  };

  const handleDelete = (id) => {
    deleteAsset(id).then(() => fetchAssets()).catch((err) => alert('Error deleting asset: ' + err.message));
  };

  if (loading) return <Typography sx={{ p: 3, fontFamily: 'monospace' }}>Loading assets...</Typography>;
  if (error) return <Typography sx={{ p: 3 }} color="error">Error: {error}</Typography>;

  return (
    <Box sx={{ bgcolor: '#EEF2F1', minHeight: '100vh' }}>
      <AppBar position="static" sx={{ bgcolor: '#1E2E2C' }} elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>
            SentinelCore ESOP
          </Typography>
          <Typography variant="body2" sx={{ ml: 2, opacity: 0.65, fontFamily: 'monospace' }}>
            Infrastructure Monitoring
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, sm: 3, md: 8 } }}>

        {/* Summary Cards - centered as a group */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          <Card elevation={0} sx={{ border: '1px solid #D8E0DE', borderRadius: 2, width: 220 }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Total Assets</Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#1E2E2C' }}>{summary.totalAssets}</Typography>
            </CardContent>
          </Card>
          <Card elevation={0} sx={{ border: '1px solid #D8E0DE', borderRadius: 2, width: 220 }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Uptime</Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#2E7D32' }}>{summary.uptimePercent}%</Typography>
            </CardContent>
          </Card>
          <Card elevation={0} sx={{ border: '1px solid #D8E0DE', borderRadius: 2, width: 220 }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Active Alerts</Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: summary.activeAlerts > 0 ? '#C62828' : 'inherit' }}>
                {summary.activeAlerts}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Add Asset Form */}
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
                <Bar dataKey="cpuUsage" fill="#1E2E2C" name="CPU %" radius={[3, 3, 0, 0]} />
                <Bar dataKey="memoryUsage" fill="#4A7A73" name="Memory %" radius={[3, 3, 0, 0]} />
                <Bar dataKey="diskUsage" fill="#A9BFB9" name="Disk %" radius={[3, 3, 0, 0]} />
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
            <TableContainer component={Paper} elevation={0}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: '#F5F8F7' } }}>
                    <TableCell>ID</TableCell><TableCell>Name</TableCell><TableCell>Type</TableCell>
                    <TableCell>IP</TableCell><TableCell>CPU %</TableCell><TableCell>Memory %</TableCell>
                    <TableCell>Disk %</TableCell><TableCell>Network</TableCell><TableCell>Status</TableCell><TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assets.map((asset) => {
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
                          <Chip label={asset.assetStatus} size="small" sx={{ bgcolor: sc.bg, color: sc.text, fontWeight: 600 }} />
                        </TableCell>
                        <TableCell align="right">
                          <Button color="error" size="small" onClick={() => handleDelete(asset.id)}>Delete</Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default Dashboard;