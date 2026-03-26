import api from "../config/ApiConfig.js";

const defaultParams = {
  topRatedPage: 0,
  topRatedSize: 5,
  topFavoritedPage: 0,
  topFavoritedSize: 5,
};

/**
 * Fetch admin dashboard data.
 * @param {{ topRatedPage?: number, topRatedSize?: number, topFavoritedPage?: number, topFavoritedSize?: number }} params
 * @returns {{ data: Object|null, message: string }}
 */
export const getAdminDashboard = async (params = {}) => {
  try {
    const response = await api.get("/admin/dashboard", {
      params: { ...defaultParams, ...params },
    });
    console.log("Raw dashboard response", response.data);
    return response;
  } catch (error) {
    console.error("Failed to fetch dashboard:", error);
    throw error;
  }
};

export const getNewUsers = async (time) => {
  try {
    const response = await api.get(`/admin/dashboard/new-users?time=${time}`); 
    return response;
  } catch (error) {
    console.error("Failed to fetch new users last 7 days data:", error);
    throw error;
  }
};