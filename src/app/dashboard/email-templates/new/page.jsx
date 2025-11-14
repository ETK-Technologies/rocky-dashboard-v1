"use client";

import { PageContainer, PageHeader } from "@/components/ui";
import { EmailTemplateBuilder } from "@/features/email-templates";

export default function NewEmailTemplatePage() {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 sm:p-6 lg:p-8 pb-0 flex-shrink-0">
        <PageHeader
          title="Create Email Template"
          subtitle="Create a new email template with drag & drop editor"
        />
      </div>
      <div className="flex-1 min-h-screen p-4 sm:p-6 lg:p-8 pt-6">
        <div className="bg-card rounded-lg border border-border shadow-sm h-full overflow-hidden flex flex-col">
          <EmailTemplateBuilder />
        </div>
      </div>
    </div>
  );
}
