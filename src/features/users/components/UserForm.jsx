"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronDown,
  X,
  User,
  Mail,
  Lock,
  Shield,
  Settings,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  CustomButton,
  CustomInput,
  CustomLabel,
  PageContainer,
  PageHeader,
  SectionHeader,
  Divider,
  CustomCard,
  CustomCardHeader,
  CustomCardTitle,
  CustomCardContent,
} from "@/components/ui";
import { useUsers } from "../hooks/useUsers";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  getUserRoleSlugs,
  slugToAppRole,
  appRoleToSlug,
  apiRoleToApp,
} from "../utils/roleMap";
import { userService } from "../services/userService";
import { LoadingState, ErrorState } from "@/components/ui";
import { cn } from "@/utils/cn";
import { useRoles } from "@/features/roles/hooks/useRoles";

// Create dynamic schema based on available roles
const createSchema = (availableRoles) => {
  const roleSlugs = availableRoles.map((role) => role.slug);
  return z.object({
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
      .array(z.enum(roleSlugs.length > 0 ? roleSlugs : ["customer"]))
      .min(1, "At least one role is required"),

    // Optional fields
    lastName: z.string().optional().or(z.literal("")),
    wordpressId: z.number().optional().or(z.null()),
    phone: z.string().optional().or(z.literal("")),
    dateOfBirth: z.string().optional().or(z.literal("")),
    gender: z.enum(["MALE", "FEMALE"]).optional().or(z.null()),
    locale: z.string().optional(),
    timezone: z.string().optional(),

    // Optional flags
    isActive: z.boolean().optional(),
    twoFactorEnabled: z.boolean().optional(),
    marketingOptIn: z.boolean().optional(),
    smsOptIn: z.boolean().optional(),
  });
};

