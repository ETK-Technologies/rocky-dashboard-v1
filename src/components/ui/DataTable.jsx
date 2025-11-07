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
 * @param {boolean} props.selectable - Enable row selection
 * @param {Array} props.selectedRows - Array of selected row IDs
 * @param {Function} props.onSelectionChange - Callback when selection changes (selectedIds)
 * @param {Function} props.getRowId - Function to get unique ID from row data (default: row.id)
 */
export function DataTable({
  columns = [],
  data = [],
  onRowClick,
  renderActions,
  loading = false,
  emptyState,
  className,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  getRowId = (row) => row.id,
}) {
  // Ensure data is always an array
  const safeData = Array.isArray(data) ? data : [];

  // Handle row selection
  const handleRowSelect = (rowId, checked) => {
    if (!onSelectionChange) return;

    const newSelection = checked
      ? [...selectedRows, rowId]
      : selectedRows.filter((id) => id !== rowId);

    onSelectionChange(newSelection);
  };

  // Handle select all
  const handleSelectAll = (checked) => {
    if (!onSelectionChange) return;

    if (checked) {
      const allIds = safeData.map((row) => getRowId(row));
      onSelectionChange(allIds);
    } else {
      onSelectionChange([]);
    }
  };

  // Check if all rows are selected
  const allSelected =
    safeData.length > 0 &&
    safeData.every((row) => selectedRows.includes(getRowId(row)));

  // Check if some rows are selected
  const someSelected =
    safeData.some((row) => selectedRows.includes(getRowId(row))) &&
    !allSelected;

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
        <table className="w-full min-w-full table-fixed">
          <thead className="bg-secondary border-b border-border">
            <tr>
              {selectable && (
                <th className="px-3 sm:px-4 md:px-6 py-3 whitespace-nowrap w-12">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = someSelected;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-primary bg-background border-input rounded focus:ring-primary focus:ring-2 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  />
                </th>
              )}
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
            {safeData.map((row, rowIndex) => {
              const rowId = getRowId(row);
              const isSelected = selectedRows.includes(rowId);

              return (
                <tr
                  key={rowIndex}
                  className={cn(
                    "transition-colors",
                    onRowClick && "hover:bg-accent cursor-pointer",
                    isSelected && "bg-accent/50"
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable && (
                    <td
                      className="px-3 sm:px-4 md:px-6 py-4 whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) =>
                          handleRowSelect(rowId, e.target.checked)
                        }
                        className="w-4 h-4 text-primary bg-background border-input rounded focus:ring-primary focus:ring-2 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                  )}
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
