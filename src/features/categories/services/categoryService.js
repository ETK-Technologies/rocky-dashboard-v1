import { makeRequest } from "@/utils/makeRequest";

/**
 * Category service for API calls
 */
export const categoryService = {
  /**
   * Get all categories
   * @returns {Promise<Array>} List of categories
   */
  async getAll() {
    return makeRequest("/api/v1/categories", {
      method: "GET",
    });
  },

  /**
   * Get a single category by ID
   * @param {string|number} id - Category ID
   * @returns {Promise<Object>} Category data
   */
  async getById(id) {
    return makeRequest(`/api/v1/categories/${id}`, {
      method: "GET",
    });
  },

  /**
   * Create a new category
   * @param {Object} data - Category data (image should be a URL string from Cloudinary)
   * @returns {Promise<Object>} Created category
   */
  async create(data) {
    return makeRequest("/api/v1/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update a category
   * @param {string|number} id - Category ID
   * @param {Object} data - Category data (image should be a URL string from Cloudinary)
   * @returns {Promise<Object>} Updated category
   */
  async update(id, data) {
    return makeRequest(`/api/v1/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a category
   * @param {string|number} id - Category ID
   * @returns {Promise<Object>} Deletion result
   */
  async delete(id) {
    return makeRequest(`/api/v1/categories/${id}`, {
      method: "DELETE",
    });
  },
};
