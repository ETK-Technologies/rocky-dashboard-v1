import { makeRequest } from "@/utils/makeRequest";

/**
 * Billing settings service for admin API calls
 */
export const billingSettingsService = {
  /**
   * Get billing settings
   * @returns {Promise<Object>} Billing settings data
   */
  async get() {
    return makeRequest("/api/v1/admin/billing-settings", {
      method: "GET",
    });
  },

  /**
   * Update billing settings
   * @param {Object} data - Settings data
   * @returns {Promise<Object>} Updated settings data
   */
  async update(data) {
    return makeRequest("/api/v1/admin/billing-settings", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
};
