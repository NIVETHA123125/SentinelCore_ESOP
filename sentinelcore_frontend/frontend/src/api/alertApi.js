import api from './axiosConfig';

const BASE_HOST = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const API_BASE = `${BASE_HOST}/api/alerts`;

export const getAllAlerts = () => api.get(API_BASE);
export const getOpenAlerts = () => api.get(`${API_BASE}/open`);
export const resolveAlert = (id) => api.put(`${API_BASE}/${id}/resolve`);

/**
 * Fetches a paginated slice of alerts.
 * @param {number} page  - 0-indexed page number
 * @param {number} size  - records per page (default 50)
 * @param {string} status - 'ALL' | 'OPEN' | 'RESOLVED'
 */
export const getAlertsPaged = (page = 0, size = 50, status = 'ALL') =>
  api.get(`${API_BASE}/paged`, { params: { page, size, status } });