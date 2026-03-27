import axios from 'axios';

const api = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track retry attempts to prevent infinite loops
const retryAttempts = new Map();

// Response interceptor for 401 and 429 handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle rate limiting (429)
    if (error.response?.status === 429) {
      const retryAfter = error.response.data?.retryAfter || 2;
      const requestKey = `${originalRequest.method}:${originalRequest.url}`;
      const attempts = retryAttempts.get(requestKey) || 0;
      
      // Only retry up to 2 times
      if (attempts < 2 && !originalRequest._retry) {
        retryAttempts.set(requestKey, attempts + 1);
        originalRequest._retry = true;
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        
        // Clear retry count after successful retry
        return api(originalRequest).then(response => {
          retryAttempts.delete(requestKey);
          return response;
        });
      }
      
      // Clear retry count after max attempts
      retryAttempts.delete(requestKey);
    }
    
    // Handle unauthorized (401)
    if (error.response?.status === 401) {
      // Only redirect if not already on auth page and not checking auth
      const isAuthCheck = error.config?.url?.includes('/auth/check');
      if (!isAuthCheck && !window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
