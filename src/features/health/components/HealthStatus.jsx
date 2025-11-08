"use client";

import { useMemo } from "react";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  HelpCircle,
  RefreshCw,
  Server,
} from "lucide-react";
import { CustomButton, LoadingState } from "@/components/ui";
import { useHealthStatus } from "../hooks/useHealthStatus";
import { cn } from "@/utils/cn";

const STATUS_CONFIG = {
  healthy: {
    label: "Healthy",
    icon: CheckCircle2,
    pillClass:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    iconClass: "text-green-500",
    borderClass: "border-green-200 dark:border-green-800",
  },
  degraded: {
    label: "Degraded",
    icon: AlertCircle,
    pillClass:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    iconClass: "text-yellow-500",
    borderClass: "border-yellow-200 dark:border-yellow-800",
  },
  unhealthy: {
    label: "Unhealthy",
    icon: AlertCircle,
    pillClass: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    iconClass: "text-red-500",
    borderClass: "border-red-200 dark:border-red-800",
  },
  unknown: {
    label: "Unknown",
    icon: HelpCircle,
    pillClass:
      "bg-gray-100 text-gray-600 dark:bg-gray-800/70 dark:text-gray-300",
    iconClass: "text-gray-400",
    borderClass: "border-border",
  },
};

const STATUS_NORMALISATION_MAP = {
  ok: "healthy",
  pass: "healthy",
  passing: "healthy",
  healthy: "healthy",
  ready: "healthy",
  up: "healthy",
  alive: "healthy",
  success: "healthy",
  good: "healthy",
  warn: "degraded",
  warning: "degraded",
  degraded: "degraded",
  partial: "degraded",
  unknown: "unknown",
  pending: "unknown",
  fail: "unhealthy",
  failing: "unhealthy",
  failed: "unhealthy",
  error: "unhealthy",
  down: "unhealthy",
  critical: "unhealthy",
  not_ready: "unhealthy",
  dead: "unhealthy",
};

function normaliseStatus(value) {
  if (value === null || value === undefined) {
    return "unknown";
  }

  if (typeof value === "boolean") {
    return value ? "healthy" : "unhealthy";
  }

  const statusKey = String(value).toLowerCase().replace(/\s+/g, "_");
  return STATUS_NORMALISATION_MAP[statusKey] || "unknown";
}

function formatDateTime(date) {
  if (!date) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    }).format(date);
  } catch {
    return "—";
  }
}

