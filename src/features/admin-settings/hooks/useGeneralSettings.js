"use client";

import { useState, useCallback, useEffect } from "react";
import { adminSettingsService } from "../services/adminSettingsService";
import { toast } from "react-toastify";

/**
 * Hook for fetching and managing general settings
 * @param {boolean} autoFetch - Whether to fetch on mount (default: true)
 * @returns {Object} General settings state and methods
 */
export function useGeneralSettings(autoFetch = true) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  /**
   * Fetch general settings
   */
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await adminSettingsService.getGeneralSettings();
      setSettings(data);
    } catch (err) {
      const errorMessage =
        err?.message || "Failed to load general settings. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error fetching general settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update general settings
   * @param {Object} data - Settings data to update
   */
  const updateSettings = useCallback(async (data) => {
    setSaving(true);
    setError(null);

    try {
      const updated = await adminSettingsService.updateGeneralSettings(data);
      setSettings(updated);
      toast.success("General settings updated successfully");
      return updated;
    } catch (err) {
      const errorMessage =
        err?.message || "Failed to update general settings. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error updating general settings:", err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

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
    fetchSettings,
    updateSettings,
  };
}

