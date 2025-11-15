"use client";

import { useState, useEffect, useCallback } from "react";
import { adminJobsService } from "../services/adminJobsService";
import { toast } from "react-toastify";

/**
 * Hook for fetching and managing renewals job settings
 * @param {boolean} autoFetch - Whether to fetch on mount (default: true)
 * @returns {Object} Renewals settings state and methods
 */
export function useRenewalsSettings(autoFetch = true) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [reloading, setReloading] = useState(false);

  /**
   * Fetch renewals settings
   */
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await adminJobsService.getRenewalsSettings();
      setSettings(data);
    } catch (err) {
      const errorMessage =
        err?.message || "Failed to load renewals settings. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error fetching renewals settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update renewals settings
   * @param {Object} data - Settings data to update
   */
  const updateSettings = useCallback(async (data) => {
    setSaving(true);
    setError(null);

    try {
      const result = await adminJobsService.updateRenewalsSettings(data);
      // Refresh settings after update
      await fetchSettings();
      toast.success("Renewals settings updated successfully");
      return result;
    } catch (err) {
      const errorMessage =
        err?.message || "Failed to update renewals settings. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error updating renewals settings:", err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [fetchSettings]);

  /**
   * Reload renewals cron
   */
  const reloadCron = useCallback(async () => {
    setReloading(true);
    setError(null);

    try {
      await adminJobsService.reloadRenewalsCron();
      toast.success("Renewals cron reloaded successfully");
      // Refresh settings after reload
      await fetchSettings();
    } catch (err) {
      const errorMessage =
        err?.message || "Failed to reload renewals cron. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error reloading renewals cron:", err);
      throw err;
    } finally {
      setReloading(false);
    }
  }, [fetchSettings]);

  // Fetch settings on mount if autoFetch is true
  useEffect(() => {
    if (autoFetch) {
      fetchSettings();
    }
  }, [autoFetch, fetchSettings]);

  return {
    settings,
    loading,
    error,
    saving,
    reloading,
    fetchSettings,
    updateSettings,
    reloadCron,
  };
}

