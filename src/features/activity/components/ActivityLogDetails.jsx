"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";
import {
  CustomBadge,
  CustomButton,
  CustomCard,
  CustomCardContent,
  CustomCardHeader,
  CustomCardTitle,
  CustomCardDescription,
  ErrorState,
  LoadingState,
  PageHeader,
} from "@/components/ui";
import { useActivityLog } from "../hooks/useActivityLog";

const DEFAULT_STATUS_CLASS =
  "bg-secondary text-secondary-foreground dark:bg-slate-400/20 dark:text-slate-200";

const STATUS_BADGE_CLASSES = {
  success:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-200",
  failed:
    "bg-rose-100 text-rose-700 dark:bg-rose-400/20 dark:text-rose-200",
  error:
    "bg-rose-100 text-rose-700 dark:bg-rose-400/20 dark:text-rose-200",
  pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-400/20 dark:text-amber-200",
  warning:
    "bg-amber-100 text-amber-700 dark:bg-amber-400/20 dark:text-amber-200",
  running:
    "bg-sky-100 text-sky-700 dark:bg-sky-400/20 dark:text-sky-200",
  info:
    "bg-sky-100 text-sky-700 dark:bg-sky-400/20 dark:text-sky-200",
  queued:
    "bg-secondary text-secondary-foreground dark:bg-slate-400/20 dark:text-slate-200",
};

const formatDateTime = (value) => {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const TerminalBlock = ({ title, content }) => {
  if (!content) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-zinc-950 text-zinc-100">
      <div className="flex items-center justify-between border-b border-border/60 bg-zinc-900 px-4 py-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </span>
      </div>
      <pre className="whitespace-pre-wrap break-words p-4 font-mono text-xs leading-relaxed text-zinc-100/90 sm:text-sm">
        {content}
      </pre>
    </div>
  );
};

const InfoRow = ({ label, value, helper }) => {
  if (!label) return null;
  return (
    <div className="space-y-1">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="break-all text-sm font-medium text-foreground">
        {value || "—"}
      </div>
      {helper && (
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          {helper}
        </div>
      )}
    </div>
  );
};

