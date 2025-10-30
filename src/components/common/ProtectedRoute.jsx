/**
 * ProtectedRoute component
 * Wraps content that requires authentication or specific roles
 * Provides client-side route protection with role-based access control
 */

"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { toast } from "react-toastify";
import { LoadingState } from "@/components/ui/LoadingState";

/**
 * ProtectedRoute Component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to protect
 * @param {string[]} props.roles - Allowed roles (empty = any authenticated user)
 * @param {string} props.redirectTo - Where to redirect unauthorized users
 * @param {string} props.loadingMessage - Loading message to display
 * @param {React.ReactNode} props.fallback - Custom fallback component
 * @param {boolean} props.showAccessDenied - Show access denied message
 */
export default function ProtectedRoute({
  children,
  roles = [],
  redirectTo = "/login",
  loadingMessage = "Checking permissions...",
  fallback = null,
  showAccessDenied = true,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, user, isAuthorized } = useAuth();

  useEffect(() => {
    // Wait for loading to complete
    if (isLoading) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      // Suppress auth-required toast if we just logged out
      let suppressAuthToast = false;
      try {
        if (typeof window !== "undefined") {
          const flag = sessionStorage.getItem("just_logged_out");
          if (flag === "1") {
            suppressAuthToast = true;
            sessionStorage.removeItem("just_logged_out");
          }
        }
      } catch {}

      if (showAccessDenied && !suppressAuthToast) {
        toast.error("Please login to access this page");
      }
      router.push(redirectTo);
      return;
    }

    // Check if user has required role
    if (roles.length > 0 && !isAuthorized(roles)) {
      if (showAccessDenied) {
        toast.error("You don't have permission to access this page");
      }
      router.push("/dashboard"); // Redirect to dashboard if unauthorized
      return;
    }
  }, [
    isAuthenticated,
    isLoading,
    user,
    roles,
    router,
    redirectTo,
    isAuthorized,
    showAccessDenied,
    searchParams,
  ]);

  // Show loading state
  if (isLoading) {
    if (fallback) {
      return fallback;
    }
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingState message={loadingMessage} />
      </div>
    );
  }

  // Check authentication
  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  // Check authorization
  if (roles.length > 0 && !isAuthorized(roles)) {
    return null; // Will redirect via useEffect
  }

  // Render protected content
  return <>{children}</>;
}

/**
 * Higher-order component version of ProtectedRoute
 * @param {React.ComponentType} Component - Component to protect
 * @param {Object} options - Protection options
 * @returns {React.ComponentType} - Protected component
 */
export function withProtection(Component, options = {}) {
  return function ProtectedComponent(props) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

/**
 * RoleGuard - Shows content only for specific roles
 * Doesn't redirect, just hides content
 */
export function RoleGuard({ children, roles = [], fallback = null }) {
  const { isAuthenticated, isAuthorized } = useAuth();

  if (!isAuthenticated) {
    return fallback;
  }

  if (roles.length > 0 && !isAuthorized(roles)) {
    return fallback;
  }

  return <>{children}</>;
}

/**
 * AdminOnly - Shows content only for admins and super admins
 */
export function AdminOnly({ children, fallback = null }) {
  return (
    <RoleGuard roles={["admin", "super_admin"]} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * SuperAdminOnly - Shows content only for super admins
 */
export function SuperAdminOnly({ children, fallback = null }) {
  return (
    <RoleGuard roles={["super_admin"]} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * AccessDenied - Component to show when access is denied
 */
export function AccessDenied({
  message = "You don't have permission to access this page",
}) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="mb-4">
          <svg
            className="w-16 h-16 text-red-500 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Access Denied
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
