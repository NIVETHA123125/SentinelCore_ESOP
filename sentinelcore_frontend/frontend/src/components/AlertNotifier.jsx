import { useState, useEffect, useRef } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { getOpenAlerts } from '../api/alertApi';

function AlertNotifier() {
  const [toast, setToast] = useState(null);
  const seenAlertIds = useRef(new Set());
  const isFirstLoad = useRef(true);

  useEffect(() => {
    const checkAlerts = async () => {
      try {
        const res = await getOpenAlerts();
        const alerts = res.data;

        if (isFirstLoad.current) {
          // Don't pop toasts for alerts that already existed before this page loaded
          alerts.forEach(a => seenAlertIds.current.add(a.id));
          isFirstLoad.current = false;
          return;
        }

        const newAlerts = alerts.filter(a => !seenAlertIds.current.has(a.id));
        newAlerts.forEach(a => seenAlertIds.current.add(a.id));

        if (newAlerts.length > 0) {
          setToast(newAlerts[newAlerts.length - 1]); // show the newest one
        }
      } catch (err) {
        console.error('Failed to fetch alerts', err);
      }
    };

    checkAlerts();
    const interval = setInterval(checkAlerts, 15000); // poll every 15s
    return () => clearInterval(interval);
  }, []);

  const severityColor = (severity) => {
    if (severity === 'CRITICAL' || severity === 'HIGH') return 'error';
    if (severity === 'MEDIUM') return 'warning';
    return 'info';
  };

  return (
    <Snackbar
      open={!!toast}
      autoHideDuration={6000}
      onClose={() => setToast(null)}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      {toast && (
        <Alert onClose={() => setToast(null)} severity={severityColor(toast.severity)} variant="filled">
          <strong>{toast.assetName}</strong>: {toast.message}
        </Alert>
      )}
    </Snackbar>
  );
}

export default AlertNotifier;