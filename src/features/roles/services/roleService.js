import { makeRequest } from "@/utils/makeRequest";

const ROLES_ENDPOINTS = {
  LIST: "/api/v1/admin/roles",
  CREATE: "/api/v1/admin/roles",
  DETAIL: (id) => `/api/v1/admin/roles/${id}`,
  UPDATE: (id) => `/api/v1/admin/roles/${id}`,
  DELETE: (id) => `/api/v1/admin/roles/${id}`,
};

/**
 * Role service
 * Handles all role-related API calls
 */
export const roleService = {
  /**
   * Get all roles with optional filtering
   * @param {Object} params - Query parameters
   * @param {string} params.search - Free-text search across role name and description
   * @param {boolean} params.includePermissions - When true, include the permissions assigned to each role
   * @returns {Promise<Array>} Array of role objects
   */
  async getAll(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.search) {
      queryParams.append("search", params.search);
    }

    if (params.includePermissions !== undefined) {
      queryParams.append(
        "includePermissions",
        params.includePermissions.toString()
      );
    }

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${ROLES_ENDPOINTS.LIST}?${queryString}`
      : ROLES_ENDPOINTS.LIST;

    const response = await makeRequest(endpoint, { method: "GET" });
    return Array.isArray(response) ? response : [];
  },

  /**
   * Get a specific role by ID or slug
   * @param {string} id - Role identifier (UUID or slug)
   * @returns {Promise<Object>} Role object
   */
  async getById(id) {
    return await makeRequest(ROLES_ENDPOINTS.DETAIL(id), { method: "GET" });
  },

  /**
   * Create a new role
   * @param {Object} payload - Role data
   * @param {string} payload.name - Role name (required)
   * @param {string} payload.slug - Role slug (required)
   * @param {string} payload.description - Role description (optional)
   * @param {boolean} payload.isActive - Active status (optional, default: true)
   * @param {Array<string>} payload.permissions - Array of permission slugs (optional)
   * @returns {Promise<Object>} Created role
   */
  async create(payload) {
    const body = {
      name: payload.name,
      slug: payload.slug,
      description: payload.description || "",
      isActive: payload.isActive !== undefined ? payload.isActive : true,
    };

    if (payload.permissions && Array.isArray(payload.permissions)) {
      body.permissions = payload.permissions;
    }

    return await makeRequest(ROLES_ENDPOINTS.CREATE, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  /**
   * Update an existing role
   * @param {string} id - Role identifier (UUID or slug)
   * @param {Object} payload - Role data to update
   * @param {string} payload.name - Role name (optional)
   * @param {string} payload.slug - Role slug (optional)
   * @param {string} payload.description - Role description (optional)
   * @param {boolean} payload.isActive - Active status (optional)
   * @param {Array<string>} payload.permissions - Array of permission slugs (optional)
   * @returns {Promise<Object>} Updated role
   */
  async update(id, payload) {
    const body = {};

    if (payload.name !== undefined) body.name = payload.name;
    if (payload.slug !== undefined) body.slug = payload.slug;
    if (payload.description !== undefined)
      body.description = payload.description;
    if (payload.isActive !== undefined) body.isActive = payload.isActive;
    if (
      payload.permissions !== undefined &&
      Array.isArray(payload.permissions)
    ) {
      body.permissions = payload.permissions;
    }

    return await makeRequest(ROLES_ENDPOINTS.UPDATE(id), {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  /**
   * Deactivate a role (soft delete)
   * @param {string} id - Role identifier (UUID or slug)
   * @returns {Promise<void>}
   */
  async delete(id) {
    return await makeRequest(ROLES_ENDPOINTS.DELETE(id), { method: "DELETE" });
  },
};
