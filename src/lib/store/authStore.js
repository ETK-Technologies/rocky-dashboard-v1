/**
 * Zustand store for authentication and user management
 * Handles user state, role-based access, and token management
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { authService } from "@/features/auth/services/authService";
import { authStorage } from "@/features/auth/utils/authStorage";

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

          return normalizedProfile;
        } catch (error) {
          console.error("Failed to fetch user profile:", error);

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || "Failed to fetch user profile",
          });

          // Clear auth data on profile fetch failure
          authStorage.clearAuth();

          return null;
        }
      },

      /**
       * Login and fetch user profile
       */
      login: async (authData) => {
        // Save tokens
        authStorage.saveAuth(authData);

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
          return normalizedUser;
        }

        // Otherwise fetch user profile
        return await get().fetchUserProfile();
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
       * Check if user can access a resource
       */
      canAccess: (allowedRoles = []) => {
        if (allowedRoles.length === 0) return true;
        return get().hasAnyRole(allowedRoles);
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
        // Only persist user data, not loading/error states
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
