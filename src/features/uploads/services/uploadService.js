import { makeRequest } from "@/utils/makeRequest";

// Upload endpoints
const UPLOAD_ENDPOINTS = {
  UPLOAD: "/api/v1/uploads",
  LIST: "/api/v1/uploads",
  DETAIL: (id) => `/api/v1/uploads/${id}`,
  DELETE: (id) => `/api/v1/uploads/${id}`,
  MOVE_FILE: (id) => `/api/v1/uploads/${id}/folder`,
  BULK_MOVE_FILES: "/api/v1/uploads/bulk-move",
  SETTINGS: "/api/v1/uploads/settings",
  SETTINGS_DEBUG: "/api/v1/uploads/settings/debug",
};

// Folder endpoints
const FOLDER_ENDPOINTS = {
  CREATE: "/api/v1/uploads/folders",
  LIST: "/api/v1/uploads/folders",
  DETAIL: (id) => `/api/v1/uploads/folders/${id}`,
  UPDATE: (id) => `/api/v1/uploads/folders/${id}`,
  DELETE: (id) => `/api/v1/uploads/folders/${id}`,
  MOVE: (id) => `/api/v1/uploads/folders/${id}/move`,
  BULK_MOVE: "/api/v1/uploads/folders/bulk-move",
  STATS: (id) => `/api/v1/uploads/folders/${id}/stats`,
};

export const uploadService = {
  // ==================== FILE ENDPOINTS ====================

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
   * @param {string} params.folderId - Filter by folder (use "null" for root)
   * @param {string} params.uploadedBy - Filter by uploader user ID
   * @param {string} params.search - Search filename/original name
   * @param {string} params.mimeType - Partial match for MIME type
   * @param {string} params.storageProvider - Filter by provider (local|cdn|r2)
   * @param {number} params.limit - Items per page (default 20)
   * @param {number} params.page - Page number (default 1)
   * @returns {Promise<Object>} - List of uploads with pagination
   */
  async getUploads(params = {}) {
    // Convert params object to query string, handling null values
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        // Convert null folderId to "null" string as per API spec
        if (key === "folderId" && params[key] === null) {
          queryParams.append(key, "null");
        } else {
          queryParams.append(key, params[key].toString());
        }
      }
    });
    const query = queryParams.toString();
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
   * Delete an upload (soft delete)
   * @param {string} id - Upload ID
   * @returns {Promise<Object>} - Delete response
   */
  async deleteUpload(id) {
    return await makeRequest(UPLOAD_ENDPOINTS.DELETE(id), { method: "DELETE" });
  },

  /**
   * Move a file to a folder (or root)
   * @param {string} id - File ID
   * @param {string|null} folderId - Target folder ID (null for root)
   * @returns {Promise<Object>} - Updated file with folderId
   */
  async moveFileToFolder(id, folderId = null) {
    const body = folderId === null ? { folderId: null } : { folderId };
    return await makeRequest(UPLOAD_ENDPOINTS.MOVE_FILE(id), {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  /**
   * Bulk move files to a folder (or root)
   * @param {string[]} fileIds - Array of file IDs
   * @param {string|null} folderId - Target folder ID (null for root)
   * @returns {Promise<Object>} - Response with message and updated count
   */
  async bulkMoveFiles(fileIds, folderId = null) {
    return await makeRequest(UPLOAD_ENDPOINTS.BULK_MOVE_FILES, {
      method: "PATCH",
      body: JSON.stringify({
        fileIds,
        folderId: folderId === null ? null : folderId,
      }),
    });
  },

  // ==================== SETTINGS ENDPOINTS ====================

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

  // ==================== FOLDER ENDPOINTS ====================

  /**
   * Create a new folder
   * @param {string} name - Folder name (1-255 characters)
   * @param {string|null} parentId - Parent folder ID (null for root)
   * @returns {Promise<Object>} - Created folder
   */
  async createFolder(name, parentId = null) {
    console.log("uploadService.createFolder called with:", { name, parentId });
    const requestBody = {
      name,
      parentId: parentId === null ? null : parentId,
    };
    console.log("uploadService.createFolder request body:", requestBody);
    const response = await makeRequest(FOLDER_ENDPOINTS.CREATE, {
      method: "POST",
      body: JSON.stringify(requestBody),
    });
    console.log("uploadService.createFolder response:", response);
    return response;
  },

  /**
   * List folders with filters and pagination
   * @param {Object} params - Query parameters
   * @param {string|null} params.parentId - Filter by parent (use "null" for root)
   * @param {string} params.search - Search folder names
   * @param {string} params.sortBy - Sort field (createdAt|name|updatedAt)
   * @param {string} params.sortOrder - Sort order (asc|desc)
   * @param {number} params.limit - Items per page (1-100, default 20)
   * @param {number} params.offset - Offset for pagination (>=0)
   * @returns {Promise<Object>} - List of folders with pagination
   */
  async getFolders(params = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        // Convert null parentId to "null" string as per API spec
        if (key === "parentId" && params[key] === null) {
          queryParams.append(key, "null");
        } else {
          queryParams.append(key, params[key].toString());
        }
      }
    });
    const query = queryParams.toString();
    const endpoint = query
      ? `${FOLDER_ENDPOINTS.LIST}?${query}`
      : FOLDER_ENDPOINTS.LIST;
    return await makeRequest(endpoint, { method: "GET" });
  },

  /**
   * Get folder by ID
   * @param {string} id - Folder ID
   * @returns {Promise<Object>} - Folder details with counts
   */
  async getFolderById(id) {
    return await makeRequest(FOLDER_ENDPOINTS.DETAIL(id), { method: "GET" });
  },

  /**
   * Rename folder
   * @param {string} id - Folder ID
   * @param {string} name - New folder name (1-255 characters)
   * @returns {Promise<Object>} - Updated folder
   */
  async renameFolder(id, name) {
    return await makeRequest(FOLDER_ENDPOINTS.UPDATE(id), {
      method: "PATCH",
      body: JSON.stringify({ name }),
    });
  },

  /**
   * Delete folder (only when empty)
   * @param {string} id - Folder ID
   * @returns {Promise<Object>} - Delete response
   */
  async deleteFolder(id) {
    return await makeRequest(FOLDER_ENDPOINTS.DELETE(id), {
      method: "DELETE",
    });
  },

  /**
   * Move folder to a different parent or root
   * @param {string} id - Folder ID
   * @param {string|null} parentId - New parent folder ID (null for root)
   * @returns {Promise<Object>} - Updated folder
   */
  async moveFolder(id, parentId = null) {
    return await makeRequest(FOLDER_ENDPOINTS.MOVE(id), {
      method: "PATCH",
      body: JSON.stringify({
        parentId: parentId === null ? null : parentId,
      }),
    });
  },

  /**
   * Bulk move folders
   * @param {string[]} folderIds - Array of folder IDs
   * @param {string|null} parentId - Target parent folder ID (null for root)
   * @returns {Promise<Object>} - Response with message and updated count
   */
  async bulkMoveFolders(folderIds, parentId = null) {
    return await makeRequest(FOLDER_ENDPOINTS.BULK_MOVE, {
      method: "PATCH",
      body: JSON.stringify({
        folderIds,
        parentId: parentId === null ? null : parentId,
      }),
    });
  },

  /**
   * Get folder statistics
   * @param {string} id - Folder ID
   * @returns {Promise<Object>} - Folder stats (filesCount, foldersCount, totalItems, totalSize)
   */
  async getFolderStats(id) {
    return await makeRequest(FOLDER_ENDPOINTS.STATS(id), { method: "GET" });
  },
};
