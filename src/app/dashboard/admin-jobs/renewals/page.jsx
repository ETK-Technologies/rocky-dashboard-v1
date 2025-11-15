"use client";

import { PageContainer, PageHeader } from "@/components/ui";
import { RenewalsSettingsForm } from "@/features/admin-jobs/components/RenewalsSettingsForm";

export default function RenewalsSettingsPage() {
  return (
    <PageContainer>
      <div className="py-6">
        <PageHeader
          title="Renewals Job Settings"
          subtitle="Configure renewals job schedule and concurrency settings"
        />
        <div className="mt-6">
          <RenewalsSettingsForm />
        </div>
      </div>
    </PageContainer>
  );
}

