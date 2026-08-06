import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Typography, TextField, Button, Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function App() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [summary, setSummary] = useState({ totalAssets: 0, uptimePercent: 0, activeAlerts: 0 });
  const [formData, setFormData] = useState({
    assetName: '', assetType: '', ipAddress: '',
    cpuUsage: '', memoryUsage: '', diskUsage: '', networkUsage: '', assetStatus: ''
  });

  const fetchAssets = () => {
    axios.get('http://localhost:8080/api/assets')
      .then((response) => {
        setAssets(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAssets();
  }, []);

useEffect(() => {
  axios.get('http://localhost:8080/api/assets/dashboard/summary')
    .then((res) => setSummary(res.data));
}, [assets]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:8080/api/assets', formData)
      .then(() => {
        setFormData({
          assetName: '', assetType: '', ipAddress: '',
          cpuUsage: '', memoryUsage: '', diskUsage: '', networkUsage: '', assetStatus: ''
        });
        fetchAssets();
      })
      .catch((err) => {
        alert('Error creating asset: ' + err.message);
      });
  };

  const handleDelete = (id) => {
    axios.delete(`http://localhost:8080/api/assets/${id}`)
      .then(() => fetchAssets())
      .catch((err) => alert('Error deleting asset: ' + err.message));
  };

  if (loading) return <Typography sx={{ p: 3 }}>Loading assets...</Typography>;
  if (error) return <Typography sx={{ p: 3 }} color="error">Error: {error}</Typography>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        SentinelCore ESOP — Infrastructure Assets
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card><CardContent>
            <Typography variant="subtitle2">Total Assets</Typography>
            <Typography variant="h4">{summary.totalAssets}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card><CardContent>
            <Typography variant="subtitle2">Uptime %</Typography>
            <Typography variant="h4">{summary.uptimePercent}%</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card><CardContent>
            <Typography variant="subtitle2">Active Alerts</Typography>
            <Typography variant="h4" color={summary.activeAlerts > 0 ? "error" : "inherit"}>
              {summary.activeAlerts}
            </Typography>
          </CardContent></Card>
        </Grid>
      </Grid>

      {/* Add Asset Form */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Add New Asset</Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Asset Name" name="assetName" value={formData.assetName} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Asset Type" name="assetType" value={formData.assetType} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="IP Address" name="ipAddress" value={formData.ipAddress} onChange={handleChange} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField fullWidth type="number" label="CPU %" name="cpuUsage" value={formData.cpuUsage} onChange={handleChange} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField fullWidth type="number" label="Memory %" name="memoryUsage" value={formData.memoryUsage} onChange={handleChange} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField fullWidth type="number" label="Disk %" name="diskUsage" value={formData.diskUsage} onChange={handleChange} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField fullWidth type="number" label="Network" name="networkUsage" value={formData.networkUsage} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Status (UP/DOWN/WARNING)" name="assetStatus" value={formData.assetStatus} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button fullWidth variant="contained" type="submit" sx={{ height: '100%' }}>
                  Add Asset
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Usage Chart */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Resource Usage by Asset</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={assets}>
              <XAxis dataKey="assetName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="cpuUsage" fill="#8884d8" name="CPU %" />
              <Bar dataKey="memoryUsage" fill="#82ca9d" name="Memory %" />
              <Bar dataKey="diskUsage" fill="#ffc658" name="Disk %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Assets Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Current Assets</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>IP</TableCell>
                  <TableCell>CPU %</TableCell>
                  <TableCell>Memory %</TableCell>
                  <TableCell>Disk %</TableCell>
                  <TableCell>Network</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell>{asset.id}</TableCell>
                    <TableCell>{asset.assetName}</TableCell>
                    <TableCell>{asset.assetType}</TableCell>
                    <TableCell>{asset.ipAddress}</TableCell>
                    <TableCell>{asset.cpuUsage}</TableCell>
                    <TableCell>{asset.memoryUsage}</TableCell>
                    <TableCell>{asset.diskUsage}</TableCell>
                    <TableCell>{asset.networkUsage}</TableCell>
                    <TableCell>{asset.assetStatus}</TableCell>
                    <TableCell>
                      <Button color="error" size="small" onClick={() => handleDelete(asset.id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Container>
  );
}

export default App;