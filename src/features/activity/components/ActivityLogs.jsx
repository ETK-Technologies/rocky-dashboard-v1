"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Filter, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ErrorState } from "@/components/ui/ErrorState";
import { Pagination } from "@/components/ui/Pagination";
import { CustomButton } from "@/components/ui/CustomButton";
import { useActivityLogs } from "../hooks/useActivityLogs";
import { ActivityFilters } from "./ActivityFilters";
import { ActivityTable } from "./ActivityTable";

export function ActivityLogs() {
  const router = useRouter();
  const {
    logs,
    pagination,
    loading,
    error,
    filters,
    updateFilters,
    setPage,
    refresh,
  } = useActivityLogs();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const handleApplyFilters = useCallback(
    (payload) => {
      updateFilters(payload);
      setFiltersOpen(false);
    },
    [updateFilters]
  );

  const handleResetFilters = useCallback(() => {
    updateFilters({
      search: undefined,
      actorId: undefined,
      action: undefined,
      scope: undefined,
      status: undefined,
      targetType: undefined,
      targetId: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      limit: filters.limit,
    });
  }, [filters.limit, updateFilters]);

  const handlePageChange = useCallback(
    (page) => {
      setPage(page);
    },
    [setPage]
  );

  const handleViewDetails = useCallback(
    (activity) => {
      const activityId = activity?.id || activity?._id;
      if (!activityId) {
        toast.error("Unable to determine activity ID.");
        return;
      }

      router.push(`/dashboard/system/activity/${activityId}`);
    },
    [router]
  );

  const tableItems = useMemo(() => logs ?? [], [logs]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Activity"
        description="Review administrative actions and system events."
        action={
          <div className="flex items-center gap-2">
            <CustomButton
              variant="outline"
              size="sm"
              onClick={() =>
                setFiltersOpen((previous) => !previous)
              }
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              {filtersOpen ? "Hide Filters" : "Show Filters"}
            </CustomButton>
            <CustomButton
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </CustomButton>
          </div>
        }
      />

      {filtersOpen && (
        <ActivityFilters
          filters={filters}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          disabled={loading}
        />
      )}

      {error ? (
        <ErrorState
          title="Unable to load activity logs"
          message={error}
          onRetry={refresh}
        />
      ) : (
        <>
          <ActivityTable
            items={tableItems}
            loading={loading}
            onViewDetails={handleViewDetails}
          />
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={handlePageChange}
            disabled={loading}
            resourceName="activity logs"
          />
        </>
      )}
    </div>
  );
}
