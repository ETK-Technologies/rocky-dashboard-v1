"use client";

import { useState, useCallback, useEffect } from "react";
import { adminSettingsService } from "../services/adminSettingsService";
import { toast } from "react-toastify";

export function usePaymentSettings(autoFetch = true) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminSettingsService.getPaymentSettings();
      setSettings(data);
    } catch (err) {
      const errorMessage =
        err?.message || "Failed to load payment settings. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error fetching payment settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateGatewaySettings = useCallback(async (data) => {
    setSaving(true);
    setError(null);
    try {
      const updated = await adminSettingsService.updatePaymentGatewaySettings(data);
      setSettings(updated);
      toast.success("Payment gateway settings updated successfully");
      return updated;
    } catch (err) {
      const errorMessage =
        err?.message || "Failed to update payment settings. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error updating payment settings:", err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const updateCurrencySettings = useCallback(async (data) => {
    setSaving(true);
    setError(null);
    try {
      const updated = await adminSettingsService.updatePaymentCurrencySettings(data);
      setSettings(updated);
      toast.success("Currency settings updated successfully");
      return updated;
    } catch (err) {
      const errorMessage =
        err?.message || "Failed to update currency settings. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error updating currency settings:", err);
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
    updateGatewaySettings,
    updateCurrencySettings,
  };
}

