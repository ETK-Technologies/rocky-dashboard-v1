"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { productService } from "../services/productService";
import { toast } from "react-toastify";

/**
 * Hook for managing product imports with job tracking and polling
 * @returns {Object} Import state and methods
 */
export function useProductImport() {
  const [importJobs, setImportJobs] = useState([]);
  const [currentJob, setCurrentJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const pollingIntervalRef = useRef(null);

  /**
   * Fetch list of recent import jobs
   */
  const fetchImportJobs = useCallback(async () => {
    try {
      const response = await productService.getImportJobs();
      const jobs = response.items || response || [];
      setImportJobs(Array.isArray(jobs) ? jobs : []);
    } catch (err) {
      console.error("Error fetching import jobs:", err);
      setError(err.message || "Failed to fetch import jobs");
    }
  }, []);

  /**
   * Fetch status of a specific import job
   * @param {string} jobId - Import job ID
   */
  const fetchJobStatus = useCallback(async (jobId) => {
    try {
      const job = await productService.getImportJobStatus(jobId);
      setCurrentJob(job);

      // Update job in jobs list if it exists
      setImportJobs((prev) => prev.map((j) => (j.id === jobId ? job : j)));

      return job;
    } catch (err) {
      console.error("Error fetching job status:", err);
      throw err;
    }
  }, []);

  /**
   * Start polling for job status updates
   * @param {string} jobId - Import job ID
   * @param {number} interval - Polling interval in milliseconds (default: 2000)
   */
  const startPolling = useCallback(
    (jobId, interval = 2000) => {
      // Clear any existing polling
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      // Start polling
      pollingIntervalRef.current = setInterval(async () => {
        try {
          const job = await fetchJobStatus(jobId);

          // Stop polling if job is completed or failed
          if (
            job.status === "COMPLETED" ||
            job.status === "FAILED" ||
            job.status === "CANCELLED"
          ) {
            stopPolling();

            if (job.status === "COMPLETED") {
              toast.success(
                `Import completed: ${
                  job.successCount || 0
                } products imported successfully`
              );
              if (job.failedCount > 0) {
                toast.warning(
                  `${job.failedCount} products failed to import. Check error log for details.`
                );
              }
            } else if (job.status === "FAILED") {
              toast.error("Import job failed. Check error log for details.");
            }
          }
        } catch (err) {
          console.error("Error polling job status:", err);
          // Continue polling even on error (might be temporary network issue)
        }
      }, interval);
    },
    [fetchJobStatus]
  );

  /**
   * Stop polling for job status updates
   */
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  /**
   * Import products from a CSV file
   * @param {File} file - CSV file to import
   * @returns {Promise<Object>} Created import job
   */
  const importProducts = useCallback(
    async (file) => {
      if (!file) {
        throw new Error("No file provided");
      }

      setLoading(true);
      setError(null);

      try {
        const job = await productService.importProducts(file);
        setCurrentJob(job);

        // Add job to jobs list
        setImportJobs((prev) => [job, ...prev]);

        // Start polling if job is in PENDING or PROCESSING status
        if (job.status === "PENDING" || job.status === "PROCESSING") {
          startPolling(job.id);
        }

        toast.success("Import job created successfully");
        return job;
      } catch (err) {
        const errorMessage = err.message || "Failed to create import job";
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [startPolling]
  );

  /**
   * Refresh current job status
   */
  const refreshCurrentJob = useCallback(async () => {
    if (currentJob?.id) {
      try {
        await fetchJobStatus(currentJob.id);
      } catch (err) {
        console.error("Error refreshing job status:", err);
      }
    }
  }, [currentJob?.id, fetchJobStatus]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  // Fetch import jobs on mount
  useEffect(() => {
    fetchImportJobs();
  }, [fetchImportJobs]);

  return {
    importJobs,
    currentJob,
    loading,
    error,
    importProducts,
    fetchImportJobs,
    fetchJobStatus,
    refreshCurrentJob,
    startPolling,
    stopPolling,
  };
}
