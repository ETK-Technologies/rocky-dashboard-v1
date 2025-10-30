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

      // Handle response structure
      if (response.data) {
        setProducts(Array.isArray(response.data) ? response.data : []);
        setPagination(
          response.pagination || {
            page: filters.page,
            limit: filters.limit,
            total: 0,
            totalPages: 0,
          }
        );
      } else if (Array.isArray(response)) {
        // If no pagination structure, assume direct array
        setProducts(response);
      } else {
        // If response is not an array, set empty array
        setProducts([]);
      }
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
