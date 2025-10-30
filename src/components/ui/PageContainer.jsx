"use client";

import { cn } from "@/utils/cn";

/**
 * PageContainer component for consistent page layout
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Page content
 * @param {string} props.maxWidth - Maximum width (sm, md, lg, xl, 2xl, full)
 * @param {string} props.className - Additional CSS classes
 */
export function PageContainer({ children, maxWidth = "2xl", className }) {
  const maxWidthClasses = {
    sm: "max-w-[800px]",
    md: "max-w-[1000px]",
    lg: "max-w-[1200px]",
    xl: "max-w-[1400px]",
    "2xl": "max-w-[1600px]",
    full: "max-w-full",
  };

  return (
    <div
      className={cn(
        "p-4 sm:p-6 lg:p-8 mx-auto w-full",
        maxWidthClasses[maxWidth],
        className
      )}
    >
      {children}
    </div>
  );
}
