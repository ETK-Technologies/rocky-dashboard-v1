"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit, TrendingUp, Tag } from "lucide-react";
import {
  CustomButton,
  PageContainer,
  PageHeader,
  CustomCard,
  CustomCardContent,
  CustomCardHeader,
  CustomCardTitle,
  CustomBadge,
  LoadingState,
  ErrorState,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui";
import { useCoupon } from "../hooks/useCoupon";
import { useCouponUsage } from "../hooks/useCouponUsage";

export default function CouponDetails({ couponId, initialTab = "details" }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(initialTab);
  const { coupon, loading, error, fetchCoupon } = useCoupon(couponId);
  const {
    usageStats,
    loading: usageLoading,
    fetchUsageStats,
  } = useCouponUsage(couponId);

  useEffect(() => {
    if (couponId) {
      fetchCoupon();
      fetchUsageStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [couponId]);

  // Format value based on type
  const formatValue = (coupon) => {
    if (!coupon) return "-";
    if (coupon.type === "PERCENTAGE") {
      return `${coupon.value}%`;
    } else {
      return `$${parseFloat(coupon.value).toFixed(2)}`;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString();
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "-";
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  // Check if coupon is expired
  const isExpired = (coupon) => {
    if (!coupon?.validUntil) return false;
    return new Date(coupon.validUntil) < new Date();
  };

  // Check if coupon is upcoming
  const isUpcoming = (coupon) => {
    if (!coupon?.validFrom) return false;
    return new Date(coupon.validFrom) > new Date();
  };

  // Show loading state
  if (!couponId) {
    return (
      <PageContainer>
        <ErrorState message="Coupon ID is required" />
      </PageContainer>
    );
  }

  if (loading) {
    return (
      <PageContainer>
        <LoadingState message="Loading coupon..." />
      </PageContainer>
    );
  }

  // Show error state
  if (error) {
    return (
      <PageContainer>
        <ErrorState
          message={error.message || "Failed to load coupon"}
          onRetry={() => fetchCoupon()}
        />
      </PageContainer>
    );
  }

  // Show not found state
  if (!coupon && !loading) {
    return (
      <PageContainer>
        <ErrorState message="Coupon not found" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={coupon.name || coupon.code}
        description={`Coupon code: ${coupon.code}`}
        action={
          <div className="flex items-center gap-2">
            <CustomButton
              variant="outline"
              onClick={() => router.push("/dashboard/coupons")}
              className="flex items-center gap-2"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Coupons</span>
              <span className="sm:hidden">Back</span>
            </CustomButton>
            <CustomButton
              onClick={() => router.push(`/dashboard/coupons/${coupon.id}/edit`)}
              className="flex items-center gap-2"
              size="sm"
            >
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline">Edit Coupon</span>
              <span className="sm:hidden">Edit</span>
            </CustomButton>
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="usage">
            Usage Statistics
            {usageStats && usageStats.usage?.totalUsages > 0 && (
              <span className="ml-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {usageStats.usage.totalUsages}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <CustomCard>
                <CustomCardHeader>
                  <CustomCardTitle>Basic Information</CustomCardTitle>
                </CustomCardHeader>
                <CustomCardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Coupon Code
                        </label>
                        <p className="mt-1 text-lg font-mono font-semibold text-blue-600 dark:text-blue-400">
                          {coupon.code}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Name
                        </label>
                        <p className="mt-1 text-lg font-semibold text-foreground">
                          {coupon.name}
                        </p>
                      </div>
                    </div>

                    {coupon.description && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Description
                        </label>
                        <p className="mt-1 text-foreground">{coupon.description}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Type
                        </label>
                        <div className="mt-1">
                          <CustomBadge
                            variant="outline"
                            className={`px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                              coupon.type === "PERCENTAGE"
                                ? "bg-purple-100 text-purple-700 dark:bg-purple-400/20 dark:text-purple-200"
                                : "bg-cyan-100 text-cyan-700 dark:bg-cyan-400/20 dark:text-cyan-200"
                            }`}
                          >
                            {coupon.type?.replace(/_/g, " ") || "UNKNOWN"}
                          </CustomBadge>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Discount Value
                        </label>
                        <p className="mt-1 text-lg font-semibold text-foreground">
                          {formatValue(coupon)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CustomCardContent>
              </CustomCard>

              {/* Discount Rules */}
              <CustomCard>
                <CustomCardHeader>
                  <CustomCardTitle>Discount Rules</CustomCardTitle>
                </CustomCardHeader>
                <CustomCardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Minimum Amount
                        </label>
                        <p className="mt-1 text-foreground">
                          {coupon.minimumAmount
                            ? formatCurrency(coupon.minimumAmount)
                            : "No minimum"}
                        </p>
                      </div>
                      {coupon.type === "PERCENTAGE" && (
                        <div>
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Maximum Discount
                          </label>
                          <p className="mt-1 text-foreground">
                            {coupon.maximumDiscount
                              ? formatCurrency(coupon.maximumDiscount)
                              : "No maximum"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CustomCardContent>
              </CustomCard>

              {/* Usage Limits */}
              <CustomCard>
                <CustomCardHeader>
                  <CustomCardTitle>Usage Limits</CustomCardTitle>
                </CustomCardHeader>
                <CustomCardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Total Usage Limit
                        </label>
                        <p className="mt-1 text-foreground">
                          {coupon.usageLimit
                            ? `${coupon.usedCount || 0} / ${coupon.usageLimit}`
                            : "Unlimited"}
                        </p>
                        {coupon.usageLimit && (
                          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${Math.min(
                                  ((coupon.usedCount || 0) / coupon.usageLimit) *
                                    100,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Usage Limit Per User
                        </label>
                        <p className="mt-1 text-foreground">
                          {coupon.usageLimitPerUser
                            ? coupon.usageLimitPerUser
                            : "Unlimited"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CustomCardContent>
              </CustomCard>

              {/* Validity Period */}
              <CustomCard>
                <CustomCardHeader>
                  <CustomCardTitle>Validity Period</CustomCardTitle>
                </CustomCardHeader>
                <CustomCardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Valid From
                        </label>
                        <p className="mt-1 text-foreground">
                          {formatDate(coupon.validFrom)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Valid Until
                        </label>
                        <p className="mt-1 text-foreground">
                          {formatDate(coupon.validUntil)}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Status
                      </label>
                      <div className="mt-1 flex items-center gap-2">
                        {isExpired(coupon) && (
                          <CustomBadge
                            variant="outline"
                            className="bg-red-100 text-red-700 dark:bg-red-400/20 dark:text-red-200"
                          >
                            Expired
                          </CustomBadge>
                        )}
                        {isUpcoming(coupon) && (
                          <CustomBadge
                            variant="outline"
                            className="bg-blue-100 text-blue-700 dark:bg-blue-400/20 dark:text-blue-200"
                          >
                            Upcoming
                          </CustomBadge>
                        )}
                        {!isExpired(coupon) && !isUpcoming(coupon) && (
                          <CustomBadge
                            variant="outline"
                            className="bg-green-100 text-green-700 dark:bg-green-400/20 dark:text-green-200"
                          >
                            Active
                          </CustomBadge>
                        )}
                        <CustomBadge
                          variant="outline"
                          className={`px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                            coupon.isActive
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-200"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-400/20 dark:text-slate-200"
                          }`}
                        >
                          {coupon.isActive ? "Active" : "Inactive"}
                        </CustomBadge>
                      </div>
                    </div>
                  </div>
                </CustomCardContent>
              </CustomCard>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status */}
              <CustomCard>
                <CustomCardHeader>
                  <CustomCardTitle>Status</CustomCardTitle>
                </CustomCardHeader>
                <CustomCardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Active Status
                      </label>
                      <div className="mt-1">
                        <CustomBadge
                          variant="outline"
                          className={`px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                            coupon.isActive
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-200"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-400/20 dark:text-slate-200"
                          }`}
                        >
                          {coupon.isActive ? "Active" : "Inactive"}
                        </CustomBadge>
                      </div>
                    </div>
                  </div>
                </CustomCardContent>
              </CustomCard>

              {/* WordPress Integration */}
              {coupon.wordpressId && (
                <CustomCard>
                  <CustomCardHeader>
                    <CustomCardTitle>WordPress Integration</CustomCardTitle>
                  </CustomCardHeader>
                  <CustomCardContent>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        WordPress ID
                      </label>
                      <p className="mt-1 text-foreground">{coupon.wordpressId}</p>
                    </div>
                  </CustomCardContent>
                </CustomCard>
              )}

              {/* Metadata */}
              <CustomCard>
                <CustomCardHeader>
                  <CustomCardTitle>Metadata</CustomCardTitle>
                </CustomCardHeader>
                <CustomCardContent>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Created At
                      </label>
                      <p className="mt-1 text-sm text-foreground">
                        {formatDate(coupon.createdAt)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Updated At
                      </label>
                      <p className="mt-1 text-sm text-foreground">
                        {formatDate(coupon.updatedAt)}
                      </p>
                    </div>
                  </div>
                </CustomCardContent>
              </CustomCard>
            </div>
          </div>
        </TabsContent>

        {/* Usage Statistics Tab */}
        <TabsContent value="usage" className="mt-6">
          {usageLoading ? (
            <LoadingState message="Loading usage statistics..." />
          ) : usageStats ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Overall Usage */}
              <CustomCard>
                <CustomCardHeader>
                  <CustomCardTitle>Overall Usage</CustomCardTitle>
                </CustomCardHeader>
                <CustomCardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Total Usages
                      </label>
                      <p className="mt-1 text-2xl font-bold text-foreground">
                        {usageStats.usage?.totalUsages || 0}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Unique Users
                      </label>
                      <p className="mt-1 text-2xl font-bold text-foreground">
                        {usageStats.usage?.uniqueUsers || 0}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Total Discount Given
                      </label>
                      <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(usageStats.usage?.totalDiscountGiven || 0)}
                      </p>
                    </div>
                  </div>
                </CustomCardContent>
              </CustomCard>

              {/* Orders */}
              <CustomCard>
                <CustomCardHeader>
                  <CustomCardTitle>Orders</CustomCardTitle>
                </CustomCardHeader>
                <CustomCardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Order Count
                      </label>
                      <p className="mt-1 text-2xl font-bold text-foreground">
                        {usageStats.orders?.count || 0}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Total Discount
                      </label>
                      <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(usageStats.orders?.totalDiscount || 0)}
                      </p>
                    </div>
                  </div>
                </CustomCardContent>
              </CustomCard>

              {/* Subscriptions */}
              <CustomCard>
                <CustomCardHeader>
                  <CustomCardTitle>Subscriptions</CustomCardTitle>
                </CustomCardHeader>
                <CustomCardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Subscription Count
                      </label>
                      <p className="mt-1 text-2xl font-bold text-foreground">
                        {usageStats.subscriptions?.count || 0}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Total Discount
                      </label>
                      <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(
                          usageStats.subscriptions?.totalDiscount || 0
                        )}
                      </p>
                    </div>
                  </div>
                </CustomCardContent>
              </CustomCard>

              {/* Limits */}
              <CustomCard>
                <CustomCardHeader>
                  <CustomCardTitle>Usage Limits</CustomCardTitle>
                </CustomCardHeader>
                <CustomCardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Usage Limit
                      </label>
                      <p className="mt-1 text-2xl font-bold text-foreground">
                        {usageStats.limits?.usageLimit || "∞"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Usage Limit Per User
                      </label>
                      <p className="mt-1 text-2xl font-bold text-foreground">
                        {usageStats.limits?.usageLimitPerUser || "∞"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Used Count
                      </label>
                      <p className="mt-1 text-2xl font-bold text-foreground">
                        {usageStats.limits?.usedCount || 0}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Remaining
                      </label>
                      <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                        {usageStats.limits?.remaining !== undefined
                          ? usageStats.limits.remaining
                          : "∞"}
                      </p>
                    </div>
                  </div>
                </CustomCardContent>
              </CustomCard>
            </div>
          ) : (
            <CustomCard>
              <CustomCardContent className="py-12 text-center">
                <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No usage statistics available
                </p>
              </CustomCardContent>
            </CustomCard>
          )}
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

