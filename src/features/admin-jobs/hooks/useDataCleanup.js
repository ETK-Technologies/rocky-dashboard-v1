"use client";

import { useState, useEffect, useCallback } from "react";
import { adminJobsService } from "../services/adminJobsService";
import { toast } from "react-toastify";

/**
 * Hook for fetching and managing data cleanup job
 * @param {boolean} autoFetch - Whether to fetch on mount (default: true)
 * @param {number} historyLimit - Number of history items to fetch (default: 10)
 * @returns {Object} Data cleanup state and methods
 */
export function useDataCleanup(autoFetch = true, historyLimit = 10) {
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(autoFetch);
  const [historyLoading, setHistoryLoading] = useState(autoFetch);
  const [error, setError] = useState(null);
  const [running, setRunning] = useState(false);

  /**
   * Fetch data cleanup status
   */
  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await adminJobsService.getDataCleanupStatus();
      setStatus(data);
    } catch (err) {
      const errorMessage =
        err?.message || "Failed to load data cleanup status. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error fetching data cleanup status:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch data cleanup history
   */
  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);

    try {
      const data = await adminJobsService.getDataCleanupHistory(historyLimit);
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching data cleanup history:", err);
      // Don't show toast for history errors, just log
    } finally {
      setHistoryLoading(false);
    }
  }, [historyLimit]);

  /**
   * Trigger data cleanup manually
   */
  const triggerCleanup = useCallback(async () => {
    setRunning(true);
    setError(null);

    try {
      const result = await adminJobsService.triggerDataCleanup();
      toast.success(
        result.message || "Data cleanup job completed successfully"
      );
      // Refresh status and history after cleanup
      await Promise.all([fetchStatus(), fetchHistory()]);
      return result;
    } catch (err) {
      const errorMessage =
        err?.message || "Failed to run data cleanup. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error triggering data cleanup:", err);
      throw err;
    } finally {
      setRunning(false);
    }
  }, [fetchStatus, fetchHistory]);

  /**
   * Refresh both status and history
   */
  const refresh = useCallback(async () => {
    await Promise.all([fetchStatus(), fetchHistory()]);
  }, [fetchStatus, fetchHistory]);

  // Fetch data on mount if autoFetch is true
  useEffect(() => {
    if (autoFetch) {
      fetchStatus();
      fetchHistory();
    }
  }, [autoFetch, fetchStatus, fetchHistory]);

  return {
    status,
    history,
    loading,
    historyLoading,
    error,
    running,
    fetchStatus,
    fetchHistory,
    triggerCleanup,
    refresh,
  };
}

