"use client";

import { useParams } from "next/navigation";
import { PageContainer } from "@/components/ui/PageContainer";
import { EmailTriggerLogDetails } from "@/features/email-triggers-logs";

export default function EmailTriggerLogDetailPage() {
  const params = useParams();
  const activityId =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
      ? params?.id[0]
      : undefined;

  return (
    <PageContainer>
      <EmailTriggerLogDetails activityId={activityId} />
    </PageContainer>
  );
}

