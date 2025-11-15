"use client";

import { PageContainer, PageHeader } from "@/components/ui";
import { GeneralSettingsForm } from "@/features/admin-settings/components/GeneralSettingsForm";

export default function GeneralSettingsPage() {
  return (
    <PageContainer>
      <div className="py-6">
        <PageHeader
          title="General Settings"
          subtitle="Configure timezone, date/time formats, pagination, and maintenance mode"
        />
        <div className="mt-6">
          <GeneralSettingsForm />
        </div>
      </div>
    </PageContainer>
  );
}

