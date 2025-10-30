"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { authService } from "../services/authService";
import { authStorage } from "../utils/authStorage";
import { useAuthStore } from "@/lib/store/authStore";
import { AUTH_SUCCESS } from "../constants";

/**
 * Custom hook for logout functionality
 * @returns {Object} - Logout handlers and state
 */
export function useLogout() {
  const router = useRouter();
  const { logout: logoutFromStore } = useAuthStore();

  /**
   * Logout user and clear auth data
   * @param {Object} options - Logout options
   * @param {boolean} options.showToast - Whether to show success toast
   * @param {string} options.redirectTo - Where to redirect after logout
   */
  const logout = useCallback(
    async (options = {}) => {
      const { showToast = true, redirectTo = "/login" } = options;

      try {
        // Call logout API - this will always succeed even if API fails
        await authService.logout();
      } catch (error) {
        // This should never happen since authService.logout() doesn't throw
        console.error("Unexpected logout error:", error);
      } finally {
        // Mark a short-lived flag to suppress auth-required toast on redirect
        try {
          sessionStorage.setItem("just_logged_out", "1");
        } catch {}

        // Clear auth data from localStorage and Zustand store
        authStorage.clearAuth();
        logoutFromStore();

        // Show success message
        if (showToast) {
          toast.success(AUTH_SUCCESS.LOGOUT_SUCCESS);
        }

        // Redirect to login page (carry a hint param as a fallback)
        if (redirectTo) {
          const target = redirectTo.includes("?")
            ? `${redirectTo}&loggedOut=1`
            : `${redirectTo}?loggedOut=1`;
          router.push(target);
        }
      }
    },
    [router, logoutFromStore]
  );

  /**
   * Logout and redirect to specific page
   * @param {string} redirectTo - Where to redirect after logout
   */
  const logoutAndRedirect = useCallback(
    (redirectTo) => {
      logout({ redirectTo });
    },
    [logout]
  );

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
