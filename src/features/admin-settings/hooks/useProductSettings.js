"use client";

import { useState, useCallback, useEffect } from "react";
import { adminSettingsService } from "../services/adminSettingsService";
import { toast } from "react-toastify";

export function useProductSettings(autoFetch = true) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminSettingsService.getProductSettings();
      setSettings(data);
    } catch (err) {
      const errorMessage =
        err?.message || "Failed to load product settings. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error fetching product settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDefaultSettings = useCallback(async (data) => {
    setSaving(true);
    setError(null);
    try {
      const updated = await adminSettingsService.updateProductDefaultSettings(data);
      setSettings(updated);
      toast.success("Product default settings updated successfully");
      return updated;
    } catch (err) {
      const errorMessage =
        err?.message || "Failed to update product settings. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error updating product settings:", err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const updateInventorySettings = useCallback(async (data) => {
    setSaving(true);
    setError(null);
    try {
      const updated = await adminSettingsService.updateProductInventorySettings(data);
      setSettings(updated);
      toast.success("Inventory settings updated successfully");
      return updated;
    } catch (err) {
      const errorMessage =
        err?.message || "Failed to update inventory settings. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error updating inventory settings:", err);
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
    updateDefaultSettings,
    updateInventorySettings,
  };
}

