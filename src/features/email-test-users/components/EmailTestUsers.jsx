"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import {
  PageContainer,
  PageHeader,
  CustomCard,
  CustomCardHeader,
  CustomCardTitle,
  CustomCardContent,
  CustomButton,
  FormField,
  DataTable,
  LoadingState,
  ErrorState,
  CustomBadge,
  CustomConfirmationDialog,
  IconButton,
} from "@/components/ui";
import { useEmailTestUsers } from "../hooks/useEmailTestUsers";
import { Plus, User, Trash2 } from "lucide-react";

const testUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export default function EmailTestUsers() {
  const { testUsers, loading, error, createTestUser, refetch } =
    useEmailTestUsers();
  const [showForm, setShowForm] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(testUserSchema),
    defaultValues: {
      email: "",
      name: "",
      description: "",
      isActive: true,
    },
  });

  const onSubmit = async (data) => {
    try {
      await createTestUser(data);
      reset();
      setShowForm(false);
    } catch (err) {
      // Error is already handled in the hook
    }
  };

  const handleDelete = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    // TODO: Implement delete functionality when API is available
    toast.info("Delete functionality will be available soon");
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const columns = [
    { key: "email", label: "Email" },
    { key: "name", label: "Name" },
    {
      key: "description",
      label: "Description",
      render: (row) => row.description || "-",
    },
    {
      key: "isActive",
      label: "Status",
      render: (row) => (
        <CustomBadge variant={row.isActive ? "default" : "secondary"}>
          {row.isActive ? "Active" : "Inactive"}
        </CustomBadge>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (row) =>
        row.createdAt
          ? new Date(row.createdAt).toLocaleDateString()
          : "-",
    },
  ];

  if (loading) {
    return (
      <PageContainer>
        <LoadingState message="Loading test users..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorState message={error} onRetry={refetch} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Email Test Users"
        description="Manage test users for email testing"
        action={
          <CustomButton onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Test User
          </CustomButton>
        }
      />

      {showForm && (
        <CustomCard className="mb-6">
          <CustomCardHeader>
            <CustomCardTitle>Add New Test User</CustomCardTitle>
          </CustomCardHeader>
          <CustomCardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                id="email"
                label="Email"
                type="email"
                placeholder="test@example.com"
                error={errors.email?.message}
                required
                {...register("email")}
              />

              <FormField
                id="name"
                label="Name"
                type="text"
                placeholder="John Doe"
                error={errors.name?.message}
                required
                {...register("name")}
              />

              <FormField
                id="description"
                label="Description"
                type="text"
                placeholder="QA Team Test Account"
                error={errors.description?.message}
                {...register("description")}
              />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  {...register("isActive")}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <CustomLabel htmlFor="isActive" className="cursor-pointer">
                  Active
                </CustomLabel>
              </div>

              <div className="flex items-center gap-2">
                <CustomButton type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Test User"}
                </CustomButton>
                <CustomButton
                  type="button"
                  variant="outline"
                  onClick={() => {
                    reset();
                    setShowForm(false);
                  }}
                >
                  Cancel
                </CustomButton>
              </div>
            </form>
          </CustomCardContent>
        </CustomCard>
      )}

      <CustomCard>
        <CustomCardHeader>
          <CustomCardTitle>Test Users</CustomCardTitle>
        </CustomCardHeader>
        <CustomCardContent>
          <DataTable
            columns={columns}
            data={testUsers}
            emptyState={{
              icon: User,
              title: "No test users found",
              description: "Add your first test user to get started.",
            }}
            renderActions={(row) => (
              <div className="flex items-center gap-2">
                <IconButton
                  icon={Trash2}
                  label="Delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(row);
                  }}
                  variant="ghost"
                />
              </div>
            )}
          />
        </CustomCardContent>
      </CustomCard>

      <CustomConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Test User"
        description={`Are you sure you want to delete ${userToDelete?.email}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </PageContainer>
  );
}

