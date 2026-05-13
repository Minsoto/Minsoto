import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Don't add auth header for Google auth endpoint
    if (config.url === '/auth/google/') {
      return config;
    }
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Don't retry Google auth requests
    if (originalRequest.url === '/auth/google/') {
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          try {
            const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
              refresh: refreshToken,
            });
            
            const { access } = response.data;
            localStorage.setItem('access_token', access);
            originalRequest.headers.Authorization = `Bearer ${access}`;
            
            return api(originalRequest);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Simple caching layer to speed up page loads and prevent duplicate requests
const cache = new Map();
const pendingRequests = new Map();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const originalGet = api.get;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
api.get = async function (url: string, config?: any) {
  const key = url + JSON.stringify(config || {});
  
  if (cache.has(key)) {
    const cached = cache.get(key);
    if (Date.now() - cached.time < CACHE_TTL) {
      return Promise.resolve(cached.data);
    } else {
      cache.delete(key);
    }
  }

  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  const promise = originalGet.call(this, url, config)
    .then((response) => {
      cache.set(key, { time: Date.now(), data: response });
      pendingRequests.delete(key);
      return response;
    })
    .catch((err) => {
      pendingRequests.delete(key);
      throw err;
    });

  pendingRequests.set(key, promise);
  return promise;
};

// Clear cache on mutations to ensure fresh data
const clearCache = () => cache.clear();

const originalPost = api.post;
// @ts-expect-error - overriding generic method signature
api.post = async function (...args: any[]) {
  clearCache();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return originalPost.apply(this, args as any);
};

const originalPut = api.put;
// @ts-expect-error - overriding generic method signature
api.put = async function (...args: any[]) {
  clearCache();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return originalPut.apply(this, args as any);
};

const originalPatch = api.patch;
// @ts-expect-error - overriding generic method signature
api.patch = async function (...args: any[]) {
  clearCache();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return originalPatch.apply(this, args as any);
};

const originalDelete = api.delete;
// @ts-expect-error - overriding generic method signature
api.delete = async function (...args: any[]) {
  clearCache();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return originalDelete.apply(this, args as any);
};

export default api;
