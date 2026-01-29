import axios from "axios";
// import { API_BASE_URL } from "../config/ApiConfig";
import { getAccessToken } from "./storage";
import { tokenUtils } from "./tokenUtils";
const API_BASE_URL = 'http://localhost:8080/api/v1';
const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // QUAN TRỌNG: để cookie httpOnly gửi kèm
  headers: {
    "Content-Type": "application/json",
  },
});


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


axiosClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (config.headers.Authorization) {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh for auth endpoints
    const isRefreshEndpoint = originalRequest.url?.includes('/auth/refresh');

    // Only attempt refresh for 401 errors, not retried requests, and not refresh endpoint itself
    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshEndpoint) {
      
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
        .then((token) => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return axiosClient(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh endpoint - cookie refreshToken will be sent automatically
        const response = await axiosClient.post("/auth/refresh");
        
        // ✅ FIX: response đã được unwrap, không cần .data
        const accessToken = response?.accessToken;
        
        if (accessToken) {
          tokenUtils.setAccessToken(accessToken);
          processQueue(null, accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosClient(originalRequest);
        } else {
          throw new Error("No access token received");
        }
      } catch (err) {
        processQueue(err, null);
        tokenUtils.clearAccessTokens();
        
        // Redirect to login
        window.location.href = '/';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // For all other errors, just reject
    return Promise.reject(error);
  }
);

// axiosClient.interceptors.response.use(
//   (response) => response.data,
//   async (error) => {
//     const originalRequest = error.config;

//     // Skip refresh for auth endpoints
//     const isRefreshEndpoint = originalRequest.url?.includes('/auth/refresh');

//     // Only attempt refresh for 401 errors, not retried requests, and not refresh endpoint itself
//     if (error.response?.status === 401 && !originalRequest._retry && !isRefreshEndpoint) {
      
//       // If already refreshing, queue this request
//       if (isRefreshing) {
//         return new Promise(function(resolve, reject) {
//           failedQueue.push({ resolve, reject });
//         })
//         .then((token) => {
//           originalRequest.headers['Authorization'] = 'Bearer ' + token;
//           return axiosClient(originalRequest);
//         })
//         .catch((err) => {
//           return Promise.reject(err);
//         });
//       }

//       originalRequest._retry = true;
//       isRefreshing = true;

//       try {
//         // Call refresh endpoint - cookie refreshToken will be sent automatically
//         const response = await axiosClient.post("/auth/refresh");
//         const accessToken = response?.accessToken;
        
//         if (accessToken) {
//           tokenUtils.setAccessToken(accessToken);
//           processQueue(null, accessToken);
//           originalRequest.headers.Authorization = `Bearer ${accessToken}`;
//           return axiosClient(originalRequest);
//         } else {
//           throw new Error("No access token received");
//         }
//       } catch (err) {
//         processQueue(err, null);
//         tokenUtils.clearAccessTokens();
        
//         // Redirect to login
//         window.location.href = '/';
//         return Promise.reject(err);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     // For all other errors, just reject
//     return Promise.reject(error);
//   }
// );
export { axiosClient };
