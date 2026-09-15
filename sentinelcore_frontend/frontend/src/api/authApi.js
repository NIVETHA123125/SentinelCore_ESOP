import axios from 'axios';

const BASE_HOST = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const API_BASE = `${BASE_HOST}/api/auth`;

export const login = (username, password) => axios.post(`${API_BASE}/login`, { username, password });
export const register = (data) => axios.post(`${API_BASE}/register`, data);
export const refreshAccessToken = (refreshToken) =>
  axios.post(`${API_BASE}/refresh`, { refreshToken });