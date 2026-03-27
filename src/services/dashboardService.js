import api from "../config/ApiConfig.js";

/**
 * Fetch admin dashboard data.
 */
export const getDashboardStats = async () => {
  try {
    const response = await api.get("/admin/dashboard/stats");
    console.log("Raw dashboard response", response.data);
    return response;
  } catch (error) {
    console.error("Failed to fetch dashboard:", error);
    throw error;
  }
};

/**
 * 
 * @param {{params: Object}} params
 * @returns {{ data: Object|null, message: string }}
 */
export const getTopRatedBooks = async (params = {}) => {
  try {
    const response = await api.get("/admin/dashboard/top-rated-books", {
      params,
    });
    return response;
  } catch (error) {
    console.error("Failed to fetch top rated books:", error);
    throw error;
  }
};

/**
 * 
 * @param {{params: Object}} params
 * @returns {{ data: Object|null, message: string }
 * }
 */
export const getTopFavoritedBooks = async (params = {}) => {
  try {
    const response = await api.get("/admin/dashboard/top-favorited-books", {
      params,
    });
    return response;
  } catch (error) {
    console.error("Failed to fetch top favorited books:", error);
    throw error;
  }
};

/**
 * 
 * @param {{time: number}} time 
 * @returns {{ data: Object|null, message: string }}
 */
export const getNewUsers = async (time) => {
  try {
    const response = await api.get(`/admin/dashboard/new-users?time=${time}`); 
    return response;
  } catch (error) {
    console.error("Failed to fetch new users last 7 days data:", error);
    throw error;
  }
};