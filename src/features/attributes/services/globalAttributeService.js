import { makeRequest } from "@/utils/makeRequest";

/**
 * Global attribute service for API calls
 * Manages reusable attribute definitions (e.g., Color, Size)
 */
export const globalAttributeService = {
  /**
   * Get all global attributes with optional search
   * @param {Object} params - Query parameters (search)
   * @returns {Promise<Array>} Array of GlobalAttributeResponseDto
   */
  async getAll(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.search) {
      queryParams.append("search", params.search);
    }

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/admin/global-attributes${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await makeRequest(endpoint, {
      method: "GET",
    });
    // Normalize response - extract data if wrapped
    return response?.data || response || [];
  },

  /**
   * Get a single global attribute by ID
   * @param {string} id - Global attribute ID
   * @returns {Promise<Object>} GlobalAttributeResponseDto
   */
  async getById(id) {
    const response = await makeRequest(
      `/api/v1/admin/global-attributes/${id}`,
      {
        method: "GET",
      }
    );
    // Normalize response - extract data if wrapped
    return response?.data || response;
  },

  /**
   * Create a new global attribute
   * @param {Object} data - CreateGlobalAttributeDto
   * @param {string} data.name - Attribute name
   * @param {string} data.slug - Attribute slug
   * @param {string} [data.description] - Attribute description
   * @param {number} [data.position] - Position/order
   * @param {boolean} [data.visible] - Whether visible
   * @param {boolean} [data.variation] - Whether used for variations
   * @returns {Promise<Object>} GlobalAttributeResponseDto
   */
  async create(data) {
    const response = await makeRequest("/api/v1/admin/global-attributes", {
      method: "POST",
      body: JSON.stringify(data),
    });
    // Normalize response - extract data if wrapped
    return response?.data || response;
  },

  /**
   * Update a global attribute
   * @param {string} id - Global attribute ID
   * @param {Object} data - UpdateGlobalAttributeDto
   * @param {string} [data.name] - Attribute name
   * @param {string} [data.slug] - Attribute slug
   * @param {string} [data.description] - Attribute description
   * @param {number} [data.position] - Position/order
   * @param {boolean} [data.visible] - Whether visible
   * @param {boolean} [data.variation] - Whether used for variations
   * @returns {Promise<Object>} GlobalAttributeResponseDto
   */
  async update(id, data) {
    const response = await makeRequest(
      `/api/v1/admin/global-attributes/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
    // Normalize response - extract data if wrapped
    return response?.data || response;
  },

  /**
   * Delete a global attribute
   * @param {string} id - Global attribute ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    return makeRequest(`/api/v1/admin/global-attributes/${id}`, {
      method: "DELETE",
    });
  },
};
