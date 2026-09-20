import apiClient from './client';

export const loginApi = async (email, password) => {
  return await apiClient.post('/auth/login', { email, password });
};

export const getMeApi = async () => {
  return await apiClient.get('/auth/me');
};
