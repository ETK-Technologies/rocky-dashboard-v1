"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { pageService } from "../services/pageService";
import { toast } from "react-toastify";

/**
 * Hook for fetching and managing pages list with filtering
 * @param {Object} initialFilters - Initial filter values
 * @returns {Object} Pages state and methods
 */
export function usePages(initialFilters = {}) {
    const [pages, setPages] = useState([]);
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
     * Fetch pages with current filters
     */
    const fetchPages = useCallback(async (newFilters) => {
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
            // Filter out undefined values to avoid sending them to the API
            const cleanFilters = Object.fromEntries(
                Object.entries(filtersToUse).filter(
                    ([_, value]) =>
                        value !== undefined && value !== null && value !== ""
                )
            );

            const response = await pageService.getAll(cleanFilters);

            // Handle response structure
            // Expected format: { items: [...], pagination: { total, page, limit, pages } }
            const list =
                response.items || response.data || response.pages || [];
            const paginationData = response.pagination || response.meta || {};

            setPages(Array.isArray(list) ? list : []);
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
            setError(err.message || "Failed to fetch pages");
            setPages([]); // Ensure pages is an empty array on error
            toast.error(err.message || "Failed to fetch pages");
            console.error("Error fetching pages:", err);
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
            fetchPages(newFilters);
        },
        [fetchPages]
    );

    /**
     * Delete a page
     * @param {string} id - Page ID
     */
    const deletePage = useCallback(
        async (id) => {
            try {
                await pageService.delete(id);
                toast.success("Page deleted successfully");
                // Refresh pages list
                await fetchPages();
            } catch (err) {
                const errorMessage =
                    err.message || err.data?.message || "Failed to delete page";
                toast.error(errorMessage);
                console.error("Error deleting page:", err);
                throw err;
            }
        },
        [fetchPages]
    );

    /**
     * Bulk delete pages
     * @param {Array<string>} ids - Array of page IDs
     * @returns {Promise<Object>} Response with deletedCount, deletedIds, and missingIds
     */
    const bulkDeletePages = useCallback(
        async (ids) => {
            try {
                if (!ids || ids.length === 0) {
                    throw new Error("No pages selected");
                }

                const response = await pageService.bulkDelete(ids);
                const deletedCount = response.deletedCount || 0;
                const missingIds = response.missingIds || [];

                if (deletedCount > 0) {
                    toast.success(
                        `${deletedCount} page${
                            deletedCount > 1 ? "s" : ""
                        } deleted successfully`
                    );
                }

                if (missingIds.length > 0) {
                    toast.warning(
                        `${missingIds.length} page${
                            missingIds.length > 1 ? "s" : ""
                        } not found`
                    );
                }

                // Refresh pages list
                await fetchPages();
                return response;
            } catch (err) {
                const errorMessage =
                    err.message ||
                    err.data?.message ||
                    "Failed to delete pages";
                toast.error(errorMessage);
                console.error("Error bulk deleting pages:", err);
                throw err;
            }
        },
        [fetchPages]
    );

    /**
     * Search pages
     * @param {string} query - Search query
     */
    const searchPages = useCallback(
        async (query) => {
            if (!query || query.trim() === "") {
                // Reset to all pages if search is empty
                updateFilters({ search: undefined });
                return;
            }

            updateFilters({ search: query });
        },
        [updateFilters]
    );

    // Fetch pages on mount (only once)
    useEffect(() => {
        fetchPages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        pages,
        pagination,
        loading,
        error,
        filters,
        updateFilters,
        fetchPages,
        deletePage,
        bulkDeletePages,
        searchPages,
    };
}
