"use client";

import { PageContainer, PageHeader } from "@/components/ui";
import { ImportJobsList } from "@/features/products";
import { Upload } from "lucide-react";

export default function ImportJobsPage() {
  return (
    <PageContainer>
      <div className="py-6">
        <PageHeader
          title="Import Jobs"
          description="Track and monitor product import jobs from WooCommerce CSV files"
          icon={Upload}
        />
        <div className="mt-6">
          <ImportJobsList limit={50} />
        </div>
      </div>
    </PageContainer>
  );
}
