"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { pageService } from "../services/pageService";
import { toast } from "react-toastify";

/**
 * Hook for managing page form (create/edit)
 * @param {string|null} pageId - Page ID for edit mode, null for create mode
 * @returns {Object} Form state and methods
 */
export function usePageForm(pageId = null) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(!!pageId);
    const [error, setError] = useState(null);
    const [pageData, setPageData] = useState(null);

    const isEditMode = !!pageId;

    /**
     * Fetch page data for edit mode
     */
    const fetchPage = useCallback(async () => {
        if (!pageId) return;

        setFetchLoading(true);
        setError(null);

        try {
            const response = await pageService.getById(pageId);
            // Handle both { data: {...} } and direct object response
            const data = response.data || response.item || response;
            setPageData(data);
        } catch (err) {
            const errorMessage =
                err.message || err.data?.message || "Failed to fetch page";
            setError(errorMessage);
            toast.error(errorMessage);
            console.error("Error fetching page:", err);

            // Redirect back if page not found
            if (err.status === 404 || err.statusCode === 404) {
                setTimeout(() => {
                    router.push("/dashboard/pages");
                }, 2000);
            }
        } finally {
            setFetchLoading(false);
        }
    }, [pageId, router]);

    /**
     * Submit form data
     * @param {Object} formData - Complete form data
     */
    const submitForm = useCallback(
        async (formData) => {
            setLoading(true);
            setError(null);

            try {
                console.log(
                    "📤 Submitting page data:",
                    JSON.stringify(formData, null, 2)
                );

                // Submit based on mode
                let savedPage;
                if (isEditMode) {
                    savedPage = await pageService.update(pageId, formData);
                    toast.success("Page updated successfully");
                } else {
                    savedPage = await pageService.create(formData);
                    toast.success("Page created successfully");
                }

                // Normalize response - extract page data from response
                const page = savedPage?.data || savedPage;

                // Return the saved page for further processing
                return page;
            } catch (err) {
                // Handle different types of errors
                let errorMessage = "Failed to submit form";

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
                console.error("Error submitting form:", err);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [pageId, isEditMode]
    );

    // Fetch page data on mount if in edit mode
    useEffect(() => {
        if (pageId) {
            fetchPage();
        }
    }, [pageId, fetchPage]);

    return {
        loading,
        fetchLoading,
        error,
        pageData,
        isEditMode,
        submitForm,
        refetch: fetchPage,
    };
}
