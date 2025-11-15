import { makeRequest } from "@/utils/makeRequest";

/**
 * Service for interacting with admin settings endpoints.
 */
export const adminSettingsService = {
  // General Settings
  async getGeneralSettings() {
    return makeRequest("/api/v1/admin/settings/general", {
      method: "GET",
    });
  },

  async updateGeneralSettings(data) {
    return makeRequest("/api/v1/admin/settings/general", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Store Settings
  async getStoreSettings() {
    return makeRequest("/api/v1/admin/settings/store", {
      method: "GET",
    });
  },

  async updateStoreSettings(data) {
    return makeRequest("/api/v1/admin/settings/store", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Account & Privacy Settings
  async getAccountSettings() {
    return makeRequest("/api/v1/admin/settings/account", {
      method: "GET",
    });
  },

  async updateAccountSettings(data) {
    return makeRequest("/api/v1/admin/settings/account", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Payment Settings
  async getPaymentSettings() {
    return makeRequest("/api/v1/admin/settings/payments", {
      method: "GET",
    });
  },

  async updatePaymentGatewaySettings(data) {
    return makeRequest("/api/v1/admin/settings/payments/gateways", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async updatePaymentCurrencySettings(data) {
    return makeRequest("/api/v1/admin/settings/payments/currency", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Product Settings
  async getProductSettings() {
    return makeRequest("/api/v1/admin/settings/products", {
      method: "GET",
    });
  },

  async updateProductDefaultSettings(data) {
    return makeRequest("/api/v1/admin/settings/products/defaults", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async updateProductInventorySettings(data) {
    return makeRequest("/api/v1/admin/settings/products/inventory", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Tax Settings
  async getTaxSettings() {
    return makeRequest("/api/v1/admin/settings/tax", {
      method: "GET",
    });
  },

  async updateTaxSettings(data) {
    return makeRequest("/api/v1/admin/settings/tax", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Subscription Settings
  async getSubscriptionSettings() {
    return makeRequest("/api/v1/admin/settings/subscriptions", {
      method: "GET",
    });
  },

  async updateSubscriptionSettings(data) {
    return makeRequest("/api/v1/admin/settings/subscriptions", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Email Settings
  async getEmailSettings() {
    return makeRequest("/api/v1/admin/settings/email", {
      method: "GET",
    });
  },

  async updateEmailSettings(data) {
    return makeRequest("/api/v1/admin/settings/email", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async testEmailSettings(data) {
    return makeRequest("/api/v1/admin/settings/email/test", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getEmailTemplates(scope) {
    const url = scope
      ? `/api/v1/admin/settings/email/templates?scope=${scope}`
      : "/api/v1/admin/settings/email/templates";
    return makeRequest(url, {
      method: "GET",
    });
  },

  async createEmailTemplate(data) {
    return makeRequest("/api/v1/admin/settings/email/templates", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateEmailTemplate(id, data) {
    return makeRequest(`/api/v1/admin/settings/email/templates/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async deleteEmailTemplate(id) {
    return makeRequest(`/api/v1/admin/settings/email/templates/${id}`, {
      method: "DELETE",
    });
  },

  async previewEmailTemplate(id, data) {
    return makeRequest(`/api/v1/admin/settings/email/templates/${id}/preview`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getEmailTestUsers() {
    return makeRequest("/api/v1/admin/settings/email/test-users", {
      method: "GET",
    });
  },

  async createEmailTestUser(data) {
    return makeRequest("/api/v1/admin/settings/email/test-users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Storage Settings
  async getStorageSettings() {
    return makeRequest("/api/v1/admin/settings/storage", {
      method: "GET",
    });
  },

  async updateStorageSettings(data) {
    return makeRequest("/api/v1/admin/settings/storage", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async testStorageSettings(data) {
    return makeRequest("/api/v1/admin/settings/storage/test", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getStorageDebugInfo() {
    return makeRequest("/api/v1/admin/settings/storage/debug", {
      method: "GET",
    });
  },
};

