"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, X } from "lucide-react";
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
import {
  getUserRoleSlugs,
  slugToAppRole,
  appRoleToSlug,
  apiRoleToApp,
} from "../utils/roleMap";
import { userService } from "../services/userService";
import { LoadingState, ErrorState } from "@/components/ui";
import { cn } from "@/utils/cn";

// Available roles - match the app role values exactly
const AVAILABLE_ROLES = [
  { value: "customer", label: "Customer", slug: "customer" },
  { value: "admin", label: "Admin", slug: "admin" },
  { value: "super_admin", label: "Super Admin", slug: "super-admin" },
  { value: "doctor", label: "Doctor", slug: "doctor" },
  { value: "nurse", label: "Nurse", slug: "nurse" },
  { value: "pharmacy", label: "Pharmacy", slug: "pharmacy" },
  {
    value: "clinical_assistant",
    label: "Clinical Assistant",
    slug: "clinical-assistant",
  },
  {
    value: "customer_support",
    label: "Customer Support",
    slug: "customer-support",
  },
  { value: "author", label: "Author", slug: "author" },
];

const schema = z.object({
  // Required fields for create
  email: z
    .string()
    .email("Invalid email address")
    .min(1, "Email is required")
    .optional(),
  firstName: z.string().min(1, "First name is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
  roles: z
    .array(
      z.enum([
        "customer",
        "admin",
        "super_admin",
        "doctor",
        "nurse",
        "pharmacy",
        "clinical_assistant",
        "customer_support",
        "author",
      ])
    )
    .min(1, "At least one role is required"),

  // Optional fields
  lastName: z.string().optional().or(z.literal("")),
  wordpressId: z.number().optional().or(z.null()),
  phone: z.string().optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  gender: z
    .enum(["male", "female", "other", "prefer_not_to_say"])
    .optional()
    .or(z.null()),
  avatar: z.string().url("Invalid URL").optional().or(z.literal("")),
  locale: z.string().optional(),
  timezone: z.string().optional(),

  // Optional flags
  isActive: z.boolean().optional(),
  twoFactorEnabled: z.boolean().optional(),
  marketingOptIn: z.boolean().optional(),
  smsOptIn: z.boolean().optional(),
});

export function UserForm({ userId = null }) {
  const isEdit = !!userId && userId !== "new";
  const { createUser, updateUser } = useUsers();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef(null);

  // Create schema based on mode
  // For create: email and password are required
  // For edit: email is optional (read-only), password is not allowed
  const formSchema = isEdit
    ? schema.omit({ password: true, wordpressId: true }).extend({
        email: z
          .string()
          .email("Invalid email address")
          .optional()
          .or(z.literal("")),
      })
    : schema.extend({
        password: z.string().min(6, "Password must be at least 6 characters"),
        email: z
          .string()
          .email("Invalid email address")
          .min(1, "Email is required"),
      });

  // Load user data when in edit mode
  useEffect(() => {
    let mounted = true;
    async function loadUser() {
      if (!isEdit || !userId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await userService.getUser(userId);
        if (mounted) {
          setUserData(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err?.message || "Failed to load user");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    loadUser();
    return () => {
      mounted = false;
    };
  }, [userId, isEdit]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      roles: ["customer"],
      phone: "",
      dateOfBirth: "",
      gender: null,
      avatar: "",
      locale: "en",
      timezone: "America/Toronto",
      isActive: true,
      twoFactorEnabled: false,
      marketingOptIn: false,
      smsOptIn: false,
      wordpressId: undefined,
    },
  });

  // Update form when userData is loaded
  useEffect(() => {
    if (userData) {
      // Extract all roles from userRoles array
      let roles = ["customer"]; // Default role

      if (
        userData.userRoles &&
        Array.isArray(userData.userRoles) &&
        userData.userRoles.length > 0
      ) {
        // Extract all role slugs and convert to app role format
        roles = userData.userRoles
          .map((ur) => {
            const slug = ur?.role?.slug;
            return slug ? slugToAppRole(slug) : null;
          })
          .filter((role) => role !== null);

        // If no roles found, use default
        if (roles.length === 0) {
          roles = ["customer"];
        }
      } else if (userData.role) {
        // Fallback to single role if userRoles array is empty
        // Normalize the role to app format
        const normalizedRole =
          slugToAppRole(userData.role) ||
          apiRoleToApp(userData.role) ||
          "customer";
        roles = [normalizedRole];
      }

      form.reset({
        email: userData.email || "",
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        password: "", // Never pre-fill password
        roles,
        phone: userData.phone || "",
        dateOfBirth: userData.dateOfBirth
          ? new Date(userData.dateOfBirth).toISOString().split("T")[0]
          : "",
        gender: userData.gender || null,
        avatar: userData.avatar || "",
        locale: userData.locale || "en",
        timezone: userData.timezone || "America/Toronto",
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        twoFactorEnabled: userData.twoFactorEnabled || false,
        marketingOptIn: userData.marketingOptIn || false,
        smsOptIn: userData.smsOptIn || false,
        wordpressId: userData.wordpressId || undefined,
      });
    }
  }, [userData, form]);

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const payload = { ...values };

      // Ensure roles array is present and valid
      if (
        !payload.roles ||
        !Array.isArray(payload.roles) ||
        payload.roles.length === 0
      ) {
        form.setError("roles", {
          type: "manual",
          message: "At least one role is required",
        });
        setIsSubmitting(false);
        return;
      }

      // Service will handle conversion of roles array to slugs
      // Keep roles as array, service will convert app roles to API slugs

      // Remove empty optional fields
      const fieldsToClean = [
        "password",
        "lastName",
        "phone",
        "dateOfBirth",
        "gender",
        "avatar",
        "locale",
        "timezone",
        "wordpressId",
      ];

      fieldsToClean.forEach((field) => {
        if (
          payload[field] === "" ||
          payload[field] === null ||
          payload[field] === undefined
        ) {
          delete payload[field];
        }
      });

      // Don't send email when editing (it's disabled and shouldn't be changed)
      if (isEdit) {
        delete payload.email;
        delete payload.password;
        delete payload.wordpressId;
        // Only send allowed fields for update: firstName, lastName, isActive, roles
        // Remove other fields that aren't allowed in update
        const allowedUpdateFields = [
          "firstName",
          "lastName",
          "isActive",
          "roles",
        ];
        Object.keys(payload).forEach((key) => {
          if (!allowedUpdateFields.includes(key)) {
            delete payload[key];
          }
        });
      } else {
        // For create, ensure password is present and valid
        if (!payload.password || payload.password.length < 6) {
          form.setError("password", {
            type: "manual",
            message: "Password is required and must be at least 6 characters",
          });
          setIsSubmitting(false);
          return;
        }
        // Roles validation is already done above
      }

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

  // Handle role toggle
  const handleRoleToggle = (roleValue) => {
    const currentRoles = form.getValues("roles") || [];
    const newRoles = currentRoles.includes(roleValue)
      ? currentRoles.filter((r) => r !== roleValue)
      : [...currentRoles, roleValue];
    form.setValue("roles", newRoles, { shouldValidate: true });
  };

  // Handle dropdown open/close
  const closeRoleDropdown = () => setRoleDropdownOpen(false);
  const toggleRoleDropdown = () => setRoleDropdownOpen((prev) => !prev);

  // Handle click outside and escape key
  useEffect(() => {
    if (!roleDropdownOpen) {
      return;
    }

    const handleClickOutside = (event) => {
      if (
        roleDropdownRef.current &&
        !roleDropdownRef.current.contains(event.target)
      ) {
        setRoleDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setRoleDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [roleDropdownOpen]);

  // Show loading state
  if (loading) {
    return (
      <PageContainer>
        <PageHeader title={isEdit ? "Edit User" : "Create User"} />
        <div className="flex items-center justify-center min-h-[40vh]">
          <LoadingState message="Loading user..." />
        </div>
      </PageContainer>
    );
  }

  // Show error state
  if (error) {
    return (
      <PageContainer>
        <PageHeader title={isEdit ? "Edit User" : "Create User"} />
        <ErrorState
          title="Failed to load user"
          message={error}
          action={
            <CustomButton
              onClick={() => router.push("/dashboard/super-admin/users")}
            >
              Back to Users
            </CustomButton>
          }
        />
      </PageContainer>
    );
  }

  // Get current form values for display
  const formValues = form.watch();
  const selectedRoles = formValues.roles || [];

  return (
    <PageContainer>
      <PageHeader title={isEdit ? "Edit User" : "Create User"} />
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 max-w-3xl"
      >
        {/* Read-only user information (Edit mode only) */}
        {isEdit && userData && (
          <>
            <div className="space-y-4">
              <SectionHeader title="User Information (Read-only)" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div>
                  <CustomLabel className="text-sm text-muted-foreground">
                    Email
                  </CustomLabel>
                  <p className="text-sm font-medium">{userData.email || "-"}</p>
                </div>
                <div>
                  <CustomLabel className="text-sm text-muted-foreground">
                    Phone
                  </CustomLabel>
                  <p className="text-sm font-medium">{userData.phone || "-"}</p>
                </div>
                <div>
                  <CustomLabel className="text-sm text-muted-foreground">
                    Date of Birth
                  </CustomLabel>
                  <p className="text-sm font-medium">
                    {userData.dateOfBirth
                      ? new Date(userData.dateOfBirth).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
                <div>
                  <CustomLabel className="text-sm text-muted-foreground">
                    Gender
                  </CustomLabel>
                  <p className="text-sm font-medium">
                    {userData.gender
                      ? userData.gender.charAt(0).toUpperCase() +
                        userData.gender.slice(1)
                      : "-"}
                  </p>
                </div>
                <div>
                  <CustomLabel className="text-sm text-muted-foreground">
                    Locale
                  </CustomLabel>
                  <p className="text-sm font-medium">
                    {userData.locale || "en"}
                  </p>
                </div>
                <div>
                  <CustomLabel className="text-sm text-muted-foreground">
                    Timezone
                  </CustomLabel>
                  <p className="text-sm font-medium">
                    {userData.timezone || "America/Toronto"}
                  </p>
                </div>
                <div>
                  <CustomLabel className="text-sm text-muted-foreground">
                    WordPress ID
                  </CustomLabel>
                  <p className="text-sm font-medium">
                    {userData.wordpressId || "-"}
                  </p>
                </div>
                <div>
                  <CustomLabel className="text-sm text-muted-foreground">
                    Roles
                  </CustomLabel>
                  <p className="text-sm font-medium">
                    {userData.userRoles &&
                    Array.isArray(userData.userRoles) &&
                    userData.userRoles.length > 0
                      ? userData.userRoles
                          .map(
                            (ur) =>
                              ur?.role?.name || ur?.role?.slug || "Unknown"
                          )
                          .join(", ")
                      : "-"}
                  </p>
                </div>
                <div>
                  <CustomLabel className="text-sm text-muted-foreground">
                    Two-Factor Enabled
                  </CustomLabel>
                  <p className="text-sm font-medium">
                    {userData.twoFactorEnabled ? "Yes" : "No"}
                  </p>
                </div>
                <div>
                  <CustomLabel className="text-sm text-muted-foreground">
                    Marketing Opt-in
                  </CustomLabel>
                  <p className="text-sm font-medium">
                    {userData.marketingOptIn ? "Yes" : "No"}
                  </p>
                </div>
                <div>
                  <CustomLabel className="text-sm text-muted-foreground">
                    SMS Opt-in
                  </CustomLabel>
                  <p className="text-sm font-medium">
                    {userData.smsOptIn ? "Yes" : "No"}
                  </p>
                </div>
                <div>
                  <CustomLabel className="text-sm text-muted-foreground">
                    Created At
                  </CustomLabel>
                  <p className="text-sm font-medium">
                    {userData.createdAt
                      ? new Date(userData.createdAt).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
                <div>
                  <CustomLabel className="text-sm text-muted-foreground">
                    Last Login
                  </CustomLabel>
                  <p className="text-sm font-medium">
                    {userData.lastLoginAt
                      ? new Date(userData.lastLoginAt).toLocaleDateString()
                      : "Never"}
                  </p>
                </div>
                {userData.avatar && (
                  <div className="md:col-span-2">
                    <CustomLabel className="text-sm text-muted-foreground">
                      Avatar
                    </CustomLabel>
                    <div className="mt-2">
                      <img
                        src={userData.avatar}
                        alt="User avatar"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <Divider />
          </>
        )}

        {/* Required Information */}
        <div className="space-y-4">
          <SectionHeader
            title={isEdit ? "Editable Information" : "User Information"}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <CustomLabel htmlFor="email">
                Email <span className="text-red-500">*</span>
              </CustomLabel>
              <CustomInput
                id="email"
                type="email"
                {...form.register("email")}
                error={form.formState.errors.email}
                disabled={isEdit}
              />
              {form.formState.errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

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
              <CustomLabel htmlFor="roles">
                Roles <span className="text-red-500">*</span>
              </CustomLabel>
              <div className="relative" ref={roleDropdownRef}>
                <button
                  type="button"
                  id="roles"
                  name="roles"
                  onClick={toggleRoleDropdown}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors",
                    "bg-white text-foreground border-gray-200",
                    "dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                    "focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400"
                  )}
                  aria-haspopup="listbox"
                  aria-expanded={roleDropdownOpen}
                >
                  <span className="truncate text-left">
                    {selectedRoles.length === 0
                      ? "Select roles"
                      : AVAILABLE_ROLES.filter((role) =>
                          selectedRoles.includes(role.value)
                        )
                          .map((role) => role.label)
                          .join(", ")}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>

                {roleDropdownOpen && (
                  <div
                    className={cn(
                      "absolute left-0 right-0 z-50 mt-2 max-h-64 overflow-y-auto rounded-md border shadow-lg",
                      "bg-white text-foreground border-gray-200",
                      "dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
                    )}
                    role="listbox"
                    aria-multiselectable="true"
                  >
                    <div className="py-1">
                      {AVAILABLE_ROLES.map((roleOption) => {
                        const selected = selectedRoles.includes(
                          roleOption.value
                        );

                        return (
                          <label
                            key={roleOption.value}
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
                              onChange={() =>
                                handleRoleToggle(roleOption.value)
                              }
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:focus:ring-blue-400"
                            />
                            <span className="truncate">{roleOption.label}</span>
                          </label>
                        );
                      })}
                    </div>
                    <div className="border-t border-gray-200/80 p-2 text-right dark:border-gray-700">
                      <button
                        type="button"
                        onClick={closeRoleDropdown}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {selectedRoles.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2 rounded-md border border-dashed border-gray-200 bg-gray-50 p-3 text-sm text-foreground dark:border-gray-700 dark:bg-gray-900">
                  {AVAILABLE_ROLES.filter((role) =>
                    selectedRoles.includes(role.value)
                  ).map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => handleRoleToggle(role.value)}
                      className={cn(
                        "flex items-center gap-2 rounded-full border px-3 py-1 font-medium transition-colors",
                        "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200",
                        "dark:bg-blue-500/20 dark:text-blue-200 dark:border-blue-500/40 dark:hover:bg-blue-500/30"
                      )}
                    >
                      <span className="truncate">{role.label}</span>
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ))}
                </div>
              )}
              {form.formState.errors.roles && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.roles.message}
                </p>
              )}
              {selectedRoles.length > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedRoles.length} role
                  {selectedRoles.length > 1 ? "s" : ""} selected
                </p>
              )}
            </div>

            {!isEdit && (
              <div>
                <CustomLabel htmlFor="wordpressId">WordPress ID</CustomLabel>
                <CustomInput
                  id="wordpressId"
                  type="number"
                  {...form.register("wordpressId", { valueAsNumber: true })}
                  error={form.formState.errors.wordpressId}
                />
                {form.formState.errors.wordpressId && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.wordpressId.message}
                  </p>
                )}
              </div>
            )}

            <div>
              <CustomLabel htmlFor="phone">Phone</CustomLabel>
              <CustomInput
                id="phone"
                type="tel"
                {...form.register("phone")}
                error={form.formState.errors.phone}
                disabled={isEdit}
              />
            </div>

            <div>
              <CustomLabel htmlFor="dateOfBirth">Date of Birth</CustomLabel>
              <CustomInput
                id="dateOfBirth"
                type="date"
                {...form.register("dateOfBirth")}
                error={form.formState.errors.dateOfBirth}
                disabled={isEdit}
              />
            </div>

            <div>
              <CustomLabel htmlFor="gender">Gender</CustomLabel>
              <select
                id="gender"
                className="w-full border rounded-md h-10 px-3 bg-white text-gray-900 border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                {...form.register("gender")}
                disabled={isEdit}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <CustomLabel htmlFor="avatar">Avatar URL</CustomLabel>
              <CustomInput
                id="avatar"
                type="url"
                {...form.register("avatar")}
                error={form.formState.errors.avatar}
                placeholder="https://example.com/avatar.jpg"
                disabled={isEdit}
              />
            </div>

            <div>
              <CustomLabel htmlFor="locale">Locale</CustomLabel>
              <select
                id="locale"
                className="w-full border rounded-md h-10 px-3 bg-white text-gray-900 border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                {...form.register("locale")}
                disabled={isEdit}
              >
                <option value="en">English</option>
                <option value="fr">French</option>
                <option value="es">Spanish</option>
                <option value="de">German</option>
              </select>
            </div>

            <div>
              <CustomLabel htmlFor="timezone">Timezone</CustomLabel>
              <select
                id="timezone"
                className="w-full border rounded-md h-10 px-3 bg-white text-gray-900 border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                {...form.register("timezone")}
                disabled={isEdit}
              >
                <option value="America/Toronto">America/Toronto</option>
                <option value="America/New_York">America/New_York</option>
                <option value="America/Los_Angeles">America/Los_Angeles</option>
                <option value="Europe/London">Europe/London</option>
                <option value="Europe/Paris">Europe/Paris</option>
                <option value="Asia/Tokyo">Asia/Tokyo</option>
              </select>
            </div>
          </div>
        </div>

        <Divider />

        {/* Account Settings */}
        <div className="space-y-4">
          <SectionHeader title="Account Settings" />
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
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="twoFactorEnabled"
                {...form.register("twoFactorEnabled")}
                className="w-4 h-4 rounded border-gray-300"
                disabled={isEdit}
              />
              <CustomLabel
                htmlFor="twoFactorEnabled"
                className="font-normal cursor-pointer"
              >
                Two-factor authentication enabled
              </CustomLabel>
            </div>
          </div>
        </div>

        <Divider />

        {/* Marketing & Communications */}
        <div className="space-y-4">
          <SectionHeader title="Marketing & Communications" />
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="marketingOptIn"
                {...form.register("marketingOptIn")}
                className="w-4 h-4 rounded border-gray-300"
                disabled={isEdit}
              />
              <CustomLabel
                htmlFor="marketingOptIn"
                className="font-normal cursor-pointer"
              >
                Marketing communications opt-in
              </CustomLabel>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="smsOptIn"
                {...form.register("smsOptIn")}
                className="w-4 h-4 rounded border-gray-300"
                disabled={isEdit}
              />
              <CustomLabel
                htmlFor="smsOptIn"
                className="font-normal cursor-pointer"
              >
                SMS communications opt-in
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
