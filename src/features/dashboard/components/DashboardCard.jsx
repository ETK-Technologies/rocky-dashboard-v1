"use client";

import { Folder, MoreVertical } from "lucide-react";
import { cn } from "@/utils/cn";

export function DashboardCard({
  title,
  size,
  itemCount,
  icon: Icon = Folder,
  iconColor = "text-blue-600",
  bgColor = "bg-blue-50",
  onClick,
  className,
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative bg-white rounded-xl border border-gray-200 p-5 cursor-pointer transition-all duration-200",
        "hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5",
        className
      )}
    >
      {/* More options button */}
      <button
        className="absolute top-4 right-4 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 rounded-lg"
        onClick={(e) => {
          e.stopPropagation();
          // Handle more options
        }}
      >
        <MoreVertical className="h-4 w-4 text-gray-500" />
      </button>

      {/* Icon */}
      <div
        className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
          bgColor
        )}
      >
        <Icon className={cn("h-6 w-6", iconColor)} />
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate pr-8">
        {title}
      </h3>

      {/* Meta info */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>{size}</span>
        <span>•</span>
        <span>{itemCount}</span>
      </div>
    </div>
  );
}

// Quick access card variant
export function QuickAccessCard({
  title,
  size,
  itemCount,
  icon: Icon = Folder,
  iconColor = "text-blue-600",
  bgColor = "bg-blue-50",
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-lg border border-gray-200 p-4 cursor-pointer transition-all duration-200 hover:shadow-sm hover:border-gray-300"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
            bgColor
          )}
        >
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 truncate mb-0.5">
            {title}
          </h4>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{size}</span>
            <span>•</span>
            <span>{itemCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
