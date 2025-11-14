/**
 * Enhanced useAuth hook
 * Provides authentication utilities and role-based access control
 * Uses Zustand store for state management
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuthStore, ROLES } from "@/lib/store/authStore";
import { authStorage } from "../utils/authStorage";
import { setAuthStoreClearAuth } from "@/utils/makeRequest";

/**
 * Custom hook for authentication with RBAC support
 * @returns {Object} Auth state and methods
 */
export function useAuth() {
    const router = useRouter();

    // Get all state and methods from Zustand store
    const {
        user,
        isAuthenticated,
        isLoading,
        error,
        permissions,
        permissionsLoaded,
        setUser,
        setLoading,
        setError,
        clearError,
        fetchUserProfile,
        fetchUserPermissions,
        login,
        logout,
        initializeAuth,
        hasRole,
        hasAnyRole,
        hasMinimumRole,
        isUser,
        isAdmin,
        isSuperAdmin,
        canAccess,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        hasResourcePermission,
        getUserFullName,
        getUserDisplayName,
    } = useAuthStore();

    /**
     * Initialize auth on mount
     */
    useEffect(() => {
        initializeAuth();

        // Set up the clearAuth reference for makeRequest to use when refresh fails
        const { clearAuth } = useAuthStore.getState();
        setAuthStoreClearAuth(clearAuth);
    }, [initializeAuth]);

    /**
     * Login with credentials
     */
    const handleLogin = async (email, password, authService) => {
        setLoading(true);
        clearError();

        try {
            // Call auth service login
            const response = await authService.login(email, password);

            // Login with Zustand store
            const user = await login(response);

            if (user) {
                const displayName = user.firstName || user.email || "User";
                toast.success(`Welcome back, ${displayName}!`);
                return user;
            }

            throw new Error("Failed to fetch user profile");
        } catch (error) {
            const errorMessage = error.message || "Login failed";
            setError(errorMessage);
            toast.error(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Logout user
     */
    const handleLogout = async () => {
        try {
            await logout();
            toast.success("You have been logged out successfully");
            router.push("/login");
        } catch (error) {
            console.error("Logout error:", error);
            toast.error("Error during logout");
        }
    };

    /**
     * Refresh user profile
     */
    const refreshProfile = async () => {
        try {
            const profile = await fetchUserProfile();
            if (profile) {
                toast.success("Profile updated");
                return profile;
            }
            throw new Error("Failed to refresh profile");
        } catch (error) {
            toast.error("Failed to refresh profile");
            throw error;
        }
    };

    /**
     * Check if user is authorized for a route (role-based)
     */
    const isAuthorized = (allowedRoles = []) => {
        if (!isAuthenticated) return false;
        if (allowedRoles.length === 0) return true;
        return canAccess(allowedRoles);
    };

    /**
     * Check if user is authorized by permissions
     * @param {string|Array<string>} permissionSlugs - Permission slug(s) to check
     * @param {Object} options - Options for permission check
     * @param {boolean} options.requireAll - If true, requires all permissions (default: false)
     * @returns {boolean}
     */
    const isAuthorizedByPermission = (permissionSlugs, options = {}) => {
        if (!isAuthenticated || !permissionsLoaded) return false;

        if (!permissionSlugs) return true; // No permission requirement

        const slugs = Array.isArray(permissionSlugs)
            ? permissionSlugs
            : [permissionSlugs];
        if (slugs.length === 0) return true;

        if (options.requireAll) {
            return hasAllPermissions(slugs);
        }

        return hasAnyPermission(slugs);
    };

    /**
     * Require authentication - redirect to login if not authenticated
     */
    const requireAuth = (redirectUrl = "/login") => {
        if (!isAuthenticated) {
            toast.error("Please login to access this page");
            router.push(redirectUrl);
            return false;
        }
        return true;
    };

    /**
     * Require specific role - redirect if unauthorized
     */
    const requireRole = (allowedRoles = [], redirectUrl = "/dashboard") => {
        if (!requireAuth()) return false;

        if (!isAuthorized(allowedRoles)) {
            toast.error("You don't have permission to access this page");
            router.push(redirectUrl);
            return false;
        }

        return true;
    };

    /**
     * Get access token
     */
    const getAccessToken = () => {
        return authStorage.getAccessToken();
    };

    /**
     * Get refresh token
     */
    const getRefreshToken = () => {
        return authStorage.getRefreshToken();
    };

    /**
     * Check if token exists
     */
    const hasToken = () => {
        return !!authStorage.getAccessToken();
    };

    /**
     * Get user role display name
     */
    const getRoleDisplayName = () => {
        if (!user || !user.role) return "Unknown";

        const roleMap = {
            [ROLES.USER]: "User",
            [ROLES.ADMIN]: "Admin",
            [ROLES.SUPER_ADMIN]: "Super Admin",
        };

        return roleMap[user.role] || user.role;
    };

    return {
        // State
        user,
        isAuthenticated,
        isLoading,
        error,
        permissions,
        permissionsLoaded,

        // Basic actions
        login: handleLogin,
        logout: handleLogout,
        refreshProfile,
        refreshPermissions: () => {
            if (user && user.id) {
                return fetchUserPermissions(user.id);
            }
            return Promise.resolve([]);
        },
        clearError,

        // Role checking (legacy - still supported)
        hasRole,
        hasAnyRole,
        hasMinimumRole,
        isUser,
        isAdmin,
        isSuperAdmin,
        canAccess,
        isAuthorized,

        // Permission checking
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        hasResourcePermission,
        isAuthorizedByPermission,

        // Route protection
        requireAuth,
        requireRole,
        requirePermission: (permissionSlugs, options = {}) => {
            if (!requireAuth()) return false;

            if (!isAuthorizedByPermission(permissionSlugs, options)) {
                toast.error("You don't have permission to access this page");
                router.push("/dashboard");
                return false;
            }

            return true;
        },

        // Token management
        getAccessToken,
        getRefreshToken,
        hasToken,

        // User info
        getUserFullName,
        getUserDisplayName,
        getRoleDisplayName,

        // Constants
        ROLES,
    };
}

export default useAuth;
