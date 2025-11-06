"use client";

import { useAnalytics } from "./useAnalytics";

/**
 * Hook for coupon analytics
 * @param {Object} params - Query parameters
 * @param {boolean} autoFetch - Whether to fetch on mount (default: true)
 * @returns {Object} Analytics state and methods
 */
export function useCouponAnalytics(params = {}, autoFetch = true) {
  return useAnalytics({
    endpoint: "coupons",
    params,
    autoFetch,
  });
}
