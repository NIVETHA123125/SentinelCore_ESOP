import React, { useState, useEffect } from "react";
import {
  Box, Typography, Card, Button, Chip, Stack, TextField,
  Select, MenuItem, FormControl, InputLabel, Dialog,
  DialogTitle, DialogContent, DialogActions, Alert,
  IconButton, Tooltip, LinearProgress, Skeleton, Table,
  TableBody, TableCell, TableHead, TableRow,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import BugReportIcon from "@mui/icons-material/BugReport";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import {
  getAllVulnerabilities, createVulnerability, markVulnerabilityPatched,
} from "../api/vulnerabilityApi";

const SEV = {
  CRITICAL: { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
  HIGH:     { bg: "#FFF7ED", text: "#EA580C", border: "#FED7AA" },
  MEDIUM:   { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A" },
  LOW:      { bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0" },
};
const EMPTY = { cveId: "", title: "", affectedSystem: "", severity: "HIGH", riskScore: "", description: "", patchVersion: "", patchStatus: "OPEN" };

export default function VulnerabilitiesPage() {
  const [vulns, setVulns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [sevFilter, setSevFilter] = useState("ALL");
  const [patchFilter, setPatchFilter] = useState("ALL");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const load = () => {
    setLoading(true);
    getAllVulnerabilities().then(r => setVulns(r.data || [])).catch(() => setVulns([])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const filtered = vulns.filter(v => {
    const s = !search || v.cveId?.toLowerCase().includes(search.toLowerCase()) || v.title?.toLowerCase().includes(search.toLowerCase()) || v.affectedSystem?.toLowerCase().includes(search.toLowerCase());
    return s && (sevFilter === "ALL" || v.severity === sevFilter) && (patchFilter === "ALL" || v.patchStatus === patchFilter);
  });

  const st = {
    total: vulns.length,
    open: vulns.filter(v => v.patchStatus === "OPEN").length,
    patched: vulns.filter(v => v.patchStatus === "PATCHED").length,
    critical: vulns.filter(v => v.severity === "CRITICAL").length,
    high: vulns.filter(v => v.severity === "HIGH").length,
  };

  const act = (fn, m) => { setBusy(true); fn().then(() => { load(); setMsg(m); }).catch(() => {}).finally(() => setBusy(false)); };

  const handleCreate = () => {
    if (!form.cveId.trim() || !form.title.trim() || !form.affectedSystem.trim()) { setErr("CVE ID, Title and Affected System are required."); return; }
    setBusy(true);
    createVulnerability({ ...form, riskScore: parseFloat(form.riskScore) || 0 })
      .then(() => { load(); setOpen(false); setForm(EMPTY); setMsg("Vulnerability added."); })
      .catch(() => setErr("Failed to create."))
      .finally(() => setBusy(false));
  };

  const riskColor = (score) => {
    const n = parseFloat(score);
    if (n >= 9) return "#DC2626";
    if (n >= 7) return "#EA580C";
    if (n >= 4) return "#D97706";
    return "#16A34A";
  };

  const CARDS = [
    { label: "Total CVEs", val: st.total, color: "#0F172A", bg: "rgba(15,23,42,0.05)", icon: BugReportIcon },
    { label: "Open", val: st.open, color: "#DC2626", bg: "rgba(220,38,38,0.06)", icon: BugReportIcon },
    { label: "Patched", val: st.patched, color: "#16A34A", bg: "rgba(22,163,74,0.06)", icon: VerifiedUserIcon },
    { label: "Critical", val: st.critical, color: "#DC2626", bg: "rgba(220,38,38,0.06)", icon: BugReportIcon },
    { label: "High", val: st.high, color: "#EA580C", bg: "rgba(234,88,12,0.06)", icon: BugReportIcon },
  ];

  return (
    <Box sx={{ display: "flex", height: "100vh", width: "100%", overflow: "hidden", bgcolor: "#F8FAFA" }}>
      <Sidebar />
      <Box sx={{ flex: 1, height: "100vh", overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TopHeader breadcrumb="Vulnerability Tracker" onRefresh={load} />
        <Box sx={{ p: { xs: 2.5, md: 3.5 }, width: "100%", boxSizing: "border-box" }}>
          {msg && <Alert severity="success" onClose={() => setMsg("")} sx={{ mb: 2.5, borderRadius: "10px" }}>{msg}</Alert>}

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3, flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#D97706", letterSpacing: "0.1em", fontSize: "0.68rem", textTransform: "uppercase", display: "block", mb: 0.3 }}>PATCH MANAGEMENT</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#0F172A", fontSize: "1.5rem", mb: 0.4 }}>Vulnerability Tracker</Typography>
              <Typography variant="body2" sx={{ color: "#64748B", fontSize: "0.84rem" }}>Track CVEs, risk scores, and patch status across your systems.</Typography>
            </Box>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setOpen(true); setErr(""); setForm(EMPTY); }}
              sx={{ bgcolor: "#D97706", borderRadius: "10px", px: 2.5, py: 1, textTransform: "none", fontWeight: 600, boxShadow: "0 2px 8px rgba(217,119,6,0.25)", "&:hover": { bgcolor: "#B45309" } }}>
              Add CVE
            </Button>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2,1fr)", sm: "repeat(5,1fr)" }, gap: 1.5, mb: 3 }}>
            {CARDS.map(c => {
              const Icon = c.icon;
              return (
                <Card key={c.label} elevation={0} sx={{ borderRadius: "12px", border: "1px solid #E2E8F0", bgcolor: "#FFFFFF", p: 2, textAlign: "center" }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: "8px", bgcolor: c.bg, display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 0.8 }}>
                    <Icon sx={{ fontSize: 16, color: c.color }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: c.color, lineHeight: 1, mb: 0.2 }}>{loading ? <Skeleton width={24} sx={{ mx: "auto" }} /> : c.val}</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#94A3B8", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{c.label}</Typography>
                </Card>
              );
            })}
          </Box>

          <Card elevation={0} sx={{ borderRadius: "12px", border: "1px solid #E2E8F0", bgcolor: "#FFFFFF", p: 2, mb: 2.5 }}>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, minWidth: 180 }}>
                <SearchIcon sx={{ color: "#94A3B8", fontSize: 20 }} />
                <TextField placeholder="Search CVE ID, title, system..." value={search} onChange={e => setSearch(e.target.value)} size="small" variant="standard" InputProps={{ disableUnderline: true }} sx={{ flex: 1, "& input": { fontSize: "0.85rem" } }} />
              </Box>
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel>Severity</InputLabel>
                <Select value={sevFilter} onChange={e => setSevFilter(e.target.value)} label="Severity" sx={{ borderRadius: "8px", fontSize: "0.82rem" }}>
                  {["ALL","CRITICAL","HIGH","MEDIUM","LOW"].map(v => <MenuItem key={v} value={v}>{v === "ALL" ? "All Severities" : v}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel>Patch Status</InputLabel>
                <Select value={patchFilter} onChange={e => setPatchFilter(e.target.value)} label="Patch Status" sx={{ borderRadius: "8px", fontSize: "0.82rem" }}>
                  <MenuItem value="ALL">All</MenuItem>
                  <MenuItem value="OPEN">Open</MenuItem>
                  <MenuItem value="PATCHED">Patched</MenuItem>
                </Select>
              </FormControl>
              <Button size="small" variant="outlined" startIcon={<RefreshIcon sx={{ fontSize: 15 }} />} onClick={load} sx={{ borderRadius: "8px", textTransform: "none", fontSize: "0.8rem", borderColor: "#E2E8F0", color: "#64748B", "&:hover": { borderColor: "#D97706", color: "#D97706" } }}>Refresh</Button>
            </Box>
          </Card>

          {(loading || busy) && <LinearProgress sx={{ mb: 1, borderRadius: 4, bgcolor: "rgba(217,119,6,0.1)", "& .MuiLinearProgress-bar": { bgcolor: "#D97706" } }} />}

          <Card elevation={0} sx={{ borderRadius: "12px", border: "1px solid #E2E8F0", bgcolor: "#FFFFFF", overflow: "hidden" }}>
            <Box sx={{ px: 2.5, py: 1.8, borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.88rem" }}>All Vulnerabilities</Typography>
              <Chip label={`${filtered.length} result${filtered.length !== 1 ? "s" : ""}`} size="small" variant="outlined" sx={{ fontSize: "0.7rem", height: 22, borderColor: "#E2E8F0", color: "#64748B" }} />
            </Box>
            <Box sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                    {["CVE ID","Title","Severity","Risk Score","Affected System","Patch Ver.","Status","Actions"].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 700, fontSize: "0.72rem", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", py: 1.2, borderBottom: "1px solid #F1F5F9" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>{Array.from({ length: 8 }).map((__, j) => <TableCell key={j}><Skeleton height={20} /></TableCell>)}</TableRow>
                    ))
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ textAlign: "center", py: 6 }}>
                        <CheckCircleIcon sx={{ color: "#A7F3D0", fontSize: 40, display: "block", mx: "auto", mb: 1 }} />
                        <Typography variant="body2" sx={{ color: "#94A3B8" }}>No vulnerabilities found. Your systems look secure!</Typography>
                      </TableCell>
                    </TableRow>
                  ) : filtered.map(v => {
                    const sv = SEV[v.severity] || SEV.LOW;
                    const patched = v.patchStatus === "PATCHED";
                    return (
                      <TableRow key={v.id} sx={{ "&:hover": { bgcolor: "#F8FAFC" }, transition: "background 0.15s" }}>
                        <TableCell sx={{ fontFamily: "monospace", fontSize: "0.78rem", fontWeight: 600, color: "#0F766E", py: 1.5 }}>{v.cveId}</TableCell>
                        <TableCell sx={{ maxWidth: 160 }}><Typography variant="body2" sx={{ fontWeight: 600, color: "#0F172A", fontSize: "0.82rem" }}>{v.title}</Typography></TableCell>
                        <TableCell><Chip label={v.severity} size="small" sx={{ bgcolor: sv.bg, color: sv.text, border: `1px solid ${sv.border}`, fontWeight: 700, fontSize: "0.65rem", height: 20 }} /></TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: riskColor(v.riskScore), fontSize: "0.88rem" }}>{v.riskScore ?? "—"}</Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.8rem", color: "#475569" }}>{v.affectedSystem}</TableCell>
                        <TableCell sx={{ fontFamily: "monospace", fontSize: "0.78rem", color: "#64748B" }}>{v.patchVersion || "—"}</TableCell>
                        <TableCell>
                          <Chip label={patched ? "Patched" : "Open"} size="small"
                            sx={{ bgcolor: patched ? "#F0FDF4" : "#FEF2F2", color: patched ? "#16A34A" : "#DC2626",
                              border: `1px solid ${patched ? "#BBF7D0" : "#FECACA"}`, fontWeight: 700, fontSize: "0.65rem", height: 20 }} />
                        </TableCell>
                        <TableCell>
                          {!patched ? (
                            <Tooltip title="Mark as Patched">
                              <Button size="small" variant="contained" onClick={() => act(() => markVulnerabilityPatched(v.id), "Marked as patched.")}
                                sx={{ fontSize: "0.68rem", py: 0.3, px: 1.2, textTransform: "none", borderRadius: "6px", bgcolor: "#16A34A", "&:hover": { bgcolor: "#14532D" }, fontWeight: 600 }}>
                                <VerifiedUserIcon sx={{ fontSize: 13, mr: 0.4 }} />Patch
                              </Button>
                            </Tooltip>
                          ) : (
                            <Typography variant="caption" sx={{ color: "#16A34A", fontWeight: 600, fontSize: "0.72rem" }}>✓ Patched</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </Card>
        </Box>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "16px" } }}>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 700, color: "#0F172A" }}>Add Vulnerability / CVE</Typography>
            <Typography variant="caption" sx={{ color: "#64748B" }}>Log a new CVE for tracking and patch management.</Typography>
          </Box>
          <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: "#94A3B8" }}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {err && <Alert severity="error" sx={{ mb: 2, borderRadius: "8px", fontSize: "0.82rem" }}>{err}</Alert>}
          <Stack spacing={2.2}>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField label="CVE ID" value={form.cveId} onChange={e => setForm({ ...form, cveId: e.target.value })} size="small" placeholder="CVE-2026-0001" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }} />
              <TextField label="Risk Score (0-10)" value={form.riskScore} onChange={e => setForm({ ...form, riskScore: e.target.value })} size="small" type="number" placeholder="8.2" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }} />
            </Box>
            <TextField label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} fullWidth size="small" placeholder="e.g. Remote Code Execution in API Server" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }} />
            <TextField label="Affected System" value={form.affectedSystem} onChange={e => setForm({ ...form, affectedSystem: e.target.value })} fullWidth size="small" placeholder="e.g. API Server, Auth Service" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }} />
            <TextField label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} fullWidth size="small" multiline rows={2} placeholder="Describe the vulnerability..." sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }} />
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <FormControl size="small">
                <InputLabel>Severity</InputLabel>
                <Select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })} label="Severity" sx={{ borderRadius: "8px" }}>
                  {["CRITICAL","HIGH","MEDIUM","LOW"].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField label="Patch Version" value={form.patchVersion} onChange={e => setForm({ ...form, patchVersion: e.target.value })} size="small" placeholder="e.g. 2.1.0" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }} />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setOpen(false)} sx={{ textTransform: "none", color: "#64748B", borderRadius: "8px" }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={busy} sx={{ textTransform: "none", bgcolor: "#D97706", borderRadius: "8px", px: 3, fontWeight: 600, "&:hover": { bgcolor: "#B45309" } }}>
            {busy ? "Adding..." : "Add Vulnerability"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
