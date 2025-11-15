"use client";

import { PageContainer, PageHeader } from "@/components/ui";
import { StoreSettingsForm } from "@/features/admin-settings/components/StoreSettingsForm";

export default function StoreSettingsPage() {
  return (
    <PageContainer>
      <div className="py-6">
        <PageHeader
          title="Store Settings"
          subtitle="Configure store information, address, contact details, and currency"
        />
        <div className="mt-6">
          <StoreSettingsForm />
        </div>
      </div>
    </PageContainer>
  );
}

