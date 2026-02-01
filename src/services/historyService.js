import api from "../config/ApiConfig.js";

export const getUserHistory = async (userId, { page = 0, size = 8 } = {}) => {
  try {
    const response = await api.get(`/users/${userId}/history`, {
      params: { page, size },
    });

    // Handle response - API returns { success, message, data }
    const pageData = response.data || response || null;

    return {
      history: pageData?.content || [],
      page: pageData,
      message: response.message,
    };
  } catch (error) {
    console.error("Get history failed:", error.response?.data || error.message);
    throw error;
  }
};

export const recordReadingHistory = async (userId, bookId, payload) => {
  try {
    const response = await api.post(`/users/${userId}/books/${bookId}/history`, payload);
    return response.data || response;
  } catch (error) {
    console.error("Record reading history failed:", error.response?.data || error.message);
    throw error;
  }
};

export const getBookProgress = async (userId, bookId) => {
  try {
    const history = await getUserHistory(userId, { page: 0, size: 100 });
    const bookHistory = history.history.find(h => String(h.bookId) === String(bookId));
    return bookHistory?.progress || 0;
  } catch (error) {
    console.error("Get book progress failed:", error);
    return 0;
  }
};