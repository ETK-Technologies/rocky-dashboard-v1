"use client";

import { useState, useEffect, useCallback } from "react";
import { emailTemplateService } from "../services/emailTemplateService";
import { toast } from "react-toastify";

/**
 * Hook for fetching and managing email templates list
 * @param {Object} initialFilters - Initial filter values
 * @returns {Object} Templates state and methods
 */
export function useEmailTemplates(initialFilters = {}) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    scope: "",
    ...initialFilters,
  });

  /**
   * Fetch templates
   */
  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (filters.scope) {
        params.scope = filters.scope;
      }

      const data = await emailTemplateService.getAll(params);
      setTemplates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching templates:", err);
      setError(err?.message || "Failed to fetch templates");
      toast.error("Failed to load email templates");
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Delete a template
   */
  const deleteTemplate = useCallback(
    async (id) => {
      try {
        await emailTemplateService.delete(id);
        toast.success("Template deleted successfully");
        // Refresh the list
        await fetchTemplates();
      } catch (err) {
        console.error("Error deleting template:", err);
        toast.error(err?.message || "Failed to delete template");
        throw err;
      }
    },
    [fetchTemplates]
  );

  /**
   * Update filters
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Fetch templates when filters change
  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    loading,
    error,
    deleteTemplate,
    updateFilters,
    filters,
    refetch: fetchTemplates,
  };
}
