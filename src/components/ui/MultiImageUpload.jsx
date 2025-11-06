"use client";

import { useState, useRef } from "react";
import {
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  Trash2,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { CustomLabel } from "./CustomLabel";
import { CustomButton } from "./CustomButton";
import { useUploads } from "@/features/uploads";
import { ImageGalleryModal } from "./ImageGalleryModal";
import Image from "next/image";

/**
 * MultiImageUpload component for uploading multiple images
 * @param {Object} props - Component props
 * @param {string} props.label - Field label
 * @param {Array<string>} props.value - Array of current image URLs
 * @param {Function} props.onChange - Callback when images change (receives array of CDN URLs)
 * @param {string} props.error - Error message
 * @param {boolean} props.required - Whether field is required
 * @param {string} props.helperText - Helper text
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.maxImages - Maximum number of images allowed
 */
export function MultiImageUpload({
  label,
  value = [],
  onChange,
  error,
  required,
  helperText,
  className,
  maxImages = 50,
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const fileInputRef = useRef(null);
  const { uploadFiles } = useUploads();

  const handleFileChange = async (files) => {
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - value.length;
    if (remainingSlots <= 0) {
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    // Filter only image files
    const imageFiles = filesToUpload.filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length === 0) return;

    setIsUploading(true);

    try {
      // Create immediate previews
      const newUrls = [...value];

      for (let i = 0; i < imageFiles.length; i++) {
        setUploadingIndex(i);
        const uploaded = await uploadFiles([imageFiles[i]]);
        if (uploaded && uploaded.length > 0 && uploaded[0].cdnUrl) {
          newUrls.push(uploaded[0].cdnUrl);
        }
      }

      onChange?.(newUrls);
    } catch (err) {
      // Error is already handled by hook
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setIsUploading(false);
      setUploadingIndex(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleInputChange = (e) => {
    const files = e.target.files;
    if (files) {
      handleFileChange(files);
    }
  };

  const handleRemove = (index) => {
    const newUrls = value.filter((_, i) => i !== index);
    onChange?.(newUrls);
  };

  const handleClick = () => {
    if (!isUploading && value.length < maxImages) {
      fileInputRef.current?.click();
    }
  };

  const handleGallerySelect = (selectedUrls) => {
    if (Array.isArray(selectedUrls)) {
      // Filter out already selected images and respect maxImages limit
      const newUrls = selectedUrls.filter((url) => !value.includes(url));
      const remainingSlots = maxImages - value.length;
      const urlsToAdd = newUrls.slice(0, remainingSlots);
      if (urlsToAdd.length > 0) {
        onChange?.([...value, ...urlsToAdd]);
      }
    }
  };

  const remainingSlots = maxImages - value.length;

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

      {/* Image Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3  gap-3">
          {value.map((url, index) => (
            <div
              key={index}
              className="relative group aspect-square border border-border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
            >
              <Image
                src={url}
                alt={`Image ${index + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-2 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
                  disabled={isUploading}
                >
                  <Trash2 className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {remainingSlots > 0 && (
        <div className="space-y-2">
          <div
            onClick={handleClick}
            className={cn(
              "border-2 border-dashed rounded-lg p-6 transition-all",
              !isUploading && "cursor-pointer",
              "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500",
              error && "border-red-500 dark:border-red-400",
              isUploading && "opacity-50 cursor-not-allowed"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleInputChange}
              className="hidden"
              disabled={isUploading || value.length >= maxImages}
            />

            <div className="flex flex-col items-center justify-center text-center">
              {isUploading ? (
                <>
                  <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Uploading...
                  </p>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-2">
                    <Upload className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                    Click to upload images
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG, GIF up to 10MB
                  </p>
                  {maxImages !== Infinity && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {remainingSlots}{" "}
                      {remainingSlots === 1 ? "image" : "images"} remaining
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Gallery Button */}
          <CustomButton
            type="button"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              setGalleryOpen(true);
            }}
            className="w-full"
            disabled={isUploading || value.length >= maxImages}
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            Choose from Gallery
          </CustomButton>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{helperText}</p>
      )}

      {/* Gallery Modal */}
      <ImageGalleryModal
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        onSelect={handleGallerySelect}
        multiple={true}
        selectedUrls={value}
      />
    </div>
  );
}
