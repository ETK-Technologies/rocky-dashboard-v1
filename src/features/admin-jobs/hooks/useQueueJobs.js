"use client";

import { useState, useEffect, useCallback } from "react";
import { adminJobsService } from "../services/adminJobsService";
import { toast } from "react-toastify";

/**
 * Hook for fetching and managing queue jobs
 * @param {string} queueName - Queue name (e.g., 'renewals', 'product-import')
 * @param {Object} options - Options object
 * @param {boolean} options.autoFetch - Whether to fetch on mount (default: true)
 * @param {string} options.state - Job state filter (optional)
 * @param {number} options.limit - Number of jobs to fetch (default: 50)
 * @returns {Object} Queue jobs state and methods
 */
export function useQueueJobs(queueName, { autoFetch = true, state, limit = 50 } = {}) {
  const [queue, setQueue] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);

  /**
   * Fetch queue details
   */
  const fetchQueueDetails = useCallback(async () => {
    if (!queueName) return;

    try {
      const data = await adminJobsService.getQueueDetails(queueName);
      setQueue(data);
    } catch (err) {
      console.error("Error fetching queue details:", err);
      throw err;
    }
  }, [queueName]);

  /**
   * Fetch queue jobs
   * @param {Object} options - Override options (optional)
   */
  const fetchQueueJobs = useCallback(async (options = {}) => {
    if (!queueName) return;

    const filterState = options.state !== undefined ? options.state : state;
    const filterLimit = options.limit !== undefined ? options.limit : limit;

    setLoading(true);
    setError(null);

    try {
      const data = await adminJobsService.getQueueJobs(queueName, {
        state: filterState,
        limit: filterLimit,
      });
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage =
        err?.message || "Failed to load queue jobs. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error fetching queue jobs:", err);
    } finally {
      setLoading(false);
    }
  }, [queueName, state, limit]);

  /**
   * Fetch job details
   */
  const fetchJobDetails = useCallback(
    async (jobId) => {
      if (!queueName || !jobId) return null;

      try {
        const job = await adminJobsService.getJobDetails(queueName, jobId);
        // Update job in jobs list if it exists
        setJobs((prev) => prev.map((j) => (j.id === jobId ? job : j)));
        return job;
      } catch (err) {
        console.error("Error fetching job details:", err);
        throw err;
      }
    },
    [queueName]
  );

  /**
   * Refresh both queue details and jobs
   */
  const refresh = useCallback(async () => {
    await Promise.all([fetchQueueDetails(), fetchQueueJobs()]);
  }, [fetchQueueDetails, fetchQueueJobs]);

  // Fetch data on mount if autoFetch is true
  useEffect(() => {
    if (autoFetch && queueName) {
      fetchQueueDetails();
      fetchQueueJobs();
    }
  }, [autoFetch, queueName, fetchQueueDetails, fetchQueueJobs]);

  return {
    queue,
    jobs,
    loading,
    error,
    fetchQueueDetails,
    fetchQueueJobs,
    fetchJobDetails,
    refresh,
  };
}

