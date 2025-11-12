"use client";

import { useCallback, useEffect, useState } from "react";
import { subscriptionService } from "../services/subscriptionService";
import { toast } from "react-toastify";

/**
 * Hook for fetching and managing a single subscription
 * @param {string} subscriptionId - Subscription identifier
 * @returns {Object} Subscription state and action handlers
 */
export function useSubscriptionDetails(subscriptionId) {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [canceling, setCanceling] = useState(false);
  const [pausing, setPausing] = useState(false);
  const [resuming, setResuming] = useState(false);
  const [importing, setImporting] = useState(false);

  const fetchSubscription = useCallback(async () => {
    if (!subscriptionId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await subscriptionService.getById(subscriptionId);
      const subscriptionData =
        response?.subscription ??
        response?.data ??
        response?.result ??
        response?.payload ??
        response;

      setSubscription(subscriptionData);
    } catch (err) {
      const message = err.message || "Failed to load subscription";
      setError(message);
      toast.error(message);
      console.error("Error loading subscription:", err);
    } finally {
      setLoading(false);
    }
  }, [subscriptionId]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const cancel = useCallback(
    async (reason) => {
      if (!subscriptionId) return;
      setCanceling(true);

      try {
        await subscriptionService.cancel(subscriptionId, reason ? { reason } : {});
        toast.success("Subscription cancelled successfully");
        await fetchSubscription();
      } catch (err) {
        toast.error(err.message || "Failed to cancel subscription");
        console.error("Error canceling subscription:", err);
        throw err;
      } finally {
        setCanceling(false);
      }
    },
    [subscriptionId, fetchSubscription]
  );

  const pause = useCallback(
    async () => {
      if (!subscriptionId) return;
      setPausing(true);

      try {
        await subscriptionService.pause(subscriptionId);
        toast.success("Subscription paused successfully");
        await fetchSubscription();
      } catch (err) {
        toast.error(err.message || "Failed to pause subscription");
        console.error("Error pausing subscription:", err);
        throw err;
      } finally {
        setPausing(false);
      }
    },
    [subscriptionId, fetchSubscription]
  );

  const resume = useCallback(
    async () => {
      if (!subscriptionId) return;
      setResuming(true);

      try {
        await subscriptionService.resume(subscriptionId);
        toast.success("Subscription resumed successfully");
        await fetchSubscription();
      } catch (err) {
        toast.error(err.message || "Failed to resume subscription");
        console.error("Error resuming subscription:", err);
        throw err;
      } finally {
        setResuming(false);
      }
    },
    [subscriptionId, fetchSubscription]
  );

  const importSubscription = useCallback(
    async (data) => {
      setImporting(true);

      try {
        const response = await subscriptionService.importSubscription(data);
        toast.success("Subscription imported successfully");
        return response;
      } catch (err) {
        toast.error(err.message || "Failed to import subscription");
        console.error("Error importing subscription:", err);
        throw err;
      } finally {
        setImporting(false);
      }
    },
    []
  );

  return {
    subscription,
    loading,
    error,
    refresh: fetchSubscription,
    cancel,
    canceling,
    pause,
    pausing,
    resume,
    resuming,
    importSubscription,
    importing,
  };
}

