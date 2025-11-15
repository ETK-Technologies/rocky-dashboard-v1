"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { PageContainer, PageHeader, CustomButton } from "@/components/ui";
import { JobsOverview } from "@/features/admin-jobs/components/JobsOverview";
import { useJobsOverview } from "@/features/admin-jobs/hooks/useJobsOverview";
import { cn } from "@/utils/cn";

export default function JobsOverviewPage() {
  const { fetchOverview, loading } = useJobsOverview(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchOverview();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <PageContainer>
      <div className="py-6">
        <PageHeader
          title="Jobs Overview"
          description="Monitor all background job queues, statistics, and recent jobs"
          action={
            <CustomButton
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading || refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={cn(
                  "h-4 w-4",
                  (loading || refreshing) && "animate-spin"
                )}
              />
              Refresh
            </CustomButton>
          }
        />
        <div>
          <JobsOverview />
        </div>
      </div>
    </PageContainer>
  );
}
