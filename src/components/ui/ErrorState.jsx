"use client";

import { AlertCircle } from "lucide-react";
import { CustomButton } from "./CustomButton";
import { cn } from "@/utils/cn";

/**
 * ErrorState component for showing error messages
 * @param {Object} props - Component props
 * @param {string} props.title - Error title
 * @param {string} props.message - Error message
 * @param {Function} props.onRetry - Retry callback function
 * @param {string} props.retryText - Retry button text
 * @param {string} props.className - Additional CSS classes
 */
export function ErrorState({
  title = "Something went wrong",
  message = "An error occurred. Please try again.",
  onRetry,
  retryText = "Try Again",
  className,
}) {
  return (
    <div className={cn("py-12 px-4 text-center", className)}>
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
        {message}
      </p>
      {onRetry && (
        <CustomButton onClick={onRetry} variant="outline">
          {retryText}
        </CustomButton>
      )}
    </div>
  );
}
