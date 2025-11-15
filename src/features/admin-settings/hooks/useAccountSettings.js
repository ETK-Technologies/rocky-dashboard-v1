"use client";

import { useState, useCallback, useEffect } from "react";
import { adminSettingsService } from "../services/adminSettingsService";
import { toast } from "react-toastify";

/**
 * Hook for fetching and managing account & privacy settings
 * @param {boolean} autoFetch - Whether to fetch on mount (default: true)
 * @returns {Object} Account settings state and methods
 */
export function useAccountSettings(autoFetch = true) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await adminSettingsService.getAccountSettings();
      setSettings(data);
    } catch (err) {
      const errorMessage =
        err?.message || "Failed to load account settings. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error fetching account settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (data) => {
    setSaving(true);
    setError(null);

    try {
      const updated = await adminSettingsService.updateAccountSettings(data);
      setSettings(updated);
      toast.success("Account settings updated successfully");
      return updated;
    } catch (err) {
      const errorMessage =
        err?.message || "Failed to update account settings. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error updating account settings:", err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

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

