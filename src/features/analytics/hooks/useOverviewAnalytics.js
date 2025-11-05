"use client";

import { useAnalytics } from "./useAnalytics";

/**
 * Hook for dashboard overview analytics
 * @param {Object} params - Query parameters
 * @param {boolean} autoFetch - Whether to fetch on mount (default: true)
 * @returns {Object} Analytics state and methods
 */
export function useOverviewAnalytics(params = {}, autoFetch = true) {
  return useAnalytics({
    endpoint: "overview",
    params,
    autoFetch,
  });
}
