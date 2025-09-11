import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Create an instance of axios
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://host.docker.internal:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log the baseURL for debugging
console.log('API Client baseURL:', process.env.NEXT_PUBLIC_API_URL);

// Request interceptor for API calls
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add authorization header if token exists (check both 'token' and 'access_token')
    const token = typeof window !== 'undefined' ? 
      (localStorage.getItem('access_token') || localStorage.getItem('token')) : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('API Response:', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      statusText: response.statusText
    });
    return response;
  },
  async function (error: any) {
    console.error('API Error Details:', {
      message: error?.message || 'Unknown error',
      code: error?.code || 'Unknown code',
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        headers: error.config?.headers
      },
      response: {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      },
      request: error.request ? 'Request object exists' : 'No request object',
      error: error,
      isAxiosError: error?.isAxiosError,
      stack: error?.stack,
      type: typeof error,
      constructor: error?.constructor?.name,
      timestamp: new Date().toISOString()
    });
    
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Handle token refresh if needed
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Try to refresh token
      const refreshToken = localStorage.getItem('refresh_token') || localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://host.docker.internal:8000'}/api/v1/auth/refresh`, {
            refresh_token: refreshToken,
          });
          
          if (res.data.token || res.data.access_token) {
            const newToken = res.data.token || res.data.access_token;
            // Store with both names for backward compatibility
            localStorage.setItem('token', newToken);
            localStorage.setItem('access_token', newToken);
            apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          // If refresh fails, clear all auth data and redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, clear all auth data and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
