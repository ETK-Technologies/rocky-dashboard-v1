"use client";

import { PageContainer, PageHeader } from "@/components/ui";
import { TaxSettingsForm } from "@/features/admin-settings/components/TaxSettingsForm";

export default function TaxSettingsPage() {
  return (
    <PageContainer>
      <div className="py-6">
        <PageHeader
          title="Tax Settings"
          subtitle="Configure tax calculation, rates, and rounding"
        />
        <div className="mt-6">
          <TaxSettingsForm />
        </div>
      </div>
    </PageContainer>
  );
}

