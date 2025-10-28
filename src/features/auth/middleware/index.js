/**
 * Authentication middleware utilities
 * Provides route protection and auth state management
 */

import { authStorage } from "../utils/authStorage";

/**
 * Check if user is authenticated (client-side)
 * @returns {boolean}
 */
export const isAuthenticated = () => {
    return authStorage.isAuthenticated();
};

/**
 * Get current user data (client-side)
 * @returns {Object|null}
 */
export const getCurrentUser = () => {
    return authStorage.getUser();
};

/**
 * Get authentication state (client-side)
 * @returns {Object}
 */
export const getAuthState = () => {
    return authStorage.getAuthState();
};

/**
 * Redirect to login if not authenticated (client-side)
 * @param {Function} router - Next.js router instance
 * @param {string} redirectTo - Optional redirect path after login
 */
export const requireAuth = (router, redirectTo = "/dashboard") => {
    if (!isAuthenticated()) {
        const loginUrl = redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : "/login";
        router.push(loginUrl);
        return false;
    }
    return true;
};

/**
 * Redirect to dashboard if authenticated (client-side)
 * @param {Function} router - Next.js router instance
 */
export const redirectIfAuthenticated = (router) => {
    if (isAuthenticated()) {
        router.push("/dashboard");
        return true;
    }
    return false;
};

/**
 * Server-side auth check (for middleware)
 * @param {Object} cookies - Request cookies
 * @returns {Object} - Auth state
 */
export const getServerAuthState = (cookies) => {
    // This would need to be implemented based on your server-side auth strategy
    // For now, return a placeholder
    return {
        isAuthenticated: false,
        user: null,
    };
};

/**
 * Auth route protection patterns
 */
export const AUTH_ROUTES = {
    LOGIN: "/login",
    DASHBOARD: "/dashboard",
    PROTECTED_PATHS: ["/dashboard", "/profile", "/settings"],
    PUBLIC_PATHS: ["/", "/login", "/register"],
};
