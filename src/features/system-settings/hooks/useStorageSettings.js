"use client";

import { useCallback, useEffect, useState } from "react";
import { storageService } from "../services/storageService";
import { toast } from "react-toastify";

/**
 * Hook for fetching and managing storage settings
 * @returns {Object} Settings state and methods
 */
export function useStorageSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  /**
   * Fetch current storage settings (GET)
   */
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await storageService.getSettings();
      setSettings(response);
      return response;
    } catch (err) {
      const message = err.message || "Failed to fetch storage settings";
      setError(message);
      setSettings(null);
      toast.error(message);
      console.error("Error fetching storage settings:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update storage settings (PUT)
   * @param {Object} data - Settings to update
   */
  const updateSettings = useCallback(async (data) => {
    setSaving(true);
    setError(null);

    try {
      const response = await storageService.updateSettings(data);

      if (response) {
        toast.success("Storage settings updated successfully");
        // Refresh settings from server to ensure consistency
        const refreshedSettings = await fetchSettings();
        return refreshedSettings;
      }
    } catch (err) {
      const message = err.message || "Failed to update storage settings";
      setError(message);
      toast.error(message);
      console.error("Error updating storage settings:", err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [fetchSettings]);

  /**
   * Test storage connection (POST)
   * @param {Object} data - Settings to test (optional)
   */
  const testConnection = useCallback(async (data) => {
    setTesting(true);
    setError(null);

    try {
      const response = await storageService.testConnection(data || settings);

      if (response.success) {
        toast.success("Storage connection test successful");
      } else {
        toast.error(response.message || "Storage connection test failed");
      }
      return response;
    } catch (err) {
      const message = err.message || "Failed to test storage connection";
      setError(message);
      toast.error(message);
      console.error("Error testing storage connection:", err);
      throw err;
    } finally {
      setTesting(false);
    }
  }, [settings]);

  /**
   * Fetch debug information (GET)
   */
  const fetchDebugInfo = useCallback(async () => {
    try {
      const response = await storageService.getDebugInfo();
      setDebugInfo(response);
      return response;
    } catch (err) {
      const message = err.message || "Failed to fetch debug information";
      toast.error(message);
      console.error("Error fetching debug information:", err);
      throw err;
    }
  }, []);

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    saving,
    testing,
    debugInfo,
    fetchSettings,
    updateSettings,
    testConnection,
    fetchDebugInfo,
  };
}

