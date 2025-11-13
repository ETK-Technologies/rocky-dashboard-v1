"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, ChevronDown, X } from "lucide-react";
import { cn } from "@/utils/cn";
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
import { useRoles } from "../hooks/useRoles";
import { useAdminPermissions } from "@/features/permissions/hooks/useAdminPermissions";

const schema = z.object({
  name: z.string().min(1, "Role name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  permissions: z.array(z.string()).optional(),
});

export function RoleForm({ roleId = null }) {
  const isEdit = !!roleId && roleId !== "new";
  const router = useRouter();
  const { createRole, updateRole, getRole, isLoading: rolesLoading } = useRoles();
  const { permissions, fetchPermissions, isLoading: permissionsLoading } = useAdminPermissions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [permissionDropdownOpen, setPermissionDropdownOpen] = useState(false);
  const permissionDropdownRef = useRef(null);

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
      slug: "",
      description: "",
      isActive: true,
      permissions: [],
    },
  });

  const selectedPermissions = watch("permissions") || [];

  // Fetch role data if editing
  useEffect(() => {
    if (isEdit && roleId) {
      const loadRole = async () => {
        try {
          const result = await getRole(roleId);
          if (result.success && result.data) {
            const role = result.data;
            setValue("name", role.name || "");
            setValue("slug", role.slug || "");
            setValue("description", role.description || "");
            setValue("isActive", role.isActive !== undefined ? role.isActive : true);
            setValue(
              "permissions",
              role.permissions?.map((p) => p.slug || p) || []
            );
          }
        } catch (err) {
          setError(err?.message || "Failed to load role");
        }
      };
      loadRole();
    }
  }, [isEdit, roleId, getRole, setValue]);

  // Fetch permissions on mount
  useEffect(() => {
    fetchPermissions();
  }, []);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: data.name,
        slug: data.slug,
        description: data.description || "",
        isActive: data.isActive !== undefined ? data.isActive : true,
        permissions: data.permissions || [],
      };

      let result;
      if (isEdit) {
        result = await updateRole(roleId, payload);
      } else {
        result = await createRole(payload);
      }

      if (result.success) {
        router.push("/dashboard/roles-permissions");
      } else {
        setError(result.error || "Failed to save role");
      }
    } catch (err) {
      setError(err?.message || "Failed to save role");
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePermission = (permissionSlug) => {
    const current = selectedPermissions;
    if (current.includes(permissionSlug)) {
      setValue(
        "permissions",
        current.filter((p) => p !== permissionSlug)
      );
    } else {
      setValue("permissions", [...current, permissionSlug]);
    }
  };

  const closePermissionDropdown = () => setPermissionDropdownOpen(false);
  const togglePermissionDropdown = () => setPermissionDropdownOpen((prev) => !prev);

  // Handle click outside and escape key
  useEffect(() => {
    if (!permissionDropdownOpen) {
      return;
    }

    const handleClickOutside = (event) => {
      if (
        permissionDropdownRef.current &&
        !permissionDropdownRef.current.contains(event.target)
      ) {
        setPermissionDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setPermissionDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [permissionDropdownOpen]);

  // Group permissions by resource
  const groupedPermissions = permissions.reduce((acc, perm) => {
    const resource = perm.resource || "other";
    if (!acc[resource]) {
      acc[resource] = [];
    }
    acc[resource].push(perm);
    return acc;
  }, {});

  if (isEdit && rolesLoading) {
    return (
      <PageContainer>
        <LoadingState />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={isEdit ? "Edit Role" : "Create Role"}
        description={
          isEdit
            ? "Update role details and permissions"
            : "Create a new role and assign permissions"
        }
        action={
          <CustomButton
            variant="outline"
            onClick={() => router.push("/dashboard/roles-permissions")}
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
            <CustomCardTitle>Role Information</CustomCardTitle>
          </CustomCardHeader>
          <CustomCardContent className="space-y-4">
            <div>
              <CustomLabel htmlFor="name">Role Name *</CustomLabel>
              <CustomInput
                id="name"
                {...register("name")}
                placeholder="e.g., Content Manager"
                error={errors.name}
              />
              {errors.name && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <CustomLabel htmlFor="slug">Slug *</CustomLabel>
              <CustomInput
                id="slug"
                {...register("slug")}
                placeholder="e.g., content-manager"
                error={errors.slug}
              />
              {errors.slug && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {errors.slug.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                URL-friendly identifier (lowercase, hyphens only)
              </p>
            </div>

            <div>
              <CustomLabel htmlFor="description">Description</CustomLabel>
              <textarea
                id="description"
                {...register("description")}
                placeholder="Describe what this role can do..."
                rows={3}
                className="flex w-full rounded-md border px-3 py-2 text-sm transition-colors bg-white text-gray-900 border-gray-300 placeholder:text-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-900"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                {...register("isActive")}
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 cursor-pointer"
              />
              <CustomLabel htmlFor="isActive" className="cursor-pointer">
                Active
              </CustomLabel>
            </div>
          </CustomCardContent>
        </CustomCard>

        <CustomCard>
          <CustomCardHeader>
            <CustomCardTitle>Permissions</CustomCardTitle>
          </CustomCardHeader>
          <CustomCardContent>
            {permissionsLoading ? (
              <LoadingState />
            ) : permissions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No permissions available. Create permissions first.
              </p>
            ) : (
              <div className="space-y-4">
                <div>
                  <CustomLabel htmlFor="permissions">Select Permissions</CustomLabel>
                  <div className="relative" ref={permissionDropdownRef}>
                    <button
                      type="button"
                      id="permissions"
                      name="permissions"
                      onClick={togglePermissionDropdown}
                      className={cn(
                        "flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors",
                        "bg-white text-foreground border-gray-300",
                        "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                        "focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400"
                      )}
                      aria-haspopup="listbox"
                      aria-expanded={permissionDropdownOpen}
                    >
                      <span className="truncate text-left">
                        {selectedPermissions.length === 0
                          ? "Select permissions"
                          : `${selectedPermissions.length} permission${selectedPermissions.length !== 1 ? "s" : ""} selected`}
                      </span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </button>

                    {permissionDropdownOpen && (
                      <div
                        className={cn(
                          "absolute left-0 right-0 z-50 mt-2 max-h-96 overflow-y-auto rounded-md border shadow-lg",
                          "bg-white text-foreground border-gray-300",
                          "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                        )}
                        role="listbox"
                        aria-multiselectable="true"
                      >
                        <div className="py-1">
                          {Object.entries(groupedPermissions).map(([resource, perms]) => (
                            <div key={resource} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-gray-50 dark:bg-gray-900">
                                {resource.replace(/_/g, " ")}
                              </div>
                              {perms.map((perm) => {
                                const selected = selectedPermissions.includes(perm.slug);
                                return (
                                  <label
                                    key={perm.id}
                                    className={cn(
                                      "flex cursor-pointer items-center gap-3 px-3 py-2 text-sm transition-colors",
                                      "hover:bg-blue-50 hover:text-blue-600",
                                      "dark:hover:bg-blue-500/15 dark:hover:text-blue-200",
                                      selected
                                        ? "bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-200"
                                        : "text-foreground dark:text-gray-200"
                                    )}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selected}
                                      onChange={() => togglePermission(perm.slug)}
                                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:focus:ring-blue-400"
                                    />
                                    <span className="truncate">{perm.name}</span>
                                  </label>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-700 p-2 text-right">
                          <button
                            type="button"
                            onClick={closePermissionDropdown}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedPermissions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2 rounded-md border border-dashed border-gray-200 bg-gray-50 p-3 text-sm text-foreground dark:border-gray-700 dark:bg-gray-900">
                      {permissions
                        .filter((perm) => selectedPermissions.includes(perm.slug))
                        .map((perm) => (
                          <button
                            key={perm.id}
                            type="button"
                            onClick={() => togglePermission(perm.slug)}
                            className={cn(
                              "flex items-center gap-2 rounded-full border px-3 py-1 font-medium transition-colors",
                              "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200",
                              "dark:bg-blue-500/20 dark:text-blue-200 dark:border-blue-500/40 dark:hover:bg-blue-500/30"
                            )}
                          >
                            <span className="truncate">{perm.name}</span>
                            <X className="h-3.5 w-3.5" />
                          </button>
                        ))}
                    </div>
                  )}

                  {selectedPermissions.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedPermissions.length} permission
                      {selectedPermissions.length !== 1 ? "s" : ""} selected
                    </p>
                  )}
                </div>
              </div>
            )}
          </CustomCardContent>
        </CustomCard>

        <div className="flex justify-end gap-4">
          <CustomButton
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/roles-permissions")}
          >
            Cancel
          </CustomButton>
          <CustomButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              "Saving..."
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEdit ? "Update Role" : "Create Role"}
              </>
            )}
          </CustomButton>
        </div>
      </form>
    </PageContainer>
  );
}

