"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Eye,
  RefreshCw,
  Calendar,
  User as UserIcon,
} from "lucide-react";
import {
  CustomBadge,
  CustomButton,
  CustomInput,
  DataTable,
  ErrorState,
  IconButton,
  PageContainer,
  PageHeader,
  Pagination,
} from "@/components/ui";
import { useSubscriptions } from "../hooks/useSubscriptions";

const STATUS_OPTIONS = [
  "ACTIVE",
  "TRIALING",
  "PAST_DUE",
  "CANCELED",
  "UNPAID",
  "INCOMPLETE",
  "INCOMPLETE_EXPIRED",
  "PAUSED",
];

const STATUS_STYLES = {
  ACTIVE: {
    label: "Active",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-200",
  },
  TRIALING: {
    label: "Trialing",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-400/20 dark:text-blue-200",
  },
  PAST_DUE: {
    label: "Past Due",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-400/20 dark:text-amber-200",
  },
  CANCELED: {
    label: "Canceled",
    className:
      "bg-rose-100 text-rose-700 dark:bg-rose-400/20 dark:text-rose-200",
  },
  UNPAID: {
    label: "Unpaid",
    className: "bg-red-100 text-red-700 dark:bg-red-400/20 dark:text-red-200",
  },
  INCOMPLETE: {
    label: "Incomplete",
    className:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-400/20 dark:text-yellow-200",
  },
  INCOMPLETE_EXPIRED: {
    label: "Incomplete Expired",
    className:
      "bg-orange-100 text-orange-700 dark:bg-orange-400/20 dark:text-orange-200",
  },
  PAUSED: {
    label: "Paused",
    className:
      "bg-slate-100 text-slate-700 dark:bg-slate-400/20 dark:text-slate-200",
  },
};

const BILLING_INTERVAL_OPTIONS = ["DAY", "WEEK", "MONTH", "YEAR"];

const LIMIT_OPTIONS = [
  { value: "10", label: "10 per page" },
  { value: "20", label: "20 per page" },
  { value: "50", label: "50 per page" },
  { value: "100", label: "100 per page" },
];

const formatCurrency = (amount, currency = "USD") => {
  if (amount === undefined || amount === null || Number.isNaN(Number(amount))) {
    return "-";
  }

  try {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      currencyDisplay: "narrowSymbol",
    }).format(Number(amount));

    if (/^[A-Z]{1,3}\$/.test(formatted)) {
      return formatted.replace(/^[A-Z]{1,3}/, "");
    }

    return formatted;
  } catch {
    return `${currency || ""} ${Number(amount).toFixed(2)}`;
  }
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleString();
};

