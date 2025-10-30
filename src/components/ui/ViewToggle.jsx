"use client";

import { Grid3x3, List } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * ViewToggle component for switching between grid and list views
 * @param {Object} props - Component props
 * @param {string} props.view - Current view (grid or list)
 * @param {Function} props.onViewChange - Callback when view changes
 * @param {string} props.className - Additional CSS classes
 */
export function ViewToggle({ view, onViewChange, className }) {
  const buttonClass = (isActive) =>
    cn(
      "p-2 rounded-lg transition-colors",
      isActive
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:text-foreground hover:bg-accent"
    );

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        onClick={() => onViewChange("grid")}
        className={buttonClass(view === "grid")}
        aria-label="Grid view"
      >
        <Grid3x3 className="h-4 w-4" />
      </button>
      <button
        onClick={() => onViewChange("list")}
        className={buttonClass(view === "list")}
        aria-label="List view"
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );
}
