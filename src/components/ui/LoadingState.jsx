"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * LoadingState component for showing loading indicators
 * @param {Object} props - Component props
 * @param {string} props.message - Loading message
 * @param {string} props.size - Size of spinner (sm, md, lg)
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.fullScreen - Whether to show full screen loading
 */
export function LoadingState({
  message = "Loading...",
  size = "md",
  className,
  fullScreen = false,
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        className
      )}
    >
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {content}
      </div>
    );
  }

  return <div className="py-12">{content}</div>;
}
