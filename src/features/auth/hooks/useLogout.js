"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { authService } from "../services/authService";
import { authStorage } from "../utils/authStorage";
import { AUTH_SUCCESS } from "../constants";

/**
 * Custom hook for logout functionality
 * @returns {Object} - Logout handlers and state
 */
export function useLogout() {
    const router = useRouter();

    /**
     * Logout user and clear auth data
     * @param {Object} options - Logout options
     * @param {boolean} options.showToast - Whether to show success toast
     * @param {string} options.redirectTo - Where to redirect after logout
     */
    const logout = useCallback(async (options = {}) => {
        const { showToast = true, redirectTo = "/login" } = options;

        try {
            // Call logout API - this will always succeed even if API fails
            await authService.logout();
        } catch (error) {
            // This should never happen since authService.logout() doesn't throw
            console.error("Unexpected logout error:", error);
        } finally {
            // Always clear local auth data regardless of API result
            authStorage.clearAuth();

            // Show success message
            if (showToast) {
                toast.success(AUTH_SUCCESS.LOGOUT_SUCCESS);
            }

            // Redirect to login page
            router.push(redirectTo);
        }
    }, [router]);

    /**
     * Logout and redirect to specific page
     * @param {string} redirectTo - Where to redirect after logout
     */
    const logoutAndRedirect = useCallback((redirectTo) => {
        logout({ redirectTo });
    }, [logout]);

    /**
     * Silent logout (no toast, no redirect)
     */
    const silentLogout = useCallback(() => {
        logout({ showToast: false, redirectTo: null });
    }, [logout]);

    return {
        logout,
        logoutAndRedirect,
        silentLogout,
    };
}
