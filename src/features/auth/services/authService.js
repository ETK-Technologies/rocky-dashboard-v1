/**
 * Authentication service
 * Handles all auth-related API calls with enhanced error handling
 */

import { makeRequest } from "@/utils/makeRequest";
import { AUTH_ENDPOINTS, AUTH_ERRORS } from "../types";
import { authStorage } from "../utils/authStorage";

/**
 * Custom error class for authentication errors
 */
class AuthError extends Error {
  constructor(message, statusCode = 500, error = null) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
    this.error = error;
  }
}

/**
 * Parse error response from API
 * @param {Error} error - Original error
 * @returns {AuthError} - Parsed auth error
 */
const parseAuthError = (error) => {
  // Network errors
  if (!error.statusCode && error.message === "Network error") {
    return new AuthError(AUTH_ERRORS.NETWORK_ERROR, 0, "NetworkError");
  }

  // HTTP errors
  const statusCode = error.statusCode || error.status || 500;
  let message = error.message || AUTH_ERRORS.GENERIC_ERROR;

  // Handle specific status codes
  switch (statusCode) {
    case 401:
      message = AUTH_ERRORS.INVALID_CREDENTIALS;
      break;
    case 403:
      message = AUTH_ERRORS.UNAUTHORIZED;
      break;
    case 500:
      message = AUTH_ERRORS.GENERIC_ERROR;
      break;
    default:
      if (error.message && error.message !== "Network error") {
        message = error.message;
      }
  }

  return new AuthError(message, statusCode, error.error);
};

export const authService = {
  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - Response with tokens and user data
   * @throws {AuthError} - Authentication error
   */
  async login(email, password) {
    try {
      const response = await makeRequest(AUTH_ENDPOINTS.LOGIN, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      // Validate response structure
      if (!response || !response.access_token) {
        throw new AuthError("Invalid response from server", 500);
      }

      return response;
    } catch (error) {
      throw parseAuthError(error);
    }
  },

  /**
   * Logout user
   * @returns {Promise<boolean>} - Success status
   */
  async logout() {
    try {
      // Get access token for Authorization header
      const accessToken = authStorage.getAccessToken();

      if (!accessToken) {
        console.warn("No access token found for logout API call");
        return true; // Still proceed with client-side logout
      }

      const response = await makeRequest(AUTH_ENDPOINTS.LOGOUT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Logout API returns 200 on success with message
      console.log("Logout successful:", response?.message || "User logged out");
      return true;
    } catch (error) {
      // Log error but don't throw - logout should always succeed client-side
      console.warn("Logout API call failed:", error);
      return true;
    }
  },

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} - New tokens
   * @throws {AuthError} - Authentication error
   */
  async refreshToken(refreshToken) {
    try {
      const response = await makeRequest(AUTH_ENDPOINTS.REFRESH, {
        method: "POST",
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response || !response.access_token) {
        throw new AuthError("Invalid refresh response", 401);
      }

      return response;
    } catch (error) {
      throw parseAuthError(error);
    }
  },

  /**
   * Get user profile
   * @param {string} accessToken - Access token
   * @returns {Promise<Object>} - User profile data
   * @throws {AuthError} - Authentication error
   */
  async getProfile(accessToken) {
    try {
      const response = await makeRequest(AUTH_ENDPOINTS.PROFILE, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response;
    } catch (error) {
      throw parseAuthError(error);
    }
  },

  /**
   * Validate token
   * @param {string} token - Access token
   * @returns {Promise<boolean>} - Token validity
   */
  async validateToken(token) {
    try {
      await this.getProfile(token);
      return true;
    } catch (error) {
      return false;
    }
  },
};
