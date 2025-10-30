"use client";

import { forwardRef } from "react";
import { cn } from "@/utils/cn";

export const CustomLabel = forwardRef(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none",
        "text-gray-900 dark:text-gray-100",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  );
});

CustomLabel.displayName = "CustomLabel";
