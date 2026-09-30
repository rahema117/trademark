import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'https://trademark-43em.onrender.com/api';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Normalize responses and handle central errors
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    let message = 'حدث خطأ في الاتصال بالخادم';

    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message) {
      message = error.message;
    }

    // Handle 401 Unauthorized globally
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      // Broadcast logout event if needed or reload to login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    const normalizedError = new Error(message);
    normalizedError.status = status;
    normalizedError.originalError = error;

    return Promise.reject(normalizedError);
  }
);

export default apiClient;
