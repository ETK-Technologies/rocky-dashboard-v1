"use client";

import { ProtectedRoute } from "@/components/common";
import {
  PageContainer,
  PageHeader,
  LoadingState,
  ErrorState,
} from "@/components/ui";
import {
  useOverviewAnalytics,
  useSalesAnalytics,
  useSalesPeriodAnalytics,
  useProductAnalytics,
  useCustomerAnalytics,
  useSubscriptionAnalytics,
  useCouponAnalytics,
} from "@/features/analytics";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  CreditCard,
  Tag,
} from "lucide-react";
import { useState, useEffect } from "react";

/**
 * Analytics Page
 * Only accessible by super_admin role
 */
export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
    groupBy: "day",
  });

  // Fetch all analytics data with fetchData methods
  const {
    data: overviewData,
    loading: overviewLoading,
    error: overviewError,
    fetchData: fetchOverview,
  } = useOverviewAnalytics(dateRange, false);

  const {
    data: salesData,
    loading: salesLoading,
    error: salesError,
    fetchData: fetchSales,
  } = useSalesAnalytics(dateRange, false);

  const {
    data: salesPeriodData,
    loading: salesPeriodLoading,
    fetchData: fetchSalesPeriod,
  } = useSalesPeriodAnalytics(dateRange, false);

  const {
    data: productData,
    loading: productLoading,
    fetchData: fetchProducts,
  } = useProductAnalytics(dateRange, false);

  const {
    data: customerData,
    loading: customerLoading,
    fetchData: fetchCustomers,
  } = useCustomerAnalytics(dateRange, false);

  const {
    data: subscriptionData,
    loading: subscriptionLoading,
    fetchData: fetchSubscriptions,
  } = useSubscriptionAnalytics(dateRange, false);

  const {
    data: couponData,
    loading: couponLoading,
    fetchData: fetchCoupons,
  } = useCouponAnalytics(dateRange, false);

  // Fetch all analytics when date range changes
  useEffect(() => {
    const fetchAllAnalytics = async () => {
      await Promise.all([
        fetchOverview(dateRange),
        fetchSales(dateRange),
        fetchSalesPeriod(dateRange),
        fetchProducts(dateRange),
        fetchCustomers(dateRange),
        fetchSubscriptions(dateRange),
        fetchCoupons(dateRange),
      ]);
    };

    fetchAllAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange.startDate, dateRange.endDate, dateRange.groupBy]);

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format number
  const formatNumber = (num) => {
    if (num === null || num === undefined) return "—";
    return new Intl.NumberFormat("en-US").format(num);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Quick date range presets
  const datePresets = [
    {
      label: "Last 7 days",
      getRange: () => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        return {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          groupBy: "day",
        };
      },
    },
    {
      label: "Last 30 days",
      getRange: () => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        return {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          groupBy: "day",
        };
      },
    },
    {
      label: "Last 90 days",
      getRange: () => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 90);
        return {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          groupBy: "week",
        };
      },
    },
    {
      label: "This month",
      getRange: () => {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const endDate = new Date();
        return {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          groupBy: "day",
        };
      },
    },
  ];

  const handlePresetClick = (preset) => {
    const range = preset.getRange();
    setDateRange(range);
  };

  const loading = overviewLoading || salesLoading || salesPeriodLoading;
  const error = overviewError || salesError;

  return (
    <ProtectedRoute roles={["super_admin"]}>
      <PageContainer>
        <PageHeader
          title="Analytics Dashboard"
          subtitle="Comprehensive analytics and reporting for your business"
        />

        {/* Date Range Selector */}
        <div className="mb-6 bg-card rounded-xl border border-border p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex flex-wrap gap-2">
              {datePresets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => handlePresetClick(preset)}
                  className="px-4 py-2 text-sm bg-secondary hover:bg-accent rounded-lg transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="flex-1 flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                {formatDate(dateRange.startDate)} -{" "}
                {formatDate(dateRange.endDate)}
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          <LoadingState message="Loading analytics data..." />
        ) : error ? (
          <ErrorState
            message={
              error.statusCode === 403
                ? "Analytics require super admin access"
                : `Failed to load analytics: ${error.message}`
            }
          />
        ) : (
          <>
            {/* Overview Stats */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card rounded-xl border border-border p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-50 dark:bg-green-950/30">
                      <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    {overviewData?.sales?.growth !== undefined &&
                      overviewData?.sales?.growth !== null &&
                      typeof overviewData.sales.growth === "number" && (
                        <div
                          className={`text-xs font-medium ${
                            overviewData.sales.growth >= 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {overviewData.sales.growth >= 0 ? "+" : ""}
                          {overviewData.sales.growth.toFixed(1)}%
                        </div>
                      )}
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Total Revenue
                  </div>
                  <div className="text-2xl font-semibold text-foreground">
                    {formatCurrency(overviewData?.sales?.totalRevenue)}
                  </div>
                </div>

                <div className="bg-card rounded-xl border border-border p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50 dark:bg-blue-950/30">
                      <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Total Orders
                  </div>
                  <div className="text-2xl font-semibold text-foreground">
                    {formatNumber(overviewData?.sales?.orderCount)}
                  </div>
                </div>

                <div className="bg-card rounded-xl border border-border p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-50 dark:bg-purple-950/30">
                      <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Total Customers
                  </div>
                  <div className="text-2xl font-semibold text-foreground">
                    {formatNumber(overviewData?.customers?.totalCustomers)}
                  </div>
                </div>

                <div className="bg-card rounded-xl border border-border p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-orange-50 dark:bg-orange-950/30">
                      <CreditCard className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Active Subscriptions
                  </div>
                  <div className="text-2xl font-semibold text-foreground">
                    {formatNumber(overviewData?.subscriptions?.activeCount)}
                  </div>
                </div>
              </div>
            </div>

            {/* Sales Analytics */}
            {salesData && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Sales Analytics</h2>
                <div className="bg-card rounded-xl border border-border p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Total Revenue
                      </div>
                      <div className="text-2xl font-semibold text-foreground">
                        {formatCurrency(salesData?.totalRevenue)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Order Count
                      </div>
                      <div className="text-2xl font-semibold text-foreground">
                        {formatNumber(salesData?.orderCount)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Average Order Value
                      </div>
                      <div className="text-2xl font-semibold text-foreground">
                        {formatCurrency(salesData?.averageOrderValue)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Analytics Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Product Performance */}
              {productData && (
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Product Performance
                  </h3>
                  <div className="space-y-3">
                    {productData?.topProducts
                      ?.slice(0, 5)
                      .map((product, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <div className="flex-1">
                            <div className="text-sm font-medium">
                              {product.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatNumber(product.quantity)} sold
                            </div>
                          </div>
                          <div className="text-sm font-semibold">
                            {formatCurrency(product.revenue)}
                          </div>
                        </div>
                      )) || (
                      <div className="text-sm text-muted-foreground">
                        No data available
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Customer Analytics */}
              {customerData && (
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Customer Analytics
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Total Customers
                      </div>
                      <div className="text-xl font-semibold">
                        {formatNumber(customerData?.totalCustomers)}
                      </div>
                    </div>
                    {customerData?.conversionRate !== undefined &&
                      customerData?.conversionRate !== null &&
                      typeof customerData.conversionRate === "number" && (
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">
                            Conversion Rate
                          </div>
                          <div className="text-xl font-semibold">
                            {customerData.conversionRate.toFixed(2)}%
                          </div>
                        </div>
                      )}
                    {customerData?.growth !== undefined &&
                      customerData?.growth !== null &&
                      typeof customerData.growth === "number" && (
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">
                            Growth
                          </div>
                          <div className="text-xl font-semibold">
                            {customerData.growth >= 0 ? "+" : ""}
                            {customerData.growth.toFixed(1)}%
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>

            {/* Subscription & Coupon Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Subscription Metrics */}
              {subscriptionData && (
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Subscription Metrics
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Active Subscriptions
                      </div>
                      <div className="text-xl font-semibold">
                        {formatNumber(subscriptionData?.activeCount)}
                      </div>
                    </div>
                    {subscriptionData?.statusBreakdown && (
                      <div className="space-y-2">
                        {Object.entries(subscriptionData.statusBreakdown).map(
                          ([status, count]) => (
                            <div
                              key={status}
                              className="flex items-center justify-between"
                            >
                              <span className="text-sm capitalize">
                                {status}
                              </span>
                              <span className="text-sm font-medium">
                                {formatNumber(count)}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Coupon Analytics */}
              {couponData && (
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Coupon Analytics
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Total Usage
                      </div>
                      <div className="text-xl font-semibold">
                        {formatNumber(couponData?.usageCount)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Total Discount
                      </div>
                      <div className="text-xl font-semibold">
                        {formatCurrency(couponData?.totalDiscount)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </PageContainer>
    </ProtectedRoute>
  );
}
