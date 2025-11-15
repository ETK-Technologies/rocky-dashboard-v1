"use client";

import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import {
  CustomButton,
  CustomCard,
  CustomCardContent,
  CustomCardFooter,
  CustomInput,
  CustomLabel,
  ErrorState,
  LoadingState,
} from "@/components/ui";
import { useAccountSettings } from "../hooks/useAccountSettings";
import { cn } from "@/utils/cn";

const PASSWORD_STRENGTH_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export function AccountSettingsForm() {
  const { settings, loading, error, saving, fetchSettings, updateSettings } =
    useAccountSettings();

  const [formData, setFormData] = useState({
    allowRegistrationAtCheckout: true,
    guestCheckoutEnabled: false,
    allowAccountDeletion: true,
    passwordStrengthRequired: "medium",
    dataRetentionDays: 365,
    gdprCheckboxText: "I agree to the Privacy Policy and Terms of Service",
    privacyPolicyUrl: "/privacy-policy",
    termsOfServiceUrl: "/terms-of-service",
    require2FAForAdmins: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (settings) {
      setFormData({
        allowRegistrationAtCheckout:
          settings.allowRegistrationAtCheckout ?? true,
        guestCheckoutEnabled: settings.guestCheckoutEnabled ?? false,
        allowAccountDeletion: settings.allowAccountDeletion ?? true,
        passwordStrengthRequired: settings.passwordStrengthRequired || "medium",
        dataRetentionDays: settings.dataRetentionDays || 365,
        gdprCheckboxText:
          settings.gdprCheckboxText ||
          "I agree to the Privacy Policy and Terms of Service",
        privacyPolicyUrl: settings.privacyPolicyUrl || "/privacy-policy",
        termsOfServiceUrl: settings.termsOfServiceUrl || "/terms-of-service",
        require2FAForAdmins: settings.require2FAForAdmins ?? false,
      });
    }
  }, [settings]);

  const validate = () => {
    const newErrors = {};

    if (
      !formData.passwordStrengthRequired ||
      !["low", "medium", "high"].includes(formData.passwordStrengthRequired)
    ) {
      newErrors.passwordStrengthRequired = "Invalid password strength";
    }

    if (
      !formData.dataRetentionDays ||
      formData.dataRetentionDays < 30 ||
      formData.dataRetentionDays > 3650
    ) {
      newErrors.dataRetentionDays =
        "Data retention days must be between 30 and 3650";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      await updateSettings(formData);
    } catch (err) {
      // Error already handled in hook
    }
  };

  if (loading) {
    return (
      <LoadingState
        message="Loading account settings..."
        loading={loading}
        fullScreen={false}
      />
    );
  }

  if (error && !settings) {
    return (
      <ErrorState
        title="Failed to load account settings"
        message={error}
        action={
          <CustomButton onClick={fetchSettings} disabled={loading}>
            Retry
          </CustomButton>
        }
      />
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <CustomCard>
        <CustomCardContent className="space-y-6 pt-5">
          {/* Account Creation */}
          <div className="space-y-4 border-b border-border pb-6">
            <h3 className="text-lg font-semibold">Account Creation</h3>

            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="allowRegistrationAtCheckout"
                  checked={formData.allowRegistrationAtCheckout}
                  onChange={(e) =>
                    handleChange(
                      "allowRegistrationAtCheckout",
                      e.target.checked
                    )
                  }
                  disabled={saving}
                  className={cn(
                    "mt-1 w-5 h-5 text-primary bg-background border-input rounded",
                    "focus:ring-primary focus:ring-2 cursor-pointer",
                    "disabled:cursor-not-allowed disabled:opacity-50"
                  )}
                />
                <div className="flex-1">
                  <CustomLabel
                    htmlFor="allowRegistrationAtCheckout"
                    className="cursor-pointer font-medium"
                  >
                    Allow Registration at Checkout
                  </CustomLabel>
                  <p className="text-xs text-muted-foreground mt-1">
                    Allow customers to create an account during checkout
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="guestCheckoutEnabled"
                  checked={formData.guestCheckoutEnabled}
                  onChange={(e) =>
                    handleChange("guestCheckoutEnabled", e.target.checked)
                  }
                  disabled={saving}
                  className={cn(
                    "mt-1 w-5 h-5 text-primary bg-background border-input rounded",
                    "focus:ring-primary focus:ring-2 cursor-pointer",
                    "disabled:cursor-not-allowed disabled:opacity-50"
                  )}
                />
                <div className="flex-1">
                  <CustomLabel
                    htmlFor="guestCheckoutEnabled"
                    className="cursor-pointer font-medium"
                  >
                    Guest Checkout Enabled
                  </CustomLabel>
                  <p className="text-xs text-muted-foreground mt-1">
                    Allow customers to checkout without creating an account
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="allowAccountDeletion"
                  checked={formData.allowAccountDeletion}
                  onChange={(e) =>
                    handleChange("allowAccountDeletion", e.target.checked)
                  }
                  disabled={saving}
                  className={cn(
                    "mt-1 w-5 h-5 text-primary bg-background border-input rounded",
                    "focus:ring-primary focus:ring-2 cursor-pointer",
                    "disabled:cursor-not-allowed disabled:opacity-50"
                  )}
                />
                <div className="flex-1">
                  <CustomLabel
                    htmlFor="allowAccountDeletion"
                    className="cursor-pointer font-medium"
                  >
                    Allow Account Deletion
                  </CustomLabel>
                  <p className="text-xs text-muted-foreground mt-1">
                    Allow customers to delete their accounts
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Password Settings */}
          <div className="space-y-4 border-b border-border pb-6">
            <h3 className="text-lg font-semibold">Password Settings</h3>

            <div className="space-y-2">
              <CustomLabel htmlFor="passwordStrengthRequired">
                Password Strength Required
              </CustomLabel>
              <select
                id="passwordStrengthRequired"
                value={formData.passwordStrengthRequired}
                onChange={(e) =>
                  handleChange("passwordStrengthRequired", e.target.value)
                }
                disabled={saving}
                className={cn(
                  "flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors",
                  "bg-white text-gray-900 border-gray-300",
                  "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2",
                  "focus:ring-blue-500 dark:focus:ring-blue-400",
                  "focus:border-blue-500 dark:focus:border-blue-400",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  "disabled:bg-gray-100 dark:disabled:bg-gray-900",
                  errors.passwordStrengthRequired &&
                    "border-red-500 dark:border-red-400"
                )}
              >
                {PASSWORD_STRENGTH_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.passwordStrengthRequired && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.passwordStrengthRequired}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Minimum password strength requirement for user accounts
              </p>
            </div>
          </div>

          {/* Data Retention */}
          <div className="space-y-4 border-b border-border pb-6">
            <h3 className="text-lg font-semibold">Data Retention</h3>

            <div className="space-y-2">
              <CustomLabel htmlFor="dataRetentionDays">
                Data Retention Days
              </CustomLabel>
              <CustomInput
                id="dataRetentionDays"
                type="number"
                min="30"
                max="3650"
                value={formData.dataRetentionDays}
                onChange={(e) =>
                  handleChange(
                    "dataRetentionDays",
                    parseInt(e.target.value) || 365
                  )
                }
                disabled={saving}
                error={errors.dataRetentionDays}
                className="max-w-xs"
              />
              {errors.dataRetentionDays && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.dataRetentionDays}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Number of days to retain user data (30-3650 days)
              </p>
            </div>
          </div>

          {/* Privacy & GDPR */}
          <div className="space-y-4 border-b border-border pb-6">
            <h3 className="text-lg font-semibold">Privacy & GDPR</h3>

            <div className="space-y-2">
              <CustomLabel htmlFor="gdprCheckboxText">
                GDPR Checkbox Text
              </CustomLabel>
              <CustomInput
                id="gdprCheckboxText"
                type="text"
                value={formData.gdprCheckboxText}
                onChange={(e) =>
                  handleChange("gdprCheckboxText", e.target.value)
                }
                disabled={saving}
                placeholder="I agree to the Privacy Policy and Terms of Service"
              />
              <p className="text-xs text-muted-foreground">
                Text to display in the GDPR consent checkbox
              </p>
            </div>

            <div className="space-y-2">
              <CustomLabel htmlFor="privacyPolicyUrl">
                Privacy Policy URL
              </CustomLabel>
              <CustomInput
                id="privacyPolicyUrl"
                type="text"
                value={formData.privacyPolicyUrl}
                onChange={(e) =>
                  handleChange("privacyPolicyUrl", e.target.value)
                }
                disabled={saving}
                placeholder="/privacy-policy"
              />
              <p className="text-xs text-muted-foreground">
                URL path to the privacy policy page
              </p>
            </div>

            <div className="space-y-2">
              <CustomLabel htmlFor="termsOfServiceUrl">
                Terms of Service URL
              </CustomLabel>
              <CustomInput
                id="termsOfServiceUrl"
                type="text"
                value={formData.termsOfServiceUrl}
                onChange={(e) =>
                  handleChange("termsOfServiceUrl", e.target.value)
                }
                disabled={saving}
                placeholder="/terms-of-service"
              />
              <p className="text-xs text-muted-foreground">
                URL path to the terms of service page
              </p>
            </div>
          </div>

          {/* Security */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Security</h3>

            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="require2FAForAdmins"
                  checked={formData.require2FAForAdmins}
                  onChange={(e) =>
                    handleChange("require2FAForAdmins", e.target.checked)
                  }
                  disabled={saving}
                  className={cn(
                    "mt-1 w-5 h-5 text-primary bg-background border-input rounded",
                    "focus:ring-primary focus:ring-2 cursor-pointer",
                    "disabled:cursor-not-allowed disabled:opacity-50"
                  )}
                />
                <div className="flex-1">
                  <CustomLabel
                    htmlFor="require2FAForAdmins"
                    className="cursor-pointer font-medium"
                  >
                    Require 2FA for Administrators
                  </CustomLabel>
                  <p className="text-xs text-muted-foreground mt-1">
                    Require two-factor authentication for all administrator
                    accounts
                  </p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </CustomCardContent>

        <CustomCardFooter>
          <div className="flex justify-end gap-3 w-full">
            <CustomButton
              type="submit"
              disabled={saving || loading}
              className="flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </CustomButton>
          </div>
        </CustomCardFooter>
      </CustomCard>
    </form>
  );
}
