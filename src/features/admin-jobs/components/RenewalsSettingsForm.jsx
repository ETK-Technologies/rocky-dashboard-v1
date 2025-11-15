"use client";

import { useState, useEffect } from "react";
import { Save, RefreshCw, Loader2, Calendar } from "lucide-react";
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
import { useRenewalsSettings } from "../hooks/useRenewalsSettings";
import { cn } from "@/utils/cn";

/**
 * RenewalsSettingsForm component for configuring renewals job settings
 */
export function RenewalsSettingsForm() {
  const {
    settings,
    loading,
    error,
    saving,
    reloading,
    fetchSettings,
    updateSettings,
    reloadCron,
  } = useRenewalsSettings();

  const [formData, setFormData] = useState({
    cron: "0 * * * *",
    concurrency: 5,
  });

  const [errors, setErrors] = useState({});

  // Initialize form data when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormData({
        cron: settings.cron || "0 * * * *",
        concurrency: settings.concurrency || 5,
      });
    }
  }, [settings]);

  // Validate form
  const validate = () => {
    const newErrors = {};

    // Validate cron expression (5-7 segments)
    if (!formData.cron || !formData.cron.trim()) {
      newErrors.cron = "Cron expression is required";
    } else {
      const cronRegex =
        /^\s*([*\/\d,-]+\s+){4}[*\/\d,-]+(\s+[*\/\d,-]+)?(\s+[*\/\d,-]+)?\s*$/;
      if (!cronRegex.test(formData.cron)) {
        newErrors.cron = "Invalid cron expression format";
      }
    }

    // Validate concurrency
    if (
      !formData.concurrency ||
      formData.concurrency < 1 ||
      formData.concurrency > 50
    ) {
      newErrors.concurrency =
        "Concurrency must be between 1 and 50";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle form submission
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

  // Handle reload cron
  const handleReloadCron = async () => {
    try {
      await reloadCron();
    } catch (err) {
      // Error already handled in hook
    }
  };

  if (loading) {
    return (
      <LoadingState
        message="Loading renewals settings..."
        loading={loading}
        fullScreen={false}
      />
    );
  }

  if (error && !settings) {
    return (
      <ErrorState
        title="Failed to load renewals settings"
        message={error}
        action={
          <CustomButton onClick={fetchSettings} disabled={loading}>
            Retry
          </CustomButton>
        }
      />
    );
  }

  // Cron examples
  const cronExamples = [
    { value: "0 * * * *", label: "Every hour" },
    { value: "0 */6 * * *", label: "Every 6 hours" },
    { value: "0 */12 * * *", label: "Every 12 hours" },
    { value: "0 0 * * *", label: "Daily at midnight" },
    { value: "0 0 * * 0", label: "Weekly on Sunday at midnight" },
    { value: "*/15 * * * *", label: "Every 15 minutes" },
  ];

  return (
    <form onSubmit={handleSubmit}>
      <CustomCard>
        <CustomCardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CustomCardTitle>Renewals Job Settings</CustomCardTitle>
              <CustomCardDescription>
                Configure the schedule and concurrency for subscription renewals
                processing
              </CustomCardDescription>
            </div>
            <CustomButton
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchSettings}
              disabled={loading || saving || reloading}
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
          {/* Cron Schedule */}
          <div className="space-y-2">
            <CustomLabel htmlFor="cron">
              Cron Schedule <span className="text-red-600">*</span>
            </CustomLabel>
            <CustomInput
              id="cron"
              type="text"
              value={formData.cron}
              onChange={(e) => handleChange("cron", e.target.value)}
              disabled={saving}
              error={errors.cron}
              placeholder="0 * * * *"
              className="font-mono"
            />
            {errors.cron && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.cron}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Cron expression format: minute hour day month weekday
            </p>

            {/* Cron Examples */}
            <div className="mt-3">
              <p className="text-sm font-medium mb-2">Common Examples:</p>
              <div className="grid grid-cols-2 gap-2">
                {cronExamples.map((example) => (
                  <button
                    key={example.value}
                    type="button"
                    onClick={() => handleChange("cron", example.value)}
                    disabled={saving}
                    className={cn(
                      "text-left p-2 rounded-md border text-xs transition-colors",
                      "hover:bg-muted cursor-pointer",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                      formData.cron === example.value &&
                        "bg-primary/10 border-primary"
                    )}
                  >
                    <code className="font-mono font-semibold">
                      {example.value}
                    </code>
                    <p className="text-muted-foreground mt-1">
                      {example.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Concurrency */}
          <div className="space-y-2">
            <CustomLabel htmlFor="concurrency">
              Concurrency <span className="text-red-600">*</span>
            </CustomLabel>
            <CustomInput
              id="concurrency"
              type="number"
              min={settings?.minConcurrency || 1}
              max={settings?.maxConcurrency || 50}
              value={formData.concurrency}
              onChange={(e) =>
                handleChange("concurrency", parseInt(e.target.value) || 1)
              }
              disabled={saving}
              error={errors.concurrency}
              className="max-w-xs"
            />
            {errors.concurrency && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.concurrency}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Number of concurrent renewal jobs processed (min:{" "}
              {settings?.minConcurrency || 1}, max:{" "}
              {settings?.maxConcurrency || 50})
            </p>
          </div>

          {/* Reload Cron Button */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h4 className="text-sm font-semibold mb-1">
                  Reload Cron Schedule
                </h4>
                <p className="text-xs text-muted-foreground">
                  Manually reload the cron schedule from settings without
                  updating. Useful if you've changed settings elsewhere.
                </p>
              </div>
              <CustomButton
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReloadCron}
                disabled={reloading || saving}
                className="flex items-center gap-2"
              >
                {reloading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Reloading...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4" />
                    Reload Cron
                  </>
                )}
              </CustomButton>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>
          )}
        </CustomCardContent>

        {/* Footer with Save button */}
        <CustomCardFooter>
          <div className="flex justify-end gap-3 w-full">
            <CustomButton
              type="submit"
              disabled={saving || loading || reloading}
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

