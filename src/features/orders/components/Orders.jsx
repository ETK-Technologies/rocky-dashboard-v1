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
import { useOrders } from "../hooks/useOrders";

const STATUS_OPTIONS = [
  "PENDING",
  "PROCESSING",
  "MEDICAL_REVIEW",
  "SHIPPED",
  "CANCELLED",
  "REFUNDED",
  "FAILED",
  "DRAFT",
  "CANCELLATION_FEE",
  "CONSULTATION_COMPLETE",
];

const STATUS_STYLES = {
  PENDING: {
    label: "Pending",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-400/20 dark:text-amber-200",
  },
  PROCESSING: {
    label: "Processing",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-400/20 dark:text-blue-200",
  },
  MEDICAL_REVIEW: {
    label: "Medical Review",
    className:
      "bg-purple-100 text-purple-700 dark:bg-purple-400/20 dark:text-purple-200",
  },
  SHIPPED: {
    label: "Shipped",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-200",
  },
  CANCELLED: {
    label: "Cancelled",
    className:
      "bg-rose-100 text-rose-700 dark:bg-rose-400/20 dark:text-rose-200",
  },
  REFUNDED: {
    label: "Refunded",
    className: "bg-sky-100 text-sky-700 dark:bg-sky-400/20 dark:text-sky-200",
  },
  FAILED: {
    label: "Failed",
    className:
      "bg-rose-200 text-rose-800 dark:bg-rose-400/40 dark:text-rose-200",
  },
  DRAFT: {
    label: "Draft",
    className:
      "bg-slate-100 text-slate-700 dark:bg-slate-400/20 dark:text-slate-200",
  },
  CANCELLATION_FEE: {
    label: "Cancellation Fee",
    className:
      "bg-orange-100 text-orange-700 dark:bg-orange-400/20 dark:text-orange-200",
  },
  CONSULTATION_COMPLETE: {
    label: "Consultation Complete",
    className:
      "bg-emerald-200 text-emerald-800 dark:bg-emerald-400/30 dark:text-emerald-100",
  },
};

const SORT_FIELDS = [
  { value: "createdAt", label: "Created At" },
  { value: "updatedAt", label: "Updated At" },
  { value: "totalAmount", label: "Total Amount" },
  { value: "status", label: "Status" },
];

const SORT_ORDERS = [
  { value: "asc", label: "Ascending" },
  { value: "desc", label: "Descending" },
];

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

