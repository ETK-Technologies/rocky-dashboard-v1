/**
 * Next.js 16 Middleware for Route Protection
 * Handles authentication and role-based access control at the edge
 */

import { NextResponse } from "next/server";

/**
 * Role-based route configuration
 */
const ROUTE_CONFIG = {
  // Public routes (no authentication required)
  public: ["/login", "/"],

  // Protected routes by role
  user: [],
  admin: ["/dashboard"],
  super_admin: [
    "/dashboard/admin",
    "/dashboard/super-admin",
    "/dashboard/settings",
    "/dashboard/super-admin/uploads",
    "/dashboard/super-admin/uploads/settings",
  ],
};

/**
 * Role hierarchy for permission checking
 */
const ROLE_HIERARCHY = {
  user: 1,
  admin: 2,
  super_admin: 3,
};

/**
 * Check if path matches a pattern
 */
function matchesPattern(path, pattern) {
  // Exact match
  if (path === pattern) return true;

  // Starts with pattern (for nested routes)
  if (pattern.endsWith("/") && path.startsWith(pattern)) return true;
  if (!pattern.endsWith("/") && path.startsWith(pattern + "/")) return true;

  // Dynamic route matching [id]
  const patternParts = pattern.split("/");
  const pathParts = path.split("/");

  if (patternParts.length !== pathParts.length) return false;

  return patternParts.every((part, i) => {
    if (part.startsWith("[") && part.endsWith("]")) return true;
    return part === pathParts[i];
  });
}

/**
 * Check if path is public
 */
function isPublicPath(pathname) {
  return ROUTE_CONFIG.public.some((route) => matchesPattern(pathname, route));
}

/**
 * Get required role for a path
 */
function getRequiredRole(pathname) {
  // Check super_admin routes first (most restrictive)
  if (
    ROUTE_CONFIG.super_admin.some((route) => matchesPattern(pathname, route))
  ) {
    return "super_admin";
  }

  // Check admin routes
  if (ROUTE_CONFIG.admin.some((route) => matchesPattern(pathname, route))) {
    return "admin";
  }

  // Check user routes
  if (ROUTE_CONFIG.user.some((route) => matchesPattern(pathname, route))) {
    return "user";
  }

  return null;
}

/**
 * Check if user has required role
 */
function hasRequiredRole(userRole, requiredRole) {
  if (!requiredRole) return true;
  if (!userRole) return false;

  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;

  return userLevel >= requiredLevel;
}

/**
 * Decode JWT token (simple base64 decode without verification)
 * For production, consider using a proper JWT library
 */
function decodeJWT(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = Buffer.from(payload, "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}

/**
 * Middleware function
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files, API routes (except auth), and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") ||
    pathname.startsWith("/api/v1") // Skip API routes (they handle their own auth)
  ) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Get access token from cookies or Authorization header
  const accessToken =
    request.cookies.get("access_token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  // No token - redirect to login
  if (!accessToken) {
    console.log(
      `🔒 Middleware: No token found, redirecting to login from ${pathname}`
    );
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Try to decode token to get user role
  const tokenData = decodeJWT(accessToken);
  const userRole = tokenData?.role || tokenData?.user_role;

  // If we can't get role from token, allow but log warning
  if (!userRole) {
    console.warn(
      "⚠️ Middleware: Could not extract role from token, allowing access"
    );
    return NextResponse.next();
  }

  // Check if user has required role for this path
  const requiredRole = getRequiredRole(pathname);

  if (requiredRole && !hasRequiredRole(userRole, requiredRole)) {
    console.log(
      `🔒 Middleware: User role '${userRole}' insufficient for ${pathname} (requires '${requiredRole}')`
    );

    // Redirect to dashboard with error
    const dashboardUrl = new URL("/dashboard", request.url);
    dashboardUrl.searchParams.set("error", "unauthorized");
    return NextResponse.redirect(dashboardUrl);
  }

  // User is authorized
  console.log(
    `✅ Middleware: User role '${userRole}' authorized for ${pathname}`
  );
  return NextResponse.next();
}

/**
 * Middleware configuration
 * Define which routes should be processed by this middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (they handle their own auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api/v1|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
