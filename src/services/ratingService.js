import api from '../config/ApiConfig.js';

/**
 * Create or update a rating for a book.
 * @param {string} userId
 * @param {string} bookId 
 * @param {{ value: number, comment: string }} ratingData
 * @returns {Promise<any>}
 */
export const createOrUpdateRating = async (userId, bookId, ratingData) => {
    try {
        const response = await api.post(`/users/${userId}/books/${bookId}/ratings`, ratingData);
        return response.data || response;
    } catch (error) {
        console.error('Create/Update rating failed:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Get all ratings for a book
 * @param {string} userId Pass '0' to get ALL ratings of the book
 * @param {string} bookId
 * @returns {Promise<any>}
 */
export const getBookRatings = async (userId, bookId) => {
    try {
        const response = await api.get(`/users/${userId}/books/${bookId}/ratings`);
        return response.data || response || [];
    } catch (error) {
        console.error('Get book ratings failed:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Delete a rating for a book.
 * @param {string} userId
 * @param {string} bookId
 * @returns {Promise<any>}
 */
export const deleteRating = async (userId, bookId) => {
    try {
        const response = await api.delete(`/users/${userId}/books/${bookId}/ratings`);
        return response.data || response;
    } catch (error) {
        console.error('Delete rating failed:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Get the average rating for a book.
 * @param {string} userId The ID of the user (can be a dummy value if not used by backend for this specific call).
 * @param {string} bookId
 * @returns {Promise<{averageRating: number, totalRatings: number}>}
 */
export const getAverageRatingByBookId = async (userId, bookId) => {
    try {
        const response = await api.get(`/users/${userId}/books/${bookId}/average-rating`);
        return response.data || response;
    } catch (error) {
        console.error('Get average rating failed:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Get user's own rating for a book
 * @param {string} userId
 * @param {string} bookId
 * @returns {Promise<any>}
 */
export const getUserRating = async (userId, bookId) => {
    try {
        const ratings = await getBookRatings(userId, bookId);
        // If userId is specific, return the first (and only) rating
        return ratings.length > 0 ? ratings[0] : null;
    } catch (error) {
        console.error('Get user rating failed:', error);
        return null;
    }
};