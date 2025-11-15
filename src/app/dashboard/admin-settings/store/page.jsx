"use client";

import { RefreshCw } from "lucide-react";
import { PageContainer, PageHeader, CustomButton } from "@/components/ui";
import { StoreSettingsForm } from "@/features/admin-settings/components/StoreSettingsForm";
import { useStoreSettings } from "@/features/admin-settings/hooks/useStoreSettings";
import { cn } from "@/utils/cn";

export default function StoreSettingsPage() {
  const { fetchSettings, loading } = useStoreSettings(false);

  const handleRefresh = async () => {
    await fetchSettings();
  };

  return (
    <PageContainer>
      <div className="py-6">
        <PageHeader
          title="Store Settings"
          description="Configure store information, address, contact details, and currency"
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
          <StoreSettingsForm />
        </div>
      </div>
    </PageContainer>
  );
}
