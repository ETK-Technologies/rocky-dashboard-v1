"use client";

import { useState, useEffect } from "react";
import { useStorageSettings } from "../hooks/useStorageSettings";
import {
  CustomButton,
  CustomInput,
  CustomCard,
  CustomCardHeader,
  CustomCardTitle,
  CustomCardDescription,
  CustomCardContent,
  CustomCardFooter,
  LoadingState,
  ErrorState,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui";
import { Save, TestTube, RefreshCw, Eye, EyeOff } from "lucide-react";

/**
 * Storage providers list
 * Note: This is hardcoded because the API doesn't return available providers.
 * These are the supported storage backends that the system can use.
 * If the API starts returning availableProviders in the response, we should use that instead.
 */
const STORAGE_PROVIDERS = [
  { value: "local", label: "Local Storage" },
  { value: "r2", label: "Cloudflare R2" },
  { value: "s3", label: "Amazon S3" },
  { value: "gcs", label: "Google Cloud Storage" },
  { value: "do", label: "DigitalOcean Spaces" },
  { value: "bunny", label: "Bunny CDN" },
];

export function StorageSettings() {
  const {
    settings,
    loading,
    error,
    saving,
    testing,
    debugInfo,
    fetchSettings,
    updateSettings,
    testConnection,
    fetchDebugInfo,
  } = useStorageSettings();

  // Use availableProviders from API if provided, otherwise fallback to hardcoded list
  // This allows the API to control which providers are available in the future
  const availableProviders =
    settings?.availableProviders && Array.isArray(settings.availableProviders)
      ? settings.availableProviders.map((provider) => {
          // If API returns string values, find matching label from our list
          if (typeof provider === "string") {
            const found = STORAGE_PROVIDERS.find((p) => p.value === provider);
            return found || { value: provider, label: provider };
          }
          // If API returns objects with value/label, use them directly
          return provider;
        })
      : STORAGE_PROVIDERS;

  // Local form state for editing
  const [formData, setFormData] = useState({
    storageProvider: "r2",
    // General settings
    allowedFileTypes: [],
    maxFileSize: 10485760,
    maxFilesPerUpload: 10,
    localStoragePath: "./uploads",
    // Cloudflare R2
    cloudflareR2AccountId: "",
    cloudflareR2AccessKeyId: "",
    cloudflareR2SecretAccessKey: "",
    cloudflareR2BucketName: "",
    cloudflareR2PublicUrl: "",
    // Bunny CDN
    bunnyCdnStorageZone: "",
    bunnyCdnAccessKey: "",
    bunnyCdnHostname: "",
    bunnyCdnRegion: "de",
    // S3
    s3Bucket: "",
    s3Region: "",
    s3AccessKeyId: "",
    s3SecretAccessKey: "",
    s3Endpoint: "",
    s3PublicUrl: "",
    s3ForcePathStyle: false,
    // GCS
    gcsProjectId: "",
    gcsClientEmail: "",
    gcsPrivateKey: "",
    gcsBucket: "",
    gcsPublicUrl: "",
    // DigitalOcean
    doSpaceName: "",
    doRegion: "",
    doEndpoint: "",
    doCdnUrl: "",
    doAccessKey: "",
    doSecretKey: "",
  });

  const [showSecrets, setShowSecrets] = useState({});
  const [activeTab, setActiveTab] = useState("general");

  // Update form data when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormData((prev) => ({
        ...prev,
        ...settings,
        allowedFileTypes: Array.isArray(settings.allowedFileTypes)
          ? settings.allowedFileTypes
          : [],
      }));
      setActiveTab(settings.storageProvider || "general");
    }
  }, [settings]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayChange = (field, value) => {
    const array = value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    handleChange(field, array);
  };

  const handleSave = async () => {
    try {
      await updateSettings(formData);
    } catch (err) {
      // Error is already handled by the hook with toast
    }
  };

  const handleTest = async () => {
    try {
      await testConnection(formData);
    } catch (err) {
      // Error is already handled by the hook with toast
    }
  };

  const toggleSecretVisibility = (field) => {
    setShowSecrets((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  if (loading) {
    return <LoadingState message="Loading storage settings..." />;
  }

  if (error && !settings) {
    return (
      <ErrorState message={error} onRetry={fetchSettings} retryLabel="Retry" />
    );
  }

  // Compare form data with settings to detect changes
  const hasChanges =
    settings &&
    (() => {
      try {
        // Normalize both objects for comparison
        const normalize = (obj) => {
          const normalized = { ...obj };
          // Sort arrays for comparison
          if (Array.isArray(normalized.allowedFileTypes)) {
            normalized.allowedFileTypes = [
              ...normalized.allowedFileTypes,
            ].sort();
          }
          return JSON.stringify(normalized);
        };
        return normalize(formData) !== normalize(settings);
      } catch {
        // If comparison fails, assume there are changes
        return true;
      }
    })();

  return (
    <div className="space-y-6">
      {/* Current Settings Display */}
      <CustomCard>
        <CustomCardHeader>
          <CustomCardTitle>Current Storage Configuration</CustomCardTitle>
          <CustomCardDescription>
            View the current storage provider and settings
          </CustomCardDescription>
        </CustomCardHeader>
        <CustomCardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">
                Storage Provider
              </div>
              <div className="text-lg font-semibold text-foreground">
                {availableProviders.find(
                  (p) => p.value === settings?.storageProvider
                )?.label ||
                  settings?.storageProvider ||
                  "—"}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">
                Max File Size
              </div>
              <div className="text-lg font-semibold text-foreground">
                {settings?.maxFileSize
                  ? formatFileSize(settings.maxFileSize)
                  : "—"}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">
                Max Files Per Upload
              </div>
              <div className="text-lg font-semibold text-foreground">
                {settings?.maxFilesPerUpload || "—"}
              </div>
            </div>
          </div>
        </CustomCardContent>
        <CustomCardFooter className="flex justify-center sm:justify-start">
          <CustomButton
            variant="outline"
            onClick={handleTest}
            disabled={testing || saving}
            className="w-full sm:w-auto"
          >
            <TestTube
              className={`h-4 w-4 mr-2 ${testing ? "animate-pulse" : ""}`}
            />
            {testing ? "Testing..." : "Test Connection"}
          </CustomButton>
        </CustomCardFooter>
      </CustomCard>

      {/* Edit Settings Form */}
      <CustomCard>
        <CustomCardHeader>
          <CustomCardTitle>Edit Storage Settings</CustomCardTitle>
          <CustomCardDescription>
            Configure storage provider credentials and upload constraints.
          </CustomCardDescription>
        </CustomCardHeader>
        <CustomCardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} disableScroll>
            <TabsList className="grid w-full h-auto sm:h-[35px] p-0 grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-0">
              <TabsTrigger value="general" className="text-xs sm:text-sm">
                General
              </TabsTrigger>
              <TabsTrigger
                value={formData.storageProvider}
                className="text-xs sm:text-sm truncate"
              >
                {availableProviders.find(
                  (p) => p.value === formData.storageProvider
                )?.label || "Provider"}
              </TabsTrigger>
              <TabsTrigger value="debug" className="text-xs sm:text-sm">
                Debug
              </TabsTrigger>
            </TabsList>

            {/* General Settings Tab */}
            <TabsContent value="general" className="space-y-6 mt-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Storage Provider
                </label>
                <select
                  value={formData.storageProvider}
                  onChange={(e) => {
                    handleChange("storageProvider", e.target.value);
                    setActiveTab(e.target.value);
                  }}
                  className="flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors bg-white text-gray-900 border-gray-300 placeholder:text-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-900"
                >
                  {availableProviders.map((provider) => (
                    <option key={provider.value} value={provider.value}>
                      {provider.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Allowed File Types (comma-separated MIME types)
                </label>
                <CustomInput
                  value={
                    Array.isArray(formData.allowedFileTypes)
                      ? formData.allowedFileTypes.join(", ")
                      : formData.allowedFileTypes || ""
                  }
                  onChange={(e) =>
                    handleArrayChange("allowedFileTypes", e.target.value)
                  }
                  placeholder="image/jpeg, image/png, application/pdf"
                  className="w-full"
                />
                <p className="mt-1 text-sm text-muted-foreground">
                  Enter MIME types separated by commas
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Max File Size (bytes)
                  </label>
                  <CustomInput
                    type="number"
                    value={formData.maxFileSize}
                    onChange={(e) =>
                      handleChange("maxFileSize", Number(e.target.value))
                    }
                    className="w-full"
                  />
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                    Current: {formatFileSize(formData.maxFileSize)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Max Files Per Upload
                  </label>
                  <CustomInput
                    type="number"
                    value={formData.maxFilesPerUpload}
                    onChange={(e) =>
                      handleChange("maxFilesPerUpload", Number(e.target.value))
                    }
                    className="w-full"
                  />
                </div>
              </div>

              {formData.storageProvider === "local" && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Local Storage Path
                  </label>
                  <CustomInput
                    value={formData.localStoragePath}
                    onChange={(e) =>
                      handleChange("localStoragePath", e.target.value)
                    }
                    placeholder="./uploads"
                    className="w-full"
                  />
                </div>
              )}
            </TabsContent>

            {/* Provider-specific Settings Tab */}
            <TabsContent
              value={formData.storageProvider}
              className="space-y-4 mt-6"
            >
              {/* Cloudflare R2 */}
              {formData.storageProvider === "r2" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      Account ID
                    </label>
                    <CustomInput
                      value={formData.cloudflareR2AccountId || ""}
                      onChange={(e) =>
                        handleChange("cloudflareR2AccountId", e.target.value)
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      Access Key ID
                    </label>
                    <CustomInput
                      value={formData.cloudflareR2AccessKeyId || ""}
                      onChange={(e) =>
                        handleChange("cloudflareR2AccessKeyId", e.target.value)
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      Secret Access Key
                    </label>
                    <div className="relative">
                      <CustomInput
                        type={
                          showSecrets.cloudflareR2SecretAccessKey
                            ? "text"
                            : "password"
                        }
                        value={formData.cloudflareR2SecretAccessKey || ""}
                        onChange={(e) =>
                          handleChange(
                            "cloudflareR2SecretAccessKey",
                            e.target.value
                          )
                        }
                        className="w-full pr-10"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          toggleSecretVisibility("cloudflareR2SecretAccessKey")
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showSecrets.cloudflareR2SecretAccessKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      Bucket Name
                    </label>
                    <CustomInput
                      value={formData.cloudflareR2BucketName || ""}
                      onChange={(e) =>
                        handleChange("cloudflareR2BucketName", e.target.value)
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      Public URL
                    </label>
                    <CustomInput
                      value={formData.cloudflareR2PublicUrl || ""}
                      onChange={(e) =>
                        handleChange("cloudflareR2PublicUrl", e.target.value)
                      }
                      placeholder="https://cdn.yourdomain.com"
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              {/* Bunny CDN */}
              {formData.storageProvider === "bunny" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      Storage Zone
                    </label>
                    <CustomInput
                      value={formData.bunnyCdnStorageZone || ""}
                      onChange={(e) =>
                        handleChange("bunnyCdnStorageZone", e.target.value)
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      Access Key
                    </label>
                    <div className="relative">
                      <CustomInput
                        type={
                          showSecrets.bunnyCdnAccessKey ? "text" : "password"
                        }
                        value={formData.bunnyCdnAccessKey || ""}
                        onChange={(e) =>
                          handleChange("bunnyCdnAccessKey", e.target.value)
                        }
                        className="w-full pr-10"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          toggleSecretVisibility("bunnyCdnAccessKey")
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showSecrets.bunnyCdnAccessKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      Hostname
                    </label>
                    <CustomInput
                      value={formData.bunnyCdnHostname || ""}
                      onChange={(e) =>
                        handleChange("bunnyCdnHostname", e.target.value)
                      }
                      placeholder="myzone.b-cdn.net"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      Region
                    </label>
                    <CustomInput
                      value={formData.bunnyCdnRegion || ""}
                      onChange={(e) =>
                        handleChange("bunnyCdnRegion", e.target.value)
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              {/* Amazon S3 */}
              {formData.storageProvider === "s3" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">
                        Bucket Name
                      </label>
                      <CustomInput
                        value={formData.s3Bucket || ""}
                        onChange={(e) =>
                          handleChange("s3Bucket", e.target.value)
                        }
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">
                        Region
                      </label>
                      <CustomInput
                        value={formData.s3Region || ""}
                        onChange={(e) =>
                          handleChange("s3Region", e.target.value)
                        }
                        placeholder="us-east-1"
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      Access Key ID
                    </label>
                    <CustomInput
                      value={formData.s3AccessKeyId || ""}
                      onChange={(e) =>
                        handleChange("s3AccessKeyId", e.target.value)
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      Secret Access Key
                    </label>
                    <div className="relative">
                      <CustomInput
                        type={
                          showSecrets.s3SecretAccessKey ? "text" : "password"
                        }
                        value={formData.s3SecretAccessKey || ""}
                        onChange={(e) =>
                          handleChange("s3SecretAccessKey", e.target.value)
                        }
                        className="w-full pr-10"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          toggleSecretVisibility("s3SecretAccessKey")
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showSecrets.s3SecretAccessKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">
                        Endpoint
                      </label>
                      <CustomInput
                        value={formData.s3Endpoint || ""}
                        onChange={(e) =>
                          handleChange("s3Endpoint", e.target.value)
                        }
                        placeholder="https://s3.amazonaws.com"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">
                        Public URL
                      </label>
                      <CustomInput
                        value={formData.s3PublicUrl || ""}
                        onChange={(e) =>
                          handleChange("s3PublicUrl", e.target.value)
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="s3ForcePathStyle"
                      checked={formData.s3ForcePathStyle || false}
                      onChange={(e) =>
                        handleChange("s3ForcePathStyle", e.target.checked)
                      }
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800"
                    />
                    <label
                      htmlFor="s3ForcePathStyle"
                      className="text-sm font-medium text-foreground"
                    >
                      Force Path Style
                    </label>
                  </div>
                </div>
              )}

              {/* Google Cloud Storage */}
              {formData.storageProvider === "gcs" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">
                        Project ID
                      </label>
                      <CustomInput
                        value={formData.gcsProjectId || ""}
                        onChange={(e) =>
                          handleChange("gcsProjectId", e.target.value)
                        }
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">
                        Bucket Name
                      </label>
                      <CustomInput
                        value={formData.gcsBucket || ""}
                        onChange={(e) =>
                          handleChange("gcsBucket", e.target.value)
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      Client Email
                    </label>
                    <CustomInput
                      value={formData.gcsClientEmail || ""}
                      onChange={(e) =>
                        handleChange("gcsClientEmail", e.target.value)
                      }
                      placeholder="service-account@project.iam.gserviceaccount.com"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      Private Key
                    </label>
                    <div className="relative">
                      <textarea
                        value={formData.gcsPrivateKey || ""}
                        onChange={(e) =>
                          handleChange("gcsPrivateKey", e.target.value)
                        }
                        className="flex min-h-[100px] w-full rounded-md border px-3 py-2 text-sm font-mono transition-colors bg-white text-gray-900 border-gray-300 placeholder:text-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-900 resize-y"
                        placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecretVisibility("gcsPrivateKey")}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showSecrets.gcsPrivateKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      Public URL
                    </label>
                    <CustomInput
                      value={formData.gcsPublicUrl || ""}
                      onChange={(e) =>
                        handleChange("gcsPublicUrl", e.target.value)
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              {/* DigitalOcean Spaces */}
              {formData.storageProvider === "do" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">
                        Space Name
                      </label>
                      <CustomInput
                        value={formData.doSpaceName || ""}
                        onChange={(e) =>
                          handleChange("doSpaceName", e.target.value)
                        }
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">
                        Region
                      </label>
                      <CustomInput
                        value={formData.doRegion || ""}
                        onChange={(e) =>
                          handleChange("doRegion", e.target.value)
                        }
                        placeholder="nyc3"
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      Access Key
                    </label>
                    <div className="relative">
                      <CustomInput
                        type={showSecrets.doAccessKey ? "text" : "password"}
                        value={formData.doAccessKey || ""}
                        onChange={(e) =>
                          handleChange("doAccessKey", e.target.value)
                        }
                        className="w-full pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecretVisibility("doAccessKey")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showSecrets.doAccessKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      Secret Key
                    </label>
                    <div className="relative">
                      <CustomInput
                        type={showSecrets.doSecretKey ? "text" : "password"}
                        value={formData.doSecretKey || ""}
                        onChange={(e) =>
                          handleChange("doSecretKey", e.target.value)
                        }
                        className="w-full pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecretVisibility("doSecretKey")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showSecrets.doSecretKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">
                        Endpoint
                      </label>
                      <CustomInput
                        value={formData.doEndpoint || ""}
                        onChange={(e) =>
                          handleChange("doEndpoint", e.target.value)
                        }
                        placeholder="https://nyc3.digitaloceanspaces.com"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">
                        CDN URL
                      </label>
                      <CustomInput
                        value={formData.doCdnUrl || ""}
                        onChange={(e) =>
                          handleChange("doCdnUrl", e.target.value)
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Debug Tab */}
            <TabsContent value="debug" className="space-y-4 mt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                <p className="text-sm text-muted-foreground">
                  View diagnostic information about stored credentials
                </p>
                <CustomButton
                  variant="outline"
                  size="sm"
                  onClick={fetchDebugInfo}
                  className="w-full sm:w-auto"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Debug Info
                </CustomButton>
              </div>
              {debugInfo && (
                <div className="relative">
                  <div className="absolute top-0 left-0 right-0 h-8 bg-gray-800 dark:bg-gray-900 rounded-t-md flex items-center px-4 border-b border-gray-700">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="ml-4 text-xs text-gray-400 font-mono">
                      Terminal
                    </span>
                  </div>
                  <pre className="p-3 sm:p-4 pt-10 sm:pt-12 bg-gray-900 text-green-400 rounded-md text-xs sm:text-sm overflow-auto font-mono border border-gray-700 min-h-[200px] max-h-[400px] sm:max-h-[500px]">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CustomCardContent>
        <CustomCardFooter className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-2">
          <CustomButton
            variant="outline"
            onClick={() => {
              if (settings) {
                setFormData((prev) => ({
                  ...prev,
                  ...settings,
                  allowedFileTypes: Array.isArray(settings.allowedFileTypes)
                    ? settings.allowedFileTypes
                    : [],
                }));
              }
            }}
            disabled={saving || testing || !hasChanges}
            className="w-full sm:w-auto"
          >
            Reset
          </CustomButton>
          <CustomButton
            variant="primary"
            onClick={handleSave}
            disabled={saving || testing || !hasChanges}
            className="w-full sm:w-auto"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </CustomButton>
        </CustomCardFooter>
      </CustomCard>
    </div>
  );
}
