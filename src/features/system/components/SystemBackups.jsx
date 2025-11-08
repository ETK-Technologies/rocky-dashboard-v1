"use client";

import {
  CalendarClock,
  Download,
  HardDrive,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  CustomButton,
  CustomCard,
  CustomCardContent,
  CustomCardDescription,
  CustomCardHeader,
  CustomCardTitle,
  CustomEmptyState,
  ErrorState,
} from "@/components/ui";
import { CustomModal } from "@/components/ui/CustomModal";
import { useSystemBackups } from "../hooks/useSystemBackups";

const formatSize = (bytes) => {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / Math.pow(1024, exponent);

  return `${value.toFixed(value >= 100 ? 0 : value >= 10 ? 1 : 2)} ${
    units[exponent]
  }`;
};

const formatDate = (date) => {
  if (!date) return "—";
  try {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "—";
    return parsed.toLocaleString();
  } catch {
    return "—";
  }
};

export function SystemBackups() {
  const {
    backups,
    loading,
    error,
    creating,
    refresh,
    createBackup,
    hasBackups,
    downloadBackup,
  } = useSystemBackups();

  const [downloading, setDownloading] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [latestBackup, setLatestBackup] = useState(null);

  const sortedBackups = useMemo(() => {
    return [...backups].sort((a, b) => {
      const aTime = new Date(a?.createdAt || 0).getTime() || 0;
      const bTime = new Date(b?.createdAt || 0).getTime() || 0;
      return bTime - aTime;
    });
  }, [backups]);

  const getFilename = useCallback((value) => {
    if (!value) return undefined;
    if (value.includes("/")) {
      const parts = value.split("/");
      return parts[parts.length - 1] || value;
    }
    return value;
  }, []);

  const handleDownload = useCallback(
    async (filename, { closeAfter = false } = {}) => {
      if (!filename) {
        toast.error("Missing filename for download.");
        return;
      }

      setDownloading(filename);
      try {
        const { blob, filename: resolvedFilename } = await downloadBackup(
          filename
        );
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = resolvedFilename || filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Backup download started.");
        if (closeAfter) {
          setModalOpen(false);
        }
      } catch (err) {
        const message =
          err?.message || "Failed to download backup. Please try again.";
        toast.error(message);
        console.error("Error downloading system backup:", err);
      } finally {
        setDownloading(null);
      }
    },
    [downloadBackup]
  );

  const handleCreateBackup = useCallback(async () => {
    try {
      const response = await createBackup();
      setLatestBackup(response);
      setModalOpen(true);
    } catch {
      // Errors already handled via toast in hook
    }
  }, [createBackup]);

  if (error) {
    return (
      <CustomCard>
        <ErrorState
          title="Unable to load backups"
          message={error}
          onRetry={refresh}
        />
      </CustomCard>
    );
  }

  return (
    <CustomCard>
      <CustomCardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <CustomCardTitle>Database Backups</CustomCardTitle>
          <CustomCardDescription>
            Manage your automated database backups and trigger new snapshots on
            demand.
          </CustomCardDescription>
        </div>
        <div className="flex gap-2">
          <CustomButton variant="outline" onClick={refresh} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </CustomButton>
          <CustomButton onClick={handleCreateBackup} disabled={creating}>
            <HardDrive className="mr-2 h-4 w-4" />
            {creating ? "Creating..." : "Create Backup"}
          </CustomButton>
        </div>
      </CustomCardHeader>
      <CustomCardContent className="pt-0">
        {loading && !hasBackups ? (
          <div className="space-y-3">
            {[0, 1, 2].map((skeleton) => (
              <div
                key={`backup-skeleton-${skeleton}`}
                className="animate-pulse rounded-lg border border-dashed border-muted p-4"
              >
                <div className="h-4 w-40 rounded bg-muted/70" />
                <div className="mt-2 h-3 w-56 rounded bg-muted/60" />
                <div className="mt-2 h-3 w-32 rounded bg-muted/50" />
              </div>
            ))}
          </div>
        ) : hasBackups ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Filename
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Size
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Created At
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Updated At
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedBackups.map((backup) => {
                  const backupFilename =
                    getFilename(backup?.filename) || getFilename(backup?.file);

                  return (
                    <tr key={backup?.file || backup?.filename}>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {backup?.filename || backup?.file || "Unknown file"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatSize(Number(backup?.sizeBytes))}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(backup?.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(backup?.updatedAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {backupFilename ? (
                          <CustomButton
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => handleDownload(backupFilename)}
                            disabled={downloading === backupFilename}
                          >
                            {downloading === backupFilename ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Downloading...
                              </>
                            ) : (
                              <>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </>
                            )}
                          </CustomButton>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <CustomEmptyState
            title="No backups yet"
            description="Create a backup to capture a snapshot of your database. Backups will appear here once generated."
            icon={CalendarClock}
            action={
              <CustomButton onClick={handleCreateBackup} disabled={creating}>
                <HardDrive className="mr-2 h-4 w-4" />
                {creating ? "Creating..." : "Create Backup"}
              </CustomButton>
            }
          />
        )}
      </CustomCardContent>
      <CustomModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Backup Created"
        size="md"
      >
        <div className="space-y-4">
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
            This backup is stored temporarily on the server. Download it now if
            you need a local copy—temporary backups may be removed
            automatically.
          </div>
          {latestBackup?.file && (
            <div className="rounded-md border border-dashed border-muted p-4 text-sm">
              <p className="font-medium text-foreground">
                {getFilename(latestBackup.filename) ||
                  getFilename(latestBackup.file) ||
                  "New backup"}
              </p>
              <p className="text-muted-foreground">
                {latestBackup.sizeBytes
                  ? `${formatSize(Number(latestBackup.sizeBytes))} • ${
                      latestBackup.createdAt
                        ? formatDate(latestBackup.createdAt)
                        : "Just now"
                    }`
                  : "Ready for download"}
              </p>
            </div>
          )}
          <div className="flex flex-wrap gap-3 justify-end">
            <CustomButton variant="outline" onClick={() => setModalOpen(false)}>
              Close
            </CustomButton>
            {latestBackup?.file && (
              <CustomButton
                onClick={() =>
                  handleDownload(
                    getFilename(latestBackup.filename) ||
                      getFilename(latestBackup.file),
                    { closeAfter: true }
                  )
                }
                disabled={
                  downloading ===
                  (getFilename(latestBackup.filename) ||
                    getFilename(latestBackup.file))
                }
              >
                {downloading ===
                (getFilename(latestBackup.filename) ||
                  getFilename(latestBackup.file)) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </>
                )}
              </CustomButton>
            )}
          </div>
        </div>
      </CustomModal>
    </CustomCard>
  );
}
