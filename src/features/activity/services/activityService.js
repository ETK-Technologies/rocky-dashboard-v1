"use client";

import { makeRequest } from "@/utils/makeRequest";

/**
 * Service for interacting with admin activity log endpoints
 */
export const activityService = {
  /**
   * Fetch paginated activity logs with optional filters
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async getActivityLogs(params = {}) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }

      if (typeof value === "string" && value.trim() === "") {
        return;
      }

      if (Array.isArray(value)) {
        value
          .filter((item) => item !== undefined && item !== null && item !== "")
          .forEach((item) => searchParams.append(key, String(item)));
        return;
      }

      searchParams.append(key, String(value));
    });

    const queryString = searchParams.toString();
    const endpoint = `/api/v1/admin/activity${
      queryString ? `?${queryString}` : ""
    }`;

    return makeRequest(endpoint, {
      method: "GET",
    });
  },

  /**
   * Fetch a single activity log entry by ID
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async getActivityById(id) {
    if (!id) {
      throw new Error("Activity ID is required");
    }

    return makeRequest(`/api/v1/admin/activity/${id}`, {
      method: "GET",
    });
  },
};


