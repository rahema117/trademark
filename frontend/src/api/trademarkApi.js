import apiClient from './client';

export const getTrademarks = async (params = {}) => {
  return await apiClient.get('/trademarks', { params });
};

export const getTrademarkStats = async () => {
  return await apiClient.get('/trademarks/stats');
};

export const getTrademarkById = async (id) => {
  return await apiClient.get(`/trademarks/${id}`);
};

export const createTrademark = async (formData) => {
  return await apiClient.post('/trademarks', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updateTrademark = async (id, formData) => {
  return await apiClient.put(`/trademarks/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteTrademark = async (id) => {
  return await apiClient.delete(`/trademarks/${id}`);
};

export const exportTrademarksApi = async (data = {}) => {
  const response = await apiClient.post('/trademarks/export', data, {
    responseType: 'blob',
  });
  return response.data;
};
