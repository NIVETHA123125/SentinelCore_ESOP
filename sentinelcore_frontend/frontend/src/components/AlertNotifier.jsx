import React from 'react';
import { Snackbar, Alert, Slide, Box, Typography } from '@mui/material';
import { useNotifications } from '../context/NotificationContext';

function SlideTransition(props) {
  return <Slide {...props} direction="left" />;
}

function AlertNotifier() {
  const { latestToast, setLatestToast } = useNotifications();

  if (!latestToast) return null;

  const severityColor = (type, severity) => {
    if (type === 'RESOLVED') return 'success';
    if (type === 'CRITICAL' || severity === 'CRITICAL' || severity === 'HIGH') return 'error';
    if (type === 'CREATED' || severity === 'MEDIUM') return 'warning';
    return 'info';
  };

  return (
    <Snackbar
      open={Boolean(latestToast)}
      autoHideDuration={4500}
      onClose={(event, reason) => {
        if (reason === 'clickaway') return;
        setLatestToast(null);
      }}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{ top: '72px !important', right: '24px !important', zIndex: 9999 }}
      TransitionComponent={SlideTransition}
      key={latestToast.id}
    >
      <Box sx={{ width: '100%', maxWidth: 420 }}>
        <Alert
          onClose={() => setLatestToast(null)}
          severity={severityColor(latestToast.type, latestToast.severity)}
          variant="filled"
          sx={{
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.2)',
            borderRadius: '8px',
            fontSize: '0.84rem',
            alignItems: 'center',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.84rem' }}>
            {latestToast.title}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.78rem', mt: 0.3, opacity: 0.95 }}>
            {latestToast.message}
          </Typography>
        </Alert>
      </Box>
    </Snackbar>
  );
}

export default AlertNotifier;