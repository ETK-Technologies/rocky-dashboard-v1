"use client";

import { useMemo } from "react";
import { ArrowUpRight } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { CustomBadge } from "@/components/ui/CustomBadge";
import { IconButton } from "@/components/ui/IconButton";
import { Tooltip } from "@/components/ui/Tooltip";
import { ALL_EMAIL_TRIGGERS } from "../hooks/useEmailTriggersLogs";

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

/**
 * Email triggers table component
 * @param {Object} props
 * @param {Array} props.items
 * @param {boolean} props.loading
 * @param {Function} props.onViewDetails
 */
export function EmailTriggersTable({ items, loading, onViewDetails }) {
  const columns = useMemo(
    () => [
      {
        key: "occurredAt",
        label: "Timestamp",
        width: "160px",
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
              <div className="flex flex-col max-w-[140px] overflow-hidden">
                <span className="font-semibold text-foreground truncate">
                  {formattedDate}
                </span>
                {formattedTime && (
                  <span className="text-sm text-muted-foreground truncate">
                    {formattedTime}
                  </span>
                )}
              </div>
            </Tooltip>
          );
        },
      },
      {
        key: "trigger",
        label: "Trigger",
        width: "180px",
        render: (row) => {
          // Check trigger field first (email trigger like order.created)
          const trigger =
            row.trigger ||
            row.metadata?.trigger ||
            row.emailTrigger ||
            "—";

          if (trigger === "—") {
            return <span className="text-muted-foreground">—</span>;
          }

          const triggerLabel =
            ALL_EMAIL_TRIGGERS.find((t) => t.value === trigger)?.label ||
            trigger;

          return (
            <Tooltip content={trigger} usePortal>
              <div className="max-w-[160px]">
                <span className="font-semibold text-foreground block truncate overflow-hidden">
                  {triggerLabel}
                </span>
              </div>
            </Tooltip>
          );
        },
      },
      {
        key: "action",
        label: "Action",
        width: "210px",
        render: (row) => {
          const action = row.action || "—";

          if (action === "—") {
            return <span className="text-muted-foreground">—</span>;
          }

          // If it's EMAIL_SEND_FAILED, show it prominently
          if (action === "EMAIL_SEND_FAILED") {
            return (
              <Tooltip content={action} usePortal>
                <div className="w-[200px]">
                  <span className="truncate font-semibold text-rose-600 dark:text-rose-400 block">
                    Email Failed
                  </span>
                </div>
              </Tooltip>
            );
          }

          return (
            <Tooltip content={action} usePortal>
              <div className="w-[200px]">
                <span className="truncate font-semibold text-foreground block">
                  {action}
                </span>
              </div>
            </Tooltip>
          );
        },
      },
      {
        key: "scope",
        label: "Scope",
        width: "120px",
        render: (row) => {
          const scope = row.scope || "—";
          return (
            <Tooltip content={scope} usePortal>
              <div className="max-w-[100px]">
                <span className="uppercase tracking-wide text-xs font-semibold text-muted-foreground block truncate overflow-hidden">
                  {scope}
                </span>
              </div>
            </Tooltip>
          );
        },
      },
      {
        key: "message",
        label: "Message",
        width: "150px",
        render: (row) => {
          const messageContent = row.message || "";
          const maxLength = 30; // Maximum characters before truncation
          const truncatedMessage =
            messageContent.length > maxLength
              ? `${messageContent.substring(0, maxLength)}...`
              : messageContent;
          return (
            <Tooltip content={messageContent || "—"} usePortal>
              <div className="flex flex-col gap-1 w-full overflow-hidden">
                <span className="block truncate text-sm text-muted-foreground w-full overflow-hidden text-ellipsis">
                  {truncatedMessage || "—"}
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
          <Tooltip content={row.actorEmail || "System"} usePortal>
            <div className="flex flex-col max-w-[220px] overflow-hidden">
              <span className="truncate text-sm font-medium text-foreground">
                {row.actorEmail || "System"}
              </span>
              {row.actorRole && (
                <span className="text-xs uppercase tracking-wide text-muted-foreground truncate">
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
          // Check if action is EMAIL_SEND_FAILED first
          if (row.action === "EMAIL_SEND_FAILED") {
            return (
              <CustomBadge
                variant="outline"
                className={`uppercase tracking-wide px-2 py-1 ${STATUS_BADGE_CLASSES.failed}`}
              >
                FAILED
              </CustomBadge>
            );
          }

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
          label="View email trigger log details"
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
        title: "No email trigger logs found",
        description:
          "Email trigger logs will appear here when emails are sent.",
      }}
    />
  );
}

