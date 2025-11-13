"use client";

import { PageContainer, PageHeader } from "@/components/ui";
import { HealthStatus } from "@/features/health/components/HealthStatus";

export default function HealthPage() {
  return (
    <PageContainer>
      <PageHeader
        title="System Health"
        subtitle="Monitor service liveness, readiness, and overall system health."
      />
      <HealthStatus />
    </PageContainer>
  );
}
