"use client";

import { cn } from "@/utils/cn";

/**
 * PageHeader component for consistent page titles and descriptions
 * @param {Object} props - Component props
 * @param {string} props.title - Page title
 * @param {string} props.description - Page description
 * @param {React.ReactNode} props.action - Optional action button/content
 * @param {string} props.className - Additional CSS classes
 */
export function PageHeader({ title, description, action, className }) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8",
        className
      )}
    >
      <div className="flex-1 min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
