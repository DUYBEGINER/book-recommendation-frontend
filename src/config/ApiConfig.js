// // api.js
// import axios from "axios";

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL,
//   withCredentials: true, // để gửi refresh cookie
// });

// let accessToken = null;
// let isRefreshing = false;
// let queue = [];

// export const setAccessToken = (token) => {
//   accessToken = token;
// };

// api.interceptors.request.use((config) => {
//   if (accessToken) {
//     config.headers.Authorization = `Bearer ${accessToken}`;
//   }
//   return config;
// });

// function processQueue(error, token) {
//   queue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
//   queue = [];
// }

// api.interceptors.response.use(
//   (res) => res,
//   async (err) => {
//     const original = err.config;

//     // chỉ handle 401 một lần cho mỗi request
//     if (err.response?.status === 401 && !original._retry) {
//       original._retry = true;

//       // nếu đang refresh, các request khác đợi
//       if (isRefreshing) {
//         return new Promise((resolve, reject) => {
//           queue.push({ resolve, reject });
//         }).then((token) => {
//           original.headers.Authorization = `Bearer ${token}`;
//           return api(original);
//         });
//       }

//       isRefreshing = true;

//       try {
//         const r = await api.post("/auth/refresh"); // cookie refresh tự gửi
//         const newToken = r.data.accessToken;

//         setAccessToken(newToken);
//         processQueue(null, newToken);

//         original.headers.Authorization = `Bearer ${newToken}`;
//         return api(original);
//       } catch (refreshErr) {
//         processQueue(refreshErr, null);
//         // ở đây bạn có thể redirect về /login
//         return Promise.reject(refreshErr);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     return Promise.reject(err);
//   }
// );

// export default api;
import axios from "axios";
import { clearAuthData, getToken } from "../utils/storage.js";

const ACCESS_TOKEN = "ACCESS_TOKEN"
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
        clearAuthData();
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error); // For all other errors, return the error as is.
  }
);

export default api;
