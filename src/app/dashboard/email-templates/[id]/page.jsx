"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageContainer, PageHeader } from "@/components/ui";
import { EmailTemplateBuilder } from "@/features/email-templates";
import { emailTemplateService } from "@/features/email-templates/services/emailTemplateService";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { toast } from "react-toastify";

export default function EditEmailTemplatePage() {
  const params = useParams();
  const templateId = params?.id;
  const [templateData, setTemplateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (templateId) {
      loadTemplate();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]);

  const loadTemplate = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await emailTemplateService.getById(templateId);
      // The service already converts API format to our format
      setTemplateData(data);
    } catch (err) {
      console.error("Error loading template:", err);
      setError(err?.message || "Failed to load template");
      toast.error("Failed to load template");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingState message="Loading template..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorState message={error} onRetry={loadTemplate} />
      </PageContainer>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 sm:p-6 !pb-0 flex-shrink-0">
        <PageHeader
          title={templateData?.name || "Edit Email Template"}
          subtitle="Edit your email template with drag & drop editor"
        />
      </div>
      <div className="flex-1 min-h-screen p-4 sm:p-6 lg:p-8 !pt-0">
        <div className="bg-card rounded-lg border border-border shadow-sm h-full overflow-hidden flex flex-col">
          <EmailTemplateBuilder
            templateId={templateId}
            initialData={templateData}
          />
        </div>
      </div>
    </div>
  );
}
