import { makeRequest } from "@/utils/makeRequest";

/**
 * Renewals job settings service
 * Handles API calls for renewals job configuration
 */
export const renewalsJobService = {
  /**
   * Get current renewals job settings
   * @returns {Promise<Object>} Renewals job settings
   */
  async getSettings() {
    return makeRequest("/api/v1/admin/settings/jobs/renewals", {
      method: "GET",
    });
  },

  /**
   * Update renewals job settings
   * @param {Object} settings - Settings to update
   * @param {string} settings.cron - Cron expression
   * @param {number} settings.concurrency - Concurrency level
   * @returns {Promise<Object>} Update response
   */
  async updateSettings(settings) {
    return makeRequest("/api/v1/admin/settings/jobs/renewals", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  },

  /**
   * Reload renewals cron expression from settings
   * @returns {Promise<Object>} Reload response
   */
  async reloadCron() {
    return makeRequest("/api/v1/admin/settings/jobs/renewals/reload", {
      method: "POST",
    });
  },
};
