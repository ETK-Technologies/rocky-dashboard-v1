"use client";

import { PageContainer } from "@/components/ui";
import { EmailSettingsForm } from "@/features/admin-settings/components/EmailSettingsForm";

export default function EmailSettingsPage() {
  return (
    <PageContainer>
      <div className="py-6">
        <EmailSettingsForm />
      </div>
    </PageContainer>
  );
}

