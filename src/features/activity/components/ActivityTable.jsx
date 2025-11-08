"use client";

import { useMemo } from "react";
import { ArrowUpRight } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { CustomBadge } from "@/components/ui/CustomBadge";
import { IconButton } from "@/components/ui/IconButton";
import { Tooltip } from "@/components/ui/Tooltip";

const STATUS_BADGE_CLASSES = {
  success:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-200",
  failed: "bg-rose-100 text-rose-700 dark:bg-rose-400/20 dark:text-rose-200",
  error: "bg-rose-100 text-rose-700 dark:bg-rose-400/20 dark:text-rose-200",
  pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-400/20 dark:text-amber-200",
  warning:
    "bg-amber-100 text-amber-700 dark:bg-amber-400/20 dark:text-amber-200",
  running: "bg-sky-100 text-sky-700 dark:bg-sky-400/20 dark:text-sky-200",
  info: "bg-sky-100 text-sky-700 dark:bg-sky-400/20 dark:text-sky-200",
  queued:
    "bg-secondary text-secondary-foreground dark:bg-slate-400/20 dark:text-slate-200",
};

const formatDateTime = (value) => {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

/**
 * Activity table component
 * @param {Object} props
 * @param {Array} props.items
 * @param {boolean} props.loading
 * @param {Function} props.onViewDetails
 */
export function ActivityTable({ items, loading, onViewDetails }) {
  const columns = useMemo(
    () => [
      {
        key: "occurredAt",
        label: "Timestamp",
        width: "220px",
        render: (row) => {
          const dateValue = row.occurredAt ? new Date(row.occurredAt) : null;
          let formattedDate = "—";
          let formattedTime = null;

          if (dateValue && !Number.isNaN(dateValue.getTime())) {
            formattedDate = dateValue.toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "2-digit",
            });
            formattedTime = dateValue.toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });
          }

          const content = formattedTime
            ? `${formattedDate} ${formattedTime}`
            : formattedDate;

          return (
            <Tooltip content={content} usePortal>
              <div className="flex flex-col">
                <span className="font-semibold text-foreground">
                  {formattedDate}
                </span>
                {formattedTime && (
                  <span className="text-sm text-muted-foreground">
                    {formattedTime}
                  </span>
                )}
              </div>
            </Tooltip>
          );
        },
      },
      {
        key: "scope",
        label: "Scope",
        width: "140px",
        render: (row) => (
          <span className="uppercase tracking-wide text-xs font-semibold text-muted-foreground">
            {row.scope || "—"}
          </span>
        ),
      },
      {
        key: "action",
        label: "Action",
        width: "180px",
        render: (row) => {
          const action = row.action || "—";
          return (
            <Tooltip content={action} usePortal>
              <span className="max-w-[160px] truncate font-semibold text-foreground">
                {action}
              </span>
            </Tooltip>
          );
        },
      },
      {
        key: "message",
        label: "Message",
        width: "320px",
        truncate: true,
        render: (row) => {
          const messageContent = row.message || "";
          return (
            <Tooltip content={messageContent} usePortal>
              <div className="flex flex-col gap-1 max-w-[300px]">
                <span className="block truncate text-sm text-muted-foreground">
                  {messageContent || "—"}
                </span>
                {(row.targetType || row.targetId) && (
                  <code className="inline-flex items-center gap-2 w-fit rounded-md bg-secondary/70 px-2 py-0.5 text-xs text-secondary-foreground">
                    {row.targetType && (
                      <span className="uppercase tracking-wide font-semibold">
                        {row.targetType}
                      </span>
                    )}
                    {row.targetId && (
                      <span className="font-mono text-xs text-muted-foreground">
                        #{row.targetId}
                      </span>
                    )}
                  </code>
                )}
              </div>
            </Tooltip>
          );
        },
      },
      {
        key: "actorEmail",
        label: "Actor",
        width: "220px",
        render: (row) => (
          <Tooltip content={row.actorEmail} usePortal>
            <div className="flex flex-col">
              <span className="truncate text-sm font-medium text-foreground">
                {row.actorEmail || "Unknown"}
              </span>
              {row.actorRole && (
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {row.actorRole}
                </span>
              )}
            </div>
          </Tooltip>
        ),
      },
      {
        key: "status",
        label: "Status",
        width: "140px",
        render: (row) => {
          const status = String(row.status || "")
            .trim()
            .toLowerCase();
          const badgeClass =
            STATUS_BADGE_CLASSES[status] ||
            "bg-secondary text-secondary-foreground dark:bg-slate-400/20 dark:text-slate-200";
          return (
            <CustomBadge
              variant="outline"
              className={`uppercase tracking-wide px-2 py-1 ${badgeClass}`}
            >
              {row.status || "UNKNOWN"}
            </CustomBadge>
          );
        },
      },
    ],
    []
  );

  return (
    <DataTable
      data={items}
      columns={columns}
      loading={loading}
      getRowId={(row) => row.id || row._id || `${row.occurredAt}-${row.action}`}
      renderActions={(row) => (
        <IconButton
          icon={ArrowUpRight}
          label="View activity details"
          variant="ghost"
          size="sm"
          onClick={(event) => {
            event.stopPropagation();
            onViewDetails?.(row);
          }}
        />
      )}
      onRowClick={(row) => onViewDetails?.(row)}
      className="overflow-x-auto"
      emptyState={{
        title: "No activity yet",
        description:
          "System activity logs will appear here as actions are performed.",
      }}
    />
  );
}
