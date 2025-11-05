import { makeRequest } from "@/utils/makeRequest";

/**
 * Product global attribute service for API calls
 * Manages assigning global attributes to products
 */
export const productGlobalAttributeService = {
  /**
   * Get all global attributes assigned to a product
   * @param {string} productId - Product ID
   * @returns {Promise<Array>} Array of ProductGlobalAttributeResponseDto
   */
  async getAll(productId) {
    const response = await makeRequest(
      `/api/v1/admin/global-attributes/products/${productId}`,
      {
        method: "GET",
      }
    );
    // Normalize response - extract data if wrapped
    return response?.data || response || [];
  },

  /**
   * Bulk assign global attributes to a product
   * @param {string} productId - Product ID
   * @param {Object} data - BulkAssignGlobalAttributesDto
   * @param {Array} data.attributes - Array of AssignGlobalAttributeToProductDto
   * @param {string} data.attributes[].globalAttributeId - Global attribute ID
   * @param {string} data.attributes[].value - Attribute value for this product
   * @param {number} [data.attributes[].position] - Position/order
   * @param {boolean} [data.attributes[].visible] - Whether visible
   * @param {boolean} [data.attributes[].variation] - Whether used for variations
   * @returns {Promise<Array>} Array of ProductGlobalAttributeResponseDto
   */
  async bulkAssign(productId, data) {
    const response = await makeRequest(
      `/api/v1/admin/global-attributes/products/${productId}`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    // Normalize response - extract data if wrapped
    return response?.data || response || [];
  },

  /**
   * Remove a global attribute from a product
   * @param {string} productId - Product ID
   * @param {string} globalAttributeId - Global attribute ID
   * @returns {Promise<void>}
   */
  async remove(productId, globalAttributeId) {
    return makeRequest(
      `/api/v1/admin/global-attributes/products/${productId}/${globalAttributeId}`,
      {
        method: "DELETE",
      }
    );
  },
};
