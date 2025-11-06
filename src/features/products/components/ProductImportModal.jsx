"use client";

import { useState } from "react";
import { Upload, Loader2, FileSpreadsheet } from "lucide-react";
import { CustomModal, CustomButton, CustomLabel } from "@/components/ui";
import { cn } from "@/utils/cn";
import { toast } from "react-toastify";

/**
 * ProductImportModal component for importing products from Excel/CSV files
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Close modal handler
 * @param {Function} props.onImportSuccess - Callback when import succeeds (optional)
 */
export function ProductImportModal({ isOpen, onClose, onImportSuccess }) {
  const [importFile, setImportFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file is Excel format
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
        "application/vnd.ms-excel", // .xls
        "text/csv", // .csv
      ];

      if (
        validTypes.includes(file.type) ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls") ||
        file.name.endsWith(".csv")
      ) {
        setImportFile(file);
      } else {
        toast.error("Please select a valid Excel file (.xlsx, .xls) or CSV file");
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

    setIsImporting(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", importFile);

      // Get access token
      const accessToken = localStorage.getItem("access_token");
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

      if (!baseURL) {
        throw new Error("API base URL is not configured");
      }

      // Call import API endpoint
      const response = await fetch(`${baseURL}/api/v1/admin/products/import`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to import products");
      }

      // Success - close modal and reset
      setImportFile(null);
      toast.success("Products imported successfully!");
      
      // Call success callback if provided
      if (onImportSuccess) {
        onImportSuccess();
      } else {
        // Default: reload page
        window.location.reload();
      }
      
      onClose();
    } catch (error) {
      console.error("Import error:", error);
      toast.error(error.message || "Failed to import products. Please try again.");
    } finally {
      setIsImporting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!isImporting) {
      setImportFile(null);
      onClose();
    }
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Products"
      size="md"
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <CustomLabel htmlFor="import-file">
            Select Excel File (.xlsx, .xls, or .csv)
          </CustomLabel>
          <div className="space-y-4">
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-6 transition-all",
                importFile
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500",
                isImporting && "opacity-50 cursor-not-allowed"
              )}
            >
              <input
                type="file"
                id="import-file"
                accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                onChange={handleFileSelect}
                disabled={isImporting}
                className="hidden"
              />
              <label
                htmlFor="import-file"
                className={cn(
                  "flex flex-col items-center justify-center text-center cursor-pointer",
                  isImporting && "cursor-not-allowed"
                )}
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Importing products...
                    </p>
                  </>
                ) : importFile ? (
                  <>
                    <FileSpreadsheet className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                      {importFile.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Click to select a different file
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Excel (.xlsx, .xls) or CSV files only
                    </p>
                  </>
                )}
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-border">
          <CustomButton
            variant="outline"
            onClick={handleClose}
            disabled={isImporting}
          >
            Cancel
          </CustomButton>
          <CustomButton
            onClick={handleImport}
            disabled={!importFile || isImporting}
            className="flex items-center gap-2"
          >
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Import Products
              </>
            )}
          </CustomButton>
        </div>
      </div>
    </CustomModal>
  );
}

