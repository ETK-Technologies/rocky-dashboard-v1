"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { PageContainer, PageHeader, CustomButton } from "@/components/ui";
import { QueueJobsList } from "@/features/admin-jobs/components/QueueJobsList";
import { useQueueJobs } from "@/features/admin-jobs/hooks/useQueueJobs";
import { cn } from "@/utils/cn";

export default function QueueManagementPage() {
  const searchParams = useSearchParams();
  const [queueName, setQueueName] = useState(null);
  const [stateFilter, setStateFilter] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const { refresh, loading } = useQueueJobs(queueName || "", {
    autoFetch: false,
    state: stateFilter,
    limit: 50,
  });

  useEffect(() => {
    const queue = searchParams.get("queue");
    const state = searchParams.get("state");
    if (queue) {
      setQueueName(queue);
    }
    if (state) {
      setStateFilter(state);
    }
  }, [searchParams]);

  const handleRefresh = async () => {
    if (!queueName) return;
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
          title="Queue Management"
          description="View and manage jobs in specific queues (renewals, product-import)"
          action={
            queueName && (
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
            )
          }
        />
        <div className="mt-6">
          {queueName ? (
            <QueueJobsList
              queueName={queueName}
              stateFilter={stateFilter}
              limit={50}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Please select a queue to view jobs
              </p>
              <div className="flex gap-4 justify-center">
                <a
                  href="/dashboard/admin-jobs/queues?queue=renewals"
                  className="text-primary hover:underline"
                >
                  Renewals Queue
                </a>
                <span className="text-muted-foreground">|</span>
                <a
                  href="/dashboard/admin-jobs/queues?queue=product-import"
                  className="text-primary hover:underline"
                >
                  Product Import Queue
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
