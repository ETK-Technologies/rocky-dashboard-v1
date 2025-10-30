"use client";

import { MoreVertical } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * FolderCard component for displaying folder/item cards
 * @param {Object} props - Component props
 * @param {string} props.title - Folder/item title
 * @param {string} props.size - Size information
 * @param {string} props.itemCount - Number of items
 * @param {Component} props.icon - Icon component
 * @param {string} props.iconColor - Icon color class
 * @param {string} props.bgColor - Background color class
 * @param {Function} props.onClick - Click handler
 * @param {Function} props.onMenuClick - Menu click handler
 * @param {string} props.className - Additional CSS classes
 */
export function FolderCard({
  title,
  size,
  itemCount,
  icon: Icon,
  iconColor,
  bgColor,
  onClick,
  onMenuClick,
  className,
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative bg-card border border-border rounded-xl p-4 hover:shadow-md transition-all cursor-pointer hover:border-primary/50",
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            bgColor
          )}
        >
          <Icon className={cn("h-6 w-6", iconColor)} />
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMenuClick?.(e);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-accent rounded-lg transition-all"
        >
          <MoreVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
      <h3 className="font-medium text-foreground text-sm mb-1 truncate">
        {title}
      </h3>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{size}</span>
        <span>•</span>
        <span>{itemCount}</span>
      </div>
    </div>
  );
}
