import { makeRequest } from "@/utils/makeRequest";

/**
 * Product service for API calls
 */
export const productService = {
  /**
   * Get all products with filtering and pagination
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Products data with pagination
   */
  async getAll(params = {}) {
    const queryParams = new URLSearchParams();

    // Add all provided parameters
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/products${queryString ? `?${queryString}` : ""}`;

    return makeRequest(endpoint, {
      method: "GET",
    });
  },

  /**
   * Get a single product by ID or slug
   * @param {string} id - Product ID or slug
   * @returns {Promise<Object>} Product data
   */
  async getById(id) {
    return makeRequest(`/api/v1/products/${id}`, {
      method: "GET",
    });
  },

  /**
   * Search products by query
   * @param {string} query - Search query
   * @param {number} limit - Result limit
   * @returns {Promise<Array>} Search results
   */
  async search(query, limit = 10) {
    const queryParams = new URLSearchParams({ q: query, limit });
    return makeRequest(`/api/v1/products/search?${queryParams.toString()}`, {
      method: "GET",
    });
  },

  /**
   * Create a new product
   * @param {Object} data - Product data
   * @returns {Promise<Object>} Created product
   */
  async create(data) {
    return makeRequest("/api/v1/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update a product
   * @param {string} id - Product ID
   * @param {Object} data - Product data
   * @returns {Promise<Object>} Updated product
   */
  async update(id, data) {
    return makeRequest(`/api/v1/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a product (soft delete)
   * @param {string} id - Product ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    return makeRequest(`/api/v1/products/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Bulk delete products
   * @param {Array<string>} ids - Array of product IDs
   * @returns {Promise<Object>} Response with deletedCount, deletedIds, and missingIds
   */
  async bulkDelete(ids) {
    return makeRequest("/api/v1/admin/products/bulk", {
      method: "DELETE",
      body: JSON.stringify({ ids }),
    });
  },

  /**
   * Update product stock
   * @param {string} id - Product ID
   * @param {Object} stockData - Stock update data
   * @returns {Promise<Object>} Updated product
   */
  async updateStock(id, stockData) {
    return makeRequest(`/api/v1/products/${id}/stock`, {
      method: "PATCH",
      body: JSON.stringify(stockData),
    });
  },

  /**
   * Get all metadata for a product
   * @param {string} id - Product ID
   * @returns {Promise<Array>} Metadata array
   */
  async getMetadata(id) {
    return makeRequest(`/api/v1/products/${id}/metadata`, {
      method: "GET",
    });
  },

  /**
   * Get specific metadata field by key
   * @param {string} id - Product ID
   * @param {string} key - Metadata key
   * @returns {Promise<Object>} Metadata value
   */
  async getMetadataByKey(id, key) {
    return makeRequest(`/api/v1/products/${id}/metadata/${key}`, {
      method: "GET",
    });
  },

  /**
   * Create or update product metadata field
   * @param {string} id - Product ID
   * @param {Object} data - Metadata {key, value}
   * @returns {Promise<Object>} Metadata object
   */
  async upsertMetadata(id, data) {
    return makeRequest(`/api/v1/products/${id}/metadata`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Bulk update product metadata
   * @param {string} id - Product ID
   * @param {Array} metadataArray - Array of {key, value} objects
   * @returns {Promise<Array>} Updated metadata array
   */
  async bulkUpdateMetadata(id, metadataArray) {
    return makeRequest(`/api/v1/products/${id}/metadata/bulk`, {
      method: "POST",
      body: JSON.stringify(metadataArray),
    });
  },

  /**
   * Delete specific metadata field
   * @param {string} id - Product ID
   * @param {string} key - Metadata key
   * @returns {Promise<void>}
   */
  async deleteMetadata(id, key) {
    return makeRequest(`/api/v1/products/${id}/metadata/${key}`, {
      method: "DELETE",
    });
  },

  /**
   * Import products from WooCommerce CSV file
   * @param {File} file - CSV file to import
   * @returns {Promise<Object>} Import job details
   */
  async importProducts(file) {
    const formData = new FormData();
    formData.append("file", file);

    return makeRequest("/api/v1/admin/products/import", {
      method: "POST",
      body: formData,
    });
  },

  /**
   * Get list of recent product import jobs
   * @returns {Promise<Object>} List of import jobs
   */
  async getImportJobs() {
    return makeRequest("/api/v1/admin/products/import", {
      method: "GET",
    });
  },

  /**
   * Get product import job status by ID
   * @param {string} id - Import job ID
   * @returns {Promise<Object>} Import job details with status and error log
   */
  async getImportJobStatus(id) {
    return makeRequest(`/api/v1/admin/products/import/${id}`, {
      method: "GET",
    });
  },
};
