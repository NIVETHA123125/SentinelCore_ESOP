import api from './axiosConfig';

const API_BASE = 'http://localhost:8080/api/alerts';

export const getAllAlerts = () => api.get(API_BASE);
export const getOpenAlerts = () => api.get(`${API_BASE}/open`);
export const resolveAlert = (id) => api.put(`${API_BASE}/${id}/resolve`);