import axios from "axios";
// import { clearAuthData } from "../utils/storage.js";

const ACCESS_TOKEN = "access_token"
export const API_BASE_URL = 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 100000,
  withCredentials: true, // Để cookie httpOnly gửi kèm
  headers: {
    "Content-Type": "application/json",
  },
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    // Kiểm tra error.response tồn tại trước khi truy cập status
    const status = error.response?.status;
    const originalRequest = error.config;
    console.log("Original request causing error:", originalRequest);

    if (status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes("/auth/refresh")) {
        // refresh cũng 401 thì chắc chắn hết phiên -> logout
        localStorage.removeItem(ACCESS_TOKEN);
        window.location.href = "/";
        return Promise.reject(error);
      }
      try {
        originalRequest._retry = true; // Mark the request as retried to avoid infinite loops.
        
        // Gọi refresh endpoint - cookie refreshToken sẽ tự động được gửi kèm
        const response = await api.post("/auth/refresh");
        console.log("access token response:", response);
        
        // Response đã được unwrap bởi interceptor nên không cần .data
        const newToken = response?.accessToken || response?.data?.accessToken;
        
        if (newToken) {
          localStorage.setItem(ACCESS_TOKEN, newToken);
          // Update authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return api(originalRequest);
        }
        
        throw new Error('No access token received');
      } catch (refreshErr) {
        console.error("Token refresh failed:", refreshErr);
        localStorage.removeItem(ACCESS_TOKEN);
        // clearAuthData();
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error); // For all other errors, return the error as is.
  }
);

export default api;
