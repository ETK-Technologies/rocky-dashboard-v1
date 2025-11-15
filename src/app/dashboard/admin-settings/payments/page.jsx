"use client";

import { PageContainer } from "@/components/ui";
import { PaymentSettingsForm } from "@/features/admin-settings/components/PaymentSettingsForm";

export default function PaymentSettingsPage() {
  return (
    <PageContainer>
      <div className="py-6">
        <PaymentSettingsForm />
      </div>
    </PageContainer>
  );
}

