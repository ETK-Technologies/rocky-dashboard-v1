"use client";

import { useState, useEffect } from "react";
import { Save, RefreshCw, Loader2, Plus, X } from "lucide-react";
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
  ErrorState,
  LoadingState,
} from "@/components/ui";
import { useTaxSettings } from "../hooks/useTaxSettings";
import { cn } from "@/utils/cn";

const TAX_BASED_ON = [
  { value: "shipping", label: "Shipping Address" },
  { value: "billing", label: "Billing Address" },
  { value: "base", label: "Base Location" },
];

const ROUNDING_OPTIONS = [
  { value: "round_line", label: "Round Line Items" },
  { value: "round_subtotal", label: "Round Subtotal" },
  { value: "round_total", label: "Round Total" },
];

// Countries (same as StoreSettingsForm)
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

export function TaxSettingsForm() {
  const { settings, loading, error, saving, fetchSettings, updateSettings } =
    useTaxSettings();

  const [formData, setFormData] = useState({
    enabled: true,
    displayPricesIncludingTax: false,
    taxBasedOn: "shipping",
    defaultLocationCountry: "CA",
    defaultLocationState: "",
    rounding: "round_line",
    pricesEnteredWithTax: false,
    defaultRate: 0.13,
    locationRates: {},
  });

  const [errors, setErrors] = useState({});
  const [newLocationCode, setNewLocationCode] = useState("");
  const [newLocationRate, setNewLocationRate] = useState("");

  useEffect(() => {
    if (settings) {
      setFormData({
        enabled: settings.enabled ?? true,
        displayPricesIncludingTax: settings.displayPricesIncludingTax ?? false,
        taxBasedOn: settings.taxBasedOn || "shipping",
        defaultLocationCountry: settings.defaultLocationCountry || "CA",
        defaultLocationState: settings.defaultLocationState || "",
        rounding: settings.rounding || "round_line",
        pricesEnteredWithTax: settings.pricesEnteredWithTax ?? false,
        defaultRate: settings.defaultRate || 0.13,
        locationRates: settings.locationRates || {},
      });
    }
  }, [settings]);

  const validate = () => {
    const newErrors = {};

    if (
      formData.defaultRate < 0 ||
      formData.defaultRate > 1 ||
      isNaN(formData.defaultRate)
    ) {
      newErrors.defaultRate = "Default rate must be between 0 and 1 (0-100%)";
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

  const handleAddLocationRate = (e) => {
    e.preventDefault();
    const code = newLocationCode.trim().toUpperCase();
    const rate = parseFloat(newLocationRate);

    if (code && !isNaN(rate) && rate >= 0 && rate <= 1) {
      handleChange("locationRates", {
        ...formData.locationRates,
        [code]: rate,
      });
      setNewLocationCode("");
      setNewLocationRate("");
    }
  };

  const handleRemoveLocationRate = (code) => {
    const newRates = { ...formData.locationRates };
    delete newRates[code];
    handleChange("locationRates", newRates);
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
        message="Loading tax settings..."
        loading={loading}
        fullScreen={false}
      />
    );
  }

  if (error && !settings) {
    return (
      <ErrorState
        title="Failed to load tax settings"
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
          <div className="flex items-center justify-between">
            <div>
              <CustomCardTitle>Tax Settings</CustomCardTitle>
              <CustomCardDescription>
                Configure tax calculation, rates, and rounding
              </CustomCardDescription>
            </div>
            <CustomButton
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchSettings}
              disabled={loading || saving}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={cn("h-4 w-4", loading && "animate-spin")}
              />
              Refresh
            </CustomButton>
          </div>
        </CustomCardHeader>
        <CustomCardContent className="space-y-6">
          {/* Tax Enabled */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="enabled"
                checked={formData.enabled}
                onChange={(e) => handleChange("enabled", e.target.checked)}
                disabled={saving}
                className={cn(
                  "mt-1 w-5 h-5 text-primary bg-background border-input rounded",
                  "focus:ring-primary focus:ring-2 cursor-pointer",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
              />
              <div className="flex-1">
                <CustomLabel htmlFor="enabled" className="cursor-pointer font-medium">
                  Enable Tax Calculation
                </CustomLabel>
                <p className="text-xs text-muted-foreground mt-1">
                  Enable tax calculation for orders
                </p>
              </div>
            </div>
          </div>

          {formData.enabled && (
            <>
              {/* Tax Options */}
              <div className="space-y-4 border-t border-border pt-6">
                <h3 className="text-lg font-semibold">Tax Options</h3>

                <div className="space-y-2">
                  <CustomLabel htmlFor="taxBasedOn">Tax Based On</CustomLabel>
                  <select
                    id="taxBasedOn"
                    value={formData.taxBasedOn}
                    onChange={(e) => handleChange("taxBasedOn", e.target.value)}
                    disabled={saving}
                    className={cn(
                      "flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors",
                      "bg-white text-gray-900 border-gray-300",
                      "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600",
                      "focus:outline-none focus:ring-2 focus:ring-offset-2",
                      "focus:ring-blue-500 dark:focus:ring-blue-400",
                      "focus:border-blue-500 dark:focus:border-blue-400",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                      "disabled:bg-gray-100 dark:disabled:bg-gray-900"
                    )}
                  >
                    {TAX_BASED_ON.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Calculate tax based on shipping, billing, or base location
                  </p>
                </div>

                <div className="space-y-2">
                  <CustomLabel htmlFor="rounding">Rounding</CustomLabel>
                  <select
                    id="rounding"
                    value={formData.rounding}
                    onChange={(e) => handleChange("rounding", e.target.value)}
                    disabled={saving}
                    className={cn(
                      "flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors",
                      "bg-white text-gray-900 border-gray-300",
                      "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600",
                      "focus:outline-none focus:ring-2 focus:ring-offset-2",
                      "focus:ring-blue-500 dark:focus:ring-blue-400",
                      "focus:border-blue-500 dark:focus:border-blue-400",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                      "disabled:bg-gray-100 dark:disabled:bg-gray-900"
                    )}
                  >
                    {ROUNDING_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    When to round tax calculations
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="displayPricesIncludingTax"
                      checked={formData.displayPricesIncludingTax}
                      onChange={(e) =>
                        handleChange("displayPricesIncludingTax", e.target.checked)
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
                        htmlFor="displayPricesIncludingTax"
                        className="cursor-pointer font-medium"
                      >
                        Display Prices Including Tax
                      </CustomLabel>
                      <p className="text-xs text-muted-foreground mt-1">
                        Show prices with tax included to customers
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="pricesEnteredWithTax"
                      checked={formData.pricesEnteredWithTax}
                      onChange={(e) =>
                        handleChange("pricesEnteredWithTax", e.target.checked)
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
                        htmlFor="pricesEnteredWithTax"
                        className="cursor-pointer font-medium"
                      >
                        Prices Entered With Tax
                      </CustomLabel>
                      <p className="text-xs text-muted-foreground mt-1">
                        Product prices are entered including tax
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Default Location */}
              <div className="space-y-4 border-t border-border pt-6">
                <h3 className="text-lg font-semibold">Default Location</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <CustomLabel htmlFor="defaultLocationCountry">
                      Country
                    </CustomLabel>
                    <select
                      id="defaultLocationCountry"
                      value={formData.defaultLocationCountry}
                      onChange={(e) =>
                        handleChange("defaultLocationCountry", e.target.value)
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
                        "disabled:bg-gray-100 dark:disabled:bg-gray-900"
                      )}
                    >
                      {COUNTRIES.map((country) => (
                        <option key={country.value} value={country.value}>
                          {country.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <CustomLabel htmlFor="defaultLocationState">
                      State/Province
                    </CustomLabel>
                    <CustomInput
                      id="defaultLocationState"
                      type="text"
                      value={formData.defaultLocationState}
                      onChange={(e) =>
                        handleChange("defaultLocationState", e.target.value)
                      }
                      disabled={saving}
                      placeholder="ON"
                    />
                  </div>
                </div>
              </div>

              {/* Tax Rates */}
              <div className="space-y-4 border-t border-border pt-6">
                <h3 className="text-lg font-semibold">Tax Rates</h3>

                <div className="space-y-2">
                  <CustomLabel htmlFor="defaultRate">
                    Default Tax Rate (%)
                  </CustomLabel>
                  <CustomInput
                    id="defaultRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={(formData.defaultRate * 100).toFixed(2)}
                    onChange={(e) => {
                      const percent = parseFloat(e.target.value) || 0;
                      handleChange("defaultRate", percent / 100);
                    }}
                    disabled={saving}
                    error={errors.defaultRate}
                    className="max-w-xs"
                  />
                  {errors.defaultRate && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errors.defaultRate}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Default tax rate as percentage (e.g., 13 for 13%)
                  </p>
                </div>

                {/* Location Rates */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <CustomLabel>Location-Specific Rates</CustomLabel>
                  </div>

                  {Object.keys(formData.locationRates).length > 0 && (
                    <div className="space-y-2">
                      {Object.entries(formData.locationRates).map(
                        ([code, rate]) => (
                          <div
                            key={code}
                            className="flex items-center justify-between p-3 bg-muted rounded-lg"
                          >
                            <div>
                              <span className="font-medium">{code}</span>
                              <span className="text-sm text-muted-foreground ml-2">
                                {(rate * 100).toFixed(2)}%
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveLocationRate(code)}
                              disabled={saving}
                              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  <form
                    onSubmit={handleAddLocationRate}
                    className="flex gap-2"
                  >
                    <CustomInput
                      type="text"
                      placeholder="Location code (e.g., CA, ON)"
                      value={newLocationCode}
                      onChange={(e) => setNewLocationCode(e.target.value)}
                      disabled={saving}
                      className="flex-1"
                      maxLength={10}
                    />
                    <CustomInput
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="Rate %"
                      value={newLocationRate}
                      onChange={(e) => setNewLocationRate(e.target.value)}
                      disabled={saving}
                      className="w-24"
                    />
                    <CustomButton
                      type="submit"
                      variant="outline"
                      size="sm"
                      disabled={saving || !newLocationCode || !newLocationRate}
                    >
                      <Plus className="h-4 w-4" />
                    </CustomButton>
                  </form>
                  <p className="text-xs text-muted-foreground">
                    Add location-specific tax rates (e.g., CA: 13%, ON: 13%)
                  </p>
                </div>
              </div>
            </>
          )}

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

