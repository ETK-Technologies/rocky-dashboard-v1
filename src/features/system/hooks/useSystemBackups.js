"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { systemService } from "../services/systemService";

const normalizeResponse = (response) => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.backups)) return response.backups;
  if (Array.isArray(response.data?.backups)) return response.data.backups;
  return [];
};

export function useSystemBackups(autoFetch = true) {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);

  const fetchBackups = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await systemService.getBackups();
      setBackups(normalizeResponse(response));
    } catch (err) {
      const message =
        err?.message || "Failed to load backups. Please try again.";
      setError(message);
      toast.error(message);
      console.error("Error fetching system backups:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createBackup = useCallback(async () => {
    setCreating(true);
    try {
      const response = await systemService.createBackup();
      toast.success("Backup created successfully.");
      await fetchBackups();
      return response;
    } catch (err) {
      const message =
        err?.message || "Failed to create backup. Please try again.";
      toast.error(message);
      console.error("Error creating system backup:", err);
      throw err;
    } finally {
      setCreating(false);
    }
  }, [fetchBackups]);

  useEffect(() => {
    if (autoFetch) {
      fetchBackups();
    }
  }, [autoFetch, fetchBackups]);

  const hasBackups = useMemo(() => backups && backups.length > 0, [backups]);

  const downloadBackup = useCallback(
    (filename) => systemService.downloadBackup(filename),
    []
  );

  return {
    backups,
    loading,
    error,
    creating,
    hasBackups,
    refresh: fetchBackups,
    createBackup,
    downloadBackup,
  };
}
