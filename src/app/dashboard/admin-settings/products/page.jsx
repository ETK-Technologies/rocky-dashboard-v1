"use client";

import { PageContainer } from "@/components/ui";
import { ProductSettingsForm } from "@/features/admin-settings/components/ProductSettingsForm";

export default function ProductSettingsPage() {
  return (
    <PageContainer>
      <div className="py-6">
        <ProductSettingsForm />
      </div>
    </PageContainer>
  );
}

