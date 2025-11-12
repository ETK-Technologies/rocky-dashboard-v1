"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  Calendar,
  CreditCard,
  DollarSign,
  FileText,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Package,
  Paperclip,
  Phone,
  RefreshCcw,
  RefreshCw,
  Send,
  Stethoscope,
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

const toAttributeEntries = (source) => {
  if (!source) return [];

  if (Array.isArray(source)) {
    return source
      .map((entry) => {
        if (!entry) return null;

        if (Array.isArray(entry)) {
          if (entry.length === 0) return null;
          if (entry.length === 1) return [entry[0], null];
          return [entry[0], entry[1]];
        }

        if (typeof entry === "object") {
          const key =
            entry.name ||
            entry.attributeName ||
            entry.key ||
            entry.label ||
            entry.title ||
            entry.code;
          const value =
            entry.value ??
            entry.attributeValue ??
            entry.option ??
            entry.text ??
            entry.displayValue ??
            entry.display_value ??
            entry.content;

          if (!key) return null;
          return [key, value];
        }

        return null;
      })
      .filter(Boolean);
  }

  if (typeof source === "object") {
    return Object.entries(source);
  }

  return [];
};

const buildAttributeEntries = (...sources) => {
  const seen = new Set();
  const entries = [];

  sources
    .flatMap((source) => toAttributeEntries(source))
    .forEach(([key, value]) => {
      if (!key) return;
      const normalizedKey = key.toString().trim();
      if (!normalizedKey) return;
      const lower = normalizedKey.toLowerCase();
      if (seen.has(lower)) return;
      seen.add(lower);
      entries.push([normalizedKey, value]);
    });

  return entries;
};

const getAttributeValue = (entries, keys) => {
  if (!entries || entries.length === 0) return undefined;
  const normalizedEntries = entries.map(([key, value]) => [
    key.toLowerCase(),
    value,
  ]);

  for (const key of keys) {
    const lowerKey = key.toLowerCase();
    const match = normalizedEntries.find(([entryKey]) => entryKey === lowerKey);
    if (match) return match[1];
  }

  return undefined;
};

const formatAttributeValue = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(", ") || "—";
  }

  if (value && typeof value === "object") {
    if (typeof value.value !== "undefined") {
      return value.value;
    }
    if (typeof value.label !== "undefined") {
      return value.label;
    }
    return JSON.stringify(value);
  }

  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return value;
};

const getAttachmentIdentifier = (attachment) => {
  if (!attachment) return null;
  return (
    attachment.id ||
    attachment.attachmentId ||
    attachment.attachment_id ||
    attachment.uploadId ||
    attachment.upload_id ||
    attachment.upload?.id ||
    attachment.upload?.url ||
    null
  );
};

