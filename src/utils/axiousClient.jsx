/**
 * Axios Client
 * Re-exports the centralized API client for backward compatibility
 */
import api, { API_BASE_URL } from "../config/ApiConfig";

// Re-export as axiosClient for backward compatibility
export const axiosClient = api;
export { API_BASE_URL };
export default api;
