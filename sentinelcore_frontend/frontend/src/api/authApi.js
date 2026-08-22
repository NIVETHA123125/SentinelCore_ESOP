import axios from 'axios';

const API_BASE = 'http://localhost:8080/api/auth';

export const login = (username, password) => axios.post(`${API_BASE}/login`, { username, password });
export const register = (data) => axios.post(`${API_BASE}/register`, data);
export const refreshAccessToken = (refreshToken) =>
  axios.post(`${API_BASE}/refresh`, { refreshToken });