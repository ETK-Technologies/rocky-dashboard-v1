"use client";

import { RefreshCw } from "lucide-react";
import { PageContainer, PageHeader, CustomButton } from "@/components/ui";
import { RenewalsSettingsForm } from "@/features/admin-jobs/components/RenewalsSettingsForm";
import { useRenewalsSettings } from "@/features/admin-jobs/hooks/useRenewalsSettings";
import { cn } from "@/utils/cn";

export default function RenewalsSettingsPage() {
  const { fetchSettings, loading } = useRenewalsSettings(false);

  const handleRefresh = async () => {
    await fetchSettings();
  };

  return (
    <PageContainer>
      <div className="py-6">
        <PageHeader
          title="Renewals Job Settings"
          description="Configure the schedule and concurrency for subscription renewals processing"
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
          <RenewalsSettingsForm />
        </div>
      </div>
    </PageContainer>
  );
}
