"use client";

import { useAnalytics } from "./useAnalytics";

/**
 * Hook for product performance analytics
 * @param {Object} params - Query parameters
 * @param {boolean} autoFetch - Whether to fetch on mount (default: true)
 * @returns {Object} Analytics state and methods
 */
export function useProductAnalytics(params = {}, autoFetch = true) {
  return useAnalytics({
    endpoint: "products",
    params,
    autoFetch,
  });
}
