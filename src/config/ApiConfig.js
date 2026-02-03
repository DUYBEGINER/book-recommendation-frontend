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
    console.log("API request error:", error);
    // Guard: No config means network error or cancelled request
    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isRefreshEndpoint = originalRequest.url?.includes('/auth/refresh');
    const hasRetried = originalRequest._retry === true;
    const is401Error = error.response?.status === 401;
    console.log("API response error intercepted:", {
      url: originalRequest.url,
      status: error.response?.status,
      isRefreshEndpoint,
      hasRetried,
    });
    // Only attempt refresh for 401 errors, not retried requests, and not refresh endpoint itself
    if (is401Error && !hasRetried && !isRefreshEndpoint) {
      
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
        .then((token) => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await api.post("/auth/refresh");
        const accessToken = response?.data?.accessToken || response?.accessToken;
        
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
        clearAuthData();
        console.log("Clear auth data and redirect to login");
        window.location.href = '/';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
