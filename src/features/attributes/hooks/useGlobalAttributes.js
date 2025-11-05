"use client";

import { useState, useEffect, useCallback } from "react";
import { globalAttributeService } from "../services/globalAttributeService";
import { toast } from "react-toastify";

/**
 * Hook for fetching and managing global attributes
 * @param {Object} options - Options object
 * @param {string} [options.search] - Initial search term
 * @param {boolean} [options.autoFetch] - Whether to fetch on mount (default: true)
 * @returns {Object} Global attributes state and methods
 */
export function useGlobalAttributes(options = {}) {
  const { search: initialSearch = "", autoFetch = true } = options;

  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState(initialSearch);

  /**
   * Fetch global attributes
   */
  const fetchAttributes = useCallback(
    async (searchTerm = search) => {
      setLoading(true);
      setError(null);

      try {
        const data = await globalAttributeService.getAll({
          search: searchTerm || undefined,
        });

        // Normalize response
        const attributesList = Array.isArray(data)
          ? data
          : data?.data || data?.attributes || [];

        setAttributes(attributesList);
      } catch (err) {
        const errorMessage = err.message || "Failed to load global attributes";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [search]
  );

  /**
   * Create a new global attribute
   */
  const createAttribute = useCallback(async (attributeData) => {
    setLoading(true);
    setError(null);

    try {
      const newAttribute = await globalAttributeService.create(attributeData);
      setAttributes((prev) => [...prev, newAttribute]);
      toast.success("Global attribute created successfully");
      return newAttribute;
    } catch (err) {
      const errorMessage = err.message || "Failed to create global attribute";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update a global attribute
   */
  const updateAttribute = useCallback(async (id, attributeData) => {
    setLoading(true);
    setError(null);

    try {
      const updatedAttribute = await globalAttributeService.update(
        id,
        attributeData
      );
      setAttributes((prev) =>
        prev.map((attr) => (attr.id === id ? updatedAttribute : attr))
      );
      toast.success("Global attribute updated successfully");
      return updatedAttribute;
    } catch (err) {
      const errorMessage = err.message || "Failed to update global attribute";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete a global attribute
   */
  const deleteAttribute = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await globalAttributeService.delete(id);
      setAttributes((prev) => prev.filter((attr) => attr.id !== id));
      toast.success("Global attribute deleted successfully");
    } catch (err) {
      const errorMessage = err.message || "Failed to delete global attribute";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount if autoFetch is true
  useEffect(() => {
    if (autoFetch) {
      fetchAttributes();
    }
  }, [autoFetch]); // Only run on mount

  // Refetch when search changes (debounced)
  useEffect(() => {
    if (autoFetch) {
      const timeoutId = setTimeout(() => {
        fetchAttributes(search);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [search, autoFetch, fetchAttributes]);

  return {
    attributes,
    loading,
    error,
    search,
    setSearch,
    fetchAttributes,
    createAttribute,
    updateAttribute,
    deleteAttribute,
    refetch: () => fetchAttributes(search),
  };
}
