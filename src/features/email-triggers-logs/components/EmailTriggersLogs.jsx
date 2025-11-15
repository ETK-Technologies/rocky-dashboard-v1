"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Filter, RefreshCw } from "lucide-react";
import {
  PageHeader,
  CustomCard,
  CustomCardHeader,
  CustomCardTitle,
  CustomCardContent,
  CustomButton,
  ErrorState,
  Pagination,
  CustomInput,
  CustomLabel,
} from "@/components/ui";
import { useEmailTriggersLogs, ALL_EMAIL_TRIGGERS } from "../hooks/useEmailTriggersLogs";
import { EmailTriggersTable } from "./EmailTriggersTable";

// Helper to convert date to YYYY-MM-DD format for input
const toDateInputValue = (value) => {
  if (!value) return "";
  if (typeof value === "string" && value.includes("T")) {
    // ISO date string
    return value.split("T")[0];
  }
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "";
    }
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return value || "";
  }
};

export default function EmailTriggersLogs() {
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
  } = useEmailTriggersLogs();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterValues, setFilterValues] = useState({
    emailTrigger: "",
    action: "",
    dateFrom: "",
    dateTo: "",
  });

  // Email action options
  const emailActions = [
    { value: "", label: "All Actions" },
    { value: "EMAIL_SEND_FAILED", label: "Email Failures Only" },
  ];

  // Sync filter values with current filters
  useEffect(() => {
    setFilterValues({
      emailTrigger: filters.emailTrigger || "",
      action: filters.action || "",
      dateFrom: toDateInputValue(filters.dateFrom),
      dateTo: toDateInputValue(filters.dateTo),
    });
  }, [filters.emailTrigger, filters.action, filters.dateFrom, filters.dateTo]);

  const handleApplyFilters = useCallback(() => {
    const filtersToApply = {
      page: 1,
    };

    if (filterValues.emailTrigger?.trim()) {
      filtersToApply.emailTrigger = filterValues.emailTrigger.trim();
    }

    if (filterValues.action?.trim()) {
      filtersToApply.action = filterValues.action.trim();
    }

    if (filterValues.dateFrom?.trim()) {
      filtersToApply.dateFrom = filterValues.dateFrom.trim();
    }

    if (filterValues.dateTo?.trim()) {
      filtersToApply.dateTo = filterValues.dateTo.trim();
    }

    updateFilters(filtersToApply);
    setFiltersOpen(false);
  }, [filterValues, updateFilters]);

  const handleResetFilters = useCallback(() => {
    setFilterValues({
      emailTrigger: "",
      action: "",
      dateFrom: "",
      dateTo: "",
    });
    updateFilters({
      page: 1,
      emailTrigger: undefined,
      action: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    });
  }, [updateFilters]);

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

      router.push(
        `/dashboard/email-templates/triggers-logs/${activityId}`
      );
    },
    [router]
  );

  const tableItems = useMemo(() => logs ?? [], [logs]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email Triggers Logs"
        description="View all email trigger logs including order, user, and subscription triggers. Filter by trigger type, action (failures), or date range."
        action={
          <div className="flex items-center gap-2">
            <CustomButton
              variant="outline"
              size="sm"
              onClick={() => setFiltersOpen(!filtersOpen)}
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
        <CustomCard className="mb-6">
          <CustomCardHeader>
            <CustomCardTitle>Filters</CustomCardTitle>
          </CustomCardHeader>
          <CustomCardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <CustomLabel htmlFor="emailTrigger">Email Trigger</CustomLabel>
                <select
                  id="emailTrigger"
                  value={filterValues.emailTrigger}
                  onChange={(e) =>
                    setFilterValues({
                      ...filterValues,
                      emailTrigger: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="">All Triggers</option>
                  {ALL_EMAIL_TRIGGERS.map((trigger) => (
                    <option key={trigger.value} value={trigger.value}>
                      {trigger.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <CustomLabel htmlFor="action">Action</CustomLabel>
                <select
                  id="action"
                  value={filterValues.action}
                  onChange={(e) =>
                    setFilterValues({
                      ...filterValues,
                      action: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  {emailActions.map((action) => (
                    <option key={action.value} value={action.value}>
                      {action.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <CustomLabel htmlFor="dateFrom">Date From</CustomLabel>
                <CustomInput
                  id="dateFrom"
                  type="date"
                  value={filterValues.dateFrom}
                  onChange={(e) =>
                    setFilterValues({
                      ...filterValues,
                      dateFrom: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <CustomLabel htmlFor="dateTo">Date To</CustomLabel>
                <CustomInput
                  id="dateTo"
                  type="date"
                  value={filterValues.dateTo}
                  onChange={(e) =>
                    setFilterValues({
                      ...filterValues,
                      dateTo: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <CustomButton onClick={handleApplyFilters}>Apply Filters</CustomButton>
              <CustomButton variant="outline" onClick={handleResetFilters}>
                Reset
              </CustomButton>
            </div>
          </CustomCardContent>
        </CustomCard>
      )}

      {error ? (
        <ErrorState
          title="Unable to load email trigger logs"
          message={error}
          onRetry={refresh}
        />
      ) : (
        <>
          <EmailTriggersTable
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
            resourceName="email trigger logs"
          />
        </>
      )}
    </div>
  );
}

