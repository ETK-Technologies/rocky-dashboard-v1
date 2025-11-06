"use client";

import { useState, useCallback } from "react";
import { searchService } from "../services/searchService";
import { toast } from "react-toastify";

/**
 * Hook for product search functionality
 * @param {Object} initialParams - Initial search parameters
 * @returns {Object} Search state and methods
 */
export function useSearch(initialParams = {}) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState({
    q: "",
    limit: 20,
    offset: 0,
    ...initialParams,
  });
  const [stats, setStats] = useState({
    totalHits: 0,
    processingTimeMs: 0,
    query: "",
  });

  /**
   * Perform search with current parameters
   */
  const search = useCallback(async (params = {}) => {
    const searchQuery = { ...searchParams, ...params };

    // Don't search if query is empty
    if (!searchQuery.q || searchQuery.q.trim() === "") {
      setResults([]);
      setStats({
        totalHits: 0,
        processingTimeMs: 0,
        query: "",
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await searchService.searchProducts(searchQuery);
      
      setResults(response.hits || []);
      setStats({
        totalHits: response.totalHits || 0,
        processingTimeMs: response.processingTimeMs || 0,
        query: response.query || searchQuery.q,
      });
      
      // Update search params
      setSearchParams(searchQuery);
      
      return response;
    } catch (err) {
      const errorMessage = err.message || "Failed to search products";
      setError(errorMessage);
      toast.error(errorMessage);
      setResults([]);
      setStats({
        totalHits: 0,
        processingTimeMs: 0,
        query: searchQuery.q,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  /**
   * Update search parameters
   * @param {Object} newParams - New search parameters
   */
  const updateParams = useCallback((newParams) => {
    setSearchParams((prev) => ({
      ...prev,
      ...newParams,
      // Reset offset when other params change (except when explicitly setting offset)
      offset: newParams.offset !== undefined ? newParams.offset : 0,
    }));
  }, []);

  /**
   * Clear search results
   */
  const clearSearch = useCallback(() => {
    setResults([]);
    setError(null);
    setSearchParams((prev) => ({
      ...prev,
      q: "",
      offset: 0,
    }));
    setStats({
      totalHits: 0,
      processingTimeMs: 0,
      query: "",
    });
  }, []);

  /**
   * Load more results (pagination)
   */
  const loadMore = useCallback(async () => {
    if (loading || results.length >= stats.totalHits) {
      return;
    }

    const nextOffset = searchParams.offset + searchParams.limit;
    await search({ offset: nextOffset });
  }, [loading, results.length, stats.totalHits, searchParams.offset, searchParams.limit, search]);

  /**
   * Check if there are more results to load
   */
  const hasMore = results.length < stats.totalHits;

  return {
    results,
    loading,
    error,
    searchParams,
    stats,
    search,
    updateParams,
    clearSearch,
    loadMore,
    hasMore,
  };
}

