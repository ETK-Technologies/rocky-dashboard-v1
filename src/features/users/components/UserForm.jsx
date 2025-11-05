"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CustomButton,
  CustomInput,
  CustomLabel,
  PageContainer,
  PageHeader,
  SectionHeader,
  Divider,
} from "@/components/ui";
import { useUsers } from "../hooks/useUsers";
import { useRouter } from "next/navigation";

const schema = z.object({
  // Required fields
  firstName: z.string().min(1, "First name is required"),
  password: z.string().min(6, "Min 6 characters").optional(),
  role: z.enum(["user", "admin", "super_admin"]),

  // Optional fields
  lastName: z.string().optional(),

  // Optional flags
  isActive: z.boolean().optional(),
});

export function UserForm({ defaultValues, userId }) {
  const isEdit = !!userId;
  const { createUser, updateUser } = useUsers();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create schema based on mode (password required only on create)
  const formSchema = isEdit ? schema.omit({ password: true }) : schema;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      password: "",
      role: "user",
      isActive: true,
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        ...defaultValues,
        password: "", // Never pre-fill password
      });
    }
  }, [defaultValues, form]);

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const payload = { ...values };

      // Remove empty optional fields
      if (!payload.password || payload.password === "") delete payload.password;
      if (!payload.lastName || payload.lastName === "") delete payload.lastName;

      const ok = isEdit
        ? await updateUser(userId, payload)
        : await createUser(payload);

      if (ok) {
        router.push("/dashboard/super-admin/users");
      }
    } catch (error) {
      // Error is already handled by the hook with toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader title={isEdit ? "Edit User" : "Create User"} />
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 max-w-3xl"
      >
        {/* Required Information */}
        <div className="space-y-4">
          <SectionHeader title="Required Information" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <CustomLabel htmlFor="firstName">
                First Name <span className="text-red-500">*</span>
              </CustomLabel>
              <CustomInput
                id="firstName"
                {...form.register("firstName")}
                error={form.formState.errors.firstName}
              />
              {form.formState.errors.firstName && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <CustomLabel htmlFor="lastName">Last Name</CustomLabel>
              <CustomInput id="lastName" {...form.register("lastName")} />
            </div>

            {!isEdit && (
              <div className="md:col-span-2">
                <CustomLabel htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </CustomLabel>
                <CustomInput
                  id="password"
                  type="password"
                  {...form.register("password")}
                  error={form.formState.errors.password}
                />
                {form.formState.errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
            )}

            <div className="md:col-span-2">
              <CustomLabel htmlFor="role">
                Role <span className="text-red-500">*</span>
              </CustomLabel>
              <select
                id="role"
                className="w-full border rounded-md h-10 px-3 bg-white text-gray-900 border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                {...form.register("role")}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
          </div>
        </div>

        <Divider />

        {/* Account Status */}
        <div className="space-y-4">
          <SectionHeader title="Account Status" />
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                {...form.register("isActive")}
                className="w-4 h-4 rounded border-gray-300"
              />
              <CustomLabel
                htmlFor="isActive"
                className="font-normal cursor-pointer"
              >
                Account is active
              </CustomLabel>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <CustomButton
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/super-admin/users")}
            disabled={isSubmitting}
          >
            Cancel
          </CustomButton>
          <CustomButton type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : isEdit
              ? "Update User"
              : "Create User"}
          </CustomButton>
        </div>
      </form>
    </PageContainer>
  );
}
