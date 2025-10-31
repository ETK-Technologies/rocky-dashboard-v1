"use client";

import { useState, useRef } from "react";
import { Upload, X, FileImage, Loader2 } from "lucide-react";
import { CustomButton } from "@/components/ui";
import { useUploads } from "../hooks/useUploads";
import { cn } from "@/utils/cn";

export function FileUpload({ 
  onUploadComplete, 
  onUpload, // Optional custom upload handler (for folder-aware uploads)
  multiple = false, 
  accept = "image/*",
  maxFiles = 10,
  className 
}) {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { uploadFiles: defaultUploadFiles } = useUploads();
  
  // Use custom upload handler if provided, otherwise use default
  const uploadFiles = onUpload || defaultUploadFiles;

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    if (selectedFiles.length === 0) return;

    // Limit number of files
    const filesToAdd = multiple 
      ? selectedFiles.slice(0, maxFiles - files.length)
      : [selectedFiles[0]];
    
    setFiles((prev) => {
      const newFiles = multiple ? [...prev, ...filesToAdd] : filesToAdd;
      return newFiles;
    });

    // Create previews for images
    filesToAdd.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviews((prev) => [...prev, e.target.result]);
        };
        reader.readAsDataURL(file);
      }
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploaded = await uploadFiles(files);
      if (onUploadComplete) {
        onUploadComplete(uploaded);
      }
      // Clear files after successful upload
      setFiles([]);
      setPreviews([]);
    } catch (error) {
      // Error is already handled by hook
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      const event = { target: { files: droppedFiles } };
      handleFileSelect(event);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* File Input */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary transition-colors"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center gap-2"
        >
          <Upload className="h-10 w-10 text-muted-foreground" />
          <div className="text-sm text-muted-foreground">
            <span className="text-primary font-medium">Click to upload</span> or drag and drop
          </div>
          <div className="text-xs text-muted-foreground">
            {accept === "image/*" ? "Images" : "Files"} only
          </div>
        </label>
      </div>

      {/* File Previews */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {files.map((file, index) => (
              <div
                key={index}
                className="relative group border rounded-lg overflow-hidden bg-secondary"
              >
                {file.type.startsWith("image/") && previews[index] ? (
                  <img
                    src={previews[index]}
                    alt={file.name}
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div className="w-full h-32 flex items-center justify-center">
                    <FileImage className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="p-2">
                  <p className="text-xs text-muted-foreground truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ))}
          </div>

          <CustomButton
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              `Upload ${files.length} file${files.length > 1 ? "s" : ""}`
            )}
          </CustomButton>
        </div>
      )}
    </div>
  );
}

