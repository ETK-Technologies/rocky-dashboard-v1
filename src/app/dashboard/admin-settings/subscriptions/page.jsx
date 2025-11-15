"use client";

import { PageContainer, PageHeader } from "@/components/ui";
import { SubscriptionSettingsForm } from "@/features/admin-settings/components/SubscriptionSettingsForm";

export default function SubscriptionSettingsPage() {
  return (
    <PageContainer>
      <div className="py-6">
        <PageHeader
          title="Subscription Settings"
          subtitle="Configure subscription settings, grace period, and renewals"
        />
        <div className="mt-6">
          <SubscriptionSettingsForm />
        </div>
      </div>
    </PageContainer>
  );
}

