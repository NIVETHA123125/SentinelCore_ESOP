import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Button, Grid, Card, Box, Chip,
  Skeleton, IconButton, LinearProgress, Tooltip, Stack,
  Table, TableBody, TableCell, TableHead, TableRow, Paper
} from '@mui/material';
import DnsIcon from '@mui/icons-material/Dns';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RefreshIcon from '@mui/icons-material/Refresh';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import BugReportIcon from '@mui/icons-material/BugReport';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import HistoryIcon from '@mui/icons-material/History';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

import { getAllAssets, getDashboardSummary } from '../api/assetApi';
import { getAllAlerts, getOpenAlerts } from '../api/alertApi';
import { getAllIncidents, assignIncident, updateIncidentStatus } from '../api/incidentApi';
import { getAllVulnerabilities, markVulnerabilityPatched } from '../api/vulnerabilityApi';
import { getAllAuditLogs } from '../api/auditApi';
import { getAllComplianceChecks } from '../api/complianceApi';

import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import { useAuth } from '../context/AuthContext';

const statusBadgeStyle = (status) => {
  switch (status?.toUpperCase()) {
    case 'ONLINE': case 'UP': case 'COMPLIANT': case 'RESOLVED': case 'PATCHED':
      return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' };
    case 'WARNING': case 'IN_PROGRESS': case 'REVIEW_REQUIRED':
      return { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' };
    case 'CRITICAL': case 'DOWN': case 'HIGH': case 'OPEN': case 'NON_COMPLIANT':
      return { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' };
    default:
      return { bg: '#F8FAFC', text: '#64748B', border: '#E2E8F0' };
  }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { isAdmin, username } = useAuth();

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({ totalAssets: 0, uptimePercent: 0, activeAlerts: 0 });
  const [openAlertsCount, setOpenAlertsCount] = useState(0);

  // New State for 4 Functional APIs
  const [incidents, setIncidents] = useState([]);
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [complianceChecks, setComplianceChecks] = useState([]);

  const fetchAllData = () => {
    setLoading(true);
    const pAssets = getAllAssets().then((res) => setAssets(res.data || [])).catch(() => {});
    const pSummary = getDashboardSummary().then((res) => setSummary(res.data)).catch(() => {});
    const pAlerts = getOpenAlerts().then((res) => {
      const openCriticalOnes = (res.data || []).filter(
        (a) => a.status?.toUpperCase() === 'OPEN' && a.severity?.toUpperCase() === 'CRITICAL'
      );
      setOpenAlertsCount(openCriticalOnes.length);
    }).catch(() => setOpenAlertsCount(0));

    const pIncidents = getAllIncidents().then((res) => setIncidents(res.data || [])).catch(() => {});
    const pVulns = getAllVulnerabilities().then((res) => setVulnerabilities(res.data || [])).catch(() => {});
    const pAudit = getAllAuditLogs().then((res) => setAuditLogs(res.data || [])).catch(() => {});
    const pCompliance = getAllComplianceChecks().then((res) => setComplianceChecks(res.data || [])).catch(() => {});

    return Promise.all([pAssets, pSummary, pAlerts, pIncidents, pVulns, pAudit, pCompliance])
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleAssign = (id) => {
    assignIncident(id, username || 'admin').then(() => fetchAllData());
  };

  const handleResolve = (id) => {
    updateIncidentStatus(id, 'RESOLVED').then(() => fetchAllData());
  };

  const handlePatch = (id) => {
    markVulnerabilityPatched(id).then(() => fetchAllData());
  };

  // --- Calculations ---
  const totalAssetsCount = assets.length;
  const onlineAssetsCount = assets.filter((a) => (a.assetStatus || '').toUpperCase() === 'ONLINE' || (a.assetStatus || '').toUpperCase() === 'UP').length;
  const offlineAssetsCount = assets.filter((a) => {
    const s = (a.assetStatus || '').toUpperCase();
    return s === 'CRITICAL' || s === 'WARNING' || s === 'DOWN';
  }).length;
  const criticalAlertsCount = typeof openAlertsCount === 'number' ? openAlertsCount : (summary.activeAlerts || 0);

  const openIncidentsCount = incidents.filter(i => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length;
  const openVulnsCount = vulnerabilities.filter(v => v.patchStatus === 'OPEN').length;

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

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden', bgcolor: '#F8FAFA' }}>
      <Sidebar />

      {/* Main Content Area */}
      <Box sx={{ flex: 1, height: '100vh', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopHeader
          breadcrumb="Security Dashboard"
          onRefresh={fetchAllData}
        />

        {/* Page Container */}
        <Box sx={{ p: { xs: 2.5, md: 3.5 }, maxWidth: 1200, width: '100%', mx: 'auto', boxSizing: 'border-box' }}>
          {/* Overview Header */}
          <Box sx={{ position: 'relative', mb: 3.5, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F766E', letterSpacing: '0.12em', fontSize: '0.68rem', textTransform: 'uppercase', display: 'block', mb: 0.4 }}>
              OVERVIEW
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em', fontSize: '1.65rem', lineHeight: 1.2, mb: 0.5 }}>
              Security & DevSecOps Dashboard
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.84rem' }}>
              Real-time security monitoring, incident response, vulnerability management & compliance.
            </Typography>

            <Box sx={{ position: { xs: 'static', md: 'absolute' }, right: 0, top: '50%', transform: { md: 'translateY(-50%)' }, mt: { xs: 1.5, md: 0 }, display: 'inline-block' }}>
              <Chip
                icon={<AccessTimeIcon sx={{ fontSize: '14px !important', color: '#64748B !important' }} />}
                label="Live System Data"
                size="small"
                variant="outlined"
                sx={{ borderColor: '#E2E8F0', bgcolor: '#FFFFFF', color: '#475569', fontWeight: 500, fontSize: '0.75rem', height: 28, px: 0.5, borderRadius: '6px' }}
              />
            </Box>
          </Box>

          {/* 6 Summary Metric Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' }, gap: 1.5, mb: 3, width: '100%' }}>
            {/* Card 1: TOTAL ASSETS */}
            <Card elevation={0} onClick={() => navigate('/assets')} sx={{ borderRadius: '10px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 1.8, textAlign: 'center', cursor: 'pointer', '&:hover': { boxShadow: '0 3px 8px rgba(0,0,0,0.05)' } }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#94A3B8', fontSize: '0.65rem', textTransform: 'uppercase' }}>TOTAL ASSETS</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#0F172A', my: 0.4 }}>{loading ? <Skeleton width={30} sx={{ mx: 'auto' }} /> : totalAssetsCount}</Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.68rem' }}>Monitored</Typography>
            </Card>

            {/* Card 2: ONLINE ASSETS */}
            <Card elevation={0} onClick={() => navigate('/assets')} sx={{ borderRadius: '10px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 1.8, textAlign: 'center', cursor: 'pointer', '&:hover': { boxShadow: '0 3px 8px rgba(0,0,0,0.05)' } }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#94A3B8', fontSize: '0.65rem', textTransform: 'uppercase' }}>ONLINE ASSETS</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#16A34A', my: 0.4 }}>{loading ? <Skeleton width={30} sx={{ mx: 'auto' }} /> : onlineAssetsCount}</Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.68rem' }}>Healthy</Typography>
            </Card>

            {/* Card 3: OPEN INCIDENTS */}
            <Card elevation={0} sx={{ borderRadius: '10px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 1.8, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#94A3B8', fontSize: '0.65rem', textTransform: 'uppercase' }}>INCIDENTS</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: openIncidentsCount > 0 ? '#DC2626' : '#0F172A', my: 0.4 }}>{loading ? <Skeleton width={30} sx={{ mx: 'auto' }} /> : openIncidentsCount}</Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.68rem' }}>Active Open</Typography>
            </Card>

            {/* Card 4: VULNERABILITIES */}
            <Card elevation={0} sx={{ borderRadius: '10px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 1.8, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#94A3B8', fontSize: '0.65rem', textTransform: 'uppercase' }}>VULNERABILITIES</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: openVulnsCount > 0 ? '#D97706' : '#0F172A', my: 0.4 }}>{loading ? <Skeleton width={30} sx={{ mx: 'auto' }} /> : openVulnsCount}</Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.68rem' }}>Unpatched</Typography>
            </Card>

            {/* Card 5: COMPLIANCE */}
            <Card elevation={0} sx={{ borderRadius: '10px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 1.8, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#94A3B8', fontSize: '0.65rem', textTransform: 'uppercase' }}>COMPLIANCE</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#0F766E', my: 0.4 }}>{loading ? <Skeleton width={30} sx={{ mx: 'auto' }} /> : complianceChecks.length}</Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.68rem' }}>Checks</Typography>
            </Card>

            {/* Card 6: AUDIT LOGS */}
            <Card elevation={0} sx={{ borderRadius: '10px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 1.8, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#94A3B8', fontSize: '0.65rem', textTransform: 'uppercase' }}>AUDIT LOGS</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#0F172A', my: 0.4 }}>{loading ? <Skeleton width={30} sx={{ mx: 'auto' }} /> : auditLogs.length}</Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.68rem' }}>Total Logs</Typography>
            </Card>
          </Box>

          {/* Section 1: Security Incidents & Vulnerability Management */}
          <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
            {/* Left: Security Incidents */}
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ borderRadius: '10px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 2.5, height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ReportProblemIcon sx={{ color: '#DC2626', fontSize: 20 }} />
                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>
                      Active Security Incidents
                    </Typography>
                  </Box>
                  <Chip label={`${incidents.length} total`} size="small" variant="outlined" />
                </Box>
                <Stack spacing={1.2}>
                  {incidents.map((inc) => {
                    const badge = statusBadgeStyle(inc.severity);
                    const isResolved = inc.status === 'RESOLVED';
                    return (
                      <Box key={inc.id} sx={{ p: 1.5, borderRadius: '8px', border: '1px solid #F1F5F9', bgcolor: '#F8FAFC' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>{inc.title}</Typography>
                          <Chip label={inc.severity} size="small" sx={{ bgcolor: badge.bg, color: badge.text, border: `1px solid ${badge.border}`, fontWeight: 700, fontSize: '0.65rem', height: 20 }} />
                        </Box>
                        <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 1 }}>{inc.description}</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" sx={{ color: '#94A3B8' }}>Assigned: <strong>{inc.assignedTo || 'Unassigned'}</strong></Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {!inc.assignedTo && (
                              <Button size="small" variant="outlined" onClick={() => handleAssign(inc.id)} sx={{ fontSize: '0.7rem', py: 0.2 }}>Assign to me</Button>
                            )}
                            {!isResolved && (
                              <Button size="small" variant="contained" color="success" onClick={() => handleResolve(inc.id)} sx={{ fontSize: '0.7rem', py: 0.2, textTransform: 'none' }}>Resolve</Button>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                  {incidents.length === 0 && (
                    <Typography variant="caption" sx={{ color: '#94A3B8', textAlign: 'center', py: 2 }}>No active security incidents reported.</Typography>
                  )}
                </Stack>
              </Card>
            </Grid>

            {/* Right: Vulnerabilities Scanner */}
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ borderRadius: '10px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 2.5, height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BugReportIcon sx={{ color: '#D97706', fontSize: 20 }} />
                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>
                      Vulnerabilities & CVE Tracker
                    </Typography>
                  </Box>
                  <Chip label={`${vulnerabilities.length} tracked`} size="small" variant="outlined" />
                </Box>
                <Stack spacing={1.2}>
                  {vulnerabilities.map((vuln) => {
                    const isPatched = vuln.patchStatus === 'PATCHED';
                    return (
                      <Box key={vuln.id} sx={{ p: 1.5, borderRadius: '8px', border: '1px solid #F1F5F9', bgcolor: '#F8FAFC' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>{vuln.cveId} - {vuln.title}</Typography>
                          <Chip label={`Risk Score: ${vuln.riskScore || 'N/A'}`} size="small" color={vuln.riskScore >= 7 ? "error" : "warning"} sx={{ fontWeight: 700, fontSize: '0.65rem', height: 20 }} />
                        </Box>
                        <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 0.5 }}>Target: {vuln.affectedSystem} | Patch Ver: {vuln.patchVersion}</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.8 }}>
                          <Chip label={vuln.patchStatus || 'OPEN'} size="small" color={isPatched ? "success" : "warning"} variant="outlined" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
                          {!isPatched && (
                            <Button size="small" variant="outlined" color="primary" onClick={() => handlePatch(vuln.id)} sx={{ fontSize: '0.7rem', py: 0.2, textTransform: 'none' }}>Mark Patched</Button>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                  {vulnerabilities.length === 0 && (
                    <Typography variant="caption" sx={{ color: '#94A3B8', textAlign: 'center', py: 2 }}>No open CVE vulnerabilities detected.</Typography>
                  )}
                </Stack>
              </Card>
            </Grid>
          </Grid>

          {/* Section 2: Compliance Checks & Audit Log Activity */}
          <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
            {/* Left: Compliance Framework Checks */}
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ borderRadius: '10px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 2.5, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <VerifiedUserIcon sx={{ color: '#0F766E', fontSize: 20 }} />
                  <Typography variant="body1" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>
                    Compliance Framework Status
                  </Typography>
                </Box>
                <Stack spacing={1.2}>
                  {complianceChecks.map((check) => {
                    const badge = statusBadgeStyle(check.status);
                    return (
                      <Box key={check.id} sx={{ p: 1.5, borderRadius: '8px', border: '1px solid #F1F5F9', bgcolor: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>{check.framework} ({check.controlId})</Typography>
                          <Typography variant="caption" sx={{ color: '#64748B' }}>{check.controlName} - {check.remarks}</Typography>
                        </Box>
                        <Chip label={check.status} size="small" sx={{ bgcolor: badge.bg, color: badge.text, border: `1px solid ${badge.border}`, fontWeight: 700, fontSize: '0.65rem' }} />
                      </Box>
                    );
                  })}
                  {complianceChecks.length === 0 && (
                    <Typography variant="caption" sx={{ color: '#94A3B8', textAlign: 'center', py: 2 }}>No compliance checks recorded.</Typography>
                  )}
                </Stack>
              </Card>
            </Grid>

            {/* Right: Audit Log Trail */}
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ borderRadius: '10px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 2.5, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <HistoryIcon sx={{ color: '#64748B', fontSize: 20 }} />
                  <Typography variant="body1" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>
                    Audit Log Trail
                  </Typography>
                </Box>
                <Stack spacing={1.2}>
                  {auditLogs.slice(-4).reverse().map((log) => (
                    <Box key={log.id} sx={{ p: 1.2, borderRadius: '8px', border: '1px solid #F1F5F9', bgcolor: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.8rem' }}>{log.action} - {log.resource}</Typography>
                        <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>User: {log.username} | IP: {log.ipAddress}</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.68rem', fontFamily: 'monospace' }}>{log.details}</Typography>
                    </Box>
                  ))}
                  {auditLogs.length === 0 && (
                    <Typography variant="caption" sx={{ color: '#94A3B8', textAlign: 'center', py: 2 }}>No audit activity recorded.</Typography>
                  )}
                </Stack>
              </Card>
            </Grid>
          </Grid>

          {/* Infrastructure Chart */}
          {chartData.length > 0 && (
            <Card elevation={0} sx={{ borderRadius: '10px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 2.5, boxShadow: '0 1px 3px rgba(0,0,0,0.02)', mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.92rem', mb: 0.2 }}>
                    Hardware Resource Distribution
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.74rem' }}>
                    Comparative CPU, Memory, and Disk metrics across all assets
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ width: '100%', height: 200, minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
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