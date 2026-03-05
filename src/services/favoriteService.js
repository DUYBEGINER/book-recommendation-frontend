import api from '../config/ApiConfig.js';

export const getBookFavorites = async (userId) => {
    try {
        const response = await api.get(`/users/${userId}/favorites`);
        return response.data || response || [];
    } catch (error) {
        console.error('Get favorites failed:', error.response?.data || error.message);
        throw error;
    }
};

export const addFavorite = async (userId, bookId) => {
    try {
        const response = await api.post(`/users/${userId}/favorites/${bookId}`);
        return response.data || response;
    } catch (error) {
        console.error('Add favorite failed:', error.response?.data || error.message);
        throw error;
    }
};

export const removeFavorite = async (userId, bookId) => {
    try {
        const response = await api.delete(`/users/${userId}/favorites/${bookId}`);
        return response.data || response;
    } catch (error) {
        console.error('Remove favorite failed:', error.response?.data || error.message);
        throw error;
    }
};

export const isFavorite = async (userId, bookId) => {
    try {
        const favorites = await getBookFavorites(userId);
        return favorites.some(fav => 
            String(fav.bookId) === String(bookId) || 
            String(fav.book?.id) === String(bookId)
        );
    } catch (error) {
        console.error('Check favorite failed:', error);
        return false;
    }
};