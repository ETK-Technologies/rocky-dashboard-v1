"use client";

import { useState, useEffect } from "react";
import { Save, RefreshCw, Loader2, Eye, EyeOff, X } from "lucide-react";
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
import { usePaymentSettings } from "../hooks/usePaymentSettings";
import { cn } from "@/utils/cn";

// Currency options (same as StoreSettingsForm)
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

const CURRENCY_POSITIONS = [
  { value: "left", label: "Left ($100)" },
  { value: "right", label: "Right (100$)" },
  { value: "left_space", label: "Left with space ($ 100)" },
  { value: "right_space", label: "Right with space (100 $)" },
];

export function PaymentSettingsForm() {
  const {
    settings,
    loading,
    error,
    saving,
    fetchSettings,
    updateGatewaySettings,
    updateCurrencySettings,
  } = usePaymentSettings();

  // Gateway settings
  const [gatewayData, setGatewayData] = useState({
    stripeEnabled: false,
    stripePublishableKey: "",
    stripeSecretKey: "",
    stripeWebhookSecret: "",
    paypalEnabled: false,
    codEnabled: false,
    bankTransferEnabled: false,
  });

  // Currency settings
  const [currencyData, setCurrencyData] = useState({
    defaultCurrency: "CAD",
    supportedCurrencies: [],
    currencyPosition: "left",
    thousandSeparator: ",",
    decimalSeparator: ".",
    exchangeRateApiKey: "",
  });

  const [errors, setErrors] = useState({});
  const [currencyInput, setCurrencyInput] = useState("");
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [showExchangeKey, setShowExchangeKey] = useState(false);

  useEffect(() => {
    if (settings) {
      setGatewayData({
        stripeEnabled: settings.stripeEnabled ?? false,
        stripePublishableKey: settings.stripePublishableKey || "",
        stripeSecretKey: "",
        stripeWebhookSecret: "",
        paypalEnabled: settings.paypalEnabled ?? false,
        codEnabled: settings.codEnabled ?? false,
        bankTransferEnabled: settings.bankTransferEnabled ?? false,
      });

      setCurrencyData({
        defaultCurrency: settings.defaultCurrency || "CAD",
        supportedCurrencies: settings.supportedCurrencies || [],
        currencyPosition: settings.currencyPosition || "left",
        thousandSeparator: settings.thousandSeparator || ",",
        decimalSeparator: settings.decimalSeparator || ".",
        exchangeRateApiKey: "",
      });
    }
  }, [settings]);

  const handleGatewayChange = (field, value) => {
    setGatewayData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCurrencyChange = (field, value) => {
    setCurrencyData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCurrencyAdd = (e) => {
    e.preventDefault();
    const currency = currencyInput.trim().toUpperCase();
    if (currency && !currencyData.supportedCurrencies.includes(currency)) {
      const isValidCurrency = CURRENCIES.some((c) => c.value === currency);
      if (isValidCurrency) {
        handleCurrencyChange("supportedCurrencies", [
          ...currencyData.supportedCurrencies,
          currency,
        ]);
        setCurrencyInput("");
      }
    }
  };

  const handleCurrencyRemove = (currency) => {
    handleCurrencyChange(
      "supportedCurrencies",
      currencyData.supportedCurrencies.filter((c) => c !== currency)
    );
  };

  const handleGatewaySubmit = async (e) => {
    e.preventDefault();
    try {
      await updateGatewaySettings(gatewayData);
    } catch (err) {
      // Error already handled in hook
    }
  };

  const handleCurrencySubmit = async (e) => {
    e.preventDefault();
    try {
      await updateCurrencySettings(currencyData);
    } catch (err) {
      // Error already handled in hook
    }
  };

  if (loading) {
    return (
      <LoadingState
        message="Loading payment settings..."
        loading={loading}
        fullScreen={false}
      />
    );
  }

  if (error && !settings) {
    return (
      <ErrorState
        title="Failed to load payment settings"
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
          <h2 className="text-2xl font-bold">Payment Settings</h2>
          <p className="text-muted-foreground">
            Configure payment gateways and currency settings
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

      <Tabs defaultValue="gateways" className="space-y-6">
        <TabsList>
          <TabsTrigger value="gateways">Payment Gateways</TabsTrigger>
          <TabsTrigger value="currency">Currency Settings</TabsTrigger>
        </TabsList>

        {/* Payment Gateways Tab */}
        <TabsContent value="gateways">
          <form onSubmit={handleGatewaySubmit}>
            <CustomCard>
              <CustomCardHeader>
                <CustomCardTitle>Payment Gateways</CustomCardTitle>
                <CustomCardDescription>
                  Enable and configure payment gateways for your store
                </CustomCardDescription>
              </CustomCardHeader>
              <CustomCardContent className="space-y-6">
                {/* Stripe */}
                <div className="space-y-4 border-b border-border pb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Stripe</h3>
                      <p className="text-sm text-muted-foreground">
                        Accept payments via Stripe
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="stripeEnabled"
                        checked={gatewayData.stripeEnabled}
                        onChange={(e) =>
                          handleGatewayChange("stripeEnabled", e.target.checked)
                        }
                        disabled={saving}
                        className={cn(
                          "w-5 h-5 text-primary bg-background border-input rounded",
                          "focus:ring-primary focus:ring-2 cursor-pointer",
                          "disabled:cursor-not-allowed disabled:opacity-50"
                        )}
                      />
                      <CustomLabel
                        htmlFor="stripeEnabled"
                        className="cursor-pointer"
                      >
                        Enable Stripe
                      </CustomLabel>
                    </div>
                  </div>

                  {gatewayData.stripeEnabled && (
                    <div className="space-y-4 pl-6 border-l-2 border-border">
                      <div className="space-y-2">
                        <CustomLabel htmlFor="stripePublishableKey">
                          Publishable Key
                        </CustomLabel>
                        <CustomInput
                          id="stripePublishableKey"
                          type="text"
                          value={gatewayData.stripePublishableKey}
                          onChange={(e) =>
                            handleGatewayChange(
                              "stripePublishableKey",
                              e.target.value
                            )
                          }
                          disabled={saving}
                          placeholder="pk_test_..."
                        />
                      </div>

                      <div className="space-y-2">
                        <CustomLabel htmlFor="stripeSecretKey">
                          Secret Key
                        </CustomLabel>
                        <div className="relative">
                          <CustomInput
                            id="stripeSecretKey"
                            type={showSecretKey ? "text" : "password"}
                            value={gatewayData.stripeSecretKey}
                            onChange={(e) =>
                              handleGatewayChange(
                                "stripeSecretKey",
                                e.target.value
                              )
                            }
                            disabled={saving}
                            placeholder="sk_test_..."
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSecretKey(!showSecretKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showSecretKey ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <CustomLabel htmlFor="stripeWebhookSecret">
                          Webhook Secret
                        </CustomLabel>
                        <div className="relative">
                          <CustomInput
                            id="stripeWebhookSecret"
                            type={showWebhookSecret ? "text" : "password"}
                            value={gatewayData.stripeWebhookSecret}
                            onChange={(e) =>
                              handleGatewayChange(
                                "stripeWebhookSecret",
                                e.target.value
                              )
                            }
                            disabled={saving}
                            placeholder="whsec_..."
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowWebhookSecret(!showWebhookSecret)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showWebhookSecret ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* PayPal */}
                <div className="space-y-4 border-b border-border pb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">PayPal</h3>
                      <p className="text-sm text-muted-foreground">
                        Accept payments via PayPal
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="paypalEnabled"
                        checked={gatewayData.paypalEnabled}
                        onChange={(e) =>
                          handleGatewayChange("paypalEnabled", e.target.checked)
                        }
                        disabled={saving}
                        className={cn(
                          "w-5 h-5 text-primary bg-background border-input rounded",
                          "focus:ring-primary focus:ring-2 cursor-pointer",
                          "disabled:cursor-not-allowed disabled:opacity-50"
                        )}
                      />
                      <CustomLabel htmlFor="paypalEnabled" className="cursor-pointer">
                        Enable PayPal
                      </CustomLabel>
                    </div>
                  </div>
                </div>

                {/* Cash on Delivery */}
                <div className="space-y-4 border-b border-border pb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Cash on Delivery</h3>
                      <p className="text-sm text-muted-foreground">
                        Allow customers to pay when order is delivered
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="codEnabled"
                        checked={gatewayData.codEnabled}
                        onChange={(e) =>
                          handleGatewayChange("codEnabled", e.target.checked)
                        }
                        disabled={saving}
                        className={cn(
                          "w-5 h-5 text-primary bg-background border-input rounded",
                          "focus:ring-primary focus:ring-2 cursor-pointer",
                          "disabled:cursor-not-allowed disabled:opacity-50"
                        )}
                      />
                      <CustomLabel htmlFor="codEnabled" className="cursor-pointer">
                        Enable Cash on Delivery
                      </CustomLabel>
                    </div>
                  </div>
                </div>

                {/* Bank Transfer */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Bank Transfer</h3>
                      <p className="text-sm text-muted-foreground">
                        Allow customers to pay via bank transfer
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="bankTransferEnabled"
                        checked={gatewayData.bankTransferEnabled}
                        onChange={(e) =>
                          handleGatewayChange(
                            "bankTransferEnabled",
                            e.target.checked
                          )
                        }
                        disabled={saving}
                        className={cn(
                          "w-5 h-5 text-primary bg-background border-input rounded",
                          "focus:ring-primary focus:ring-2 cursor-pointer",
                          "disabled:cursor-not-allowed disabled:opacity-50"
                        )}
                      />
                      <CustomLabel
                        htmlFor="bankTransferEnabled"
                        className="cursor-pointer"
                      >
                        Enable Bank Transfer
                      </CustomLabel>
                    </div>
                  </div>
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
                        Save Gateway Settings
                      </>
                    )}
                  </CustomButton>
                </div>
              </CustomCardFooter>
            </CustomCard>
          </form>
        </TabsContent>

        {/* Currency Settings Tab */}
        <TabsContent value="currency">
          <form onSubmit={handleCurrencySubmit}>
            <CustomCard>
              <CustomCardHeader>
                <CustomCardTitle>Currency Settings</CustomCardTitle>
                <CustomCardDescription>
                  Configure currency defaults, formatting, and exchange rates
                </CustomCardDescription>
              </CustomCardHeader>
              <CustomCardContent className="space-y-6">
                {/* Default Currency */}
                <div className="space-y-2">
                  <CustomLabel htmlFor="defaultCurrency">
                    Default Currency
                  </CustomLabel>
                  <select
                    id="defaultCurrency"
                    value={currencyData.defaultCurrency}
                    onChange={(e) =>
                      handleCurrencyChange("defaultCurrency", e.target.value)
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
                    {CURRENCIES.map((currency) => (
                      <option key={currency.value} value={currency.value}>
                        {currency.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    The default currency for your store
                  </p>
                </div>

                {/* Supported Currencies */}
                <div className="space-y-2">
                  <CustomLabel htmlFor="supportedCurrencies">
                    Supported Currencies
                  </CustomLabel>
                  <div className="space-y-3">
                    {currencyData.supportedCurrencies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {currencyData.supportedCurrencies.map((currency) => (
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
                          (c) => !currencyData.supportedCurrencies.includes(c.value)
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
                  <p className="text-xs text-muted-foreground">
                    Currencies that customers can use for purchases
                  </p>
                </div>

                {/* Currency Formatting */}
                <div className="space-y-4 border-t border-border pt-6">
                  <h3 className="text-lg font-semibold">Currency Formatting</h3>

                  <div className="space-y-2">
                    <CustomLabel htmlFor="currencyPosition">
                      Currency Position
                    </CustomLabel>
                    <select
                      id="currencyPosition"
                      value={currencyData.currencyPosition}
                      onChange={(e) =>
                        handleCurrencyChange("currencyPosition", e.target.value)
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
                      {CURRENCY_POSITIONS.map((position) => (
                        <option key={position.value} value={position.value}>
                          {position.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <CustomLabel htmlFor="thousandSeparator">
                        Thousand Separator
                      </CustomLabel>
                      <CustomInput
                        id="thousandSeparator"
                        type="text"
                        maxLength={1}
                        value={currencyData.thousandSeparator}
                        onChange={(e) =>
                          handleCurrencyChange(
                            "thousandSeparator",
                            e.target.value
                          )
                        }
                        disabled={saving}
                        placeholder=","
                      />
                    </div>

                    <div className="space-y-2">
                      <CustomLabel htmlFor="decimalSeparator">
                        Decimal Separator
                      </CustomLabel>
                      <CustomInput
                        id="decimalSeparator"
                        type="text"
                        maxLength={1}
                        value={currencyData.decimalSeparator}
                        onChange={(e) =>
                          handleCurrencyChange(
                            "decimalSeparator",
                            e.target.value
                          )
                        }
                        disabled={saving}
                        placeholder="."
                      />
                    </div>
                  </div>
                </div>

                {/* Exchange Rate API */}
                <div className="space-y-4 border-t border-border pt-6">
                  <h3 className="text-lg font-semibold">Exchange Rate API</h3>

                  <div className="space-y-2">
                    <CustomLabel htmlFor="exchangeRateApiKey">
                      Exchange Rate API Key
                    </CustomLabel>
                    <div className="relative">
                      <CustomInput
                        id="exchangeRateApiKey"
                        type={showExchangeKey ? "text" : "password"}
                        value={currencyData.exchangeRateApiKey}
                        onChange={(e) =>
                          handleCurrencyChange(
                            "exchangeRateApiKey",
                            e.target.value
                          )
                        }
                        disabled={saving}
                        placeholder="Enter your API key"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowExchangeKey(!showExchangeKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showExchangeKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      API key for fetching real-time exchange rates
                    </p>
                  </div>
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
                        Save Currency Settings
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

