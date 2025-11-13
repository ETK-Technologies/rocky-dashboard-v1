export const APP_ROLES = [
  "customer",
  "admin",
  "super_admin",
  "doctor",
  "nurse",
  "pharmacy",
  "clinical_assistant",
  "customer_support",
  "author",
];

export const API_ROLES = [
  "CUSTOMER",
  "ADMIN",
  "SUPER_ADMIN",
  "DOCTOR",
  "NURSE",
  "PHARMACY",
  "CLINICAL_ASSISTANT",
  "CUSTOMER_SUPPORT",
  "AUTHOR",
];

/**
 * Convert app role to API role format
 * @param {string} role - App role (e.g., "customer", "admin")
 * @returns {string} API role (e.g., "CUSTOMER", "ADMIN")
 */
export function appRoleToApi(role) {
  if (!role) return "CUSTOMER";
  const r = (role || "").toString().toLowerCase().replace(/\s+/g, "_");

  const roleMap = {
    super_admin: "SUPER_ADMIN",
    superadmin: "SUPER_ADMIN",
    admin: "ADMIN",
    doctor: "DOCTOR",
    nurse: "NURSE",
    pharmacy: "PHARMACY",
    clinical_assistant: "CLINICAL_ASSISTANT",
    clinicalassistant: "CLINICAL_ASSISTANT",
    customer_support: "CUSTOMER_SUPPORT",
    customersupport: "CUSTOMER_SUPPORT",
    author: "AUTHOR",
    user: "CUSTOMER",
    customer: "CUSTOMER",
  };

  return roleMap[r] || "CUSTOMER";
}

/**
 * Convert app role to backend slug format
 * Backend uses slugs like "customer", "admin", "super-admin", "doctor", etc.
 * @param {string} role - App role (e.g., "customer", "admin", "super_admin")
 * @returns {string} Backend slug (e.g., "customer", "admin", "super-admin")
 */
export function appRoleToSlug(role) {
  if (!role) return "customer";
  const r = (role || "").toString().toLowerCase().replace(/\s+/g, "_");

  const slugMap = {
    super_admin: "super-admin",
    superadmin: "super-admin",
    admin: "admin",
    doctor: "doctor",
    nurse: "nurse",
    pharmacy: "pharmacy",
    clinical_assistant: "clinical-assistant",
    clinicalassistant: "clinical-assistant",
    customer_support: "customer-support",
    customersupport: "customer-support",
    author: "author",
    user: "customer",
    customer: "customer",
  };

  return slugMap[r] || "customer";
}

/**
 * Convert API role to app role format
 * @param {string} role - API role (e.g., "CUSTOMER", "ADMIN")
 * @returns {string} App role (e.g., "customer", "admin")
 */
export function apiRoleToApp(role) {
  if (!role) return "customer";
  const r = (role || "").toString().toUpperCase();

  const roleMap = {
    SUPER_ADMIN: "super_admin",
    ADMIN: "admin",
    DOCTOR: "doctor",
    NURSE: "nurse",
    PHARMACY: "pharmacy",
    CLINICAL_ASSISTANT: "clinical_assistant",
    CUSTOMER_SUPPORT: "customer_support",
    AUTHOR: "author",
    CUSTOMER: "customer",
    USER: "customer",
  };

  return roleMap[r] || "customer";
}

/**
 * Convert backend slug to app role format
 * @param {string} slug - Backend slug (e.g., "super-admin", "customer-support")
 * @returns {string} App role (e.g., "super_admin", "customer_support")
 */
export function slugToAppRole(slug) {
  if (!slug) return "customer";
  const s = slug.toString().toLowerCase();

  const roleMap = {
    "super-admin": "super_admin",
    super_admin: "super_admin",
    superadmin: "super_admin",
    admin: "admin",
    doctor: "doctor",
    nurse: "nurse",
    pharmacy: "pharmacy",
    "clinical-assistant": "clinical_assistant",
    clinical_assistant: "clinical_assistant",
    clinicalassistant: "clinical_assistant",
    "customer-support": "customer_support",
    customer_support: "customer_support",
    customersupport: "customer_support",
    author: "author",
    customer: "customer",
    user: "customer",
  };

  return roleMap[s] || "customer";
}

/**
 * Normalize user role from API response
 * Handles multiple sources: top-level role field, userRoles array, or roles array
 * @param {Object} user - User object from API
 * @returns {Object} User object with normalized role
 */
export function normalizeUserRole(user) {
  if (!user) return user;

  // First check the top-level role enum field (most reliable from API)
  // This is always present in the API response (CUSTOMER, ADMIN, SUPER_ADMIN)
  if (user.role) {
    return { ...user, role: apiRoleToApp(user.role) };
  }

  // Check userRoles array (from API response) - extract slug from role object
  // Some users may have empty userRoles array, so we check length first
  if (Array.isArray(user.userRoles) && user.userRoles.length > 0) {
    // Get the first role (or find the highest priority role)
    // If user has multiple roles, prefer admin/super-admin over customer
    let selectedRole = user.userRoles[0];

    // If multiple roles exist, prefer admin roles over customer
    if (user.userRoles.length > 1) {
      const adminRole = user.userRoles.find(
        (ur) => ur?.role?.slug === "admin" || ur?.role?.slug === "super-admin"
      );
      if (adminRole) {
        selectedRole = adminRole;
      }
    }

    const slug =
      selectedRole?.role?.slug || selectedRole?.slug || selectedRole?.name;
    if (slug) {
      return { ...user, role: slugToAppRole(slug) };
    }
  }

  // Check roles array as fallback (if it exists)
  if (Array.isArray(user.roles) && user.roles.length > 0) {
    const first = user.roles[0];
    const slug = typeof first === "string" ? first : first.slug || first.name;
    if (slug) {
      return { ...user, role: slugToAppRole(slug) };
    }
  }

  // Default to "customer" if no role found (shouldn't happen with current API)
  return { ...user, role: "customer" };
}

/**
 * Get all role slugs from a user object
 * @param {Object} user - User object from API
 * @returns {Array<string>} Array of role slugs (e.g., ["customer", "admin"])
 */
export function getUserRoleSlugs(user) {
  if (!user) return [];

  const slugs = [];

  // Add primary role from top-level field
  if (user.role) {
    const normalizedRole = apiRoleToApp(user.role);
    const slug = appRoleToSlug(normalizedRole);
    if (slug && !slugs.includes(slug)) {
      slugs.push(slug);
    }
  }

  // Add roles from userRoles array
  if (Array.isArray(user.userRoles) && user.userRoles.length > 0) {
    user.userRoles.forEach((userRole) => {
      const slug = userRole?.role?.slug;
      if (slug && !slugs.includes(slug)) {
        slugs.push(slug);
      }
    });
  }

  // Add roles from roles array (if exists)
  if (Array.isArray(user.roles) && user.roles.length > 0) {
    user.roles.forEach((role) => {
      const slug = typeof role === "string" ? role : role.slug;
      if (slug && !slugs.includes(slug)) {
        slugs.push(slug);
      }
    });
  }

  return slugs;
}

/**
 * Get all normalized roles from a user object
 * @param {Object} user - User object from API
 * @returns {Array<string>} Array of normalized roles (e.g., ["user", "admin"])
 */
export function getUserRoles(user) {
  const slugs = getUserRoleSlugs(user);
  return slugs.map(slugToAppRole);
}
