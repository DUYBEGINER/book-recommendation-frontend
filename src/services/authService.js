import api from "../config/ApiConfig.js";

export const getUser = async () => {
  try {
    const response = await api.get("/auth/profile");
    return response.data || response;
  } catch (error) {
    console.error("Get user profile failed:", error.response?.data || error.message);
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    return response.data || response;
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post("/auth/register", userData);
    return response.data || response;
  } catch (error) {
    console.error("Register failed:", error.response?.data || error.message);
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await api.post("/auth/logout");
    return response.data || response;
  } catch (error) {
    console.error("Logout failed:", error.response?.data || error.message);
    throw error;
  }
};

export const refreshToken = async () => {
  try {
    const response = await api.post("/auth/refresh");
    return response.data || response;
  } catch (error) {
    console.error("Refresh token failed:", error.response?.data || error.message);
    throw error;
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data || response;
  } catch (error) {
    console.error("Forgot password failed:", error.response?.data || error.message);
    throw error;
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    const response = await api.post("/auth/reset-password", { token, newPassword });
    return response.data || response;
  } catch (error) {
    console.error("Reset password failed:", error.response?.data || error.message);
    throw error;
  }
};