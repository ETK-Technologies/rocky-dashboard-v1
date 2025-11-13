"use client";

import { useCallback, useEffect, useState } from "react";
import { renewalsJobService } from "../services/renewalsJobService";
import { toast } from "react-toastify";

/**
 * Hook for fetching and managing renewals job settings
 * @returns {Object} Settings state and methods
 */
export function useRenewalsJobSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [reloading, setReloading] = useState(false);

  /**
   * Fetch current renewals job settings (GET)
   */
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await renewalsJobService.getSettings();
      setSettings(response);
      return response;
    } catch (err) {
      const message = err.message || "Failed to fetch renewals job settings";
      setError(message);
      setSettings(null);
      toast.error(message);
      console.error("Error fetching renewals job settings:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update renewals job settings (PUT)
   * @param {Object} data - Settings to update { cron, concurrency }
   */
  const updateSettings = useCallback(
    async (data) => {
      setSaving(true);
      setError(null);

      try {
        // Validate cron expression
        if (!data.cron || data.cron.trim() === "") {
          const errorMsg = "Cron expression is required";
          toast.error(errorMsg);
          throw new Error(errorMsg);
        }

        // Validate concurrency
        const concurrency = Number(data.concurrency);
        const minConcurrency = settings?.minConcurrency || 1;
        const maxConcurrency = settings?.maxConcurrency || 50;

        if (
          isNaN(concurrency) ||
          concurrency < minConcurrency ||
          concurrency > maxConcurrency
        ) {
          const errorMsg = `Concurrency must be between ${minConcurrency} and ${maxConcurrency}`;
          toast.error(errorMsg);
          throw new Error(errorMsg);
        }

        const response = await renewalsJobService.updateSettings({
          cron: data.cron.trim(),
          concurrency: concurrency,
        });

        if (response.success) {
          toast.success("Settings updated successfully");
          // Refresh settings from server to ensure consistency
          const refreshedSettings = await fetchSettings();
          return refreshedSettings;
        }
      } catch (err) {
        const message = err.message || "Failed to update settings";
        setError(message);
        toast.error(message);
        console.error("Error updating renewals job settings:", err);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [settings]
  );

  /**
   * Reload renewals cron expression from settings (POST)
   */
  const reloadCron = useCallback(async () => {
    setReloading(true);
    setError(null);

    try {
      const response = await renewalsJobService.reloadCron();

      if (response.success) {
        toast.success("Cron expression reloaded successfully");
        // Refresh settings to get latest values
        await fetchSettings();
        return response;
      }
    } catch (err) {
      const message = err.message || "Failed to reload cron expression";
      setError(message);
      toast.error(message);
      console.error("Error reloading cron expression:", err);
      throw err;
    } finally {
      setReloading(false);
    }
  }, [fetchSettings]);

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

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
