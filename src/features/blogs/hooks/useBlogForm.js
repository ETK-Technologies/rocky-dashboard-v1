"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { blogService } from "../services/blogService";
import { toast } from "react-toastify";
import { mockBlogs } from "../data/mockBlogs";

// Set to true to use mock data (useful when backend is not ready)
const USE_MOCK_DATA = false;

/**
 * Hook for managing post form (create/edit)
 * Uses mock data when backend is not available
 * @param {string|null} blogId - Post ID for edit mode, null for create mode
 * @returns {Object} Form state and methods
 */
export function useBlogForm(blogId = null) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(!!blogId);
    const [error, setError] = useState(null);
    const [blogData, setBlogData] = useState(null);

    const isEditMode = !!blogId;

    /**
     * Fetch post data for edit mode
     */
    const fetchBlog = useCallback(async () => {
        if (!blogId) return;

        setFetchLoading(true);
        setError(null);

        try {
            if (USE_MOCK_DATA) {
                // Simulate network delay
                await new Promise((resolve) => setTimeout(resolve, 300));

                // Find the post in mock data
                const post = mockBlogs.find((p) => p.id === blogId);
                if (!post) {
                    throw new Error("Post not found");
                }
                setBlogData(post);
                setFetchLoading(false);
                return;
            }

            const response = await blogService.getById(blogId);
            // Handle both { data: {...} } and direct object response
            const data = response.data || response.item || response;
            setBlogData(data);
        } catch (err) {
            const errorMessage =
                err.message || err.data?.message || "Failed to fetch post";
            setError(errorMessage);
            toast.error(errorMessage);
            console.error("Error fetching post:", err);

            // Redirect back if post not found
            if (err.status === 404 || err.statusCode === 404) {
                setTimeout(() => {
                    router.push("/dashboard/blogs");
                }, 2000);
            }
        } finally {
            setFetchLoading(false);
        }
    }, [blogId, router]);

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
                    "📤 Submitting post data:",
                    JSON.stringify(formData, null, 2)
                );

                if (USE_MOCK_DATA) {
                    // Simulate network delay
                    await new Promise((resolve) => setTimeout(resolve, 500));

                    const mockPost = {
                        id: blogId || `post-${Date.now()}`,
                        ...formData,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    };

                    if (isEditMode) {
                        toast.success("Post updated successfully (mock)");
                    } else {
                        toast.success("Post created successfully (mock)");
                    }

                    return mockPost;
                }

                // Submit based on mode
                let savedPost;
                if (isEditMode) {
                    savedPost = await blogService.update(blogId, formData);
                    toast.success("Post updated successfully");
                } else {
                    savedPost = await blogService.create(formData);
                    toast.success("Post created successfully");
                }

                // Normalize response - extract post data from response
                const post = savedPost?.data || savedPost;

                // Return the saved post for further processing
                return post;
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
        [blogId, isEditMode]
    );

    // Fetch post data on mount if in edit mode
    useEffect(() => {
        if (blogId) {
            fetchBlog();
        }
    }, [blogId, fetchBlog]);

    return {
        loading,
        fetchLoading,
        error,
        blogData,
        isEditMode,
        submitForm,
        refetch: fetchBlog,
    };
}
