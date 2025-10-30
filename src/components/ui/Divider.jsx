"use client";

import { cn } from "@/utils/cn";

/**
 * Divider component with optional text
 * @param {Object} props - Component props
 * @param {string} props.text - Optional text to display in the divider
 * @param {string} props.className - Additional CSS classes
 */
export function Divider({ text, className }) {
  if (!text) {
    return <div className={cn("border-t border-border", className)} />;
  }

  return (
    <div className={cn("relative", className)}>
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-card px-2 text-muted-foreground">{text}</span>
      </div>
    </div>
  );
}
