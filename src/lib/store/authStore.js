/**
 * Zustand store for authentication and user management
 * Handles user state, role-based access, and token management
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { authService } from "@/features/auth/services/authService";
import { authStorage } from "@/features/auth/utils/authStorage";
import { permissionService } from "@/features/permissions";
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasResourcePermission,
} from "@/features/permissions";

/**
 * User roles enum
 */
export const ROLES = {
  USER: "user",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
};

/**
 * Role hierarchy for permission checking
 */
const ROLE_HIERARCHY = {
  [ROLES.USER]: 1,
  [ROLES.ADMIN]: 2,
  [ROLES.SUPER_ADMIN]: 3,
};

/**
 * Normalize a role string to the canonical form used in the app
 * Accepts variations like "USER", "Admin", "super admin", "SUPER_ADMIN"
 */
function normalizeRole(role) {
  if (!role || typeof role !== "string") return role;
  const r = role.trim().toLowerCase().replace(/\s+/g, "_");
  if (r === "user") return ROLES.USER;
  if (r === "admin") return ROLES.ADMIN;
  if (r === "superadmin" || r === "super_admin") return ROLES.SUPER_ADMIN;
  return r;
}

/**
 * Auth store using Zustand
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      permissions: [], // Array of permission objects
      permissionsLoaded: false,

      /**
       * Set user data and authentication status
       */
      setUser: (user) => {
        const normalizedUser =
          user && user.role
            ? { ...user, role: normalizeRole(user.role) }
            : user;
        set({
          user: normalizedUser,
          isAuthenticated: !!normalizedUser,
          error: null,
        });
        
        // Fetch permissions when user is set
        if (normalizedUser && normalizedUser.id) {
          get().fetchUserPermissions(normalizedUser.id);
        }
      },

      /**
       * Set loading state
       */
      setLoading: (isLoading) => set({ isLoading }),

      /**
       * Set error state
       */
      setError: (error) => set({ error }),

      /**
       * Clear error state
       */
      clearError: () => set({ error: null }),

      /**
       * Fetch and store user profile
       */
      fetchUserProfile: async () => {
        const accessToken = authStorage.getAccessToken();

        if (!accessToken) {
          set({
            user: null,
            isAuthenticated: false,
            error: "No access token found",
            permissions: [],
            permissionsLoaded: false,
          });
          return null;
        }

        set({ isLoading: true, error: null });

        try {
          const profile = await authService.getProfile(accessToken);

          // Ensure role is normalized
          const normalizedProfile =
            profile && profile.role
              ? { ...profile, role: normalizeRole(profile.role) }
              : profile;

          // Store user in localStorage via authStorage
          authStorage.saveAuth({ user: normalizedProfile });

          set({
            user: normalizedProfile,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Fetch permissions for the user
          if (normalizedProfile && normalizedProfile.id) {
            await get().fetchUserPermissions(normalizedProfile.id);
          }

          return normalizedProfile;
        } catch (error) {
          console.error("Failed to fetch user profile:", error);

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || "Failed to fetch user profile",
            permissions: [],
            permissionsLoaded: false,
          });

          // Clear auth data on profile fetch failure
          authStorage.clearAuth();

          return null;
        }
      },

      /**
       * Fetch and store user permissions
       * @param {string} userId - User ID
       */
      fetchUserPermissions: async (userId) => {
        if (!userId) {
          set({ permissions: [], permissionsLoaded: false });
          return [];
        }

        try {
          const permissions = await permissionService.getUserPermissions(userId);
          set({
            permissions: Array.isArray(permissions) ? permissions : [],
            permissionsLoaded: true,
          });
          return permissions;
        } catch (error) {
          console.error("Failed to fetch user permissions:", error);
          set({
            permissions: [],
            permissionsLoaded: true, // Mark as loaded even on error to prevent infinite retries
          });
          return [];
        }
      },

      /**
       * Set permissions directly (useful for testing or manual updates)
       * @param {Array} permissions - Array of permission objects
       */
      setPermissions: (permissions) => {
        set({
          permissions: Array.isArray(permissions) ? permissions : [],
          permissionsLoaded: true,
        });
      },

      /**
       * Login and fetch user profile
       */
      login: async (authData) => {
        // Save tokens
        authStorage.saveAuth(authData);

        // Reset permissions on login
        set({ permissions: [], permissionsLoaded: false });

        // If user data is included in login response
        if (authData.user) {
          const normalizedUser = authData.user.role
            ? { ...authData.user, role: normalizeRole(authData.user.role) }
            : authData.user;
          set({
            user: normalizedUser,
            isAuthenticated: true,
            error: null,
          });
          
          // Fetch permissions for the user
          if (normalizedUser && normalizedUser.id) {
            await get().fetchUserPermissions(normalizedUser.id);
          }
          
          return normalizedUser;
        }

        // Otherwise fetch user profile (which will also fetch permissions)
        return await get().fetchUserProfile();
      },

      /**
       * Clear auth state without API call (useful for token refresh failures)
       */
      clearAuth: () => {
        authStorage.clearAuth();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          permissions: [],
          permissionsLoaded: false,
        });
      },

      /**
       * Logout and clear all auth data
       */
      logout: async () => {
        set({ isLoading: true });

        try {
          // Call logout API
          await authService.logout();
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          // Clear auth data regardless of API call result
          authStorage.clearAuth();

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            permissions: [],
            permissionsLoaded: false,
          });
        }
      },

      /**
       * Initialize auth state from storage
       */
      initializeAuth: async () => {
        const accessToken = authStorage.getAccessToken();
        const storedUser = authStorage.getUser();

        if (!accessToken) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            permissions: [],
            permissionsLoaded: false,
          });
          return;
        }

        // If we have stored user data, use it immediately
        if (storedUser) {
          const normalizedStoredUser = storedUser.role
            ? { ...storedUser, role: normalizeRole(storedUser.role) }
            : storedUser;
          set({
            user: normalizedStoredUser,
            isAuthenticated: true,
            isLoading: false,
          });
        }

        // Fetch fresh profile in background to ensure data is up-to-date
        // This will also fetch permissions
        await get().fetchUserProfile();
      },

      /**
       * Check if user has a specific role
       */
      hasRole: (role) => {
        const { user } = get();
        if (!user || !user.role) return false;
        return user.role === role;
      },

      /**
       * Check if user has any of the specified roles
       */
      hasAnyRole: (roles = []) => {
        const { user } = get();
        if (!user || !user.role) return false;
        return roles.includes(user.role);
      },

      /**
       * Check if user has minimum role level
       * @param {string} minRole - Minimum required role
       * @returns {boolean}
       */
      hasMinimumRole: (minRole) => {
        const { user } = get();
        if (!user || !user.role) return false;

        const userRoleLevel = ROLE_HIERARCHY[user.role] || 0;
        const minRoleLevel = ROLE_HIERARCHY[minRole] || 0;

        return userRoleLevel >= minRoleLevel;
      },

      /**
       * Role checking helpers
       */
      isUser: () => get().hasRole(ROLES.USER),
      isAdmin: () =>
        get().hasRole(ROLES.ADMIN) || get().hasRole(ROLES.SUPER_ADMIN),
      isSuperAdmin: () => get().hasRole(ROLES.SUPER_ADMIN),

      /**
       * Check if user can access a resource (role-based)
       */
      canAccess: (allowedRoles = []) => {
        if (allowedRoles.length === 0) return true;
        return get().hasAnyRole(allowedRoles);
      },

      /**
       * Permission checking methods
       */
      
      /**
       * Check if user has a specific permission
       * @param {string} permissionSlug - Permission slug (e.g., "products.read")
       * @returns {boolean}
       */
      hasPermission: (permissionSlug) => {
        const { permissions } = get();
        return hasPermission(permissions, permissionSlug);
      },

      /**
       * Check if user has any of the specified permissions
       * @param {Array<string>} permissionSlugs - Array of permission slugs
       * @returns {boolean}
       */
      hasAnyPermission: (permissionSlugs = []) => {
        const { permissions } = get();
        return hasAnyPermission(permissions, permissionSlugs);
      },

      /**
       * Check if user has all of the specified permissions
       * @param {Array<string>} permissionSlugs - Array of permission slugs
       * @returns {boolean}
       */
      hasAllPermissions: (permissionSlugs = []) => {
        const { permissions } = get();
        return hasAllPermissions(permissions, permissionSlugs);
      },

      /**
       * Check if user has permission for a resource and action
       * @param {string} resource - Resource name (e.g., "products")
       * @param {string} action - Action name (e.g., "read", "create", "manage")
       * @returns {boolean}
       */
      hasResourcePermission: (resource, action) => {
        const { permissions } = get();
        return hasResourcePermission(permissions, resource, action);
      },

      /**
       * Get user's full name
       */
      getUserFullName: () => {
        const { user } = get();
        if (!user) return null;

        if (user.firstName && user.lastName) {
          return `${user.firstName} ${user.lastName}`;
        }

        return user.firstName || user.lastName || user.email || "User";
      },

      /**
       * Get user's display name (first name or email)
       */
      getUserDisplayName: () => {
        const { user } = get();
        if (!user) return null;
        return user.firstName || user.email || "User";
      },
    }),
    {
      name: "auth-storage", // unique name for localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist user data and permissions, not loading/error states
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        permissions: state.permissions,
        permissionsLoaded: state.permissionsLoaded,
      }),
    }
  )
);
