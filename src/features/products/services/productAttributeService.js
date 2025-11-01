import { makeRequest } from "@/utils/makeRequest";

/**
 * Product attribute service for API calls
 */
export const productAttributeService = {
  /**
   * Get all attributes for a product
   * @param {string} productId - Product ID
   * @returns {Promise<Array>} Array of attribute strings
   */
  async getAll(productId) {
    return makeRequest(`/api/v1/admin/products/${productId}/attributes`, {
      method: "GET",
    });
  },

  /**
   * Add or update attributes for a product
   * @param {string} productId - Product ID
   * @param {Array<string>} attributes - Array of attribute names
   * @returns {Promise<Array>} Updated attributes array
   */
  async upsert(productId, attributes) {
    return makeRequest(`/api/v1/admin/products/${productId}/attributes`, {
      method: "POST",
      body: JSON.stringify(attributes),
    });
  },

  /**
   * Delete an attribute from a product
   * @param {string} productId - Product ID
   * @param {string} name - Attribute name
   * @returns {Promise<void>}
   */
  async delete(productId, name) {
    return makeRequest(
      `/api/v1/admin/products/${productId}/attributes/${encodeURIComponent(
        name
      )}`,
      {
        method: "DELETE",
      }
    );
  },
};
