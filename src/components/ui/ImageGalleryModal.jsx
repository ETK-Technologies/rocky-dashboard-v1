"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X, Check, Loader2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { CustomModal } from "./CustomModal";
import { CustomInput } from "./CustomInput";
import { CustomButton } from "./CustomButton";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { uploadService } from "@/features/uploads/services/uploadService";
import { cn } from "@/utils/cn";

/**
 * ImageGalleryModal component for browsing and selecting images from uploads
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Close modal handler
 * @param {Function} props.onSelect - Callback when image is selected (receives CDN URL)
 * @param {boolean} props.multiple - Whether multiple images can be selected
 * @param {Array<string>} props.selectedUrls - Array of already selected image URLs (for multiple mode)
 */
export function ImageGalleryModal({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  selectedUrls = [],
}) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImages, setSelectedImages] = useState(new Set(selectedUrls));
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const limit = 20;

  // Fetch images from uploads API
  const fetchImages = useCallback(
    async (pageNum = 1, reset = false) => {
      try {
        if (pageNum === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        setError(null);

        const params = {
          page: pageNum,
          limit,
          mimeType: "image/", // Only fetch images
        };

        if (searchTerm) {
          params.search = searchTerm;
        }

        const response = await uploadService.getUploads(params);

        // Handle different response structures
        let fetchedImages = [];
        if (Array.isArray(response)) {
          fetchedImages = response;
        } else if (response.data && Array.isArray(response.data)) {
          fetchedImages = response.data;
        } else if (response.uploads && Array.isArray(response.uploads)) {
          fetchedImages = response.uploads;
        }

        // Filter to only include images with CDN URLs
        const validImages = fetchedImages.filter(
          (img) => img.cdnUrl && img.mimeType?.startsWith("image/")
        );

        if (reset) {
          setImages(validImages);
        } else {
          setImages((prev) => [...prev, ...validImages]);
        }

        // Check if there are more pages
        if (response.pagination) {
          setHasMore(
            pageNum < response.pagination.totalPages &&
              validImages.length === limit
          );
        } else {
          setHasMore(validImages.length === limit);
        }

        setPage(pageNum);
      } catch (err) {
        setError(err?.message || "Failed to load images");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [searchTerm]
  );

  // Fetch images when modal opens or search changes
  useEffect(() => {
    if (isOpen) {
      setPage(1);
      setHasMore(true);
      fetchImages(1, true);
    }
  }, [isOpen, searchTerm, fetchImages]);

  // Load more images
  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchImages(page + 1, false);
    }
  };

  // Handle image selection
  const handleImageSelect = (cdnUrl) => {
    if (multiple) {
      const newSelected = new Set(selectedImages);
      if (newSelected.has(cdnUrl)) {
        newSelected.delete(cdnUrl);
      } else {
        newSelected.add(cdnUrl);
      }
      setSelectedImages(newSelected);
    } else {
      onSelect?.(cdnUrl);
      onClose();
    }
  };

  // Handle confirm selection (for multiple mode)
  const handleConfirm = () => {
    if (multiple) {
      onSelect?.(Array.from(selectedImages));
      onClose();
    }
  };

  // Update selected images when selectedUrls prop changes
  useEffect(() => {
    if (multiple && selectedUrls.length > 0) {
      setSelectedImages(new Set(selectedUrls));
    }
  }, [selectedUrls, multiple]);

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Choose from Gallery"
      size="xl"
      className="max-h-[90vh]"
    >
      <div className="flex flex-col h-full max-h-[calc(90vh-120px)]">
        {/* Search Bar */}
        <div className="mb-4 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <CustomInput
              type="text"
              placeholder="Search images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Images Grid */}
        <div className="flex-1 overflow-y-auto">
          {loading && images.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <LoadingState message="Loading images..." />
            </div>
          ) : error && images.length === 0 ? (
            <ErrorState
              title="Error loading images"
              message={error}
              action={
                <CustomButton onClick={() => fetchImages(1, true)}>
                  Retry
                </CustomButton>
              }
            />
          ) : images.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No images found</h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm
                  ? "Try adjusting your search term"
                  : "Upload some images to get started"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {images.map((image) => {
                  const isSelected = selectedImages.has(image.cdnUrl);
                  return (
                    <div
                      key={image.id || image.cdnUrl}
                      className={cn(
                        "relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all group",
                        isSelected
                          ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800"
                          : "border-border hover:border-blue-400"
                      )}
                      onClick={() => handleImageSelect(image.cdnUrl)}
                    >
                      <Image
                        src={image.cdnUrl}
                        alt={image.originalName || image.filename || "Image"}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                            <Check className="h-5 w-5 text-white" />
                          </div>
                        </div>
                      )}
                      {multiple && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div
                            className={cn(
                              "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                              isSelected
                                ? "bg-blue-500 border-blue-600"
                                : "bg-white/90 border-gray-300 dark:bg-gray-800/90 dark:border-gray-600"
                            )}
                          >
                            {isSelected && (
                              <Check className="h-4 w-4 text-white" />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="mt-4 flex justify-center">
                  <CustomButton
                    variant="outline"
                    onClick={loadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </CustomButton>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        {multiple && (
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between flex-shrink-0">
            <div className="text-sm text-muted-foreground">
              {selectedImages.size} image{selectedImages.size !== 1 ? "s" : ""}{" "}
              selected
            </div>
            <div className="flex gap-2">
              <CustomButton variant="outline" onClick={onClose}>
                Cancel
              </CustomButton>
              <CustomButton
                onClick={handleConfirm}
                disabled={selectedImages.size === 0}
              >
                Select {selectedImages.size} Image
                {selectedImages.size !== 1 ? "s" : ""}
              </CustomButton>
            </div>
          </div>
        )}
      </div>
    </CustomModal>
  );
}
