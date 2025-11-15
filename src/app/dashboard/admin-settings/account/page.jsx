"use client";

import { RefreshCw } from "lucide-react";
import { PageContainer, PageHeader, CustomButton } from "@/components/ui";
import { AccountSettingsForm } from "@/features/admin-settings/components/AccountSettingsForm";
import { useAccountSettings } from "@/features/admin-settings/hooks/useAccountSettings";
import { cn } from "@/utils/cn";

export default function AccountSettingsPage() {
  const { fetchSettings, loading } = useAccountSettings(false);

  const handleRefresh = async () => {
    await fetchSettings();
  };

  return (
    <PageContainer>
      <div className="py-6">
        <PageHeader
          title="Account & Privacy Settings"
          description="Configure account creation policies, privacy settings, and data retention"
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
          <AccountSettingsForm />
        </div>
      </div>
    </PageContainer>
  );
}
