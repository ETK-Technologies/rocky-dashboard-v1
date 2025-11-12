"use client";

import { useState, useCallback } from "react";
import { couponService } from "../services/couponService";
import { toast } from "react-toastify";

/**
 * Hook for managing a single coupon (get, update)
 * @param {string} id - Coupon ID
 * @returns {Object} Coupon state and methods
 */
export function useCoupon(id) {
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch coupon by ID
   */
  const fetchCoupon = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const data = await couponService.getById(id);
      setCoupon(data);
      return data;
    } catch (err) {
      const errorMessage = err.message || "Failed to fetch coupon";
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

  /**
   * Update coupon
   * @param {Object} data - Partial coupon data to update
   */
  const updateCoupon = useCallback(async (data) => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const updated = await couponService.update(id, data);
      setCoupon(updated);
      toast.success("Coupon updated successfully");
      return updated;
    } catch (err) {
      const errorMessage = err.message || "Failed to update coupon";
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
    coupon,
    loading,
    error,
    fetchCoupon,
    updateCoupon,
  };
}

