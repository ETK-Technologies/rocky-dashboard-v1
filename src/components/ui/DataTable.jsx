"use client";

import { MoreVertical } from "lucide-react";
import { cn } from "@/utils/cn";
import { CustomEmptyState } from "./CustomEmptyState";
import { LoadingState } from "./LoadingState";

/**
 * DataTable component for displaying tabular data
 * @param {Object} props - Component props
 * @param {Array} props.columns - Column definitions [{key, label, render, width}]
 * @param {Array} props.data - Data array
 * @param {Function} props.onRowClick - Row click handler
 * @param {Function} props.renderActions - Render function for row actions
 * @param {boolean} props.loading - Loading state
 * @param {Object} props.emptyState - Empty state props
 * @param {string} props.className - Additional CSS classes
 */
export function DataTable({
  columns = [],
  data = [],
  onRowClick,
  renderActions,
  loading = false,
  emptyState,
  className,
}) {
  // Ensure data is always an array
  const safeData = Array.isArray(data) ? data : [];

  if (loading) {
    return <LoadingState message="Loading data..." />;
  }

  if (safeData.length === 0 && emptyState) {
    return <CustomEmptyState {...emptyState} />;
  }

  return (
    <div
      className={cn(
        "bg-card rounded-lg sm:rounded-xl border border-border w-full overflow-hidden",
        className
      )}
    >
      <div className="overflow-x-auto w-full">
        <table className="w-full min-w-max table-fixed">
          <thead className="bg-secondary border-b border-border">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{ width: column.width }}
                  className={cn(
                    "text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 sm:px-4 md:px-6 py-3 whitespace-nowrap",
                    !column.width && "w-auto"
                  )}
                >
                  {column.label}
                </th>
              ))}
              {renderActions && (
                <th className="px-3 sm:px-4 md:px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-24">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {safeData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={cn(
                  "transition-colors",
                  onRowClick && "hover:bg-accent cursor-pointer"
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "px-3 sm:px-4 md:px-6 py-4",
                      column.truncate ? "truncate" : "whitespace-nowrap"
                    )}
                  >
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
                {renderActions && (
                  <td className="px-3 sm:px-4 md:px-6 py-4 whitespace-nowrap">
                    {renderActions(row)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
