"use client";

import { useState, useCallback, useEffect } from "react";
import { adminSettingsService } from "../services/adminSettingsService";
import { toast } from "react-toastify";

export function useTaxSettings(autoFetch = true) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminSettingsService.getTaxSettings();
      setSettings(data);
    } catch (err) {
      const errorMessage =
        err?.message || "Failed to load tax settings. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error fetching tax settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (data) => {
    setSaving(true);
    setError(null);
    try {
      const updated = await adminSettingsService.updateTaxSettings(data);
      setSettings(updated);
      toast.success("Tax settings updated successfully");
      return updated;
    } catch (err) {
      const errorMessage =
        err?.message || "Failed to update tax settings. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error updating tax settings:", err);
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

