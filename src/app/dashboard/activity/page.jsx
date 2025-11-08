"use client";

import { ProtectedRoute } from "@/components/common";
import { PageContainer } from "@/components/ui/PageContainer";
import { ActivityLogs } from "@/features/activity";

export default function ActivityPage() {
  return (
    <ProtectedRoute roles={["admin", "super_admin"]}>
      <PageContainer>
        <ActivityLogs />
      </PageContainer>
    </ProtectedRoute>
  );
}


