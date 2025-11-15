"use client";

import { useState, useEffect } from "react";
import { Save, RefreshCw, Loader2, Eye, EyeOff, Mail } from "lucide-react";
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
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui";
import { useEmailSettings } from "../hooks/useEmailSettings";
import { cn } from "@/utils/cn";

const EMAIL_PROVIDERS = [
  { value: "SMTP", label: "SMTP" },
  { value: "SENDGRID", label: "SendGrid" },
  { value: "MAILGUN", label: "Mailgun" },
  { value: "POSTMARK", label: "Postmark" },
  { value: "SES", label: "Amazon SES" },
];

const SMTP_ENCRYPTION = [
  { value: "TLS", label: "TLS" },
  { value: "SSL", label: "SSL" },
  { value: "none", label: "None" },
];

const MAILGUN_REGIONS = [
  { value: "us", label: "US" },
  { value: "eu", label: "EU" },
];

export function EmailSettingsForm() {
  const {
    settings,
    loading,
    error,
    saving,
    testing,
    fetchSettings,
    updateSettings,
    testSettings,
  } = useEmailSettings();

  const [formData, setFormData] = useState({
    provider: "SMTP",
    fromName: "",
    fromEmail: "",
    replyToEmail: "",
    defaultSenderId: "",
    domain: "",
    notifications: {
      sendCopyToAdmin: false,
      bccEmails: [],
      failedLogRetentionDays: "30",
      retryOnFailure: true,
    },
    smtp: {
      host: "",
      port: "587",
      username: "",
      password: "",
      encryption: "TLS",
    },
    sendgrid: {
      apiKey: "",
    },
    mailgun: {
      domain: "",
      apiKey: "",
      region: "us",
    },
    postmark: {
      serverToken: "",
    },
    ses: {
      accessKeyId: "",
      secretAccessKey: "",
      region: "us-east-1",
    },
  });

  const [errors, setErrors] = useState({});
  const [testEmail, setTestEmail] = useState("");
  const [showPasswords, setShowPasswords] = useState({});

  useEffect(() => {
    if (settings) {
      setFormData({
        provider: settings.provider || "SMTP",
        fromName: settings.fromName || "",
        fromEmail: settings.fromEmail || "",
        replyToEmail: settings.replyToEmail || "",
        defaultSenderId: settings.defaultSenderId || "",
        domain: settings.domain || "",
        notifications: settings.notifications || {
          sendCopyToAdmin: false,
          bccEmails: [],
          failedLogRetentionDays: "30",
          retryOnFailure: true,
        },
        smtp: settings.smtp || {
          host: "",
          port: "587",
          username: "",
          password: "",
          encryption: "TLS",
        },
        sendgrid: settings.sendgrid || { apiKey: "" },
        mailgun: settings.mailgun || {
          domain: "",
          apiKey: "",
          region: "us",
        },
        postmark: settings.postmark || { serverToken: "" },
        ses: settings.ses || {
          accessKeyId: "",
          secretAccessKey: "",
          region: "us-east-1",
        },
      });
    }
  }, [settings]);

  const validate = () => {
    const newErrors = {};

    if (!formData.fromEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.fromEmail)) {
      newErrors.fromEmail = "Valid from email is required";
    }

    if (formData.replyToEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.replyToEmail)) {
      newErrors.replyToEmail = "Valid reply-to email is required";
    }

    if (formData.provider === "SMTP") {
      if (!formData.smtp.host) newErrors.smtpHost = "SMTP host is required";
      if (!formData.smtp.port) newErrors.smtpPort = "SMTP port is required";
      if (!formData.smtp.username) newErrors.smtpUsername = "SMTP username is required";
    } else if (formData.provider === "SENDGRID") {
      if (!formData.sendgrid.apiKey) newErrors.sendgridApiKey = "SendGrid API key is required";
    } else if (formData.provider === "MAILGUN") {
      if (!formData.mailgun.domain) newErrors.mailgunDomain = "Mailgun domain is required";
      if (!formData.mailgun.apiKey) newErrors.mailgunApiKey = "Mailgun API key is required";
    } else if (formData.provider === "POSTMARK") {
      if (!formData.postmark.serverToken) newErrors.postmarkToken = "Postmark server token is required";
    } else if (formData.provider === "SES") {
      if (!formData.ses.accessKeyId) newErrors.sesAccessKey = "SES access key ID is required";
      if (!formData.ses.secretAccessKey) newErrors.sesSecretKey = "SES secret access key is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleNotificationChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value,
      },
    }));
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

  const handleTestEmail = async (e) => {
    e.preventDefault();
    if (!testEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)) {
      return;
    }
    try {
      await testSettings({
        to: testEmail,
        subject: "Test Email",
        html: "<p>This is a test email from your store.</p>",
        text: "This is a test email from your store.",
      });
    } catch (err) {
      // Error already handled in hook
    }
  };

  const togglePasswordVisibility = (key) => {
    setShowPasswords((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (loading) {
    return (
      <LoadingState
        message="Loading email settings..."
        loading={loading}
        fullScreen={false}
      />
    );
  }

  if (error && !settings) {
    return (
      <ErrorState
        title="Failed to load email settings"
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
          <h2 className="text-2xl font-bold">Email Settings</h2>
          <p className="text-muted-foreground">
            Configure email provider and notification settings
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

      <form onSubmit={handleSubmit}>
        <CustomCard>
          <CustomCardHeader>
            <CustomCardTitle>Email Provider Configuration</CustomCardTitle>
            <CustomCardDescription>
              Configure your email provider and sending settings
            </CustomCardDescription>
          </CustomCardHeader>
          <CustomCardContent className="space-y-6">
            {/* Provider Selection */}
            <div className="space-y-2">
              <CustomLabel htmlFor="provider">Email Provider</CustomLabel>
              <select
                id="provider"
                value={formData.provider}
                onChange={(e) => handleChange("provider", e.target.value)}
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
                {EMAIL_PROVIDERS.map((provider) => (
                  <option key={provider.value} value={provider.value}>
                    {provider.label}
                  </option>
                ))}
              </select>
            </div>

            {/* General Settings */}
            <div className="space-y-4 border-t border-border pt-6">
              <h3 className="text-lg font-semibold">General Settings</h3>

              <div className="space-y-2">
                <CustomLabel htmlFor="fromName">From Name</CustomLabel>
                <CustomInput
                  id="fromName"
                  type="text"
                  value={formData.fromName}
                  onChange={(e) => handleChange("fromName", e.target.value)}
                  disabled={saving}
                  placeholder="Your Store Name"
                />
              </div>

              <div className="space-y-2">
                <CustomLabel htmlFor="fromEmail">
                  From Email <span className="text-red-600">*</span>
                </CustomLabel>
                <CustomInput
                  id="fromEmail"
                  type="email"
                  value={formData.fromEmail}
                  onChange={(e) => handleChange("fromEmail", e.target.value)}
                  disabled={saving}
                  error={errors.fromEmail}
                  placeholder="no-reply@example.com"
                />
                {errors.fromEmail && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.fromEmail}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <CustomLabel htmlFor="replyToEmail">Reply-To Email</CustomLabel>
                <CustomInput
                  id="replyToEmail"
                  type="email"
                  value={formData.replyToEmail}
                  onChange={(e) => handleChange("replyToEmail", e.target.value)}
                  disabled={saving}
                  error={errors.replyToEmail}
                  placeholder="support@example.com"
                />
                {errors.replyToEmail && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.replyToEmail}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <CustomLabel htmlFor="domain">Domain</CustomLabel>
                  <CustomInput
                    id="domain"
                    type="text"
                    value={formData.domain}
                    onChange={(e) => handleChange("domain", e.target.value)}
                    disabled={saving}
                    placeholder="example.com"
                  />
                </div>

                <div className="space-y-2">
                  <CustomLabel htmlFor="defaultSenderId">
                    Default Sender ID
                  </CustomLabel>
                  <CustomInput
                    id="defaultSenderId"
                    type="text"
                    value={formData.defaultSenderId}
                    onChange={(e) =>
                      handleChange("defaultSenderId", e.target.value)
                    }
                    disabled={saving}
                    placeholder="default-sender-id"
                  />
                </div>
              </div>
            </div>

            {/* Provider-Specific Settings */}
            <div className="space-y-4 border-t border-border pt-6">
              <h3 className="text-lg font-semibold">Provider Settings</h3>

              {/* SMTP Settings */}
              {formData.provider === "SMTP" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <CustomLabel htmlFor="smtp.host">
                        SMTP Host <span className="text-red-600">*</span>
                      </CustomLabel>
                      <CustomInput
                        id="smtp.host"
                        type="text"
                        value={formData.smtp.host}
                        onChange={(e) => handleChange("smtp.host", e.target.value)}
                        disabled={saving}
                        error={errors.smtpHost}
                        placeholder="smtp.sendgrid.net"
                      />
                      {errors.smtpHost && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {errors.smtpHost}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <CustomLabel htmlFor="smtp.port">
                        SMTP Port <span className="text-red-600">*</span>
                      </CustomLabel>
                      <CustomInput
                        id="smtp.port"
                        type="text"
                        value={formData.smtp.port}
                        onChange={(e) => handleChange("smtp.port", e.target.value)}
                        disabled={saving}
                        error={errors.smtpPort}
                        placeholder="587"
                      />
                      {errors.smtpPort && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {errors.smtpPort}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <CustomLabel htmlFor="smtp.encryption">Encryption</CustomLabel>
                    <select
                      id="smtp.encryption"
                      value={formData.smtp.encryption}
                      onChange={(e) => handleChange("smtp.encryption", e.target.value)}
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
                      {SMTP_ENCRYPTION.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <CustomLabel htmlFor="smtp.username">
                      Username <span className="text-red-600">*</span>
                    </CustomLabel>
                    <CustomInput
                      id="smtp.username"
                      type="text"
                      value={formData.smtp.username}
                      onChange={(e) => handleChange("smtp.username", e.target.value)}
                      disabled={saving}
                      error={errors.smtpUsername}
                      placeholder="apikey"
                    />
                    {errors.smtpUsername && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.smtpUsername}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <CustomLabel htmlFor="smtp.password">Password</CustomLabel>
                    <div className="relative">
                      <CustomInput
                        id="smtp.password"
                        type={showPasswords.smtp ? "text" : "password"}
                        value={formData.smtp.password}
                        onChange={(e) => handleChange("smtp.password", e.target.value)}
                        disabled={saving}
                        placeholder="SG.xxxxx"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("smtp")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPasswords.smtp ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SendGrid Settings */}
              {formData.provider === "SENDGRID" && (
                <div className="space-y-2">
                  <CustomLabel htmlFor="sendgrid.apiKey">
                    API Key <span className="text-red-600">*</span>
                  </CustomLabel>
                  <div className="relative">
                    <CustomInput
                      id="sendgrid.apiKey"
                      type={showPasswords.sendgrid ? "text" : "password"}
                      value={formData.sendgrid.apiKey}
                      onChange={(e) => handleChange("sendgrid.apiKey", e.target.value)}
                      disabled={saving}
                      error={errors.sendgridApiKey}
                      placeholder="SG.xxxxx"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("sendgrid")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords.sendgrid ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.sendgridApiKey && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errors.sendgridApiKey}
                    </p>
                  )}
                </div>
              )}

              {/* Mailgun Settings */}
              {formData.provider === "MAILGUN" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <CustomLabel htmlFor="mailgun.domain">
                      Domain <span className="text-red-600">*</span>
                    </CustomLabel>
                    <CustomInput
                      id="mailgun.domain"
                      type="text"
                      value={formData.mailgun.domain}
                      onChange={(e) => handleChange("mailgun.domain", e.target.value)}
                      disabled={saving}
                      error={errors.mailgunDomain}
                      placeholder="mg.yourdomain.com"
                    />
                    {errors.mailgunDomain && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.mailgunDomain}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <CustomLabel htmlFor="mailgun.apiKey">
                      API Key <span className="text-red-600">*</span>
                    </CustomLabel>
                    <div className="relative">
                      <CustomInput
                        id="mailgun.apiKey"
                        type={showPasswords.mailgun ? "text" : "password"}
                        value={formData.mailgun.apiKey}
                        onChange={(e) => handleChange("mailgun.apiKey", e.target.value)}
                        disabled={saving}
                        error={errors.mailgunApiKey}
                        placeholder="key-xxxxxxxx"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("mailgun")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPasswords.mailgun ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.mailgunApiKey && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.mailgunApiKey}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <CustomLabel htmlFor="mailgun.region">Region</CustomLabel>
                    <select
                      id="mailgun.region"
                      value={formData.mailgun.region}
                      onChange={(e) => handleChange("mailgun.region", e.target.value)}
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
                      {MAILGUN_REGIONS.map((region) => (
                        <option key={region.value} value={region.value}>
                          {region.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Postmark Settings */}
              {formData.provider === "POSTMARK" && (
                <div className="space-y-2">
                  <CustomLabel htmlFor="postmark.serverToken">
                    Server Token <span className="text-red-600">*</span>
                  </CustomLabel>
                  <div className="relative">
                    <CustomInput
                      id="postmark.serverToken"
                      type={showPasswords.postmark ? "text" : "password"}
                      value={formData.postmark.serverToken}
                      onChange={(e) => handleChange("postmark.serverToken", e.target.value)}
                      disabled={saving}
                      error={errors.postmarkToken}
                      placeholder="POSTMARK_SERVER_TOKEN"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("postmark")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords.postmark ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.postmarkToken && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errors.postmarkToken}
                    </p>
                  )}
                </div>
              )}

              {/* SES Settings */}
              {formData.provider === "SES" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <CustomLabel htmlFor="ses.accessKeyId">
                      Access Key ID <span className="text-red-600">*</span>
                    </CustomLabel>
                    <CustomInput
                      id="ses.accessKeyId"
                      type="text"
                      value={formData.ses.accessKeyId}
                      onChange={(e) => handleChange("ses.accessKeyId", e.target.value)}
                      disabled={saving}
                      error={errors.sesAccessKey}
                      placeholder="AKIAIOSFODNN7EXAMPLE"
                    />
                    {errors.sesAccessKey && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.sesAccessKey}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <CustomLabel htmlFor="ses.secretAccessKey">
                      Secret Access Key <span className="text-red-600">*</span>
                    </CustomLabel>
                    <div className="relative">
                      <CustomInput
                        id="ses.secretAccessKey"
                        type={showPasswords.ses ? "text" : "password"}
                        value={formData.ses.secretAccessKey}
                        onChange={(e) => handleChange("ses.secretAccessKey", e.target.value)}
                        disabled={saving}
                        error={errors.sesSecretKey}
                        placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("ses")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPasswords.ses ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.sesSecretKey && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.sesSecretKey}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <CustomLabel htmlFor="ses.region">Region</CustomLabel>
                    <CustomInput
                      id="ses.region"
                      type="text"
                      value={formData.ses.region}
                      onChange={(e) => handleChange("ses.region", e.target.value)}
                      disabled={saving}
                      placeholder="us-east-1"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Notifications Settings */}
            <div className="space-y-4 border-t border-border pt-6">
              <h3 className="text-lg font-semibold">Notifications</h3>

              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="sendCopyToAdmin"
                    checked={formData.notifications.sendCopyToAdmin}
                    onChange={(e) =>
                      handleNotificationChange("sendCopyToAdmin", e.target.checked)
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
                      htmlFor="sendCopyToAdmin"
                      className="cursor-pointer font-medium"
                    >
                      Send Copy to Admin
                    </CustomLabel>
                    <p className="text-xs text-muted-foreground mt-1">
                      Send a copy of all emails to admin
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="retryOnFailure"
                    checked={formData.notifications.retryOnFailure}
                    onChange={(e) =>
                      handleNotificationChange("retryOnFailure", e.target.checked)
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
                      htmlFor="retryOnFailure"
                      className="cursor-pointer font-medium"
                    >
                      Retry on Failure
                    </CustomLabel>
                    <p className="text-xs text-muted-foreground mt-1">
                      Automatically retry failed email sends
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <CustomLabel htmlFor="failedLogRetentionDays">
                  Failed Log Retention Days
                </CustomLabel>
                <CustomInput
                  id="failedLogRetentionDays"
                  type="text"
                  value={formData.notifications.failedLogRetentionDays}
                  onChange={(e) =>
                    handleNotificationChange("failedLogRetentionDays", e.target.value)
                  }
                  disabled={saving}
                  placeholder="30"
                  className="max-w-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Number of days to retain failed email logs
                </p>
              </div>
            </div>

            {/* Test Email */}
            <div className="space-y-4 border-t border-border pt-6">
              <h3 className="text-lg font-semibold">Test Email</h3>
              <form onSubmit={handleTestEmail} className="flex gap-2">
                <CustomInput
                  type="email"
                  placeholder="test@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  disabled={saving || testing}
                  className="flex-1"
                />
                <CustomButton
                  type="submit"
                  variant="outline"
                  disabled={saving || testing || !testEmail}
                  className="flex items-center gap-2"
                >
                  {testing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      Send Test
                    </>
                  )}
                </CustomButton>
              </form>
              <p className="text-xs text-muted-foreground">
                Send a test email to verify your configuration
              </p>
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
    </div>
  );
}

