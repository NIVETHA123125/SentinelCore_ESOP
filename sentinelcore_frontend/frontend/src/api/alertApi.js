import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE = 'http://localhost:8080/api/alerts';

const axiosInstance = axios.create({ baseURL: API_BASE });

axiosInstance.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const getAllAlerts = () => axiosInstance.get('');
export const getOpenAlerts = () => axiosInstance.get('/open');
export const resolveAlert = (id) => axiosInstance.put(`/${id}/resolve`);