"use client";

import { useState, useCallback } from "react";
import { couponService } from "../services/couponService";
import { toast } from "react-toastify";

/**
 * Hook for creating and updating coupons
 * @param {Object} initialData - Initial form data
 * @param {Function} onSuccess - Callback when form is successfully submitted
 * @returns {Object} Form state and methods
 */
export function useCouponForm(initialData = null, onSuccess = null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Create a new coupon
   * @param {Object} data - Coupon data
   */
  const createCoupon = useCallback(
    async (data) => {
      setLoading(true);
      setError(null);

      try {
        const created = await couponService.create(data);
        toast.success("Coupon created successfully");
        if (onSuccess) {
          onSuccess(created);
        }
        return created;
      } catch (err) {
        const errorMessage = err.message || "Failed to create coupon";
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
    },
    [onSuccess]
  );

  /**
   * Update an existing coupon
   * @param {string} id - Coupon ID
   * @param {Object} data - Partial coupon data to update
   */
  const updateCoupon = useCallback(
    async (id, data) => {
      setLoading(true);
      setError(null);

      try {
        const updated = await couponService.update(id, data);
        toast.success("Coupon updated successfully");
        if (onSuccess) {
          onSuccess(updated);
        }
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
    },
    [onSuccess]
  );

  /**
   * Submit form (create or update)
   * @param {Object} data - Form data
   * @param {string} [id] - Coupon ID for update (if not provided, creates new)
   */
  const submitForm = useCallback(
    async (data, id = null) => {
      if (id) {
        return updateCoupon(id, data);
      } else {
        return createCoupon(data);
      }
    },
    [createCoupon, updateCoupon]
  );

  return {
    loading,
    error,
    createCoupon,
    updateCoupon,
    submitForm,
  };
}

