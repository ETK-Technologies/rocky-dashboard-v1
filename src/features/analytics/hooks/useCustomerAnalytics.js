"use client";

import { useAnalytics } from "./useAnalytics";

/**
 * Hook for customer analytics
 * @param {Object} params - Query parameters
 * @param {boolean} autoFetch - Whether to fetch on mount (default: true)
 * @returns {Object} Analytics state and methods
 */
export function useCustomerAnalytics(params = {}, autoFetch = true) {
  return useAnalytics({
    endpoint: "customers",
    params,
    autoFetch,
  });
}
