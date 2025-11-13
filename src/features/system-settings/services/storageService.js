import { makeRequest } from "@/utils/makeRequest";

/**
 * Storage settings service
 * Handles API calls for storage configuration
 */
export const storageService = {
  /**
   * Get current storage settings
   * @returns {Promise<Object>} Storage settings
   */
  async getSettings() {
    return makeRequest("/api/v1/admin/settings/storage", {
      method: "GET",
    });
  },

  /**
   * Update storage settings
   * @param {Object} settings - Settings to update
   * @returns {Promise<Object>} Update response
   */
  async updateSettings(settings) {
    return makeRequest("/api/v1/admin/settings/storage", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  },

  /**
   * Test storage configuration connectivity
   * @param {Object} settings - Settings to test (optional, uses saved if not provided)
   * @returns {Promise<Object>} Test response
   */
  async testConnection(settings) {
    return makeRequest("/api/v1/admin/settings/storage/test", {
      method: "POST",
      body: JSON.stringify(settings),
    });
  },

  /**
   * Get storage debug information
   * @returns {Promise<Object>} Debug information
   */
  async getDebugInfo() {
    return makeRequest("/api/v1/admin/settings/storage/debug", {
      method: "GET",
    });
  },
};
