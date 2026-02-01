import api from '../config/ApiConfig.js';

export const getAuthors = async () => {
  try {
    const response = await api.get('/authors');
    return response.data || response || [];
  } catch (error) {
    console.error("Error fetching authors:", error);
    throw error;
  }
};

export const getAuthorById = async (authorId) => {
  try {
    const response = await api.get(`/authors/${authorId}`);
    return response.data || response;
  } catch (error) {
    console.error("Error fetching author:", error);
    throw error;
  }
};

export const createAuthor = async (authorData) => {
  try {
    const response = await api.post('/admin/authors/create', authorData);
    return response.data || response;
  } catch (error) {
    console.error("Error creating author:", error);
    throw error;
  }
};

export const updateAuthor = async (authorId, authorData) => {
  try {
    const response = await api.put(`/admin/authors/update/${authorId}`, authorData);
    return response.data || response;
  } catch (error) {
    console.error("Error updating author:", error);
    throw error;
  }
};

export const deleteAuthor = async (authorId) => {
  try {
    const response = await api.delete(`/admin/authors/delete/${authorId}`);
    return response.data || response;
  } catch (error) {
    console.error("Error deleting author:", error);
    throw error;
  }
};
