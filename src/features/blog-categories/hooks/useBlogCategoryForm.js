"use client";

import { useState, useEffect, useCallback } from "react";
import { blogCategoryService } from "../services/blogCategoryService";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { mockBlogCategories } from "../data/mockBlogCategories";

// Set to true to use mock data (useful when backend is not ready)
const USE_MOCK_DATA = false;

/**
 * Hook for managing blog category form state and submission
 * Uses mock data when backend is not available
 * @param {string|number|null} categoryId - Category ID for edit mode, null for create mode
 * @returns {Object} Form state and methods
 */
export function useBlogCategoryForm(categoryId = null) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);
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
            if (USE_MOCK_DATA) {
                // Simulate network delay
                await new Promise((resolve) => setTimeout(resolve, 300));

                // Find the category in mock data
                const category = mockBlogCategories.find(
                    (c) => c.id === categoryId
                );
                if (!category) {
                    throw new Error("Category not found");
                }
                setCategoryData(category);
                setFetchLoading(false);
                return;
            }

            const response = await blogCategoryService.getById(categoryId);
            // Handle both { data: {...} } and direct object response
            const data = response.data || response.item || response;
            setCategoryData(data);
        } catch (err) {
            const errorMessage =
                err.message || err.data?.message || "Failed to fetch category";
            setError(errorMessage);
            toast.error(errorMessage);
            console.error("Error fetching category:", err);

            // Redirect back if category not found
            if (err.status === 404 || err.statusCode === 404) {
                setTimeout(() => {
                    router.push("/dashboard/blogs/categories");
                }, 2000);
            }
        } finally {
            setFetchLoading(false);
        }
    }, [categoryId, router]);

    /**
     * Submit form (create or update)
     * @param {Object} formData - Form data
     */
    const submitForm = useCallback(
        async (formData) => {
            setLoading(true);
            setError(null);

            try {
                if (USE_MOCK_DATA) {
                    // Simulate network delay
                    await new Promise((resolve) => setTimeout(resolve, 500));

                    if (isEditMode) {
                        // In a real app, this would update the mock data
                        // For now, we'll just simulate success
                        toast.success("Category updated successfully");
                    } else {
                        // In a real app, this would add to mock data
                        // For now, we'll just simulate success
                        toast.success("Category created successfully");
                    }

                    // Redirect to categories list
                    router.push("/dashboard/blogs/categories");
                    return;
                }

                if (isEditMode) {
                    await blogCategoryService.update(categoryId, formData);
                    toast.success("Category updated successfully");
                } else {
                    await blogCategoryService.create(formData);
                    toast.success("Category created successfully");
                }

                // Redirect to categories list
                router.push("/dashboard/blogs/categories");
            } catch (err) {
                // Handle different types of errors
                let errorMessage = "Failed to save category";

                if (err.message) {
                    errorMessage = err.message;
                } else if (err.data && err.data.message) {
                    errorMessage = err.data.message;
                } else if (err.error) {
                    errorMessage = err.error;
                }

                // Handle validation errors (if backend returns field-specific errors)
                if (err.data && err.data.errors) {
                    const fieldErrors = err.data.errors;
                    const errorMessages = Object.values(fieldErrors).flat();
                    if (errorMessages.length > 0) {
                        errorMessage = errorMessages.join(", ");
                    }
                }

                setError(errorMessage);
                toast.error(errorMessage);
                console.error("Error saving category:", err);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [categoryId, isEditMode, router]
    );

    // Fetch category data on mount if in edit mode
    useEffect(() => {
        if (isEditMode) {
            fetchCategory();
        }
    }, [isEditMode, fetchCategory]);

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
