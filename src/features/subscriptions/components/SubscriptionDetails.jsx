"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  DollarSign,
  Loader2,
  Pause,
  Play,
  RefreshCw,
  X,
  User as UserIcon,
} from "lucide-react";
import {
  CustomBadge,
  CustomButton,
  CustomCard,
  CustomCardContent,
  CustomCardDescription,
  CustomCardHeader,
  CustomCardTitle,
  CustomInput,
  CustomModal,
  Divider,
  ErrorState,
  LoadingState,
  PageContainer,
  PageHeader,
} from "@/components/ui";
import { useSubscriptionDetails } from "../hooks/useSubscriptionDetails";

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

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleString();
};

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

export default function SubscriptionDetails({ subscriptionId }) {
  const router = useRouter();
  const {
    subscription,
    loading,
    error,
    refresh,
    cancel,
    canceling,
    pause,
    pausing,
    resume,
    resuming,
  } = useSubscriptionDetails(subscriptionId);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const handleCancel = async () => {
    try {
      await cancel(cancelReason || undefined);
      setShowCancelModal(false);
      setCancelReason("");
    } catch (err) {
      // Error already handled in hook
    }
  };

  const handlePause = async () => {
    try {
      await pause();
    } catch (err) {
      // Error already handled in hook
    }
  };

  const handleResume = async () => {
    try {
      await resume();
    } catch (err) {
      // Error already handled in hook
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingState message="Loading subscription details..." />
      </PageContainer>
    );
  }

  if (error || !subscription) {
    return (
      <PageContainer>
        <PageHeader
          title="Subscription Details"
          action={
            <CustomButton
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard/subscriptions")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Subscriptions
            </CustomButton>
          }
        />
        <ErrorState
          title="Failed to load subscription"
          message={error || "Subscription not found"}
          action={
            <CustomButton onClick={refresh} disabled={loading}>
              Retry
            </CustomButton>
          }
        />
      </PageContainer>
    );
  }

  const status = subscription.status || "";
  const isActive = status === "ACTIVE";
  const isPaused = status === "PAUSED";
  const isCanceled = status === "CANCELED";
  const canPause = isActive;
  const canResume = isPaused;
  const canCancel = !isCanceled;

  const { label: statusLabel, className: statusClassName } =
    getStatusDisplay(status);

  const user = subscription.user || subscription.customer || {};
  const userName =
    user.fullName ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.email ||
    "Unknown";

  // Helper to parse string numbers
  const parseNumber = (value) => {
    if (value === null || value === undefined) return 0;
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  return (
    <PageContainer>
      <PageHeader
        title="Subscription Details"
        description={`Subscription ${
          subscription.id || subscription.subscriptionId || ""
        }`}
        action={
          <div className="flex items-center gap-2">
            <CustomButton
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </CustomButton>
            <CustomButton
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard/subscriptions")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </CustomButton>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subscription Overview */}
          <CustomCard>
            <CustomCardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CustomCardTitle>Subscription Overview</CustomCardTitle>
                  <CustomCardDescription>
                    Basic subscription information
                  </CustomCardDescription>
                </div>
                <CustomBadge variant="outline" className={statusClassName}>
                  {statusLabel}
                </CustomBadge>
              </div>
            </CustomCardHeader>
            <CustomCardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Subscription ID
                  </p>
                  <p className="text-sm text-foreground mt-1">
                    {subscription.id || subscription.subscriptionId || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    WordPress ID
                  </p>
                  <p className="text-sm text-foreground mt-1">
                    {subscription.wordpressId ||
                      subscription.wordpress_id ||
                      "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Created At
                  </p>
                  <p className="text-sm text-foreground mt-1">
                    {formatDateTime(
                      subscription.createdAt || subscription.created_at
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Updated At
                  </p>
                  <p className="text-sm text-foreground mt-1">
                    {formatDateTime(
                      subscription.updatedAt || subscription.updated_at
                    )}
                  </p>
                </div>
              </div>
            </CustomCardContent>
          </CustomCard>

          {/* Billing Information */}
          <CustomCard>
            <CustomCardHeader>
              <CustomCardTitle>Billing Information</CustomCardTitle>
              <CustomCardDescription>
                Billing cycle and payment details
              </CustomCardDescription>
            </CustomCardHeader>
            <CustomCardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Billing Interval
                  </p>
                  <p className="text-sm text-foreground mt-1">
                    {subscription.billingIntervalCount ||
                      subscription.billing_interval_count ||
                      1}{" "}
                    {(
                      subscription.billingInterval ||
                      subscription.billing_interval ||
                      "MONTH"
                    ).toLowerCase()}
                    {(subscription.billingIntervalCount ||
                      subscription.billing_interval_count ||
                      1) > 1
                      ? "s"
                      : ""}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Currency
                  </p>
                  <p className="text-sm text-foreground mt-1">
                    {subscription.currency ||
                      subscription.currencyCode ||
                      "USD"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Subtotal
                  </p>
                  <p className="text-sm text-foreground mt-1">
                    {formatCurrency(
                      parseNumber(
                        subscription.subtotal || subscription.subtotalAmount
                      ),
                      subscription.currency || "USD"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Tax Amount
                  </p>
                  <p className="text-sm text-foreground mt-1">
                    {formatCurrency(
                      parseNumber(
                        subscription.taxAmount || subscription.tax_amount
                      ),
                      subscription.currency || "USD"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Amount
                  </p>
                  <p className="text-lg font-semibold text-foreground mt-1">
                    {formatCurrency(
                      parseNumber(
                        subscription.totalAmount || subscription.total
                      ),
                      subscription.currency || "USD"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Payment Method
                  </p>
                  <p className="text-sm text-foreground mt-1">
                    {subscription.paymentMethodId ||
                      subscription.payment_method_id ||
                      "-"}
                  </p>
                </div>
              </div>
            </CustomCardContent>
          </CustomCard>

          {/* Billing Cycle */}
          <CustomCard>
            <CustomCardHeader>
              <CustomCardTitle>Billing Cycle</CustomCardTitle>
              <CustomCardDescription>
                Current period and next billing date
              </CustomCardDescription>
            </CustomCardHeader>
            <CustomCardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Current Period Start
                  </p>
                  <p className="text-sm text-foreground mt-1">
                    {formatDateTime(
                      subscription.currentPeriodStart ||
                        subscription.current_period_start
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Current Period End
                  </p>
                  <p className="text-sm text-foreground mt-1">
                    {formatDateTime(
                      subscription.currentPeriodEnd ||
                        subscription.current_period_end
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Next Billing Date
                  </p>
                  <p className="text-sm text-foreground mt-1">
                    {formatDateTime(
                      subscription.nextBillingAt || subscription.next_billing_at
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Billing Cycle Anchor
                  </p>
                  <p className="text-sm text-foreground mt-1">
                    {formatDateTime(
                      subscription.billingCycleAnchor ||
                        subscription.billing_cycle_anchor
                    )}
                  </p>
                </div>
              </div>
            </CustomCardContent>
          </CustomCard>

          {/* Trial Information */}
          {(subscription.trialStart ||
            subscription.trial_start ||
            subscription.trialEnd ||
            subscription.trial_end) && (
            <CustomCard>
              <CustomCardHeader>
                <CustomCardTitle>Trial Information</CustomCardTitle>
                <CustomCardDescription>
                  Trial period details
                </CustomCardDescription>
              </CustomCardHeader>
              <CustomCardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Trial Start
                    </p>
                    <p className="text-sm text-foreground mt-1">
                      {formatDateTime(
                        subscription.trialStart || subscription.trial_start
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Trial End
                    </p>
                    <p className="text-sm text-foreground mt-1">
                      {formatDateTime(
                        subscription.trialEnd || subscription.trial_end
                      )}
                    </p>
                  </div>
                </div>
              </CustomCardContent>
            </CustomCard>
          )}

          {/* Subscription Items */}
          {subscription.items &&
            Array.isArray(subscription.items) &&
            subscription.items.length > 0 && (
              <CustomCard>
                <CustomCardHeader>
                  <CustomCardTitle>Subscription Items</CustomCardTitle>
                  <CustomCardDescription>
                    Products included in this subscription
                  </CustomCardDescription>
                </CustomCardHeader>
                <CustomCardContent>
                  <div className="space-y-4">
                    {subscription.items.map((item, index) => {
                      const product = item.product || {};
                      const variant = item.variant || {};
                      const productName =
                        product.name || item.productName || "Product";
                      const variantName = variant.name || item.variantName;
                      const quantity = item.quantity || 1;
                      const unitPrice = parseNumber(
                        item.unitPrice ||
                          item.unit_price ||
                          variant.price ||
                          product.basePrice ||
                          0
                      );
                      const totalPrice = parseNumber(
                        item.totalPrice ||
                          item.total_price ||
                          unitPrice * quantity
                      );
                      const currency = subscription.currency || "USD";

                      return (
                        <div
                          key={item.id || index}
                          className="p-4 border border-border rounded-lg"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium text-foreground">
                                {productName}
                              </p>
                              {variantName && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Variant: {variantName}
                                </p>
                              )}
                              {product.sku && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  SKU: {product.sku}
                                </p>
                              )}
                              {variant.sku && variant.sku !== product.sku && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Variant SKU: {variant.sku}
                                </p>
                              )}
                              <div className="mt-2 flex items-center gap-4">
                                <p className="text-sm text-muted-foreground">
                                  Quantity:{" "}
                                  <span className="font-medium text-foreground">
                                    {quantity}
                                  </span>
                                </p>
                                {quantity > 1 && (
                                  <p className="text-sm text-muted-foreground">
                                    Unit Price:{" "}
                                    <span className="font-medium text-foreground">
                                      {formatCurrency(unitPrice, currency)}
                                    </span>
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <p className="font-semibold text-lg text-foreground">
                                {formatCurrency(totalPrice, currency)}
                              </p>
                              {quantity > 1 && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatCurrency(unitPrice, currency)} each
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CustomCardContent>
              </CustomCard>
            )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <CustomCard
            className="cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => {
              const userId =
                user.id || subscription.userId || subscription.user_id;
              if (userId) {
                router.push(`/dashboard/users/${userId}`);
              }
            }}
          >
            <CustomCardHeader>
              <CustomCardTitle>Customer</CustomCardTitle>
            </CustomCardHeader>
            <CustomCardContent>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {userName}
                  </p>
                  {user.email && (
                    <p className="text-sm text-muted-foreground truncate">
                      {user.email}
                    </p>
                  )}
                  {(user.id || subscription.userId || subscription.user_id) && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5 font-mono">
                      ID:{" "}
                      {user.id || subscription.userId || subscription.user_id}
                    </p>
                  )}
                </div>
              </div>
            </CustomCardContent>
          </CustomCard>

          {/* Actions */}
          <CustomCard>
            <CustomCardHeader>
              <CustomCardTitle>Actions</CustomCardTitle>
            </CustomCardHeader>
            <CustomCardContent className="space-y-2">
              {canPause && (
                <CustomButton
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handlePause}
                  disabled={pausing}
                >
                  {pausing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Pause className="h-4 w-4 mr-2" />
                  )}
                  Pause Subscription
                </CustomButton>
              )}
              {canResume && (
                <CustomButton
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleResume}
                  disabled={resuming}
                >
                  {resuming ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Resume Subscription
                </CustomButton>
              )}
              {canCancel && (
                <CustomButton
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={() => setShowCancelModal(true)}
                  disabled={canceling}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel Subscription
                </CustomButton>
              )}
            </CustomCardContent>
          </CustomCard>

          {/* Payment Information */}
          <CustomCard>
            <CustomCardHeader>
              <CustomCardTitle>Payment Information</CustomCardTitle>
            </CustomCardHeader>
            <CustomCardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Last Payment
                </p>
                <p className="text-sm text-foreground mt-1">
                  {formatDateTime(
                    subscription.lastPaymentAt || subscription.last_payment_at
                  )}
                </p>
              </div>
              {(subscription.lastPaymentStatus ||
                subscription.last_payment_status) && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Payment Status
                  </p>
                  <p className="text-sm text-foreground mt-1">
                    {subscription.lastPaymentStatus ||
                      subscription.last_payment_status}
                  </p>
                </div>
              )}
              {subscription.cancelAtPeriodEnd !== undefined && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Cancel at Period End
                  </p>
                  <p className="text-sm text-foreground mt-1">
                    {subscription.cancelAtPeriodEnd ||
                    subscription.cancel_at_period_end
                      ? "Yes"
                      : "No"}
                  </p>
                </div>
              )}
              {subscription.canceledAt || subscription.canceled_at ? (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Canceled At
                  </p>
                  <p className="text-sm text-foreground mt-1">
                    {formatDateTime(
                      subscription.canceledAt || subscription.canceled_at
                    )}
                  </p>
                </div>
              ) : null}
              {(subscription.cancellationReason ||
                subscription.cancellation_reason) && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Cancellation Reason
                  </p>
                  <p className="text-sm text-foreground mt-1">
                    {subscription.cancellationReason ||
                      subscription.cancellation_reason}
                  </p>
                </div>
              )}
            </CustomCardContent>
          </CustomCard>
        </div>
      </div>

      {/* Cancel Modal */}
      <CustomModal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setCancelReason("");
        }}
        title="Cancel Subscription"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to cancel this subscription? This action
            cannot be undone.
          </p>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Cancellation Reason (Optional)
            </label>
            <CustomInput
              type="text"
              placeholder="Enter reason for cancellation..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <CustomButton
              variant="outline"
              onClick={() => {
                setShowCancelModal(false);
                setCancelReason("");
              }}
            >
              Cancel
            </CustomButton>
            <CustomButton
              variant="destructive"
              onClick={handleCancel}
              disabled={canceling}
            >
              {canceling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Canceling...
                </>
              ) : (
                "Confirm Cancellation"
              )}
            </CustomButton>
          </div>
        </div>
      </CustomModal>
    </PageContainer>
  );
}
