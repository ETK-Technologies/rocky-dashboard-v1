"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, X } from "lucide-react";
import {
  CustomButton,
  CustomCard,
  CustomCardContent,
  CustomCardDescription,
  CustomCardFooter,
  CustomCardHeader,
  CustomCardTitle,
  CustomInput,
  CustomLabel,
  CustomTextarea,
  ErrorState,
  LoadingState,
} from "@/components/ui";
import { useStoreSettings } from "../hooks/useStoreSettings";
import { cn } from "@/utils/cn";

// Common currencies (ISO 4217)
const CURRENCIES = [
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "AUD", label: "AUD - Australian Dollar" },
  { value: "JPY", label: "JPY - Japanese Yen" },
  { value: "CNY", label: "CNY - Chinese Yuan" },
  { value: "INR", label: "INR - Indian Rupee" },
  { value: "MXN", label: "MXN - Mexican Peso" },
  { value: "BRL", label: "BRL - Brazilian Real" },
];

// Common countries (ISO 3166-1 alpha-2)
const COUNTRIES = [
  { value: "CA", label: "Canada" },
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "AU", label: "Australia" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "IT", label: "Italy" },
  { value: "ES", label: "Spain" },
  { value: "NL", label: "Netherlands" },
  { value: "BE", label: "Belgium" },
  { value: "CH", label: "Switzerland" },
  { value: "AT", label: "Austria" },
  { value: "SE", label: "Sweden" },
  { value: "NO", label: "Norway" },
  { value: "DK", label: "Denmark" },
  { value: "FI", label: "Finland" },
  { value: "PL", label: "Poland" },
  { value: "IE", label: "Ireland" },
  { value: "PT", label: "Portugal" },
  { value: "GR", label: "Greece" },
  { value: "JP", label: "Japan" },
  { value: "CN", label: "China" },
  { value: "IN", label: "India" },
  { value: "MX", label: "Mexico" },
  { value: "BR", label: "Brazil" },
  { value: "AR", label: "Argentina" },
  { value: "ZA", label: "South Africa" },
  { value: "NZ", label: "New Zealand" },
  { value: "SG", label: "Singapore" },
  { value: "HK", label: "Hong Kong" },
];

