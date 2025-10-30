"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { categoryService } from "../services/categoryService";
import { toast } from "react-toastify";

/**
 * Hook for managing category form (create/edit)
 * @param {string|null} categoryId - Category ID for edit mode, null for create mode
 * @returns {Object} Form state and methods
 */
export function useCategoryForm(categoryId = null) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(!!categoryId);
  const [error, setError] = useState(null);
  const [categoryData, setCategoryData] = useState(null);

  const isEditMode = !!categoryId;

  /**
   * Fetch category data for edit mode
   */
  const fetchCategory = useCallback(async () => {
    if (!categoryId) return;

    setFetchLoading(true);
    setError(null);

    try {
      const data = await categoryService.getById(categoryId);
      setCategoryData(data.data || data);
    } catch (err) {
      setError(err.message || "Failed to fetch category");
      toast.error(err.message || "Failed to fetch category");
      console.error("Error fetching category:", err);
    } finally {
      setFetchLoading(false);
    }
  }, [categoryId]);

  /**
   * Submit form data
   * @param {Object} formValues - Form values
   * @param {File|null} imageFile - Image file to upload
   */
  const submitForm = useCallback(
    async (formValues, imageFile) => {
      setLoading(true);
      setError(null);

      try {
        // TODO: Upload image to Cloudinary and get URL
        // For now, we'll handle File objects by creating a data URL
        let imageUrl = null;

        if (imageFile && imageFile instanceof File) {
          // In production: upload to Cloudinary and get URL
          // const uploadedUrl = await uploadToCloudinary(imageFile);
          // imageUrl = uploadedUrl;

          // For now, just indicate we have a new image
          toast.info("Image upload to Cloudinary not yet implemented");
          console.log("📸 Image file ready for upload:", imageFile.name);
        }

        // Always send JSON
        const submitData = {
          name: formValues.name,
          slug: formValues.slug,
          description: formValues.description || "",
          parentId: formValues.parentId || null,
          isActive: formValues.isActive,
          sortOrder: parseInt(formValues.sortOrder) || 0,
          metaTitle: formValues.metaTitle || "",
          metaDescription: formValues.metaDescription || "",
        };

        // Add image URL if we have one (either new upload or existing)
        if (imageUrl) {
          submitData.image = imageUrl;
        } else if (categoryData?.image && !imageFile) {
          // Keep existing image URL if not changed
          submitData.image = categoryData.image;
        }

        console.log("📤 Sending JSON:");
        console.log(JSON.stringify(submitData, null, 2));

        // Submit based on mode
        if (isEditMode) {
          await categoryService.update(categoryId, submitData);
          toast.success("Category updated successfully");
        } else {
          await categoryService.create(submitData);
          toast.success("Category created successfully");
        }

        // Redirect to categories list
        router.push("/dashboard/categories");
      } catch (err) {
        const errorMessage =
          err?.message || err?.data?.message || "Failed to submit form";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error("Error submitting form:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [categoryId, isEditMode, router, categoryData]
  );

  // Fetch category data on mount if in edit mode
  useEffect(() => {
    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId, fetchCategory]);

  return {
    loading,
    fetchLoading,
    error,
    categoryData,
    isEditMode,
    submitForm,
    refetch: fetchCategory,
  };
}
