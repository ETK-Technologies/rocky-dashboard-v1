"use client";

import { RefreshCw } from "lucide-react";
import { PageContainer, PageHeader, CustomButton } from "@/components/ui";
import { SubscriptionSettingsForm } from "@/features/admin-settings/components/SubscriptionSettingsForm";
import { useSubscriptionSettings } from "@/features/admin-settings/hooks/useSubscriptionSettings";
import { cn } from "@/utils/cn";

export default function SubscriptionSettingsPage() {
  const { fetchSettings, loading } = useSubscriptionSettings(false);

  const handleRefresh = async () => {
    await fetchSettings();
  };

  return (
    <PageContainer>
      <div className="py-6">
        <PageHeader
          title="Subscription Settings"
          description="Configure subscription settings, grace period, and renewals"
          action={
            <CustomButton
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              Refresh
            </CustomButton>
          }
        />
        <div className="mt-6">
          <SubscriptionSettingsForm />
        </div>
      </div>
    </PageContainer>
  );
}
