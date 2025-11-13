import { makeRequest } from "@/utils/makeRequest";
import {
  appRoleToApi,
  apiRoleToApp,
  normalizeUserRole,
  appRoleToSlug,
} from "../utils/roleMap";

// Admin users endpoints
const USERS_ENDPOINTS = {
  LIST: "/api/v1/admin/users",
  CREATE: "/api/v1/admin/users",
  DETAIL: (id) => `/api/v1/admin/users/${id}`,
  ROLES: (id) => `/api/v1/admin/users/${id}/roles`,
  ROLE_DETAIL: (id, roleId) => `/api/v1/admin/users/${id}/roles/${roleId}`,
  PERMISSIONS: (id) => `/api/v1/admin/users/${id}/permissions`,
};

export const userService = {
  // Normalize outgoing payload to API schema
  _toApiUserPayload(payload = {}) {
    const body = { ...payload };

    // Map role/roles -> roles[] array with slugs (backend only accepts roles array)
    // Handle both 'role' and 'roles' fields (form might send either)
    let rolesArray = [];

    if (body.roles && Array.isArray(body.roles)) {
      // If 'roles' is already an array, use it
      rolesArray = body.roles;
    } else if (body.role) {
      // If 'role' is provided, convert to array
      rolesArray = Array.isArray(body.role) ? body.role : [body.role];
    }

    // Convert app roles to API slugs if we have roles
    if (rolesArray.length > 0) {
      const roleSlugs = rolesArray
        .map((role) => appRoleToSlug(role))
        .filter((slug) => slug); // Remove any invalid roles

      if (roleSlugs.length > 0) {
        body.roles = roleSlugs; // Send slugs like ["customer", "admin"]
      }
    }

    // Always remove 'role' field - backend doesn't accept it
    delete body.role;

    // Normalize boolean fields if provided as strings
    if (body.isActive === "true" || body.isActive === true)
      body.isActive = true;
    if (body.isActive === "false" || body.isActive === false)
      body.isActive = false;
    if (body.twoFactorEnabled === "true" || body.twoFactorEnabled === true)
      body.twoFactorEnabled = true;
    if (body.twoFactorEnabled === "false" || body.twoFactorEnabled === false)
      body.twoFactorEnabled = false;
    if (body.marketingOptIn === "true" || body.marketingOptIn === true)
      body.marketingOptIn = true;
    if (body.marketingOptIn === "false" || body.marketingOptIn === false)
      body.marketingOptIn = false;
    if (body.smsOptIn === "true" || body.smsOptIn === true)
      body.smsOptIn = true;
    if (body.smsOptIn === "false" || body.smsOptIn === false)
      body.smsOptIn = false;

    // Normalize dateOfBirth if provided
    if (body.dateOfBirth && typeof body.dateOfBirth === "string") {
      // Keep as is, API should handle the date format
    }

    // Remove undefined/empty values to avoid validation errors
    // But preserve email, password, and wordpressId even if empty (they might be required for create)
    Object.keys(body).forEach((k) => {
      if (k === "email" || k === "password" || k === "wordpressId") {
        // Keep these fields even if empty (they might be required by API)
        if (body[k] === undefined || body[k] === null) {
          delete body[k];
        }
      } else if (
        k === "roles" &&
        Array.isArray(body[k]) &&
        body[k].length === 0
      ) {
        // Don't send empty roles array
        delete body[k];
      } else if (body[k] === undefined || body[k] === null || body[k] === "") {
        delete body[k];
      }
    });

    return body;
  },

  /**
   * Get all users with filtering and pagination
   * @param {Object} params - Query parameters
   * @param {string} params.search - Search by email, first name, or last name
   * @param {string} params.role - Filter by role (CUSTOMER, ADMIN, SUPER_ADMIN)
   * @param {boolean|string} params.isActive - Filter by active status
   * @param {string} params.sortBy - Sort field (createdAt, email, firstName, lastName, lastLoginAt)
   * @param {string} params.sortOrder - Sort order (asc, desc)
   * @param {number} params.limit - Number of results to return
   * @param {number} params.offset - Number of results to skip
   * @returns {Promise<Object>} Users data with pagination
   */
  async getUsers(params = {}) {
    // Normalize query params to API schema
    const qp = { ...params };

    // Convert role from app format to API format (e.g., "user" -> "CUSTOMER")
    if (qp.role) {
      qp.role = appRoleToApi(qp.role);
    }

    // Normalize isActive to boolean
    if (qp.isActive === "true" || qp.isActive === true) {
      qp.isActive = true;
    } else if (qp.isActive === "false" || qp.isActive === false) {
      qp.isActive = false;
    }

    // Convert limit and offset to numbers if they're strings
    if (qp.limit !== undefined) {
      qp.limit = Number(qp.limit);
    }
    if (qp.offset !== undefined) {
      qp.offset = Number(qp.offset);
    }

    // Remove empty values
    Object.keys(qp).forEach((k) => {
      if (qp[k] === "" || qp[k] === undefined || qp[k] === null) {
        delete qp[k];
      }
    });

    // Build query string
    const queryParams = new URLSearchParams();
    Object.keys(qp).forEach((key) => {
      if (qp[key] !== undefined && qp[key] !== null && qp[key] !== "") {
        queryParams.append(key, qp[key]);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${USERS_ENDPOINTS.LIST}?${queryString}`
      : USERS_ENDPOINTS.LIST;

    const res = await makeRequest(endpoint, { method: "GET" });

    // Handle response structure: { users: [...], pagination: {...} }
    if (res && Array.isArray(res.users)) {
      return {
        users: res.users.map(normalizeUserRole),
        pagination: res.pagination || {
          total: res.users.length,
          limit: qp.limit || 20,
          offset: qp.offset || 0,
          pages: 1,
        },
      };
    }

    // Fallback for array response (shouldn't happen with new API)
    if (Array.isArray(res)) {
      return {
        users: res.map(normalizeUserRole),
        pagination: {
          total: res.length,
          limit: qp.limit || 20,
          offset: qp.offset || 0,
          pages: 1,
        },
      };
    }

    return res;
  },

  /**
   * Get user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object>} User object
   */
  async getUser(id) {
    const user = await makeRequest(USERS_ENDPOINTS.DETAIL(id), {
      method: "GET",
    });
    return normalizeUserRole(user);
  },

  /**
   * Create a new user
   * @param {Object} payload - User data
   * @param {string} payload.email - User email (required)
   * @param {string} payload.firstName - First name (required)
   * @param {string} payload.lastName - Last name (optional)
   * @param {string} payload.password - Password (required for new users)
   * @param {number} payload.wordpressId - WordPress ID (optional)
   * @param {string|Array} payload.role - Role or roles array (required)
   * @param {string} payload.phone - Phone number (optional)
   * @param {string} payload.dateOfBirth - Date of birth (optional)
   * @param {string} payload.gender - Gender (optional)
   * @param {string} payload.avatar - Avatar URL (optional)
   * @param {string} payload.locale - Locale (optional)
   * @param {string} payload.timezone - Timezone (optional)
   * @param {boolean} payload.isActive - Active status (optional)
   * @param {boolean} payload.twoFactorEnabled - Two-factor enabled (optional)
   * @param {boolean} payload.marketingOptIn - Marketing opt-in (optional)
   * @param {boolean} payload.smsOptIn - SMS opt-in (optional)
   * @returns {Promise<Object>} Created user
   */
  async createUser(payload) {
    // For create, only send fields allowed by API
    const allowedFields = [
      "email",
      "firstName",
      "lastName",
      "password",
      "wordpressId",
      "role",
      "roles",
      "phone",
      "dateOfBirth",
      "gender",
      "avatar",
      "locale",
      "timezone",
      "isActive",
      "twoFactorEnabled",
      "marketingOptIn",
      "smsOptIn",
    ];

    const filteredPayload = {};
    allowedFields.forEach((field) => {
      if (payload[field] !== undefined && payload[field] !== null) {
        filteredPayload[field] = payload[field];
      }
    });

    const body = userService._toApiUserPayload(filteredPayload);

    // Ensure email is included (required by API)
    if (!body.email && payload.email) {
      body.email = payload.email;
    }

    // Ensure roles array is included (required by API)
    if (!body.roles || !Array.isArray(body.roles) || body.roles.length === 0) {
      throw new Error("At least one role is required");
    }

    return await makeRequest(USERS_ENDPOINTS.CREATE, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  /**
   * Update a user
   * @param {string} id - User ID
   * @param {Object} payload - User data to update
   * @param {string} payload.firstName - First name
   * @param {string} payload.lastName - Last name
   * @param {boolean} payload.isActive - Active status
   * @param {string|Array} payload.role - Role or roles array
   * @returns {Promise<Object>} Updated user
   */
  async updateUser(id, payload) {
    // Only allow specific fields for update (per API spec: firstName, lastName, isActive, roles)
    const allowedFields = ["firstName", "lastName", "isActive", "roles"];
    const filteredPayload = {};

    allowedFields.forEach((field) => {
      if (payload[field] !== undefined && payload[field] !== null) {
        // For roles, ensure it's an array
        if (field === "roles" && !Array.isArray(payload[field])) {
          // Skip invalid roles
          return;
        }
        filteredPayload[field] = payload[field];
      }
    });

    const body = userService._toApiUserPayload(filteredPayload);

    // Ensure roles array is valid if provided (service already handles this, but double-check)
    if (body.roles && (!Array.isArray(body.roles) || body.roles.length === 0)) {
      // If roles is provided but empty, don't send it
      delete body.roles;
    }

    return await makeRequest(USERS_ENDPOINTS.DETAIL(id), {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  /**
   * Delete a user (soft delete)
   * @param {string} id - User ID
   * @returns {Promise<Object>} Deletion response
   */
  async deleteUser(id) {
    return await makeRequest(USERS_ENDPOINTS.DETAIL(id), { method: "DELETE" });
  },

  /**
   * Assign roles to a user (replaces all existing roles)
   * @param {string} id - User ID
   * @param {Array<string>} roles - Array of role names (e.g., ["customer", "admin"])
   * @returns {Promise<Object>} Response with message and roles array
   */
  async assignRoles(id, roles = []) {
    const roleSlugs = roles.map(appRoleToSlug); // Backend expects slugs
    return await makeRequest(USERS_ENDPOINTS.ROLES(id), {
      method: "POST",
      body: JSON.stringify({ roles: roleSlugs }),
    });
  },

  /**
   * Get all roles assigned to a user
   * @param {string} id - User ID
   * @returns {Promise<Array>} Array of role objects
   */
  async getUserRoles(id) {
    return await makeRequest(USERS_ENDPOINTS.ROLES(id), { method: "GET" });
  },

  /**
   * Remove a specific role from a user
   * @param {string} id - User ID
   * @param {string} roleId - Role ID to remove
   * @returns {Promise<Object>} Deletion response
   */
  async removeUserRole(id, roleId) {
    return await makeRequest(USERS_ENDPOINTS.ROLE_DETAIL(id, roleId), {
      method: "DELETE",
    });
  },

  /**
   * Get all permissions granted to a user through their roles
   * @param {string} id - User ID
   * @returns {Promise<Array>} Array of permission objects
   */
  async getUserPermissions(id) {
    return await makeRequest(USERS_ENDPOINTS.PERMISSIONS(id), {
      method: "GET",
    });
  },
};
