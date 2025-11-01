"use client";

import { useState, useEffect, useCallback } from "react";
import { productAttributeService } from "../services/productAttributeService";
import { productService } from "../services/productService";
import { toast } from "react-toastify";

/**
 * Hook for fetching and managing product attributes
 * @param {string|null} productId - Optional product ID to fetch attributes for
 * @returns {Object} Attributes state and methods
 */
export function useProductAttributes(productId = null) {
  const [attributes, setAttributes] = useState([]);
  const [allAttributes, setAllAttributes] = useState([]); // All unique attributes across products
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch attributes for a specific product
   */
  const fetchAttributes = useCallback(async (id) => {
    if (!id) {
      setAttributes([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await productAttributeService.getAll(id);
      const attributesList = Array.isArray(data) ? data : data?.data || data?.attributes || [];
      setAttributes(attributesList);
    } catch (err) {
      setError(err.message || "Failed to load attributes");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch all unique attributes from all products
   */
  const fetchAllAttributes = useCallback(async () => {
    try {
      // Get all products
      const productsResponse = await productService.getAll({ limit: 1000 });
      const products = Array.isArray(productsResponse)
        ? productsResponse
        : productsResponse?.data || productsResponse?.items || productsResponse?.results || [];

      // Fetch attributes for each product
      const attributePromises = products.map((product) =>
        productAttributeService.getAll(product.id).catch(() => [])
      );

      const attributeArrays = await Promise.all(attributePromises);
      const allAttrArrays = attributeArrays.map((arr) =>
        Array.isArray(arr) ? arr : arr?.data || arr?.attributes || []
      );

      // Flatten and get unique attributes
      const uniqueAttributes = [
        ...new Set(allAttrArrays.flat().filter(Boolean)),
      ].sort();

      setAllAttributes(uniqueAttributes);
    } catch (err) {
      console.error("Failed to load all attributes:", err);
      // Don't set error state here as it's non-critical
      setAllAttributes([]);
    }
  }, []);

  // Fetch attributes when productId changes
  useEffect(() => {
    if (productId) {
      fetchAttributes(productId);
    } else {
      setAttributes([]);
    }
  }, [productId, fetchAttributes]);

  return {
    attributes,
    allAttributes,
    loading,
    error,
    fetchAttributes,
    fetchAllAttributes,
    refetch: () => (productId ? fetchAttributes(productId) : fetchAllAttributes()),
  };
}

