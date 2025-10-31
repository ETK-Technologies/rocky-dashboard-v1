import { makeRequest } from "@/utils/makeRequest";

// Upload endpoints
const UPLOAD_ENDPOINTS = {
  UPLOAD: "/api/v1/uploads",
  LIST: "/api/v1/uploads",
  DETAIL: (id) => `/api/v1/uploads/${id}`,
  DELETE: (id) => `/api/v1/uploads/${id}`,
  SETTINGS: "/api/v1/uploads/settings",
  SETTINGS_DEBUG: "/api/v1/uploads/settings/debug",
};

export const uploadService = {
  /**
   * Upload one or multiple files
   * @param {File[]} files - Files to upload
   * @returns {Promise<Object>} - Upload response with files array
   */
  async uploadFiles(files) {
    const formData = new FormData();

    // Append files to FormData
    if (Array.isArray(files)) {
      files.forEach((file) => {
        formData.append("files", file);
      });
    } else {
      formData.append("files", files);
    }

    return await makeRequest(UPLOAD_ENDPOINTS.UPLOAD, {
      method: "POST",
      body: formData,
    });
  },

  /**
   * Get paginated list of uploads
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - List of uploads with pagination
   */
  async getUploads(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query
      ? `${UPLOAD_ENDPOINTS.LIST}?${query}`
      : UPLOAD_ENDPOINTS.LIST;
    return await makeRequest(endpoint, { method: "GET" });
  },

  /**
   * Get upload details by ID
   * @param {string} id - Upload ID
   * @returns {Promise<Object>} - Upload details
   */
  async getUploadById(id) {
    return await makeRequest(UPLOAD_ENDPOINTS.DETAIL(id), { method: "GET" });
  },

  /**
   * Delete an upload
   * @param {string} id - Upload ID
   * @returns {Promise<Object>} - Delete response
   */
  async deleteUpload(id) {
    return await makeRequest(UPLOAD_ENDPOINTS.DELETE(id), { method: "DELETE" });
  },

  /**
   * Get upload settings
   * @returns {Promise<Object>} - Upload settings
   */
  async getUploadSettings() {
    return await makeRequest(UPLOAD_ENDPOINTS.SETTINGS, { method: "GET" });
  },

  /**
   * Update upload settings (Super Admin only)
   * @param {Object} settings - Settings to update
   * @returns {Promise<Object>} - Updated settings
   */
  async updateUploadSettings(settings) {
    return await makeRequest(UPLOAD_ENDPOINTS.SETTINGS, {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  },

  /**
   * Debug upload settings (Super Admin only)
   * @returns {Promise<Object>} - Debug info
   */
  async debugUploadSettings() {
    return await makeRequest(UPLOAD_ENDPOINTS.SETTINGS_DEBUG, {
      method: "GET",
    });
  },
};
