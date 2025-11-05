"use client";

import { useAnalytics } from "./useAnalytics";

/**
 * Hook for sales by period (time-series) analytics
 * @param {Object} params - Query parameters
 * @param {boolean} autoFetch - Whether to fetch on mount (default: true)
 * @returns {Object} Analytics state and methods
 */
export function useSalesPeriodAnalytics(params = {}, autoFetch = true) {
  return useAnalytics({
    endpoint: "sales/period",
    params,
    autoFetch,
  });
}
