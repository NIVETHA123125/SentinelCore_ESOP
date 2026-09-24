import api from './axiosConfig';

export const getAllComplianceChecks = () => api.get('/api/compliance');
export const createComplianceCheck = (data) => api.post('/api/compliance', data);
export const getComplianceChecksByFramework = (framework) => api.get(`/api/compliance/framework/${encodeURIComponent(framework)}`);
