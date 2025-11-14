"use client";

import { useState, useEffect } from "react";
import { Save, RefreshCw, Loader2 } from "lucide-react";
import {
  CustomButton,
  CustomCard,
  CustomCardContent,
  CustomCardDescription,
  CustomCardHeader,
  CustomCardTitle,
  CustomInput,
  ErrorState,
  LoadingState,
  PageContainer,
  PageHeader,
} from "@/components/ui";
import { useBillingSettings } from "../hooks/useBillingSettings";

export default function BillingSettings() {
  const { settings, loading, error, saving, refresh, updateSettings } =
    useBillingSettings();
  const [formData, setFormData] = useState({
    enableSubscriptions: false,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        enableSubscriptions:
          settings.enableSubscriptions !== undefined
            ? settings.enableSubscriptions
            : settings.enable_subscriptions !== undefined
            ? settings.enable_subscriptions
            : false,
      });
    }
  }, [settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSettings({
        enableSubscriptions: formData.enableSubscriptions,
      });
    } catch (err) {
      // Error already handled in hook
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingState message="Loading billing settings..." loading={loading} fullScreen={true} />
      </PageContainer>
    );
  }

  if (error && !settings) {
    return (
      <PageContainer>
        <PageHeader title="Billing Settings" />
        <ErrorState
          title="Failed to load billing settings"
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
    <PageContainer maxWidth="md">
      <PageHeader
        title="Billing Settings"
        description="Configure subscription and billing preferences"
        action={
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
        }
      />

      <form onSubmit={handleSubmit}>
        <CustomCard>
          <CustomCardHeader>
            <CustomCardTitle>Subscription Settings</CustomCardTitle>
            <CustomCardDescription>
              Enable or disable subscription functionality
            </CustomCardDescription>
          </CustomCardHeader>
          <CustomCardContent className="space-y-6">
            <div>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.enableSubscriptions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      enableSubscriptions: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-primary bg-background border-input rounded focus:ring-primary focus:ring-2 cursor-pointer"
                />
                <div>
                  <span className="text-sm font-medium text-foreground block">
                    Enable Subscriptions
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Allow customers to subscribe to recurring payment plans
                  </span>
                </div>
              </label>
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <CustomButton
                type="submit"
                disabled={saving}
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
                    Save Settings
                  </>
                )}
              </CustomButton>
            </div>
          </CustomCardContent>
        </CustomCard>
      </form>
    </PageContainer>
  );
}

