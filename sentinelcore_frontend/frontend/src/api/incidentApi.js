import api from './axiosConfig';

export const getAllIncidents = () => api.get('/api/incidents');
export const getIncidentById = (id) => api.get(`/api/incidents/${id}`);
export const createIncident = (data) => api.post('/api/incidents', data);
export const assignIncident = (id, user) => api.put(`/api/incidents/${id}/assign?user=${encodeURIComponent(user)}`);
export const updateIncidentStatus = (id, status) => api.put(`/api/incidents/${id}/status?status=${encodeURIComponent(status)}`);
export const deleteIncident = (id) => api.delete(`/api/incidents/${id}`);
