/**
 * Authentication types and constants
 */

// Storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER: "user",
};

// API endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: "/api/v1/admin/auth/login",
  LOGOUT: "/api/v1/auth/logout",
  REFRESH: "/api/v1/auth/refresh",
  PROFILE: "/api/v1/users/profile", // Updated to match backend API
};

// Error messages
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS:
    "Invalid email or password. Please check your credentials.",
  NETWORK_ERROR:
    "Unable to connect to server. Please ensure the backend API is running on port 3000.",
  GENERIC_ERROR: "Login failed. Please try again.",
  TOKEN_EXPIRED: "Your session has expired. Please log in again.",
  UNAUTHORIZED: "You are not authorized to access this resource.",
};

// Success messages
export const AUTH_SUCCESS = {
  LOGIN_SUCCESS: "Welcome back!",
  LOGOUT_SUCCESS: "You have been logged out successfully.",
};

// Form validation
export const VALIDATION_RULES = {
  EMAIL: {
    required: "Email is required",
    invalid: "Please enter a valid email address",
  },
  PASSWORD: {
    required: "Password is required",
    minLength: "Password must be at least 6 characters",
  },
};
