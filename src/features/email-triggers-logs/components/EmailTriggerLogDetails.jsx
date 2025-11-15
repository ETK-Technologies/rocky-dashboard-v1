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
import { useEmailTriggerLog } from "../hooks/useEmailTriggerLog";
import { ALL_EMAIL_TRIGGERS } from "../hooks/useEmailTriggersLogs";

const DEFAULT_STATUS_CLASS =
  "bg-secondary text-secondary-foreground dark:bg-slate-400/20 dark:text-slate-200";

const STATUS_BADGE_CLASSES = {
  success:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-200",
  failed: "bg-rose-100 text-rose-700 dark:bg-rose-400/20 dark:text-rose-200",
  error: "bg-rose-100 text-rose-700 dark:bg-rose-400/20 dark:text-rose-200",
  pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-400/20 dark:text-amber-200",
  warning:
    "bg-amber-100 text-amber-700 dark:bg-amber-400/20 dark:text-amber-200",
  running: "bg-sky-100 text-sky-700 dark:bg-sky-400/20 dark:text-sky-200",
  info: "bg-sky-100 text-sky-700 dark:bg-sky-400/20 dark:text-sky-200",
  queued: "bg-secondary text-secondary-foreground dark:bg-slate-400/20 dark:text-slate-200",
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

const safeJson = (value) => {
  if (!value) return null;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

export function EmailTriggerLogDetails({ activityId }) {
  const router = useRouter();
  const { activity, loading, error, refresh } = useEmailTriggerLog(activityId);

  const metadataContent = useMemo(() => {
    if (!activity?.metadata) return null;
    return safeJson(activity.metadata);
  }, [activity?.metadata]);

  const terminalContent = useMemo(() => {
    if (!activity) return null;

    const parts = [];
    if (activity.message) {
      parts.push(activity.message);
    }
    if (activity.error) {
      parts.push(`\nError: ${activity.error}`);
    }
    if (activity.stack) {
      parts.push(`\n\nStack:\n${activity.stack}`);
    }

    return parts.length > 0 ? parts.join("\n") : null;
  }, [activity]);

  const triggerLabel = useMemo(() => {
    if (!activity) return null;
    const trigger =
      activity.trigger ||
      activity.metadata?.trigger ||
      activity.emailTrigger;
    if (!trigger) return null;
    return (
      ALL_EMAIL_TRIGGERS.find((t) => t.value === trigger)?.label || trigger
    );
  }, [activity]);

  const statusClass = useMemo(() => {
    if (!activity) return DEFAULT_STATUS_CLASS;
    if (activity.action === "EMAIL_SEND_FAILED") {
      return STATUS_BADGE_CLASSES.failed;
    }
    const status = String(activity.status || "")
      .trim()
      .toLowerCase();
    return STATUS_BADGE_CLASSES[status] || DEFAULT_STATUS_CLASS;
  }, [activity]);

  if (loading) {
    return <LoadingState message="Loading email trigger log details..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  if (!activity) {
    return (
      <ErrorState
        title="Email trigger log not found"
        message="The requested email trigger log could not be found."
        onRetry={refresh}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email Trigger Log Details"
        description="View detailed information about this email trigger log entry."
        action={
          <div className="flex items-center gap-2">
            <CustomButton
              variant="outline"
              size="sm"
              onClick={() =>
                router.push("/dashboard/email-templates/triggers-logs")
              }
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Logs
            </CustomButton>
            <CustomButton
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </CustomButton>
          </div>
        }
      />

      {/* Status Badge */}
      <CustomCard>
        <CustomCardHeader>
          <div className="flex items-center justify-between">
            <CustomCardTitle>Status</CustomCardTitle>
            <CustomBadge
              variant="outline"
              className={`uppercase tracking-wide px-3 py-1.5 ${statusClass}`}
            >
              {activity.action === "EMAIL_SEND_FAILED"
                ? "FAILED"
                : activity.status || "UNKNOWN"}
            </CustomBadge>
          </div>
        </CustomCardHeader>
      </CustomCard>

      {/* Basic Information */}
      <CustomCard>
        <CustomCardHeader>
          <CustomCardTitle>Basic Information</CustomCardTitle>
          <CustomCardDescription>
            Core details about this email trigger log entry.
          </CustomCardDescription>
        </CustomCardHeader>
        <CustomCardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <InfoRow
              label="Timestamp"
              value={formatDateTime(activity.occurredAt)}
            />
            <InfoRow label="Scope" value={activity.scope} />
            <InfoRow label="Action" value={activity.action} />
            <InfoRow label="Trigger" value={triggerLabel || activity.trigger} />
            <InfoRow label="Status" value={activity.status} />
            <InfoRow label="Target Type" value={activity.targetType} />
            <InfoRow label="Target ID" value={activity.targetId} />
            <InfoRow label="Actor Email" value={activity.actorEmail} />
            <InfoRow label="Actor Role" value={activity.actorRole} />
            <InfoRow label="Activity ID" value={activity.id || activity._id} />
          </div>
        </CustomCardContent>
      </CustomCard>

      {/* Message */}
      {activity.message && (
        <CustomCard>
          <CustomCardHeader>
            <CustomCardTitle>Message</CustomCardTitle>
            <CustomCardDescription>
              The message associated with this email trigger log entry.
            </CustomCardDescription>
          </CustomCardHeader>
          <CustomCardContent>
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {activity.message}
              </p>
            </div>
          </CustomCardContent>
        </CustomCard>
      )}

      {/* Error Details */}
      {activity.error && (
        <CustomCard>
          <CustomCardHeader>
            <CustomCardTitle>Error Details</CustomCardTitle>
            <CustomCardDescription>
              Error information for this email trigger log entry.
            </CustomCardDescription>
          </CustomCardHeader>
          <CustomCardContent>
            <TerminalBlock title="Error" content={activity.error} />
          </CustomCardContent>
        </CustomCard>
      )}

      {/* Terminal Output */}
      {terminalContent && (
        <CustomCard>
          <CustomCardHeader>
            <CustomCardTitle>Terminal Output</CustomCardTitle>
            <CustomCardDescription>
              Complete terminal output for this email trigger log entry.
            </CustomCardDescription>
          </CustomCardHeader>
          <CustomCardContent>
            <TerminalBlock title="Output" content={terminalContent} />
          </CustomCardContent>
        </CustomCard>
      )}

      {/* Metadata */}
      {metadataContent && (
        <CustomCard>
          <CustomCardHeader>
            <CustomCardTitle>Metadata</CustomCardTitle>
            <CustomCardDescription>
              Additional metadata for this email trigger log entry.
            </CustomCardDescription>
          </CustomCardHeader>
          <CustomCardContent>
            <TerminalBlock title="Metadata" content={metadataContent} />
          </CustomCardContent>
        </CustomCard>
      )}
    </div>
  );
}

