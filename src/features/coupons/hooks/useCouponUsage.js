"use client";

import { useState, useCallback } from "react";
import { couponService } from "../services/couponService";
import { toast } from "react-toastify";

/**
 * Hook for fetching coupon usage statistics
 * @param {string} id - Coupon ID
 * @returns {Object} Usage statistics state and methods
 */
export function useCouponUsage(id) {
  const [usageStats, setUsageStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch coupon usage statistics
   */
  const fetchUsageStats = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const stats = await couponService.getUsageStats(id);
      setUsageStats(stats);
      return stats;
    } catch (err) {
      const errorMessage = err.message || "Failed to fetch usage statistics";
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
  }, [id]);

  return {
    usageStats,
    loading,
    error,
    fetchUsageStats,
  };
}

