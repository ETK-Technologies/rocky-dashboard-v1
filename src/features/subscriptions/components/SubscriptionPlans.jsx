"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  CustomBadge,
  CustomButton,
  CustomInput,
  CustomModal,
  DataTable,
  ErrorState,
  IconButton,
  LoadingState,
  PageContainer,
  PageHeader,
} from "@/components/ui";
import { useSubscriptionPlans } from "../hooks/useSubscriptionPlans";

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

export default function SubscriptionPlans() {
  const { plans, loading, error, refresh, createPlan, updatePlan, deletePlan } =
    useSubscriptionPlans();
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [deletingPlan, setDeletingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    billingCycle: "MONTHLY",
    price: "",
    trialPeriod: "",
    gracePeriod: "",
    autoRenew: true,
    webhookEndpoints: {
      stripe: "",
      paypal: "",
    },
    notifications: {
      emailTemplate: "",
    },
  });

  const handleOpenModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name || "",
        billingCycle: plan.billingCycle || plan.billing_cycle || "MONTHLY",
        price: plan.price || "",
        trialPeriod: plan.trialPeriod || plan.trial_period || "",
        gracePeriod: plan.gracePeriod || plan.grace_period || "",
        autoRenew: plan.autoRenew !== undefined ? plan.autoRenew : plan.auto_renew !== undefined ? plan.auto_renew : true,
        webhookEndpoints: {
          stripe: plan.webhookEndpoints?.stripe || plan.webhook_endpoints?.stripe || "",
          paypal: plan.webhookEndpoints?.paypal || plan.webhook_endpoints?.paypal || "",
        },
        notifications: {
          emailTemplate: plan.notifications?.emailTemplate || plan.notifications?.email_template || "",
        },
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: "",
        billingCycle: "MONTHLY",
        price: "",
        trialPeriod: "",
        gracePeriod: "",
        autoRenew: true,
        webhookEndpoints: {
          stripe: "",
          paypal: "",
        },
        notifications: {
          emailTemplate: "",
        },
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPlan(null);
    setFormData({
      name: "",
      billingCycle: "MONTHLY",
      price: "",
      trialPeriod: "",
      gracePeriod: "",
      autoRenew: true,
      webhookEndpoints: {
        stripe: "",
        paypal: "",
      },
      notifications: {
        emailTemplate: "",
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        name: formData.name,
        billingCycle: formData.billingCycle,
        price: parseFloat(formData.price) || 0,
        trialPeriod: formData.trialPeriod ? parseInt(formData.trialPeriod) : null,
        gracePeriod: formData.gracePeriod ? parseInt(formData.gracePeriod) : null,
        autoRenew: formData.autoRenew,
        webhookEndpoints: formData.webhookEndpoints,
        notifications: formData.notifications,
      };

      if (editingPlan) {
        await updatePlan(editingPlan.id, data);
      } else {
        await createPlan(data);
      }
      handleCloseModal();
    } catch (err) {
      // Error already handled in hook
    }
  };

  const handleDelete = async () => {
    if (!deletingPlan) return;
    try {
      await deletePlan(deletingPlan.id);
      setDeletingPlan(null);
    } catch (err) {
      // Error already handled in hook
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "name",
        label: "Name",
        width: "200px",
        render: (plan) => (
          <span className="font-medium text-foreground">{plan.name || "-"}</span>
        ),
      },
      {
        key: "billingCycle",
        label: "Billing Cycle",
        width: "150px",
        render: (plan) => {
          const cycle =
            plan.billingCycle || plan.billing_cycle || "MONTHLY";
          return (
            <CustomBadge variant="outline" className="capitalize">
              {cycle.toLowerCase().replace(/_/g, " ")}
            </CustomBadge>
          );
        },
      },
      {
        key: "price",
        label: "Price",
        width: "120px",
        render: (plan) => {
          const price = plan.price || 0;
          const currency = plan.currency || "USD";
          return (
            <span className="text-foreground">
              {formatCurrency(price, currency)}
            </span>
          );
        },
      },
      {
        key: "trialPeriod",
        label: "Trial Period",
        width: "120px",
        render: (plan) => {
          const days =
            plan.trialPeriod || plan.trial_period;
          return (
            <span className="text-foreground">
              {days ? `${days} days` : "-"}
            </span>
          );
        },
      },
      {
        key: "gracePeriod",
        label: "Grace Period",
        width: "120px",
        render: (plan) => {
          const days = plan.gracePeriod || plan.grace_period;
          return (
            <span className="text-foreground">
              {days ? `${days} days` : "-"}
            </span>
          );
        },
      },
      {
        key: "autoRenew",
        label: "Auto-Renew",
        width: "120px",
        render: (plan) => {
          const autoRenew =
            plan.autoRenew !== undefined
              ? plan.autoRenew
              : plan.auto_renew !== undefined
              ? plan.auto_renew
              : false;
          return autoRenew ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          ) : (
            <XCircle className="h-5 w-5 text-muted-foreground" />
          );
        },
      },
    ],
    []
  );

  const renderActions = (plan) => (
    <div
      className="flex items-center gap-1"
      onClick={(event) => event.stopPropagation()}
    >
      <IconButton
        icon={Edit}
        label="Edit plan"
        variant="ghost"
        size="sm"
        onClick={() => handleOpenModal(plan)}
      />
      <IconButton
        icon={Trash2}
        label="Delete plan"
        variant="ghost"
        size="sm"
        onClick={() => setDeletingPlan(plan)}
      />
    </div>
  );

  if (error && !loading) {
    return (
      <PageContainer>
        <PageHeader title="Subscription Plans" />
        <ErrorState
          title="Failed to load subscription plans"
          message={error}
          action={
            <CustomButton onClick={refresh} disabled={loading}>
              Retry
            </CustomButton>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Subscription Plans"
        description="Manage subscription plans and pricing"
        action={
          <CustomButton
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Plan
          </CustomButton>
        }
      />

      <div className="mb-4 flex items-center justify-end">
        <CustomButton
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </CustomButton>
      </div>

      <DataTable
        columns={columns}
        data={plans}
        renderActions={renderActions}
        loading={loading}
        emptyState={{
          icon: Plus,
          title: "No subscription plans",
          description: "Create your first subscription plan to get started.",
          action: (
            <CustomButton onClick={() => handleOpenModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Plan
            </CustomButton>
          ),
        }}
      />

      {/* Create/Edit Modal */}
      <CustomModal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingPlan ? "Edit Subscription Plan" : "Create Subscription Plan"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Name *
            </label>
            <CustomInput
              type="text"
              placeholder="Plan name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Billing Cycle *
            </label>
            <select
              value={formData.billingCycle}
              onChange={(e) =>
                setFormData({ ...formData, billingCycle: e.target.value })
              }
              className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Price *
            </label>
            <CustomInput
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Trial Period (days)
              </label>
              <CustomInput
                type="number"
                min="0"
                placeholder="0"
                value={formData.trialPeriod}
                onChange={(e) =>
                  setFormData({ ...formData, trialPeriod: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Grace Period (days)
              </label>
              <CustomInput
                type="number"
                min="0"
                placeholder="0"
                value={formData.gracePeriod}
                onChange={(e) =>
                  setFormData({ ...formData, gracePeriod: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoRenew}
                onChange={(e) =>
                  setFormData({ ...formData, autoRenew: e.target.checked })
                }
                className="w-4 h-4 text-primary bg-background border-input rounded focus:ring-primary focus:ring-2"
              />
              <span className="text-sm font-medium text-foreground">
                Auto-Renew
              </span>
            </label>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Stripe Webhook Endpoint
            </label>
            <CustomInput
              type="url"
              placeholder="https://..."
              value={formData.webhookEndpoints.stripe}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  webhookEndpoints: {
                    ...formData.webhookEndpoints,
                    stripe: e.target.value,
                  },
                })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              PayPal Webhook Endpoint
            </label>
            <CustomInput
              type="url"
              placeholder="https://..."
              value={formData.webhookEndpoints.paypal}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  webhookEndpoints: {
                    ...formData.webhookEndpoints,
                    paypal: e.target.value,
                  },
                })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Email Template
            </label>
            <CustomInput
              type="text"
              placeholder="Template ID or name"
              value={formData.notifications.emailTemplate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  notifications: {
                    ...formData.notifications,
                    emailTemplate: e.target.value,
                  },
                })
              }
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <CustomButton
              type="button"
              variant="outline"
              onClick={handleCloseModal}
            >
              Cancel
            </CustomButton>
            <CustomButton type="submit">
              {editingPlan ? "Update Plan" : "Create Plan"}
            </CustomButton>
          </div>
        </form>
      </CustomModal>

      {/* Delete Confirmation Modal */}
      <CustomModal
        isOpen={!!deletingPlan}
        onClose={() => setDeletingPlan(null)}
        title="Delete Subscription Plan"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete "{deletingPlan?.name}"? This action
            cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <CustomButton
              variant="outline"
              onClick={() => setDeletingPlan(null)}
            >
              Cancel
            </CustomButton>
            <CustomButton variant="destructive" onClick={handleDelete}>
              Delete
            </CustomButton>
          </div>
        </div>
      </CustomModal>
    </PageContainer>
  );
}

