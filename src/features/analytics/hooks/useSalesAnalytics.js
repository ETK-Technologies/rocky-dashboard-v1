"use client";

import { useAnalytics } from "./useAnalytics";

/**
 * Hook for sales analytics
 * @param {Object} params - Query parameters
 * @param {boolean} autoFetch - Whether to fetch on mount (default: true)
 * @returns {Object} Analytics state and methods
 */
export function useSalesAnalytics(params = {}, autoFetch = true) {
  return useAnalytics({
    endpoint: "sales",
    params,
    autoFetch,
  });
}