const formatFileSize = (size) => {
  if (size === null || size === undefined) return null;
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
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
    doctorOptions,
    doctorOptionsLoaded,
    fetchDoctorOptions,
    loadingDoctorOptions,
    assignDoctor,
    assigningDoctor,
    addOrderNote,
    sendOrderDetailsToCustomer,
    sendingOrderDetails,
    resendNewOrderNotification,
    resendingOrderNotification,
    regenerateDownloadPermissions,
    regeneratingDownloadPermissions,
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
  const [paymentDetailsModalOpen, setPaymentDetailsModalOpen] = useState(false);
  const [statusSelectValue, setStatusSelectValue] = useState("");
  const [doctorSelectValue, setDoctorSelectValue] = useState("");
  const [internalNoteContent, setInternalNoteContent] = useState("");
  const [addingInternalNote, setAddingInternalNote] = useState(false);
  const notesEndRef = useRef(null);
  const previousNotesLengthRef = useRef(0);

  useEffect(() => {
    if (!statusModalOpen && order) {
      setStatusForm((prev) => ({
        ...prev,
        status: order.status || "",
      }));
    }
  }, [statusModalOpen, order]);

  useEffect(() => {
    if (!order) {
      setStatusSelectValue("");
      setDoctorSelectValue("");
      return;
    }

    setStatusSelectValue(order.status || "");

    const assignedDoctorId =
      order.assignedDoctorId ||
      order.doctorId ||
      order.doctor?.id ||
      order.doctor?.userId ||
      "";

    setDoctorSelectValue(assignedDoctorId ? String(assignedDoctorId) : "");
  }, [order]);

  useEffect(() => {
    if (
      order &&
      !doctorOptionsLoaded &&
      !loadingDoctorOptions &&
      typeof fetchDoctorOptions === "function"
    ) {
      const hasAssignedDoctor =
        order.assignedDoctorId ||
        order.doctorId ||
        order.doctor?.id ||
        order.doctor?.userId;

      if (hasAssignedDoctor) {
        fetchDoctorOptions().catch(() => {});
      }
    }
  }, [order, doctorOptionsLoaded, loadingDoctorOptions, fetchDoctorOptions]);

  const items = useMemo(() => {
    if (!order) return [];
    if (Array.isArray(order.items)) return order.items;
    if (Array.isArray(order.lineItems)) return order.lineItems;
    if (Array.isArray(order.products)) return order.products;
    return [];
  }, [order]);

  const orderNotes = useMemo(() => {
    if (!order) return [];
    if (Array.isArray(order.orderNotes)) return order.orderNotes;
    return [];
  }, [order]);

  const customerNotes = useMemo(
    () =>
      orderNotes.filter(
        (note) =>
          (note?.authorType || "").toString().toUpperCase() === "CUSTOMER" ||
          note?.isInternal === false
      ),
    [orderNotes]
  );

  const internalOrderNotes = useMemo(
    () =>
      orderNotes.filter(
        (note) =>
          (note?.authorType || "").toString().toUpperCase() !== "CUSTOMER"
      ),
    [orderNotes]
  );

  useEffect(() => {
    // Only scroll if a new note was added (length increased), not on initial load
    const currentLength = internalOrderNotes.length;
    const previousLength = previousNotesLengthRef.current;

    if (
      currentLength > previousLength &&
      previousLength > 0 &&
      notesEndRef.current
    ) {
      notesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }

    // Update the previous length for next comparison
    previousNotesLengthRef.current = currentLength;
  }, [internalOrderNotes]);

  const attachments = useMemo(() => {
    if (!order?.attachments) return [];

    if (Array.isArray(order.attachments)) {
      return order.attachments;
    }

    const groups = Object.values(order.attachments).filter((group) =>
      Array.isArray(group)
    );

    const deduped = [];
    const seen = new Set();

    groups.forEach((group) => {
      group.forEach((attachment) => {
        if (!attachment) return;
        const identifier = getAttachmentIdentifier(attachment);
        if (identifier && seen.has(identifier)) return;
        if (identifier) {
          seen.add(identifier);
        }
        deduped.push(attachment);
      });
    });

    return deduped;
  }, [order]);

  const pharmacyHardcopy = useMemo(() => {
    if (!order?.attachments) return [];

    const value =
      order.attachments.pharmacyHardcopy ??
      order.attachments.pharmacyHardcopies ??
      order.attachments.PHARMACY_HARDCOPY ??
      order.attachments.pharmacy ??
      [];

    return Array.isArray(value) ? value : [];
  }, [order]);

  const scannedDocuments = useMemo(() => {
    if (!order?.attachments) return [];

    const value =
      order.attachments.scannedDocuments ??
      order.attachments.scannedDocument ??
      order.attachments.documents ??
      order.attachments.SCANNED_DOCUMENT ??
      [];

    return Array.isArray(value) ? value : [];
  }, [order]);

  const relatedOrders = useMemo(() => {
    if (!order) return [];

    const possibleRelated =
      order.relatedOrders ??
      order.related ??
      order.linkedOrders ??
      order.linked ??
      order.user?.relatedOrders ??
      order.user?.recentOrders ??
      [];

    if (Array.isArray(possibleRelated)) {
      return possibleRelated;
    }

    if (Array.isArray(possibleRelated?.items)) {
      return possibleRelated.items;
    }

    if (Array.isArray(possibleRelated?.data)) {
      return possibleRelated.data;
    }

    return [];
  }, [order]);

  const normalizedDoctorOptions = useMemo(() => {
    if (!Array.isArray(doctorOptions)) return [];

    const options = doctorOptions
      .map((doctor) => {
        if (!doctor) return null;
        const value =
          doctor.id ||
          doctor.userId ||
          doctor.user_id ||
          doctor.doctorId ||
          doctor.identifier ||
          doctor.value ||
          doctor.uuid;

        if (!value) return null;

        const firstName = doctor.firstName || doctor.first_name;
        const lastName = doctor.lastName || doctor.last_name;
        const email =
          doctor.email ||
          doctor.contactEmail ||
          doctor.contact_email ||
          doctor.user?.email;

        const label =
          doctor.label ||
          doctor.name ||
          [firstName, lastName].filter(Boolean).join(" ") ||
          email ||
          value;

        return {
          value: String(value),
          label,
          email,
          raw: doctor,
          isFallback: false,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.label.localeCompare(b.label));

    return options;
  }, [doctorOptions]);

  const resolvedDoctorOptions = useMemo(() => {
    if (!order) return normalizedDoctorOptions;

    if (
      !doctorSelectValue ||
      normalizedDoctorOptions.some(
        (option) => option.value === doctorSelectValue
      )
    ) {
      return normalizedDoctorOptions;
    }

    const fallbackDoctor = order.doctor || order.assignedDoctor;
    const fallbackLabel = fallbackDoctor
      ? [fallbackDoctor.firstName, fallbackDoctor.lastName]
          .filter(Boolean)
          .join(" ") ||
        fallbackDoctor.email ||
        doctorSelectValue
      : doctorSelectValue;

    return [
      ...normalizedDoctorOptions,
      {
        value: String(doctorSelectValue),
        label: fallbackLabel,
        email: fallbackDoctor?.email,
        raw: fallbackDoctor,
        isFallback: true,
      },
    ];
  }, [normalizedDoctorOptions, doctorSelectValue, order]);

  const paymentMethod = order?.payment?.method;
  const paymentStripe = order?.payment?.stripe;
  const paymentBillingDetails =
    paymentMethod?.billingDetails || order?.payment?.billingDetails;

  const paymentMethodSummary = useMemo(() => {
    if (!order) return "N/A";

    if (paymentMethod) {
      const summaryParts = [];

      if (paymentMethod.brand) {
        summaryParts.push(paymentMethod.brand.toUpperCase());
      }

      if (paymentMethod.type && !summaryParts.includes(paymentMethod.type)) {
        summaryParts.push(paymentMethod.type.replace(/_/g, " "));
      }

      if (paymentMethod.last4) {
        summaryParts.push(`•••• ${paymentMethod.last4}`);
      }

      if (paymentMethod.bankName) {
        summaryParts.push(paymentMethod.bankName);
      }

      if (summaryParts.length > 0) {
        return summaryParts.join(" • ");
      }

      return paymentMethod.id || "Payment Method";
    }

    return (
      order.paymentMethod ||
      order.paymentMethodId ||
      order.payment_method ||
      "N/A"
    );
  }, [order, paymentMethod]);

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

  const relatedOrdersForDisplay = useMemo(() => {
    if (!Array.isArray(relatedOrders) || relatedOrders.length === 0) {
      return [];
    }

    return relatedOrders
      .map((related) => {
        if (!related) return null;

        const relatedId =
          related?.id ||
          related?.orderId ||
          related?.order_id ||
          related?.uuid ||
          related?.identifier ||
          related?.value ||
          null;
        const relatedNumber =
          related?.orderNumber ||
          related?.number ||
          related?.reference ||
          relatedId ||
          "Order";
        const rawStatus = (
          related?.status ||
          related?.orderStatus ||
          related?.order_status ||
          "UNKNOWN"
        ).toString();
        const { label: statusLabel, className: statusClassName } =
          getStatusDisplay(rawStatus);
        const relatedTotal =
          related?.totalAmount ??
          related?.total ??
          related?.amount ??
          related?.grandTotal ??
          null;
        const relatedCurrency =
          related?.currency ||
          related?.currencyCode ||
          related?.currency_code ||
          totals.currency ||
          "USD";
        const createdAt =
          related?.createdAt ||
          related?.created_at ||
          related?.createdDate ||
          related?.created_date ||
          null;

        return {
          id: relatedId,
          number: relatedNumber,
          statusLabel,
          statusClassName,
          total: relatedTotal,
          totalLabel:
            relatedTotal !== null
              ? formatCurrency(relatedTotal, relatedCurrency)
              : null,
          placedAt: createdAt,
          placedLabel: createdAt ? formatDateTime(createdAt) : null,
        };
      })
      .filter(Boolean);
  }, [relatedOrders, totals.currency]);

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

  const handleStatusSelectChange = async (event) => {
    const newStatus = event.target.value;
    if (!newStatus || newStatus === statusSelectValue) {
      return;
    }

    const previousStatus = statusSelectValue;
    setStatusSelectValue(newStatus);

    try {
      await updateStatus({
        status: newStatus,
      });
    } catch {
      setStatusSelectValue(previousStatus || order?.status || "");
    }
  };

  const handleDoctorSelectChange = async (event) => {
    const selectedDoctorId = event.target.value;
    if (selectedDoctorId === doctorSelectValue) return;

    const previousDoctorId = doctorSelectValue;
    setDoctorSelectValue(selectedDoctorId);

    try {
      await assignDoctor(selectedDoctorId || null);
    } catch {
      setDoctorSelectValue(previousDoctorId || "");
    }
  };

  const handleDoctorSelectFocus = async () => {
    const normalizedOptionsCount = normalizedDoctorOptions.length;
    const hasOnlyFallback =
      normalizedOptionsCount > 0 &&
      normalizedDoctorOptions.every((option) => option.isFallback);

    const shouldFetchDoctors =
      !doctorOptionsLoaded || normalizedOptionsCount === 0 || hasOnlyFallback;

    if (
      shouldFetchDoctors &&
      !loadingDoctorOptions &&
      typeof fetchDoctorOptions === "function"
    ) {
      try {
        await fetchDoctorOptions();
      } catch {
        // error handled in hook
      }
    }
  };

  const handleInternalNoteSubmit = async (event) => {
    event.preventDefault();
    const trimmed = internalNoteContent.trim();
    if (!trimmed) return;

    setAddingInternalNote(true);
    try {
      await addOrderNote({
        content: trimmed,
        isInternal: true,
      });
      setInternalNoteContent("");
    } catch {
      // errors handled in hook
    } finally {
      setAddingInternalNote(false);
    }
  };

  const paymentDetails = useMemo(() => {
    if (!order) return null;

    const stripeDetails = {
      stripePaymentIntentId: order.stripePaymentIntentId,
      stripePaymentIntentStatus: order.stripePaymentIntentStatus,
      stripeCapturedAmount: order.stripeCapturedAmount,
      stripeAuthorizedAmount: order.stripeAuthorizedAmount,
      paymentIntent: paymentIntent,
      stripeMeta: order.payment?.stripe,
    };

    return {
      summary: paymentMethodSummary,
      methodId:
        order.paymentMethodId ||
        order.paymentMethod ||
        order.payment_method ||
        paymentMethod?.id ||
        null,
      brand: paymentMethod?.brand,
      type: paymentMethod?.type,
      last4: paymentMethod?.last4,
      expiryMonth: paymentMethod?.expiryMonth,
      expiryYear: paymentMethod?.expiryYear,
      billingDetails: paymentBillingDetails,
      stripe: stripeDetails,
    };
  }, [
    order,
    paymentMethodSummary,
    paymentMethod,
    paymentBillingDetails,
    paymentIntent,
  ]);

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
            <CustomCardHeader>
              <CustomCardTitle>Actions</CustomCardTitle>
              <CustomCardDescription>
                Manage order status, payment, and customer notifications
              </CustomCardDescription>
            </CustomCardHeader>
            <CustomCardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Order Status
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={statusSelectValue}
                    onChange={handleStatusSelectChange}
                    disabled={updatingStatus}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-primary"
                  >
                    <option value="">
                      {statusSelectValue
                        ? "Select status"
                        : "Select order status"}
                    </option>
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                  {updatingStatus && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Changes apply immediately. Add notes in the order timeline to
                  track updates.
                </p>
              </div>

              <Divider />

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                <CustomButton
                  className="w-full flex items-center justify-center gap-2"
                  variant="outline"
                  onClick={async () => {
                    try {
                      await sendOrderDetailsToCustomer();
                    } catch {
                      // handled in hook
                    }
                  }}
                  disabled={sendingOrderDetails}
                >
                  {sendingOrderDetails ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Send Order Details
                </CustomButton>
                <CustomButton
                  className="w-full flex items-center justify-center gap-2"
                  variant="outline"
                  onClick={async () => {
                    try {
                      await resendNewOrderNotification();
                    } catch {
                      // handled in hook
                    }
                  }}
                  disabled={resendingOrderNotification}
                >
                  {resendingOrderNotification ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Bell className="h-4 w-4" />
                  )}
                  Resend New Order
                </CustomButton>
                <CustomButton
                  className="w-full md:w-[250px] flex items-center justify-center gap-2"
                  variant="outline"
                  onClick={async () => {
                    try {
                      await regenerateDownloadPermissions();
                    } catch {
                      // handled in hook
                    }
                  }}
                  disabled={regeneratingDownloadPermissions}
                >
                  {regeneratingDownloadPermissions ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCcw className="h-4 w-4" />
                  )}
                  Regenerate Downloads
                </CustomButton>
              </div>
            </CustomCardContent>
          </CustomCard>

          <CustomCard>
            <CustomCardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <CustomCardTitle>Order Overview</CustomCardTitle>

                <p className="text-xs text-muted-foreground">
                  Created {formatDateTime(order.createdAt || order.created_at)}
                  {order.updatedAt && (
                    <> · Updated {formatDateTime(order.updatedAt)}</>
                  )}
                </p>
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
                <button
                  type="button"
                  onClick={() =>
                    customer?.id
                      ? router.push(
                          `/dashboard/super-admin/users/${customer.id}/edit`
                        )
                      : undefined
                  }
                  className="text-left"
                  disabled={!customer?.id}
                >
                  <div className="flex items-start gap-3 p-4 border border-border rounded-lg transition hover:border-primary disabled:opacity-70 disabled:hover:border-border">
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
                </button>
                <div className="flex items-start gap-3 p-4 border border-border rounded-lg">
                  <MessageSquare className="h-5 w-5 text-muted-foreground mt-1" />
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Customer Notes
                      </p>
                      <CustomBadge variant="outline" className="text-xs">
                        {customerNotes.length}{" "}
                        {customerNotes.length === 1 ? "note" : "notes"}
                      </CustomBadge>
                    </div>
                    {customerNotes.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No customer notes for this order.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {customerNotes.map((note) => (
                          <div key={note.id} className="rounded-md text-sm">
                            <p className="mt-2 text-foreground whitespace-pre-line">
                              {note.content}
                            </p>
                            <p className="mt-2 text-xs text-muted-foreground">
                              Submitted: {formatDateTime(note.createdAt)}
                              {note.updatedAt &&
                                note.updatedAt !== note.createdAt &&
                                ` · Updated: ${formatDateTime(note.updatedAt)}`}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 border border-border rounded-lg">
                  <CreditCard className="h-5 w-5 text-muted-foreground mt-1" />
                  <div className="flex flex-col gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Payment Method
                      </p>
                      <p className="font-medium text-foreground">
                        {paymentMethodSummary}
                      </p>
                    </div>
                    <div>
                      <CustomButton
                        size="sm"
                        variant="outline"
                        className="px-3 py-1 text-xs"
                        onClick={() => setPaymentDetailsModalOpen(true)}
                      >
                        View Payment Details
                      </CustomButton>
                    </div>
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
                <>
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs uppercase text-muted-foreground border-b border-border">
                          <th className="pb-3">Product</th>
                          <th className="pb-3">SKU</th>
                          {/* <th className="pb-3">Variation ID</th> */}
                          <th className="pb-3">Tabs Frequency</th>
                          <th className="pb-3">Subscription Type</th>
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
                          const attributeEntries = buildAttributeEntries(
                            item.attributeMap,
                            item.attributes,
                            variant.attributeMap,
                            variant.attributes,
                            product.attributes
                          );

                          const tabsFrequencyValue = getAttributeValue(
                            attributeEntries,
                            [
                              "Tabs frequency",
                              "Tabs Frequency",
                              "tabs frequency",
                              "tabs_frequency",
                            ]
                          );

                          const subscriptionTypeValue = getAttributeValue(
                            attributeEntries,
                            [
                              "Subscription Type",
                              "subscription type",
                              "subscription_type",
                            ]
                          );

                          const tabsFrequencyDisplay =
                            formatAttributeValue(tabsFrequencyValue);
                          const subscriptionTypeDisplay = formatAttributeValue(
                            subscriptionTypeValue
                          );

                          const attributeEntriesForDisplay =
                            attributeEntries.filter(([attributeName]) => {
                              const lowerKey = attributeName.toLowerCase();
                              return (
                                lowerKey !== "tabs frequency" &&
                                lowerKey !== "subscription type" &&
                                lowerKey !== "subscription_type"
                              );
                            });

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
                                    {attributeEntriesForDisplay.length > 0 && (
                                      <div className="mt-2 space-y-1">
                                        {attributeEntriesForDisplay.map(
                                          ([attributeName, attributeValue]) => (
                                            <p
                                              key={`${attributeName}-${attributeValue}`}
                                              className="text-xs text-muted-foreground"
                                            >
                                              <span className="font-medium text-foreground">
                                                {attributeName}:
                                              </span>{" "}
                                              {formatAttributeValue(
                                                attributeValue
                                              )}
                                            </p>
                                          )
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 text-muted-foreground">
                                {sku}
                              </td>
                              <td className="py-3 text-muted-foreground">
                                {tabsFrequencyDisplay}
                              </td>
                              <td className="py-3 text-muted-foreground">
                                {subscriptionTypeDisplay}
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

                  <div className="sm:hidden space-y-4">
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
                      const attributeEntries = buildAttributeEntries(
                        item.attributeMap,
                        item.attributes,
                        variant.attributeMap,
                        variant.attributes,
                        product.attributes
                      );
                      const tabsFrequencyValue = getAttributeValue(
                        attributeEntries,
                        [
                          "Tabs frequency",
                          "Tabs Frequency",
                          "tabs frequency",
                          "tabs_frequency",
                        ]
                      );
                      const subscriptionTypeValue = getAttributeValue(
                        attributeEntries,
                        [
                          "Subscription Type",
                          "subscription type",
                          "subscription_type",
                        ]
                      );
                      const tabsFrequencyDisplay =
                        formatAttributeValue(tabsFrequencyValue);
                      const subscriptionTypeDisplay = formatAttributeValue(
                        subscriptionTypeValue
                      );

                      return (
                        <div
                          key={item.id || item.sku || index}
                          className="rounded-lg border border-border p-4 space-y-3 text-sm"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-16 h-16 bg-secondary rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
                              {imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={imageUrl}
                                  alt={name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="h-6 w-6 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-foreground">
                                {name}
                              </p>
                              {variantName && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {variantName}
                                </p>
                              )}
                              {productType && (
                                <p className="text-xs text-muted-foreground mt-1 capitalize">
                                  {productType}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs uppercase text-muted-foreground">
                                SKU
                              </p>
                              <p className="mt-1 text-foreground">{sku}</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase text-muted-foreground">
                                Quantity
                              </p>
                              <p className="mt-1 text-foreground">
                                {item.quantity || 1}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs uppercase text-muted-foreground">
                                Tabs Frequency
                              </p>
                              <p className="mt-1 text-foreground">
                                {tabsFrequencyDisplay}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs uppercase text-muted-foreground">
                                Subscription Type
                              </p>
                              <p className="mt-1 text-foreground">
                                {subscriptionTypeDisplay}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs uppercase text-muted-foreground">
                                Unit Price
                              </p>
                              <p className="mt-1 text-foreground">
                                {formatCurrency(
                                  item.unitPrice ||
                                    item.price ||
                                    item.unit_price ||
                                    0,
                                  totals.currency
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs uppercase text-muted-foreground">
                                Total
                              </p>
                              <p className="mt-1 font-medium text-foreground">
                                {formatCurrency(
                                  item.totalPrice ||
                                    item.total ||
                                    (item.unitPrice || item.price || 0) *
                                      (item.quantity || 1),
                                  totals.currency
                                )}
                              </p>
                            </div>
                          </div>

                          {attributeEntries.length > 0 && (
                            <div className="border-t border-border pt-3 space-y-2">
                              <p className="text-xs uppercase text-muted-foreground">
                                Attributes
                              </p>
                              {attributeEntries.map(
                                ([attributeName, attributeValue]) => (
                                  <p
                                    key={`${attributeName}-${attributeValue}`}
                                    className="text-xs text-muted-foreground"
                                  >
                                    <span className="font-medium text-foreground">
                                      {attributeName}:
                                    </span>{" "}
                                    {formatAttributeValue(attributeValue)}
                                  </p>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </CustomCardContent>
          </CustomCard>

          <CustomCard>
            <CustomCardHeader>
              <CustomCardTitle className="flex items-center gap-2">
                <Paperclip className="h-5 w-5 text-muted-foreground" />
                Pharmacy Hardcopy
              </CustomCardTitle>
              <CustomCardDescription>
                Shipping labels or printed documents from the pharmacy
              </CustomCardDescription>
            </CustomCardHeader>
            <CustomCardContent className="space-y-3">
              {pharmacyHardcopy.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No pharmacy hardcopy attachments found for this order.
                </p>
              ) : (
                pharmacyHardcopy.map((attachment) => {
                  const upload = attachment.upload || {};
                  const sizeLabel = formatFileSize(upload.size);
                  return (
                    <div
                      key={attachment.id || upload.id}
                      className="border border-border rounded-lg px-3 py-2 text-sm"
                    >
                      <div className="flex flex-wrap justify-between gap-2">
                        <div className="flex flex-col">
                          {upload.url ? (
                            <a
                              href={upload.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm"
                            >
                              {upload.originalName ||
                                upload.filename ||
                                attachment.type ||
                                "Attachment"}
                            </a>
                          ) : (
                            <span className="font-medium text-foreground">
                              {upload.originalName ||
                                upload.filename ||
                                attachment.type ||
                                "Attachment"}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {(attachment.type || "PHARMACY_HARDCOPY").replace(
                              /_/g,
                              " "
                            )}
                          </span>
                        </div>
                        {sizeLabel && (
                          <span className="text-xs text-muted-foreground">
                            {sizeLabel}
                          </span>
                        )}
                      </div>
                      {attachment.notes && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {attachment.notes}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-2">
                        {upload.url && (
                          <a
                            href={upload.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            View file
                          </a>
                        )}
                        {attachment.createdAt && (
                          <>
                            <span aria-hidden="true">•</span>
                            <span>
                              Uploaded {formatDateTime(attachment.createdAt)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </CustomCardContent>
          </CustomCard>

          <CustomCard>
            <CustomCardHeader>
              <CustomCardTitle className="flex items-center gap-2">
                <Paperclip className="h-5 w-5 text-muted-foreground" />
                Scanned Documents
              </CustomCardTitle>
              <CustomCardDescription>
                Uploaded prescriptions or signed forms
              </CustomCardDescription>
            </CustomCardHeader>
            <CustomCardContent className="space-y-3">
              {scannedDocuments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No scanned documents attached to this order.
                </p>
              ) : (
                scannedDocuments.map((attachment) => {
                  const upload = attachment.upload || {};
                  const sizeLabel = formatFileSize(upload.size);
                  return (
                    <div
                      key={attachment.id || upload.id}
                      className="border border-border rounded-lg px-3 py-2 text-sm"
                    >
                      <div className="flex flex-wrap justify-between gap-2">
                        <div className="flex flex-col">
                          {upload.url ? (
                            <a
                              href={upload.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm"
                            >
                              {upload.originalName ||
                                upload.filename ||
                                attachment.type ||
                                "Attachment"}
                            </a>
                          ) : (
                            <span className="font-medium text-foreground">
                              {upload.originalName ||
                                upload.filename ||
                                attachment.type ||
                                "Attachment"}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {(attachment.type || "SCANNED_DOCUMENT").replace(
                              /_/g,
                              " "
                            )}
                          </span>
                        </div>
                        {sizeLabel && (
                          <span className="text-xs text-muted-foreground">
                            {sizeLabel}
                          </span>
                        )}
                      </div>
                      {attachment.notes && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {attachment.notes}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-2">
                        {upload.url && (
                          <a
                            href={upload.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            View file
                          </a>
                        )}
                        {attachment.createdAt && (
                          <>
                            <span aria-hidden="true">•</span>
                            <span>
                              Uploaded {formatDateTime(attachment.createdAt)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </CustomCardContent>
          </CustomCard>
          <CustomCard>
            <CustomCardHeader>
              <CustomCardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                Shipping &amp; Billing
              </CustomCardTitle>
              <CustomCardDescription>
                Addresses associated with this order
              </CustomCardDescription>
            </CustomCardHeader>
            <CustomCardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-start">
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Shipping Address
                  </p>
                  <div className="rounded-lg border border-border p-3 text-sm text-foreground">
                    {renderAddress(order.shippingAddress)}
                  </div>
                  {order.trackingNumber && (
                    <p className="text-xs text-muted-foreground">
                      Tracking number:{" "}
                      <span className="font-mono">{order.trackingNumber}</span>
                    </p>
                  )}
                </div>

                <div
                  className="hidden md:block self-stretch w-px bg-border/80"
                  aria-hidden="true"
                />
                <div
                  className="md:hidden border-t border-dashed border-border"
                  aria-hidden="true"
                />

                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Billing Address
                  </p>
                  <div className="rounded-lg border border-border p-3 text-sm text-foreground">
                    {renderAddress(order.billingAddress)}
                  </div>
                </div>
              </div>
            </CustomCardContent>
          </CustomCard>

          {/* {order.notes && (
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
          )} */}
        </div>

        <div className="space-y-6">
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
              <CustomCardTitle>Applied Coupons</CustomCardTitle>
              <CustomCardDescription>
                Discounts applied to this order
              </CustomCardDescription>
            </CustomCardHeader>
            <CustomCardContent className="space-y-2">
              {Array.isArray(order.appliedCoupons) &&
              order.appliedCoupons.length > 0 ? (
                order.appliedCoupons.map((coupon, index) => {
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
                      {amount !== null ? (
                        <span className="text-muted-foreground">
                          -{formatCurrency(amount, totals.currency)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">
                  No coupons applied to this order.
                </p>
              )}
            </CustomCardContent>
          </CustomCard>

          <CustomCard>
            <CustomCardHeader>
              <CustomCardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                Order Notes
              </CustomCardTitle>
              <CustomCardDescription>
                Internal communication and system updates
              </CustomCardDescription>
            </CustomCardHeader>
            <CustomCardContent className="space-y-4">
              {internalOrderNotes.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No internal order notes yet.
                </p>
              ) : (
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {internalOrderNotes.map((note) => {
                    const metadata = note.metadata || {};
                    const rawAuthorType = (note.authorType || "").toString();
                    const authorTypeLabel = rawAuthorType
                      ? rawAuthorType.replace(/_/g, " ")
                      : "UNKNOWN";
                    const isSystemNote =
                      note.isSystem === true ||
                      rawAuthorType.toUpperCase() === "SYSTEM" ||
                      metadata.system === true ||
                      metadata.systemNote === true ||
                      metadata.noteType === "SYSTEM" ||
                      metadata.type === "SYSTEM";

                    const authorLabel = (() => {
                      if (isSystemNote) return "System";
                      if (note.author?.firstName || note.author?.lastName) {
                        return [note.author?.firstName, note.author?.lastName]
                          .filter(Boolean)
                          .join(" ");
                      }
                      if (note.author?.email) return note.author.email;
                      return authorTypeLabel;
                    })();

                    const authorInitial = authorLabel
                      ? authorLabel.charAt(0).toUpperCase()
                      : "A";
                    const bubbleClass = isSystemNote
                      ? "bg-muted border border-border"
                      : "bg-primary/10 border border-primary/20";

                    return (
                      <div key={note.id} className="flex items-start gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/15 text-primary flex items-center justify-center font-semibold text-sm">
                          {authorInitial}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">
                                {authorLabel}
                              </span>
                              {!isSystemNote && note.author?.email && (
                                <span className="text-xs text-muted-foreground">
                                  {note.author.email}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <CustomBadge variant="outline">
                                {isSystemNote ? "SYSTEM" : authorTypeLabel}
                              </CustomBadge>
                              {note.isInternal && (
                                <CustomBadge
                                  variant="outline"
                                  className="bg-slate-100 text-slate-700 dark:bg-slate-400/20 dark:text-slate-200"
                                >
                                  Internal
                                </CustomBadge>
                              )}
                            </div>
                          </div>
                          <div
                            className={`rounded-2xl px-4 py-3 text-sm text-foreground ${bubbleClass}`}
                          >
                            <p className="whitespace-pre-line">
                              {note.content}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Created: {formatDateTime(note.createdAt)}
                            {note.updatedAt &&
                              note.updatedAt !== note.createdAt &&
                              ` · Updated: ${formatDateTime(note.updatedAt)}`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={notesEndRef} />
                </div>
              )}
              <form onSubmit={handleInternalNoteSubmit} className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Add Internal Note
                  </label>
                  <textarea
                    value={internalNoteContent}
                    onChange={(event) =>
                      setInternalNoteContent(event.target.value)
                    }
                    placeholder="Share internal updates or context for this order"
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[120px] dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-primary"
                    disabled={addingInternalNote}
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <CustomButton
                    type="submit"
                    disabled={
                      addingInternalNote || internalNoteContent.trim() === ""
                    }
                    className="flex items-center gap-2"
                  >
                    {addingInternalNote && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Add Note
                  </CustomButton>
                </div>
              </form>
            </CustomCardContent>
          </CustomCard>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Assigned Doctor
            </label>
            <div className="flex items-center gap-2">
              <select
                value={doctorSelectValue}
                onChange={handleDoctorSelectChange}
                onFocus={handleDoctorSelectFocus}
                disabled={assigningDoctor}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-primary"
              >
                <option value="">Unassigned</option>
                {resolvedDoctorOptions.map((doctor) => (
                  <option key={doctor.value} value={doctor.value}>
                    {doctor.label}
                  </option>
                ))}
              </select>
              {(assigningDoctor || loadingDoctorOptions) && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Select a doctor to associate with this order.
            </p>
            {resolvedDoctorOptions.length === 0 && !loadingDoctorOptions && (
              <p className="text-xs text-muted-foreground">
                Focus the dropdown to load available doctors.
              </p>
            )}
          </div>
          <CustomCard>
            <CustomCardHeader>
              <CustomCardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-muted-foreground" />
                Assigned Doctor
              </CustomCardTitle>
            </CustomCardHeader>
            <CustomCardContent>
              {order.doctor ? (
                <div className="flex flex-col gap-2 text-sm">
                  <p className="font-medium text-foreground">
                    {[order.doctor.firstName, order.doctor.lastName]
                      .filter(Boolean)
                      .join(" ") || order.doctor.email}
                  </p>
                  {order.doctor.email && (
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {order.doctor.email}
                    </p>
                  )}
                  {order.doctor.id && (
                    <p className="text-xs text-muted-foreground">
                      ID: <span className="font-mono">{order.doctor.id}</span>
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No doctor assigned to this order.
                </p>
              )}
            </CustomCardContent>
          </CustomCard>

          <CustomCard>
            <CustomCardHeader>
              <CustomCardTitle>Related Orders</CustomCardTitle>
              <CustomCardDescription>
                Other orders associated with this customer
              </CustomCardDescription>
            </CustomCardHeader>
            <CustomCardContent className="space-y-4">
              {relatedOrdersForDisplay.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No related orders found.
                </p>
              ) : (
                <>
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs uppercase text-muted-foreground border-b border-border">
                          <th className="py-3 pr-3 font-medium tracking-wide">
                            Order
                          </th>
                          <th className="py-3 pr-3 font-medium tracking-wide">
                            Status
                          </th>
                          <th className="py-3 pr-3 font-medium tracking-wide">
                            Total
                          </th>
                          <th className="py-3 pr-3 font-medium tracking-wide">
                            Placed
                          </th>
                          <th className="py-3 font-medium tracking-wide text-right">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {relatedOrdersForDisplay.map((related) => (
                          <tr key={`${related.id || related.number}-table`}>
                            <td className="py-3 pr-3 font-medium text-foreground">
                              {related.id ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    router.push(
                                      `/dashboard/orders/${related.id}`
                                    )
                                  }
                                  className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm"
                                >
                                  #{related.number}
                                </button>
                              ) : (
                                <span>#{related.number}</span>
                              )}
                            </td>
                            <td className="py-3 pr-3">
                              <CustomBadge
                                variant="outline"
                                className={related.statusClassName}
                              >
                                {related.statusLabel}
                              </CustomBadge>
                            </td>
                            <td className="py-3 pr-3 text-muted-foreground">
                              {related.totalLabel || "-"}
                            </td>
                            <td className="py-3 pr-3 text-muted-foreground">
                              {related.placedLabel || "-"}
                            </td>
                            <td className="py-3 text-right">
                              {related.id ? (
                                <CustomButton
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    router.push(
                                      `/dashboard/orders/${related.id}`
                                    )
                                  }
                                >
                                  View
                                </CustomButton>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  Unavailable
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="sm:hidden space-y-3">
                    {relatedOrdersForDisplay.map((related) => (
                      <div
                        key={`${related.id || related.number}-card`}
                        className="border border-border rounded-lg p-3 text-sm space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-medium text-foreground">
                              #{related.number}
                            </p>
                            {related.placedLabel && (
                              <p className="text-xs text-muted-foreground">
                                Placed {related.placedLabel}
                              </p>
                            )}
                          </div>
                          <CustomBadge
                            variant="outline"
                            className={related.statusClassName}
                          >
                            {related.statusLabel}
                          </CustomBadge>
                        </div>
                        {related.totalLabel && (
                          <p className="text-xs text-muted-foreground">
                            Total{" "}
                            <span className="font-medium text-foreground">
                              {related.totalLabel}
                            </span>
                          </p>
                        )}
                        {related.id && (
                          <CustomButton
                            variant="outline"
                            size="sm"
                            className="w-full justify-center"
                            onClick={() =>
                              router.push(`/dashboard/orders/${related.id}`)
                            }
                          >
                            View Order
                          </CustomButton>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CustomCardContent>
          </CustomCard>
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

      {/* Payment Details Modal */}
      <CustomModal
        isOpen={paymentDetailsModalOpen}
        onClose={() => setPaymentDetailsModalOpen(false)}
        title="Payment Details"
        size="lg"
      >
        {!paymentDetails ? (
          <p className="text-sm text-muted-foreground">
            No payment details available for this order.
          </p>
        ) : (
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Summary
              </p>
              <p className="mt-1 font-medium text-foreground">
                {paymentDetails.summary}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {paymentDetails.brand && (
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Brand:</span>{" "}
                  {paymentDetails.brand}
                </p>
              )}
              {paymentDetails.type && (
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Type:</span>{" "}
                  {paymentDetails.type.replace(/_/g, " ")}
                </p>
              )}
              {paymentDetails.last4 && (
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Last 4:</span>{" "}
                  {paymentDetails.last4}
                </p>
              )}
              {(paymentDetails.expiryMonth || paymentDetails.expiryYear) && (
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Expires:</span>{" "}
                  {[
                    paymentDetails.expiryMonth?.toString().padStart(2, "0"),
                    paymentDetails.expiryYear,
                  ]
                    .filter(Boolean)
                    .join("/")}
                </p>
              )}
              {paymentDetails.methodId && (
                <p className="text-muted-foreground break-all">
                  <span className="font-medium text-foreground">
                    Method ID:
                  </span>{" "}
                  {paymentDetails.methodId}
                </p>
              )}
              {order.stripePaymentIntentStatus && (
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">
                    Stripe Status:
                  </span>{" "}
                  {order.stripePaymentIntentStatus.replace(/_/g, " ")}
                </p>
              )}
              {order.stripePaymentIntentId && (
                <p className="text-muted-foreground break-all">
                  <span className="font-medium text-foreground">
                    Stripe Intent:
                  </span>{" "}
                  {order.stripePaymentIntentId}
                </p>
              )}
              {paymentDetails.stripe?.stripeMeta?.paymentIntentId &&
                paymentDetails.stripe.stripeMeta.paymentIntentId !==
                  order.stripePaymentIntentId && (
                  <p className="text-muted-foreground break-all">
                    <span className="font-medium text-foreground">
                      Stripe Intent:
                    </span>{" "}
                    {paymentDetails.stripe.stripeMeta.paymentIntentId}
                  </p>
                )}
            </div>

            {(paymentDetails.stripe?.stripeCapturedAmount ||
              paymentDetails.stripe?.stripeAuthorizedAmount) && (
              <div className="space-y-1 text-muted-foreground">
                {paymentDetails.stripe?.stripeCapturedAmount && (
                  <p>
                    <span className="font-medium text-foreground">
                      Captured:
                    </span>{" "}
                    {formatCurrency(
                      paymentDetails.stripe.stripeCapturedAmount,
                      order.currency
                    )}
                  </p>
                )}
                {paymentDetails.stripe?.stripeAuthorizedAmount && (
                  <p>
                    <span className="font-medium text-foreground">
                      Authorized:
                    </span>{" "}
                    {formatCurrency(
                      paymentDetails.stripe.stripeAuthorizedAmount,
                      order.currency
                    )}
                  </p>
                )}
              </div>
            )}

            {paymentDetails.billingDetails && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Billing Details
                </p>
                {paymentDetails.billingDetails.name && (
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Name:</span>{" "}
                    {paymentDetails.billingDetails.name}
                  </p>
                )}
                {paymentDetails.billingDetails.email && (
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Email:</span>{" "}
                    {paymentDetails.billingDetails.email}
                  </p>
                )}
                {(paymentDetails.billingDetails.city ||
                  paymentDetails.billingDetails.state ||
                  paymentDetails.billingDetails.country) && (
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">
                      Location:
                    </span>{" "}
                    {[
                      paymentDetails.billingDetails.city,
                      paymentDetails.billingDetails.state,
                      paymentDetails.billingDetails.country,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
              </div>
            )}

            {paymentDetails.stripe?.paymentIntent && (
              <div className="space-y-2">
                <Divider className="border-dashed" />
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Stripe Payment Intent Payload
                </p>
                <pre className="bg-muted rounded-lg p-3 text-xs overflow-x-auto max-h-[320px] text-foreground">
                  {JSON.stringify(paymentDetails.stripe.paymentIntent, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </CustomModal>
    </PageContainer>
  );
}
