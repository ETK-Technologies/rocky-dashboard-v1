import { makeRequest } from "@/utils/makeRequest";

/**
 * Authentication service
 * Handles all auth-related API calls
 */
export const authService = {
  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} - Response with tokens and user data
   */
  async login(email, password) {
    return await makeRequest("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * Logout user (client-side only for now)
   */
  logout() {
    // Can be extended to call backend logout endpoint if needed
    return Promise.resolve();
  },
};
