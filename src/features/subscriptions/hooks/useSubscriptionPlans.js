"use client";

import { useCallback, useEffect, useState } from "react";
import { subscriptionPlanService } from "../services/subscriptionPlanService";
import { toast } from "react-toastify";

/**
 * Hook for fetching and managing subscription plans
 * @returns {Object} Plans state and helpers
 */
export function useSubscriptionPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await subscriptionPlanService.getAll();
      const plansList =
        response?.plans ??
        response?.data ??
        (Array.isArray(response) ? response : []);

      setPlans(Array.isArray(plansList) ? plansList : []);
    } catch (err) {
      const message = err.message || "Failed to fetch subscription plans";
      setError(message);
      setPlans([]);
      toast.error(message);
      console.error("Error fetching subscription plans:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPlan = useCallback(async (data) => {
    try {
      const response = await subscriptionPlanService.create(data);
      toast.success("Subscription plan created successfully");
      await fetchPlans();
      return response;
    } catch (err) {
      toast.error(err.message || "Failed to create subscription plan");
      console.error("Error creating subscription plan:", err);
      throw err;
    }
  }, [fetchPlans]);

  const updatePlan = useCallback(async (id, data) => {
    try {
      const response = await subscriptionPlanService.update(id, data);
      toast.success("Subscription plan updated successfully");
      await fetchPlans();
      return response;
    } catch (err) {
      toast.error(err.message || "Failed to update subscription plan");
      console.error("Error updating subscription plan:", err);
      throw err;
    }
  }, [fetchPlans]);

  const deletePlan = useCallback(async (id) => {
    try {
      await subscriptionPlanService.delete(id);
      toast.success("Subscription plan deleted successfully");
      await fetchPlans();
    } catch (err) {
      toast.error(err.message || "Failed to delete subscription plan");
      console.error("Error deleting subscription plan:", err);
      throw err;
    }
  }, [fetchPlans]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return {
    plans,
    loading,
    error,
    refresh: fetchPlans,
    createPlan,
    updatePlan,
    deletePlan,
  };
}