export default function Subscriptions() {
  const router = useRouter();
  const {
    subscriptions,
    loading,
    error,
    pagination,
    updateFilters,
    filters,
    refresh,
  } = useSubscriptions();
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [showFilters, setShowFilters] = useState(false);
  const [filterValues, setFilterValues] = useState({
    status: Array.isArray(filters.status) ? filters.status : [],
    billingInterval: Array.isArray(filters.billingInterval)
      ? filters.billingInterval
      : [],
    userId: filters.userId || "",
    dateFrom: filters.dateFrom || "",
    dateTo: filters.dateTo || "",
    limit: String(filters.limit || 20),
  });

  useEffect(() => {
    setFilterValues((prev) => ({
      ...prev,
      status: Array.isArray(filters.status) ? filters.status : [],
      billingInterval: Array.isArray(filters.billingInterval)
        ? filters.billingInterval
        : [],
      userId: filters.userId || "",
      dateFrom: filters.dateFrom || "",
      dateTo: filters.dateTo || "",
      limit: String(filters.limit || prev.limit || 20),
    }));
    setSearchTerm(filters.search || "");
  }, [
    filters.status,
    filters.billingInterval,
    filters.userId,
    filters.dateFrom,
    filters.dateTo,
    filters.limit,
    filters.search,
  ]);

  const applyFilterState = (newState) => {
    setFilterValues(newState);

    const appliedFilters = {
      page: 1,
      limit: Number(newState.limit) || 20,
    };

    if (searchTerm && searchTerm.trim() !== "") {
      appliedFilters.search = searchTerm.trim();
    } else {
      appliedFilters.search = undefined;
    }

    if (newState.userId && newState.userId.trim() !== "") {
      appliedFilters.userId = newState.userId.trim();
    } else {
      appliedFilters.userId = undefined;
    }

    if (newState.dateFrom) {
      appliedFilters.dateFrom = newState.dateFrom;
    } else {
      appliedFilters.dateFrom = undefined;
    }

    if (newState.dateTo) {
      appliedFilters.dateTo = newState.dateTo;
    } else {
      appliedFilters.dateTo = undefined;
    }

    if (Array.isArray(newState.status) && newState.status.length > 0) {
      appliedFilters.status = newState.status;
    } else {
      appliedFilters.status = undefined;
    }

    if (
      Array.isArray(newState.billingInterval) &&
      newState.billingInterval.length > 0
    ) {
      appliedFilters.billingInterval = newState.billingInterval;
    } else {
      appliedFilters.billingInterval = undefined;
    }

    updateFilters(appliedFilters);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (value.trim()) {
      updateFilters({ search: value.trim(), page: 1 });
    } else {
      updateFilters({ search: undefined, page: 1 });
    }
  };

  const handleStatusToggle = (status) => {
    const currentStatuses = Array.isArray(filterValues.status)
      ? filterValues.status
      : [];
    const isSelected = currentStatuses.includes(status);

    const updatedStatus = isSelected
      ? currentStatuses.filter((item) => item !== status)
      : [...currentStatuses, status];

    applyFilterState({
      ...filterValues,
      status: updatedStatus,
    });
  };

  const handleBillingIntervalToggle = (interval) => {
    const currentIntervals = Array.isArray(filterValues.billingInterval)
      ? filterValues.billingInterval
      : [];
    const isSelected = currentIntervals.includes(interval);

    const updatedIntervals = isSelected
      ? currentIntervals.filter((item) => item !== interval)
      : [...currentIntervals, interval];

    applyFilterState({
      ...filterValues,
      billingInterval: updatedIntervals,
    });
  };

  const handleFilterChange = (key, value) => {
    applyFilterState({
      ...filterValues,
      [key]: value,
    });
  };

  const handleRefresh = () => {
    if (!loading) {
      refresh();
    }
  };

  const renderPageHeader = (actionLabel = "Refresh") => (
    <PageHeader
      title="Subscriptions"
      description="View and manage customer subscriptions"
      action={
        <CustomButton
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4" />
          {actionLabel}
        </CustomButton>
      }
    />
  );

  const handleClearFilters = () => {
    const resetState = {
      status: [],
      billingInterval: [],
      userId: "",
      dateFrom: "",
      dateTo: "",
      limit: "20",
    };

    setSearchTerm("");
    applyFilterState(resetState);
  };

  const hasActiveFilters =
    (Array.isArray(filterValues.status) && filterValues.status.length > 0) ||
    (Array.isArray(filterValues.billingInterval) &&
      filterValues.billingInterval.length > 0) ||
    (searchTerm && searchTerm.trim() !== "") ||
    (filterValues.userId && filterValues.userId.trim() !== "") ||
    filterValues.dateFrom ||
    filterValues.dateTo ||
    filterValues.limit !== "20";

  const getStatusDisplay = (status) => {
    if (!status) {
      return {
        label: "Unknown",
        className:
          "bg-slate-100 text-slate-700 dark:bg-slate-400/20 dark:text-slate-200",
      };
    }

    const normalized = status.toUpperCase();
    return (
      STATUS_STYLES[normalized] || {
        label: normalized.replace(/_/g, " "),
        className:
          "bg-secondary text-secondary-foreground dark:bg-slate-400/20 dark:text-slate-200",
      }
    );
  };

  const columns = useMemo(
    () => [
      {
        key: "id",
        label: "Subscription",
        width: "220px",
        render: (subscription) => {
          const subscriptionId =
            subscription.id || subscription.subscriptionId || "-";
          const wordpressId =
            subscription.wordpressId || subscription.wordpress_id;
          const createdAt = formatDate(
            subscription.createdAt || subscription.created_at
          );

          return (
            <div className="flex flex-col">
              <span className="font-medium text-foreground">
                {subscriptionId}
              </span>
              {wordpressId && (
                <span className="text-xs text-muted-foreground mt-0.5">
                  WP ID: {wordpressId}
                </span>
              )}
              <span className="text-xs text-muted-foreground mt-1">
                Created {createdAt}
              </span>
            </div>
          );
        },
      },
      {
        key: "customer",
        label: "Customer",
        width: "240px",
        render: (subscription) => {
          const user = subscription.user || subscription.customer || {};
          const name =
            user.fullName ||
            [user.firstName, user.lastName].filter(Boolean).join(" ") ||
            user.email ||
            "Unknown";
          const email = user.email;

          return (
            <div className="flex flex-col">
              <span className="font-medium text-foreground truncate">
                {name}
              </span>
              {email && (
                <span className="text-xs text-muted-foreground truncate mt-1">
                  {email}
                </span>
              )}
              {user.id && (
                <span className="text-xs text-muted-foreground truncate mt-0.5">
                  ID: {user.id}
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: "status",
        label: "Status",
        width: "160px",
        render: (subscription) => {
          const { label, className } = getStatusDisplay(subscription.status);
          return (
            <CustomBadge variant="outline" className={className}>
              {label}
            </CustomBadge>
          );
        },
      },
      {
        key: "billingInterval",
        label: "Billing",
        width: "140px",
        render: (subscription) => {
          const interval =
            subscription.billingInterval ||
            subscription.billing_interval ||
            "-";
          const count =
            subscription.billingIntervalCount ||
            subscription.billing_interval_count ||
            1;
          return (
            <span className="text-sm text-foreground">
              {count} {interval.toLowerCase()}
              {count > 1 ? "s" : ""}
            </span>
          );
        },
      },
      {
        key: "totalAmount",
        label: "Amount",
        width: "140px",
        render: (subscription) => {
          const currency =
            subscription.currency ||
            subscription.currencyCode ||
            subscription.currency_code ||
            "USD";
          const total =
            subscription.totalAmount ??
            subscription.total ??
            subscription.amount ??
            0;

          // Handle string numbers
          const totalValue =
            typeof total === "string" ? parseFloat(total) : total;

          return (
            <span className="font-medium text-foreground">
              {formatCurrency(totalValue || 0, currency)}
            </span>
          );
        },
      },
      {
        key: "nextBilling",
        label: "Next Billing",
        width: "180px",
        render: (subscription) => {
          const nextBilling =
            subscription.nextBillingAt ||
            subscription.next_billing_at ||
            subscription.currentPeriodEnd ||
            subscription.current_period_end;
          return (
            <span className="text-sm text-foreground">
              {formatDate(nextBilling)}
            </span>
          );
        },
      },
    ],
    []
  );

  const renderActions = (subscription) => (
    <div
      className="flex items-center gap-1"
      onClick={(event) => event.stopPropagation()}
    >
      <IconButton
        icon={Eye}
        label="View details"
        variant="ghost"
        size="sm"
        onClick={() => {
          const subscriptionId =
            subscription.id ||
            subscription.subscriptionId ||
            subscription.subscription_id;
          if (subscriptionId) {
            router.push(
              `/dashboard/subscriptions/${encodeURIComponent(subscriptionId)}`
            );
          }
        }}
        disabled={
          !(
            subscription.id ||
            subscription.subscriptionId ||
            subscription.subscription_id
          )
        }
      />
    </div>
  );

  const handleRowNavigation = (subscription) => {
    const subscriptionId =
      subscription.id ||
      subscription.subscriptionId ||
      subscription.subscription_id;
    if (!subscriptionId) return;
    router.push(
      `/dashboard/subscriptions/${encodeURIComponent(subscriptionId)}`
    );
  };

  if (error && !loading) {
    return (
      <PageContainer>
        {renderPageHeader("Retry")}
        <ErrorState
          title="Failed to load subscriptions"
          message={error}
          action={
            <CustomButton onClick={handleRefresh} disabled={loading}>
              Retry
            </CustomButton>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {renderPageHeader()}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <CustomInput
            type="text"
            placeholder="Search by email, name, subscription ID, or WordPress ID..."
            value={searchTerm}
            onChange={(event) => handleSearch(event.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <CustomButton
            variant="outline"
            size="sm"
            onClick={() => setShowFilters((prev) => !prev)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </CustomButton>
        </div>
      </div>
      {showFilters && (
        <div className="mb-6 p-4 bg-card rounded-lg border border-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <p className="text-sm font-medium mb-2 text-foreground">Status</p>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((status) => {
                  const { label } = getStatusDisplay(status);
                  const isSelected = filterValues.status.includes(status);
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => handleStatusToggle(status)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground border-border hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="sm:col-span-2">
              <p className="text-sm font-medium mb-2 text-foreground">
                Billing Interval
              </p>
              <div className="flex flex-wrap gap-2">
                {BILLING_INTERVAL_OPTIONS.map((interval) => {
                  const isSelected =
                    filterValues.billingInterval.includes(interval);
                  return (
                    <button
                      key={interval}
                      type="button"
                      onClick={() => handleBillingIntervalToggle(interval)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground border-border hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      {interval}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2 text-foreground flex items-center gap-1">
                <UserIcon className="h-4 w-4" />
                Customer ID
              </p>
              <CustomInput
                type="text"
                placeholder="Filter by user ID"
                value={filterValues.userId}
                onChange={(event) =>
                  handleFilterChange("userId", event.target.value)
                }
              />
            </div>

            <div>
              <p className="text-sm font-medium mb-2 text-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Date From
              </p>
              <CustomInput
                type="date"
                value={filterValues.dateFrom}
                onChange={(event) =>
                  handleFilterChange("dateFrom", event.target.value)
                }
              />
            </div>

            <div>
              <p className="text-sm font-medium mb-2 text-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Date To
              </p>
              <CustomInput
                type="date"
                value={filterValues.dateTo}
                onChange={(event) =>
                  handleFilterChange("dateTo", event.target.value)
                }
              />
            </div>

            <div>
              <p className="text-sm font-medium mb-2 text-foreground">
                Results Per Page
              </p>
              <select
                value={filterValues.limit}
                onChange={(event) =>
                  handleFilterChange("limit", event.target.value)
                }
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-primary"
              >
                {LIMIT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <div className="flex items-end">
                <CustomButton
                  onClick={handleClearFilters}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Clear All
                </CustomButton>
              </div>
            )}
          </div>
        </div>
      )}
      <DataTable
        columns={columns}
        data={subscriptions}
        renderActions={renderActions}
        loading={loading}
        onRowClick={handleRowNavigation}
        emptyState={{
          icon: RefreshCw,
          title: "No subscriptions found",
          description: hasActiveFilters
            ? "No subscriptions match your current search or filters."
            : "There are no subscriptions to display yet.",
          action: hasActiveFilters ? (
            <CustomButton
              onClick={handleClearFilters}
              variant="outline"
              className="flex items-center gap-2"
            >
              Clear Filters
            </CustomButton>
          ) : (
            <CustomButton
              onClick={() => refresh()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </CustomButton>
          ),
        }}
      />
      {pagination && pagination.total > 0 && (
        <Pagination
          currentPage={pagination.page || 1}
          totalPages={pagination.totalPages || 1}
          total={pagination.total || 0}
          limit={pagination.limit || Number(filterValues.limit) || 20}
          onPageChange={(page) => updateFilters({ page })}
          disabled={loading}
          resourceName="subscriptions"
        />
      )}
    </PageContainer>
  );
}
