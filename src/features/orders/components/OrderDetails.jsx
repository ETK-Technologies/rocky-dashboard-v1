"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  DollarSign,
  FileText,
  Mail,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  Truck,
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
import { useOrderDetails } from "../hooks/useOrderDetails";

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

const renderAddress = (address) => {
  if (!address) {
    return (
      <p className="text-sm text-muted-foreground">No address provided.</p>
    );
  }

  const lines = [
    [address.firstName, address.lastName].filter(Boolean).join(" "),
    address.company,
    address.addressLine1 || address.address1,
    address.addressLine2 || address.address2,
    [address.city, address.state, address.postalCode || address.zip]
      .filter(Boolean)
      .join(", "),
    address.country,
  ].filter(Boolean);

  return (
    <div className="space-y-1 text-sm text-foreground">
      {lines.map((line, index) => (
        <p key={`${line}-${index}`}>{line}</p>
      ))}
      {address.phone && (
        <p className="flex items-center gap-2 text-muted-foreground">
          <Phone className="h-4 w-4" />
          {address.phone}
        </p>
      )}
    </div>
  );
};

export default function OrderDetails({ orderId }) {
  const router = useRouter();
  const {
    order,
    loading,
    error,
    refresh,
    paymentIntent,
    fetchPaymentIntent,
    updateStatus,
    updatingStatus,
    processRefund,
    processingRefund,
    markAsShipped,
    markingShipped,
    capturePayment,
    capturingPayment,
  } = useOrderDetails(orderId);

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusForm, setStatusForm] = useState({
    status: "",
    notes: "",
    trackingNumber: "",
  });

  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundForm, setRefundForm] = useState({
    amount: "",
    reason: "",
    refundShipping: false,
  });

  const [shipModalOpen, setShipModalOpen] = useState(false);
  const [shipForm, setShipForm] = useState({
    trackingNumber: "",
  });

  const [paymentIntentModalOpen, setPaymentIntentModalOpen] = useState(false);
  const [paymentIntentLoading, setPaymentIntentLoading] = useState(false);

  useEffect(() => {
    if (!statusModalOpen && order) {
      setStatusForm((prev) => ({
        ...prev,
        status: order.status || "",
      }));
    }
  }, [statusModalOpen, order]);

  const items = useMemo(() => {
    if (!order) return [];
    if (Array.isArray(order.items)) return order.items;
    if (Array.isArray(order.lineItems)) return order.lineItems;
    if (Array.isArray(order.products)) return order.products;
    return [];
  }, [order]);

  const totals = useMemo(() => {
    if (!order) {
      return {
        subtotal: 0,
        shipping: 0,
        tax: 0,
        discount: 0,
        total: 0,
        currency: "USD",
      };
    }

    return {
      subtotal:
        order.subtotal ??
        order.subtotalAmount ??
        order.amountSubtotal ??
        order.pricing?.subtotal ??
        0,
      shipping:
        order.shippingAmount ??
        order.amountShipping ??
        order.pricing?.shipping ??
        0,
      tax: order.taxAmount ?? order.amountTax ?? order.pricing?.tax ?? 0,
      discount:
        order.discountAmount ??
        order.amountDiscount ??
        order.pricing?.discount ??
        0,
      total:
        order.totalAmount ??
        order.total ??
        order.grandTotal ??
        order.amount ??
        0,
      currency:
        order.currency || order.currencyCode || order.currency_code || "USD",
    };
  }, [order]);

  const paymentStatusLabel = useMemo(() => {
    if (!order) return null;
    const rawStatus =
      order.paymentStatus ||
      order.payment_status ||
      order.payment?.status ||
      "";
    const status = rawStatus.toUpperCase();
    const isPaid =
      status === "SUCCEEDED" || status === "PAID" || status === "CAPTURED";
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
  }, [order]);

  const handleStatusSubmit = async (event) => {
    event.preventDefault();
    if (!statusForm.status) return;

    try {
      await updateStatus({
        status: statusForm.status,
        notes: statusForm.notes || undefined,
        trackingNumber: statusForm.trackingNumber || undefined,
      });
      setStatusModalOpen(false);
      setStatusForm((prev) => ({
        ...prev,
        notes: "",
        trackingNumber: "",
      }));
    } catch {
      // error handling done in hook
    }
  };

  const handleRefundSubmit = async (event) => {
    event.preventDefault();
    if (!refundForm.amount) return;

    try {
      await processRefund({
        amount: Number(refundForm.amount),
        reason: refundForm.reason || undefined,
        refundShipping: Boolean(refundForm.refundShipping),
      });
      setRefundModalOpen(false);
      setRefundForm({
        amount: "",
        reason: "",
        refundShipping: false,
      });
    } catch {
      // handled in hook
    }
  };

  const handleShipSubmit = async (event) => {
    event.preventDefault();

    try {
      await markAsShipped({
        trackingNumber: shipForm.trackingNumber || undefined,
      });
      setShipModalOpen(false);
      setShipForm({
        trackingNumber: "",
      });
    } catch {
      // handled in hook
    }
  };

  const handlePaymentIntentOpen = async () => {
    if (paymentIntentModalOpen) return;
    setPaymentIntentModalOpen(true);

    if (!paymentIntent) {
      setPaymentIntentLoading(true);
      try {
        await fetchPaymentIntent();
      } catch {
        // handled in hook
      } finally {
        setPaymentIntentLoading(false);
      }
    }
  };

  if (loading) {
    return <LoadingState fullScreen message="Loading order..." />;
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader
          title="Order Details"
          description="Review order information"
          action={
            <CustomButton
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => refresh()}
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </CustomButton>
          }
        />
        <ErrorState
          title="Failed to load order"
          message={error}
          action={<CustomButton onClick={() => refresh()}>Retry</CustomButton>}
        />
      </PageContainer>
    );
  }

  if (!order) {
    return null;
  }

  const { label: statusLabel, className: statusClassName } = getStatusDisplay(
    order.status
  );
  const orderNumber =
    order.orderNumber || order.number || order.reference || order.id;
  const customer = order.user ||
    order.customer || {
      email: order.guestEmail,
      firstName: order.guestFirstName,
      lastName: order.guestLastName,
    };

  return (
    <PageContainer>
      <PageHeader
        title={`Order ${orderNumber ? `#${orderNumber}` : ""}`}
        description="Review order timeline, items, payment, and fulfillment status"
        action={
          <div className="flex flex-wrap gap-2">
            <CustomButton
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => router.push("/dashboard/orders")}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Orders
            </CustomButton>
            <CustomButton
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => refresh()}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </CustomButton>
          </div>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <CustomCard>
            <CustomCardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CustomCardTitle>Order Overview</CustomCardTitle>
                <CustomCardDescription>
                  Key order information and status
                </CustomCardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <CustomBadge variant="outline" className={statusClassName}>
                  {statusLabel}
                </CustomBadge>
                {paymentStatusLabel}
              </div>
            </CustomCardHeader>
            <CustomCardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3 p-4 border border-border rounded-lg">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-medium text-foreground">
                      {formatDateTime(order.createdAt || order.created_at)}
                    </p>
                    {order.updatedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Updated {formatDateTime(order.updatedAt)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border border-border rounded-lg">
                  <UserIcon className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Customer</p>
                    <p className="font-medium text-foreground">
                      {[customer?.firstName, customer?.lastName]
                        .filter(Boolean)
                        .join(" ") ||
                        customer?.fullName ||
                        "Guest Checkout"}
                    </p>
                    {customer?.email && (
                      <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                        <Mail className="h-4 w-4" />
                        {customer.email}
                      </p>
                    )}
                    {customer?.id && (
                      <p className="text-xs text-muted-foreground mt-1">
                        ID: <span className="font-mono">{customer.id}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border border-border rounded-lg">
                  <CreditCard className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Payment Method
                    </p>
                    <p className="font-medium text-foreground">
                      {order.paymentMethod ||
                        order.paymentMethodId ||
                        order.payment_method ||
                        order.payment?.method ||
                        "N/A"}
                    </p>
                    {order.stripePaymentIntentId && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Intent:{" "}
                        <span className="font-mono">
                          {order.stripePaymentIntentId}
                        </span>
                      </p>
                    )}
                    {order.stripePaymentIntentStatus && (
                      <p className="text-xs text-muted-foreground mt-1 capitalize">
                        Status:{" "}
                        {order.stripePaymentIntentStatus.replace(/_/g, " ")}
                      </p>
                    )}
                    {(order.stripeCapturedAmount ||
                      order.stripeAuthorizedAmount) && (
                      <div className="text-xs text-muted-foreground mt-2 space-y-1">
                        {order.stripeCapturedAmount && (
                          <p>
                            Captured:{" "}
                            <span className="font-medium text-foreground">
                              {formatCurrency(
                                order.stripeCapturedAmount,
                                order.currency
                              )}
                            </span>
                          </p>
                        )}
                        {order.stripeAuthorizedAmount && (
                          <p>
                            Authorized:{" "}
                            <span className="font-medium text-foreground">
                              {formatCurrency(
                                order.stripeAuthorizedAmount,
                                order.currency
                              )}
                            </span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border border-border rounded-lg">
                  <Truck className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fulfillment</p>
                    <p className="font-medium text-foreground">
                      {order.fulfillmentStatus ||
                        order.fulfillment_status ||
                        "Not fulfilled"}
                    </p>
                    {order.trackingNumber && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Tracking:{" "}
                        <span className="font-mono">
                          {order.trackingNumber}
                        </span>
                      </p>
                    )}
                    {order.shippingMethod && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Method: {order.shippingMethod}
                      </p>
                    )}
                    {order.shippedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Shipped: {formatDateTime(order.shippedAt)}
                      </p>
                    )}
                    {order.deliveredAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Delivered: {formatDateTime(order.deliveredAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CustomCardContent>
          </CustomCard>

          <CustomCard>
            <CustomCardHeader>
              <CustomCardTitle>Items</CustomCardTitle>
              <CustomCardDescription>
                Products included in this order
              </CustomCardDescription>
            </CustomCardHeader>
            <CustomCardContent className="pt-4">
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No items found for this order.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase text-muted-foreground border-b border-border">
                        <th className="pb-3">Product</th>
                        <th className="pb-3">SKU</th>
                        <th className="pb-3">Quantity</th>
                        <th className="pb-3">Unit Price</th>
                        <th className="pb-3">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {items.map((item, index) => {
                        const product = item.product || {};
                        const variant = item.variant || {};
                        const name =
                          item.name ||
                          item.productName ||
                          variant.name ||
                          product.name ||
                          "Product";
                        const sku =
                          item.sku ||
                          item.productSku ||
                          variant.sku ||
                          product.sku ||
                          "—";
                        const variantName =
                          item.variantName || variant.name || "";
                        const productType = product.type
                          ? product.type.replace(/_/g, " ")
                          : null;
                        const imageUrl =
                          item.image?.url ||
                          product.image?.url ||
                          (Array.isArray(product.images)
                            ? product.images[0]?.url
                            : null) ||
                          null;

                        return (
                          <tr key={item.id || item.sku || index}>
                            <td className="py-3">
                              <div className="flex items-start gap-3">
                                <div className="w-12 h-12 bg-secondary rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
                                  {imageUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={imageUrl}
                                      alt={name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Package className="h-5 w-5 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium text-foreground">
                                    {name}
                                  </span>
                                  {variantName && (
                                    <span className="text-xs text-muted-foreground mt-1">
                                      {variantName}
                                    </span>
                                  )}
                                  {productType && (
                                    <span className="text-xs text-muted-foreground mt-1 capitalize">
                                      {productType}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 text-muted-foreground">
                              {sku}
                            </td>
                            <td className="py-3">{item.quantity || 1}</td>
                            <td className="py-3">
                              {formatCurrency(
                                item.unitPrice ||
                                  item.price ||
                                  item.unit_price ||
                                  0,
                                totals.currency
                              )}
                            </td>
                            <td className="py-3 font-medium text-foreground">
                              {formatCurrency(
                                item.totalPrice ||
                                  item.total ||
                                  (item.unitPrice || item.price || 0) *
                                    (item.quantity || 1),
                                totals.currency
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CustomCardContent>
          </CustomCard>

          {order.notes && (
            <CustomCard>
              <CustomCardHeader>
                <CustomCardTitle>Internal Notes</CustomCardTitle>
              </CustomCardHeader>
              <CustomCardContent>
                <div className="bg-muted rounded-lg p-4 text-sm whitespace-pre-wrap text-foreground">
                  {order.notes}
                </div>
              </CustomCardContent>
            </CustomCard>
          )}
        </div>

        <div className="space-y-6">
          <CustomCard>
            <CustomCardHeader>
              <CustomCardTitle>Actions</CustomCardTitle>
              <CustomCardDescription>
                Manage order status and payment
              </CustomCardDescription>
            </CustomCardHeader>
            <CustomCardContent className="space-y-3">
              <CustomButton
                className="w-full flex items-center justify-center gap-2"
                onClick={() => setStatusModalOpen(true)}
                disabled={updatingStatus}
              >
                <FileText className="h-4 w-4" />
                Update Status
              </CustomButton>
              <CustomButton
                className="w-full flex items-center justify-center gap-2"
                variant="outline"
                onClick={() => setShipModalOpen(true)}
                disabled={markingShipped}
              >
                <Truck className="h-4 w-4" />
                Mark as Shipped
              </CustomButton>
              <CustomButton
                className="w-full flex items-center justify-center gap-2"
                variant="outline"
                onClick={() => setRefundModalOpen(true)}
                disabled={processingRefund}
              >
                <DollarSign className="h-4 w-4" />
                Process Refund
              </CustomButton>
              <CustomButton
                className="w-full flex items-center justify-center gap-2"
                variant="outline"
                onClick={async () => {
                  try {
                    await capturePayment();
                  } catch {
                    // handled in hook
                  }
                }}
                disabled={capturingPayment}
              >
                <CreditCard className="h-4 w-4" />
                Capture Payment
              </CustomButton>
              <CustomButton
                className="w-full flex items-center justify-center gap-2"
                variant="outline"
                onClick={handlePaymentIntentOpen}
              >
                <FileText className="h-4 w-4" />
                View Payment Intent
              </CustomButton>
            </CustomCardContent>
          </CustomCard>

          <CustomCard>
            <CustomCardHeader>
              <CustomCardTitle>Summary</CustomCardTitle>
              <CustomCardDescription>
                Order financial breakdown
              </CustomCardDescription>
            </CustomCardHeader>
            <CustomCardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(totals.subtotal, totals.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(totals.shipping, totals.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(totals.tax, totals.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discounts</span>
                  <span className="font-medium text-foreground">
                    - {formatCurrency(totals.discount, totals.currency)}
                  </span>
                </div>
                <Divider className="border-dashed" />
                <div className="flex justify-between text-base">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-bold text-foreground">
                    {formatCurrency(totals.total, totals.currency)}
                  </span>
                </div>
                {/* {(order.stripePaymentIntentStatus ||
                  order.stripeCapturedAmount ||
                  order.stripeAuthorizedAmount) && (
                  <>
                    <Divider className="border-dashed" />
                    <div className="space-y-2 text-xs text-muted-foreground">
                      {order.stripePaymentIntentStatus && (
                        <div className="flex justify-between">
                          <span>Intent Status</span>
                          <span className="text-foreground">
                            {order.stripePaymentIntentStatus.replace(/_/g, " ")}
                          </span>
                        </div>
                      )}
                      {order.stripeCapturedAmount && (
                        <div className="flex justify-between">
                          <span>Captured</span>
                          <span className="text-foreground font-medium">
                            {formatCurrency(
                              order.stripeCapturedAmount,
                              totals.currency
                            )}
                          </span>
                        </div>
                      )}
                      {order.stripeAuthorizedAmount && (
                        <div className="flex justify-between">
                          <span>Authorized</span>
                          <span className="text-foreground font-medium">
                            {formatCurrency(
                              order.stripeAuthorizedAmount,
                              totals.currency
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                )} */}
              </div>
            </CustomCardContent>
          </CustomCard>

          <CustomCard>
            <CustomCardHeader>
              <CustomCardTitle>Shipping Address</CustomCardTitle>
            </CustomCardHeader>
            <CustomCardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                <div>{renderAddress(order.shippingAddress)}</div>
              </div>
              {order.trackingNumber && (
                <p className="text-xs text-muted-foreground">
                  Tracking number:{" "}
                  <span className="font-mono">{order.trackingNumber}</span>
                </p>
              )}
            </CustomCardContent>
          </CustomCard>

          <CustomCard>
            <CustomCardHeader>
              <CustomCardTitle>Billing Address</CustomCardTitle>
            </CustomCardHeader>
            <CustomCardContent>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                <div>{renderAddress(order.billingAddress)}</div>
              </div>
            </CustomCardContent>
          </CustomCard>

          {Array.isArray(order.appliedCoupons) &&
            order.appliedCoupons.length > 0 && (
              <CustomCard>
                <CustomCardHeader>
                  <CustomCardTitle>Applied Coupons</CustomCardTitle>
                  <CustomCardDescription>
                    Discounts applied to this order
                  </CustomCardDescription>
                </CustomCardHeader>
                <CustomCardContent className="space-y-2">
                  {order.appliedCoupons.map((coupon, index) => {
                    const code =
                      coupon?.code ||
                      coupon?.id ||
                      coupon?.name ||
                      `Coupon ${index + 1}`;
                    const amount =
                      coupon?.amount ??
                      coupon?.discountAmount ??
                      coupon?.value ??
                      null;
                    return (
                      <div
                        key={`${code}-${index}`}
                        className="flex justify-between items-center text-sm border border-border rounded-lg px-3 py-2"
                      >
                        <span className="font-medium text-foreground">
                          {code}
                        </span>
                        {amount !== null && (
                          <span className="text-muted-foreground">
                            -{formatCurrency(amount, totals.currency)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </CustomCardContent>
              </CustomCard>
            )}
        </div>
      </div>

      {/* Update Status Modal */}
      <CustomModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update Order Status"
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Status
            </label>
            <select
              value={statusForm.status}
              onChange={(event) =>
                setStatusForm((prev) => ({
                  ...prev,
                  status: event.target.value,
                }))
              }
              className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-primary"
              required
            >
              <option value="" disabled>
                Select status
              </option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Tracking Number (optional)
            </label>
            <CustomInput
              type="text"
              value={statusForm.trackingNumber}
              onChange={(event) =>
                setStatusForm((prev) => ({
                  ...prev,
                  trackingNumber: event.target.value,
                }))
              }
              placeholder="Add tracking number"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Notes (optional)
            </label>
            <textarea
              value={statusForm.notes}
              onChange={(event) =>
                setStatusForm((prev) => ({
                  ...prev,
                  notes: event.target.value,
                }))
              }
              placeholder="Add internal notes for this status update"
              className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[120px] dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-primary"
            />
          </div>

          <div className="flex justify-end gap-3">
            <CustomButton
              type="button"
              variant="outline"
              onClick={() => setStatusModalOpen(false)}
            >
              Cancel
            </CustomButton>
            <CustomButton type="submit" disabled={updatingStatus}>
              Save Changes
            </CustomButton>
          </div>
        </form>
      </CustomModal>

      {/* Refund Modal */}
      <CustomModal
        isOpen={refundModalOpen}
        onClose={() => setRefundModalOpen(false)}
        title="Process Refund"
      >
        <form onSubmit={handleRefundSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Amount
            </label>
            <CustomInput
              type="number"
              min="0"
              step="0.01"
              required
              value={refundForm.amount}
              onChange={(event) =>
                setRefundForm((prev) => ({
                  ...prev,
                  amount: event.target.value,
                }))
              }
              placeholder="Enter refund amount"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Maximum refundable amount:{" "}
              <span className="font-medium">
                {formatCurrency(totals.total, totals.currency)}
              </span>
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Reason (optional)
            </label>
            <textarea
              value={refundForm.reason}
              onChange={(event) =>
                setRefundForm((prev) => ({
                  ...prev,
                  reason: event.target.value,
                }))
              }
              placeholder="Add a reason for this refund"
              className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[120px] dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-primary"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={refundForm.refundShipping}
              onChange={(event) =>
                setRefundForm((prev) => ({
                  ...prev,
                  refundShipping: event.target.checked,
                }))
              }
              className="w-4 h-4 text-primary bg-background border-input rounded focus:ring-primary focus:ring-2 cursor-pointer"
            />
            Refund shipping amount
          </label>

          <div className="flex justify-end gap-3">
            <CustomButton
              type="button"
              variant="outline"
              onClick={() => setRefundModalOpen(false)}
            >
              Cancel
            </CustomButton>
            <CustomButton type="submit" disabled={processingRefund}>
              Process Refund
            </CustomButton>
          </div>
        </form>
      </CustomModal>

      {/* Shipping Modal */}
      <CustomModal
        isOpen={shipModalOpen}
        onClose={() => setShipModalOpen(false)}
        title="Mark as Shipped"
      >
        <form onSubmit={handleShipSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Tracking Number (optional)
            </label>
            <CustomInput
              type="text"
              value={shipForm.trackingNumber}
              onChange={(event) =>
                setShipForm((prev) => ({
                  ...prev,
                  trackingNumber: event.target.value,
                }))
              }
              placeholder="Enter tracking number"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Updating status to <strong>SHIPPED</strong>. Tracking number will be
            attached to the order if provided.
          </p>

          <div className="flex justify-end gap-3">
            <CustomButton
              type="button"
              variant="outline"
              onClick={() => setShipModalOpen(false)}
            >
              Cancel
            </CustomButton>
            <CustomButton type="submit" disabled={markingShipped}>
              Mark as Shipped
            </CustomButton>
          </div>
        </form>
      </CustomModal>

      {/* Payment Intent Modal */}
      <CustomModal
        isOpen={paymentIntentModalOpen}
        onClose={() => setPaymentIntentModalOpen(false)}
        title="Stripe Payment Intent"
        size="xl"
      >
        {paymentIntentLoading ? (
          <LoadingState message="Loading payment intent..." />
        ) : paymentIntent ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Payment intent details retrieved from Stripe.
            </p>
            <pre className="bg-muted rounded-lg p-4 text-xs overflow-x-auto max-h-[500px] text-foreground">
              {JSON.stringify(paymentIntent, null, 2)}
            </pre>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No payment intent information available for this order.
          </p>
        )}
      </CustomModal>
    </PageContainer>
  );
}
