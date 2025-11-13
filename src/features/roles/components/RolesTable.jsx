"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Edit,
  Trash2,
  Search,
  Plus,
  Shield,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import {
  CustomButton,
  CustomInput,
  DataTable,
  CustomBadge,
  IconButton,
  CustomConfirmationDialog,
  ErrorState,
  LoadingState,
} from "@/components/ui";
import { useRoles } from "../hooks/useRoles";

export function RolesTable() {
  const router = useRouter();
  const {
    roles,
    isLoading,
    error,
    params,
    setSearch,
    deleteRole,
  } = useRoles();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

  const handleDeleteClick = (role) => {
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (roleToDelete) {
      try {
        await deleteRole(roleToDelete.id);
        setDeleteDialogOpen(false);
        setRoleToDelete(null);
      } catch (error) {
        // Error is already handled in the hook
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setRoleToDelete(null);
  };

  // Table columns
  const columns = [
    {
      key: "name",
      label: "Role Name",
      width: "200px",
      render: (role) => (
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-foreground">{role.name}</span>
        </div>
      ),
    },
    {
      key: "slug",
      label: "Slug",
      width: "150px",
      render: (role) => (
        <span className="text-sm text-muted-foreground font-mono">
          {role.slug}
        </span>
      ),
    },
    {
      key: "description",
      label: "Description",
      width: "300px",
      truncate: true,
      render: (role) => (
        <span className="text-sm text-muted-foreground">
          {role.description || "-"}
        </span>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      width: "120px",
      render: (role) => (
        <CustomBadge variant={role.isActive ? "default" : "secondary"}>
          {role.isActive ? (
            <>
              <ShieldCheck className="h-3 w-3 mr-1" />
              Active
            </>
          ) : (
            <>
              <ShieldX className="h-3 w-3 mr-1" />
              Inactive
            </>
          )}
        </CustomBadge>
      ),
    },
    {
      key: "isSystem",
      label: "Type",
      width: "100px",
      render: (role) => (
        <CustomBadge variant={role.isSystem ? "outline" : "default"}>
          {role.isSystem ? "System" : "Custom"}
        </CustomBadge>
      ),
    },
    {
      key: "permissions",
      label: "Permissions",
      width: "150px",
      render: (role) => (
        <span className="text-sm text-muted-foreground">
          {role.permissions?.length || 0} permission
          {role.permissions?.length !== 1 ? "s" : ""}
        </span>
      ),
    },
  ];

  const renderActions = (role) => (
    <div
      className="flex items-center gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      <IconButton
        icon={Edit}
        label="Edit"
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/dashboard/roles-permissions/roles/${role.id}`)}
        disabled={role.isSystem}
      />
      <IconButton
        icon={Trash2}
        label="Delete"
        variant="ghost"
        size="sm"
        onClick={() => handleDeleteClick(role)}
        disabled={role.isSystem}
        className="text-red-600 hover:text-red-700 dark:text-red-400"
      />
    </div>
  );

  if (error && !isLoading) {
    return (
      <ErrorState
        title="Failed to load roles"
        message={error}
        action={
          <CustomButton onClick={() => window.location.reload()}>
            Retry
          </CustomButton>
        }
      />
    );
  }

  if (isLoading && roles.length === 0) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <CustomInput
            type="text"
            placeholder="Search roles..."
            value={params.search || ""}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <CustomButton
          onClick={() => router.push("/dashboard/roles-permissions/roles/new")}
          className="flex items-center gap-2"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Role</span>
          <span className="sm:hidden">Add</span>
        </CustomButton>
      </div>

      {/* Roles Table */}
      <DataTable
        columns={columns}
        data={Array.isArray(roles) ? roles : []}
        renderActions={renderActions}
        loading={isLoading}
        emptyState={{
          icon: Shield,
          title: "No roles found",
          description: params.search
            ? "No roles match your search. Try adjusting your search criteria."
            : "Get started by creating your first role.",
          action: params.search ? (
            <CustomButton
              onClick={() => setSearch("")}
              variant="outline"
              className="flex items-center gap-2"
            >
              Clear Search
            </CustomButton>
          ) : (
            <CustomButton
              onClick={() => router.push("/dashboard/roles-permissions/roles/new")}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Your First Role
            </CustomButton>
          ),
        }}
      />

      {/* Delete Confirmation Dialog */}
      <CustomConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Deactivate Role"
        description={`Are you sure you want to deactivate "${
          roleToDelete?.name || "this role"
        }"? This action cannot be undone.`}
        confirmText="Deactivate"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}

