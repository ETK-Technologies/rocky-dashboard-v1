"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import {
  CustomButton,
  CustomInput,
  CustomLabel,
  PageContainer,
  PageHeader,
  CustomCard,
  CustomCardContent,
  CustomCardHeader,
  CustomCardTitle,
  ErrorState,
  LoadingState,
} from "@/components/ui";
import { useAdminPermissions } from "../hooks/useAdminPermissions";

const schema = z.object({
  name: z.string().min(1, "Permission name is required"),
  resource: z.string().min(1, "Resource is required"),
  action: z.string().min(1, "Action is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
});

const RESOURCES = [
  "users",
  "products",
  "orders",
  "subscriptions",
  "coupons",
  "categories",
  "reviews",
  "flows",
  "settings",
  "rbac",
  "blogs",
  "attributes",
  "product_tags",
];

const ACTIONS = [
  "create",
  "read",
  "update",
  "delete",
  "manage",
  "write",
  "capture",
];

export function PermissionForm({ permissionId = null }) {
  const isEdit = !!permissionId && permissionId !== "new";
  const router = useRouter();
  const {
    createPermission,
    updatePermission,
    getPermission,
    isLoading: permissionsLoading,
  } = useAdminPermissions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      resource: "",
      action: "",
      slug: "",
      description: "",
    },
  });

  const resource = watch("resource");
  const action = watch("action");

  // Auto-generate slug from resource and action
  useEffect(() => {
    if (resource && action && !isEdit) {
      const slug = `${resource}.${action}`;
      setValue("slug", slug);
    }
  }, [resource, action, isEdit, setValue]);

  // Fetch permission data if editing
  useEffect(() => {
    if (isEdit && permissionId) {
      const loadPermission = async () => {
        try {
          const result = await getPermission(permissionId);
          if (result.success && result.data) {
            const perm = result.data;
            setValue("name", perm.name || "");
            setValue("resource", perm.resource || "");
            setValue("action", perm.action || "");
            setValue("slug", perm.slug || "");
            setValue("description", perm.description || "");
          }
        } catch (err) {
          setError(err?.message || "Failed to load permission");
        }
      };
      loadPermission();
    }
  }, [isEdit, permissionId, getPermission, setValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: data.name,
        resource: data.resource,
        action: data.action,
        slug: data.slug,
        description: data.description || "",
      };

      let result;
      if (isEdit) {
        result = await updatePermission(permissionId, payload);
      } else {
        result = await createPermission(payload);
      }

      if (result.success) {
        router.push("/dashboard/roles-permissions?tab=permissions");
      } else {
        setError(result.error || "Failed to save permission");
      }
    } catch (err) {
      setError(err?.message || "Failed to save permission");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEdit && permissionsLoading) {
    return (
      <PageContainer>
        <LoadingState loading={permissionsLoading} fullScreen={true} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={isEdit ? "Edit Permission" : "Create Permission"}
        description={
          isEdit
            ? "Update permission details"
            : "Create a new permission for access control"
        }
        action={
          <CustomButton
            variant="outline"
            onClick={() => router.push("/dashboard/roles-permissions?tab=permissions")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </CustomButton>
        }
      />

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <CustomCard>
          <CustomCardHeader>
            <CustomCardTitle>Permission Information</CustomCardTitle>
          </CustomCardHeader>
          <CustomCardContent className="space-y-4">
            <div>
              <CustomLabel htmlFor="name">Permission Name *</CustomLabel>
              <CustomInput
                id="name"
                {...register("name")}
                placeholder="e.g., Create Users"
                error={errors.name}
              />
              {errors.name && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <CustomLabel htmlFor="resource">Resource *</CustomLabel>
                <select
                  id="resource"
                  {...register("resource")}
                  className="flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors bg-white text-gray-900 border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-900"
                >
                  <option value="">Select resource</option>
                  {RESOURCES.map((res) => (
                    <option key={res} value={res}>
                      {res.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </option>
                  ))}
                </select>
                {errors.resource && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {errors.resource.message}
                  </p>
                )}
              </div>

              <div>
                <CustomLabel htmlFor="action">Action *</CustomLabel>
                <select
                  id="action"
                  {...register("action")}
                  className="flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors bg-white text-gray-900 border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-900"
                >
                  <option value="">Select action</option>
                  {ACTIONS.map((act) => (
                    <option key={act} value={act}>
                      {act.charAt(0).toUpperCase() + act.slice(1)}
                    </option>
                  ))}
                </select>
                {errors.action && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {errors.action.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <CustomLabel htmlFor="slug">Slug *</CustomLabel>
              <CustomInput
                id="slug"
                {...register("slug")}
                placeholder="e.g., users.create"
                error={errors.slug}
                disabled={!isEdit && resource && action}
              />
              {errors.slug && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {errors.slug.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Auto-generated from resource and action (format: resource.action)
              </p>
            </div>

            <div>
              <CustomLabel htmlFor="description">Description</CustomLabel>
              <textarea
                id="description"
                {...register("description")}
                placeholder="Describe what this permission allows..."
                rows={3}
                className="flex w-full rounded-md border px-3 py-2 text-sm transition-colors bg-white text-gray-900 border-gray-300 placeholder:text-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-900"
              />
            </div>
          </CustomCardContent>
        </CustomCard>

        <div className="flex justify-end gap-4">
          <CustomButton
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/roles-permissions?tab=permissions")}
          >
            Cancel
          </CustomButton>
          <CustomButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              "Saving..."
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEdit ? "Update Permission" : "Create Permission"}
              </>
            )}
          </CustomButton>
        </div>
      </form>
    </PageContainer>
  );
}

