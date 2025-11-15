"use client";

import { useState, useEffect } from "react";
import { Save, RefreshCw, Loader2, Plus, X } from "lucide-react";
import {
  CustomButton,
  CustomCard,
  CustomCardContent,
  CustomCardDescription,
  CustomCardFooter,
  CustomCardHeader,
  CustomCardTitle,
  CustomInput,
  CustomLabel,
  ErrorState,
  LoadingState,
} from "@/components/ui";
import { useSubscriptionSettings } from "../hooks/useSubscriptionSettings";
import { cn } from "@/utils/cn";

export function SubscriptionSettingsForm() {
  const { settings, loading, error, saving, fetchSettings, updateSettings } =
    useSubscriptionSettings();

  const [formData, setFormData] = useState({
    enabled: true,
    gracePeriodDays: 7,
    autoRenewEnabled: true,
    notificationDaysBeforeRenewal: [],
  });

  const [errors, setErrors] = useState({});
  const [newNotificationDay, setNewNotificationDay] = useState("");

  useEffect(() => {
    if (settings) {
      setFormData({
        enabled: settings.enabled ?? true,
        gracePeriodDays: settings.gracePeriodDays || 7,
        autoRenewEnabled: settings.autoRenewEnabled ?? true,
        notificationDaysBeforeRenewal:
          settings.notificationDaysBeforeRenewal || [],
      });
    }
  }, [settings]);

  const validate = () => {
    const newErrors = {};

    if (
      formData.gracePeriodDays < 0 ||
      formData.gracePeriodDays > 90 ||
      isNaN(formData.gracePeriodDays)
    ) {
      newErrors.gracePeriodDays =
        "Grace period days must be between 0 and 90";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAddNotificationDay = (e) => {
    e.preventDefault();
    const day = parseInt(newNotificationDay);

    if (
      !isNaN(day) &&
      day >= 1 &&
      day <= 30 &&
      !formData.notificationDaysBeforeRenewal.includes(day)
    ) {
      handleChange("notificationDaysBeforeRenewal", [
        ...formData.notificationDaysBeforeRenewal,
        day,
      ].sort((a, b) => a - b));
      setNewNotificationDay("");
    }
  };

  const handleRemoveNotificationDay = (day) => {
    handleChange(
      "notificationDaysBeforeRenewal",
      formData.notificationDaysBeforeRenewal.filter((d) => d !== day)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      await updateSettings(formData);
    } catch (err) {
      // Error already handled in hook
    }
  };

  if (loading) {
    return (
      <LoadingState
        message="Loading subscription settings..."
        loading={loading}
        fullScreen={false}
      />
    );
  }

  if (error && !settings) {
    return (
      <ErrorState
        title="Failed to load subscription settings"
        message={error}
        action={
          <CustomButton onClick={fetchSettings} disabled={loading}>
            Retry
          </CustomButton>
        }
      />
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <CustomCard>
        <CustomCardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CustomCardTitle>Subscription Settings</CustomCardTitle>
              <CustomCardDescription>
                Configure subscription settings, grace period, and renewals
              </CustomCardDescription>
            </div>
            <CustomButton
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchSettings}
              disabled={loading || saving}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={cn("h-4 w-4", loading && "animate-spin")}
              />
              Refresh
            </CustomButton>
          </div>
        </CustomCardHeader>
        <CustomCardContent className="space-y-6">
          {/* Subscription Enabled */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="enabled"
                checked={formData.enabled}
                onChange={(e) => handleChange("enabled", e.target.checked)}
                disabled={saving}
                className={cn(
                  "mt-1 w-5 h-5 text-primary bg-background border-input rounded",
                  "focus:ring-primary focus:ring-2 cursor-pointer",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
              />
              <div className="flex-1">
                <CustomLabel htmlFor="enabled" className="cursor-pointer font-medium">
                  Enable Subscriptions
                </CustomLabel>
                <p className="text-xs text-muted-foreground mt-1">
                  Enable subscription functionality for products
                </p>
              </div>
            </div>
          </div>

          {formData.enabled && (
            <>
              {/* Grace Period */}
              <div className="space-y-4 border-t border-border pt-6">
                <h3 className="text-lg font-semibold">Grace Period</h3>

                <div className="space-y-2">
                  <CustomLabel htmlFor="gracePeriodDays">
                    Grace Period Days
                  </CustomLabel>
                  <CustomInput
                    id="gracePeriodDays"
                    type="number"
                    min="0"
                    max="90"
                    value={formData.gracePeriodDays}
                    onChange={(e) =>
                      handleChange(
                        "gracePeriodDays",
                        parseInt(e.target.value) || 0
                      )
                    }
                    disabled={saving}
                    error={errors.gracePeriodDays}
                    className="max-w-xs"
                  />
                  {errors.gracePeriodDays && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errors.gracePeriodDays}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Number of days before subscription cancellation (0-90)
                  </p>
                </div>
              </div>

              {/* Auto Renew */}
              <div className="space-y-4 border-t border-border pt-6">
                <h3 className="text-lg font-semibold">Auto Renewal</h3>

                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="autoRenewEnabled"
                      checked={formData.autoRenewEnabled}
                      onChange={(e) =>
                        handleChange("autoRenewEnabled", e.target.checked)
                      }
                      disabled={saving}
                      className={cn(
                        "mt-1 w-5 h-5 text-primary bg-background border-input rounded",
                        "focus:ring-primary focus:ring-2 cursor-pointer",
                        "disabled:cursor-not-allowed disabled:opacity-50"
                      )}
                    />
                    <div className="flex-1">
                      <CustomLabel
                        htmlFor="autoRenewEnabled"
                        className="cursor-pointer font-medium"
                      >
                        Enable Auto Renewal
                      </CustomLabel>
                      <p className="text-xs text-muted-foreground mt-1">
                        Automatically renew subscriptions when they expire
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notification Days */}
              <div className="space-y-4 border-t border-border pt-6">
                <h3 className="text-lg font-semibold">Renewal Notifications</h3>

                <div className="space-y-3">
                  <CustomLabel>
                    Notification Days Before Renewal
                  </CustomLabel>

                  {formData.notificationDaysBeforeRenewal.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.notificationDaysBeforeRenewal.map((day) => (
                        <span
                          key={day}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-md text-sm"
                        >
                          {day} day{day !== 1 ? "s" : ""}
                          <button
                            type="button"
                            onClick={() => handleRemoveNotificationDay(day)}
                            disabled={saving}
                            className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <form
                    onSubmit={handleAddNotificationDay}
                    className="flex gap-2"
                  >
                    <CustomInput
                      type="number"
                      min="1"
                      max="30"
                      placeholder="Days (1-30)"
                      value={newNotificationDay}
                      onChange={(e) => setNewNotificationDay(e.target.value)}
                      disabled={saving}
                      className="max-w-xs"
                    />
                    <CustomButton
                      type="submit"
                      variant="outline"
                      size="sm"
                      disabled={saving || !newNotificationDay}
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </CustomButton>
                  </form>
                  <p className="text-xs text-muted-foreground">
                    Days before renewal to send notification emails (1-30)
                  </p>
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </CustomCardContent>

        <CustomCardFooter>
          <div className="flex justify-end gap-3 w-full">
            <CustomButton
              type="submit"
              disabled={saving || loading}
              className="flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </CustomButton>
          </div>
        </CustomCardFooter>
      </CustomCard>
    </form>
  );
}

