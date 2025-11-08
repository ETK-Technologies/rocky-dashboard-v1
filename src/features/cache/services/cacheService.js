"use client";

import { makeRequest } from "@/utils/makeRequest";

/**
 * Cache management service
 */
export const cacheService = {
  /**
   * Clear cached data optionally scoped by patterns.
   * @param {string[]} [patterns] - Optional cache key patterns to target.
   * @returns {Promise<Object>} API response payload.
   */
  async clearCache(patterns = []) {
    const payload =
      Array.isArray(patterns) && patterns.length > 0
        ? JSON.stringify({ patterns })
        : undefined;

    return makeRequest("/api/v1/admin/cache/clear", {
      method: "POST",
      body: payload,
    });
  },
};
