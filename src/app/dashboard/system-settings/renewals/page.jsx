"use client";

import { PageContainer, PageHeader } from "@/components/ui";
import { RenewalsJobSettings } from "@/features/system-settings";

export default function RenewalsSettingsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Renewals Job Settings"
        subtitle="Configure the renewals job cron schedule and concurrency settings"
      />
      <div className="mt-6">
        <RenewalsJobSettings />
      </div>
    </PageContainer>
  );
}

