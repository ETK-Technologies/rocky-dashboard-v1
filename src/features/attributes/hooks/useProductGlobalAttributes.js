"use client";

import { useState, useEffect, useCallback } from "react";
import { productGlobalAttributeService } from "../services/productGlobalAttributeService";
import { toast } from "react-toastify";

/**
 * Hook for managing global attributes assigned to a product
 * @param {string|null} productId - Product ID
 * @returns {Object} Product global attributes state and methods
 */
export function useProductGlobalAttributes(productId = null) {
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch global attributes assigned to a product
   */
  const fetchAttributes = useCallback(
    async (id = productId) => {
      if (!id) {
        setAttributes([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await productGlobalAttributeService.getAll(id);

        // Service already normalizes response, so data should be an array
        const attributesList = Array.isArray(data) ? data : [];

        setAttributes(attributesList);
      } catch (err) {
        const errorMessage =
          err.message || "Failed to load product global attributes";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [productId]
  );

  /**
   * Bulk assign global attributes to a product
   */
  const bulkAssign = useCallback(
    async (attributesData, id = productId) => {
      if (!id) {
        throw new Error("Product ID is required");
      }

      setLoading(true);
      setError(null);

      try {
        const assignedAttributes =
          await productGlobalAttributeService.bulkAssign(id, {
            attributes: attributesData,
          });

        // Service already normalizes response, so assignedAttributes should be an array
        const attributesList = Array.isArray(assignedAttributes)
          ? assignedAttributes
          : [];

        setAttributes(attributesList);
        toast.success("Global attributes assigned successfully");
        return attributesList;
      } catch (err) {
        const errorMessage =
          err.message || "Failed to assign global attributes";
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [productId]
  );

  /**
   * Remove a global attribute from a product
   */
  const removeAttribute = useCallback(
    async (globalAttributeId, id = productId) => {
      if (!id) {
        throw new Error("Product ID is required");
      }

      setLoading(true);
      setError(null);

      try {
        await productGlobalAttributeService.remove(id, globalAttributeId);
        setAttributes((prev) =>
          prev.filter(
            (attr) => attr.globalAttributeId !== globalAttributeId
          )
        );
        toast.success("Global attribute removed successfully");
      } catch (err) {
        const errorMessage =
          err.message || "Failed to remove global attribute";
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [productId]
  );

  // Fetch when productId changes
  useEffect(() => {
    if (productId) {
      fetchAttributes(productId);
    } else {
      setAttributes([]);
    }
  }, [productId, fetchAttributes]);

  return {
    attributes,
    loading,
    error,
    fetchAttributes,
    bulkAssign,
    removeAttribute,
    refetch: () => fetchAttributes(productId),
  };
}

