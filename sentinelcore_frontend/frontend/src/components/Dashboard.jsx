import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Button, Grid, Card, Box, Chip,
  Skeleton, IconButton, LinearProgress, Tooltip, Stack
} from '@mui/material';
import DnsIcon from '@mui/icons-material/Dns';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RefreshIcon from '@mui/icons-material/Refresh';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlined';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getAllAssets, getDashboardSummary } from '../api/assetApi';
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

export default function Dashboard() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({ totalAssets: 0, uptimePercent: 0, activeAlerts: 0 });
  const [openAlertsCount, setOpenAlertsCount] = useState(0);

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

  const fetchSummaryAndAlerts = () => {
    const p1 = getDashboardSummary().then((res) => setSummary(res.data)).catch(() => {});
    const p2 = getAllAlerts().then((res) => {
      const openOnes = (res.data || []).filter((a) => a.status?.toUpperCase() === 'OPEN');
      setOpenAlertsCount(openOnes.length);
    }).catch(() => {});
    return Promise.all([p1, p2]);
  };

  useEffect(() => {
    fetchAssets();
    fetchSummaryAndAlerts();
  }, []);

  // --- Calculations ---
  const totalAssetsCount = assets.length;
  const onlineAssetsCount = assets.filter((a) => (a.assetStatus || '').toUpperCase() === 'ONLINE' || (a.assetStatus || '').toUpperCase() === 'UP').length;
  const offlineAssetsCount = assets.filter((a) => {
    const s = (a.assetStatus || '').toUpperCase();
    return s === 'CRITICAL' || s === 'WARNING' || s === 'DOWN';
  }).length;
  const criticalAlertsCount = openAlertsCount || summary.activeAlerts || 0;

  const avgCpu = totalAssetsCount > 0
    ? (assets.reduce((acc, curr) => acc + (parseFloat(curr.cpuUsage) || 0), 0) / totalAssetsCount).toFixed(2)
    : '0.00';

  const avgMem = totalAssetsCount > 0
    ? (assets.reduce((acc, curr) => acc + (parseFloat(curr.memoryUsage) || 0), 0) / totalAssetsCount).toFixed(2)
    : '0.00';

  const uptimePercentage = totalAssetsCount > 0
    ? ((onlineAssetsCount / totalAssetsCount) * 100).toFixed(2)
    : (summary.uptimePercent ? summary.uptimePercent.toFixed(2) : '100.00');

  const recentAssets = [...assets].slice(-4).reverse();

  const chartData = assets.map((a) => ({
    name: a.assetName,
    CPU: a.cpuUsage,
    Memory: a.memoryUsage,
    Disk: a.diskUsage,
  }));

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error">Error loading dashboard: {error}</Typography>
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
          breadcrumb="Security Dashboard"
          onRefresh={() => Promise.all([fetchAssets(), fetchSummaryAndAlerts()])}
        />

        {/* Page Container */}
        <Box sx={{ p: { xs: 2.5, md: 3.5 }, maxWidth: 1200, width: '100%', mx: 'auto', boxSizing: 'border-box' }}>
          {/* Overview Header */}
          <Box sx={{ position: 'relative', mb: 3.5, textAlign: 'center' }}>
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
              OVERVIEW
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
              Security Dashboard
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.84rem' }}>
              Monitor your cloud infrastructure health and security posture.
            </Typography>

            {/* Time Filter Pill on Right */}
            <Box sx={{ position: { xs: 'static', md: 'absolute' }, right: 0, top: '50%', transform: { md: 'translateY(-50%)' }, mt: { xs: 1.5, md: 0 }, display: 'inline-block' }}>
              <Chip
                icon={<AccessTimeIcon sx={{ fontSize: '14px !important', color: '#64748B !important' }} />}
                label="Last 24 hours"
                size="small"
                variant="outlined"
                sx={{
                  borderColor: '#E2E8F0',
                  bgcolor: '#FFFFFF',
                  color: '#475569',
                  fontWeight: 500,
                  fontSize: '0.75rem',
                  height: 28,
                  px: 0.5,
                  borderRadius: '6px',
                }}
              />
            </Box>
          </Box>

          {/* Section: Security Overview Title */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 1.4 }}>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.92rem', lineHeight: 1.2 }}>
                Security overview
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.74rem' }}>
                Current status across monitored infrastructure
              </Typography>
            </Box>
            <Button
              size="small"
              onClick={() => navigate('/assets')}
              endIcon={<ArrowForwardIcon sx={{ fontSize: '13px !important' }} />}
              sx={{
                color: '#0F766E',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.78rem',
                p: 0,
                '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
              }}
            >
              View all assets
            </Button>
          </Box>

          {/* 4 Stat Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3, width: '100%' }}>
            {/* Card 1: TOTAL ASSETS */}
            <Card
              elevation={0}
              onClick={() => navigate('/assets')}
              sx={{
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                bgcolor: '#FFFFFF',
                p: 2.2,
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                transition: 'transform 0.15s, box-shadow 0.15s',
                '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 3px 8px rgba(0,0,0,0.05)' },
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#94A3B8', letterSpacing: '0.05em', fontSize: '0.68rem', textTransform: 'uppercase' }}>
                TOTAL ASSETS
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#0F172A', my: 0.5, fontSize: '1.75rem' }}>
                {loading ? <Skeleton width={50} sx={{ mx: 'auto' }} /> : totalAssetsCount}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', fontSize: '0.72rem' }}>
                All monitored infrastructure
              </Typography>
            </Card>

            {/* Card 2: ONLINE ASSETS */}
            <Card
              elevation={0}
              onClick={() => navigate('/assets')}
              sx={{
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                bgcolor: '#FFFFFF',
                p: 2.2,
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                transition: 'transform 0.15s, box-shadow 0.15s',
                '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 3px 8px rgba(0,0,0,0.05)' },
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#94A3B8', letterSpacing: '0.05em', fontSize: '0.68rem', textTransform: 'uppercase' }}>
                ONLINE ASSETS
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#16A34A', my: 0.5, fontSize: '1.75rem' }}>
                {loading ? <Skeleton width={50} sx={{ mx: 'auto' }} /> : onlineAssetsCount}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', fontSize: '0.72rem' }}>
                Currently operational
              </Typography>
            </Card>

            {/* Card 3: OFFLINE ASSETS */}
            <Card
              elevation={0}
              onClick={() => navigate('/assets')}
              sx={{
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                bgcolor: '#FFFFFF',
                p: 2.2,
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                transition: 'transform 0.15s, box-shadow 0.15s',
                '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 3px 8px rgba(0,0,0,0.05)' },
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#94A3B8', letterSpacing: '0.05em', fontSize: '0.68rem', textTransform: 'uppercase' }}>
                OFFLINE ASSETS
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: offlineAssetsCount > 0 ? '#D97706' : '#0F172A', my: 0.5, fontSize: '1.75rem' }}>
                {loading ? <Skeleton width={50} sx={{ mx: 'auto' }} /> : offlineAssetsCount}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', fontSize: '0.72rem' }}>
                Currently degraded/offline
              </Typography>
            </Card>

            {/* Card 4: CRITICAL ALERTS */}
            <Card
              elevation={0}
              onClick={() => navigate('/alerts')}
              sx={{
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                bgcolor: '#FFFFFF',
                p: 2.2,
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                transition: 'transform 0.15s, box-shadow 0.15s',
                '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 3px 8px rgba(0,0,0,0.05)' },
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#94A3B8', letterSpacing: '0.05em', fontSize: '0.68rem', textTransform: 'uppercase' }}>
                CRITICAL ALERTS
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: criticalAlertsCount > 0 ? '#DC2626' : '#0F172A', my: 0.5, fontSize: '1.75rem' }}>
                {loading ? <Skeleton width={50} sx={{ mx: 'auto' }} /> : criticalAlertsCount}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', fontSize: '0.72rem' }}>
                Requires attention
              </Typography>
            </Card>
          </Box>

          {/* Two Column Layout: System Performance vs Recent Assets */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5, mb: 3.5, width: '100%' }}>
            {/* Left Card: System Performance */}
            <Card
              elevation={0}
              sx={{
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                bgcolor: '#FFFFFF',
                p: 2.5,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.92rem', lineHeight: 1.2 }}>
                      System performance
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.74rem' }}>
                      Aggregated health metrics
                    </Typography>
                  </Box>
                  <Chip
                    label="• Live"
                    size="small"
                    sx={{
                      bgcolor: '#ECFDF5',
                      color: '#059669',
                      border: '1px solid #A7F3D0',
                      fontWeight: 700,
                      fontSize: '0.68rem',
                      height: 20,
                      px: 0.3,
                    }}
                  />
                </Box>

                {/* Meter 1: System Uptime */}
                <Box sx={{ mb: 2.2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
                    <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500, fontSize: '0.8rem' }}>
                      System uptime
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.82rem', fontFamily: 'monospace' }}>
                      {uptimePercentage}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, Math.max(0, parseFloat(uptimePercentage) || 0))}
                    sx={{
                      height: 5,
                      borderRadius: 3,
                      bgcolor: '#F1F5F9',
                      '& .MuiLinearProgress-bar': { bgcolor: '#16A34A', borderRadius: 3 },
                    }}
                  />
                </Box>

                {/* Meter 2: Average CPU Usage */}
                <Box sx={{ mb: 2.2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
                    <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500, fontSize: '0.8rem' }}>
                      Average CPU usage
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.82rem', fontFamily: 'monospace' }}>
                      {avgCpu}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, Math.max(0, parseFloat(avgCpu) || 0))}
                    sx={{
                      height: 5,
                      borderRadius: 3,
                      bgcolor: '#F1F5F9',
                      '& .MuiLinearProgress-bar': { bgcolor: '#0F766E', borderRadius: 3 },
                    }}
                  />
                </Box>

                {/* Meter 3: Average Memory Usage */}
                <Box sx={{ mb: 0.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
                    <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500, fontSize: '0.8rem' }}>
                      Average memory usage
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.82rem', fontFamily: 'monospace' }}>
                      {avgMem}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, Math.max(0, parseFloat(avgMem) || 0))}
                    sx={{
                      height: 5,
                      borderRadius: 3,
                      bgcolor: '#F1F5F9',
                      '& .MuiLinearProgress-bar': { bgcolor: '#D97706', borderRadius: 3 },
                    }}
                  />
                </Box>
              </Card>

            {/* Right Card: Recent Assets */}
            <Card
              elevation={0}
                sx={{
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  bgcolor: '#FFFFFF',
                  p: 2.5,
                  height: '100%',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.92rem', lineHeight: 1.2 }}>
                      Recent assets
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.74rem' }}>
                      Latest monitored infrastructure
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    onClick={() => navigate('/assets')}
                    sx={{ color: '#0F766E', textTransform: 'none', fontSize: '0.75rem', fontWeight: 600, p: 0 }}
                  >
                    Manage →
                  </Button>
                </Box>

                <Stack spacing={1}>
                  {recentAssets.map((asset) => {
                    const badge = statusBadgeStyle(asset.assetStatus);
                    return (
                      <Box
                        key={asset.id}
                        onClick={() => navigate('/assets')}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 1.1,
                          borderRadius: '8px',
                          bgcolor: '#FFFFFF',
                          border: '1px solid #F1F5F9',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s',
                          '&:hover': { bgcolor: '#F8FAFC' },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.4 }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '6px',
                              bgcolor: '#F1F5F9',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <DnsIcon sx={{ color: '#64748B', fontSize: 16 }} />
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.82rem', lineHeight: 1.2 }}>
                              {asset.assetName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.7rem' }}>
                              {asset.assetType || 'SERVER'} · {asset.ipAddress || 'Cloud'}
                            </Typography>
                          </Box>
                        </Box>

                        <Chip
                          label={`• ${(asset.assetStatus || 'ONLINE').toUpperCase()}`}
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
                      </Box>
                    );
                  })}

                  {recentAssets.length === 0 && (
                    <Box sx={{ py: 3, textAlign: 'center', color: '#94A3B8' }}>
                      <Typography variant="caption">No assets currently monitored.</Typography>
                    </Box>
                  )}
                </Stack>
              </Card>
          </Box>

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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.92rem', mb: 0.2 }}>
                    Hardware Resource Distribution
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.74rem' }}>
                    Comparative CPU, Memory, and Disk metrics across all assets
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={() => navigate('/assets')}
                  endIcon={<ArrowForwardIcon sx={{ fontSize: '13px !important' }} />}
                  sx={{ color: '#0F766E', textTransform: 'none', fontSize: '0.75rem', fontWeight: 600 }}
                >
                  View Table Details
                </Button>
              </Box>
              <Box sx={{ width: '100%', height: 220, minWidth: 0, position: 'relative' }}>
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
    </Box>
  );
}