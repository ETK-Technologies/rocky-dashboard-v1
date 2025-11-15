"use client";

import { useState, useEffect } from "react";
import { Save, RefreshCw, Loader2 } from "lucide-react";
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
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui";
import { useProductSettings } from "../hooks/useProductSettings";
import { cn } from "@/utils/cn";

const PRODUCT_STATUSES = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Archived" },
];

const PRODUCT_TYPES = [
  { value: "SIMPLE", label: "Simple Product" },
  { value: "VARIABLE", label: "Variable Product" },
  { value: "SUBSCRIPTION", label: "Subscription Product" },
];

const OUT_OF_STOCK_VISIBILITY = [
  { value: "visible", label: "Visible" },
  { value: "hidden", label: "Hidden" },
  { value: "catalog_only", label: "Catalog Only" },
];

const STOCK_DISPLAY_FORMAT = [
  { value: "always", label: "Always" },
  { value: "low_stock", label: "Low Stock Only" },
  { value: "never", label: "Never" },
];

export function ProductSettingsForm() {
  const {
    settings,
    loading,
    error,
    saving,
    fetchSettings,
    updateDefaultSettings,
    updateInventorySettings,
  } = useProductSettings();

  // Default settings
  const [defaultData, setDefaultData] = useState({
    defaultStatus: "DRAFT",
    defaultType: "SIMPLE",
    outOfStockVisibility: "visible",
  });

  // Inventory settings
  const [inventoryData, setInventoryData] = useState({
    inventoryManagementEnabled: true,
    lowStockThreshold: 5,
    allowBackorders: false,
    stockDisplayFormat: "always",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (settings) {
      setDefaultData({
        defaultStatus: settings.defaultStatus || "DRAFT",
        defaultType: settings.defaultType || "SIMPLE",
        outOfStockVisibility: settings.outOfStockVisibility || "visible",
      });

      setInventoryData({
        inventoryManagementEnabled:
          settings.inventoryManagementEnabled ?? true,
        lowStockThreshold: settings.lowStockThreshold || 5,
        allowBackorders: settings.allowBackorders ?? false,
        stockDisplayFormat: settings.stockDisplayFormat || "always",
      });
    }
  }, [settings]);

  const handleDefaultChange = (field, value) => {
    setDefaultData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleInventoryChange = (field, value) => {
    setInventoryData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateInventory = () => {
    const newErrors = {};
    if (
      inventoryData.lowStockThreshold < 0 ||
      inventoryData.lowStockThreshold > 10000
    ) {
      newErrors.lowStockThreshold =
        "Low stock threshold must be between 0 and 10000";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDefaultSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDefaultSettings(defaultData);
    } catch (err) {
      // Error already handled in hook
    }
  };

  const handleInventorySubmit = async (e) => {
    e.preventDefault();
    if (!validateInventory()) {
      return;
    }
    try {
      await updateInventorySettings(inventoryData);
    } catch (err) {
      // Error already handled in hook
    }
  };

  if (loading) {
    return (
      <LoadingState
        message="Loading product settings..."
        loading={loading}
        fullScreen={false}
      />
    );
  }

  if (error && !settings) {
    return (
      <ErrorState
        title="Failed to load product settings"
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Product Settings</h2>
          <p className="text-muted-foreground">
            Configure product defaults and inventory management
          </p>
        </div>
        <CustomButton
          type="button"
          variant="outline"
          size="sm"
          onClick={fetchSettings}
          disabled={loading || saving}
          className="flex items-center gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh
        </CustomButton>
      </div>

      <Tabs defaultValue="defaults" className="space-y-6">
        <TabsList>
          <TabsTrigger value="defaults">Product Defaults</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Settings</TabsTrigger>
        </TabsList>

        {/* Product Defaults Tab */}
        <TabsContent value="defaults">
          <form onSubmit={handleDefaultSubmit}>
            <CustomCard>
              <CustomCardHeader>
                <CustomCardTitle>Product Defaults</CustomCardTitle>
                <CustomCardDescription>
                  Configure default status, type, and visibility settings for
                  new products
                </CustomCardDescription>
              </CustomCardHeader>
              <CustomCardContent className="space-y-6">
                <div className="space-y-2">
                  <CustomLabel htmlFor="defaultStatus">
                    Default Status
                  </CustomLabel>
                  <select
                    id="defaultStatus"
                    value={defaultData.defaultStatus}
                    onChange={(e) =>
                      handleDefaultChange("defaultStatus", e.target.value)
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
                    {PRODUCT_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Default status for new products
                  </p>
                </div>

                <div className="space-y-2">
                  <CustomLabel htmlFor="defaultType">Default Type</CustomLabel>
                  <select
                    id="defaultType"
                    value={defaultData.defaultType}
                    onChange={(e) =>
                      handleDefaultChange("defaultType", e.target.value)
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
                    {PRODUCT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Default product type for new products
                  </p>
                </div>

                <div className="space-y-2">
                  <CustomLabel htmlFor="outOfStockVisibility">
                    Out of Stock Visibility
                  </CustomLabel>
                  <select
                    id="outOfStockVisibility"
                    value={defaultData.outOfStockVisibility}
                    onChange={(e) =>
                      handleDefaultChange(
                        "outOfStockVisibility",
                        e.target.value
                      )
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
                    {OUT_OF_STOCK_VISIBILITY.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    How out of stock products are displayed
                  </p>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {error}
                    </p>
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
                        Save Default Settings
                      </>
                    )}
                  </CustomButton>
                </div>
              </CustomCardFooter>
            </CustomCard>
          </form>
        </TabsContent>

        {/* Inventory Settings Tab */}
        <TabsContent value="inventory">
          <form onSubmit={handleInventorySubmit}>
            <CustomCard>
              <CustomCardHeader>
                <CustomCardTitle>Inventory Settings</CustomCardTitle>
                <CustomCardDescription>
                  Configure inventory management, stock thresholds, and display
                  settings
                </CustomCardDescription>
              </CustomCardHeader>
              <CustomCardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="inventoryManagementEnabled"
                      checked={inventoryData.inventoryManagementEnabled}
                      onChange={(e) =>
                        handleInventoryChange(
                          "inventoryManagementEnabled",
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
                        htmlFor="inventoryManagementEnabled"
                        className="cursor-pointer font-medium"
                      >
                        Enable Inventory Management
                      </CustomLabel>
                      <p className="text-xs text-muted-foreground mt-1">
                        Track product inventory and stock levels
                      </p>
                    </div>
                  </div>
                </div>

                {inventoryData.inventoryManagementEnabled && (
                  <>
                    <div className="space-y-2">
                      <CustomLabel htmlFor="lowStockThreshold">
                        Low Stock Threshold
                      </CustomLabel>
                      <CustomInput
                        id="lowStockThreshold"
                        type="number"
                        min="0"
                        max="10000"
                        value={inventoryData.lowStockThreshold}
                        onChange={(e) =>
                          handleInventoryChange(
                            "lowStockThreshold",
                            parseInt(e.target.value) || 0
                          )
                        }
                        disabled={saving}
                        error={errors.lowStockThreshold}
                        className="max-w-xs"
                      />
                      {errors.lowStockThreshold && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {errors.lowStockThreshold}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Alert when stock falls below this number
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="allowBackorders"
                          checked={inventoryData.allowBackorders}
                          onChange={(e) =>
                            handleInventoryChange(
                              "allowBackorders",
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
                            htmlFor="allowBackorders"
                            className="cursor-pointer font-medium"
                          >
                            Allow Backorders
                          </CustomLabel>
                          <p className="text-xs text-muted-foreground mt-1">
                            Allow customers to purchase products that are out of
                            stock
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <CustomLabel htmlFor="stockDisplayFormat">
                        Stock Display Format
                      </CustomLabel>
                      <select
                        id="stockDisplayFormat"
                        value={inventoryData.stockDisplayFormat}
                        onChange={(e) =>
                          handleInventoryChange(
                            "stockDisplayFormat",
                            e.target.value
                          )
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
                        {STOCK_DISPLAY_FORMAT.map((format) => (
                          <option key={format.value} value={format.value}>
                            {format.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-muted-foreground">
                        When to display stock levels to customers
                      </p>
                    </div>
                  </>
                )}

                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {error}
                    </p>
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
                        Save Inventory Settings
                      </>
                    )}
                  </CustomButton>
                </div>
              </CustomCardFooter>
            </CustomCard>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}

