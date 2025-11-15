import { makeRequest } from "@/utils/makeRequest";

/**
 * Email triggers logs service for API calls
 * Uses the activity endpoint with email trigger filters
 */
export const emailTriggersLogsService = {
  /**
   * Get email trigger logs with optional filters
   * @param {Object} params - Query parameters (emailTrigger, scope, dateFrom, dateTo, etc.)
   * @returns {Promise<Object>} Response with logs and pagination
   */
  async getEmailTriggersLogs(params = {}) {
    const searchParams = new URLSearchParams();

    // Always filter by email scope
    searchParams.append("scope", "email");

    // Add optional filters
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
};

