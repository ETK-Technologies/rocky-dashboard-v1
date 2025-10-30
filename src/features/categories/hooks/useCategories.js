"use client";

import { useState, useEffect, useCallback } from "react";
import { categoryService } from "../services/categoryService";
import { toast } from "react-toastify";

/**
 * Hook for fetching and managing categories list
 * @returns {Object} Categories state and methods
 */
export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch all categories
   */
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await categoryService.getAll();
      setCategories(data.data || data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch categories");
      toast.error(err.message || "Failed to fetch categories");
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete a category
   * @param {string|number} id - Category ID
   */
  const deleteCategory = useCallback(
    async (id) => {
      try {
        await categoryService.delete(id);
        toast.success("Category deleted successfully");
        // Refresh categories list
        await fetchCategories();
      } catch (err) {
        toast.error(err.message || "Failed to delete category");
        console.error("Error deleting category:", err);
        throw err;
      }
    },
    [fetchCategories]
  );

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    deleteCategory,
  };
}
