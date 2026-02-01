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
 * @returns {{ dashboard: Object|null, message: string }}
 */
export const getAdminDashboard = async (params = {}) => {
  try {
    const response = await api.get("/admin/dashboard", {
      params: { ...defaultParams, ...params },
    });

    return {
      dashboard: response.data || response || null,
      message: "Dashboard data retrieved successfully",
    };
  } catch (error) {
    console.error("Failed to fetch dashboard:", error);
    return {
      dashboard: null,
      message: error.response?.data?.message || error.message || "Failed to fetch dashboard",
    };
  }
};