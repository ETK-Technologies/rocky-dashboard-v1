"use client";

import { PageContainer, PageHeader } from "@/components/ui";
import { JobsOverview } from "@/features/admin-jobs/components/JobsOverview";

export default function JobsOverviewPage() {
  return (
    <PageContainer>
      <div className="py-6">
        <PageHeader
          title="Jobs Overview"
          subtitle="Monitor all background job queues, statistics, and recent jobs"
        />
        <div className="mt-6">
          <JobsOverview />
        </div>
      </div>
    </PageContainer>
  );
}

