/**
 * API Configuration
 * Centralized API base URL and axios instance
 */
import axios from "axios";

import { getAccessToken, setAuthData, clearAuthData } from "../utils/storage";
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

// Track refresh state to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    // Guard: No config means network error or cancelled request
    if (!originalRequest) {
      console.log('No original request config found, cannot attempt token refresh');
      return Promise.reject(error);
    }

    const isAuthEndpoint = originalRequest.url?.includes('/auth/refresh') || 
                            originalRequest.url?.includes('/auth/login') || 
                            originalRequest.url?.includes('/auth/register');
    const hasRetried = originalRequest._retry === true;
    const is401Error = error.response?.status === 401;
    // Only attempt refresh for 401 errors, not retried requests, and not auth endpoints themselves
    if (is401Error && !hasRetried && !isAuthEndpoint) {
      
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
        .then((token) => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          originalRequest._retry = true;
          return api(originalRequest);
        })  
        .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        const accessToken = response?.data?.data?.accessToken || response?.accessToken;
        console.log('Refresh token successful, new access token received', response);
        if (accessToken) {
          setAuthData(accessToken);
          processQueue(null, accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } else {
          throw new Error("No access token received");
        }
      } catch (err) {
        processQueue(err, null);

        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          axios.post(`${API_BASE_URL}/auth/logout`, {}, { withCredentials: true }).catch(() => {});
          clearAuthData();
        }
        
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
