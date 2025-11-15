"use client";

import { useState, useCallback, useEffect } from "react";
import { adminSettingsService } from "../services/adminSettingsService";
import { toast } from "react-toastify";

export function useEmailSettings(autoFetch = true) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminSettingsService.getEmailSettings();
      setSettings(data);
    } catch (err) {
      const errorMessage =
        err?.message || "Failed to load email settings. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error fetching email settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (data) => {
    setSaving(true);
    setError(null);
    try {
      const updated = await adminSettingsService.updateEmailSettings(data);
      setSettings(updated);
      toast.success("Email settings updated successfully");
      return updated;
    } catch (err) {
      const errorMessage =
        err?.message || "Failed to update email settings. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error updating email settings:", err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const testSettings = useCallback(async (data) => {
    setTesting(true);
    setError(null);
    try {
      const result = await adminSettingsService.testEmailSettings(data);
      toast.success("Test email sent successfully");
      return result;
    } catch (err) {
      const errorMessage =
        err?.message || "Failed to send test email. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error sending test email:", err);
      throw err;
    } finally {
      setTesting(false);
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
    testing,
    fetchSettings,
    updateSettings,
    testSettings,
  };
}

