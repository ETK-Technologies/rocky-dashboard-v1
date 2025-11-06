"use client";

import { useAnalytics } from "./useAnalytics";

/**
 * Hook for subscription metrics analytics
 * @param {Object} params - Query parameters
 * @param {boolean} autoFetch - Whether to fetch on mount (default: true)
 * @returns {Object} Analytics state and methods
 */
export function useSubscriptionAnalytics(params = {}, autoFetch = true) {
  return useAnalytics({
    endpoint: "subscriptions",
    params,
    autoFetch,
  });
}
