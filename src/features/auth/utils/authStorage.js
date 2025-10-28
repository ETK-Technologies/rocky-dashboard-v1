/**
 * Authentication storage utility
 * Manages tokens and user data in localStorage
 */

const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER: "user",
};

export const authStorage = {
  /**
   * Save authentication data to localStorage
   * @param {Object} data - Auth response data
   */
  saveAuth(data) {
    if (typeof window === "undefined") return;

    try {
      if (data.access_token) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access_token);
      }
      if (data.refresh_token) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token);
      }
      if (data.user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
      }
    } catch (error) {
      console.error("Error saving auth data:", error);
    }
  },

  /**
   * Get access token
   * @returns {string|null}
   */
  getAccessToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  /**
   * Get refresh token
   * @returns {string|null}
   */
  getRefreshToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  /**
   * Get user data
   * @returns {Object|null}
   */
  getUser() {
    if (typeof window === "undefined") return null;

    try {
      const user = localStorage.getItem(STORAGE_KEYS.USER);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!this.getAccessToken();
  },

  /**
   * Clear all auth data
   */
  clearAuth() {
    if (typeof window === "undefined") return;

    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },
};
