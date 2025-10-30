"use client";

import { useEffect } from "react";
import { useLogin } from "../hooks/useLogin";
import { redirectIfAuthenticated } from "../middleware";
import {
  CustomButton,
  CustomInput,
  CustomLabel,
  CustomCard,
  CustomCardContent,
  CustomCardDescription,
  CustomCardHeader,
  CustomCardTitle,
} from "@/components/ui";
import { Loader2 } from "lucide-react";

/**
 * Login form component
 * Handles user authentication with clean UI and error handling
 */
export function LoginForm() {
  const { form, isLoading, error, onSubmit, clearError } = useLogin();
  const {
    register,
    formState: { errors },
  } = form;

  // Redirect if already authenticated
  useEffect(() => {
    redirectIfAuthenticated();
  }, []);

  return (
    <CustomCard className="w-full max-w-md">
      <CustomCardHeader className="text-center">
        <CustomCardTitle className="text-2xl font-bold">
          Welcome Back
        </CustomCardTitle>
        <CustomCardDescription>
          Enter your credentials to access the dashboard
        </CustomCardDescription>
      </CustomCardHeader>

      <CustomCardContent className="space-y-6">
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <CustomLabel htmlFor="email">Email Address</CustomLabel>
            <CustomInput
              id="email"
              type="email"
              placeholder="Enter your email"
              error={errors.email}
              {...register("email")}
              disabled={isLoading}
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <CustomLabel htmlFor="password">Password</CustomLabel>
            <CustomInput
              id="password"
              type="password"
              placeholder="Enter your password"
              error={errors.password}
              {...register("password")}
              disabled={isLoading}
              autoComplete="current-password"
            />
            {errors.password && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <CustomButton
            type="submit"
            className="w-full"
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </CustomButton>
        </form>

        {/* Demo Credentials Info */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-400 mb-2">
            Demo Credentials
          </h4>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <p>
              <strong>Email:</strong> moatef@gmail.com
            </p>
            <p>
              <strong>Password:</strong> 123123
            </p>
          </div>
        </div>
      </CustomCardContent>
    </CustomCard>
  );
}
