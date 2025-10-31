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
    // Map role -> roles[] array with slugs (backend only accepts roles array, not role field)
    if (body.role) {
      const roleSlug = appRoleToSlug(body.role);
      body.roles = [roleSlug]; // Send slugs like "customer", "admin", "super-admin"
      delete body.role; // Remove role field - backend doesn't accept it
    }
    // Normalize isActive to boolean if provided as string
    if (body.isActive === "true") body.isActive = true;
    if (body.isActive === "false") body.isActive = false;
    // Remove undefined/empty values to avoid validation errors
    Object.keys(body).forEach((k) => {
      if (body[k] === undefined || body[k] === null || body[k] === "") {
        delete body[k];
      }
    });
    return body;
  },
  async getUsers(params = {}) {
    // Normalize query params to API schema
    const qp = { ...params };
    if (qp.role) qp.role = appRoleToApi(qp.role);
    if (qp.isActive === "true") qp.isActive = true;
    else if (qp.isActive === "false") qp.isActive = false;
    // Remove empty values
    Object.keys(qp).forEach((k) => {
      if (qp[k] === "" || qp[k] === undefined || qp[k] === null) delete qp[k];
    });

    const query = new URLSearchParams(qp).toString();
    const endpoint = query
      ? `${USERS_ENDPOINTS.LIST}?${query}`
      : USERS_ENDPOINTS.LIST;
    const res = await makeRequest(endpoint, { method: "GET" });
    if (Array.isArray(res?.users)) {
      return {
        ...res,
        users: res.users.map(normalizeUserRole),
      };
    }
    if (Array.isArray(res)) return res.map(normalizeUserRole);
    return res;
  },

  async getUser(id) {
    const user = await makeRequest(USERS_ENDPOINTS.DETAIL(id), {
      method: "GET",
    });
    return normalizeUserRole(user);
  },

  async createUser(payload) {
    const body = userService._toApiUserPayload(payload);
    return await makeRequest(USERS_ENDPOINTS.CREATE, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async updateUser(id, payload) {
    const body = userService._toApiUserPayload(payload);
    return await makeRequest(USERS_ENDPOINTS.DETAIL(id), {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  async deleteUser(id) {
    return await makeRequest(USERS_ENDPOINTS.DETAIL(id), { method: "DELETE" });
  },

  // Replace all roles with provided list
  async assignRoles(id, roles = []) {
    const roleSlugs = roles.map(appRoleToSlug); // Backend expects slugs
    return await makeRequest(USERS_ENDPOINTS.ROLES(id), {
      method: "POST",
      body: JSON.stringify({ roles: roleSlugs }),
    });
  },

  async getUserRoles(id) {
    return await makeRequest(USERS_ENDPOINTS.ROLES(id), { method: "GET" });
  },

  async removeUserRole(id, roleId) {
    return await makeRequest(USERS_ENDPOINTS.ROLE_DETAIL(id, roleId), {
      method: "DELETE",
    });
  },

  async getUserPermissions(id) {
    return await makeRequest(USERS_ENDPOINTS.PERMISSIONS(id), {
      method: "GET",
    });
  },
};
