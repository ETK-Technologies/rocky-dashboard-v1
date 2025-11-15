"use client";

import { RefreshCw } from "lucide-react";
import { PageContainer, PageHeader, CustomButton } from "@/components/ui";
import { GeneralSettingsForm } from "@/features/admin-settings/components/GeneralSettingsForm";
import { useGeneralSettings } from "@/features/admin-settings/hooks/useGeneralSettings";
import { cn } from "@/utils/cn";

export default function GeneralSettingsPage() {
  const { fetchSettings, loading } = useGeneralSettings(false);

  const handleRefresh = async () => {
    await fetchSettings();
  };

  return (
    <PageContainer>
      <div>
        <PageHeader
          title="General Settings"
          description="Configure timezone, date/time formats, pagination, and maintenance mode"
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
          <GeneralSettingsForm />
        </div>
      </div>
    </PageContainer>
  );
}
