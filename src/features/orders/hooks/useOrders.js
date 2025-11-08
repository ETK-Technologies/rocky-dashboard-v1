"use client";

import { useCallback, useEffect, useState } from "react";
import { orderService } from "../services/orderService";
import { toast } from "react-toastify";

const DEFAULT_LIMIT = 20;

/**
 * Hook for fetching and managing orders list with filtering and pagination
 * @param {Object} initialFilters - Optional initial filter values
 * @returns {Object} Orders state and helpers
 */
export function useOrders(initialFilters = {}) {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_LIMIT,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: DEFAULT_LIMIT,
    sortBy: "createdAt",
    sortOrder: "desc",
    ...initialFilters,
  });

  /**
   * Fetch orders from API using current filters
   */
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { page = 1, limit = DEFAULT_LIMIT, ...rest } = filters;
      const offset = Math.max(0, (page - 1) * limit);

      const params = {
        limit,
        offset,
      };

      Object.entries(rest).forEach(([key, value]) => {
        if (value === undefined || value === null) {
          return;
        }

        if (Array.isArray(value)) {
          if (value.length > 0) {
            params[key] = value;
          }
          return;
        }

        if (typeof value === "string" && value.trim() === "") {
          return;
        }

        params[key] = value;
      });

      const response = await orderService.getAll(params);

      let list = [];
      let paginationData = null;

      if (Array.isArray(response)) {
        list = response;
      } else if (Array.isArray(response?.orders)) {
        list = response.orders;
        paginationData =
          response.pagination || response.meta || response.data?.pagination;
      } else if (Array.isArray(response?.data?.orders)) {
        list = response.data.orders;
        paginationData =
          response.data.pagination || response.pagination || response.meta;
      } else if (Array.isArray(response?.data)) {
        list = response.data;
        paginationData =
          response.pagination || response.meta || response.data?.pagination;
      } else if (Array.isArray(response?.items)) {
        list = response.items;
        paginationData = response.meta || response.pagination;
      } else if (Array.isArray(response?.results)) {
        list = response.results;
        paginationData = response.pagination ||
          response.meta || {
            page: response.page,
            limit: response.limit,
            total: response.total,
            totalPages: response.totalPages,
          };
      }

      if (!Array.isArray(list)) {
        list = [];
      }

      const total =
        paginationData?.total ??
        paginationData?.count ??
        paginationData?.totalCount ??
        list.length ??
        0;
      const limitValue = paginationData?.limit ?? limit ?? DEFAULT_LIMIT;

      let pageValue =
        paginationData?.page ??
        paginationData?.currentPage ??
        filters.page ??
        1;

      if (
        pageValue === undefined &&
        paginationData &&
        paginationData.offset !== undefined
      ) {
        const rawOffset = Number(paginationData.offset) || 0;
        pageValue = Math.floor(rawOffset / limitValue) + 1;
      }

      if (!pageValue || Number.isNaN(pageValue)) {
        pageValue = 1;
      }

      const totalPagesValue =
        paginationData?.totalPages ??
        paginationData?.pages ??
        (limitValue > 0 ? Math.ceil(total / limitValue) : 1);

      setOrders(Array.isArray(list) ? list : []);
      setPagination({
        page: pageValue,
        limit: limitValue,
        total: total ?? 0,
        totalPages: totalPagesValue || 1,
      });
    } catch (err) {
      const message = err.message || "Failed to fetch orders";
      setError(message);
      setOrders([]);
      toast.error(message);
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Update filters and reset to first page unless page explicitly provided
   * @param {Object} newFilters - New filter values
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page:
        newFilters.page !== undefined
          ? newFilters.page
          : newFilters.offset !== undefined
          ? Math.floor(
              (newFilters.offset || 0) /
                (newFilters.limit || prev.limit || DEFAULT_LIMIT)
            ) + 1
          : 1,
    }));
  }, []);

  /**
   * Force refresh
   */
  const refresh = useCallback(async () => {
    await fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    pagination,
    loading,
    error,
    filters,
    updateFilters,
    refresh,
  };
}
