"use client";

import { forwardRef } from "react";
import { cn } from "@/utils/cn";

export const CustomTextarea = forwardRef(
    ({ className, error, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    // Base styles
                    "flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm transition-colors",
                    // Light mode
                    "bg-white text-gray-900 border-gray-300",
                    "placeholder:text-gray-500",
                    // Dark mode
                    "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600",
                    "dark:placeholder:text-gray-400",
                    // Focus states
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                    "focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400",
                    "focus-visible:border-blue-500 dark:focus-visible:border-blue-400",
                    // Disabled state
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    "disabled:bg-gray-100 dark:disabled:bg-gray-900",
                    // Error state
                    error && "border-red-500 dark:border-red-400",
                    error &&
                        "focus-visible:ring-red-500 dark:focus-visible:ring-red-400",
                    // Resize
                    "resize-vertical",
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);

CustomTextarea.displayName = "CustomTextarea";
