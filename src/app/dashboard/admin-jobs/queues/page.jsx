"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PageContainer, PageHeader } from "@/components/ui";
import { QueueJobsList } from "@/features/admin-jobs/components/QueueJobsList";

export default function QueueManagementPage() {
  const searchParams = useSearchParams();
  const [queueName, setQueueName] = useState(null);
  const [stateFilter, setStateFilter] = useState(null);

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

  return (
    <PageContainer>
      <div className="py-6">
        <PageHeader
          title="Queue Management"
          subtitle="View and manage jobs in specific queues (renewals, product-import)"
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

