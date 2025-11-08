import { makeRequest } from "@/utils/makeRequest";

/**
 * Service for interacting with system health endpoints
 */
export const healthService = {
  /**
   * Comprehensive system health check
   * @returns {Promise<Object>} Health payload returned by the API
   */
  async getSystemHealth() {
    return makeRequest("/api/v1/health", {
      method: "GET",
    });
  },

  /**
   * Readiness probe (is the service ready to accept traffic?)
   * @returns {Promise<Object>} Readiness payload returned by the API
   */
  async getReadiness() {
    return makeRequest("/api/v1/health/ready", {
      method: "GET",
    });
  },

  /**
   * Liveness probe (is the service running?)
   * @returns {Promise<Object>} Liveness payload returned by the API
   */
  async getLiveness() {
    return makeRequest("/api/v1/health/live", {
      method: "GET",
    });
  },
};
