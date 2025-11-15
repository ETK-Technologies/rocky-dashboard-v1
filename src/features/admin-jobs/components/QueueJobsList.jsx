"use client";

import { useState, useEffect } from "react";
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  PlayCircle,
  Pause,
  ChevronDown,
  ChevronRight,
  FileText,
  AlertCircle,
} from "lucide-react";
import {
  CustomCard,
  CustomButton,
  CustomBadge,
  CustomInput,
} from "@/components/ui";
import { useQueueJobs } from "../hooks/useQueueJobs";
import { cn } from "@/utils/cn";

/**
 * QueueJobsList component for displaying jobs in a queue
 * @param {Object} props - Component props
 * @param {string} props.queueName - Queue name
 * @param {string} props.stateFilter - Initial state filter (optional)
 * @param {number} props.limit - Number of jobs to fetch (default: 50)
 */
export function QueueJobsList({ queueName, stateFilter, limit = 50 }) {
  const {
    queue,
    jobs,
    loading,
    error,
    fetchQueueDetails,
    fetchQueueJobs,
    fetchJobDetails,
    refresh,
  } = useQueueJobs(queueName, {
    autoFetch: !!queueName,
    state: stateFilter,
    limit,
  });

  const [selectedState, setSelectedState] = useState(stateFilter || "");
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Auto-refresh every 10 seconds if there are active jobs
  useEffect(() => {
    const hasActiveJobs = jobs.some(
      (job) => job.state === "active" || job.state === "waiting"
    );

    if (!hasActiveJobs) return;

    const interval = setInterval(() => {
      if (!refreshing) {
        refresh();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [jobs, refreshing, refresh]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  // Handle state filter change
  const handleStateFilterChange = (state) => {
    setSelectedState(state);
    // Update URL to reflect state filter
    const params = new URLSearchParams(window.location.search);
    if (state) {
      params.set("state", state);
    } else {
      params.delete("state");
    }
    window.history.pushState({}, "", `?${params.toString()}`);
    // Refetch jobs with new filter
    if (queueName) {
      fetchQueueJobs({ state, limit });
    }
  };

  // Handle job click
  const handleJobClick = async (job) => {
    if (expandedJobId === job.id) {
      setExpandedJobId(null);
      setSelectedJob(null);
    } else {
      setExpandedJobId(job.id);
      // Fetch full job details
      try {
        const jobDetails = await fetchJobDetails(job.id);
        setSelectedJob(jobDetails);
      } catch (err) {
        console.error("Error fetching job details:", err);
        setSelectedJob(job);
      }
    }
  };

  // Get state badge variant
  const getStateBadgeVariant = (state) => {
    switch (state) {
      case "completed":
        return "success";
      case "failed":
        return "destructive";
      case "active":
        return "default";
      case "waiting":
        return "secondary";
      case "delayed":
        return "outline";
      case "paused":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStateIcon = (state) => {
    switch (state) {
      case "completed":
        return CheckCircle2;
      case "failed":
        return XCircle;
      case "active":
        return PlayCircle;
      case "paused":
        return Pause;
      default:
        return Clock;
    }
  };

  if (loading && !jobs.length) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !jobs.length) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <CustomButton onClick={handleRefresh} disabled={refreshing}>
          Retry
        </CustomButton>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold capitalize">
            {queueName} Queue
          </h2>
          {queue && (
            <p className="text-muted-foreground">
              {queue.waiting || 0} waiting, {queue.active || 0} active,{" "}
              {queue.completed || 0} completed, {queue.failed || 0} failed
            </p>
          )}
        </div>
        <CustomButton
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw
            className={cn("h-4 w-4", refreshing && "animate-spin")}
          />
          Refresh
        </CustomButton>
      </div>

      {/* State Filter */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Filter by state:</label>
        <select
          value={selectedState}
          onChange={(e) => handleStateFilterChange(e.target.value)}
          className={cn(
            "flex h-10 rounded-md border px-3 py-2 text-sm transition-colors",
            "bg-white text-gray-900 border-gray-300",
            "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600",
            "focus:outline-none focus:ring-2 focus:ring-offset-2",
            "focus:ring-primary focus:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          <option value="">All States</option>
          <option value="waiting">Waiting</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="delayed">Delayed</option>
          <option value="paused">Paused</option>
        </select>
      </div>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <CustomCard className="p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No jobs found</p>
        </CustomCard>
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => {
            const StateIcon = getStateIcon(job.state);
            const isExpanded = expandedJobId === job.id;
            const jobToShow = isExpanded && selectedJob ? selectedJob : job;

            return (
              <CustomCard key={job.id} className="p-4">
                <div
                  className="cursor-pointer"
                  onClick={() => handleJobClick(job)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <StateIcon
                        className={cn(
                          "h-5 w-5",
                          job.state === "completed" && "text-green-600",
                          job.state === "failed" && "text-red-600",
                          job.state === "active" && "text-blue-600",
                          job.state === "waiting" && "text-yellow-600"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">
                            {job.name || job.id}
                          </span>
                          <CustomBadge variant={getStateBadgeVariant(job.state)}>
                            {job.state}
                          </CustomBadge>
                        </div>
                        {job.progress !== undefined && (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all"
                                style={{ width: `${job.progress}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              {job.progress}%
                            </span>
                          </div>
                        )}
                        {job.failedReason && (
                          <p className="text-sm text-red-600 mt-1 line-clamp-1">
                            {job.failedReason}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        {job.timestamp && (
                          <p>{new Date(job.timestamp).toLocaleString()}</p>
                        )}
                      </div>
                      <div className="ml-2">
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Job Details */}
                {isExpanded && jobToShow && (
                  <div className="mt-4 pt-4 border-t border-border space-y-4">
                    {/* Job Data */}
                    {jobToShow.data && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">
                          Job Data
                        </h4>
                        <pre className="p-3 bg-muted rounded-md text-xs overflow-auto">
                          {JSON.stringify(jobToShow.data, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Logs */}
                    {jobToShow.logs && jobToShow.logs.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Logs</h4>
                        <div className="p-3 bg-muted rounded-md max-h-48 overflow-auto">
                          {jobToShow.logs.map((log, index) => (
                            <p key={index} className="text-xs mb-1 font-mono">
                              {log}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Failed Reason */}
                    {jobToShow.failedReason && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          Error
                        </h4>
                        <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-md">
                          <p className="text-sm text-red-600 dark:text-red-400">
                            {jobToShow.failedReason}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Timestamps */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {jobToShow.createdAt && (
                        <div>
                          <span className="text-muted-foreground">
                            Created:
                          </span>
                          <p>
                            {new Date(jobToShow.createdAt).toLocaleString()}
                          </p>
                        </div>
                      )}
                      {jobToShow.completedAt && (
                        <div>
                          <span className="text-muted-foreground">
                            Completed:
                          </span>
                          <p>
                            {new Date(jobToShow.completedAt).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CustomCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

