"use client";

import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * LoadingState component for showing loading indicators
 * @param {Object} props - Component props
 * @param {string} props.message - Loading message
 * @param {string} props.size - Size of spinner (sm, md, lg)
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.fullScreen - Whether to show full screen loading
 * @param {boolean} props.loading - Whether to show loading state
 */
export function LoadingState({
    message = "Loading...",
    size = "md",
    className,
    fullScreen = false,
    loading = false,
}) {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-8 w-8",
        lg: "h-12 w-12",
    };

    console.log(message, loading);

    const content = (
        <div
            className={cn(
                "flex flex-col items-center justify-center gap-3",
                className
            )}
        >
            <Loader2
                className={cn("animate-spin text-primary", sizeClasses[size])}
            />
            {message && (
                <p className="text-sm text-muted-foreground">{message}</p>
            )}
        </div>
    );

    if (fullScreen && loading) {
        if (!loading) return null;
        return createPortal(
            <div className="min-h-screen flex items-center justify-center fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-md z-[1000]">
                <div
                    className={cn(
                        "flex flex-col items-center justify-center gap-3",
                        className
                    )}
                >
                    <Loader2
                        className={cn(
                            "animate-spin text-primary",
                            sizeClasses["lg"]
                        )}
                    />
                    {message && (
                        <p className="text-base font-medium text-muted-foreground">
                            {message}
                        </p>
                    )}
                </div>
            </div>,
            document.body
        );
    } else if (!fullScreen) {
        if (!loading) return null;
        return <div className="py-12">{content}</div>;
    } else {
        return null;
    }
}
