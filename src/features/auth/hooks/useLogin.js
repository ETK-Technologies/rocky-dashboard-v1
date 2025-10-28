"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { authService } from "../services/authService";
import { authStorage } from "../utils/authStorage";
import { AUTH_SUCCESS, VALIDATION_RULES } from "../types";

// Validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, VALIDATION_RULES.EMAIL.required)
    .email(VALIDATION_RULES.EMAIL.invalid),
  password: z
    .string()
    .min(1, VALIDATION_RULES.PASSWORD.required)
    .min(6, VALIDATION_RULES.PASSWORD.minLength),
});

/**
 * Custom hook for login functionality
 * @returns {Object} - Login form state and handlers
 */
export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur", // Validate on blur for better UX
  });

  /**
   * Handle login form submission
   * @param {Object} data - Form data
   */
  const onSubmit = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(data.email, data.password);

      // Save auth data
      const saveSuccess = authStorage.saveAuth(response);
      if (!saveSuccess) {
        console.warn("Failed to save auth data to localStorage");
      }

      // Show success message
      const userName = response.user?.firstName || response.user?.name || "User";
      toast.success(`${AUTH_SUCCESS.LOGIN_SUCCESS} ${userName}!`);

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      // Set error state
      setError(error.message);

      // Show error toast
      toast.error(error.message);

      // Log error for debugging
      console.error("Login error:", {
        message: error.message,
        statusCode: error.statusCode,
        error: error.error,
      });
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reset form
   */
  const resetForm = useCallback(() => {
    form.reset();
    setError(null);
  }, [form]);

  return {
    // Form state
    form,
    isLoading,
    error,

    // Form handlers
    onSubmit: form.handleSubmit(onSubmit),
    clearError,
    resetForm,

    // Form state helpers
    isValid: form.formState.isValid,
    isDirty: form.formState.isDirty,
    errors: form.formState.errors,
  };
}
