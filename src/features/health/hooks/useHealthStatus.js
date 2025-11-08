"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { healthService } from "../services/healthService";

const createEmptyState = () => ({
  status: null,
  details: null,
  raw: null,
});

const HEALTHY_STATUSES = new Set([
  "ok",
  "pass",
  "passing",
  "healthy",
  "ready",
  "up",
  "alive",
  "success",
  "good",
]);

const UNHEALTHY_STATUSES = new Set([
  "fail",
  "failing",
  "failed",
  "error",
  "down",
  "unhealthy",
  "critical",
  "not_ready",
  "dead",
]);

/**
 * Normalise common health payload structures into a predictable shape
 * @param {unknown} payload
 * @returns {{status: string | null, details: Object | null, raw: unknown}}
 */
function normalisePayload(payload) {
  if (payload === true) {
    return {
      status: "healthy",
      details: { value: true },
      raw: payload,
    };
  }

  if (payload === false) {
    return {
      status: "unhealthy",
      details: { value: false },
      raw: payload,
    };
  }

  if (!payload || typeof payload !== "object") {
    return {
      status: null,
      details: null,
      raw: payload,
    };
  }

  const data = payload;

  let status =
    typeof data.status === "string"
      ? data.status
      : typeof data.state === "string"
      ? data.state
      : data?.data?.status ?? data?.data?.state ?? null;

  if (status === null || status === undefined) {
    if (typeof data.ready === "boolean") {
      status = data.ready ? "ready" : "not_ready";
    } else if (typeof data.live === "boolean") {
      status = data.live ? "alive" : "dead";
    } else if (typeof data.healthy === "boolean") {
      status = data.healthy ? "healthy" : "unhealthy";
    }
  } else if (typeof status !== "string") {
    status = String(status);
  }

  let details = null;
  if (data.details && typeof data.details === "object") {
    details = data.details;
  } else if (data.data && typeof data.data === "object") {
    details = data.data;
  } else {
    details = { ...data };
  }

  return {
    status: status ?? null,
    details,
    raw: payload,
  };
}

/**
 * Hook that fetches and manages the system health endpoints.
 * @param {boolean} autoFetch - Whether the hook should fetch data on mount
 */
export function useHealthStatus(autoFetch = true) {
  const [health, setHealth] = useState(createEmptyState);
  const [readiness, setReadiness] = useState(createEmptyState);
  const [liveness, setLiveness] = useState(createEmptyState);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);
  const [lastCheckedAt, setLastCheckedAt] = useState(null);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [healthResult, readinessResult, livenessResult] =
        await Promise.allSettled([
          healthService.getSystemHealth(),
          healthService.getReadiness(),
          healthService.getLiveness(),
        ]);

      const errors = [];

      if (healthResult.status === "fulfilled") {
        const normalised = normalisePayload(healthResult.value);
        setHealth({
          status: normalised.status,
          details: normalised.details,
          raw: normalised.raw,
        });
      } else {
        errors.push(
          healthResult.reason?.message ||
            "Failed to fetch comprehensive health check"
        );
        setHealth(createEmptyState());
      }

      if (readinessResult.status === "fulfilled") {
        const normalised = normalisePayload(readinessResult.value);
        setReadiness({
          status: normalised.status,
          details: normalised.details,
          raw: normalised.raw,
        });
      } else {
        errors.push(
          readinessResult.reason?.message || "Failed to fetch readiness probe"
        );
        setReadiness(createEmptyState());
      }

      if (livenessResult.status === "fulfilled") {
        const normalised = normalisePayload(livenessResult.value);
        setLiveness({
          status: normalised.status,
          details: normalised.details,
          raw: normalised.raw,
        });
      } else {
        errors.push(
          livenessResult.reason?.message || "Failed to fetch liveness probe"
        );
        setLiveness(createEmptyState());
      }

      if (errors.length > 0) {
        const message = errors.join("; ");
        setError(message);
        toast.error(message);
      } else {
        setLastCheckedAt(new Date());
      }
    } catch (err) {
      const message =
        err?.message ||
        "Unable to check system health. Please verify the API is reachable.";
      setError(message);
      setHealth(createEmptyState());
      setReadiness(createEmptyState());
      setLiveness(createEmptyState());
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchHealth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch]);

  const overallStatus = useMemo(() => {
    const statuses = [health.status, readiness.status, liveness.status]
      .map((value) =>
        value === null || value === undefined
          ? null
          : String(value).toLowerCase()
      )
      .filter(Boolean);
    if (statuses.length === 0) return null;

    if (statuses.some((value) => UNHEALTHY_STATUSES.has(value))) {
      return "unhealthy";
    }

    if (statuses.every((value) => HEALTHY_STATUSES.has(value))) {
      return "healthy";
    }

    return "degraded";
  }, [health.status, readiness.status, liveness.status]);

  return {
    health,
    readiness,
    liveness,
    overallStatus,
    loading,
    error,
    lastCheckedAt,
    refresh: fetchHealth,
  };
}
