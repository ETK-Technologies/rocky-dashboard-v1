import { makeRequest } from "@/utils/makeRequest";

/**
 * Subscription plan service for admin API calls
 */
export const subscriptionPlanService = {
  /**
   * Get all subscription plans
   * @returns {Promise<Object>} Plans data
   */
  async getAll() {
    return makeRequest("/api/v1/admin/subscription-plans", {
      method: "GET",
    });
  },

  /**
   * Get a specific subscription plan
   * @param {string} id - Plan ID
   * @returns {Promise<Object>} Plan data
   */
  async getById(id) {
    return makeRequest(`/api/v1/admin/subscription-plans/${id}`, {
      method: "GET",
    });
  },

  /**
   * Create a new subscription plan
   * @param {Object} data - Plan data
   * @returns {Promise<Object>} Created plan data
   */
  async create(data) {
    return makeRequest("/api/v1/admin/subscription-plans", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update a subscription plan
   * @param {string} id - Plan ID
   * @param {Object} data - Updated plan data
   * @returns {Promise<Object>} Updated plan data
   */
  async update(id, data) {
    return makeRequest(`/api/v1/admin/subscription-plans/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a subscription plan
   * @param {string} id - Plan ID
   * @returns {Promise<Object>} Deletion response
   */
  async delete(id) {
    return makeRequest(`/api/v1/admin/subscription-plans/${id}`, {
      method: "DELETE",
    });
  },
};
