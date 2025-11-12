"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/cn";
import {
  Edit,
  Trash2,
  Search,
  Plus,
  Tag,
  Filter,
  X,
  Power,
  PowerOff,
  Eye,
  TrendingUp,
  Calendar,
  Percent,
  DollarSign,
  Users,
  Clock,
  MoreVertical,
} from "lucide-react";
import {
  CustomButton,
  PageContainer,
  PageHeader,
  DataTable,
  CustomInput,
  CustomBadge,
  CustomConfirmationDialog,
  ErrorState,
  Pagination,
} from "@/components/ui";
import { useCoupons } from "../hooks/useCoupons";

const COUPON_TYPES = [
  { value: "", label: "All Types" },
  { value: "PERCENTAGE", label: "Percentage" },
  { value: "FIXED_AMOUNT", label: "Fixed Amount" },
];

const EXPIRATION_STATUSES = [
  { value: "", label: "All" },
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
  { value: "upcoming", label: "Upcoming" },
];

export default function CouponsList() {
  const router = useRouter();
  const {
    coupons,
    loading,
    error,
    deleteCoupon,
    activateCoupon,
    deactivateCoupon,
    pagination,
    updateFilters,
  } = useCoupons();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterValues, setFilterValues] = useState({
    type: "",
    isActive: "",
    expirationStatus: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    if (value.trim()) {
      updateFilters({ search: value, page: 1 });
    } else {
      updateFilters({ search: undefined, page: 1 });
    }
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filterValues, [key]: value };
    setFilterValues(newFilters);

    // Apply filters - only include non-empty values
    const appliedFilters = { page: 1 };
    if (newFilters.type && newFilters.type.trim() !== "") {
      appliedFilters.type = newFilters.type;
    } else {
      appliedFilters.type = undefined;
    }
    if (newFilters.isActive !== "" && newFilters.isActive !== null) {
      appliedFilters.isActive = newFilters.isActive === "true";
    } else {
      appliedFilters.isActive = undefined;
    }
    if (
      newFilters.expirationStatus &&
      newFilters.expirationStatus.trim() !== ""
    ) {
      appliedFilters.expirationStatus = newFilters.expirationStatus;
    } else {
      appliedFilters.expirationStatus = undefined;
    }
    if (newFilters.sortBy && newFilters.sortBy.trim() !== "") {
      appliedFilters.sortBy = newFilters.sortBy;
    } else {
      appliedFilters.sortBy = undefined;
    }
    if (newFilters.sortOrder && newFilters.sortOrder.trim() !== "") {
      appliedFilters.sortOrder = newFilters.sortOrder;
    } else {
      appliedFilters.sortOrder = undefined;
    }

    updateFilters(appliedFilters);
  };

  // Handle delete confirmation
  const handleDeleteClick = (coupon) => {
    setCouponToDelete(coupon);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (couponToDelete) {
      try {
        await deleteCoupon(couponToDelete.id);
        setDeleteDialogOpen(false);
        setCouponToDelete(null);
      } catch (error) {
        // Error is already handled in the hook
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCouponToDelete(null);
  };

  // Handle activate/deactivate
  const handleToggleActive = async (coupon) => {
    try {
      if (coupon.isActive) {
        await deactivateCoupon(coupon.id);
      } else {
        await activateCoupon(coupon.id);
      }
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  // Format value based on type
  const formatValue = (coupon) => {
    if (coupon.type === "PERCENTAGE") {
      return `${coupon.value}%`;
    } else {
      return `$${parseFloat(coupon.value).toFixed(2)}`;
    }
  };

  // Check if coupon is expired
  const isExpired = (coupon) => {
    if (!coupon.validUntil) return false;
    return new Date(coupon.validUntil) < new Date();
  };

  // Check if coupon is upcoming
  const isUpcoming = (coupon) => {
    if (!coupon.validFrom) return false;
    return new Date(coupon.validFrom) > new Date();
  };

  // Get expiration status badge
  const getExpirationStatusBadge = (coupon) => {
    if (isExpired(coupon)) {
      return (
        <CustomBadge
          variant="outline"
          className="px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800"
        >
          Expired
        </CustomBadge>
      );
    }
    if (isUpcoming(coupon)) {
      return (
        <CustomBadge
          variant="outline"
          className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800"
        >
          Upcoming
        </CustomBadge>
      );
    }
    return (
      <CustomBadge
        variant="outline"
        className="px-2.5 py-1 text-xs font-semibold bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800"
      >
        Active
      </CustomBadge>
    );
  };

  // Table columns
  const columns = [
    {
      key: "code",
      label: "Coupon",
      width: "200px",
      render: (coupon) => (
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <Tag className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <code className="font-mono font-bold text-base text-blue-600 dark:text-blue-400 truncate">
              {coupon.code}
            </code>
            <span className="text-sm text-muted-foreground truncate mt-0.5">
              {coupon.name}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "discount",
      label: "Discount",
      width: "140px",
      render: (coupon) => (
        <div className="flex items-center gap-2">
          {coupon.type === "PERCENTAGE" ? (
            <Percent className="h-4 w-4 text-purple-500 flex-shrink-0" />
          ) : (
            <DollarSign className="h-4 w-4 text-cyan-500 flex-shrink-0" />
          )}
          <div className="flex flex-col">
            <span className="font-bold text-lg text-foreground">
              {formatValue(coupon)}
            </span>
            <CustomBadge
              variant="outline"
              className={`px-2 py-0.5 text-xs font-medium w-fit mt-1 ${
                coupon.type === "PERCENTAGE"
                  ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800"
                  : "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800"
              }`}
            >
              {coupon.type?.replace(/_/g, " ") || "UNKNOWN"}
            </CustomBadge>
          </div>
        </div>
      ),
    },
    {
      key: "usage",
      label: "Usage",
      width: "160px",
      render: (coupon) => (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm font-medium text-foreground">
              {coupon.usedCount || 0} / {coupon.usageLimit || "∞"}
            </span>
          </div>
          {coupon.usageLimit && (
            <div className="w-full">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      ((coupon.usedCount || 0) / coupon.usageLimit) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
              <span className="text-xs text-muted-foreground mt-1 block">
                {Math.round(
                  ((coupon.usedCount || 0) / coupon.usageLimit) * 100
                )}
                % used
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "validity",
      label: "Validity",
      width: "180px",
      render: (coupon) => (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {getExpirationStatusBadge(coupon)}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
            <span>
              {coupon.validUntil
                ? new Date(coupon.validUntil).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "No expiry"}
            </span>
          </div>
          {coupon.validFrom && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 flex-shrink-0" />
              <span>
                Starts:{" "}
                {new Date(coupon.validFrom).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: "120px",
      render: (coupon) => (
        <CustomBadge
          variant="outline"
          className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${
            coupon.isActive
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
          }`}
        >
          {coupon.isActive ? "Active" : "Inactive"}
        </CustomBadge>
      ),
    },
  ];

  // Action Dropdown Component
  const CouponActionsDropdown = ({ coupon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);

    // Calculate dropdown position when opened
    useEffect(() => {
      if (!isOpen || !buttonRef.current) return;

      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdownHeight = 280; // Approximate height of dropdown
      const dropdownWidth = 224; // w-56 = 224px
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      // Calculate position - prefer opening below, but open above if not enough space
      let top = buttonRect.bottom + scrollY + 4; // 4px gap (mt-1)
      let left = buttonRect.right + scrollX - dropdownWidth; // Align to right

      // Check if dropdown would go below viewport
      if (buttonRect.bottom + dropdownHeight > viewportHeight) {
        // Open above the button
        top = buttonRect.top + scrollY - dropdownHeight - 4;
      }

      // Ensure dropdown doesn't go above viewport
      if (top < scrollY) {
        top = scrollY + 8;
      }

      // Ensure dropdown doesn't go off the right edge
      if (left + dropdownWidth > viewportWidth + scrollX) {
        left = viewportWidth + scrollX - dropdownWidth - 8;
      }

      // Ensure dropdown doesn't go off the left edge
      if (left < scrollX) {
        left = scrollX + 8;
      }

      setPosition({ top, left });
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
      if (!isOpen) return;

      const handleClickOutside = (event) => {
        if (
          buttonRef.current &&
          !buttonRef.current.contains(event.target) &&
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setIsOpen(false);
        }
      };

      const handleEscape = (event) => {
        if (event.key === "Escape") {
          setIsOpen(false);
        }
      };

      // Use a slight delay to avoid closing immediately when opening
      const timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);

      document.addEventListener("keydown", handleEscape);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }, [isOpen]);

    // Handle scroll and resize to update position
    useEffect(() => {
      if (!isOpen) return;

      const handleScroll = () => {
        if (buttonRef.current) {
          const buttonRect = buttonRef.current.getBoundingClientRect();
          const dropdownHeight = 280;
          const dropdownWidth = 224;
          const scrollY = window.scrollY;
          const scrollX = window.scrollX;

          let top = buttonRect.bottom + scrollY + 4;
          let left = buttonRect.right + scrollX - dropdownWidth;

          if (buttonRect.bottom + dropdownHeight > window.innerHeight) {
            top = buttonRect.top + scrollY - dropdownHeight - 4;
          }

          if (top < scrollY) top = scrollY + 8;
          if (left + dropdownWidth > window.innerWidth + scrollX) {
            left = window.innerWidth + scrollX - dropdownWidth - 8;
          }
          if (left < scrollX) left = scrollX + 8;

          setPosition({ top, left });
        }
      };

      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleScroll);

      return () => {
        window.removeEventListener("scroll", handleScroll, true);
        window.removeEventListener("resize", handleScroll);
      };
    }, [isOpen]);

    const handleAction = (action) => {
      setIsOpen(false);
      action();
    };

    const handleToggle = () => {
      setIsOpen(!isOpen);
    };

    return (
      <>
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            ref={buttonRef}
            onClick={handleToggle}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              "text-muted-foreground hover:text-foreground",
              "hover:bg-accent",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              isOpen && "bg-accent text-foreground"
            )}
            aria-label="Actions"
            aria-expanded={isOpen}
            aria-haspopup="true"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
        {typeof window !== "undefined" &&
          isOpen &&
          createPortal(
            <div
              ref={dropdownRef}
              className="fixed w-56 bg-popover border border-border rounded-lg shadow-lg z-[9999] overflow-hidden"
              style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="py-1">
                {/* View Actions */}
                <div className="px-3 py-2 bg-muted/50 border-b border-border">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    View
                  </span>
                </div>
                <button
                  onClick={() =>
                    handleAction(() =>
                      router.push(`/dashboard/coupons/${coupon.id}`)
                    )
                  }
                  className="w-full px-4 py-2.5 text-sm text-foreground hover:bg-accent flex items-center gap-3 transition-colors"
                >
                  <Eye className="h-4 w-4 text-blue-500" />
                  <span>View Details</span>
                </button>
                <button
                  onClick={() =>
                    handleAction(() =>
                      router.push(`/dashboard/coupons/${coupon.id}?tab=usage`)
                    )
                  }
                  className="w-full px-4 py-2.5 text-sm text-foreground hover:bg-accent flex items-center gap-3 transition-colors"
                >
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  <span>Usage Statistics</span>
                </button>

                {/* Manage Actions */}
                <div className="px-3 py-2 bg-muted/50 border-y border-border mt-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Manage
                  </span>
                </div>
                <button
                  onClick={() => handleAction(() => handleToggleActive(coupon))}
                  className={cn(
                    "w-full px-4 py-2.5 text-sm hover:bg-accent flex items-center gap-3 transition-colors",
                    coupon.isActive ? "text-foreground" : "text-foreground"
                  )}
                >
                  {coupon.isActive ? (
                    <>
                      <PowerOff className="h-4 w-4 text-orange-500" />
                      <span>Deactivate</span>
                    </>
                  ) : (
                    <>
                      <Power className="h-4 w-4 text-green-500" />
                      <span>Activate</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() =>
                    handleAction(() =>
                      router.push(`/dashboard/coupons/${coupon.id}/edit`)
                    )
                  }
                  className="w-full px-4 py-2.5 text-sm text-foreground hover:bg-accent flex items-center gap-3 transition-colors"
                >
                  <Edit className="h-4 w-4 text-gray-500" />
                  <span>Edit Coupon</span>
                </button>

                {/* Danger Actions */}
                <div className="px-3 py-2 bg-muted/50 border-y border-border mt-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Danger Zone
                  </span>
                </div>
                <button
                  onClick={() => handleAction(() => handleDeleteClick(coupon))}
                  className="w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-3 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Coupon</span>
                </button>
              </div>
            </div>,
            document.body
          )}
      </>
    );
  };

  // Render action buttons for each row
  const renderActions = (coupon) => <CouponActionsDropdown coupon={coupon} />;

  // Check if filters are active
  const hasActiveFilters =
    searchTerm ||
    filterValues.type ||
    filterValues.isActive !== "" ||
    filterValues.expirationStatus;

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterValues({
      type: "",
      isActive: "",
      expirationStatus: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    updateFilters({
      search: undefined,
      type: undefined,
      isActive: undefined,
      expirationStatus: undefined,
      sortBy: "createdAt",
      sortOrder: "desc",
      page: 1,
    });
  };

  // Show error state if there's an error
  if (error && !loading) {
    return (
      <PageContainer>
        <ErrorState
          message={error.message || "Failed to load coupons"}
          onRetry={() => updateFilters({})}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Coupons"
        description="Manage discount coupons"
        action={
          <CustomButton
            onClick={() => router.push("/dashboard/coupons/new")}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create Coupon</span>
            <span className="sm:hidden">New</span>
          </CustomButton>
        }
      />

      {/* Search and Filters */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-5 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <CustomInput
                type="text"
                placeholder="Search by code or name..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <CustomButton
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 h-11"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="bg-primary text-primary-foreground text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                {
                  [
                    filterValues.type,
                    filterValues.isActive !== "",
                    filterValues.expirationStatus,
                  ].filter(Boolean).length
                }
              </span>
            )}
          </CustomButton>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-5 pt-5 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Type
                </label>
                <select
                  value={filterValues.type}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                  className="flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors bg-white text-gray-900 border-gray-300 placeholder:text-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-900"
                >
                  {COUPON_TYPES.map((type) => (
                    <option
                      key={type.value}
                      value={type.value}
                      className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                    >
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Status
                </label>
                <select
                  value={filterValues.isActive}
                  onChange={(e) =>
                    handleFilterChange("isActive", e.target.value)
                  }
                  className="flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors bg-white text-gray-900 border-gray-300 placeholder:text-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-900"
                >
                  <option
                    value=""
                    className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                  >
                    All
                  </option>
                  <option
                    value="true"
                    className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                  >
                    Active
                  </option>
                  <option
                    value="false"
                    className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                  >
                    Inactive
                  </option>
                </select>
              </div>

              {/* Expiration Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Expiration
                </label>
                <select
                  value={filterValues.expirationStatus}
                  onChange={(e) =>
                    handleFilterChange("expirationStatus", e.target.value)
                  }
                  className="flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors bg-white text-gray-900 border-gray-300 placeholder:text-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-900"
                >
                  {EXPIRATION_STATUSES.map((status) => (
                    <option
                      key={status.value}
                      value={status.value}
                      className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                    >
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Sort By
                </label>
                <select
                  value={filterValues.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  className="flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors bg-white text-gray-900 border-gray-300 placeholder:text-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-900"
                >
                  <option
                    value="createdAt"
                    className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                  >
                    Created Date
                  </option>
                  <option
                    value="code"
                    className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                  >
                    Code
                  </option>
                  <option
                    value="name"
                    className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                  >
                    Name
                  </option>
                  <option
                    value="validUntil"
                    className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                  >
                    Expiry Date
                  </option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <CustomButton
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </CustomButton>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Coupons Table */}
      <DataTable
        data={coupons}
        columns={columns}
        renderActions={renderActions}
        loading={loading}
        emptyMessage="No coupons found"
        emptyIcon={Tag}
        onRowClick={(coupon) => router.push(`/dashboard/coupons/${coupon.id}`)}
      />

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={(page) => updateFilters({ page })}
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <CustomConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Coupon"
        message={
          couponToDelete
            ? `Are you sure you want to delete coupon "${couponToDelete.code}"? This action cannot be undone.`
            : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </PageContainer>
  );
}
