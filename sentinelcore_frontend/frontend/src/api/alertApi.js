import axios from 'axios';

const API_BASE = 'http://localhost:8080/api/alerts';

const axiosInstance = axios.create({ baseURL: API_BASE });

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getAllAlerts = () => axiosInstance.get('');
export const getOpenAlerts = () => axiosInstance.get('/open');
export const resolveAlert = (id) => axiosInstance.post(`/${id}/resolve`);