import { makeRequest } from "@/utils/makeRequest";

/**
 * Service for interacting with admin jobs endpoints.
 */
export const adminJobsService = {
  // Jobs Overview
  async getJobsOverview(limit = 20) {
    const url = limit
      ? `/api/v1/admin/jobs?limit=${limit}`
      : "/api/v1/admin/jobs";
    return makeRequest(url, {
      method: "GET",
    });
  },

  // Queue Management
  async getQueueDetails(queueName) {
    return makeRequest(`/api/v1/admin/jobs/queues/${queueName}`, {
      method: "GET",
    });
  },

  async getQueueJobs(queueName, { state, limit } = {}) {
    const params = new URLSearchParams();
    if (state) params.append("state", state);
    if (limit) params.append("limit", String(limit));

    const url = `/api/v1/admin/jobs/queues/${queueName}/jobs${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    return makeRequest(url, {
      method: "GET",
    });
  },

  async getJobDetails(queueName, jobId) {
    return makeRequest(`/api/v1/admin/jobs/queues/${queueName}/jobs/${jobId}`, {
      method: "GET",
    });
  },

  // Renewals Job Settings
  async getRenewalsSettings() {
    return makeRequest("/api/v1/admin/jobs/renewals", {
      method: "GET",
    });
  },

  async updateRenewalsSettings(data) {
    return makeRequest("/api/v1/admin/jobs/renewals", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async reloadRenewalsCron() {
    return makeRequest("/api/v1/admin/jobs/renewals/reload", {
      method: "POST",
    });
  },

  // Data Cleanup Job
  async getDataCleanupStatus() {
    return makeRequest("/api/v1/admin/jobs/data-cleanup", {
      method: "GET",
    });
  },

  async getDataCleanupHistory(limit = 10) {
    const url = limit
      ? `/api/v1/admin/jobs/data-cleanup/history?limit=${limit}`
      : "/api/v1/admin/jobs/data-cleanup/history";
    return makeRequest(url, {
      method: "GET",
    });
  },

  async triggerDataCleanup() {
    return makeRequest("/api/v1/admin/jobs/data-cleanup/run", {
      method: "POST",
    });
  },
};