function renderDetails(details) {
  const renderStatusBadge = (statusValue) => {
    const normalised = normaliseStatus(statusValue);
    const config = STATUS_CONFIG[normalised] || STATUS_CONFIG.unknown;
    const displayValue =
      statusValue === null || statusValue === undefined
        ? config.label
        : typeof statusValue === "string"
        ? statusValue
        : String(statusValue);

    return (
      <span
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium",
          config.pillClass
        )}
      >
        <config.icon className={cn("h-3.5 w-3.5", config.iconClass)} />
        {displayValue}
      </span>
    );
  };

  const extractStatusValue = (value) => {
    if (!value || typeof value !== "object") {
      return undefined;
    }

    if (typeof value.status === "string") {
      return value.status;
    }

    if (typeof value.state === "string") {
      return value.state;
    }

    if (typeof value.ready === "boolean") {
      return value.ready ? "ready" : "not_ready";
    }

    if (typeof value.live === "boolean") {
      return value.live ? "alive" : "dead";
    }

    if (typeof value.healthy === "boolean") {
      return value.healthy ? "healthy" : "unhealthy";
    }

    if (value.data && typeof value.data === "object") {
      return extractStatusValue(value.data);
    }

    return undefined;
  };

  if (!details) {
    return (
      <p className="text-sm text-muted-foreground">
        No additional details reported.
      </p>
    );
  }

  const entries = Array.isArray(details)
    ? details.map((value, index) => [`Item ${index + 1}`, value])
    : Object.entries(details || {});

  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No additional details reported.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {entries.slice(0, 8).map(([key, value]) => {
        if (value && typeof value === "object" && !Array.isArray(value)) {
          const statusValue = extractStatusValue(value);
          const remainingEntries = Object.entries(value).filter(
            ([innerKey]) =>
              !["status", "state", "ready", "live", "healthy"].includes(
                innerKey
              )
          );

          return (
            <div
              key={key}
              className="rounded-lg border border-border/60 bg-background/60 p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">
                  {key}
                </span>
                {statusValue !== undefined && renderStatusBadge(statusValue)}
              </div>

              {remainingEntries.length > 0 && (
                <dl className="mt-3 space-y-1">
                  {remainingEntries.map(([innerKey, innerValue]) => (
                    <div
                      key={`${key}-${innerKey}`}
                      className="grid grid-cols-3 gap-2 text-xs text-muted-foreground"
                    >
                      <dt className="col-span-1 font-medium">{innerKey}</dt>
                      <dd className="col-span-2 font-mono whitespace-pre-wrap break-words rounded bg-muted/50 p-2">
                        {typeof innerValue === "object"
                          ? JSON.stringify(innerValue, null, 2)
                          : innerValue === null || innerValue === undefined
                          ? "—"
                          : String(innerValue)}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          );
        }

        const formattedValue =
          value === null || value === undefined
            ? "—"
            : typeof value === "object"
            ? JSON.stringify(value, null, 2)
            : String(value);

        return (
          <div
            key={key}
            className="grid grid-cols-3 gap-3 rounded border border-border/50 bg-background/40 p-3 text-sm"
          >
            <dt className="col-span-1 font-medium text-muted-foreground">
              {key}
            </dt>
            <dd className="col-span-2 font-mono text-xs whitespace-pre-wrap break-all">
              {formattedValue}
            </dd>
          </div>
        );
      })}
      {entries.length > 8 && (
        <p className="text-xs text-muted-foreground">
          Showing first {8} entries.
        </p>
      )}
    </div>
  );
}

export function HealthStatus() {
  const {
    health,
    readiness,
    liveness,
    overallStatus,
    loading,
    error,
    lastCheckedAt,
    refresh,
  } = useHealthStatus();

  const summaryConfig = STATUS_CONFIG[normaliseStatus(overallStatus)];

  const sections = useMemo(
    () => [
      {
        key: "health",
        title: "Comprehensive Health Check",
        description:
          "Aggregated diagnostic information collected across the service.",
        payload: health,
      },
      {
        key: "readiness",
        title: "Readiness Probe",
        description:
          "Indicates whether the service is ready to handle production traffic.",
        payload: readiness,
      },
      {
        key: "liveness",
        title: "Liveness Probe",
        description:
          "Confirms the service is running and responsive to health checks.",
        payload: liveness,
      },
    ],
    [health, readiness, liveness]
  );

  if (loading) {
    return <LoadingState message="Checking system health..." />;
  }

  return (
    <div className="space-y-6">
      <div
        className={cn(
          "rounded-xl border bg-card p-6 shadow-sm",
          summaryConfig.borderClass
        )}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/5">
              <summaryConfig.icon
                className={cn("h-8 w-8", summaryConfig.iconClass)}
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overall Status</p>
              <h3 className="text-2xl font-semibold text-foreground">
                {summaryConfig.label}
              </h3>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Last checked {formatDateTime(lastCheckedAt)}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <div
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium",
                summaryConfig.pillClass
              )}
            >
              <Activity className="h-4 w-4" />
              {summaryConfig.label}
            </div>
            <CustomButton
              onClick={refresh}
              className="sm:ml-2"
              variant="outline"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </CustomButton>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
              <CustomButton
                onClick={refresh}
                variant="outline"
                className="w-full md:w-auto"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try again
              </CustomButton>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {sections.map(({ key, title, description, payload }) => {
          const normalisedStatus = normaliseStatus(payload?.status);
          const config =
            STATUS_CONFIG[normalisedStatus] || STATUS_CONFIG.unknown;
          const displayStatus =
            payload?.status === null || payload?.status === undefined
              ? config.label
              : typeof payload?.status === "string"
              ? payload.status
              : String(payload?.status);

          return (
            <div
              key={key}
              className={cn(
                "flex h-full flex-col gap-4 rounded-xl border bg-card p-5 shadow-sm",
                config.borderClass
              )}
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/5 p-2">
                  <Server className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-foreground">
                    {title}
                  </h4>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </div>

              <div
                className={cn(
                  "inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-sm font-medium",
                  config.pillClass
                )}
              >
                <config.icon className={cn("h-4 w-4", config.iconClass)} />
                {displayStatus}
              </div>

              <div className="flex-1 overflow-hidden rounded-lg border border-dashed border-border bg-muted/40 p-3">
                {renderDetails(payload?.details)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