export function UserForm({ userId = null }) {
  const isEdit = !!userId && userId !== "new";
  const { createUser, updateUser } = useUsers();
  const { roles: apiRoles, fetchRoles, isLoading: rolesLoading } = useRoles();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);

  // Fetch roles on mount
  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Transform API roles to form format
  const availableRoles = apiRoles
    .filter((role) => role.isActive !== false) // Only show active roles
    .map((role) => ({
      value: role.slug,
      label: role.name,
      slug: role.slug,
    }));

  // Create schema with available roles
  const baseSchema = createSchema(availableRoles);

  // Create schema based on mode
  // For create: email and password are required
  // For edit: email is optional (read-only), password is not allowed
  const formSchema = isEdit
    ? baseSchema.omit({ password: true, wordpressId: true }).extend({
        email: z
          .string()
          .email("Invalid email address")
          .optional()
          .or(z.literal("")),
      })
    : baseSchema.extend({
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

      // Clean up payload for edit mode
      if (isEdit) {
        delete payload.password;
        delete payload.wordpressId;
        delete payload.email; // Email cannot be changed after account creation
        // Allowed fields for update - all user information can be updated except email
        const allowedUpdateFields = [
          "firstName",
          "lastName",
          "phone",
          "dateOfBirth",
          "gender",
          "locale",
          "timezone",
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
        router.push("/dashboard/users");
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
            <CustomButton onClick={() => router.push("/dashboard/users")}>
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
        className="flex flex-col lg:flex-row gap-6"
      >
        {/* Left Section - Main Form */}
        <div className="flex-1 space-y-6">
          {/* Editable Information */}
          <CustomCard>
            <CustomCardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <CustomCardTitle>
                  {isEdit ? "Edit User Details" : "User Information"}
                </CustomCardTitle>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {isEdit
                  ? "Update user information and settings"
                  : "Enter user details to create a new account"}
              </p>
            </CustomCardHeader>
            <CustomCardContent className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Basic Information
                  </h3>
                </div>
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
                </div>
              </div>

              {/* Authentication */}
              {!isEdit && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-foreground">
                      Authentication
                    </h3>
                  </div>
                  <div>
                    <CustomLabel htmlFor="password">
                      Password <span className="text-red-500">*</span>
                    </CustomLabel>
                    <div className="relative">
                      <CustomInput
                        id="password"
                        type={showPassword ? "text" : "password"}
                        {...form.register("password")}
                        error={form.formState.errors.password}
                        placeholder="Enter password (min. 6 characters)"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {form.formState.errors.password && (
                      <p className="text-red-500 text-sm mt-1">
                        {form.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Settings */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Additional Settings
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {!isEdit && (
                    <div>
                      <CustomLabel htmlFor="wordpressId">
                        WordPress ID
                      </CustomLabel>
                      <CustomInput
                        id="wordpressId"
                        type="number"
                        {...form.register("wordpressId", {
                          valueAsNumber: true,
                        })}
                        error={form.formState.errors.wordpressId}
                        placeholder="Optional WordPress user ID"
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
                    />
                  </div>

                  <div>
                    <CustomLabel htmlFor="dateOfBirth">
                      Date of Birth
                    </CustomLabel>
                    <CustomInput
                      id="dateOfBirth"
                      type="date"
                      {...form.register("dateOfBirth")}
                      error={form.formState.errors.dateOfBirth}
                    />
                  </div>

                  <div>
                    <CustomLabel htmlFor="gender">Gender</CustomLabel>
                    <select
                      id="gender"
                      className="w-full border rounded-md h-10 px-3 bg-white text-gray-900 border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 focus-visible:border-blue-500 dark:focus-visible:border-blue-400"
                      {...form.register("gender")}
                    >
                      <option value="">Select gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                    </select>
                  </div>

                  <div>
                    <CustomLabel htmlFor="locale">Locale</CustomLabel>
                    <select
                      id="locale"
                      className="w-full border rounded-md h-10 px-3 bg-white text-gray-900 border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 focus-visible:border-blue-500 dark:focus-visible:border-blue-400"
                      {...form.register("locale")}
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
                      className="w-full border rounded-md h-10 px-3 bg-white text-gray-900 border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 focus-visible:border-blue-500 dark:focus-visible:border-blue-400"
                      {...form.register("timezone")}
                    >
                      <option value="America/Toronto">America/Toronto</option>
                      <option value="America/New_York">America/New_York</option>
                      <option value="America/Los_Angeles">
                        America/Los_Angeles
                      </option>
                      <option value="Europe/London">Europe/London</option>
                      <option value="Europe/Paris">Europe/Paris</option>
                      <option value="Asia/Tokyo">Asia/Tokyo</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 flex items-center gap-2 p-3 rounded-lg border border-border bg-gray-50 dark:bg-gray-900">
                    <input
                      type="checkbox"
                      id="isActive"
                      {...form.register("isActive")}
                      className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 cursor-pointer"
                    />
                    <CustomLabel
                      htmlFor="isActive"
                      className="cursor-pointer font-medium"
                    >
                      User is active
                    </CustomLabel>
                  </div>
                </div>
              </div>
            </CustomCardContent>
          </CustomCard>
        </div>

        {/* Right Section - Roles & Permissions + Actions */}
        <div className="lg:w-80 xl:w-96 flex-shrink-0 space-y-6">
          <CustomCard>
            <CustomCardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <CustomCardTitle>Roles & Permissions</CustomCardTitle>
              </div>
            </CustomCardHeader>
            <CustomCardContent className="space-y-4">
              <div>
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
                        : availableRoles
                            .filter((role) =>
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
                        {availableRoles.length === 0 ? (
                          <div className="px-3 py-2 text-sm text-muted-foreground">
                            {rolesLoading
                              ? "Loading roles..."
                              : "No roles available"}
                          </div>
                        ) : (
                          availableRoles.map((roleOption) => {
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
                                <span className="truncate">
                                  {roleOption.label}
                                </span>
                              </label>
                            );
                          })
                        )}
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
                    {availableRoles
                      .filter((role) => selectedRoles.includes(role.value))
                      .map((role) => (
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
            </CustomCardContent>
          </CustomCard>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <CustomButton
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                <>
                  <Save className="h-4 w-4" />
                  Update User
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Create User
                </>
              )}
            </CustomButton>
            <CustomButton
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/users")}
              disabled={isSubmitting}
              className="w-full"
            >
              Cancel
            </CustomButton>
          </div>
        </div>
      </form>
    </PageContainer>
  );
}
