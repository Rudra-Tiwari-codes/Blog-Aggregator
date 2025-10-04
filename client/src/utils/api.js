import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Get all blogs with optional filters
 * @param {Object} params - Query parameters (page, limit, sort, category, source, search)
 * @returns {Promise} API response
 */
export const getBlogs = async (params = {}) => {
  try {
    const response = await api.get('/blogs', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching blogs:', error);
    throw error;
  }
};

/**
 * Get a single blog by ID
 * @param {string} id - Blog ID
 * @returns {Promise} API response
 */
export const getBlogById = async (id) => {
  try {
    const response = await api.get(`/blogs/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching blog:', error);
    throw error;
  }
};

/**
 * Get related blogs for a specific blog
 * @param {string} id - Blog ID
 * @param {number} limit - Number of related blogs to fetch
 * @returns {Promise} API response
 */
export const getRelatedBlogs = async (id, limit = 5) => {
  try {
    const response = await api.get(`/blogs/${id}/related`, { params: { limit } });
    return response.data;
  } catch (error) {
    console.error('Error fetching related blogs:', error);
    throw error;
  }
};

/**
 * Get all categories
 * @returns {Promise} API response
 */
export const getCategories = async () => {
  try {
    const response = await api.get('/blogs/categories/list');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Get blog statistics
 * @returns {Promise} API response
 */
export const getStats = async () => {
  try {
    const response = await api.get('/blogs/stats/overview');
    return response.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};

/**
 * Trigger blog fetching (admin)
 * @returns {Promise} API response
 */
export const fetchBlogs = async () => {
  try {
    const response = await api.post('/admin/fetch-blogs');
    return response.data;
  } catch (error) {
    console.error('Error triggering blog fetch:', error);
    throw error;
  }
};

/**
 * Generate summaries (admin)
 * @returns {Promise} API response
 */
export const generateSummaries = async () => {
  try {
    const response = await api.post('/admin/generate-summaries');
    return response.data;
  } catch (error) {
    console.error('Error generating summaries:', error);
    throw error;
  }
};

export default api;
