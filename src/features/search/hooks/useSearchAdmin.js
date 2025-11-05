"use client";

import { useState, useCallback } from "react";
import { searchService } from "../services/searchService";
import { toast } from "react-toastify";

/**
 * Hook for admin search operations (reindex, stats)
 * @returns {Object} Admin search state and methods
 */
export function useSearchAdmin() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reindexing, setReindexing] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Get search index statistics
   */
  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await searchService.getStats();
      setStats(data);
      return data;
    } catch (err) {
      const errorMessage = err.message || "Failed to fetch search statistics";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Trigger reindex of all products
   */
  const triggerReindex = useCallback(async () => {
    setReindexing(true);
    setError(null);

    try {
      const data = await searchService.reindex();
      toast.success("Reindexing started successfully");
      return data;
    } catch (err) {
      const errorMessage = err.message || "Failed to start reindexing";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setReindexing(false);
    }
  }, []);

  return {
    stats,
    loading,
    reindexing,
    error,
    fetchStats,
    triggerReindex,
  };
}

