import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Create an instance of axios
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add authorization header if token exists
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async function (error: AxiosError) {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Handle token refresh if needed
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Try to refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/refresh`, {
            refresh_token: refreshToken,
          });
          
          if (res.data.token) {
            localStorage.setItem('token', res.data.token);
            apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + res.data.token;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          // If refresh fails, redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
