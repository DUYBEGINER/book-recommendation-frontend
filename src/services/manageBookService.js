import api from "../config/ApiConfig.js";

export const getBooks = async (page = 0, size = 10) => {
  try {
    const response = await api.get("/books", {
      params: { page, size }
    });
    return response;
  } catch (error) {
    console.error("Get books failed:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetch books by genre with pagination and sorting.
 * @param {string|number} genreId
 * @param {{ page?: number, size?: number, sort?: string }} options
 * @returns {{ content: Array, page: number, size: number, total: number, totalPages: number }}
 */
export const getBooksByGenre = async (genreId, { page = 0, size = 10, sort = '' } = {}) => {
  try {
    const params = { page, size };
    if (sort?.trim()) {
      params.sort = sort.trim();
    }

    const response = await api.get(`/books/genre/${genreId}`, { params });
    return response.data || response;
  } catch (error) {
    console.error("Get books by genre failed:", error.response?.data || error.message);
    throw error;
  }
};

export const searchBooks = async (keyword, page = 0, size = 10) => {
  try {
    const response = await api.get("/books/search", {
      params: { keyword, page, size }
    });
    return response;
  } catch (error) {
    console.error("Search books failed:", error.response?.data || error.message);
    throw error;
  }
};

export const getBookDetail = async (bookId, userId = null) => {
  try {
    const response = await api.get(`/books/${bookId}`, {
      params: { userId }
    });
    return response.data || response;
  } catch (error) {
    console.error(
      "Get book detail failed:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const createBook = async (payload) => {
  try {
    const response = await api.post("/admin/books/create", payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  } catch (error) {
    console.error("Create book failed:", error.response?.data || error.message);
    throw error;
  }
};

export const updateBook = async (bookId, payload) => {
  try {
    const response = await api.put(`/admin/books/update/${bookId}`, payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  } catch (error) {
    console.error("Update book failed:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteBook = async (bookId) => {
  try {
    const response = await api.delete(`/admin/books/delete/${bookId}`);
    return response;
  } catch (error) {
    console.error("Delete book failed:", error.response?.data || error.message);
    throw error;
  }
};

export const getDeletedBooks = async ({ page = 0, size = 10, keyword = "", sort = "" } = {}) => {
  try {
    const params = { page, size };
    if (keyword?.trim()) params.keyword = keyword.trim();
    if (sort?.trim()) params.sort = sort.trim();
    return await api.get("/admin/books/deleted", { params });
  } catch (error) {
    console.error("Get deleted books failed:", error.response?.data || error.message);
    throw error;
  }
};

export const hardDeleteBook = async (bookId) => {
  try {
    return await api.delete(`/admin/books/hard-delete/${bookId}`);
  } catch (error) {
    console.error("Hard delete book failed:", error.response?.data || error.message);
    throw error;
  }
};

export const restoreBook = async (bookId) => {
  try {
    return await api.patch(`/admin/books/restore/${bookId}`);
  } catch (error) {
    console.error("Restore book failed:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteBooksBulk = async (bookIds = []) => {
  try {
    return await api.delete("/admin/books", {
      data: { ids: bookIds },
    });
  } catch (error) {
    console.error("Bulk delete books failed:", error.response?.data || error.message);
    throw error;
  }
};

export const getAdminBooks = async ({
  page = 0,
  size = 10,
  keyword = "",
  genreId,
  sort = "",
} = {}) => {
  try {
    const params = { page, size };
    if (keyword?.trim()) {
      params.keyword = keyword.trim();
    }
    if (genreId !== undefined && genreId !== null && genreId !== "") {
      params.genreId = genreId;
    }
    if (sort?.trim()) {
      params.sort = sort.trim();
    }

    return await api.get("/admin/books", { params });
  } catch (error) {
    console.error("Get admin books failed:", error.response?.data || error.message);
    throw error;
  }
};

export const getBookFormats = async (bookId) => {
  try {
    const response = await api.get(`/books/${bookId}/formats`);
    return response.data || response || [];
  } catch (error) {
    console.error("Get book formats failed:", error.response?.data || error.message);
    throw error;
  }
};
