"use client";

import { useState, useCallback, useEffect } from "react";
import { cartService } from "../services/cartService";
import { toast } from "react-toastify";

/**
 * Hook for fetching and managing redundant carts
 * @param {Object} initialFilters - Initial filter values
 * @param {boolean} autoFetch - Whether to fetch on mount (default: true)
 * @returns {Object} Redundant carts state and methods
 */
export function useRedundantCarts(initialFilters = {}, autoFetch = true) {
  const [carts, setCarts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    filter: "all",
    ...initialFilters,
  });

  /**
   * Fetch redundant carts with current filters
   */
  const fetchCarts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await cartService.getRedundantCarts(filters);
      setCarts(response.carts || []);
      setPagination(
        response.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        }
      );
      return response;
    } catch (err) {
      const errorMessage = err.message || "Failed to fetch redundant carts";
      const errorObj = {
        message: errorMessage,
        statusCode: err.statusCode || err.status || null,
      };
      setError(errorObj);

      // Only show toast for non-401/403 errors (auth errors are handled elsewhere)
      if (errorObj.statusCode !== 401 && errorObj.statusCode !== 403) {
        toast.error(errorMessage);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Delete redundant carts with current filters
   */
  const deleteCarts = useCallback(
    async (deleteFilters = {}) => {
      const mergedFilters = { ...filters, ...deleteFilters };
      setLoading(true);
      setError(null);

      try {
        const response = await cartService.deleteRedundantCarts(mergedFilters);
        toast.success(
          response.message ||
            `Successfully deleted ${response.deleted || 0} cart(s)`
        );

        // Refresh the list after deletion
        await fetchCarts();

        return response;
      } catch (err) {
        const errorMessage = err.message || "Failed to delete redundant carts";
        const errorObj = {
          message: errorMessage,
          statusCode: err.statusCode || err.status || null,
        };
        setError(errorObj);

        // Only show toast for non-401/403 errors
        if (errorObj.statusCode !== 401 && errorObj.statusCode !== 403) {
          toast.error(errorMessage);
        }

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [filters, fetchCarts]
  );

  /**
   * Update filters
   * @param {Object} newFilters - New filter values
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      // Reset to page 1 when filters change (except page changes)
      ...(newFilters.page === undefined && { page: 1 }),
    }));
  }, []);

  /**
   * Change page
   * @param {number} page - Page number
   */
  const changePage = useCallback((page) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  }, []);

  /**
   * Change limit
   * @param {number} limit - Items per page
   */
  const changeLimit = useCallback((limit) => {
    setFilters((prev) => ({
      ...prev,
      limit,
      page: 1, // Reset to page 1 when limit changes
    }));
  }, []);

  /**
   * Refresh carts list
   */
  const refresh = useCallback(() => {
    return fetchCarts();
  }, [fetchCarts]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchCarts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  return {
    carts,
    pagination,
    loading,
    error,
    filters,
    fetchCarts,
    deleteCarts,
    updateFilters,
    changePage,
    changeLimit,
    refresh,
  };
}


