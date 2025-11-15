"use client";

import { useState } from "react";
import {
  RefreshCw,
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  Calendar,
  Trash2,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import {
  CustomCard,
  CustomButton,
  CustomBadge,
} from "@/components/ui";
import { useDataCleanup } from "../hooks/useDataCleanup";
import { cn } from "@/utils/cn";

/**
 * Convert cron expression to human-readable text
 * @param {string} cron - Cron expression (e.g., "0 2 * * *")
 * @returns {string} Human-readable description
 */
function formatCronToHuman(cron) {
  if (!cron || typeof cron !== "string") return "";

  const parts = cron.trim().split(/\s+/);
  if (parts.length < 5) return "";

  const [minute, hour, day, month, weekday] = parts;

  // Common patterns
  // Every hour at minute 0
  if (minute === "0" && hour === "*" && day === "*" && month === "*" && weekday === "*") {
    return "Every hour";
  }

  // Daily at specific time
  if (minute !== "*" && hour !== "*" && day === "*" && month === "*" && weekday === "*") {
    const hourNum = parseInt(hour);
    const minNum = parseInt(minute);
    const period = hourNum >= 12 ? "PM" : "AM";
    const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
    const displayMinute = minNum === 0 ? "" : `:${minNum.toString().padStart(2, "0")}`;
    return `Daily at ${displayHour}${displayMinute} ${period}`;
  }

  // Every N hours
  if (minute === "0" && hour.startsWith("*/") && day === "*" && month === "*" && weekday === "*") {
    const interval = hour.substring(2);
    return `Every ${interval} hours`;
  }

  // Every N minutes
  if (minute.startsWith("*/") && hour === "*" && day === "*" && month === "*" && weekday === "*") {
    const interval = minute.substring(2);
    return `Every ${interval} minutes`;
  }

  // Weekly (specific day)
  if (minute === "0" && hour === "0" && day === "*" && month === "*" && weekday !== "*") {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayIndex = parseInt(weekday);
    if (!isNaN(dayIndex) && dayIndex >= 0 && dayIndex <= 6) {
      return `Every ${days[dayIndex]} at midnight`;
    }
  }

  // Monthly (specific day)
  if (minute === "0" && hour === "0" && day !== "*" && day !== "1" && month === "*" && weekday === "*") {
    return `Monthly on day ${day} at midnight`;
  }

  // First day of month
  if (minute === "0" && hour === "0" && day === "1" && month === "*" && weekday === "*") {
    return "First day of each month at midnight";
  }

  // Specific time daily (already handled above, but more explicit)
  if (minute !== "*" && !minute.includes("/") && hour !== "*" && !hour.includes("/")) {
    const hourNum = parseInt(hour);
    const minNum = parseInt(minute);
    if (!isNaN(hourNum) && !isNaN(minNum)) {
      const period = hourNum >= 12 ? "PM" : "AM";
      const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
      const displayMinute = minNum === 0 ? "" : `:${minNum.toString().padStart(2, "0")}`;
      return `Daily at ${displayHour}${displayMinute} ${period}`;
    }
  }

  // Default: return the cron expression with a note
  return cron;
}

/**
 * DataCleanupPanel component for monitoring and managing data cleanup job
 */
export function DataCleanupPanel() {
  const {
    status,
    history,
    loading,
    historyLoading,
    error,
    running,
    fetchStatus,
    fetchHistory,
    triggerCleanup,
    refresh,
  } = useDataCleanup(true, 10);

  const [refreshing, setRefreshing] = useState(false);
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  // Handle trigger cleanup
  const handleTriggerCleanup = async () => {
    if (
      !window.confirm(
        "Are you sure you want to run the data cleanup job now? This will permanently delete old data."
      )
    ) {
      return;
    }

    try {
      await triggerCleanup();
    } catch (err) {
      // Error already handled in hook
    }
  };

  if (loading && !status) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !status) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <CustomButton onClick={handleRefresh} disabled={refreshing}>
          Retry
        </CustomButton>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  const humanReadableSchedule = formatCronToHuman(status.schedule);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Data Cleanup</h2>
          <p className="text-muted-foreground">
            Monitor and manage data retention cleanup operations
          </p>
        </div>
        <CustomButton
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing || running}
          className="flex items-center gap-2"
        >
          <RefreshCw
            className={cn("h-4 w-4", refreshing && "animate-spin")}
          />
          Refresh
        </CustomButton>
      </div>

      {/* Information Card */}
      <CustomCard className="p-6 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">What Does Data Cleanup Do?</h3>
              <button
                type="button"
                onClick={() => setIsInfoExpanded(!isInfoExpanded)}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                {isInfoExpanded ? (
                  <>
                    <span>Hide Details</span>
                    <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <span>Show Details</span>
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
            {isInfoExpanded && (
              <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                The data cleanup job automatically removes old data based on the configured retention period (typically 365 days). This helps maintain database performance and compliance with data retention policies.
              </p>
              
              <div>
                <p className="font-semibold text-foreground mb-2">The cleanup process will permanently delete:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    <strong>Activity Logs</strong> - User actions and system events older than the retention period
                  </li>
                  <li>
                    <strong>Email Verification Tokens</strong> - Expired email verification tokens and unused verification records
                  </li>
                  <li>
                    <strong>Password Reset Tokens</strong> - Expired password reset tokens and unused reset requests
                  </li>
                  <li>
                    <strong>Soft-Deleted Users</strong> - User accounts that were deleted more than the retention period ago (permanent deletion)
                  </li>
                </ul>
              </div>

              <div className="pt-2 border-t border-border">
                <p className="font-semibold text-foreground mb-1">Important Notes:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Only data older than the retention period will be deleted</li>
                  <li>This action is <strong className="text-red-600 dark:text-red-400">irreversible</strong> - deleted data cannot be recovered</li>
                  <li>The job runs automatically on schedule or can be triggered manually</li>
                  <li>During cleanup, the system will process records in batches to minimize impact</li>
                </ul>
              </div>

              {status.lastRunStats && (
                <div className="pt-2 border-t border-border">
                  <p className="text-xs">
                    <strong>Current Retention Period:</strong> {status.lastRunStats.retentionDays || 365} days
                    {status.lastRunStats.cutoffDate && (
                      <span className="ml-2">
                        (Data before {new Date(status.lastRunStats.cutoffDate).toLocaleDateString()} will be deleted)
                      </span>
                    )}
                  </p>
                </div>
              )}
              </div>
            )}
          </div>
        </div>
      </CustomCard>

      {/* Status Card */}
      <CustomCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Trash2 className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold">{status.jobName}</h3>
              <p className="text-sm text-muted-foreground">
                Schedule: <code className="font-mono">{status.schedule}</code>
                {humanReadableSchedule && humanReadableSchedule !== status.schedule && (
                  <span className="ml-2">({humanReadableSchedule})</span>
                )}
              </p>
            </div>
          </div>
          <CustomBadge variant={status.isRunning ? "default" : "secondary"}>
            {status.isRunning ? "Running" : "Idle"}
          </CustomBadge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Next Run */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Next Run</p>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <p className="font-medium">
                {status.nextRunAt
                  ? new Date(status.nextRunAt).toLocaleString()
                  : "Not scheduled"}
              </p>
            </div>
          </div>

          {/* Last Run */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Last Run</p>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <p className="font-medium">
                {status.lastRunAt
                  ? new Date(status.lastRunAt).toLocaleString()
                  : "Never"}
              </p>
            </div>
          </div>
        </div>

        {/* Last Run Stats */}
        {status.lastRunStats && (
          <div className="pt-6 border-t border-border">
            <h4 className="text-sm font-semibold mb-4">Last Run Statistics</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Activity Logs Deleted
                </p>
                <p className="text-lg font-semibold">
                  {status.lastRunStats.activityLogsDeleted || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Email Tokens Deleted
                </p>
                <p className="text-lg font-semibold">
                  {status.lastRunStats.emailTokensDeleted || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Password Reset Tokens Deleted
                </p>
                <p className="text-lg font-semibold">
                  {status.lastRunStats.passwordResetTokensDeleted || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Deleted Users Permanently Removed
                </p>
                <p className="text-lg font-semibold">
                  {status.lastRunStats.deletedUsersCount || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Retention Period</p>
                <p className="text-lg font-semibold">
                  {status.lastRunStats.retentionDays || 0} days
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cutoff Date</p>
                <p className="text-sm font-semibold">
                  {status.lastRunStats.cutoffDate
                    ? new Date(status.lastRunStats.cutoffDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Manual Trigger Button */}
        <div className="mt-6 pt-6 border-t border-border">
          <CustomButton
            onClick={handleTriggerCleanup}
            disabled={running || status.isRunning}
            className="flex items-center gap-2"
          >
            {running ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run Cleanup Now
              </>
            )}
          </CustomButton>
          <p className="text-xs text-muted-foreground mt-2">
            Manually trigger the data cleanup job immediately. This will
            permanently delete data older than the retention period.
          </p>
        </div>
      </CustomCard>

      {/* History */}
      <div>
        <h3 className="text-lg font-semibold mb-4">History</h3>
        {historyLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : history.length === 0 ? (
          <CustomCard className="p-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No history available</p>
          </CustomCard>
        ) : (
          <div className="space-y-2">
            {history.map((item) => (
              <CustomCard key={item.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CustomBadge
                        variant={
                          item.status === "success"
                            ? "success"
                            : item.status === "failed"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {item.status}
                      </CustomBadge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(item.occurredAt).toLocaleString()}
                      </span>
                    </div>
                    {item.message && (
                      <p className="text-sm mb-2">{item.message}</p>
                    )}
                    {item.error && (
                      <div className="flex items-start gap-2 mt-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-md">
                        <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {item.error}
                        </p>
                      </div>
                    )}
                    {item.metadata && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {Object.entries(item.metadata).map(([key, value]) => (
                          <span key={key} className="mr-4">
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CustomCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
