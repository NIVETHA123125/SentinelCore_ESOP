import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import { getAllAlerts, resolveAlert } from '../api/alertApi';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const knownAlertsMap = useRef(new Map()); // alertId -> status
  const isBaselineLoaded = useRef(false);
  const [latestToast, setLatestToast] = useState(null);

  const addNotification = ({ type, title, message, assetName, severity, alertId }) => {
    if (alertId) {
      knownAlertsMap.current.set(alertId, type === 'RESOLVED' ? 'RESOLVED' : 'OPEN');
    }

    const item = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type, // 'CRITICAL' | 'CREATED' | 'RESOLVED'
      title: title || (type === 'CRITICAL' ? 'Critical Alert' : type === 'RESOLVED' ? 'Alert Resolved' : 'New Alert Created'),
      message: message || '',
      assetName: assetName || 'System Asset',
      severity: severity || (type === 'CRITICAL' ? 'CRITICAL' : type === 'RESOLVED' ? 'RESOLVED' : 'WARNING'),
      timestamp: new Date(),
      read: false,
    };

    setNotifications((prev) => [item, ...prev].slice(0, 40));
    setUnreadCount((prev) => prev + 1);
    setLatestToast(item);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => {
      const target = prev.find((n) => n.id === id);
      if (target && !target.read) {
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      return prev.filter((n) => n.id !== id);
    });
  };

  // Poll alerts to detect real-time events (CREATED, CRITICAL, RESOLVED)
  const pollAlerts = async () => {
    const token = Cookies.get('accessToken');
    if (!token) return;

    try {
      const res = await getAllAlerts();
      const alerts = res.data || [];

      if (!isBaselineLoaded.current) {
        // First load: record baseline so historical alerts do NOT show an unread count
        alerts.forEach((a) => {
          knownAlertsMap.current.set(a.id, a.status?.toUpperCase());
        });
        isBaselineLoaded.current = true;
        return;
      }

      // Check for status changes or new alerts in a single batch
      const newItems = [];
      alerts.forEach((a) => {
        const prevStatus = knownAlertsMap.current.get(a.id);
        const currentStatus = a.status?.toUpperCase();

        if (!knownAlertsMap.current.has(a.id)) {
          // A new alert was created!
          knownAlertsMap.current.set(a.id, currentStatus);
          const isCritical = a.severity?.toUpperCase() === 'CRITICAL';
          newItems.push({
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: isCritical ? 'CRITICAL' : 'CREATED',
            title: isCritical ? `CRITICAL Breach: ${a.assetName}` : `New Alert Created: ${a.assetName}`,
            message: a.message || 'System metrics reached threshold.',
            assetName: a.assetName,
            severity: a.severity,
            timestamp: new Date(),
            read: false,
          });
        } else if (prevStatus === 'OPEN' && currentStatus === 'RESOLVED') {
          // An alert was resolved!
          knownAlertsMap.current.set(a.id, 'RESOLVED');
          newItems.push({
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'RESOLVED',
            title: `Alert Resolved: ${a.assetName}`,
            message: `Incident #${a.id} for "${a.assetName}" was marked as resolved.`,
            assetName: a.assetName,
            severity: 'RESOLVED',
            timestamp: new Date(),
            read: false,
          });
        }
      });

      if (newItems.length > 0) {
        setNotifications((prev) => [...newItems, ...prev].slice(0, 40));
        setUnreadCount((prev) => prev + newItems.length);
        // Show at most the highest priority toast to avoid notification jitter/glitch
        const criticalToast = newItems.find((n) => n.type === 'CRITICAL') || newItems[0];
        setLatestToast(criticalToast);
      }
    } catch (err) {
      // Background poll silently ignores network blips
    }
  };

  useEffect(() => {
    pollAlerts();
    const interval = setInterval(pollAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        clearNotifications,
        markAllAsRead,
        removeNotification,
        latestToast,
        setLatestToast,
        pollAlerts,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
