"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  PlayCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Pause,
  Activity,
  AlertTriangle,
  ArrowRight,
  Database,
} from "lucide-react";
import { CustomCard, CustomButton, CustomBadge } from "@/components/ui";
import { useJobsOverview } from "../hooks/useJobsOverview";
import { cn } from "@/utils/cn";

/**
 * JobsOverview component for displaying jobs dashboard
 */
export function JobsOverview() {
  const router = useRouter();
  const { overview, loading, error, fetchOverview } = useJobsOverview(true, 20);
  const [refreshing, setRefreshing] = useState(false);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!refreshing) {
        fetchOverview();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchOverview, refreshing]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchOverview();
    } finally {
      setRefreshing(false);
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

  if (loading && !overview) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !overview) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <CustomButton onClick={handleRefresh} disabled={refreshing}>
          Retry
        </CustomButton>
      </div>
    );
  }

  if (!overview) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <CustomCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Active</p>
              <p className="text-2xl font-bold mt-1">
                {overview.totalActive || 0}
              </p>
            </div>
            <Activity className="h-8 w-8 text-blue-600" />
          </div>
        </CustomCard>

        <CustomCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Failed</p>
              <p className="text-2xl font-bold mt-1">
                {overview.totalFailed || 0}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </CustomCard>

        <CustomCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Queues</p>
              <p className="text-2xl font-bold mt-1">
                {overview.queues?.length || 0}
              </p>
            </div>
            <Database className="h-8 w-8 text-purple-600" />
          </div>
        </CustomCard>

        <CustomCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Recent Jobs</p>
              <p className="text-2xl font-bold mt-1">
                {overview.recentJobs?.length || 0}
              </p>
            </div>
            <Clock className="h-8 w-8 text-green-600" />
          </div>
        </CustomCard>
      </div>

      {/* Queues */}
      {overview.queues && overview.queues.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Queue Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {overview.queues.map((queue) => (
              <CustomCard key={queue.name} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold capitalize">{queue.name}</h4>
                  <CustomButton
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      router.push(
                        `/dashboard/admin-jobs/queues?queue=${queue.name}`
                      )
                    }
                  >
                    View Details
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </CustomButton>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Waiting</p>
                    <p className="text-lg font-semibold">
                      {queue.waiting || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active</p>
                    <p className="text-lg font-semibold">{queue.active || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-lg font-semibold">
                      {queue.completed || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Failed</p>
                    <p className="text-lg font-semibold text-red-600">
                      {queue.failed || 0}
                    </p>
                  </div>
                  {queue.delayed > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Delayed</p>
                      <p className="text-lg font-semibold">
                        {queue.delayed || 0}
                      </p>
                    </div>
                  )}
                  {queue.paused > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Paused</p>
                      <p className="text-lg font-semibold">
                        {queue.paused || 0}
                      </p>
                    </div>
                  )}
                </div>
              </CustomCard>
            ))}
          </div>
        </div>
      )}

      {/* Recent Jobs */}
      {overview.recentJobs && overview.recentJobs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Jobs</h3>
            <CustomButton
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/admin-jobs/queues")}
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </CustomButton>
          </div>
          <CustomCard className="p-6">
            <div className="space-y-4">
              {overview.recentJobs.slice(0, 10).map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() =>
                    router.push(
                      `/dashboard/admin-jobs/queues?queue=${
                        job.name?.includes("renewal")
                          ? "renewals"
                          : "product-import"
                      }&job=${job.id}`
                    )
                  }
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{job.name}</span>
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
                        <span className="text-sm text-muted-foreground">
                          {job.progress}%
                        </span>
                      </div>
                    )}
                    {job.failedReason && (
                      <p className="text-sm text-red-600 mt-1">
                        {job.failedReason}
                      </p>
                    )}
                  </div>
                  <div className="ml-4 text-right">
                    {job.timestamp && (
                      <p className="text-sm text-muted-foreground">
                        {new Date(job.timestamp).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CustomCard>
        </div>
      )}

      {/* Product Import Jobs */}
      {overview.productImportJobs && overview.productImportJobs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Product Import Jobs</h3>
            <CustomButton
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/products/import-jobs")}
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </CustomButton>
          </div>
          <CustomCard className="p-6">
            <div className="space-y-4">
              {overview.productImportJobs.slice(0, 5).map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{job.fileName}</span>
                      <CustomBadge
                        variant={
                          job.status === "COMPLETED"
                            ? "success"
                            : job.status === "FAILED"
                            ? "destructive"
                            : job.status === "PROCESSING"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {job.status}
                      </CustomBadge>
                    </div>
                    {job.totalCount !== undefined && (
                      <p className="text-sm text-muted-foreground">
                        {job.successCount || 0} / {job.totalCount} successful
                        {job.failedCount > 0 && (
                          <span className="text-red-600 ml-2">
                            {job.failedCount} failed
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  <div className="ml-4 text-right">
                    {job.createdAt && (
                      <p className="text-sm text-muted-foreground">
                        {new Date(job.createdAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CustomCard>
        </div>
      )}
    </div>
  );
}
