"use client";

import { useState, useCallback, useEffect } from "react";
import { analyticsService } from "../services/analyticsService";
import { toast } from "react-toastify";

/**
 * Hook for analytics data fetching
 * @param {Object} options - Hook options
 * @param {string} [options.endpoint] - Analytics endpoint to use (overview, sales, sales/period, products, customers, subscriptions, coupons)
 * @param {Object} [options.params] - Query parameters
 * @param {boolean} [options.autoFetch] - Whether to fetch on mount (default: true)
 * @returns {Object} Analytics state and methods
 */
export function useAnalytics(options = {}) {
  const { endpoint = "overview", params = {}, autoFetch = true } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);
  const [queryParams, setQueryParams] = useState({
    startDate: params.startDate,
    endDate: params.endDate,
    groupBy: params.groupBy || "day",
  });

  /**
   * Fetch analytics data
   */
  const fetchData = useCallback(
    async (newParams = {}) => {
      const mergedParams = { ...queryParams, ...newParams };
      setLoading(true);
      setError(null);

      try {
        let response;

        switch (endpoint) {
          case "overview":
            response = await analyticsService.getOverview(mergedParams);
            break;
          case "sales":
            response = await analyticsService.getSales(mergedParams);
            break;
          case "sales/period":
          case "salesPeriod":
            response = await analyticsService.getSalesByPeriod(mergedParams);
            break;
          case "products":
            response = await analyticsService.getProducts(mergedParams);
            break;
          case "customers":
            response = await analyticsService.getCustomers(mergedParams);
            break;
          case "subscriptions":
            response = await analyticsService.getSubscriptions(mergedParams);
            break;
          case "coupons":
            response = await analyticsService.getCoupons(mergedParams);
            break;
          default:
            throw new Error(`Unknown analytics endpoint: ${endpoint}`);
        }

        setData(response);
        setQueryParams(mergedParams);
        return response;
      } catch (err) {
        const errorMessage =
          err.message || `Failed to fetch ${endpoint} analytics`;
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
    },
    [endpoint, queryParams]
  );

  /**
   * Update query parameters
   * @param {Object} newParams - New query parameters
   */
  const updateParams = useCallback((newParams) => {
    setQueryParams((prev) => ({
      ...prev,
      ...newParams,
    }));
  }, []);

  /**
   * Refresh analytics data
   */
  const refresh = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data,
    loading,
    error,
    queryParams,
    fetchData,
    updateParams,
    refresh,
  };
}
