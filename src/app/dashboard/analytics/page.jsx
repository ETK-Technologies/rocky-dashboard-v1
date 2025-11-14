"use client";

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
    TrendingDown,
    DollarSign,
    ShoppingCart,
    Users,
    CreditCard,
    Tag,
    Package,
    BarChart3,
    PieChart,
    LineChart,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Sparkles,
    Target,
    Zap,
    Award,
    Percent,
    Calendar,
    Filter,
} from "lucide-react";
import { useState, useEffect } from "react";

/**
 * Analytics Page
 * Accessible by admin and super_admin roles
 */
export default function AnalyticsPage() {
    const [dateRange, setDateRange] = useState({
        startDate: new Date(
            Date.now() - 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
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
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
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
                const startDate = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    1
                );
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

    const loading =
        overviewLoading ||
        salesLoading ||
        salesPeriodLoading ||
        productLoading ||
        customerLoading ||
        subscriptionLoading ||
        couponLoading;
    const error = overviewError || salesError;

    return (
        <>
            <LoadingState
                message="Loading analytics data..."
                loading={loading}
                fullScreen
            />

            <PageContainer>
                <PageHeader
                    title="Analytics Dashboard"
                    subtitle="Comprehensive analytics and reporting for your business"
                />

                {/* Date Range Selector */}
                <div className="mb-6 bg-gradient-to-br from-card via-card to-card/80 rounded-2xl border border-border p-5 shadow-sm relative overflow-hidden">
                    {/* Decorative background shapes */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -ml-12 -mb-12" />

                    <div className="relative flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="flex items-center gap-2 mb-2 sm:mb-0">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">
                                Date Range
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {datePresets.map((preset, index) => (
                                <button
                                    key={index}
                                    onClick={() => handlePresetClick(preset)}
                                    className="px-4 py-2 text-sm bg-secondary hover:bg-primary/10 hover:text-primary rounded-lg transition-all duration-200 font-medium border border-border hover:border-primary/20"
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex-1 flex items-center gap-2 text-sm text-muted-foreground ml-auto">
                            <Calendar className="h-4 w-4" />
                            <span>
                                {formatDate(dateRange.startDate)} -{" "}
                                {formatDate(dateRange.endDate)}
                            </span>
                        </div>
                    </div>
                </div>

                {error ? (
                    <ErrorState
                        message={
                            error.statusCode === 403
                                ? "Analytics require admin access"
                                : `Failed to load analytics: ${error.message}`
                        }
                    />
                ) : (
                    <>
                        {/* Overview Stats */}
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-6">
                                <BarChart3 className="h-5 w-5 text-primary" />
                                <h2 className="text-2xl font-bold text-foreground">
                                    Overview
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                {/* Revenue Card */}
                                <div className="group relative bg-gradient-to-br from-green-50 via-green-50/50 to-emerald-50 dark:from-green-950/20 dark:via-green-950/10 dark:to-emerald-950/20 rounded-2xl border border-green-200/50 dark:border-green-900/30 p-6 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl -mr-12 -mt-12" />
                                    <div className="relative">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                                                <DollarSign className="h-6 w-6 text-white" />
                                            </div>
                                            <div className="w-8 h-8 rounded-lg bg-white/60 dark:bg-gray-800/60 flex items-center justify-center">
                                                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            </div>
                                        </div>
                                        <div className="text-xs font-medium text-green-700 dark:text-green-400 mb-2 uppercase tracking-wide">
                                            Total Revenue
                                        </div>
                                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                            {formatCurrency(
                                                overviewData?.sales
                                                    ?.totalRevenue
                                            )}
                                        </div>
                                        <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                                            Average:{" "}
                                            {formatCurrency(
                                                overviewData?.sales
                                                    ?.averageOrderValue
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Orders Card */}
                                <div className="group relative bg-gradient-to-br from-blue-50 via-blue-50/50 to-cyan-50 dark:from-blue-950/20 dark:via-blue-950/10 dark:to-cyan-950/20 rounded-2xl border border-blue-200/50 dark:border-blue-900/30 p-6 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-12 -mt-12" />
                                    <div className="relative">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
                                                <ShoppingCart className="h-6 w-6 text-white" />
                                            </div>
                                            <div className="w-8 h-8 rounded-lg bg-white/60 dark:bg-gray-800/60 flex items-center justify-center">
                                                <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                        </div>
                                        <div className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-2 uppercase tracking-wide">
                                            Total Orders
                                        </div>
                                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                            {formatNumber(
                                                overviewData?.sales?.orderCount
                                            )}
                                        </div>
                                        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                            All time orders
                                        </div>
                                    </div>
                                </div>

                                {/* Customers Card */}
                                <div className="group relative bg-gradient-to-br from-purple-50 via-purple-50/50 to-pink-50 dark:from-purple-950/20 dark:via-purple-950/10 dark:to-pink-950/20 rounded-2xl border border-purple-200/50 dark:border-purple-900/30 p-6 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -mr-12 -mt-12" />
                                    <div className="relative">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                                                <Users className="h-6 w-6 text-white" />
                                            </div>
                                            {customerData?.growth?.growth !==
                                                undefined &&
                                                customerData?.growth?.growth !==
                                                    null &&
                                                typeof customerData.growth
                                                    .growth === "number" && (
                                                    <div
                                                        className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                                                            customerData.growth
                                                                .growth >= 0
                                                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                                                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                                        }`}
                                                    >
                                                        {customerData.growth
                                                            .growth >= 0 ? (
                                                            <ArrowUpRight className="h-3 w-3" />
                                                        ) : (
                                                            <ArrowDownRight className="h-3 w-3" />
                                                        )}
                                                        <span className="text-xs font-bold">
                                                            {customerData.growth
                                                                .growth >= 0
                                                                ? "+"
                                                                : ""}
                                                            {customerData.growth.growth.toFixed(
                                                                1
                                                            )}
                                                            %
                                                        </span>
                                                    </div>
                                                )}
                                        </div>
                                        <div className="text-xs font-medium text-purple-700 dark:text-purple-400 mb-2 uppercase tracking-wide">
                                            Total Customers
                                        </div>
                                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                            {formatNumber(
                                                overviewData?.customers
                                                    ?.totalCustomers
                                            )}
                                        </div>
                                        <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                                            {formatNumber(
                                                overviewData?.customers
                                                    ?.customersWithOrders
                                            )}{" "}
                                            with orders
                                        </div>
                                    </div>
                                </div>

                                {/* Subscriptions Card */}
                                <div className="group relative bg-gradient-to-br from-orange-50 via-orange-50/50 to-amber-50 dark:from-orange-950/20 dark:via-orange-950/10 dark:to-amber-950/20 rounded-2xl border border-orange-200/50 dark:border-orange-900/30 p-6 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl -mr-12 -mt-12" />
                                    <div className="relative">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg">
                                                <CreditCard className="h-6 w-6 text-white" />
                                            </div>
                                            <div className="w-8 h-8 rounded-lg bg-white/60 dark:bg-gray-800/60 flex items-center justify-center">
                                                <Zap className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                            </div>
                                        </div>
                                        <div className="text-xs font-medium text-orange-700 dark:text-orange-400 mb-2 uppercase tracking-wide">
                                            Active Subscriptions
                                        </div>
                                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                            {formatNumber(
                                                overviewData?.subscriptions
                                                    ?.activeSubscriptions
                                            )}
                                        </div>
                                        <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                                            {formatNumber(
                                                overviewData?.subscriptions
                                                    ?.totalSubscriptions
                                            )}{" "}
                                            total
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sales Analytics */}
                        {salesData && (
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-6">
                                    <LineChart className="h-5 w-5 text-primary" />
                                    <h2 className="text-2xl font-bold text-foreground">
                                        Sales Analytics
                                    </h2>
                                </div>
                                <div className="bg-gradient-to-br from-card via-card to-card/95 rounded-2xl border border-border p-6 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20" />
                                    <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/10 border border-green-200/30 dark:border-green-900/20">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md">
                                                <DollarSign className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                                                    Total Revenue
                                                </div>
                                                <div className="text-2xl font-bold text-foreground">
                                                    {formatCurrency(
                                                        salesData?.totalRevenue
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/10 border border-blue-200/30 dark:border-blue-900/20">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0 shadow-md">
                                                <ShoppingCart className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                                                    Order Count
                                                </div>
                                                <div className="text-2xl font-bold text-foreground">
                                                    {formatNumber(
                                                        salesData?.orderCount
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/10 border border-purple-200/30 dark:border-purple-900/20">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-md">
                                                <Target className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                                                    Avg Order Value
                                                </div>
                                                <div className="text-2xl font-bold text-foreground">
                                                    {formatCurrency(
                                                        salesData?.averageOrderValue
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Additional Analytics Sections */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* Product Performance */}
                            {productData && productData.products && (
                                <div className="bg-gradient-to-br from-card via-card to-card/95 rounded-2xl border border-border p-6 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                                    <div className="relative">
                                        <div className="flex items-center gap-2 mb-6">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                                                <Package className="h-5 w-5 text-white" />
                                            </div>
                                            <h3 className="text-xl font-bold text-foreground">
                                                Top Products
                                            </h3>
                                            <Award className="h-4 w-4 text-muted-foreground ml-auto" />
                                        </div>
                                        <div className="space-y-3">
                                            {productData.products.length > 0 ? (
                                                productData.products
                                                    .slice(0, 5)
                                                    .map((item, index) => (
                                                        <div
                                                            key={
                                                                item.product
                                                                    ?.id ||
                                                                index
                                                            }
                                                            className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-gray-50/50 to-transparent dark:from-gray-900/20 border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
                                                        >
                                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 flex items-center justify-center flex-shrink-0">
                                                                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                                                    #{index + 1}
                                                                </span>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-sm font-semibold text-foreground truncate">
                                                                    {item
                                                                        .product
                                                                        ?.name ||
                                                                        "Unknown Product"}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                                                                    <span>
                                                                        {formatNumber(
                                                                            item
                                                                                .metrics
                                                                                ?.quantity ||
                                                                                0
                                                                        )}{" "}
                                                                        sold
                                                                    </span>
                                                                    <span>
                                                                        •
                                                                    </span>
                                                                    <span>
                                                                        {formatNumber(
                                                                            item
                                                                                .metrics
                                                                                ?.orders ||
                                                                                0
                                                                        )}{" "}
                                                                        orders
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="text-base font-bold text-primary">
                                                                {formatCurrency(
                                                                    item.metrics
                                                                        ?.revenue ||
                                                                        0
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                            ) : (
                                                <div className="text-sm text-muted-foreground text-center py-8">
                                                    No product data available
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Customer Analytics */}
                            {customerData && (
                                <div className="bg-gradient-to-br from-card via-card to-card/95 rounded-2xl border border-border p-6 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                                    <div className="relative">
                                        <div className="flex items-center gap-2 mb-6">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                                                <Users className="h-5 w-5 text-white" />
                                            </div>
                                            <h3 className="text-xl font-bold text-foreground">
                                                Customer Analytics
                                            </h3>
                                        </div>
                                        <div className="space-y-5">
                                            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/10 border border-purple-200/30 dark:border-purple-900/20">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                        Total Customers
                                                    </div>
                                                    <Users className="h-4 w-4 text-purple-500" />
                                                </div>
                                                <div className="text-3xl font-bold text-foreground">
                                                    {formatNumber(
                                                        customerData?.totalCustomers
                                                    )}
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/10 border border-blue-200/30 dark:border-blue-900/20">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                        Customers with Orders
                                                    </div>
                                                    <ShoppingCart className="h-4 w-4 text-blue-500" />
                                                </div>
                                                <div className="text-3xl font-bold text-foreground">
                                                    {formatNumber(
                                                        customerData?.customersWithOrders
                                                    )}
                                                </div>
                                            </div>
                                            {customerData?.conversionRate !==
                                                undefined &&
                                                customerData?.conversionRate !==
                                                    null &&
                                                typeof customerData.conversionRate ===
                                                    "number" && (
                                                    <div className="p-4 rounded-xl bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/10 border border-green-200/30 dark:border-green-900/20">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                                Conversion Rate
                                                            </div>
                                                            <Percent className="h-4 w-4 text-green-500" />
                                                        </div>
                                                        <div className="text-3xl font-bold text-foreground">
                                                            {customerData.conversionRate.toFixed(
                                                                2
                                                            )}
                                                            %
                                                        </div>
                                                    </div>
                                                )}
                                            {customerData?.growth?.growth !==
                                                undefined &&
                                                customerData?.growth?.growth !==
                                                    null &&
                                                typeof customerData.growth
                                                    .growth === "number" && (
                                                    <div
                                                        className={`p-4 rounded-xl border ${
                                                            customerData.growth
                                                                .growth >= 0
                                                                ? "bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/10 border-green-200/30 dark:border-green-900/20"
                                                                : "bg-gradient-to-br from-red-50/50 to-transparent dark:from-red-950/10 border-red-200/30 dark:border-red-900/20"
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                                Growth Rate
                                                            </div>
                                                            {customerData.growth
                                                                .growth >= 0 ? (
                                                                <TrendingUp className="h-4 w-4 text-green-500" />
                                                            ) : (
                                                                <TrendingDown className="h-4 w-4 text-red-500" />
                                                            )}
                                                        </div>
                                                        <div
                                                            className={`text-3xl font-bold ${
                                                                customerData
                                                                    .growth
                                                                    .growth >= 0
                                                                    ? "text-green-600 dark:text-green-400"
                                                                    : "text-red-600 dark:text-red-400"
                                                            }`}
                                                        >
                                                            {customerData.growth
                                                                .growth >= 0
                                                                ? "+"
                                                                : ""}
                                                            {customerData.growth.growth.toFixed(
                                                                1
                                                            )}
                                                            %
                                                        </div>
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Subscription & Coupon Analytics */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Subscription Metrics */}
                            {subscriptionData && (
                                <div className="bg-gradient-to-br from-card via-card to-card/95 rounded-2xl border border-border p-6 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                                    <div className="relative">
                                        <div className="flex items-center gap-2 mb-6">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                                                <CreditCard className="h-5 w-5 text-white" />
                                            </div>
                                            <h3 className="text-xl font-bold text-foreground">
                                                Subscription Metrics
                                            </h3>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50/50 to-transparent dark:from-orange-950/10 border border-orange-200/30 dark:border-orange-900/20">
                                                    <div className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                                                        Total
                                                    </div>
                                                    <div className="text-2xl font-bold text-foreground">
                                                        {formatNumber(
                                                            subscriptionData?.totalSubscriptions
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="p-4 rounded-xl bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/10 border border-green-200/30 dark:border-green-900/20">
                                                    <div className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                                                        Active
                                                    </div>
                                                    <div className="text-2xl font-bold text-foreground">
                                                        {formatNumber(
                                                            subscriptionData?.activeSubscriptions
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {subscriptionData?.statusBreakdown &&
                                                Array.isArray(
                                                    subscriptionData.statusBreakdown
                                                ) &&
                                                subscriptionData.statusBreakdown
                                                    .length > 0 && (
                                                    <div className="space-y-2 mt-4">
                                                        <div className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                                            <PieChart className="h-4 w-4" />
                                                            Status Breakdown
                                                        </div>
                                                        {subscriptionData.statusBreakdown.map(
                                                            (item) => (
                                                                <div
                                                                    key={
                                                                        item.status
                                                                    }
                                                                    className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-gray-50/50 to-transparent dark:from-gray-900/20 border border-border/50 hover:border-primary/30 transition-all duration-200"
                                                                >
                                                                    <span className="text-sm font-medium capitalize text-foreground">
                                                                        {item.status.replace(
                                                                            "_",
                                                                            " "
                                                                        )}
                                                                    </span>
                                                                    <div className="flex items-center gap-4">
                                                                        <span className="text-sm font-bold text-foreground">
                                                                            {formatNumber(
                                                                                item.count
                                                                            )}
                                                                        </span>
                                                                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-lg">
                                                                            {formatCurrency(
                                                                                item.revenue
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Coupon Analytics */}
                            {couponData && (
                                <div className="bg-gradient-to-br from-card via-card to-card/95 rounded-2xl border border-border p-6 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                                    <div className="relative">
                                        <div className="flex items-center gap-2 mb-6">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
                                                <Tag className="h-5 w-5 text-white" />
                                            </div>
                                            <h3 className="text-xl font-bold text-foreground">
                                                Coupon Analytics
                                            </h3>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-50/50 to-transparent dark:from-yellow-950/10 border border-yellow-200/30 dark:border-yellow-900/20">
                                                    <div className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                                                        Total Usage
                                                    </div>
                                                    <div className="text-2xl font-bold text-foreground">
                                                        {formatNumber(
                                                            couponData?.totalUsage ||
                                                                0
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="p-4 rounded-xl bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/10 border border-green-200/30 dark:border-green-900/20">
                                                    <div className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                                                        Discount Given
                                                    </div>
                                                    <div className="text-2xl font-bold text-foreground">
                                                        {formatCurrency(
                                                            couponData?.totalDiscountGiven ||
                                                                0
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {couponData?.topCoupons &&
                                                Array.isArray(
                                                    couponData.topCoupons
                                                ) &&
                                                couponData.topCoupons.length >
                                                    0 && (
                                                    <div className="space-y-2 mt-4">
                                                        <div className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                                            <Sparkles className="h-4 w-4" />
                                                            Top Coupons
                                                        </div>
                                                        {couponData.topCoupons
                                                            .slice(0, 5)
                                                            .map(
                                                                (
                                                                    coupon,
                                                                    index
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            coupon.code ||
                                                                            coupon.id
                                                                        }
                                                                        className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50/50 to-transparent dark:from-gray-900/20 border border-border/50 hover:border-primary/30 transition-all duration-200"
                                                                    >
                                                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 flex items-center justify-center flex-shrink-0">
                                                                            <Tag className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                                                        </div>
                                                                        <span className="text-sm font-medium text-foreground flex-1">
                                                                            {
                                                                                coupon.code
                                                                            }
                                                                        </span>
                                                                        <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg">
                                                                            {formatNumber(
                                                                                coupon.usageCount ||
                                                                                    0
                                                                            )}{" "}
                                                                            uses
                                                                        </span>
                                                                    </div>
                                                                )
                                                            )}
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </PageContainer>
        </>
    );
}
