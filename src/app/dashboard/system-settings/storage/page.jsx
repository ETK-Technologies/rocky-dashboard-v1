"use client";

import { PageContainer, PageHeader } from "@/components/ui";
import { StorageSettings } from "@/features/system-settings";

export default function StorageSettingsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Storage Settings"
        subtitle="Configure storage provider credentials and upload constraints"
      />
      <div className="mt-6">
        <StorageSettings />
      </div>
    </PageContainer>
  );
}
