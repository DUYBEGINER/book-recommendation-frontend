import api from "../config/ApiConfig.js";

export const getRecommendedBooks = async (userId, limit = 10) => {
  try {
    const response = await api.get('/recommendations', {
      params: { userId, limit }
    });
    return response;
  } catch (error) {
    console.error("Failed to fetch recommended books:", error);
    throw error;
  }
};

export const getSimilarBooks = async (bookId, limit = 10) => {
  try {
    const response = await api.get('/similar-books', {
      params: { bookId, limit }
    });
    return response;
  } catch (error) {
    console.error("Failed to fetch similar books:", error);
    throw error;
  }
};

export const getDiversityBooks = async (bookId, { limit = 5 } = {}) => {
  try {
    const response = await api.get('/diversity-books', {
      params: { bookId, limit }
    });
    return response;
  } catch (error) {
    console.error("Failed to fetch diversity books:", error);
    throw error;
  }
};

export const getBookDetail = async (bookId) => {
  try {
    const response = await api.get(`/books/${bookId}`);
    return response.data || response;
  } catch (error) {
    console.error("Failed to fetch book detail:", error);
    throw error;
  }
};

/**
 * Get most read books (top books by reading history count)
 * @param {number} page - Page number (0-based)
 * @param {number} size - Number of books per page
 * @returns {Promise} Response with most read books
 */
export const getMostReadBooks = async (page = 0, size = 5, signal) => {
  try {
    const response = await api.get('/books/most-read', {
      params: { page, size },
      signal
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch most read books:", error);
    throw error;
  }
};

export const getPreviewBook = async (bookId) => {
  try {
    const response = await api.get(`/books/${bookId}/preview`);
    return response.data || response;
  } catch (error) {
    console.error("Failed to fetch book preview:", error);
    throw error;
  }
};

/**
 * Get a presigned URL for reading a book (EPUB/PDF).
 * @param {number|string} bookId
 * @param {string} format - Preferred format: "EPUB" | "PDF"
 * @returns {Promise<{ url: string, typeName: string, expiresIn: number }>}
 */
export const getBookReadUrl = async (bookId, format = 'EPUB') => {
  const response = await api.get(`/books/${bookId}/read-url`, {
    params: { format },
  });
  return response.data || response;
};

/**
 * Get a presigned download URL for a specific book format.
 * @param {number|string} bookId
 * @param {number|string} formatId
 * @returns {Promise<{ url: string, fileName: string, typeName: string, expiresIn: number }>}
 */
export const getBookDownloadUrl = async (bookId, formatId) => {
  const response = await api.get(`/books/${bookId}/download/${formatId}`);
  return response.data || response;
};

/**
 * Fetch a capped list of non-deleted books sharing at least one genre with
 * the given book, excluding the book itself, ordered newest-first.
 *
 * @param {string|number} bookId - Source book whose genres are matched.
 * @param {number}        limit  - Max results to return (default 6, backend caps at 20).
 * @returns {Promise<Array>} Array of book list items shaped by toBookListResponse.
 */
export const getSameGenreBooks = async (bookId, limit = 6) => {
  const response = await api.get(`/books/${bookId}/same-genre`, {
    params: { limit },
  });
  return response.data || response;
};
