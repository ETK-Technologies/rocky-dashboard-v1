import { makeRequest } from "@/utils/makeRequest";

const PERMISSIONS_ENDPOINTS = {
  LIST: "/api/v1/admin/permissions",
  CREATE: "/api/v1/admin/permissions",
  DETAIL: (id) => `/api/v1/admin/permissions/${id}`,
  UPDATE: (id) => `/api/v1/admin/permissions/${id}`,
};

/**
 * Admin Permission service
 * Handles all permission-related API calls for admin management
 */
export const adminPermissionService = {
  /**
   * Get all permissions with optional filtering
   * @param {Object} params - Query parameters
   * @param {string} params.resource - Filter by resource name
   * @param {string} params.action - Filter by action name
   * @param {string} params.search - Free-text search across permission name and description
   * @returns {Promise<Array>} Array of permission objects
   */
  async getAll(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.resource) {
      queryParams.append("resource", params.resource);
    }

    if (params.action) {
      queryParams.append("action", params.action);
    }

    if (params.search) {
      queryParams.append("search", params.search);
    }

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${PERMISSIONS_ENDPOINTS.LIST}?${queryString}`
      : PERMISSIONS_ENDPOINTS.LIST;

    const response = await makeRequest(endpoint, { method: "GET" });
    return Array.isArray(response) ? response : [];
  },

  /**
   * Get a specific permission by ID or slug
   * @param {string} id - Permission identifier (UUID or slug)
   * @returns {Promise<Object>} Permission object
   */
  async getById(id) {
    return await makeRequest(PERMISSIONS_ENDPOINTS.DETAIL(id), { method: "GET" });
  },

  /**
   * Create a new permission
   * @param {Object} payload - Permission data
   * @param {string} payload.name - Permission name (required)
   * @param {string} payload.resource - Resource name (required)
   * @param {string} payload.action - Action name (required)
   * @param {string} payload.slug - Permission slug (required)
   * @param {string} payload.description - Permission description (optional)
   * @returns {Promise<Object>} Created permission
   */
  async create(payload) {
    const body = {
      name: payload.name,
      resource: payload.resource,
      action: payload.action,
      slug: payload.slug,
      description: payload.description || "",
    };

    return await makeRequest(PERMISSIONS_ENDPOINTS.CREATE, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  /**
   * Update an existing permission
   * @param {string} id - Permission identifier (UUID or slug)
   * @param {Object} payload - Permission data to update
   * @param {string} payload.name - Permission name (optional)
   * @param {string} payload.resource - Resource name (optional)
   * @param {string} payload.action - Action name (optional)
   * @param {string} payload.slug - Permission slug (optional)
   * @param {string} payload.description - Permission description (optional)
   * @returns {Promise<Object>} Updated permission
   */
  async update(id, payload) {
    const body = {};

    if (payload.name !== undefined) body.name = payload.name;
    if (payload.resource !== undefined) body.resource = payload.resource;
    if (payload.action !== undefined) body.action = payload.action;
    if (payload.slug !== undefined) body.slug = payload.slug;
    if (payload.description !== undefined) body.description = payload.description;

    return await makeRequest(PERMISSIONS_ENDPOINTS.UPDATE(id), {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },
};

