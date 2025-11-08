import { makeRequest } from "@/utils/makeRequest";

/**
 * Service for interacting with system-level admin endpoints.
 */
export const systemService = {
  /**
   * Fetch high-level system metrics for administrators.
   * @returns {Promise<Object>} System metrics including uptime, database size, and API call counts.
   */
  async getInfo() {
    return makeRequest("/api/v1/admin/system/info", {
      method: "GET",
    });
  },

  /**
   * Retrieve available database backups.
   * @returns {Promise<Array>} Array of backup metadata objects.
   */
  async getBackups() {
    return makeRequest("/api/v1/admin/system/backups", {
      method: "GET",
    });
  },

  /**
   * Trigger creation of a new database backup.
   * @returns {Promise<Object>} Metadata about the created backup file.
   */
  async createBackup() {
    return makeRequest("/api/v1/admin/system/backup", {
      method: "POST",
    });
  },

  /**
   * Download a specific backup file as a Blob.
   * @param {string} filename - Backup filename to download.
   * @returns {Promise<{ blob: Blob, filename: string }>}
   */
  async downloadBackup(filename) {
    if (!filename) {
      throw new Error("Filename is required to download a backup.");
    }

    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!baseURL) {
      throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
    }

    const url = `${baseURL}/api/v1/admin/system/backups/${encodeURIComponent(
      filename
    )}`;

    const getAccessToken = () => {
      if (typeof window === "undefined") return null;
      try {
        return localStorage.getItem("access_token");
      } catch {
        return null;
      }
    };

    const headers = new Headers();

    const accessToken = getAccessToken();
    if (accessToken) {
      headers.append("Authorization", `Bearer ${accessToken}`);
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        errorText || `Failed to download backup (${response.status}).`
      );
    }

    const blob = await response.blob();
    const disposition = response.headers.get("content-disposition");

    let downloadName = filename;
    if (disposition) {
      const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)/i);
      if (match && match[1]) {
        downloadName = decodeURIComponent(match[1].replace(/"/g, ""));
      }
    }

    return { blob, filename: downloadName };
  },
};
