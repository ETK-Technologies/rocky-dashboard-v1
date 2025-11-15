"use client";

import { useState, useEffect, useCallback } from "react";
import { adminJobsService } from "../services/adminJobsService";
import { toast } from "react-toastify";

/**
 * Hook for fetching jobs overview
 * @param {boolean} autoFetch - Whether to fetch on mount (default: true)
 * @param {number} limit - Number of recent jobs to fetch (default: 20)
 * @returns {Object} Jobs overview state and methods
 */
export function useJobsOverview(autoFetch = true, limit = 20) {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);

  /**
   * Fetch jobs overview
   */
  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await adminJobsService.getJobsOverview(limit);
      setOverview(data);
    } catch (err) {
      const errorMessage =
        err?.message || "Failed to load jobs overview. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error fetching jobs overview:", err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  // Fetch overview on mount if autoFetch is true
  useEffect(() => {
    if (autoFetch) {
      fetchOverview();
    }
  }, [autoFetch, fetchOverview]);

  return {
    overview,
    loading,
    error,
    fetchOverview,
  };
}

