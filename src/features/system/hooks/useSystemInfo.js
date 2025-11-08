"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { systemService } from "../services/systemService";

/**
 * Fetches and manages system info metrics.
 * @param {boolean} autoFetch Whether to automatically fetch on mount.
 */
export function useSystemInfo(autoFetch = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);

  const fetchInfo = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await systemService.getInfo();
      setData(response);
    } catch (err) {
      const message =
        err?.message || "Failed to load system metrics. Please try again.";
      setError(message);
      toast.error(message);
      console.error("Error fetching system info:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchInfo();
    }
  }, [autoFetch, fetchInfo]);

  return {
    data,
    loading,
    error,
    refresh: fetchInfo,
  };
}