export function ActivityLogDetails({ activityId }) {
  const router = useRouter();
  const { activity, loading, error, refresh } = useActivityLog(activityId);

  const metadataContent = useMemo(() => {
    if (!activity?.metadata) return null;
    return safeJson(activity.metadata);
  }, [activity?.metadata]);

  const terminalContent = useMemo(() => {
    if (!activity) return null;

    const lines = [];

    lines.push(`[${formatDateTime(activity.occurredAt)}] ${activity.action}`);

    if (activity.message) {
      lines.push(activity.message);
    }

    if (activity.status) {
      lines.push(`status=${activity.status}`);
    }

    if (activity.actorEmail) {
      lines.push(
        `actor=${activity.actorEmail}${
          activity.actorRole ? ` (${activity.actorRole})` : ""
        }`
      );
    }

    if (activity.scope) {
      lines.push(`scope=${activity.scope}`);
    }

    if (activity.targetType || activity.targetId) {
      lines.push(
        `target=${activity.targetType || "unknown"}${
          activity.targetId ? `#${activity.targetId}` : ""
        }`
      );
    }

    return lines.join("\n");
  }, [activity]);

  const httpSummary = useMemo(() => {
    const meta = activity?.metadata;
    if (!meta) return null;

    const method = meta.method || meta.httpMethod;
    const path = meta.path || meta.endpoint;
    const statusCode = meta.statusCode ?? meta.status;
    const duration =
      meta.durationMs ?? meta.duration ?? meta.responseTime ?? null;

    if (!method && !path && !statusCode && !duration) {
      return null;
    }

    const summaryLines = [];

    if (method || path) {
      summaryLines.push(`${method || "METHOD"} ${path || "/"}`);
    }

    if (statusCode) {
      summaryLines.push(`status=${statusCode}`);
    }

    if (duration !== null && duration !== undefined) {
      summaryLines.push(`duration=${duration}ms`);
    }

    return summaryLines.join(" • ");
  }, [activity?.metadata]);

  const queryContent = useMemo(() => {
    const meta = activity?.metadata;
    if (!meta) return null;

    if (meta.query && Object.keys(meta.query).length > 0) {
      return safeJson(meta.query);
    }

    if (meta.params && Object.keys(meta.params).length > 0) {
      return safeJson(meta.params);
    }

    if (meta.body && Object.keys(meta.body).length > 0) {
      return safeJson(meta.body);
    }

    return null;
  }, [activity?.metadata]);

  const childSummary = Array.isArray(activity?.children)
    ? activity.children
    : [];

  if (!activityId) {
    return (
      <ErrorState
        title="Missing activity ID"
        message="No activity identifier was provided."
        onRetry={() => router.back()}
        retryText="Go Back"
      />
    );
  }

  if (loading) {
    return <LoadingState message="Loading activity log..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to load activity log"
        message={error}
        onRetry={refresh}
      />
    );
  }

  if (!activity) {
    return (
      <ErrorState
        title="Activity log not found"
        message="We couldn't find details for this activity entry."
        onRetry={() => router.back()}
        retryText="Go Back"
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Details"
        description="Detailed information about the selected system activity log."
        action={
          <div className="flex items-center gap-2">
            <CustomButton
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </CustomButton>
            <CustomButton
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={loading}
              className="inline-flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </CustomButton>
          </div>
        }
      />

      <CustomCard>
        <CustomCardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CustomCardTitle>
                {activity.action || "System Activity"}
              </CustomCardTitle>
              <CustomCardDescription>
                Logged on {formatDateTime(activity.occurredAt)}
              </CustomCardDescription>
            </div>
            {activity.status && (
              <CustomBadge
                variant="outline"
                className={`font-semibold uppercase tracking-wide px-2.5 py-1 ${
                  STATUS_BADGE_CLASSES[
                    String(activity.status || "").trim().toLowerCase()
                  ] || DEFAULT_STATUS_CLASS
                }`}
              >
                {activity.status}
              </CustomBadge>
            )}
          </div>
        </CustomCardHeader>
        <CustomCardContent className="space-y-6">
          {httpSummary && (
            <div className="rounded-lg border border-border/70 bg-muted/60 px-4 py-3 text-sm text-foreground">
              {httpSummary}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <InfoRow label="Activity ID" value={activity.id || activity._id} />
            <InfoRow
              label="Scope"
              value={activity.scope}
              helper={activity.environment || activity.module}
            />
            <InfoRow
              label="Actor Email"
              value={activity.actorEmail}
              helper={activity.actorRole}
            />
            <InfoRow
              label="Target"
              value={
                activity.targetType || activity.targetId
                  ? `${activity.targetType || "Unknown"}${
                      activity.targetId ? ` #${activity.targetId}` : ""
                    }`
                  : "—"
              }
            />
          </div>

          {(activity.ipAddress || activity.userAgent) && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {activity.ipAddress && (
                <InfoRow label="IP Address" value={activity.ipAddress} />
              )}
              {activity.userAgent && (
                <InfoRow label="User Agent" value={activity.userAgent} />
              )}
            </div>
          )}

          {activity.error && (
            <TerminalBlock title="Error" content={safeJson(activity.error)} />
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Status
              </div>
              <CustomBadge
                variant="outline"
                className={`mt-1 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                  STATUS_BADGE_CLASSES[
                    String(activity.status || "").trim().toLowerCase()
                  ] || DEFAULT_STATUS_CLASS
                }`}
              >
                {activity.status || "UNKNOWN"}
              </CustomBadge>
            </div>
            {activity.metadata?.statusCode && (
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Response Code
                </div>
                <CustomBadge
                  variant="outline"
                  className="mt-1 inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground"
                >
                  {activity.metadata.statusCode}
                </CustomBadge>
              </div>
            )}
          </div>

          {activity.message && (
            <TerminalBlock title="Message" content={activity.message} />
          )}

          <TerminalBlock title="Log Output" content={terminalContent} />

          {queryContent && (
            <TerminalBlock title="Request Data" content={queryContent} />
          )}

          {metadataContent && (
            <TerminalBlock title="Metadata" content={metadataContent} />
          )}

          {childSummary.length > 0 && (
            <CustomCard>
              <CustomCardHeader>
                <CustomCardTitle>Child Activity</CustomCardTitle>
                <CustomCardDescription>
                  Related activity records returned with this entry.
                </CustomCardDescription>
              </CustomCardHeader>
              <CustomCardContent>
                <div className="space-y-4">
                  {childSummary.map((child) => (
                    <div
                      key={child.id}
                      className="rounded-lg border border-border/70 bg-muted/60 p-4"
                    >
                      <div className="text-sm font-semibold text-foreground">
                        {child.action || child.id}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {child.message || "No message provided."}
                      </div>
                      {child.status && (
                        <CustomBadge
                          variant="outline"
                          className={`mt-3 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                            STATUS_BADGE_CLASSES[
                              String(child.status || "")
                                .trim()
                                .toLowerCase()
                            ] || DEFAULT_STATUS_CLASS
                          }`}
                        >
                          {child.status}
                        </CustomBadge>
                      )}
                    </div>
                  ))}
                </div>
              </CustomCardContent>
            </CustomCard>
          )}
        </CustomCardContent>
      </CustomCard>
    </div>
  );
}

function safeJson(value) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
