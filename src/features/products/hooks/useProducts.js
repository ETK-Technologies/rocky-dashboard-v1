"use client";

import { useState, useEffect, useCallback } from "react";
import { productService } from "../services/productService";
import { toast } from "react-toastify";

/**
 * Hook for fetching and managing products list with filtering
 * @param {Object} initialFilters - Initial filter values
 * @returns {Object} Products state and methods
 */
export function useProducts(initialFilters = {}) {
  const [products, setProducts] = useState([]);
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

  /**
   * Fetch products with current filters
   */
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await productService.getAll(filters);

      // Normalize various possible API shapes
      // Supported shapes:
      // 1) { data: [...], pagination: {...} }
      // 2) { items: [...], meta: { page, limit, total, totalPages } }
      // 3) { results: [...], page, limit, total, totalPages }
      // 4) { products: [...], pagination: { page, limit, total, pages } }
      // 5) [...]
      let list = [];
      let paginationData = null;

      if (Array.isArray(response)) {
        list = response;
      } else if (response?.data && Array.isArray(response.data)) {
        list = response.data;
        paginationData =
          response.pagination || response.meta || response.data?.pagination;
      } else if (Array.isArray(response?.products)) {
        // Backend shape provided: { products, pagination: { page, limit, total, pages } }
        list = response.products;
        const p = response.pagination || {};
        paginationData = {
          page: p.page ?? filters.page,
          limit: p.limit ?? filters.limit,
          total: p.total ?? (Array.isArray(list) ? list.length : 0),
          totalPages: p.totalPages ?? p.pages ?? 1,
        };
      } else if (Array.isArray(response?.data?.items)) {
        list = response.data.items;
        paginationData = response.data.pagination || response.meta;
      } else if (Array.isArray(response?.items)) {
        list = response.items;
        paginationData = response.meta || response.pagination;
      } else if (Array.isArray(response?.results)) {
        list = response.results;
        const { page, limit, total, totalPages } = response;
        paginationData = { page, limit, total, totalPages };
      }

      setProducts(Array.isArray(list) ? list : []);
      setPagination(
        paginationData || {
          page: filters.page,
          limit: filters.limit,
          total: Array.isArray(list) ? list.length : 0,
          totalPages: 1,
        }
      );
    } catch (err) {
      setError(err.message || "Failed to fetch products");
      setProducts([]); // Ensure products is an empty array on error
      toast.error(err.message || "Failed to fetch products");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Update filters
   * @param {Object} newFilters - New filter values
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      // Reset to page 1 if filters change (except pagination)
      page: newFilters.page !== undefined ? newFilters.page : 1,
    }));
  }, []);

  /**
   * Delete a product
   * @param {string} id - Product ID
   */
  const deleteProduct = useCallback(
    async (id) => {
      try {
        await productService.delete(id);
        toast.success("Product deleted successfully");
        // Refresh products list
        await fetchProducts();
      } catch (err) {
        toast.error(err.message || "Failed to delete product");
        console.error("Error deleting product:", err);
        throw err;
      }
    },
    [fetchProducts]
  );

  /**
   * Search products
   * @param {string} query - Search query
   */
  const searchProducts = useCallback(
    async (query) => {
      if (!query || query.trim() === "") {
        // Reset to all products if search is empty
        updateFilters({ search: undefined });
        return;
      }

      updateFilters({ search: query });
    },
    [updateFilters]
  );

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    pagination,
    loading,
    error,
    filters,
    updateFilters,
    fetchProducts,
    deleteProduct,
    searchProducts,
  };
}
