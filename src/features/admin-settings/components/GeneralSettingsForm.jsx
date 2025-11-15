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
import { useGeneralSettings } from "../hooks/useGeneralSettings";
import { cn } from "@/utils/cn";

// Common timezones list
const TIMEZONES = [
  { value: "America/Toronto", label: "Eastern Time (America/Toronto)" },
  { value: "America/New_York", label: "Eastern Time (America/New_York)" },
  { value: "America/Chicago", label: "Central Time (America/Chicago)" },
  { value: "America/Denver", label: "Mountain Time (America/Denver)" },
  { value: "America/Los_Angeles", label: "Pacific Time (America/Los_Angeles)" },
  { value: "America/Vancouver", label: "Pacific Time (America/Vancouver)" },
  { value: "America/Halifax", label: "Atlantic Time (America/Halifax)" },
  { value: "America/St_Johns", label: "Newfoundland Time (America/St_Johns)" },
  { value: "Europe/London", label: "GMT (Europe/London)" },
  { value: "Europe/Paris", label: "CET (Europe/Paris)" },
  { value: "Europe/Berlin", label: "CET (Europe/Berlin)" },
  { value: "Asia/Tokyo", label: "JST (Asia/Tokyo)" },
  { value: "Asia/Shanghai", label: "CST (Asia/Shanghai)" },
  { value: "Asia/Dubai", label: "GST (Asia/Dubai)" },
  { value: "Australia/Sydney", label: "AEST (Australia/Sydney)" },
  { value: "UTC", label: "UTC" },
];

// Date format options
const DATE_FORMATS = [
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
  { value: "DD-MM-YYYY", label: "DD-MM-YYYY" },
  { value: "MM-DD-YYYY", label: "MM-DD-YYYY" },
];

// Time format options
const TIME_FORMATS = [
  { value: "12h", label: "12 hour (AM/PM)" },
  { value: "24h", label: "24 hour" },
];

export function GeneralSettingsForm() {
  const { settings, loading, error, saving, fetchSettings, updateSettings } =
    useGeneralSettings();

  const [formData, setFormData] = useState({
    timezone: "America/Toronto",
    dateFormat: "YYYY-MM-DD",
    timeFormat: "24h",
    itemsPerPage: 20,
    maintenanceMode: false,
  });

  const [errors, setErrors] = useState({});

  // Initialize form data when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormData({
        timezone: settings.timezone || "America/Toronto",
        dateFormat: settings.dateFormat || "YYYY-MM-DD",
        timeFormat: settings.timeFormat || "24h",
        itemsPerPage: settings.itemsPerPage || 20,
        maintenanceMode: settings.maintenanceMode || false,
      });
    }
  }, [settings]);

  // Validate form
  const validate = () => {
    const newErrors = {};

    if (!formData.timezone) {
      newErrors.timezone = "Timezone is required";
    }

    if (!formData.dateFormat) {
      newErrors.dateFormat = "Date format is required";
    }

    if (!formData.timeFormat) {
      newErrors.timeFormat = "Time format is required";
    }

    if (
      !formData.itemsPerPage ||
      formData.itemsPerPage < 10 ||
      formData.itemsPerPage > 100
    ) {
      newErrors.itemsPerPage = "Items per page must be between 10 and 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle form submission
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
        message="Loading general settings..."
        loading={loading}
        fullScreen={false}
      />
    );
  }

  if (error && !settings) {
    return (
      <ErrorState
        title="Failed to load general settings"
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
          {/* Timezone */}
          <div className="space-y-2">
            <CustomLabel htmlFor="timezone">
              Timezone <span className="text-red-600">*</span>
            </CustomLabel>
            <select
              id="timezone"
              value={formData.timezone}
              onChange={(e) => handleChange("timezone", e.target.value)}
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
                errors.timezone && "border-red-500 dark:border-red-400"
              )}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
            {errors.timezone && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.timezone}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Select your timezone for date and time display
            </p>
          </div>

          {/* Date Format */}
          <div className="space-y-2">
            <CustomLabel htmlFor="dateFormat">
              Date Format <span className="text-red-600">*</span>
            </CustomLabel>
            <select
              id="dateFormat"
              value={formData.dateFormat}
              onChange={(e) => handleChange("dateFormat", e.target.value)}
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
                errors.dateFormat && "border-red-500 dark:border-red-400"
              )}
            >
              {DATE_FORMATS.map((format) => (
                <option key={format.value} value={format.value}>
                  {format.label}
                </option>
              ))}
            </select>
            {errors.dateFormat && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.dateFormat}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Choose how dates are displayed throughout the system
            </p>
          </div>

          {/* Time Format */}
          <div className="space-y-2">
            <CustomLabel htmlFor="timeFormat">
              Time Format <span className="text-red-600">*</span>
            </CustomLabel>
            <select
              id="timeFormat"
              value={formData.timeFormat}
              onChange={(e) => handleChange("timeFormat", e.target.value)}
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
                errors.timeFormat && "border-red-500 dark:border-red-400"
              )}
            >
              {TIME_FORMATS.map((format) => (
                <option key={format.value} value={format.value}>
                  {format.label}
                </option>
              ))}
            </select>
            {errors.timeFormat && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.timeFormat}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Choose between 12-hour or 24-hour time format
            </p>
          </div>

          {/* Items Per Page */}
          <div className="space-y-2">
            <CustomLabel htmlFor="itemsPerPage">
              Items Per Page <span className="text-red-600">*</span>
            </CustomLabel>
            <CustomInput
              id="itemsPerPage"
              type="number"
              min="10"
              max="100"
              value={formData.itemsPerPage}
              onChange={(e) =>
                handleChange("itemsPerPage", parseInt(e.target.value) || 20)
              }
              disabled={saving}
              error={errors.itemsPerPage}
              className="max-w-xs"
            />
            {errors.itemsPerPage && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.itemsPerPage}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Default number of items per page for pagination (10-100)
            </p>
          </div>

          {/* Maintenance Mode */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="maintenanceMode"
                checked={formData.maintenanceMode}
                onChange={(e) =>
                  handleChange("maintenanceMode", e.target.checked)
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
                  htmlFor="maintenanceMode"
                  className="cursor-pointer font-medium"
                >
                  Maintenance Mode
                </CustomLabel>
                <p className="text-xs text-muted-foreground mt-1">
                  When enabled, the site will be unavailable to visitors except
                  administrators. Use this when performing updates or
                  maintenance.
                </p>
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </CustomCardContent>

        {/* Footer with Save button */}
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
