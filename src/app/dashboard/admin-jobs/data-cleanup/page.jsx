"use client";

import { PageContainer, PageHeader } from "@/components/ui";
import { DataCleanupPanel } from "@/features/admin-jobs/components/DataCleanupPanel";

export default function DataCleanupPage() {
  return (
    <PageContainer>
      <div className="py-6">
        <PageHeader
          title="Data Cleanup"
          subtitle="Monitor and manage data retention cleanup operations"
        />
        <div className="mt-6">
          <DataCleanupPanel />
        </div>
      </div>
    </PageContainer>
  );
}

