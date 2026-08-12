import axios from 'axios';

const API_BASE = 'http://localhost:8080/api/auth';

export const login = (credentials) => axios.post(`${API_BASE}/login`, credentials);
export const register = (data) => axios.post(`${API_BASE}/register`, data);