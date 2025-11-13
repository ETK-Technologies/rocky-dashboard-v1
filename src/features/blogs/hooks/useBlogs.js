"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { blogService } from "../services/blogService";
import { searchService } from "@/features/search";
import { toast } from "react-toastify";
import { getMockBlogs } from "../data/mockBlogs";

// Set to true to use mock data (useful when backend is not ready)
const USE_MOCK_DATA = false;

/**
 * Hook for fetching and managing blogs list with filtering
 * Uses search API when search query is present, otherwise uses regular blogs API
 * Falls back to mock data if API is not available
 * @param {Object} initialFilters - Initial filter values
 * @returns {Object} Blogs state and methods
 */
export function useBlogs(initialFilters = {}) {
    const [blogs, setBlogs] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        ...initialFilters,
    });

    // Use ref to store current filters to avoid stale closures
    const filtersRef = useRef(filters);

    // Update ref when filters change
    useEffect(() => {
        filtersRef.current = filters;
    }, [filters]);

    /**
     * Fetch posts with current filters
     * Uses search API if search query is present, otherwise uses regular posts API
     * Falls back to mock data if API is not available
     */
    const fetchBlogs = useCallback(async (newFilters) => {
        // If no filters provided, use current filters from ref
        const filtersToUse =
            newFilters !== undefined
                ? { ...filtersRef.current, ...newFilters }
                : filtersRef.current;

        // Only update filters state if new filters were provided
        if (newFilters !== undefined) {
            setFilters(filtersToUse);
        }

        setLoading(true);
        setError(null);

        try {
            // Use mock data if enabled or fallback on API error
            if (USE_MOCK_DATA) {
                // Simulate network delay for realistic experience
                await new Promise((resolve) => setTimeout(resolve, 300));

                const { posts: mockPostsData, pagination: mockPagination } =
                    getMockBlogs({
                        page: filtersToUse.page,
                        limit: filtersToUse.limit,
                        search: filtersToUse.search,
                        status: filtersToUse.status,
                        categoryId: filtersToUse.categoryId,
                        sort: filtersToUse.sort,
                    });

                setBlogs(mockPostsData);
                setPagination(mockPagination);
                setLoading(false);
                return;
            }

            // Use regular posts API - backend handles search via search parameter
            // Filter out undefined values to avoid sending them to the API
            const cleanFilters = Object.fromEntries(
                Object.entries(filtersToUse).filter(
                    ([_, value]) =>
                        value !== undefined && value !== null && value !== ""
                )
            );

            const response = await blogService.getAll(cleanFilters);

            // Handle response structure
            // Expected format: { items: [...], pagination: { total, page, limit, pages } }
            const list =
                response.items || response.data || response.posts || [];
            const paginationData = response.pagination || response.meta || {};

            setBlogs(Array.isArray(list) ? list : []);
            setPagination({
                page: paginationData.page || filtersToUse.page || 1,
                limit: paginationData.limit || filtersToUse.limit || 10,
                total: paginationData.total || 0,
                totalPages:
                    paginationData.pages ||
                    paginationData.totalPages ||
                    Math.ceil(
                        (paginationData.total || 0) /
                            (paginationData.limit || 10)
                    ),
            });
        } catch (err) {
            setError(err.message || "Failed to fetch blogs");
            setBlogs([]); // Ensure posts is an empty array on error
            toast.error(err.message || "Failed to fetch blogs");
            console.error("Error fetching posts:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Update filters
     * @param {Object} newFilters - New filter values
     */
    const updateFilters = useCallback(
        (newFilters) => {
            fetchBlogs(newFilters);
        },
        [fetchBlogs]
    );

    /**
     * Delete a post
     * @param {string} id - Post ID
     */
    const deleteBlog = useCallback(
        async (id) => {
            try {
                if (USE_MOCK_DATA) {
                    // Simulate network delay
                    await new Promise((resolve) => setTimeout(resolve, 500));
                    toast.success("Post deleted successfully (mock)");
                    // Refresh posts list
                    await fetchBlogs();
                    return;
                }

                await blogService.delete(id);
                toast.success("Post deleted successfully");
                // Refresh posts list
                await fetchBlogs();
            } catch (err) {
                const errorMessage =
                    err.message || err.data?.message || "Failed to delete post";
                toast.error(errorMessage);
                console.error("Error deleting post:", err);
                throw err;
            }
        },
        [fetchBlogs]
    );

    /**
     * Bulk delete posts
     * @param {Array<string>} ids - Array of post IDs
     * @returns {Promise<Object>} Response with deletedCount, deletedIds, and missingIds
     */
    const bulkDeleteBlogs = useCallback(
        async (ids) => {
            try {
                if (!ids || ids.length === 0) {
                    throw new Error("No posts selected");
                }

                if (USE_MOCK_DATA) {
                    // Simulate network delay
                    await new Promise((resolve) => setTimeout(resolve, 500));
                    const deletedCount = ids.length;
                    toast.success(
                        `${deletedCount} post${
                            deletedCount > 1 ? "s" : ""
                        } deleted successfully (mock)`
                    );
                    // Refresh posts list
                    await fetchBlogs();
                    return {
                        deletedCount,
                        deletedIds: ids,
                        missingIds: [],
                    };
                }

                const response = await blogService.bulkDelete(ids);
                const deletedCount = response.deletedCount || 0;
                const missingIds = response.missingIds || [];

                if (deletedCount > 0) {
                    toast.success(
                        `${deletedCount} post${
                            deletedCount > 1 ? "s" : ""
                        } deleted successfully`
                    );
                }

                if (missingIds.length > 0) {
                    toast.warning(
                        `${missingIds.length} post${
                            missingIds.length > 1 ? "s" : ""
                        } not found`
                    );
                }

                // Refresh posts list
                await fetchBlogs();
                return response;
            } catch (err) {
                const errorMessage =
                    err.message ||
                    err.data?.message ||
                    "Failed to delete posts";
                toast.error(errorMessage);
                console.error("Error bulk deleting posts:", err);
                throw err;
            }
        },
        [fetchBlogs]
    );

    /**
     * Search posts
     * @param {string} query - Search query
     */
    const searchPosts = useCallback(
        async (query) => {
            if (!query || query.trim() === "") {
                // Reset to all posts if search is empty
                updateFilters({ search: undefined });
                return;
            }

            updateFilters({ search: query });
        },
        [updateFilters]
    );

    // Fetch posts on mount (only once)
    useEffect(() => {
        fetchBlogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        blogs,
        pagination,
        loading,
        error,
        filters,
        updateFilters,
        fetchBlogs,
        deleteBlog,
        bulkDeleteBlogs,
        searchPosts,
    };
}
