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
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import { useAuth } from "../context/AuthContext";
import {
  getAllIncidents, createIncident, assignIncident,
  updateIncidentStatus, deleteIncident,
} from "../api/incidentApi";

const SEV = {
  CRITICAL: { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
  HIGH:     { bg: "#FFF7ED", text: "#EA580C", border: "#FED7AA" },
  MEDIUM:   { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A" },
  LOW:      { bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0" },
};
const STAT = {
  OPEN:        { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA", label: "Open" },
  IN_PROGRESS: { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A", label: "In Progress" },
  RESOLVED:    { bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0", label: "Resolved" },
  CLOSED:      { bg: "#F8FAFC", text: "#64748B", border: "#E2E8F0", label: "Closed" },
};
const EMPTY = { title: "", description: "", severity: "HIGH", status: "OPEN", assignedTo: "" };

export default function IncidentsPage() {
  const { username } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [sevFilter, setSevFilter] = useState("ALL");
  const [statFilter, setStatFilter] = useState("ALL");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const load = () => {
    setLoading(true);
    getAllIncidents().then(r => setIncidents(r.data || [])).catch(() => setIncidents([])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const filtered = incidents.filter(i => {
    const s = !search || i.title?.toLowerCase().includes(search.toLowerCase()) || i.description?.toLowerCase().includes(search.toLowerCase());
    return s && (sevFilter === "ALL" || i.severity === sevFilter) && (statFilter === "ALL" || i.status === statFilter);
  });

  const st = {
    total: incidents.length,
    open: incidents.filter(i => i.status === "OPEN").length,
    inProgress: incidents.filter(i => i.status === "IN_PROGRESS").length,
    resolved: incidents.filter(i => i.status === "RESOLVED" || i.status === "CLOSED").length,
    critical: incidents.filter(i => i.severity === "CRITICAL").length,
  };

  const act = (fn, m) => { setBusy(true); fn().then(() => { load(); setMsg(m); }).catch(() => {}).finally(() => setBusy(false)); };

  const handleCreate = () => {
    if (!form.title.trim() || !form.description.trim()) { setErr("Title and description are required."); return; }
    setBusy(true);
    createIncident(form).then(() => { load(); setOpen(false); setForm(EMPTY); setMsg("Incident created."); }).catch(() => setErr("Failed to create.")).finally(() => setBusy(false));
  };

  const CARDS = [
    { label: "Total", val: st.total, color: "#0F172A", bg: "rgba(15,23,42,0.05)" },
    { label: "Open", val: st.open, color: "#DC2626", bg: "rgba(220,38,38,0.06)" },
    { label: "In Progress", val: st.inProgress, color: "#D97706", bg: "rgba(217,119,6,0.06)" },
    { label: "Resolved", val: st.resolved, color: "#16A34A", bg: "rgba(22,163,74,0.06)" },
    { label: "Critical", val: st.critical, color: "#DC2626", bg: "rgba(220,38,38,0.06)" },
  ];

  return (
    <Box sx={{ display: "flex", height: "100vh", width: "100%", overflow: "hidden", bgcolor: "#F8FAFA" }}>
      <Sidebar />
      <Box sx={{ flex: 1, height: "100vh", overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TopHeader breadcrumb="Incidents Manager" onRefresh={load} />
        <Box sx={{ p: { xs: 2.5, md: 3.5 }, width: "100%", boxSizing: "border-box" }}>
          {msg && <Alert severity="success" onClose={() => setMsg("")} sx={{ mb: 2.5, borderRadius: "10px" }}>{msg}</Alert>}

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3, flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#0F766E", letterSpacing: "0.1em", fontSize: "0.68rem", textTransform: "uppercase", display: "block", mb: 0.3 }}>SECURITY OPERATIONS</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#0F172A", fontSize: "1.5rem", mb: 0.4 }}>Incidents Manager</Typography>
              <Typography variant="body2" sx={{ color: "#64748B", fontSize: "0.84rem" }}>Create, track and resolve security incidents across your infrastructure.</Typography>
            </Box>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setOpen(true); setErr(""); setForm(EMPTY); }}
              sx={{ bgcolor: "#0F766E", borderRadius: "10px", px: 2.5, py: 1, textTransform: "none", fontWeight: 600, boxShadow: "0 2px 8px rgba(15,118,110,0.25)", "&:hover": { bgcolor: "#0D5F5A" } }}>
              New Incident
            </Button>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2,1fr)", sm: "repeat(5,1fr)" }, gap: 1.5, mb: 3 }}>
            {CARDS.map(c => (
              <Card key={c.label} elevation={0} sx={{ borderRadius: "12px", border: "1px solid #E2E8F0", bgcolor: "#FFFFFF", p: 2, textAlign: "center" }}>
                <Box sx={{ width: 32, height: 32, borderRadius: "8px", bgcolor: c.bg, display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 0.8 }}>
                  <ReportProblemIcon sx={{ fontSize: 16, color: c.color }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: c.color, lineHeight: 1, mb: 0.2 }}>{loading ? <Skeleton width={24} sx={{ mx: "auto" }} /> : c.val}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "#94A3B8", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{c.label}</Typography>
              </Card>
            ))}
          </Box>

          <Card elevation={0} sx={{ borderRadius: "12px", border: "1px solid #E2E8F0", bgcolor: "#FFFFFF", p: 2, mb: 2.5 }}>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, minWidth: 180 }}>
                <SearchIcon sx={{ color: "#94A3B8", fontSize: 20 }} />
                <TextField placeholder="Search incidents..." value={search} onChange={e => setSearch(e.target.value)} size="small" variant="standard" InputProps={{ disableUnderline: true }} sx={{ flex: 1, "& input": { fontSize: "0.85rem" } }} />
              </Box>
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel>Severity</InputLabel>
                <Select value={sevFilter} onChange={e => setSevFilter(e.target.value)} label="Severity" sx={{ borderRadius: "8px", fontSize: "0.82rem" }}>
                  {["ALL","CRITICAL","HIGH","MEDIUM","LOW"].map(v => <MenuItem key={v} value={v}>{v === "ALL" ? "All Severities" : v}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel>Status</InputLabel>
                <Select value={statFilter} onChange={e => setStatFilter(e.target.value)} label="Status" sx={{ borderRadius: "8px", fontSize: "0.82rem" }}>
                  <MenuItem value="ALL">All Statuses</MenuItem>
                  <MenuItem value="OPEN">Open</MenuItem>
                  <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                  <MenuItem value="RESOLVED">Resolved</MenuItem>
                  <MenuItem value="CLOSED">Closed</MenuItem>
                </Select>
              </FormControl>
              <Button size="small" variant="outlined" startIcon={<RefreshIcon sx={{ fontSize: 15 }} />} onClick={load} sx={{ borderRadius: "8px", textTransform: "none", fontSize: "0.8rem", borderColor: "#E2E8F0", color: "#64748B", "&:hover": { borderColor: "#0F766E", color: "#0F766E" } }}>Refresh</Button>
            </Box>
          </Card>

          {(loading || busy) && <LinearProgress sx={{ mb: 1, borderRadius: 4, bgcolor: "rgba(15,118,110,0.1)", "& .MuiLinearProgress-bar": { bgcolor: "#0F766E" } }} />}

          <Card elevation={0} sx={{ borderRadius: "12px", border: "1px solid #E2E8F0", bgcolor: "#FFFFFF", overflow: "hidden" }}>
            <Box sx={{ px: 2.5, py: 1.8, borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.88rem" }}>All Incidents</Typography>
              <Chip label={`${filtered.length} result${filtered.length !== 1 ? "s" : ""}`} size="small" variant="outlined" sx={{ fontSize: "0.7rem", height: 22, borderColor: "#E2E8F0", color: "#64748B" }} />
            </Box>
            <Box sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                    {["#","Title","Severity","Status","Assigned To","Description","Actions"].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 700, fontSize: "0.72rem", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", py: 1.2, borderBottom: "1px solid #F1F5F9" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>{Array.from({ length: 7 }).map((__, j) => <TableCell key={j}><Skeleton height={20} /></TableCell>)}</TableRow>
                    ))
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: "center", py: 6 }}>
                        <CheckCircleIcon sx={{ color: "#A7F3D0", fontSize: 40, display: "block", mx: "auto", mb: 1 }} />
                        <Typography variant="body2" sx={{ color: "#94A3B8" }}>No incidents found. Create your first one.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : filtered.map(inc => {
                    const sv = SEV[inc.severity] || SEV.LOW;
                    const ss = STAT[inc.status] || STAT.OPEN;
                    const done = inc.status === "RESOLVED" || inc.status === "CLOSED";
                    return (
                      <TableRow key={inc.id} sx={{ "&:hover": { bgcolor: "#F8FAFC" }, transition: "background 0.15s" }}>
                        <TableCell sx={{ color: "#94A3B8", fontSize: "0.78rem", fontFamily: "monospace", py: 1.5 }}>#{inc.id}</TableCell>
                        <TableCell sx={{ maxWidth: 180 }}><Typography variant="body2" sx={{ fontWeight: 600, color: "#0F172A", fontSize: "0.82rem" }}>{inc.title}</Typography></TableCell>
                        <TableCell><Chip label={inc.severity} size="small" sx={{ bgcolor: sv.bg, color: sv.text, border: `1px solid ${sv.border}`, fontWeight: 700, fontSize: "0.65rem", height: 20 }} /></TableCell>
                        <TableCell><Chip label={ss.label} size="small" sx={{ bgcolor: ss.bg, color: ss.text, border: `1px solid ${ss.border}`, fontWeight: 700, fontSize: "0.65rem", height: 20 }} /></TableCell>
                        <TableCell sx={{ fontSize: "0.8rem", color: inc.assignedTo ? "#0F172A" : "#94A3B8" }}>{inc.assignedTo || "—"}</TableCell>
                        <TableCell sx={{ maxWidth: 200 }}><Typography variant="caption" sx={{ color: "#64748B", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{inc.description}</Typography></TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap" }}>
                            {!inc.assignedTo && <Tooltip title={`Assign to ${username || "me"}`}><Button size="small" variant="outlined" onClick={() => act(() => assignIncident(inc.id, username || "admin"), `Assigned to ${username}`)} sx={{ fontSize: "0.68rem", py: 0.3, px: 1, textTransform: "none", borderRadius: "6px", borderColor: "#0F766E", color: "#0F766E", minWidth: 0 }}><AssignmentIndIcon sx={{ fontSize: 13, mr: 0.4 }} />Assign</Button></Tooltip>}
                            {inc.status === "OPEN" && <Tooltip title="Set In Progress"><Button size="small" variant="outlined" onClick={() => act(() => updateIncidentStatus(inc.id, "IN_PROGRESS"), "Status updated.")} sx={{ fontSize: "0.68rem", py: 0.3, px: 1, textTransform: "none", borderRadius: "6px", borderColor: "#D97706", color: "#D97706", minWidth: 0 }}>Start</Button></Tooltip>}
                            {!done && <Tooltip title="Resolve"><Button size="small" variant="contained" onClick={() => act(() => updateIncidentStatus(inc.id, "RESOLVED"), "Incident resolved.")} sx={{ fontSize: "0.68rem", py: 0.3, px: 1, textTransform: "none", borderRadius: "6px", bgcolor: "#16A34A", minWidth: 0, "&:hover": { bgcolor: "#14532D" } }}>Resolve</Button></Tooltip>}
                            <Tooltip title="Delete"><IconButton size="small" onClick={() => act(() => deleteIncident(inc.id), "Deleted.")} sx={{ color: "#DC2626", p: 0.5, "&:hover": { bgcolor: "rgba(220,38,38,0.06)" } }}><DeleteIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                          </Box>
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
            <Typography variant="body1" sx={{ fontWeight: 700, color: "#0F172A" }}>Create New Incident</Typography>
            <Typography variant="caption" sx={{ color: "#64748B" }}>Report a security incident for tracking.</Typography>
          </Box>
          <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: "#94A3B8" }}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {err && <Alert severity="error" sx={{ mb: 2, borderRadius: "8px", fontSize: "0.82rem" }}>{err}</Alert>}
          <Stack spacing={2.2}>
            <TextField label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} fullWidth size="small" placeholder="e.g. Unauthorized SSH access detected" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }} />
            <TextField label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} fullWidth size="small" multiline rows={3} placeholder="Describe the incident..." sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }} />
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <FormControl size="small">
                <InputLabel>Severity</InputLabel>
                <Select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })} label="Severity" sx={{ borderRadius: "8px" }}>
                  {["CRITICAL","HIGH","MEDIUM","LOW"].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small">
                <InputLabel>Status</InputLabel>
                <Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} label="Status" sx={{ borderRadius: "8px" }}>
                  <MenuItem value="OPEN">Open</MenuItem>
                  <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <TextField label="Assign To (optional)" value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })} fullWidth size="small" placeholder="Username or team name" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setOpen(false)} sx={{ textTransform: "none", color: "#64748B", borderRadius: "8px" }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={busy} sx={{ textTransform: "none", bgcolor: "#0F766E", borderRadius: "8px", px: 3, fontWeight: 600, "&:hover": { bgcolor: "#0D5F5A" } }}>
            {busy ? "Creating..." : "Create Incident"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
