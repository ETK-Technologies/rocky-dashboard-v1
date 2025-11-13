"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { blogCategoryService } from "../services/blogCategoryService";
import { toast } from "react-toastify";
import { getMockBlogCategories } from "../data/mockBlogCategories";

// Set to true to use mock data (useful when backend is not ready)
const USE_MOCK_DATA = false;

/**
 * Hook for fetching and managing blog categories list
 * @returns {Object} Blog categories state and methods
 */
export function useBlogCategories(initialFilters = {}) {
    const [categories, setCategories] = useState([]);
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
     * Fetch all blog categories
     * @param {Object} newFilters - Filter options
     */
    const fetchCategories = useCallback(async (newFilters) => {
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

                const result = getMockBlogCategories({
                    search: filtersToUse.search,
                    page: filtersToUse.page || 1,
                    limit: filtersToUse.limit || 10,
                });
                setCategories(result.categories);
                setPagination(result.pagination);
            } else {
                // Call backend API with filters
                const response = await blogCategoryService.getAll({
                    search: filtersToUse.search,
                    parentId: filtersToUse.parentId,
                    isActive: filtersToUse.isActive,
                    page: filtersToUse.page || 1,
                    limit: filtersToUse.limit || 10,
                });

                // Handle response structure
                // Expected format: { items: [...], pagination: { total, page, limit, pages } }
                const categories =
                    response.items ||
                    response.data ||
                    response.categories ||
                    [];
                const paginationData =
                    response.pagination || response.meta || {};

                setCategories(categories);
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
                const result = getMockBlogCategories({
                    search: filtersToUse.search,
                    page: filtersToUse.page || 1,
                    limit: filtersToUse.limit || 10,
                });
                setCategories(result.categories);
                setPagination(result.pagination);
            } else {
                setError(err.message || "Failed to fetch blog categories");
                toast.error(err.message || "Failed to fetch blog categories");
                console.error("Error fetching blog categories:", err);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Delete a blog category
     * @param {string|number} id - Category ID
     */
    const deleteCategory = useCallback(
        async (id) => {
            try {
                if (USE_MOCK_DATA) {
                    // Simulate network delay
                    await new Promise((resolve) => setTimeout(resolve, 200));
                    // Remove from local state
                    setCategories((prev) =>
                        prev.filter((cat) => cat.id !== id)
                    );
                    toast.success("Category deleted successfully");
                    return;
                }

                await blogCategoryService.delete(id);
                toast.success("Category deleted successfully");
                // Refresh categories list
                await fetchCategories();
            } catch (err) {
                const errorMessage =
                    err.message ||
                    err.data?.message ||
                    "Failed to delete category";
                toast.error(errorMessage);
                console.error("Error deleting category:", err);
                throw err;
            }
        },
        [fetchCategories]
    );

    /**
     * Bulk delete blog categories
     * @param {Array<string|number>} ids - Array of category IDs
     */
    const bulkDeleteCategories = useCallback(
        async (ids) => {
            try {
                if (USE_MOCK_DATA) {
                    // Simulate network delay
                    await new Promise((resolve) => setTimeout(resolve, 200));
                    // Remove from local state
                    setCategories((prev) =>
                        prev.filter((cat) => !ids.includes(cat.id))
                    );
                    toast.success(
                        `${ids.length} categories deleted successfully`
                    );
                    return;
                }

                await blogCategoryService.bulkDelete(ids);
                toast.success(
                    `${ids.length} categor${
                        ids.length === 1 ? "y" : "ies"
                    } deleted successfully`
                );
                // Refresh categories list
                await fetchCategories();
            } catch (err) {
                const errorMessage =
                    err.message ||
                    err.data?.message ||
                    "Failed to delete categories";
                toast.error(errorMessage);
                console.error("Error deleting categories:", err);
                throw err;
            }
        },
        [fetchCategories]
    );

    /**
     * Update filters and refetch
     */
    const updateFilters = useCallback(
        (newFilters) => {
            fetchCategories(newFilters);
        },
        [fetchCategories]
    );

    // Fetch categories on mount (only once)
    useEffect(() => {
        fetchCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        categories,
        loading,
        error,
        pagination,
        fetchCategories,
        updateFilters,
        deleteCategory,
        bulkDeleteCategories,
    };
}
