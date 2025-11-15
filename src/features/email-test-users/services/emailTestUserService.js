import { makeRequest } from "@/utils/makeRequest";

/**
 * Email test user service for API calls
 * Uses the actual backend API: /api/v1/admin/settings/email/test-users
 */
export const emailTestUserService = {
  /**
   * Get all email test users
   * @returns {Promise<Array>} Array of test users
   */
  async getAll() {
    return makeRequest("/api/v1/admin/settings/email/test-users", {
      method: "GET",
    });
  },

  /**
   * Create a new email test user
   * @param {Object} data - Test user data { email, name, description, isActive }
   * @returns {Promise<Object>} Created test user
   */
  async create(data) {
    return makeRequest("/api/v1/admin/settings/email/test-users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

