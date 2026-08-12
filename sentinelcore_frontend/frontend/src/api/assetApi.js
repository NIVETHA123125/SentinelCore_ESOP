import axios from 'axios';

const API_BASE = 'http://localhost:8080/api/assets';

const axiosInstance = axios.create({ baseURL: API_BASE });

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getAllAssets = () => axiosInstance.get('');
export const getDashboardSummary = () => axiosInstance.get('/dashboard/summary');
export const createAsset = (data) => axiosInstance.post('', data);
export const updateAsset = (id, data) => axiosInstance.put(`/${id}`, data);
export const deleteAsset = (id) => axiosInstance.delete(`/${id}`);