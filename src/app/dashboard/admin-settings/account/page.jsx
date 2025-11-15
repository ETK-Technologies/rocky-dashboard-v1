"use client";

import { PageContainer, PageHeader } from "@/components/ui";
import { AccountSettingsForm } from "@/features/admin-settings/components/AccountSettingsForm";

export default function AccountSettingsPage() {
  return (
    <PageContainer>
      <div className="py-6">
        <PageHeader
          title="Account & Privacy Settings"
          subtitle="Configure account creation policies, privacy settings, and data retention"
        />
        <div className="mt-6">
          <AccountSettingsForm />
        </div>
      </div>
    </PageContainer>
  );
}

