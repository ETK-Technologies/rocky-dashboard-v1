"use client";

import { useEffect, useState } from "react";
import {
  CustomButton,
  PageContainer,
  PageHeader,
  CustomCard,
  CustomCardContent,
  CustomCardHeader,
  CustomCardTitle,
  CustomCardDescription,
  CustomInput,
  CustomLabel,
  Divider,
  LoadingState,
  ErrorState,
} from "@/components/ui";
import { useUploads } from "../hooks/useUploads";
import { uploadService } from "../services/uploadService";

export default function UploadSettings() {
  const { settings, isLoading, error, fetchSettings, updateSettings } =
    useUploads();
  const [formValues, setFormValues] = useState({
    storageProvider: "r2",
    localStoragePath: "./uploads",
    maxFileSize: 10485760,
    maxFilesPerUpload: 10,
    allowedFileTypes: [],
    // Cloudflare R2
    cloudflareR2AccountId: "",
    cloudflareR2BucketName: "",
    cloudflareR2PublicUrl: "",
    // Bunny CDN
    bunnyCdnStorageZone: "",
    bunnyCdnAccessKey: "",
    bunnyCdnHostname: "",
    bunnyCdnRegion: "de",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings) {
      setFormValues((prev) => ({
        ...prev,
        ...settings,
        allowedFileTypes: Array.isArray(settings.allowedFileTypes)
          ? settings.allowedFileTypes.join(", ")
          : "",
      }));
    }
  }, [settings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormValues((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(newValue) : newValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const submitData = {
        ...formValues,
        allowedFileTypes: formValues.allowedFileTypes
          ? formValues.allowedFileTypes.split(",").map((t) => t.trim())
          : [],
      };

      // Only send relevant fields based on storage provider
      const cleanedData = {
        storageProvider: submitData.storageProvider,
        maxFileSize: submitData.maxFileSize,
        maxFilesPerUpload: submitData.maxFilesPerUpload,
        allowedFileTypes: submitData.allowedFileTypes,
      };

      if (submitData.storageProvider === "local") {
        cleanedData.localStoragePath = submitData.localStoragePath;
      } else if (submitData.storageProvider === "r2") {
        cleanedData.cloudflareR2AccountId = submitData.cloudflareR2AccountId;
        cleanedData.cloudflareR2BucketName = submitData.cloudflareR2BucketName;
        cleanedData.cloudflareR2PublicUrl = submitData.cloudflareR2PublicUrl;
      } else if (submitData.storageProvider === "cdn") {
        cleanedData.bunnyCdnStorageZone = submitData.bunnyCdnStorageZone;
        cleanedData.bunnyCdnAccessKey = submitData.bunnyCdnAccessKey;
        cleanedData.bunnyCdnHostname = submitData.bunnyCdnHostname;
        cleanedData.bunnyCdnRegion = submitData.bunnyCdnRegion;
      }

      await updateSettings(cleanedData);
    } catch (error) {
      // Error is handled by hook
    } finally {
      setIsSaving(false);
    }
  };

  const handleDebug = async () => {
    try {
      const debug = await uploadService.debugUploadSettings();
      setDebugInfo(debug);
      setShowDebug(true);
    } catch (error) {
      setDebugInfo({ error: error?.message || "Failed to fetch debug info" });
      setShowDebug(true);
    }
  };

  if (isLoading && !settings) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <LoadingState message="Loading settings..." />
      </div>
    );
  }

  if (error && !settings) {
    return (
      <PageContainer>
        <PageHeader title="Upload Settings" />
        <ErrorState title="Failed to load settings" message={error} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Upload Settings"
        description="Configure file upload storage and restrictions (Super Admin only)"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Storage Provider */}
        <CustomCard>
          <CustomCardHeader>
            <CustomCardTitle>Storage Provider</CustomCardTitle>
            <CustomCardDescription>
              Choose where files are stored
            </CustomCardDescription>
          </CustomCardHeader>
          <CustomCardContent className="space-y-4">
            <div>
              <CustomLabel htmlFor="storageProvider">Provider</CustomLabel>
              <select
                id="storageProvider"
                name="storageProvider"
                value={formValues.storageProvider}
                onChange={handleChange}
                className="w-full border rounded-md h-10 px-3 bg-white text-gray-900 border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
              >
                <option value="local">Local Storage</option>
                <option value="cdn">Bunny CDN</option>
                <option value="r2">Cloudflare R2</option>
              </select>
            </div>

            {formValues.storageProvider === "local" && (
              <div>
                <CustomLabel htmlFor="localStoragePath">
                  Storage Path
                </CustomLabel>
                <CustomInput
                  id="localStoragePath"
                  name="localStoragePath"
                  value={formValues.localStoragePath}
                  onChange={handleChange}
                  placeholder="./uploads"
                />
              </div>
            )}
          </CustomCardContent>
        </CustomCard>

        <Divider />

        {/* Cloudflare R2 Settings */}
        {formValues.storageProvider === "r2" && (
          <>
            <CustomCard>
              <CustomCardHeader>
                <CustomCardTitle>Cloudflare R2 Configuration</CustomCardTitle>
                <CustomCardDescription>
                  Configure Cloudflare R2 credentials
                </CustomCardDescription>
              </CustomCardHeader>
              <CustomCardContent className="space-y-4">
                <div>
                  <CustomLabel htmlFor="cloudflareR2AccountId">
                    Account ID
                  </CustomLabel>
                  <CustomInput
                    id="cloudflareR2AccountId"
                    name="cloudflareR2AccountId"
                    value={formValues.cloudflareR2AccountId}
                    onChange={handleChange}
                    placeholder="Your R2 account ID"
                  />
                </div>

                <div>
                  <CustomLabel htmlFor="cloudflareR2BucketName">
                    Bucket Name
                  </CustomLabel>
                  <CustomInput
                    id="cloudflareR2BucketName"
                    name="cloudflareR2BucketName"
                    value={formValues.cloudflareR2BucketName}
                    onChange={handleChange}
                    placeholder="my-uploads"
                  />
                </div>

                <div>
                  <CustomLabel htmlFor="cloudflareR2PublicUrl">
                    Public CDN URL
                  </CustomLabel>
                  <CustomInput
                    id="cloudflareR2PublicUrl"
                    name="cloudflareR2PublicUrl"
                    value={formValues.cloudflareR2PublicUrl}
                    onChange={handleChange}
                    placeholder="https://cdn.yourdomain.com"
                  />
                </div>
              </CustomCardContent>
            </CustomCard>

            <Divider />
          </>
        )}

        {/* Bunny CDN Settings */}
        {formValues.storageProvider === "cdn" && (
          <>
            <CustomCard>
              <CustomCardHeader>
                <CustomCardTitle>Bunny CDN Configuration</CustomCardTitle>
                <CustomCardDescription>
                  Configure Bunny CDN credentials
                </CustomCardDescription>
              </CustomCardHeader>
              <CustomCardContent className="space-y-4">
                <div>
                  <CustomLabel htmlFor="bunnyCdnStorageZone">
                    Storage Zone
                  </CustomLabel>
                  <CustomInput
                    id="bunnyCdnStorageZone"
                    name="bunnyCdnStorageZone"
                    value={formValues.bunnyCdnStorageZone}
                    onChange={handleChange}
                    placeholder="my-zone"
                  />
                </div>

                <div>
                  <CustomLabel htmlFor="bunnyCdnAccessKey">
                    Access Key
                  </CustomLabel>
                  <CustomInput
                    id="bunnyCdnAccessKey"
                    name="bunnyCdnAccessKey"
                    type="password"
                    value={formValues.bunnyCdnAccessKey}
                    onChange={handleChange}
                    placeholder="Your access key"
                  />
                </div>

                <div>
                  <CustomLabel htmlFor="bunnyCdnHostname">Hostname</CustomLabel>
                  <CustomInput
                    id="bunnyCdnHostname"
                    name="bunnyCdnHostname"
                    value={formValues.bunnyCdnHostname}
                    onChange={handleChange}
                    placeholder="myzone.b-cdn.net"
                  />
                </div>

                <div>
                  <CustomLabel htmlFor="bunnyCdnRegion">Region</CustomLabel>
                  <select
                    id="bunnyCdnRegion"
                    name="bunnyCdnRegion"
                    value={formValues.bunnyCdnRegion}
                    onChange={handleChange}
                    className="w-full border rounded-md h-10 px-3 bg-white text-gray-900 border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                  >
                    <option value="de">Germany (de)</option>
                    <option value="ny">New York (ny)</option>
                    <option value="la">Los Angeles (la)</option>
                    <option value="sg">Singapore (sg)</option>
                  </select>
                </div>
              </CustomCardContent>
            </CustomCard>

            <Divider />
          </>
        )}

        {/* File Restrictions */}
        <CustomCard>
          <CustomCardHeader>
            <CustomCardTitle>File Restrictions</CustomCardTitle>
            <CustomCardDescription>
              Set limits on file uploads
            </CustomCardDescription>
          </CustomCardHeader>
          <CustomCardContent className="space-y-4">
            <div>
              <CustomLabel htmlFor="maxFileSize">
                Max File Size (bytes)
              </CustomLabel>
              <CustomInput
                id="maxFileSize"
                name="maxFileSize"
                type="number"
                value={formValues.maxFileSize}
                onChange={handleChange}
                placeholder="10485760"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {(formValues.maxFileSize / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>

            <div>
              <CustomLabel htmlFor="maxFilesPerUpload">
                Max Files Per Upload
              </CustomLabel>
              <CustomInput
                id="maxFilesPerUpload"
                name="maxFilesPerUpload"
                type="number"
                value={formValues.maxFilesPerUpload}
                onChange={handleChange}
                min={1}
                max={100}
              />
            </div>

            <div>
              <CustomLabel htmlFor="allowedFileTypes">
                Allowed File Types (comma-separated MIME types)
              </CustomLabel>
              <textarea
                id="allowedFileTypes"
                name="allowedFileTypes"
                value={formValues.allowedFileTypes}
                onChange={handleChange}
                rows={4}
                className="w-full border rounded-md px-3 py-2 bg-white text-gray-900 border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                placeholder="image/jpeg, image/png, application/pdf"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Example: image/jpeg, image/png, application/pdf
              </p>
            </div>
          </CustomCardContent>
        </CustomCard>

        {/* Debug Section */}
        <CustomCard>
          <CustomCardHeader>
            <CustomCardTitle>Debug Information</CustomCardTitle>
            <CustomCardDescription>
              Check credential status (Super Admin only)
            </CustomCardDescription>
          </CustomCardHeader>
          <CustomCardContent className="space-y-4">
            <CustomButton type="button" variant="outline" onClick={handleDebug}>
              Check Credentials
            </CustomButton>

            {showDebug && debugInfo && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            )}
          </CustomCardContent>
        </CustomCard>

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <CustomButton type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Settings"}
          </CustomButton>
        </div>
      </form>
    </PageContainer>
  );
}
