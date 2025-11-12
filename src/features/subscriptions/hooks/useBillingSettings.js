"use client";

import { useCallback, useEffect, useState } from "react";
import { billingSettingsService } from "../services/billingSettingsService";
import { toast } from "react-toastify";

/**
 * Hook for fetching and managing billing settings
 * @returns {Object} Settings state and helpers
 */
export function useBillingSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await billingSettingsService.get();
      const settingsData =
        response?.settings ??
        response?.data ??
        response ??
        {};

      setSettings(settingsData);
    } catch (err) {
      const message = err.message || "Failed to fetch billing settings";
      setError(message);
      setSettings(null);
      toast.error(message);
      console.error("Error fetching billing settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (data) => {
    setSaving(true);
    try {
      const response = await billingSettingsService.update(data);
      const updatedSettings =
        response?.settings ??
        response?.data ??
        response ??
        {};

      setSettings(updatedSettings);
      toast.success("Billing settings updated successfully");
      return updatedSettings;
    } catch (err) {
      toast.error(err.message || "Failed to update billing settings");
      console.error("Error updating billing settings:", err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    saving,
    refresh: fetchSettings,
    updateSettings,
  };
}

