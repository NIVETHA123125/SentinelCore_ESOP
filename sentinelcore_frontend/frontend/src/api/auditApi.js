import api from './axiosConfig';

export const getAllAuditLogs = () => api.get('/api/audit');
export const createAuditLog = (data) => api.post('/api/audit', data);
export const getAuditLogsByUsername = (username) => api.get(`/api/audit/user/${encodeURIComponent(username)}`);
