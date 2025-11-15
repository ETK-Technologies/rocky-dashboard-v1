"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { PageContainer, PageHeader, CustomButton } from "@/components/ui";
import { DataCleanupPanel } from "@/features/admin-jobs/components/DataCleanupPanel";
import { useDataCleanup } from "@/features/admin-jobs/hooks/useDataCleanup";
import { cn } from "@/utils/cn";

export default function DataCleanupPage() {
  const { refresh, loading } = useDataCleanup(false, 10);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <PageContainer>
      <div className="py-6">
        <PageHeader
          title="Data Cleanup"
          description="Monitor and manage data retention cleanup operations"
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
        <div className="mt-6">
          <DataCleanupPanel />
        </div>
      </div>
    </PageContainer>
  );
}
