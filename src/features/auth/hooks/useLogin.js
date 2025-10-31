"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { authService } from "../services/authService";
import { authStorage } from "../utils/authStorage";
import { useAuthStore } from "@/lib/store/authStore";
import { AUTH_SUCCESS, VALIDATION_RULES } from "../constants";

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

  // Get Zustand store actions
  const { login: loginToStore } = useAuthStore();

  /**
   * Handle login form submission
   * @param {Object} data - Form data
   */
  const onSubmit = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      // Call API to login
      const response = await authService.login(data.email, data.password);

      // Save auth data to localStorage
      const saveSuccess = authStorage.saveAuth(response);
      if (!saveSuccess) {
        console.warn("Failed to save auth data to localStorage");
      }

      // Login to Zustand store and fetch user profile
      const user = await loginToStore(response);

      if (!user) {
        throw new Error("Failed to fetch user profile after login");
      }

      // Only allow admins and super admins to access dashboard
      const role = (user.role || "").toLowerCase();
      const isAdmin = role === "admin" || role === "super_admin";

      if (!isAdmin) {
        // Clear stored auth and block dashboard access
        authStorage.clearAuth();
        toast.error("Dashboard access is restricted to admins only");
        router.push("/");
        return;
      }

      // Show success message with user's name and role
      const userName = user.firstName || user.email || "User";
      const userRole = user.role ? ` as ${user.role}` : "";
      toast.success(`${AUTH_SUCCESS.LOGIN_SUCCESS} ${userName}${userRole}!`);

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
  }, [router, loginToStore]);

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
