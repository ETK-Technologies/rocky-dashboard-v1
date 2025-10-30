"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { productService } from "../services/productService";
import { toast } from "react-toastify";

/**
 * Hook for managing product form (create/edit)
 * @param {string|null} productId - Product ID for edit mode, null for create mode
 * @returns {Object} Form state and methods
 */
export function useProductForm(productId = null) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(!!productId);
  const [error, setError] = useState(null);
  const [productData, setProductData] = useState(null);

  const isEditMode = !!productId;

  /**
   * Fetch product data for edit mode
   */
  const fetchProduct = useCallback(async () => {
    if (!productId) return;

    setFetchLoading(true);
    setError(null);

    try {
      const response = await productService.getById(productId);
      const data = response.data || response;
      setProductData(data);
    } catch (err) {
      setError(err.message || "Failed to fetch product");
      toast.error(err.message || "Failed to fetch product");
      console.error("Error fetching product:", err);
    } finally {
      setFetchLoading(false);
    }
  }, [productId]);

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
          "📤 Submitting product data:",
          JSON.stringify(formData, null, 2)
        );

        // Submit based on mode
        if (isEditMode) {
          await productService.update(productId, formData);
          toast.success("Product updated successfully");
        } else {
          await productService.create(formData);
          toast.success("Product created successfully");
        }

        // Redirect to products list
        router.push("/dashboard/products");
      } catch (err) {
        const errorMessage =
          err?.message || err?.data?.message || "Failed to submit form";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error("Error submitting form:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [productId, isEditMode, router]
  );

  // Fetch product data on mount if in edit mode
  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId, fetchProduct]);

  return {
    loading,
    fetchLoading,
    error,
    productData,
    isEditMode,
    submitForm,
    refetch: fetchProduct,
  };
}
