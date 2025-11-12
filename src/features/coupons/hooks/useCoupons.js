"use client";

import { useState, useCallback, useEffect } from "react";
import { couponService } from "../services/couponService";
import { toast } from "react-toastify";

/**
 * Hook for fetching and managing coupons
 * @param {Object} initialFilters - Initial filter values
 * @param {boolean} autoFetch - Whether to fetch on mount (default: true)
 * @returns {Object} Coupons state and methods
 */
export function useCoupons(initialFilters = {}, autoFetch = true) {
  const [coupons, setCoupons] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    ...initialFilters,
  });

  /**
   * Fetch coupons with current filters
   */
  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await couponService.getAll(filters);
      setCoupons(response.coupons || []);
      setPagination(
        response.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        }
      );
      return response;
    } catch (err) {
      const errorMessage = err.message || "Failed to fetch coupons";
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
   * Delete a coupon
   * @param {string} id - Coupon ID
   */
  const deleteCoupon = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);

      try {
        await couponService.delete(id);
        toast.success("Coupon deleted successfully");
        // Refresh the list after deletion
        await fetchCoupons();
        return true;
      } catch (err) {
        const errorMessage = err.message || "Failed to delete coupon";
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
    [fetchCoupons]
  );

  /**
   * Activate a coupon
   * @param {string} id - Coupon ID
   */
  const activateCoupon = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);

      try {
        await couponService.activate(id);
        toast.success("Coupon activated successfully");
        // Refresh the list after activation
        await fetchCoupons();
        return true;
      } catch (err) {
        const errorMessage = err.message || "Failed to activate coupon";
        const errorObj = {
          message: errorMessage,
          statusCode: err.statusCode || err.status || null,
        };
        setError(errorObj);

        if (errorObj.statusCode !== 401 && errorObj.statusCode !== 403) {
          toast.error(errorMessage);
        }

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchCoupons]
  );

  /**
   * Deactivate a coupon
   * @param {string} id - Coupon ID
   */
  const deactivateCoupon = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);

      try {
        await couponService.deactivate(id);
        toast.success("Coupon deactivated successfully");
        // Refresh the list after deactivation
        await fetchCoupons();
        return true;
      } catch (err) {
        const errorMessage = err.message || "Failed to deactivate coupon";
        const errorObj = {
          message: errorMessage,
          statusCode: err.statusCode || err.status || null,
        };
        setError(errorObj);

        if (errorObj.statusCode !== 401 && errorObj.statusCode !== 403) {
          toast.error(errorMessage);
        }

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchCoupons]
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
   * Refresh coupons list
   */
  const refresh = useCallback(() => {
    return fetchCoupons();
  }, [fetchCoupons]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchCoupons();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  return {
    coupons,
    pagination,
    loading,
    error,
    filters,
    fetchCoupons,
    deleteCoupon,
    activateCoupon,
    deactivateCoupon,
    updateFilters,
    changePage,
    changeLimit,
    refresh,
  };
}