export function StoreSettingsForm() {
  const { settings, loading, error, saving, fetchSettings, updateSettings } =
    useStoreSettings();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    defaultCurrency: "CAD",
    supportedCurrencies: [],
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "CA",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [currencyInput, setCurrencyInput] = useState("");

  // Initialize form data when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormData({
        name: settings.name || "",
        description: settings.description || "",
        defaultCurrency: settings.defaultCurrency || "CAD",
        supportedCurrencies: settings.supportedCurrencies || [],
        addressLine1: settings.addressLine1 || "",
        addressLine2: settings.addressLine2 || "",
        city: settings.city || "",
        state: settings.state || "",
        postalCode: settings.postalCode || "",
        country: settings.country || "CA",
        email: settings.email || "",
        phone: settings.phone || "",
      });
    }
  }, [settings]);

  // Validate form
  const validate = () => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Store name is required";
    }

    if (!formData.defaultCurrency) {
      newErrors.defaultCurrency = "Default currency is required";
    }

    if (formData.supportedCurrencies.length === 0) {
      newErrors.supportedCurrencies =
        "At least one supported currency is required";
    }

    if (!formData.country) {
      newErrors.country = "Country is required";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
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

  // Handle currency input
  const handleCurrencyAdd = (e) => {
    e.preventDefault();
    const currency = currencyInput.trim().toUpperCase();
    if (currency && !formData.supportedCurrencies.includes(currency)) {
      // Validate currency code
      const isValidCurrency = CURRENCIES.some((c) => c.value === currency);
      if (isValidCurrency) {
        handleChange("supportedCurrencies", [
          ...formData.supportedCurrencies,
          currency,
        ]);
        setCurrencyInput("");
      } else {
        setErrors((prev) => ({
          ...prev,
          supportedCurrencies: "Invalid currency code",
        }));
      }
    }
  };

  // Remove currency
  const handleCurrencyRemove = (currency) => {
    handleChange(
      "supportedCurrencies",
      formData.supportedCurrencies.filter((c) => c !== currency)
    );
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
        message="Loading store settings..."
        loading={loading}
        fullScreen={false}
      />
    );
  }

  if (error && !settings) {
    return (
      <ErrorState
        title="Failed to load store settings"
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
        <CustomCardHeader>
          <CustomCardTitle>Store Information</CustomCardTitle>
        </CustomCardHeader>
        <CustomCardContent className="space-y-6">
          {/* Store Name */}
          <div className="space-y-2">
            <CustomLabel htmlFor="name">
              Store Name <span className="text-red-600">*</span>
            </CustomLabel>
            <CustomInput
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              disabled={saving}
              error={errors.name}
              placeholder="Rocky E-commerce"
            />
            {errors.name && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.name}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              The name of your store as it appears to customers
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <CustomLabel htmlFor="description">Description</CustomLabel>
            <CustomTextarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              disabled={saving}
              rows={3}
              placeholder="Your trusted online pharmacy"
            />
            <p className="text-xs text-muted-foreground">
              A brief description of your store
            </p>
          </div>

          {/* Currency Settings */}
          <div className="space-y-4 border-t border-border pt-6">
            <h3 className="text-lg font-semibold">Currency Settings</h3>

            {/* Default Currency */}
            <div className="space-y-2">
              <CustomLabel htmlFor="defaultCurrency">
                Default Currency <span className="text-red-600">*</span>
              </CustomLabel>
              <select
                id="defaultCurrency"
                value={formData.defaultCurrency}
                onChange={(e) =>
                  handleChange("defaultCurrency", e.target.value)
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
                  errors.defaultCurrency && "border-red-500 dark:border-red-400"
                )}
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency.value} value={currency.value}>
                    {currency.label}
                  </option>
                ))}
              </select>
              {errors.defaultCurrency && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.defaultCurrency}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                The default currency for your store
              </p>
            </div>

            {/* Supported Currencies */}
            <div className="space-y-2">
              <CustomLabel htmlFor="supportedCurrencies">
                Supported Currencies <span className="text-red-600">*</span>
              </CustomLabel>
              <div className="space-y-3">
                {/* Currency tags */}
                {formData.supportedCurrencies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.supportedCurrencies.map((currency) => (
                      <span
                        key={currency}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-md text-sm"
                      >
                        {currency}
                        <button
                          type="button"
                          onClick={() => handleCurrencyRemove(currency)}
                          disabled={saving}
                          className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Add currency input */}
                <form onSubmit={handleCurrencyAdd} className="flex gap-2">
                  <select
                    value={currencyInput}
                    onChange={(e) => setCurrencyInput(e.target.value)}
                    disabled={saving}
                    className={cn(
                      "flex h-10 flex-1 rounded-md border px-3 py-2 text-sm transition-colors",
                      "bg-white text-gray-900 border-gray-300",
                      "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600",
                      "focus:outline-none focus:ring-2 focus:ring-offset-2",
                      "focus:ring-blue-500 dark:focus:ring-blue-400",
                      "focus:border-blue-500 dark:focus:border-blue-400",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                      "disabled:bg-gray-100 dark:disabled:bg-gray-900"
                    )}
                  >
                    <option value="">Select a currency to add</option>
                    {CURRENCIES.filter(
                      (c) => !formData.supportedCurrencies.includes(c.value)
                    ).map((currency) => (
                      <option key={currency.value} value={currency.value}>
                        {currency.label}
                      </option>
                    ))}
                  </select>
                  <CustomButton
                    type="submit"
                    variant="outline"
                    size="sm"
                    disabled={saving || !currencyInput}
                  >
                    Add
                  </CustomButton>
                </form>
              </div>
              {errors.supportedCurrencies && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.supportedCurrencies}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Currencies that customers can use for purchases
              </p>
            </div>
          </div>

          {/* Address Section */}
          <div className="space-y-4 border-t border-border pt-6">
            <h3 className="text-lg font-semibold">Store Address</h3>

            {/* Address Line 1 */}
            <div className="space-y-2">
              <CustomLabel htmlFor="addressLine1">Address Line 1</CustomLabel>
              <CustomInput
                id="addressLine1"
                type="text"
                value={formData.addressLine1}
                onChange={(e) => handleChange("addressLine1", e.target.value)}
                disabled={saving}
                placeholder="123 Main Street"
              />
            </div>

            {/* Address Line 2 */}
            <div className="space-y-2">
              <CustomLabel htmlFor="addressLine2">Address Line 2</CustomLabel>
              <CustomInput
                id="addressLine2"
                type="text"
                value={formData.addressLine2}
                onChange={(e) => handleChange("addressLine2", e.target.value)}
                disabled={saving}
                placeholder="Suite 100"
              />
            </div>

            {/* City, State, Postal Code */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <CustomLabel htmlFor="city">City</CustomLabel>
                <CustomInput
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  disabled={saving}
                  placeholder="Toronto"
                />
              </div>

              <div className="space-y-2">
                <CustomLabel htmlFor="state">State/Province</CustomLabel>
                <CustomInput
                  id="state"
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  disabled={saving}
                  placeholder="ON"
                />
              </div>

              <div className="space-y-2">
                <CustomLabel htmlFor="postalCode">Postal Code</CustomLabel>
                <CustomInput
                  id="postalCode"
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => handleChange("postalCode", e.target.value)}
                  disabled={saving}
                  placeholder="M5H 2N2"
                />
              </div>
            </div>

            {/* Country */}
            <div className="space-y-2">
              <CustomLabel htmlFor="country">
                Country <span className="text-red-600">*</span>
              </CustomLabel>
              <select
                id="country"
                value={formData.country}
                onChange={(e) => handleChange("country", e.target.value)}
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
                  errors.country && "border-red-500 dark:border-red-400"
                )}
              >
                {COUNTRIES.map((country) => (
                  <option key={country.value} value={country.value}>
                    {country.label}
                  </option>
                ))}
              </select>
              {errors.country && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.country}
                </p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4 border-t border-border pt-6">
            <h3 className="text-lg font-semibold">Contact Information</h3>

            {/* Email */}
            <div className="space-y-2">
              <CustomLabel htmlFor="email">Email</CustomLabel>
              <CustomInput
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                disabled={saving}
                error={errors.email}
                placeholder="info@example.com"
              />
              {errors.email && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.email}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Store contact email address
              </p>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <CustomLabel htmlFor="phone">Phone</CustomLabel>
              <CustomInput
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                disabled={saving}
                placeholder="+1-416-555-0123"
              />
              <p className="text-xs text-muted-foreground">
                Store contact phone number
              </p>
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
