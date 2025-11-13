/**
 * Permission service
 * Handles fetching and managing user permissions from the API
 */

import { makeRequest } from "@/utils/makeRequest";

const PERMISSION_ENDPOINTS = {
  USER_PERMISSIONS: (userId) => `/api/v1/admin/users/${userId}/permissions`,
};

/**
 * Permission service
 */
export const permissionService = {
  /**
   * Get all permissions for a specific user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of permission objects
   */
  async getUserPermissions(userId) {
    try {
      const permissions = await makeRequest(
        PERMISSION_ENDPOINTS.USER_PERMISSIONS(userId),
        { method: "GET" }
      );
      return Array.isArray(permissions) ? permissions : [];
    } catch (error) {
      console.error("Failed to fetch user permissions:", error);
      return [];
    }
  },
};

/**
 * Permission utility functions
 */

/**
 * Check if a permission slug matches a pattern
 * Supports wildcard matching (e.g., "products.*" matches "products.read", "products.create", etc.)
 * @param {string} permissionSlug - Permission slug to check
 * @param {string} pattern - Pattern to match (supports wildcard *)
 * @returns {boolean}
 */
export function matchesPermission(permissionSlug, pattern) {
  if (!permissionSlug || !pattern) return false;
  
  // Exact match
  if (permissionSlug === pattern) return true;
  
  // Wildcard match (e.g., "products.*" matches "products.read", "products.create")
  if (pattern.endsWith(".*")) {
    const prefix = pattern.slice(0, -2);
    return permissionSlug.startsWith(prefix + ".");
  }
  
  return false;
}

/**
 * Check if user has a specific permission
 * @param {Array} permissions - Array of permission objects
 * @param {string} permissionSlug - Permission slug to check (e.g., "products.read")
 * @returns {boolean}
 */
export function hasPermission(permissions = [], permissionSlug) {
  if (!permissionSlug || !Array.isArray(permissions)) return false;
  
  return permissions.some((perm) => {
    if (!perm || !perm.slug) return false;
    // Check exact match or wildcard match
    return (
      perm.slug === permissionSlug ||
      matchesPermission(perm.slug, permissionSlug)
    );
  });
}

/**
 * Check if user has any of the specified permissions
 * @param {Array} permissions - Array of permission objects
 * @param {Array<string>} permissionSlugs - Array of permission slugs to check
 * @returns {boolean}
 */
export function hasAnyPermission(permissions = [], permissionSlugs = []) {
  if (!Array.isArray(permissionSlugs) || permissionSlugs.length === 0) {
    return false;
  }
  
  return permissionSlugs.some((slug) => hasPermission(permissions, slug));
}

/**
 * Check if user has all of the specified permissions
 * @param {Array} permissions - Array of permission objects
 * @param {Array<string>} permissionSlugs - Array of permission slugs to check
 * @returns {boolean}
 */
export function hasAllPermissions(permissions = [], permissionSlugs = []) {
  if (!Array.isArray(permissionSlugs) || permissionSlugs.length === 0) {
    return true; // Empty array means no requirements
  }
  
  return permissionSlugs.every((slug) => hasPermission(permissions, slug));
}

/**
 * Check if user has permission for a resource and action
 * @param {Array} permissions - Array of permission objects
 * @param {string} resource - Resource name (e.g., "products")
 * @param {string} action - Action name (e.g., "read", "create", "manage")
 * @returns {boolean}
 */
export function hasResourcePermission(
  permissions = [],
  resource,
  action
) {
  if (!resource || !action) return false;
  
  // Check for specific permission (e.g., "products.read")
  if (hasPermission(permissions, `${resource}.${action}`)) {
    return true;
  }
  
  // Check for manage permission (e.g., "products.manage" grants all actions)
  if (hasPermission(permissions, `${resource}.manage`)) {
    return true;
  }
  
  return false;
}

/**
 * Get all permissions for a specific resource
 * @param {Array} permissions - Array of permission objects
 * @param {string} resource - Resource name
 * @returns {Array} Filtered permissions
 */
export function getResourcePermissions(permissions = [], resource) {
  if (!resource || !Array.isArray(permissions)) return [];
  
  return permissions.filter(
    (perm) => perm && perm.resource === resource
  );
}

/**
 * Group permissions by resource
 * @param {Array} permissions - Array of permission objects
 * @returns {Object} Object with resource as key and permissions array as value
 */
export function groupPermissionsByResource(permissions = []) {
  if (!Array.isArray(permissions)) return {};
  
  return permissions.reduce((acc, perm) => {
    if (!perm || !perm.resource) return acc;
    
    if (!acc[perm.resource]) {
      acc[perm.resource] = [];
    }
    
    acc[perm.resource].push(perm);
    return acc;
  }, {});
}