export default function Orders() {
  const router = useRouter();
  const {
    orders,
    loading,
    error,
    pagination,
    updateFilters,
    filters,
    refresh,
  } = useOrders();
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [showFilters, setShowFilters] = useState(false);
  const [filterValues, setFilterValues] = useState({
    status: Array.isArray(filters.status) ? filters.status : [],
    userId: filters.userId || "",
    dateFrom: filters.dateFrom || "",
    dateTo: filters.dateTo || "",
    sortBy: filters.sortBy || "createdAt",
    sortOrder: filters.sortOrder || "desc",
    limit: String(filters.limit || 20),
  });

  useEffect(() => {
    setFilterValues((prev) => ({
      ...prev,
      status: Array.isArray(filters.status) ? filters.status : [],
      userId: filters.userId || "",
      dateFrom: filters.dateFrom || "",
      dateTo: filters.dateTo || "",
      sortBy: filters.sortBy || "createdAt",
      sortOrder: filters.sortOrder || "desc",
      limit: String(filters.limit || prev.limit || 20),
    }));
    setSearchTerm(filters.search || "");
  }, [
    filters.status,
    filters.userId,
    filters.dateFrom,
    filters.dateTo,
    filters.sortBy,
    filters.sortOrder,
    filters.limit,
    filters.search,
  ]);

  const applyFilterState = (newState) => {
    setFilterValues(newState);

    const appliedFilters = {
      page: 1,
      limit: Number(newState.limit) || 20,
      sortBy: newState.sortBy || undefined,
      sortOrder: newState.sortOrder || undefined,
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
      title="Orders"
      description="View and manage customer orders"
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
      userId: "",
      dateFrom: "",
      dateTo: "",
      sortBy: "createdAt",
      sortOrder: "desc",
      limit: "20",
    };

    setSearchTerm("");
    applyFilterState(resetState);
  };

  const hasActiveFilters =
    (Array.isArray(filterValues.status) && filterValues.status.length > 0) ||
    (searchTerm && searchTerm.trim() !== "") ||
    (filterValues.userId && filterValues.userId.trim() !== "") ||
    filterValues.dateFrom ||
    filterValues.dateTo ||
    filterValues.sortBy !== "createdAt" ||
    filterValues.sortOrder !== "desc" ||
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
        key: "orderNumber",
        label: "Order",
        width: "220px",
        render: (order) => {
          const orderNumber =
            order.orderNumber || order.number || `#${order.id || "-"}`;
          const createdAt = formatDate(order.createdAt || order.created_at);

          return (
            <div className="flex flex-col">
              <span className="font-medium text-foreground">{orderNumber}</span>
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
        render: (order) => {
          const user = order.user || order.customer || {};
          const name =
            user.fullName ||
            [user.firstName, user.lastName].filter(Boolean).join(" ") ||
            order.guestName ||
            order.guestEmail ||
            user.email ||
            "Guest Checkout";
          const email = user.email || order.email || order.guestEmail;

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
            </div>
          );
        },
      },
      {
        key: "status",
        label: "Status",
        width: "160px",
        render: (order) => {
          const { label, className } = getStatusDisplay(order.status);
          return (
            <CustomBadge variant="outline" className={className}>
              {label}
            </CustomBadge>
          );
        },
      },
      {
        key: "paymentStatus",
        label: "Payment",
        width: "160px",
        render: (order) => {
          const rawStatus =
            order.paymentStatus ||
            order.payment_status ||
            order.payment?.status ||
            "";
          const status = rawStatus.toUpperCase();
          const isPaid =
            status === "SUCCEEDED" ||
            status === "PAID" ||
            status === "CAPTURED";
          const isPending =
            status === "REQUIRES_CAPTURE" ||
            status === "PENDING" ||
            status === "AUTHORIZED";
          let badgeClass =
            "bg-secondary text-secondary-foreground dark:bg-slate-400/20 dark:text-slate-200";

          if (isPaid) {
            badgeClass =
              "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-200";
          } else if (isPending) {
            badgeClass =
              "bg-amber-100 text-amber-700 dark:bg-amber-400/20 dark:text-amber-200";
          } else if (status === "FAILED" || status === "CANCELLED") {
            badgeClass =
              "bg-rose-100 text-rose-700 dark:bg-rose-400/20 dark:text-rose-200";
          }

          return (
            <CustomBadge variant="outline" className={badgeClass}>
              {status ? status.replace(/_/g, " ") : "Unknown"}
            </CustomBadge>
          );
        },
      },
      {
        key: "totalAmount",
        label: "Total",
        width: "140px",
        render: (order) => {
          const currency =
            order.currency ||
            order.currencyCode ||
            order.currency_code ||
            "USD";
          const total =
            order.totalAmount ??
            order.total ??
            order.grandTotal ??
            order.amount ??
            0;

          return (
            <span className="font-medium text-foreground">
              {formatCurrency(total, currency)}
            </span>
          );
        },
      },
    ],
    []
  );

  const renderActions = (order) => (
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
          const orderId =
            order.id || order.orderId || order.order_id || order.uuid;
          if (orderId) {
            router.push(`/dashboard/orders/${encodeURIComponent(orderId)}`);
          }
        }}
        disabled={!(order.id || order.orderId || order.order_id || order.uuid)}
      />
    </div>
  );

  const handleRowNavigation = (order) => {
    const orderId = order.id || order.orderId || order.order_id || order.uuid;
    if (!orderId) return;
    router.push(`/dashboard/orders/${encodeURIComponent(orderId)}`);
  };

  if (error && !loading) {
    return (
      <PageContainer>
        {renderPageHeader("Retry")}
        <ErrorState
          title="Failed to load orders"
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
            placeholder="Search by order number or email..."
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
                Sort By
              </p>
              <select
                value={filterValues.sortBy}
                onChange={(event) =>
                  handleFilterChange("sortBy", event.target.value)
                }
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-primary"
              >
                {SORT_FIELDS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-sm font-medium mb-2 text-foreground">
                Sort Order
              </p>
              <select
                value={filterValues.sortOrder}
                onChange={(event) =>
                  handleFilterChange("sortOrder", event.target.value)
                }
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-primary"
              >
                {SORT_ORDERS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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
        data={orders}
        renderActions={renderActions}
        loading={loading}
        onRowClick={handleRowNavigation}
        emptyState={{
          icon: RefreshCw,
          title: "No orders found",
          description: hasActiveFilters
            ? "No orders match your current search or filters."
            : "There are no orders to display yet.",
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
          resourceName="orders"
        />
      )}
    </PageContainer>
  );
}
