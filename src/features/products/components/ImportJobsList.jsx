"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  Eye,
  AlertCircle,
  FileText,
} from "lucide-react";
import { CustomBadge, CustomButton, CustomCard } from "@/components/ui";
import { cn } from "@/utils/cn";
import { useProductImport } from "../hooks/useProductImport";

/**
 * ImportJobsList component for displaying recent product import jobs
 * @param {Object} props - Component props
 * @param {number} props.limit - Maximum number of jobs to display (default: 10)
 * @param {Function} props.onJobClick - Callback when a job is clicked (optional)
 */
export function ImportJobsList({ limit = 10, onJobClick }) {
  const { importJobs, fetchImportJobs, fetchJobStatus, loading } =
    useProductImport();
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [expandedErrorLogs, setExpandedErrorLogs] = useState(new Set());
  const [expandedDetailedLogs, setExpandedDetailedLogs] = useState(new Set());
  const [refreshing, setRefreshing] = useState(false);

  const ERROR_LOG_PREVIEW_COUNT = 5;
  const DETAIL_LOG_PREVIEW_COUNT = 20;

  // Fetch jobs on mount
  useEffect(() => {
    fetchImportJobs();
  }, [fetchImportJobs]);

  // Set up auto-refresh for active jobs
  useEffect(() => {
    const hasActiveJobs = importJobs.some(
      (job) => job.status === "PENDING" || job.status === "PROCESSING"
    );

    if (!hasActiveJobs) return;

    // Auto-refresh every 5 seconds if there are active jobs
    const interval = setInterval(() => {
      fetchImportJobs();
    }, 5000);

    return () => clearInterval(interval);
  }, [importJobs, fetchImportJobs]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchImportJobs();
    } finally {
      setRefreshing(false);
    }
  };

  // Handle job click
  const handleJobClick = async (job) => {
    if (onJobClick) {
      onJobClick(job);
    } else {
      // Toggle expanded state
      if (expandedJobId === job.id) {
        setExpandedJobId(null);
      } else {
        setExpandedJobId(job.id);
        // Fetch latest status if job is active
        if (job.status === "PENDING" || job.status === "PROCESSING") {
          try {
            await fetchJobStatus(job.id);
          } catch (err) {
            console.error("Error fetching job status:", err);
          }
        }
      }
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: {
        variant: "outline",
        icon: Clock,
        label: "Pending",
        color: "text-yellow-600 dark:text-yellow-400",
      },
      PROCESSING: {
        variant: "default",
        icon: Loader2,
        label: "Processing",
        color: "text-blue-600 dark:text-blue-400",
        spinning: true,
      },
      COMPLETED: {
        variant: "default",
        icon: CheckCircle2,
        label: "Completed",
        color: "text-green-600 dark:text-green-400",
      },
      FAILED: {
        variant: "destructive",
        icon: XCircle,
        label: "Failed",
        color: "text-red-600 dark:text-red-400",
      },
      CANCELLED: {
        variant: "outline",
        icon: XCircle,
        label: "Cancelled",
        color: "text-gray-600 dark:text-gray-400",
      },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <CustomBadge
        variant={config.variant}
        className="flex items-center gap-1.5"
      >
        <Icon
          className={cn(
            "h-3.5 w-3.5",
            config.color,
            config.spinning && "animate-spin"
          )}
        />
        {config.label}
      </CustomBadge>
    );
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const getLogLevelStyles = (level = "") => {
    const normalized = level.toLowerCase();
    switch (normalized) {
      case "error":
        return {
          badgeClass:
            "bg-destructive/20 text-destructive border border-destructive/40",
          label: "ERROR",
        };
      case "warn":
      case "warning":
        return {
          badgeClass:
            "bg-yellow-100 text-yellow-800 border border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-900/60",
          label: "WARN",
        };
      case "debug":
        return {
          badgeClass:
            "bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-900/40 dark:text-slate-100 dark:border-slate-700/60",
          label: "DEBUG",
        };
      case "info":
      default:
        return {
          badgeClass: "bg-primary/10 text-primary border border-primary/40",
          label: (level || "INFO").toUpperCase(),
        };
    }
  };

  const formatMetaKey = (key = "") =>
    key
      .replace(/[_\-\s]+/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^./, (str) => str.toUpperCase());

  const normalizeLogEntry = (entry, fallbackLevel = "info") => {
    if (entry == null) {
      return {
        level: fallbackLevel,
        message: "",
      };
    }

    if (
      typeof entry === "string" ||
      typeof entry === "number" ||
      typeof entry === "boolean"
    ) {
      return {
        level: fallbackLevel,
        message: String(entry),
      };
    }

    if (typeof entry !== "object") {
      return {
        level: fallbackLevel,
        message: JSON.stringify(entry),
      };
    }

    const normalized = {
      ...entry,
      level: entry.level || fallbackLevel,
    };

    if (!normalized.message && normalized.error) {
      normalized.message = normalized.error;
    }

    return normalized;
  };

  const getLogEntryMeta = (entry) => {
    const reservedKeys = new Set(["level", "message", "timestamp"]);
    const scalarMeta = [];
    const structuredMeta = [];

    Object.entries(entry).forEach(([key, value]) => {
      if (
        reservedKeys.has(key) ||
        value === null ||
        value === undefined ||
        value === ""
      ) {
        return;
      }

      if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        scalarMeta.push([key, value]);
        return;
      }

      structuredMeta.push([key, value]);
    });

    return { scalarMeta, structuredMeta };
  };

  const renderLogEntries = (
    entries,
    {
      jobId,
      fallbackLevel,
      isExpanded,
      previewCount,
      expandedSet,
      setExpandedSet,
      toggleLabelFormatter,
    }
  ) => {
    if (!entries || entries.length === 0) return null;

    const visibleEntries = isExpanded
      ? entries
      : entries.slice(0, previewCount);

    return (
      <>
        <div
          className={cn(
            "border border-border rounded-lg bg-muted/20 text-xs overflow-y-auto",
            isExpanded ? "max-h-[28rem]" : "max-h-60"
          )}
        >
          <ul className="divide-y divide-border/60">
            {visibleEntries.map((entry, index) => {
              const normalized = normalizeLogEntry(entry, fallbackLevel);
              const { badgeClass, label } = getLogLevelStyles(normalized.level);
              const { scalarMeta, structuredMeta } =
                getLogEntryMeta(normalized);
              const messageClass =
                normalized.level?.toLowerCase() === "error"
                  ? "text-destructive"
                  : "text-foreground";

              return (
                <li
                  key={`${jobId}-${fallbackLevel}-log-${index}`}
                  className="p-3 hover:bg-muted/30 transition-colors space-y-2"
                >
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded-md font-semibold tracking-wide",
                        badgeClass
                      )}
                    >
                      {label}
                    </span>
                    {normalized.timestamp && (
                      <span className="font-mono text-muted-foreground">
                        {formatDateTime(normalized.timestamp)}
                      </span>
                    )}
                    {scalarMeta.map(([key, value]) => (
                      <span key={key} className="text-muted-foreground">
                        {formatMetaKey(key)}:{" "}
                        <span className="font-mono">{String(value)}</span>
                      </span>
                    ))}
                  </div>

                  {normalized.message && (
                    <p className={cn("text-sm leading-relaxed", messageClass)}>
                      {normalized.message}
                    </p>
                  )}

                  {structuredMeta.map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <p className="text-[11px] text-muted-foreground tracking-wide font-semibold uppercase">
                        {formatMetaKey(key)}
                      </p>
                      <pre className="bg-background/70 border border-border/60 rounded-lg p-2 text-[11px] font-mono whitespace-pre-wrap break-words">
                        {JSON.stringify(value, null, 2)}
                      </pre>
                    </div>
                  ))}
                </li>
              );
            })}
          </ul>
        </div>

        {entries.length > previewCount && (
          <div
            className="p-2 text-center text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors font-medium"
            onClick={(e) => {
              e.stopPropagation();
              setExpandedSet((prev) => {
                const newSet = new Set(prev);
                if (newSet.has(jobId)) {
                  newSet.delete(jobId);
                } else {
                  newSet.add(jobId);
                }
                return newSet;
              });
            }}
          >
            {toggleLabelFormatter(isExpanded, entries.length, previewCount)}
          </div>
        )}
      </>
    );
  };

  // Calculate progress
  const getProgress = (job) => {
    if (!job.totalCount) return 0;
    const processed = (job.successCount || 0) + (job.failedCount || 0);
    return Math.round((processed / job.totalCount) * 100);
  };

  const displayedJobs = importJobs.slice(0, limit);
  const activeJobs = importJobs.filter(
    (job) => job.status === "PENDING" || job.status === "PROCESSING"
  );
  const hasActiveJobs = activeJobs.length > 0;

  if (loading && importJobs.length === 0) {
    return (
      <CustomCard className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </CustomCard>
    );
  }

  if (importJobs.length === 0) {
    return (
      <CustomCard className="p-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">No import jobs found</p>
        </div>
      </CustomCard>
    );
  }

  return (
    <CustomCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">Import Jobs</h3>
          {hasActiveJobs && (
            <CustomBadge
              variant="default"
              className="flex items-center gap-1.5"
            >
              <Loader2 className="h-3 w-3 animate-spin" />
              {activeJobs.length} Active
            </CustomBadge>
          )}
        </div>
        <CustomButton
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          Refresh
        </CustomButton>
      </div>

      {/* Active Jobs Banner */}
      {hasActiveJobs && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
            <span className="text-blue-900 dark:text-blue-100 font-medium">
              {activeJobs.length} job{activeJobs.length > 1 ? "s" : ""}{" "}
              currently processing.
            </span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {displayedJobs.map((job) => {
          const isExpanded = expandedJobId === job.id;
          const progress = getProgress(job);

          const isActive =
            job.status === "PENDING" || job.status === "PROCESSING";

          return (
            <div
              key={job.id}
              className={cn(
                "border rounded-lg transition-all",
                isExpanded && "bg-muted/30",
                isActive
                  ? "border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/10"
                  : "border-border"
              )}
            >
              {/* Clickable Header */}
              <div
                className={cn(
                  "flex items-start justify-between gap-4 p-4 cursor-pointer",
                  "hover:bg-muted/50 transition-colors"
                )}
                onClick={() => handleJobClick(job)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-sm font-semibold truncate">
                      {job.fileName || "Untitled Import"}
                    </h4>
                    {getStatusBadge(job.status)}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{formatFileSize(job.fileSize)}</span>
                    <span>•</span>
                    <span>{formatDate(job.createdAt)}</span>
                    {job.totalCount > 0 && (
                      <>
                        <span>•</span>
                        <span>
                          {job.successCount || 0} / {job.totalCount} products
                        </span>
                      </>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {job.totalCount > 0 &&
                    (job.status === "PROCESSING" ||
                      job.status === "COMPLETED") && (
                      <div className="mt-3 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            Progress
                          </span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className={cn(
                              "h-1.5 rounded-full transition-all duration-300",
                              job.status === "COMPLETED"
                                ? "bg-green-500"
                                : "bg-primary"
                            )}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJobClick(job);
                  }}
                  className="p-1.5 rounded-lg hover:bg-accent transition-colors flex-shrink-0"
                  title="View details"
                >
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div
                  className="px-4 pb-4 pt-4 border-t border-border space-y-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Job ID
                      </p>
                      <p className="font-mono text-xs">{job.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Created At
                      </p>
                      <p className="text-xs">{formatDateTime(job.createdAt)}</p>
                    </div>
                    {job.startedAt && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Started At
                        </p>
                        <p className="text-xs">
                          {formatDateTime(job.startedAt)}
                        </p>
                      </div>
                    )}
                    {job.completedAt && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Completed At
                        </p>
                        <p className="text-xs">
                          {formatDateTime(job.completedAt)}
                        </p>
                      </div>
                    )}
                    {job.status && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Final Status
                        </p>
                        <p className="text-xs font-medium uppercase">
                          {job.status}
                        </p>
                      </div>
                    )}
                    {job.createdBy && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Created By
                        </p>
                        <p className="text-xs">
                          {job.createdBy?.name ||
                            job.createdBy?.email ||
                            job.createdBy?.id ||
                            "Unknown"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Statistics */}
                  {job.totalCount > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-muted/50 rounded-lg text-center">
                        <p className="text-lg font-bold">{job.totalCount}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Total
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          {job.successCount || 0}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Success
                        </p>
                      </div>
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                        <p className="text-lg font-bold text-red-600 dark:text-red-400">
                          {job.failedCount || 0}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Failed
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Error Log */}
                  {job.errorLog && job.errorLog.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <h5 className="text-sm font-semibold">Error Log</h5>
                        <CustomBadge variant="destructive" className="text-xs">
                          {job.errorLog.length}
                        </CustomBadge>
                      </div>
                      {renderLogEntries(job.errorLog, {
                        jobId: job.id,
                        fallbackLevel: "error",
                        isExpanded: expandedErrorLogs.has(job.id),
                        previewCount: ERROR_LOG_PREVIEW_COUNT,
                        expandedSet: expandedErrorLogs,
                        setExpandedSet: setExpandedErrorLogs,
                        toggleLabelFormatter: (isExpanded, total, preview) =>
                          isExpanded
                            ? `Show less (showing all ${total} errors)`
                            : `+${total - preview} more errors`,
                      })}
                    </div>
                  )}

                  {/* Detailed Log */}
                  {job.detailedLog && job.detailedLog.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <h5 className="text-sm font-semibold">Detailed Log</h5>
                        <CustomBadge variant="outline" className="text-xs">
                          {job.detailedLog.length}
                        </CustomBadge>
                      </div>

                      {renderLogEntries(job.detailedLog, {
                        jobId: job.id,
                        fallbackLevel: "info",
                        isExpanded: expandedDetailedLogs.has(job.id),
                        previewCount: DETAIL_LOG_PREVIEW_COUNT,
                        expandedSet: expandedDetailedLogs,
                        setExpandedSet: setExpandedDetailedLogs,
                        toggleLabelFormatter: (isExpanded, total, preview) =>
                          isExpanded
                            ? `Show less (showing all ${total} entries)`
                            : `+${total - preview} more entries`,
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {importJobs.length > limit && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Showing {limit} of {importJobs.length} jobs
        </div>
      )}
    </CustomCard>
  );
}
