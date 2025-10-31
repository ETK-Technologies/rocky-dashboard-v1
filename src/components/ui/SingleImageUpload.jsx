"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { CustomLabel } from "./CustomLabel";
import { CustomButton } from "./CustomButton";
import { useUploads } from "@/features/uploads";

/**
 * SingleImageUpload component for uploading a single image
 * Now uses the upload API and returns the CDN URL
 * @param {Object} props - Component props
 * @param {string} props.label - Field label
 * @param {string} props.value - Current image URL
 * @param {Function} props.onChange - Callback when image changes (receives CDN URL string)
 * @param {Function} props.onRemove - Callback when image is removed
 * @param {string} props.error - Error message
 * @param {boolean} props.required - Whether field is required
 * @param {string} props.helperText - Helper text
 * @param {string} props.className - Additional CSS classes
 */
export function SingleImageUpload({
  label,
  value,
  onChange,
  onRemove,
  error,
  required,
  helperText,
  className,
}) {
  const [preview, setPreview] = useState(value || null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { uploadFiles } = useUploads();

  // Update preview when value changes externally
  useEffect(() => {
    if (value) {
      setPreview(value);
    } else if (!value && preview) {
      setPreview(null);
    }
  }, [value]);

  const handleFileChange = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return;
    }

    // Create preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload file
    setIsUploading(true);
    try {
      const uploaded = await uploadFiles([file]);
      if (uploaded && uploaded.length > 0 && uploaded[0].cdnUrl) {
        const cdnUrl = uploaded[0].cdnUrl;
        setPreview(cdnUrl);
        onChange?.(cdnUrl);
      }
    } catch (err) {
      // Error is already handled by hook
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onRemove?.();
    onChange?.(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <CustomLabel>
          {label}
          {required && (
            <span className="text-red-600 dark:text-red-400 ml-1">*</span>
          )}
        </CustomLabel>
      )}

      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-all",
          !isUploading && "cursor-pointer",
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500",
          error && "border-red-500 dark:border-red-400",
          preview && "p-2",
          isUploading && "opacity-50 cursor-not-allowed"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
          disabled={isUploading}
        />

        {preview ? (
          <div className="relative group">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
            )}
            {!isUploading && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <CustomButton
                  variant="destructive"
                  size="sm"
                  onClick={handleRemove}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Remove
                </CustomButton>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            {isUploading ? (
              <>
                <Loader2 className="h-12 w-12 text-blue-600 dark:text-blue-400 animate-spin mb-3" />
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Uploading...
                </p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                  {isDragging ? (
                    <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                  )}
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  {isDragging
                    ? "Drop image here"
                    : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, GIF up to 10MB
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
}
