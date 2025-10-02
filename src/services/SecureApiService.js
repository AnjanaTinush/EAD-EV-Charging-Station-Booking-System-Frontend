// Enhanced API Service with Security Patterns
import axios from 'axios';

class SecureApiService {
  constructor() {
    // Get configuration from environment
    this.baseURL = import.meta.env.VITE_API_URL || '/api';
    this.timeout = 30000;
    
    // Create axios instance with security defaults
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest', // CSRF protection
        'X-Client-Version': import.meta.env.VITE_APP_VERSION || '1.0.0'
      }
    });
    
    this.setupInterceptors();
  }
  
  setupInterceptors() {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      (config) => {
        // Add request ID for tracing
        config.headers['X-Request-ID'] = this.generateRequestId();
        
        // Add auth token if available
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Log request in development
        if (import.meta.env.DEV) {
          console.log('🚀 API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            requestId: config.headers['X-Request-ID']
          });
        }
        
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );
    
    // Response interceptor - Handle errors and logging
    this.client.interceptors.response.use(
      (response) => {
        // Log successful response in development
        if (import.meta.env.DEV) {
          console.log('✅ API Response:', {
            status: response.status,
            url: response.config.url,
            requestId: response.config.headers['X-Request-ID']
          });
        }
        
        return response;
      },
      (error) => {
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }
  
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  getAuthToken() {
    // Use sessionStorage for better security (cleared on tab close)
    return sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
  }
  
  handleApiError(error) {
    const errorInfo = {
      message: error.response?.data?.message || 'Network error occurred',
      status: error.response?.status,
      code: error.response?.data?.code,
      requestId: error.config?.headers['X-Request-ID']
    };
    
    // Handle specific error cases
    switch (error.response?.status) {
      case 401:
        console.warn('🔐 Authentication required');
        this.handleAuthError();
        break;
      case 403:
        console.warn('🚫 Access forbidden');
        break;
      case 429:
        console.warn('⏰ Rate limit exceeded');
        break;
      case 500:
        console.error('🔥 Server error');
        break;
      default:
        console.error('❌ API Error:', errorInfo);
    }
    
    // Report error to monitoring service (in production)
    if (import.meta.env.PROD) {
      this.reportError(errorInfo);
    }
  }
  
  handleAuthError() {
    // Clear auth tokens
    sessionStorage.removeItem('authToken');
    localStorage.removeItem('authToken');
    
    // Redirect to login (you can customize this)
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }
  
  reportError(errorInfo) {
    // Send to error reporting service (e.g., Sentry, LogRocket)
    // analytics.track('api_error', errorInfo);
    console.log('📊 Would report error to monitoring:', errorInfo);
  }
  
  // Retry mechanism for failed requests
  async retryRequest(config, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.client(config);
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }
}

// Create singleton instance
export const apiService = new SecureApiService();
export default apiService;