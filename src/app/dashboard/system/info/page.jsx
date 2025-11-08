"use client";

import { ProtectedRoute } from "@/components/common";
import { PageContainer, PageHeader } from "@/components/ui";
import { SystemInfoCards, SystemBackups } from "@/features/system";

export default function SystemInfoPage() {
  return (
    <ProtectedRoute roles={["admin", "super_admin"]}>
      <PageContainer>
        <PageHeader
          title="System Info"
          subtitle="Monitor infrastructure health and usage metrics in real-time."
        />
        <div className="mt-6 space-y-6">
          <SystemInfoCards />
          <SystemBackups />
        </div>
      </PageContainer>
    </ProtectedRoute>
  );
}
