"use client";

import { useParams } from "next/navigation";
import { PageContainer } from "@/components/ui/PageContainer";
import { ActivityLogDetails } from "@/features/activity";

export default function ActivityDetailPage() {
  const params = useParams();
  const activityId =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
      ? params?.id[0]
      : undefined;

  return (
    <PageContainer>
      <ActivityLogDetails activityId={activityId} />
    </PageContainer>
  );
}

