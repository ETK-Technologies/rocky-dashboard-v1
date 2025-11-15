"use client";

import { RefreshCw } from "lucide-react";
import { PageContainer, PageHeader, CustomButton } from "@/components/ui";
import { TaxSettingsForm } from "@/features/admin-settings/components/TaxSettingsForm";
import { useTaxSettings } from "@/features/admin-settings/hooks/useTaxSettings";
import { cn } from "@/utils/cn";

export default function TaxSettingsPage() {
  const { fetchSettings, loading } = useTaxSettings(false);

  const handleRefresh = async () => {
    await fetchSettings();
  };

  return (
    <PageContainer>
      <div className="py-6">
        <PageHeader
          title="Tax Settings"
          description="Configure tax calculation, rates, and rounding"
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
          <TaxSettingsForm />
        </div>
      </div>
    </PageContainer>
  );
}
