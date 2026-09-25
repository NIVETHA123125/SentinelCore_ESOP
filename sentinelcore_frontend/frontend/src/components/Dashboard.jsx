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
        <Box sx={{ p: { xs: 2.5, md: 3.5 }, width: '100%', boxSizing: 'border-box' }}>
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
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' }, gap: 1.5, mb: 3, width: '100%' }}>
            {/* Card 1: TOTAL ASSETS */}
            <Card elevation={0} onClick={() => navigate('/assets')} sx={{ borderRadius: '12px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 2, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(15,118,110,0.10)', borderColor: '#0F766E', transform: 'translateY(-2px)' } }}>
              <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: 'rgba(15,118,110,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1 }}>
                <DnsIcon sx={{ fontSize: 18, color: '#0F766E' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1, mb: 0.3 }}>{loading ? <Skeleton width={30} sx={{ mx: 'auto' }} /> : totalAssetsCount}</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#94A3B8', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Assets</Typography>
            </Card>

            {/* Card 2: ONLINE ASSETS */}
            <Card elevation={0} onClick={() => navigate('/assets')} sx={{ borderRadius: '12px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 2, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(22,163,74,0.10)', borderColor: '#16A34A', transform: 'translateY(-2px)' } }}>
              <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: 'rgba(22,163,74,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1 }}>
                <CheckCircleIcon sx={{ fontSize: 18, color: '#16A34A' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#16A34A', lineHeight: 1, mb: 0.3 }}>{loading ? <Skeleton width={30} sx={{ mx: 'auto' }} /> : onlineAssetsCount}</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#94A3B8', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Online</Typography>
            </Card>

            {/* Card 3: INCIDENTS */}
            <Card elevation={0} sx={{ borderRadius: '12px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 2, textAlign: 'center', transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(220,38,38,0.08)', borderColor: '#DC2626', transform: 'translateY(-2px)' } }}>
              <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: 'rgba(220,38,38,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1 }}>
                <ReportProblemIcon sx={{ fontSize: 18, color: '#DC2626' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: openIncidentsCount > 0 ? '#DC2626' : '#0F172A', lineHeight: 1, mb: 0.3 }}>{loading ? <Skeleton width={30} sx={{ mx: 'auto' }} /> : openIncidentsCount}</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#94A3B8', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Incidents</Typography>
            </Card>

            {/* Card 4: VULNERABILITIES */}
            <Card elevation={0} sx={{ borderRadius: '12px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 2, textAlign: 'center', transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(217,119,6,0.08)', borderColor: '#D97706', transform: 'translateY(-2px)' } }}>
              <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: 'rgba(217,119,6,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1 }}>
                <BugReportIcon sx={{ fontSize: 18, color: '#D97706' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: openVulnsCount > 0 ? '#D97706' : '#0F172A', lineHeight: 1, mb: 0.3 }}>{loading ? <Skeleton width={30} sx={{ mx: 'auto' }} /> : openVulnsCount}</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#94A3B8', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Vulns</Typography>
            </Card>

            {/* Card 5: COMPLIANCE */}
            <Card elevation={0} sx={{ borderRadius: '12px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 2, textAlign: 'center', transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(15,118,110,0.08)', borderColor: '#0F766E', transform: 'translateY(-2px)' } }}>
              <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: 'rgba(15,118,110,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1 }}>
                <VerifiedUserIcon sx={{ fontSize: 18, color: '#0F766E' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F766E', lineHeight: 1, mb: 0.3 }}>{loading ? <Skeleton width={30} sx={{ mx: 'auto' }} /> : complianceChecks.length}</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#94A3B8', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Compliance</Typography>
            </Card>

            {/* Card 6: AUDIT LOGS */}
            <Card elevation={0} sx={{ borderRadius: '12px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 2, textAlign: 'center', transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(100,116,139,0.08)', borderColor: '#64748B', transform: 'translateY(-2px)' } }}>
              <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: 'rgba(100,116,139,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1 }}>
                <HistoryIcon sx={{ fontSize: 18, color: '#64748B' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1, mb: 0.3 }}>{loading ? <Skeleton width={30} sx={{ mx: 'auto' }} /> : auditLogs.length}</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#94A3B8', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Audit Logs</Typography>
            </Card>
          </Box>

          {/* ── 4 Content Boxes — CSS grid, full width ── */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5, mb: 3, width: '100%' }}>

            {/* Box 1: Security Incidents */}
            <Card elevation={0} sx={{ borderRadius: '12px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(220,38,38,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ReportProblemIcon sx={{ color: '#DC2626', fontSize: 18 }} />
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.92rem' }}>Active Security Incidents</Typography>
                </Box>
                <Chip label={`${incidents.length} total`} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 22, borderColor: '#E2E8F0', color: '#64748B' }} />
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
                          {!inc.assignedTo && (<Button size="small" variant="outlined" onClick={() => handleAssign(inc.id)} sx={{ fontSize: '0.7rem', py: 0.2, textTransform: 'none' }}>Assign to me</Button>)}
                          {!isResolved && (<Button size="small" variant="contained" color="success" onClick={() => handleResolve(inc.id)} sx={{ fontSize: '0.7rem', py: 0.2, textTransform: 'none' }}>Resolve</Button>)}
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
                {incidents.length === 0 && (
                  <Box sx={{ py: 3, textAlign: 'center' }}>
                    <CheckCircleIcon sx={{ color: '#A7F3D0', fontSize: 32, mb: 0.5 }} />
                    <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>No active security incidents reported.</Typography>
                  </Box>
                )}
              </Stack>
            </Card>

            {/* Box 2: Vulnerabilities */}
            <Card elevation={0} sx={{ borderRadius: '12px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(217,119,6,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BugReportIcon sx={{ color: '#D97706', fontSize: 18 }} />
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.92rem' }}>Vulnerabilities &amp; CVE Tracker</Typography>
                </Box>
                <Chip label={`${vulnerabilities.length} tracked`} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 22, borderColor: '#E2E8F0', color: '#64748B' }} />
              </Box>
              <Stack spacing={1.2}>
                {vulnerabilities.map((vuln) => {
                  const isPatched = vuln.patchStatus === 'PATCHED';
                  return (
                    <Box key={vuln.id} sx={{ p: 1.5, borderRadius: '8px', border: '1px solid #F1F5F9', bgcolor: '#F8FAFC' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>{vuln.cveId} - {vuln.title}</Typography>
                        <Chip label={`Score: ${vuln.riskScore || 'N/A'}`} size="small" color={vuln.riskScore >= 7 ? 'error' : 'warning'} sx={{ fontWeight: 700, fontSize: '0.65rem', height: 20 }} />
                      </Box>
                      <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 0.5 }}>Target: {vuln.affectedSystem} | Patch: {vuln.patchVersion}</Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.8 }}>
                        <Chip label={vuln.patchStatus || 'OPEN'} size="small" color={isPatched ? 'success' : 'warning'} variant="outlined" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
                        {!isPatched && (<Button size="small" variant="outlined" color="primary" onClick={() => handlePatch(vuln.id)} sx={{ fontSize: '0.7rem', py: 0.2, textTransform: 'none' }}>Mark Patched</Button>)}
                      </Box>
                    </Box>
                  );
                })}
                {vulnerabilities.length === 0 && (
                  <Box sx={{ py: 3, textAlign: 'center' }}>
                    <VerifiedUserIcon sx={{ color: '#A7F3D0', fontSize: 32, mb: 0.5 }} />
                    <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>No open CVE vulnerabilities detected.</Typography>
                  </Box>
                )}
              </Stack>
            </Card>

            {/* Box 3: Compliance */}
            <Card elevation={0} sx={{ borderRadius: '12px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(15,118,110,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <VerifiedUserIcon sx={{ color: '#0F766E', fontSize: 18 }} />
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.92rem' }}>Compliance Framework Status</Typography>
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
                  <Box sx={{ py: 3, textAlign: 'center' }}>
                    <VerifiedUserIcon sx={{ color: '#A7F3D0', fontSize: 32, mb: 0.5 }} />
                    <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>No compliance checks recorded.</Typography>
                  </Box>
                )}
              </Stack>
            </Card>

            {/* Box 4: Audit Log Trail */}
            <Card elevation={0} sx={{ borderRadius: '12px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(100,116,139,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HistoryIcon sx={{ color: '#64748B', fontSize: 18 }} />
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.92rem' }}>Audit Log Trail</Typography>
              </Box>
              <Stack spacing={1.2}>
                {auditLogs.slice(-5).reverse().map((log) => (
                  <Box key={log.id} sx={{ p: 1.2, borderRadius: '8px', border: '1px solid #F1F5F9', bgcolor: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.8rem' }}>{log.action} - {log.resource}</Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>User: {log.username} | IP: {log.ipAddress}</Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.68rem', fontFamily: 'monospace', ml: 1, flexShrink: 0 }}>{log.details}</Typography>
                  </Box>
                ))}
                {auditLogs.length === 0 && (
                  <Box sx={{ py: 3, textAlign: 'center' }}>
                    <HistoryIcon sx={{ color: '#CBD5E1', fontSize: 32, mb: 0.5 }} />
                    <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>No audit activity recorded.</Typography>
                  </Box>
                )}
              </Stack>
            </Card>
          </Box>

          {/* ── Infrastructure Chart — full width at bottom ── */}
          {chartData.length > 0 && (
            <Card elevation={0} sx={{ borderRadius: '12px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 2.5, mb: 3, width: '100%', boxSizing: 'border-box' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.92rem', mb: 0.2 }}>
                    Hardware Resource Distribution
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.74rem' }}>
                    Comparative CPU, Memory, and Disk metrics across all assets
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}><Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: '#0F766E' }} /><Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.72rem' }}>CPU</Typography></Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}><Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: '#D97706' }} /><Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.72rem' }}>Memory</Typography></Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}><Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: '#64748B' }} /><Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.72rem' }}>Disk</Typography></Box>
                </Box>
              </Box>
              <Box sx={{ width: '100%', height: 240, minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} domain={[0, 100]} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.78rem' }} formatter={(value, name) => [`${value}%`, name]} />
                    <Bar dataKey="CPU" fill="#0F766E" radius={[4, 4, 0, 0]} maxBarSize={32} />
                    <Bar dataKey="Memory" fill="#D97706" radius={[4, 4, 0, 0]} maxBarSize={32} />
                    <Bar dataKey="Disk" fill="#64748B" radius={[4, 4, 0, 0]} maxBarSize={32} />
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