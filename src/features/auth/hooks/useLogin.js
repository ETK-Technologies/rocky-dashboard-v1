"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { authService } from "../services/authService";
import { authStorage } from "../utils/authStorage";

// Validation schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

/**
 * Custom hook for login functionality
 */
export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      const response = await authService.login(data.email, data.password);

      // Save auth data
      authStorage.saveAuth(response);

      // Show success message
      toast.success(`Welcome back, ${response.user.firstName || "User"}!`);

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      // Log full error for debugging
      console.error("Login error:", error);
      console.error("Error details:", {
        message: error.message,
        statusCode: error.statusCode,
        error: error.error,
        status: error.status,
      });

      // Show user-friendly error message
      let errorMessage = "Login failed. Please try again.";

      if (error.statusCode === 401) {
        errorMessage =
          "Invalid email or password. Please check your credentials.";
      } else if (error.message && error.message !== "Network error") {
        errorMessage = error.message;
      } else if (error.error === "NetworkError") {
        errorMessage =
          "Unable to connect to server. Please ensure the backend API is running on port 3001.";
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
