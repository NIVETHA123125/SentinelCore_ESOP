import axios from 'axios';

const API_BASE = 'http://localhost:8080/api/assets';

export const getAllAssets = () => axios.get(API_BASE);
export const getDashboardSummary = () => axios.get(`${API_BASE}/dashboard/summary`);
export const createAsset = (data) => axios.post(API_BASE, data);
export const deleteAsset = (id) => axios.delete(`${API_BASE}/${id}`);