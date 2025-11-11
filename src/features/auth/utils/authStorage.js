/**
 * Authentication storage utility
 * Manages tokens and user data in localStorage with SSR support
 */

import { STORAGE_KEYS } from "../constants";

/**
 * Check if we're in browser environment
 * @returns {boolean}
 */
const isBrowser = () => typeof window !== "undefined";

/**
 * Safe localStorage operations with error handling
 */
const safeStorage = {
  getItem(key) {
    if (!isBrowser()) return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error);
      return null;
    }
  },

  setItem(key, value) {
    if (!isBrowser()) return false;
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Error setting ${key} in localStorage:`, error);
      return false;
    }
  },

  removeItem(key) {
    if (!isBrowser()) return false;
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
      return false;
    }
  },
};

export const authStorage = {
  /**
   * Save authentication data to localStorage
   * @param {Object} data - Auth response data
   * @returns {boolean} - Success status
   */
  saveAuth(data) {
    if (!data) return false;

    let success = true;

    if (data.access_token) {
      success =
        safeStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access_token) &&
        success;
    }

    if (data.refresh_token) {
      success =
        safeStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token) &&
        success;
    }

    if (data.user) {
      success =
        safeStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user)) &&
        success;
    }

    return success;
  },

  /**
   * Get access token
   * @returns {string|null}
   */
  getAccessToken() {
    return safeStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  /**
   * Get refresh token
   * @returns {string|null}
   */
  getRefreshToken() {
    return safeStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  /**
   * Get user data
   * @returns {Object|null}
   */
  getUser() {
    const userData = safeStorage.getItem(STORAGE_KEYS.USER);
    if (!userData) return null;

    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error("Error parsing user data:", error);
      // Clear corrupted data
      this.removeUser();
      return null;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    const token = this.getAccessToken();
    if (!token) return false;

    // Basic token validation (you can add JWT expiration check here)
    try {
      // Check if token is not empty and has reasonable length
      return token.length > 10;
    } catch {
      return false;
    }
  },

  /**
   * Clear all auth data
   * @returns {boolean} - Success status
   */
  clearAuth() {
    let success = true;
    success = safeStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN) && success;
    success = safeStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN) && success;
    success = safeStorage.removeItem(STORAGE_KEYS.USER) && success;
    return success;
  },

  /**
   * Remove only user data (keep tokens)
   * @returns {boolean} - Success status
   */
  removeUser() {
    return safeStorage.removeItem(STORAGE_KEYS.USER);
  },

  /**
   * Get all auth data
   * @returns {Object} - Complete auth state
   */
  getAuthState() {
    return {
      isAuthenticated: this.isAuthenticated(),
      user: this.getUser(),
      hasAccessToken: !!this.getAccessToken(),
      hasRefreshToken: !!this.getRefreshToken(),
    };
  },
};
