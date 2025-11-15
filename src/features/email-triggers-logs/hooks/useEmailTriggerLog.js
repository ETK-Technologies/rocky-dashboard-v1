"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { activityService } from "@/features/activity/services/activityService";

const normaliseActivity = (payload) => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  if (payload.data && typeof payload.data === "object") {
    return payload.data;
  }

  if (payload.activity && typeof payload.activity === "object") {
    return payload.activity;
  }

  return payload;
};

/**
 * Hook to fetch a single email trigger log by ID
 * Uses the activity service since email trigger logs are part of activity logs
 */
export function useEmailTriggerLog(activityId) {
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActivity = useCallback(async (id) => {
    if (!id) {
      setActivity(null);
      setError("Activity ID is required.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await activityService.getActivityById(id);
      const detail = normaliseActivity(response) || { id };
      setActivity(detail);
    } catch (err) {
      const message =
        err?.message || "Failed to load email trigger log. Please try again later.";
      setError(message);
      setActivity(null);
      toast.error(message);
      console.error("Error fetching email trigger log:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!activityId) {
      setActivity(null);
      setLoading(false);
      setError("Activity ID is required.");
      return;
    }

    fetchActivity(activityId);
  }, [activityId, fetchActivity]);

  return {
    activity,
    loading,
    error,
    refresh: () => fetchActivity(activityId),
  };
}

