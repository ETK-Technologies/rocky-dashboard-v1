"use client";

import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { uploadService } from "../services/uploadService";

export function useUploads() {
  const [uploads, setUploads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [settings, setSettings] = useState(null);

  /**
   * Upload files
   */
  const uploadFiles = useCallback(async (files) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await uploadService.uploadFiles(files);
      if (response.success && response.files) {
        toast.success(response.message || "Files uploaded successfully");
        return response.files;
      }
      throw new Error(response.message || "Upload failed");
    } catch (err) {
      const message = err?.message || "Failed to upload files";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch uploads with filters
   */
  const fetchUploads = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await uploadService.getUploads(params);
      if (response.data) {
        setUploads(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else if (Array.isArray(response)) {
        setUploads(response);
      } else {
        setUploads([]);
      }
    } catch (err) {
      const message = err?.message || "Failed to fetch uploads";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Delete an upload
   */
  const deleteUpload = useCallback(
    async (id) => {
      setIsLoading(true);
      setError(null);
      try {
        await uploadService.deleteUpload(id);
        toast.success("File deleted successfully");
        await fetchUploads();
        return true;
      } catch (err) {
        const message = err?.message || "Failed to delete file";
        setError(message);
        toast.error(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchUploads]
  );

  /**
   * Fetch upload settings
   */
  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const settings = await uploadService.getUploadSettings();
      setSettings(settings);
      return settings;
    } catch (err) {
      const message = err?.message || "Failed to fetch settings";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update upload settings (Super Admin only)
   */
  const updateSettings = useCallback(async (newSettings) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await uploadService.updateUploadSettings(newSettings);
      setSettings(updated);
      toast.success("Settings updated successfully");
      return updated;
    } catch (err) {
      const message = err?.message || "Failed to update settings";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    uploads,
    isLoading,
    error,
    pagination,
    settings,
    uploadFiles,
    fetchUploads,
    deleteUpload,
    fetchSettings,
    updateSettings,
  };
}
