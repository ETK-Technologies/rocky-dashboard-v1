import { makeRequest } from "@/utils/makeRequest";

/**
 * Coupon service for API calls
 * All endpoints require admin access
 */
export const couponService = {
  /**
   * Get all coupons with filtering and pagination
   * @param {Object} params - Query parameters
   * @param {number} [params.page] - Page number (default: 1)
   * @param {number} [params.limit] - Items per page (default: 10)
   * @param {string} [params.search] - Search by code or name
   * @param {string} [params.type] - Filter by coupon type (PERCENTAGE, FIXED_AMOUNT)
   * @param {boolean} [params.isActive] - Filter by active status
   * @param {string} [params.expirationStatus] - Filter by expiration status (active, expired, upcoming)
   * @param {string} [params.sortBy] - Sort field (default: createdAt)
   * @param {string} [params.sortOrder] - Sort order (asc, desc) (default: desc)
   * @returns {Promise<Object>} Coupons data with pagination
   */
  async getAll(params = {}) {
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
    const endpoint = `/api/v1/admin/coupons${
      queryString ? `?${queryString}` : ""
    }`;

    return makeRequest(endpoint, {
      method: "GET",
    });
  },

  /**
   * Get coupon by ID
   * @param {string} id - Coupon ID
   * @returns {Promise<Object>} Coupon data
   */
  async getById(id) {
    return makeRequest(`/api/v1/admin/coupons/${id}`, {
      method: "GET",
    });
  },

  /**
   * Create a new coupon
   * @param {Object} data - Coupon data
   * @param {string} data.code - Coupon code
   * @param {string} data.name - Coupon name
   * @param {string} [data.description] - Coupon description
   * @param {string} data.type - Coupon type (PERCENTAGE, FIXED_AMOUNT)
   * @param {number} data.value - Discount value
   * @param {number} [data.minimumAmount] - Minimum order amount
   * @param {number} [data.maximumDiscount] - Maximum discount amount
   * @param {number} [data.usageLimit] - Total usage limit
   * @param {number} [data.usageLimitPerUser] - Usage limit per user
   * @param {string} data.validFrom - Valid from date (ISO 8601)
   * @param {string} data.validUntil - Valid until date (ISO 8601)
   * @param {boolean} [data.isActive] - Is active (default: true)
   * @param {number} [data.wordpressId] - WordPress ID
   * @returns {Promise<Object>} Created coupon
   */
  async create(data) {
    return makeRequest("/api/v1/admin/coupons", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing coupon
   * @param {string} id - Coupon ID
   * @param {Object} data - Partial coupon data to update
   * @returns {Promise<Object>} Updated coupon
   */
  async update(id, data) {
    return makeRequest(`/api/v1/admin/coupons/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a coupon
   * @param {string} id - Coupon ID
   * @returns {Promise<Object>} Deletion result
   */
  async delete(id) {
    return makeRequest(`/api/v1/admin/coupons/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Get coupon usage statistics
   * @param {string} id - Coupon ID
   * @returns {Promise<Object>} Usage statistics
   */
  async getUsageStats(id) {
    return makeRequest(`/api/v1/admin/coupons/${id}/usage`, {
      method: "GET",
    });
  },

  /**
   * Activate a coupon
   * @param {string} id - Coupon ID
   * @returns {Promise<Object>} Updated coupon
   */
  async activate(id) {
    return makeRequest(`/api/v1/admin/coupons/${id}/activate`, {
      method: "POST",
    });
  },

  /**
   * Deactivate a coupon
   * @param {string} id - Coupon ID
   * @returns {Promise<Object>} Updated coupon
   */
  async deactivate(id) {
    return makeRequest(`/api/v1/admin/coupons/${id}/deactivate`, {
      method: "POST",
    });
  },
};
