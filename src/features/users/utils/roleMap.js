export const APP_ROLES = ["user", "admin", "super_admin"];

export const API_ROLES = ["CUSTOMER", "ADMIN", "SUPER_ADMIN"];

export function appRoleToApi(role) {
  const r = (role || "").toString().toLowerCase();
  if (r === "super_admin") return "SUPER_ADMIN";
  if (r === "admin") return "ADMIN";
  return "CUSTOMER";
}

// Backend role slugs - match the actual slugs from API (customer, admin, super-admin)
export function appRoleToSlug(role) {
  const r = (role || "").toString().toLowerCase();
  if (r === "super_admin") return "super-admin"; // Backend uses hyphen, not underscore
  if (r === "admin") return "admin";
  return "customer";
}

export function apiRoleToApp(role) {
  const r = (role || "").toString().toUpperCase();
  if (r === "SUPER_ADMIN") return "super_admin";
  if (r === "ADMIN") return "admin";
  return "user";
}

// Convert backend slug (like "super-admin") to app role format
export function slugToAppRole(slug) {
  if (!slug) return "user";
  const s = slug.toString().toLowerCase();
  if (s === "super-admin" || s === "super_admin") return "super_admin";
  if (s === "admin") return "admin";
  return "user";
}

export function normalizeUserRole(user) {
  if (!user) return user;
  // First check the top-level role enum field (most reliable from API)
  if (user.role) return { ...user, role: apiRoleToApp(user.role) };
  // Check userRoles array (from API response) - extract slug from role object
  if (Array.isArray(user.userRoles) && user.userRoles.length > 0) {
    const firstRole = user.userRoles[0];
    const slug = firstRole?.role?.slug || firstRole?.slug || firstRole?.name;
    if (slug) {
      return { ...user, role: slugToAppRole(slug) };
    }
  }
  // Check roles array as fallback
  if (Array.isArray(user.roles) && user.roles.length > 0) {
    const first = user.roles[0];
    const slug = typeof first === "string" ? first : first.slug || first.name;
    if (slug) {
      return { ...user, role: slugToAppRole(slug) };
    }
  }
  return user;
}
