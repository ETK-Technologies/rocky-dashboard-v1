"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Filter,
  RefreshCw,
  Trash2,
  ShoppingCart,
  User as UserIcon,
  DollarSign,
  Clock,
} from "lucide-react";
import {
  CustomBadge,
  CustomButton,
  CustomInput,
  DataTable,
  ErrorState,
  Pagination,
  CustomConfirmationDialog,
  CustomLabel,
  CustomCard,
  CustomCardContent,
  CustomCardHeader,
  CustomCardTitle,
  PageContainer,
} from "@/components/ui";
import { useAbandonedCarts } from "../hooks/useAbandonedCarts";

const LIMIT_OPTIONS = [
  { value: "10", label: "10 per page" },
  { value: "20", label: "20 per page" },
  { value: "50", label: "50 per page" },
  { value: "100", label: "100 per page" },
];

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleString();
};

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

// Convert ISO 8601 string to datetime-local format (YYYY-MM-DDTHH:mm)
const isoToDatetimeLocal = (isoString) => {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "";
    // Get local time string in YYYY-MM-DDTHH:mm format
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return "";
  }
};

export default function AbandonedCarts() {
  const {
    carts,
    summary,
    pagination,
    loading,
    error,
    filters,
    updateFilters,
    changePage,
    changeLimit,
    refresh,
    deleteCarts,
  } = useAbandonedCarts();

  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filterValues, setFilterValues] = useState({
    userId: filters.userId || "",
    sessionId: filters.sessionId || "",
    createdBefore: filters.createdBefore || "",
    updatedBefore: filters.updatedBefore || "",
    abandonedDays: String(filters.abandonedDays || 30),
    limit: String(filters.limit || 20),
  });

  useEffect(() => {
    setFilterValues((prev) => ({
      ...prev,
      userId: filters.userId || "",
      sessionId: filters.sessionId || "",
      createdBefore: filters.createdBefore || "",
      updatedBefore: filters.updatedBefore || "",
      abandonedDays: String(filters.abandonedDays || 30),
      limit: String(filters.limit || prev.limit || 20),
    }));
  }, [filters]);

  const applyFilters = () => {
    const appliedFilters = {
      page: 1,
      limit: Number(filterValues.limit) || 20,
      abandonedDays: Number(filterValues.abandonedDays) || 30,
    };

    if (filterValues.userId && filterValues.userId.trim() !== "") {
      appliedFilters.userId = filterValues.userId.trim();
    }

    if (filterValues.sessionId && filterValues.sessionId.trim() !== "") {
      appliedFilters.sessionId = filterValues.sessionId.trim();
    }

    if (filterValues.createdBefore) {
      appliedFilters.createdBefore = filterValues.createdBefore;
    }

    if (filterValues.updatedBefore) {
      appliedFilters.updatedBefore = filterValues.updatedBefore;
    }

    updateFilters(appliedFilters);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    const resetState = {
      userId: "",
      sessionId: "",
      createdBefore: "",
      updatedBefore: "",
      abandonedDays: "30",
      limit: "20",
    };
    setFilterValues(resetState);
    updateFilters({
      page: 1,
      limit: 20,
      abandonedDays: 30,
      userId: undefined,
      sessionId: undefined,
      createdBefore: undefined,
      updatedBefore: undefined,
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCarts();
      setShowDeleteDialog(false);
    } catch (err) {
      // Error is handled in the hook
    } finally {
      setIsDeleting(false);
    }
  };

  const hasActiveFilters =
    (filterValues.userId && filterValues.userId.trim() !== "") ||
    (filterValues.sessionId && filterValues.sessionId.trim() !== "") ||
    filterValues.createdBefore ||
    filterValues.updatedBefore ||
    filterValues.abandonedDays !== "30" ||
    filterValues.limit !== "20";

  const columns = useMemo(
    () => [
      {
        key: "id",
        label: "Cart ID",
        width: "200px",
        render: (cart) => {
          return (
            <div className="flex flex-col">
              <span className="font-mono text-sm font-medium text-foreground">
                {cart.id || "-"}
              </span>
              {cart.sessionId && (
                <span className="text-xs text-muted-foreground mt-1">
                  Session: {cart.sessionId.substring(0, 12)}...
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: "user",
        label: "User",
        width: "200px",
        render: (cart) => {
          if (cart.userId) {
            return (
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {cart.userId}
                </span>
              </div>
            );
          }
          return (
            <CustomBadge
              variant="outline"
              className="bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-800"
            >
              Guest
            </CustomBadge>
          );
        },
      },
      {
        key: "items",
        label: "Items",
        width: "120px",
        render: (cart) => {
          const itemCount = Array.isArray(cart.items) ? cart.items.length : 0;
          return (
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {itemCount}
              </span>
            </div>
          );
        },
      },
      {
        key: "estimatedTotal",
        label: "Estimated Total",
        width: "140px",
        render: (cart) => {
          const currency = cart.currency || "USD";
          const total = cart.estimatedTotal || 0;
          return (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {formatCurrency(total, currency)}
              </span>
            </div>
          );
        },
      },
      {
        key: "daysSinceUpdate",
        label: "Days Abandoned",
        width: "140px",
        render: (cart) => {
          const days = cart.daysSinceUpdate || 0;
          return (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span
                className={`text-sm font-medium ${
                  days >= 60
                    ? "text-destructive"
                    : days >= 30
                    ? "text-amber-600"
                    : "text-foreground"
                }`}
              >
                {days} days
              </span>
            </div>
          );
        },
      },
      {
        key: "createdAt",
        label: "Created",
        width: "180px",
        render: (cart) => {
          return (
            <div className="flex flex-col">
              <span className="text-sm text-foreground">
                {formatDate(cart.createdAt)}
              </span>
            </div>
          );
        },
      },
      {
        key: "updatedAt",
        label: "Last Updated",
        width: "180px",
        render: (cart) => {
          return (
            <div className="flex flex-col">
              <span className="text-sm text-foreground">
                {formatDate(cart.updatedAt)}
              </span>
            </div>
          );
        },
      },
    ],
    []
  );

  if (error && error.statusCode !== 401 && error.statusCode !== 403) {
    return (
      <PageContainer>
        <ErrorState
          title="Error Loading Carts"
          message={error.message || "Failed to load abandoned carts"}
          action={
            <CustomButton onClick={refresh} variant="outline">
              Try Again
            </CustomButton>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Abandoned Carts</h2>
            <p className="text-sm text-muted-foreground mt-1">
              View and manage abandoned carts - carts that haven't been updated in a specified number of days
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CustomButton
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={refresh}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </CustomButton>
            <CustomButton
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 h-2 w-2 rounded-full bg-primary" />
              )}
            </CustomButton>
            {carts.length > 0 && (
              <CustomButton
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setShowDeleteDialog(true)}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4" />
                Delete All
              </CustomButton>
            )}
          </div>
        </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <CustomCard>
            <CustomCardHeader className="pb-2">
              <CustomCardTitle className="text-sm font-medium text-muted-foreground">
                Total Abandoned
              </CustomCardTitle>
            </CustomCardHeader>
            <CustomCardContent>
              <div className="text-2xl font-bold text-foreground">
                {summary.totalAbandoned || 0}
              </div>
            </CustomCardContent>
          </CustomCard>

          <CustomCard>
            <CustomCardHeader className="pb-2">
              <CustomCardTitle className="text-sm font-medium text-muted-foreground">
                Total Value
              </CustomCardTitle>
            </CustomCardHeader>
            <CustomCardContent>
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(summary.totalValue || 0)}
              </div>
            </CustomCardContent>
          </CustomCard>

          <CustomCard>
            <CustomCardHeader className="pb-2">
              <CustomCardTitle className="text-sm font-medium text-muted-foreground">
                Average Days Abandoned
              </CustomCardTitle>
            </CustomCardHeader>
            <CustomCardContent>
              <div className="text-2xl font-bold text-foreground">
                {Math.round(summary.averageDaysAbandoned || 0)} days
              </div>
            </CustomCardContent>
          </CustomCard>

          <CustomCard>
            <CustomCardHeader className="pb-2">
              <CustomCardTitle className="text-sm font-medium text-muted-foreground">
                Guest / User Carts
              </CustomCardTitle>
            </CustomCardHeader>
            <CustomCardContent>
              <div className="text-sm text-foreground">
                <div>Guest: {summary.guestCarts || 0}</div>
                <div>User: {summary.userCarts || 0}</div>
              </div>
            </CustomCardContent>
          </CustomCard>
        </div>
      )}

      {showFilters && (
        <div className="bg-card rounded-lg border border-border p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <CustomLabel>Abandoned Days (minimum)</CustomLabel>
              <CustomInput
                type="number"
                value={filterValues.abandonedDays}
                onChange={(e) =>
                  setFilterValues({
                    ...filterValues,
                    abandonedDays: e.target.value,
                  })
                }
                placeholder="30"
                min="1"
              />
              <p className="text-xs text-muted-foreground">
                Minimum days since last update to consider cart abandoned
              </p>
            </div>

            <div className="space-y-2">
              <CustomLabel>User ID</CustomLabel>
              <CustomInput
                value={filterValues.userId}
                onChange={(e) =>
                  setFilterValues({ ...filterValues, userId: e.target.value })
                }
                placeholder="Filter by user ID"
              />
            </div>

            <div className="space-y-2">
              <CustomLabel>Session ID</CustomLabel>
              <CustomInput
                value={filterValues.sessionId}
                onChange={(e) =>
                  setFilterValues({
                    ...filterValues,
                    sessionId: e.target.value,
                  })
                }
                placeholder="Filter by session ID"
              />
            </div>

            <div className="space-y-2">
              <CustomLabel>Created Before</CustomLabel>
              <CustomInput
                type="datetime-local"
                value={isoToDatetimeLocal(filterValues.createdBefore)}
                onChange={(e) =>
                  setFilterValues({
                    ...filterValues,
                    createdBefore: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : "",
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <CustomLabel>Updated Before</CustomLabel>
              <CustomInput
                type="datetime-local"
                value={isoToDatetimeLocal(filterValues.updatedBefore)}
                onChange={(e) =>
                  setFilterValues({
                    ...filterValues,
                    updatedBefore: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : "",
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <CustomLabel>Items Per Page</CustomLabel>
              <select
                value={filterValues.limit}
                onChange={(e) =>
                  setFilterValues({ ...filterValues, limit: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {LIMIT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <CustomButton variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </CustomButton>
            <CustomButton onClick={applyFilters}>Apply Filters</CustomButton>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={carts}
        loading={loading}
        emptyState={{
          icon: ShoppingCart,
          title: "No Abandoned Carts",
          description: "There are no abandoned carts matching your filters.",
        }}
      />

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {carts.length} of {pagination.total} carts
          </div>
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={changePage}
            onLimitChange={changeLimit}
            limit={pagination.limit}
            limitOptions={LIMIT_OPTIONS.map((opt) => ({
              value: Number(opt.value),
              label: opt.label,
            }))}
          />
        </div>
      )}

      <CustomConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Abandoned Carts"
        description={`Are you sure you want to delete all abandoned carts matching the current filters? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
        variant="danger"
      />
      </div>
    </PageContainer>
  );
}

