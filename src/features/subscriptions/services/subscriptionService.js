import { makeRequest } from "@/utils/makeRequest";

/**
 * Subscription service for admin API calls
 */
export const subscriptionService = {
  /**
   * Get all subscriptions with filtering and pagination
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Subscriptions data with pagination metadata
   */
  async getAll(params = {}) {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return;
      }

      if (Array.isArray(value)) {
        value
          .filter((item) => item !== undefined && item !== null && item !== "")
          .forEach((item) => queryParams.append(key, item));
        return;
      }

      queryParams.append(key, value);
    });

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/admin/subscriptions${
      queryString ? `?${queryString}` : ""
    }`;

    return makeRequest(endpoint, {
      method: "GET",
    });
  },

  /**
   * Get detailed information about a specific subscription
   * @param {string} id - Subscription ID
   * @returns {Promise<Object>} Subscription data
   */
  async getById(id) {
    return makeRequest(`/api/v1/admin/subscriptions/${id}`, {
      method: "GET",
    });
  },

  /**
   * Import a subscription from WordPress/WooCommerce
   * @param {Object} data - Import payload
   * @returns {Promise<Object>} Created subscription data
   */
  async importSubscription(data) {
    return makeRequest("/api/v1/admin/subscriptions/import", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Cancel a subscription immediately
   * @param {string} id - Subscription ID
   * @param {Object} data - Cancellation payload (optional reason)
   * @returns {Promise<Object>} Updated subscription data
   */
  async cancel(id, data = {}) {
    return makeRequest(`/api/v1/admin/subscriptions/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Pause an active subscription
   * @param {string} id - Subscription ID
   * @returns {Promise<Object>} Updated subscription data
   */
  async pause(id) {
    return makeRequest(`/api/v1/admin/subscriptions/${id}/pause`, {
      method: "POST",
    });
  },

  /**
   * Resume a paused subscription
   * @param {string} id - Subscription ID
   * @returns {Promise<Object>} Updated subscription data
   */
  async resume(id) {
    return makeRequest(`/api/v1/admin/subscriptions/${id}/resume`, {
      method: "POST",
    });
  },
};
