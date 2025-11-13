"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { blogTagService } from "../services/blogTagService";
import { toast } from "react-toastify";
import { getMockBlogTags } from "../data/mockBlogTags";

// Set to true to use mock data (useful when backend is not ready)
const USE_MOCK_DATA = false;

/**
 * Hook for fetching and managing blog tags list
 * @returns {Object} Blog tags state and methods
 */
export function useBlogTags(initialFilters = {}) {
    const [tags, setTags] = useState([]);
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
     * Fetch all blog tags
     * @param {Object} newFilters - Filter options
     */
    const fetchTags = useCallback(async (newFilters) => {
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

                const result = getMockBlogTags({
                    search: filtersToUse.search,
                    page: filtersToUse.page || 1,
                    limit: filtersToUse.limit || 10,
                });
                setTags(result.tags);
                setPagination(result.pagination);
            } else {
                // Call backend API with filters
                const response = await blogTagService.getAll({
                    search: filtersToUse.search,
                    page: filtersToUse.page || 1,
                    limit: filtersToUse.limit || 10,
                });

                // Handle response structure
                // Expected format: { items: [...], pagination: { total, page, limit, pages } }
                const tags =
                    response.items || response.data || response.tags || [];
                const paginationData =
                    response.pagination || response.meta || {};

                setTags(tags);
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
            }
        } catch (err) {
            // Fallback to mock data on error if not already using it
            if (!USE_MOCK_DATA) {
                console.warn(
                    "API error, falling back to mock data:",
                    err.message
                );
                const result = getMockBlogTags({
                    search: filtersToUse.search,
                    page: filtersToUse.page || 1,
                    limit: filtersToUse.limit || 10,
                });
                setTags(result.tags);
                setPagination(result.pagination);
            } else {
                setError(err.message || "Failed to fetch blog tags");
                toast.error(err.message || "Failed to fetch blog tags");
                console.error("Error fetching blog tags:", err);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Delete a blog tag
     * @param {string|number} id - Tag ID
     */
    const deleteTag = useCallback(
        async (id) => {
            try {
                if (USE_MOCK_DATA) {
                    // Simulate network delay
                    await new Promise((resolve) => setTimeout(resolve, 200));
                    // Remove from local state
                    setTags((prev) => prev.filter((tag) => tag.id !== id));
                    toast.success("Tag deleted successfully");
                    return;
                }

                await blogTagService.delete(id);
                toast.success("Tag deleted successfully");
                // Refresh tags list
                await fetchTags();
            } catch (err) {
                const errorMessage =
                    err.message || err.data?.message || "Failed to delete tag";
                toast.error(errorMessage);
                console.error("Error deleting tag:", err);
                throw err;
            }
        },
        [fetchTags]
    );

    /**
     * Bulk delete blog tags
     * @param {Array<string|number>} ids - Array of tag IDs
     */
    const bulkDeleteTags = useCallback(
        async (ids) => {
            try {
                if (USE_MOCK_DATA) {
                    // Simulate network delay
                    await new Promise((resolve) => setTimeout(resolve, 200));
                    // Remove from local state
                    setTags((prev) =>
                        prev.filter((tag) => !ids.includes(tag.id))
                    );
                    toast.success(`${ids.length} tags deleted successfully`);
                    return;
                }

                await blogTagService.bulkDelete(ids);
                toast.success(
                    `${ids.length} tag${
                        ids.length === 1 ? "" : "s"
                    } deleted successfully`
                );
                // Refresh tags list
                await fetchTags();
            } catch (err) {
                const errorMessage =
                    err.message || err.data?.message || "Failed to delete tags";
                toast.error(errorMessage);
                console.error("Error deleting tags:", err);
                throw err;
            }
        },
        [fetchTags]
    );

    /**
     * Update filters and refetch
     */
    const updateFilters = useCallback(
        (newFilters) => {
            fetchTags(newFilters);
        },
        [fetchTags]
    );

    // Fetch tags on mount (only once)
    useEffect(() => {
        fetchTags();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        tags,
        loading,
        error,
        pagination,
        fetchTags,
        updateFilters,
        deleteTag,
        bulkDeleteTags,
    };
}
