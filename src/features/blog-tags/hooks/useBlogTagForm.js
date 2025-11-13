"use client";

import { useState, useEffect, useCallback } from "react";
import { blogTagService } from "../services/blogTagService";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { mockBlogTags } from "../data/mockBlogTags";

// Set to true to use mock data (useful when backend is not ready)
const USE_MOCK_DATA = false;

/**
 * Hook for managing blog tag form state and submission
 * Uses mock data when backend is not available
 * @param {string|number|null} tagId - Tag ID for edit mode, null for create mode
 * @returns {Object} Form state and methods
 */
export function useBlogTagForm(tagId = null) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);
    const [error, setError] = useState(null);
    const [tagData, setTagData] = useState(null);
    const isEditMode = !!tagId;

    /**
     * Fetch tag data for edit mode
     */
    const fetchTag = useCallback(async () => {
        if (!tagId) return;

        setFetchLoading(true);
        setError(null);

        try {
            if (USE_MOCK_DATA) {
                // Simulate network delay
                await new Promise((resolve) => setTimeout(resolve, 300));

                // Find the tag in mock data
                const tag = mockBlogTags.find((t) => t.id === tagId);
                if (!tag) {
                    throw new Error("Tag not found");
                }
                setTagData(tag);
                setFetchLoading(false);
                return;
            }

            const response = await blogTagService.getById(tagId);
            // Handle both { data: {...} } and direct object response
            const data = response.data || response.item || response;
            setTagData(data);
        } catch (err) {
            const errorMessage =
                err.message || err.data?.message || "Failed to fetch tag";
            setError(errorMessage);
            toast.error(errorMessage);
            console.error("Error fetching tag:", err);

            // Redirect back if tag not found
            if (err.status === 404 || err.statusCode === 404) {
                setTimeout(() => {
                    router.push("/dashboard/blogs/tags");
                }, 2000);
            }
        } finally {
            setFetchLoading(false);
        }
    }, [tagId, router]);

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
                        toast.success("Tag updated successfully");
                    } else {
                        // In a real app, this would add to mock data
                        // For now, we'll just simulate success
                        toast.success("Tag created successfully");
                    }

                    // Redirect to tags list
                    router.push("/dashboard/blogs/tags");
                    return;
                }

                if (isEditMode) {
                    await blogTagService.update(tagId, formData);
                    toast.success("Tag updated successfully");
                } else {
                    await blogTagService.create(formData);
                    toast.success("Tag created successfully");
                }

                // Redirect to tags list
                router.push("/dashboard/blogs/tags");
            } catch (err) {
                // Handle different types of errors
                let errorMessage = "Failed to save tag";

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
                console.error("Error saving tag:", err);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [tagId, isEditMode, router]
    );

    // Fetch tag data on mount if in edit mode
    useEffect(() => {
        if (isEditMode) {
            fetchTag();
        }
    }, [isEditMode, fetchTag]);

    return {
        loading,
        fetchLoading,
        error,
        tagData,
        isEditMode,
        submitForm,
        refetch: fetchTag,
    };
}
