"use client";

import { useMemo } from "react";
import {
  Activity,
  Clock,
  Database as DatabaseIcon,
  RefreshCw,
} from "lucide-react";
import {
  CustomButton,
  CustomCard,
  CustomCardContent,
  CustomCardDescription,
  CustomCardHeader,
  CustomCardTitle,
  ErrorState,
  LoadingState,
} from "@/components/ui";
import { useSystemInfo } from "../hooks/useSystemInfo";

const ICON_STYLES = {
  uptime: "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300",
  database:
    "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
  apiCalls:
    "bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-300",
};

const formatDuration = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "—";
  }

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes || parts.length === 0) parts.push(`${minutes}m`);

  return parts.join(" ");
};

const formatDate = (date) => {
  if (!date) return "—";
  try {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "—";
    return parsed.toLocaleString();
  } catch {
    return "—";
  }
};

const formatNumber = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }
  return new Intl.NumberFormat().format(value);
};

export function SystemInfoCards() {
  const { data, loading, error, refresh } = useSystemInfo();

  const cards = useMemo(() => {
    const uptimeSeconds = Number(data?.uptime?.seconds) || 0;
    const databaseFormatted =
      data?.database?.formatted || formatNumber(data?.database?.bytes);
    const apiCallsTotal = formatNumber(data?.apiCallsToday?.total);

    return [
      {
        key: "uptime",
        title: "System Uptime",
        value: formatDuration(uptimeSeconds),
        description: "Time since last restart",
        footer: `Started ${formatDate(data?.uptime?.startedAt)}`,
        icon: Clock,
        iconStyle: ICON_STYLES.uptime,
      },
      {
        key: "database",
        title: "Database Size",
        value: databaseFormatted || "—",
        description: "Total storage usage",
        footer: data?.database?.bytes
          ? `${formatNumber(data.database.bytes)} bytes`
          : null,
        icon: DatabaseIcon,
        iconStyle: ICON_STYLES.database,
      },
      {
        key: "apiCalls",
        title: "API Calls Today",
        value: apiCallsTotal,
        description: "Requests processed since midnight",
        footer: data?.apiCallsToday?.since
          ? `Since ${formatDate(data.apiCallsToday.since)}`
          : null,
        icon: Activity,
        iconStyle: ICON_STYLES.apiCalls,
      },
    ];
  }, [data]);

  if (error) {
    return (
      <CustomCard className="mt-6">
        <ErrorState
          title="Unable to load system information"
          message={error}
          onRetry={refresh}
        />
      </CustomCard>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Live System Metrics
          </h2>
          <p className="text-sm text-muted-foreground">
            Real-time operational overview for administrators.
          </p>
        </div>
        <CustomButton
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={loading}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </CustomButton>
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[0, 1, 2].map((skeleton) => (
            <CustomCard key={`skeleton-${skeleton}`} className="p-6">
              <div className="h-5 w-24 animate-pulse rounded bg-muted/60" />
              <div className="mt-6 h-10 w-32 animate-pulse rounded bg-muted/60" />
              <div className="mt-4 h-3 w-40 animate-pulse rounded bg-muted/50" />
              <div className="mt-6 h-3 w-28 animate-pulse rounded bg-muted/40" />
            </CustomCard>
          ))}
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <CustomCard key={card.key} className="overflow-hidden">
              <CustomCardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                <div>
                  <CustomCardTitle className="text-base">
                    {card.title}
                  </CustomCardTitle>
                  <CustomCardDescription>
                    {card.description}
                  </CustomCardDescription>
                </div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${card.iconStyle}`}
                >
                  <card.icon className="h-5 w-5" />
                </div>
              </CustomCardHeader>
              <CustomCardContent className="pt-0">
                <div className="text-3xl font-semibold tracking-tight">
                  {card.value || "—"}
                </div>
                {card.footer && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    {card.footer}
                  </p>
                )}
              </CustomCardContent>
            </CustomCard>
          ))}
        </div>
      )}

      {!loading && !data && (
        <CustomCard>
          <LoadingState message="Waiting for system metrics..." />
        </CustomCard>
      )}
    </div>
  );
}
