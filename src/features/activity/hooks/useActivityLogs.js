"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { activityService } from "../services/activityService";

const DEFAULT_LIMIT = 20;

const getInitialPagination = () => ({
  page: 1,
  limit: DEFAULT_LIMIT,
  total: 0,
  totalPages: 1,
});

/**
 * Hook to manage admin activity logs with filtering and pagination
 * @param {Object} initialFilters
 */
export function useActivityLogs(initialFilters = {}) {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(getInitialPagination);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: DEFAULT_LIMIT,
    ...initialFilters,
  });

  const sanitisedFilters = useMemo(() => {
    const nextFilters = { ...filters };
    if (!nextFilters.page || Number.isNaN(Number(nextFilters.page))) {
      nextFilters.page = 1;
    }
    if (!nextFilters.limit || Number.isNaN(Number(nextFilters.limit))) {
      nextFilters.limit = DEFAULT_LIMIT;
    }
    return nextFilters;
  }, [filters]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await activityService.getActivityLogs(sanitisedFilters);

      let items = [];
      let meta = null;

      if (Array.isArray(response?.items)) {
        items = response.items;
        meta =
          response.meta ||
          response.pagination || {
            total: response.total,
            page: response.page,
            limit: response.limit,
            totalPages: response.totalPages,
          };
      } else if (Array.isArray(response?.data?.items)) {
        items = response.data.items;
        meta =
          response.data.meta ||
          response.data.pagination || {
            total: response.data.total,
            page: response.data.page,
            limit: response.data.limit,
            totalPages: response.data.totalPages,
          };
      } else if (Array.isArray(response)) {
        items = response;
      }

      const total =
        meta?.total ??
        meta?.count ??
        meta?.totalCount ??
        response?.total ??
        items.length ??
        0;
      const limit = Number(
        meta?.limit ?? sanitisedFilters.limit ?? DEFAULT_LIMIT
      );
      const page = Number(
        meta?.page ??
          meta?.currentPage ??
          response?.page ??
          sanitisedFilters.page ??
          1
      );
      const totalPages =
        meta?.totalPages ??
        meta?.pages ??
        response?.totalPages ??
        (limit > 0 ? Math.ceil(total / limit) : 1);

      setLogs(Array.isArray(items) ? items : []);
      setPagination({
        page: Number.isNaN(page) ? 1 : page,
        limit: Number.isNaN(limit) ? DEFAULT_LIMIT : limit,
        total: Number.isNaN(total) ? 0 : total,
        totalPages: Number.isNaN(totalPages) ? 1 : totalPages || 1,
      });
    } catch (err) {
      const message =
        err?.message || "Failed to fetch activity logs. Please try again.";
      setError(message);
      setLogs([]);
      setPagination(getInitialPagination());
      toast.error(message);
      console.error("Error fetching activity logs:", err);
    } finally {
      setLoading(false);
    }
  }, [sanitisedFilters]);

  const updateFilters = useCallback((nextFilters = {}) => {
    setFilters((prev) => {
      const updated = {
        ...prev,
        ...nextFilters,
      };

      if (nextFilters.page === undefined) {
        updated.page = 1;
      }

      if (nextFilters.limit !== undefined) {
        const limitValue = Number(nextFilters.limit);
        updated.limit = Number.isNaN(limitValue) ? DEFAULT_LIMIT : limitValue;
      }

      return updated;
    });
  }, []);

  const setPage = useCallback((page) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  }, []);

  const refresh = useCallback(() => fetchLogs(), [fetchLogs]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    pagination,
    loading,
    error,
    filters: sanitisedFilters,
    updateFilters,
    setPage,
    refresh,
  };
}


