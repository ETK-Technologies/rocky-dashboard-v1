"use client";

import { ImportJobsList } from "@/features/products";
import { PageContainer, PageHeader } from "@/components/ui";
import { Upload } from "lucide-react";

export default function ImportJobsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Product Import Jobs"
        description="Track and monitor product import jobs from WooCommerce CSV files"
        icon={Upload}
      />
      <div className="mt-6">
        <ImportJobsList limit={50} />
      </div>
    </PageContainer>
  );
}

