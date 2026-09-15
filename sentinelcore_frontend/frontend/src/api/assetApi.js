import api from './axiosConfig';

const BASE_HOST = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const API_BASE = `${BASE_HOST}/api/assets`;

export const getAllAssets = () => api.get(API_BASE);
export const getDashboardSummary = () => api.get(`${API_BASE}/dashboard/summary`);
export const createAsset = (data) => api.post(API_BASE, data);
export const updateAsset = (id, data) => api.put(`${API_BASE}/${id}`, data);
export const deleteAsset = (id) => api.delete(`${API_BASE}/${id}`);
export const resolveCriticalAsset = (id) => api.put(`${API_BASE}/${id}/resolve-critical`);