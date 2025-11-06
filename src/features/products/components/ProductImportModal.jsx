"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Loader2,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  CustomModal,
  CustomButton,
  CustomLabel,
  CustomBadge,
} from "@/components/ui";
import { cn } from "@/utils/cn";
import { toast } from "react-toastify";
import { useProductImport } from "../hooks/useProductImport";

/**
 * ProductImportModal component for importing products from CSV files with job tracking
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Close modal handler
 * @param {Function} props.onImportSuccess - Callback when import succeeds (optional)
 */
export function ProductImportModal({ isOpen, onClose, onImportSuccess }) {
  const router = useRouter();
  const [importFile, setImportFile] = useState(null);
  const [showJobDetails, setShowJobDetails] = useState(false);

  const {
    currentJob,
    loading,
    error,
    importProducts,
    fetchJobStatus,
    refreshCurrentJob,
  } = useProductImport();

  // Reset file when modal closes
  useEffect(() => {
    if (!isOpen) {
      setImportFile(null);
      setShowJobDetails(false);
    }
  }, [isOpen]);

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file is CSV format (WooCommerce export)
      const validTypes = [
        "text/csv",
        "application/vnd.ms-excel", // Some systems report CSV as this
        "text/plain", // Some systems report CSV as plain text
      ];

      if (validTypes.includes(file.type) || file.name.endsWith(".csv")) {
        setImportFile(file);
      } else {
        // toast.error("Please select a valid CSV file");
        toast.error("Please select a valid CSV file");
        e.target.value = "";
      }
    }
  };

  // Handle import
  const handleImport = async () => {
    if (!importFile) {
      toast.error("Please select a file to import");
      return;
    }

    try {
      const job = await importProducts(importFile);
      setShowJobDetails(true);

      // Navigate to import jobs page after successful job creation
      setTimeout(() => {
        onClose();
        router.push("/dashboard/products/import-jobs");
      }, 1000); // Small delay to show success message
    } catch (err) {
      console.error("Import error:", err);
    }
  };

  // Handle modal close - allow closing even during processing
  const handleClose = () => {
    // Show info toast if job is active
    if (
      currentJob &&
      (currentJob.status === "PENDING" || currentJob.status === "PROCESSING")
    ) {
      toast.info(
        "Import job is still processing. You can track its progress from the Import Jobs page.",
        { autoClose: 5000 }
      );
    }

    setImportFile(null);
    setShowJobDetails(false);
    onClose();
  };

  // Get status badge variant
  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: {
        variant: "outline",
        icon: Clock,
        label: "Pending",
        color: "text-yellow-600 dark:text-yellow-400",
      },
      PROCESSING: {
        variant: "default",
        icon: Loader2,
        label: "Processing",
        color: "text-blue-600 dark:text-blue-400",
        spinning: true,
      },
      COMPLETED: {
        variant: "default",
        icon: CheckCircle2,
        label: "Completed",
        color: "text-green-600 dark:text-green-400",
      },
      FAILED: {
        variant: "destructive",
        icon: XCircle,
        label: "Failed",
        color: "text-red-600 dark:text-red-400",
      },
      CANCELLED: {
        variant: "outline",
        icon: XCircle,
        label: "Cancelled",
        color: "text-gray-600 dark:text-gray-400",
      },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <CustomBadge
        variant={config.variant}
        className="flex items-center gap-1.5"
      >
        <Icon
          className={cn(
            "h-3.5 w-3.5",
            config.color,
            config.spinning && "animate-spin"
          )}
        />
        {config.label}
      </CustomBadge>
    );
  };

  // Calculate progress percentage
  const getProgress = () => {
    if (!currentJob || !currentJob.totalCount) return 0;
    const processed =
      (currentJob.successCount || 0) + (currentJob.failedCount || 0);
    return Math.round((processed / currentJob.totalCount) * 100);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const isJobActive =
    currentJob &&
    (currentJob.status === "PENDING" || currentJob.status === "PROCESSING");

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Products from WooCommerce CSV"
      size="xl"
    >
      <div className="space-y-6">
        {/* File Upload Section - Show when no job or job completed/failed */}
        {(!currentJob ||
          currentJob.status === "COMPLETED" ||
          currentJob.status === "FAILED") && (
          <div className="space-y-2">
            <CustomLabel htmlFor="import-file">
              Select WooCommerce Product Export CSV File
            </CustomLabel>
            <div className="space-y-4">
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 transition-all",
                  importFile
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500",
                  loading && "opacity-50 cursor-not-allowed"
                )}
              >
                <input
                  type="file"
                  id="import-file"
                  accept=".csv,text/csv"
                  onChange={handleFileSelect}
                  disabled={loading}
                  className="hidden"
                />
                <label
                  htmlFor="import-file"
                  className={cn(
                    "flex flex-col items-center justify-center text-center cursor-pointer",
                    loading && "cursor-not-allowed"
                  )}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin mb-2" />
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Creating import job...
                      </p>
                    </>
                  ) : importFile ? (
                    <>
                      <FileSpreadsheet className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2" />
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {importFile.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(importFile.size)} • Click to select a
                        different file
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        WooCommerce CSV export files only
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Job Tracking Section */}
        {currentJob && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold">Import Job Status</h3>
                {getStatusBadge(currentJob.status)}
              </div>
              {isJobActive && (
                <button
                  onClick={refreshCurrentJob}
                  className="p-2 rounded-lg hover:bg-accent transition-colors"
                  title="Refresh status"
                >
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Job Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground mb-1">File Name</p>
                <p className="text-sm font-medium">
                  {currentJob.fileName || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">File Size</p>
                <p className="text-sm font-medium">
                  {formatFileSize(currentJob.fileSize)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Created At</p>
                <p className="text-sm font-medium">
                  {formatDate(currentJob.createdAt)}
                </p>
              </div>
              {currentJob.startedAt && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Started At
                  </p>
                  <p className="text-sm font-medium">
                    {formatDate(currentJob.startedAt)}
                  </p>
                </div>
              )}
              {currentJob.completedAt && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Completed At
                  </p>
                  <p className="text-sm font-medium">
                    {formatDate(currentJob.completedAt)}
                  </p>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {currentJob.totalCount > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">
                    {getProgress()}% ({currentJob.successCount || 0} +{" "}
                    {currentJob.failedCount || 0} / {currentJob.totalCount})
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${getProgress()}%` }}
                  />
                </div>
              </div>
            )}

            {/* Statistics */}
            {currentJob.totalCount > 0 && (
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {currentJob.totalCount || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total Products
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {currentJob.successCount || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Successfully Imported
                  </p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {currentJob.failedCount || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Failed</p>
                </div>
              </div>
            )}

            {/* Error Log */}
            {currentJob.errorLog && currentJob.errorLog.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <h4 className="text-sm font-semibold">Error Log</h4>
                  <CustomBadge variant="destructive" className="text-xs">
                    {currentJob.errorLog.length} error
                    {currentJob.errorLog.length > 1 ? "s" : ""}
                  </CustomBadge>
                </div>
                <div className="max-h-48 overflow-y-auto border border-border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">
                          Row
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">
                          SKU
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">
                          Error Message
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {currentJob.errorLog.map((error, index) => (
                        <tr key={index} className="hover:bg-muted/30">
                          <td className="px-3 py-2 font-mono text-xs">
                            {error.row || "N/A"}
                          </td>
                          <td className="px-3 py-2 font-mono text-xs">
                            {error.sku || "N/A"}
                          </td>
                          <td className="px-3 py-2 text-xs text-destructive">
                            {error.message || "Unknown error"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Job ID */}
            <div className="text-xs text-muted-foreground">
              Job ID: <span className="font-mono">{currentJob.id}</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-destructive">Error</p>
                <p className="text-sm text-destructive/80 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t border-border">
          {currentJob &&
            (currentJob.status === "COMPLETED" ||
              currentJob.status === "FAILED") && (
              <CustomButton
                variant="outline"
                onClick={() => {
                  setImportFile(null);
                  setShowJobDetails(false);
                  // Reset current job by closing and reopening
                  onClose();
                  setTimeout(() => {
                    // This will be handled by the parent component
                  }, 100);
                }}
              >
                Import Another File
              </CustomButton>
            )}
          <CustomButton variant="outline" onClick={handleClose}>
            {currentJob && isJobActive ? "Close (Job Running)" : "Close"}
          </CustomButton>
          {!currentJob && (
            <CustomButton
              onClick={handleImport}
              disabled={!importFile || loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Job...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Start Import
                </>
              )}
            </CustomButton>
          )}
        </div>
      </div>
    </CustomModal>
  );
}
