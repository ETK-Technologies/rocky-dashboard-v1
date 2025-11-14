"use client";

import { useState, useEffect } from "react";
import { useRenewalsJobSettings } from "../hooks/useRenewalsJobSettings";
import {
  CustomButton,
  CustomInput,
  CustomCard,
  CustomCardHeader,
  CustomCardTitle,
  CustomCardDescription,
  CustomCardContent,
  CustomCardFooter,
  LoadingState,
  ErrorState,
} from "@/components/ui";
import { RefreshCw, Save } from "lucide-react";

export function RenewalsJobSettings() {
  const {
    settings,
    loading,
    error,
    saving,
    reloading,
    fetchSettings,
    updateSettings,
    reloadCron,
  } = useRenewalsJobSettings();

  // Local form state for editing
  const [formData, setFormData] = useState({
    cron: "",
    concurrency: 5,
  });

  // Update form data when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormData({
        cron: settings.cron || "",
        concurrency: settings.concurrency || 5,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettings(formData);
      // Form data will be updated via the hook's state
    } catch (err) {
      // Error is already handled by the hook with toast
    }
  };

  const handleReload = async () => {
    try {
      await reloadCron();
    } catch (err) {
      // Error is already handled by the hook with toast
    }
  };

  const hasChanges =
    settings &&
    (formData.cron !== settings.cron ||
      Number(formData.concurrency) !== settings.concurrency);

  const minConcurrency = settings?.minConcurrency || 1;
  const maxConcurrency = settings?.maxConcurrency || 50;

  if (loading) {
    return <LoadingState message="Loading renewals job settings..." loading={loading} fullScreen={true} />;
  }

  if (error && !settings) {
    return (
      <ErrorState message={error} onRetry={fetchSettings} retryLabel="Retry" />
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Settings Display */}
      <CustomCard>
        <CustomCardHeader>
          <CustomCardTitle>Current Settings</CustomCardTitle>
          <CustomCardDescription>
            View the current renewals job configuration
          </CustomCardDescription>
        </CustomCardHeader>
        <CustomCardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">
                Cron Expression
              </div>
              <div className="text-lg font-semibold text-foreground font-mono bg-muted px-3 py-2 rounded-md">
                {settings?.cron || "—"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Current schedule for the renewals job
              </p>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">
                Concurrency
              </div>
              <div className="text-lg font-semibold text-foreground">
                {settings?.concurrency || "—"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Concurrent renewals processed (Range: {minConcurrency} -{" "}
                {maxConcurrency})
              </p>
            </div>
          </div>
        </CustomCardContent>
        <CustomCardFooter>
          <CustomButton
            variant="outline"
            onClick={handleReload}
            disabled={reloading || saving}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${reloading ? "animate-spin" : ""}`}
            />
            {reloading ? "Reloading..." : "Reload Cron"}
          </CustomButton>
        </CustomCardFooter>
      </CustomCard>

      {/* Edit Settings Form */}
      <CustomCard>
        <CustomCardHeader>
          <CustomCardTitle>Edit Settings</CustomCardTitle>
          <CustomCardDescription>
            Update the renewals job cron schedule and concurrency settings.
          </CustomCardDescription>
        </CustomCardHeader>
        <CustomCardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="cron"
                className="block text-sm font-medium mb-2 text-foreground"
              >
                Cron Expression
              </label>
              <CustomInput
                id="cron"
                type="text"
                value={formData.cron}
                onChange={(e) =>
                  setFormData({ ...formData, cron: e.target.value })
                }
                placeholder="0 * * * *"
                className="w-full"
              />
              <p className="mt-1 text-sm text-muted-foreground">
                Cron expression for scheduling the renewals job (e.g., &quot;0 *
                * * *&quot; for every hour)
              </p>
            </div>

            <div>
              <label
                htmlFor="concurrency"
                className="block text-sm font-medium mb-2 text-foreground"
              >
                Concurrency
              </label>
              <CustomInput
                id="concurrency"
                type="number"
                min={minConcurrency}
                max={maxConcurrency}
                value={formData.concurrency}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    concurrency: e.target.value,
                  })
                }
                className="w-full"
              />
              <p className="mt-1 text-sm text-muted-foreground">
                Number of concurrent renewals to process (between{" "}
                {minConcurrency} and {maxConcurrency})
              </p>
            </div>
          </div>
        </CustomCardContent>
        <CustomCardFooter className="flex justify-end gap-2">
          <CustomButton
            variant="outline"
            onClick={() => {
              if (settings) {
                setFormData({
                  cron: settings.cron || "",
                  concurrency: settings.concurrency || 5,
                });
              }
            }}
            disabled={saving || reloading || !hasChanges}
          >
            Reset
          </CustomButton>
          <CustomButton
            variant="primary"
            onClick={handleSave}
            disabled={saving || reloading || !hasChanges}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </CustomButton>
        </CustomCardFooter>
      </CustomCard>

      <CustomCard>
        <CustomCardHeader>
          <CustomCardTitle>About Renewals Job</CustomCardTitle>
        </CustomCardHeader>
        <CustomCardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              The renewals job automatically processes subscription renewals
              based on the configured cron schedule.
            </p>
            <p>
              <strong>Cron Expression Format:</strong> minute hour day month
              weekday
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <code className="bg-muted px-1 py-0.5 rounded">0 * * * *</code>{" "}
                - Every hour at minute 0
              </li>
              <li>
                <code className="bg-muted px-1 py-0.5 rounded">0 0 * * *</code>{" "}
                - Every day at midnight
              </li>
              <li>
                <code className="bg-muted px-1 py-0.5 rounded">0 0 * * 0</code>{" "}
                - Every Sunday at midnight
              </li>
            </ul>
            <p className="pt-2">
              <strong>Concurrency:</strong> Controls how many renewals are
              processed simultaneously. Higher values process renewals faster
              but may increase server load.
            </p>
          </div>
        </CustomCardContent>
      </CustomCard>
    </div>
  );
}
