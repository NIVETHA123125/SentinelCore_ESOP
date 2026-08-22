import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE = 'http://localhost:8080/api/assets';

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

export const getAllAssets = () => axiosInstance.get('');
export const getDashboardSummary = () => axiosInstance.get('/dashboard/summary');
export const createAsset = (data) => axiosInstance.post('', data);
export const updateAsset = (id, data) => axiosInstance.put(`/${id}`, data);
export const deleteAsset = (id) => axiosInstance.delete(`/${id}`);