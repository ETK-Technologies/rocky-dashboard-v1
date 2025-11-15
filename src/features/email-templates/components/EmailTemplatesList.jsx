"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit, Trash2, Plus, Mail, Search, Eye, FileText } from "lucide-react";
import {
  CustomButton,
  PageContainer,
  PageHeader,
  DataTable,
  CustomInput,
  CustomBadge,
  CustomConfirmationDialog,
  CustomModal,
  ErrorState,
  LoadingState,
} from "@/components/ui";
import { useEmailTemplates } from "../hooks/useEmailTemplates";
import { emailTemplateService } from "../services/emailTemplateService";
import { toast } from "react-toastify";
import { format } from "date-fns";

export function EmailTemplatesList() {
  const router = useRouter();
  const {
    templates,
    loading,
    error,
    deleteTemplate,
    updateFilters,
    filters,
    refetch,
  } = useEmailTemplates();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Filter templates by search term
  const filteredTemplates = templates.filter((template) => {
    if (!searchTerm.trim()) return true;
    const search = searchTerm.toLowerCase();
    return (
      template.name?.toLowerCase().includes(search) ||
      template.subject?.toLowerCase().includes(search) ||
      template.description?.toLowerCase().includes(search) ||
      template.scope?.toLowerCase().includes(search)
    );
  });

  // Handle delete
  const handleDelete = async () => {
    if (!templateToDelete) return;
    try {
      await deleteTemplate(templateToDelete.id);
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    } catch (err) {
      // Error already handled in deleteTemplate
    }
  };

  // Handle preview
  const handlePreview = async (template) => {
    try {
      setPreviewLoading(true);
      setPreviewData(null);
      setPreviewDialogOpen(true);

      // Use test variables for preview
      const preview = await emailTemplateService.preview(template.id, {
        user: { name: "John Doe" },
        order: { id: "12345" },
      });

      setPreviewData(preview);
    } catch (err) {
      console.error("Error previewing template:", err);
      toast.error("Failed to preview template");
    } finally {
      setPreviewLoading(false);
    }
  };

  // Table columns
  const columns = [
    {
      key: "name",
      label: "Template Name",
      width: "25%",
      render: (template) => (
        <div className="min-w-0">
          <div className="font-medium text-foreground truncate">
            {template.name}
          </div>
          {template.description && (
            <div className="text-xs text-muted-foreground mt-0.5 truncate">
              {template.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "subject",
      label: "Subject",
      width: "25%",
      truncate: true,
      render: (template) => (
        <div
          className="text-sm text-foreground min-w-0"
          title={template.subject || "—"}
        >
          <div className="truncate">{template.subject || "—"}</div>
        </div>
      ),
    },
    {
      key: "scope",
      label: "Scope",
      width: "12%",
      render: (template) => (
        <CustomBadge variant="outline" className="text-xs whitespace-nowrap">
          {template.scope || "CUSTOM"}
        </CustomBadge>
      ),
    },
    {
      key: "trigger",
      label: "Trigger",
      width: "12%",
      render: (template) => (
        <div className="text-xs text-muted-foreground whitespace-nowrap">
          {template.trigger || "manual"}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: "10%",
      render: (template) => (
        <CustomBadge
          variant={template.isEnabled ? "default" : "secondary"}
          className="text-xs whitespace-nowrap"
        >
          {template.isEnabled ? "Enabled" : "Disabled"}
        </CustomBadge>
      ),
    },
    {
      key: "updatedAt",
      label: "Last Updated",
      width: "15%",
      render: (template) => (
        <div className="text-xs text-muted-foreground whitespace-nowrap">
          {template.updatedAt
            ? format(new Date(template.updatedAt), "MMM d, yyyy")
            : "—"}
        </div>
      ),
    },
  ];

  // Row actions
  const renderActions = (template) => (
    <div className="flex items-center gap-1 justify-end min-w-[120px]">
      <CustomButton
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          handlePreview(template);
        }}
        title="Preview"
        className="h-8 w-8 p-0"
      >
        <Eye className="h-4 w-4" />
      </CustomButton>
      <CustomButton
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/dashboard/email-templates/${template.id}`);
        }}
        title="Edit"
        className="h-8 w-8 p-0"
      >
        <Edit className="h-4 w-4" />
      </CustomButton>
      <CustomButton
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          setTemplateToDelete(template);
          setDeleteDialogOpen(true);
        }}
        title="Delete"
        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </CustomButton>
    </div>
  );

  if (error && !loading) {
    return (
      <PageContainer>
        <ErrorState message={error} onRetry={refetch} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Email Templates"
        description="Manage your email templates"
        action={
          <CustomButton
            variant="primary"
            onClick={() => router.push("/dashboard/email-templates/new")}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </CustomButton>
        }
      />

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <CustomInput
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="sm:w-48">
          <select
            value={filters.scope || ""}
            onChange={(e) => updateFilters({ scope: e.target.value || "" })}
            className="w-full h-10 px-3 rounded-md border border-input bg-card text-foreground text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:border-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">All Scopes</option>
            <option value="ORDER">Order</option>
            <option value="CUSTOM">Custom</option>
            <option value="USER">User</option>
            <option value="SYSTEM">System</option>
          </select>
        </div>
      </div>

      {/* Templates Table */}
      <div className="w-full overflow-x-auto ">
        <DataTable
          columns={columns}
          data={filteredTemplates}
          loading={loading}
          renderActions={renderActions}
          onRowClick={(template) => {
            router.push(`/dashboard/email-templates/${template.id}`);
          }}
          className="min-w-[900px]"
          emptyState={{
            icon: Mail,
            title: "No email templates",
            description: searchTerm
              ? "No templates match your search criteria"
              : "Get started by creating your first email template",
            action: searchTerm ? null : (
              <CustomButton
                variant="primary"
                onClick={() => router.push("/dashboard/email-templates/new")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </CustomButton>
            ),
          }}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <CustomConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setTemplateToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete Template"
        description={`Are you sure you want to delete "${templateToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Preview Dialog */}
      <CustomModal
        isOpen={previewDialogOpen}
        onClose={() => {
          setPreviewDialogOpen(false);
          setPreviewData(null);
        }}
        title={`Preview: ${previewData?.subject || "Template Preview"}`}
        size="xl"
      >
        {previewLoading ? (
          <LoadingState message="Loading preview..." />
        ) : previewData ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Subject:
              </label>
              <div className="p-3 bg-muted rounded-md text-sm">
                {previewData.subject}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                HTML Body:
              </label>
              <div
                className="p-4 bg-muted rounded-md border border-border max-h-[400px] overflow-auto"
                dangerouslySetInnerHTML={{
                  __html: previewData.bodyHtml || previewData.body || "",
                }}
              />
            </div>
            {previewData.bodyText && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Text Body:
                </label>
                <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap max-h-[200px] overflow-auto">
                  {previewData.bodyText}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No preview available
          </div>
        )}
      </CustomModal>
    </PageContainer>
  );
}
