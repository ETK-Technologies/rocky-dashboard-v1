import { makeRequest } from "@/utils/makeRequest";

/**
 * Tag service for API calls
 */
export const tagService = {
  /**
   * Get all tags with optional search
   * @param {Object} params - Query parameters (search)
   * @returns {Promise<Array>} List of tags
   */
  async getAll(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.search) {
      queryParams.append("search", params.search);
    }

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/admin/tags${
      queryString ? `?${queryString}` : ""
    }`;

    return makeRequest(endpoint, {
      method: "GET",
    });
  },

  /**
   * Create a new tag
   * @param {Object} data - Tag data { name, slug, description }
   * @returns {Promise<Object>} Created tag
   */
  async create(data) {
    return makeRequest("/api/v1/admin/tags", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Attach tags to a product
   * @param {string} productId - Product ID
   * @param {Array<string>} tagIds - Array of tag IDs
   * @returns {Promise<Array>} Attached tags
   */
  async attachToProduct(productId, tagIds) {
    return makeRequest(`/api/v1/admin/products/${productId}/tags`, {
      method: "POST",
      body: JSON.stringify({ tagIds }),
    });
  },
};
