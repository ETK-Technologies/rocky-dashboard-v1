import { makeRequest } from "@/utils/makeRequest";

/**
 * Cart service for API calls
 * All endpoints require admin access
 */
export const cartService = {
  /**
   * Get redundant carts with filtering and pagination
   * @param {Object} params - Query parameters
   * @param {string} [params.filter] - Filter type: all, empty, expired, abandoned, guest, user
   * @param {number} [params.page] - Page number (default: 1)
   * @param {number} [params.limit] - Items per page (default: 20)
   * @param {string} [params.userId] - Filter by specific user ID
   * @param {string} [params.sessionId] - Filter by specific session ID
   * @param {string} [params.createdBefore] - Filter carts created before date (ISO 8601)
   * @param {string} [params.updatedBefore] - Filter carts updated before date (ISO 8601)
   * @param {number} [params.abandonedDays] - Days for abandoned filter (default: 30)
   * @returns {Promise<Object>} Redundant carts data with pagination
   */
  async getRedundantCarts(params = {}) {
    const queryParams = new URLSearchParams();

    // Add all provided parameters
    Object.keys(params).forEach((key) => {
      if (
        params[key] !== undefined &&
        params[key] !== null &&
        params[key] !== ""
      ) {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/admin/carts/redundant${
      queryString ? `?${queryString}` : ""
    }`;

    return makeRequest(endpoint, {
      method: "GET",
    });
  },

  /**
   * Delete redundant carts in bulk
   * @param {Object} params - Query parameters
   * @param {string} [params.filter] - Filter type: all, empty, expired, abandoned, guest, user
   * @param {string} [params.userId] - Filter by specific user ID
   * @param {string} [params.sessionId] - Filter by specific session ID
   * @param {string} [params.createdBefore] - Filter carts created before date (ISO 8601)
   * @param {string} [params.updatedBefore] - Filter carts updated before date (ISO 8601)
   * @param {number} [params.abandonedDays] - Days for abandoned filter (default: 30)
   * @returns {Promise<Object>} Deletion result with count
   */
  async deleteRedundantCarts(params = {}) {
    const queryParams = new URLSearchParams();

    // Add all provided parameters
    Object.keys(params).forEach((key) => {
      if (
        params[key] !== undefined &&
        params[key] !== null &&
        params[key] !== ""
      ) {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/admin/carts/redundant${
      queryString ? `?${queryString}` : ""
    }`;

    return makeRequest(endpoint, {
      method: "DELETE",
    });
  },

  /**
   * Get abandoned carts with filtering and pagination
   * @param {Object} params - Query parameters
   * @param {number} [params.abandonedDays] - Minimum days since last update (default: 30)
   * @param {number} [params.page] - Page number (default: 1)
   * @param {number} [params.limit] - Items per page (default: 20)
   * @param {string} [params.userId] - Filter by specific user ID
   * @param {string} [params.sessionId] - Filter by specific session ID
   * @param {string} [params.createdBefore] - Filter carts created before date (ISO 8601)
   * @param {string} [params.updatedBefore] - Filter carts updated before date (ISO 8601)
   * @returns {Promise<Object>} Abandoned carts data with pagination and summary
   */
  async getAbandonedCarts(params = {}) {
    const queryParams = new URLSearchParams();

    // Add all provided parameters
    Object.keys(params).forEach((key) => {
      if (
        params[key] !== undefined &&
        params[key] !== null &&
        params[key] !== ""
      ) {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/admin/carts/abandoned${
      queryString ? `?${queryString}` : ""
    }`;

    return makeRequest(endpoint, {
      method: "GET",
    });
  },

  /**
   * Delete abandoned carts in bulk
   * @param {Object} params - Query parameters
   * @param {number} [params.abandonedDays] - Minimum days since last update (default: 30)
   * @param {string} [params.userId] - Filter by specific user ID
   * @param {string} [params.sessionId] - Filter by specific session ID
   * @param {string} [params.createdBefore] - Filter carts created before date (ISO 8601)
   * @param {string} [params.updatedBefore] - Filter carts updated before date (ISO 8601)
   * @returns {Promise<Object>} Deletion result with count and total value
   */
  async deleteAbandonedCarts(params = {}) {
    const queryParams = new URLSearchParams();

    // Add all provided parameters
    Object.keys(params).forEach((key) => {
      if (
        params[key] !== undefined &&
        params[key] !== null &&
        params[key] !== ""
      ) {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/admin/carts/abandoned${
      queryString ? `?${queryString}` : ""
    }`;

    return makeRequest(endpoint, {
      method: "DELETE",
    });
  },
};
