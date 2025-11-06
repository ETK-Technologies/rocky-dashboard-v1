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
  const [refreshing, setRefreshing] = useState(false);

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
                      <p className="text-xs">
                        {new Date(job.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {job.startedAt && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Started At
                        </p>
                        <p className="text-xs">
                          {new Date(job.startedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                    {job.completedAt && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Completed At
                        </p>
                        <p className="text-xs">
                          {new Date(job.completedAt).toLocaleString()}
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
                      <div
                        className={cn(
                          "overflow-y-auto border border-border rounded-lg text-xs",
                          expandedErrorLogs.has(job.id)
                            ? "max-h-96"
                            : "max-h-32"
                        )}
                      >
                        <table className="w-full">
                          <thead className="bg-muted/50 sticky top-0">
                            <tr>
                              <th className="px-2 py-1.5 text-left text-xs font-semibold text-muted-foreground">
                                Row
                              </th>
                              <th className="px-2 py-1.5 text-left text-xs font-semibold text-muted-foreground">
                                SKU
                              </th>
                              <th className="px-2 py-1.5 text-left text-xs font-semibold text-muted-foreground">
                                Error
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {(expandedErrorLogs.has(job.id)
                              ? job.errorLog
                              : job.errorLog.slice(0, 5)
                            ).map((error, index) => (
                              <tr key={index} className="hover:bg-muted/30">
                                <td className="px-2 py-1.5 font-mono text-xs">
                                  {error.row || "N/A"}
                                </td>
                                <td className="px-2 py-1.5 font-mono text-xs">
                                  {error.sku || "N/A"}
                                </td>
                                <td className="px-2 py-1.5 text-xs text-destructive">
                                  {error.message || "Unknown error"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {job.errorLog.length > 5 && (
                          <div
                            className="p-2 text-center text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors font-medium"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedErrorLogs((prev) => {
                                const newSet = new Set(prev);
                                if (newSet.has(job.id)) {
                                  newSet.delete(job.id);
                                } else {
                                  newSet.add(job.id);
                                }
                                return newSet;
                              });
                            }}
                          >
                            {expandedErrorLogs.has(job.id) ? (
                              <>
                                Show less (showing all {job.errorLog.length}{" "}
                                errors)
                              </>
                            ) : (
                              <>+{job.errorLog.length - 5} more errors</>
                            )}
                          </div>
                        )}
                      </div>
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
