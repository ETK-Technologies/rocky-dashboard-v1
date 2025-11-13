"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { adminPermissionService } from "../services/adminPermissionService";

export function useAdminPermissions() {
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [params, setParams] = useState({
    search: "",
    resource: "",
    action: "",
  });

  const hasFetchedRef = useRef(false);

  const fetchPermissions = useCallback(async () => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminPermissionService.getAll(params);
      setPermissions(Array.isArray(data) ? data : []);
    } catch (err) {
      const message = err?.message || "Failed to fetch permissions";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    hasFetchedRef.current = false;
    fetchPermissions();
  }, [fetchPermissions]);

  const setSearch = (search) => setParams((p) => ({ ...p, search }));
  const setResource = (resource) => setParams((p) => ({ ...p, resource }));
  const setAction = (action) => setParams((p) => ({ ...p, action }));

  const createPermission = useCallback(
    async (payload) => {
      setIsLoading(true);
      setError(null);
      try {
        const permission = await adminPermissionService.create(payload);
        toast.success("Permission created successfully");
        await fetchPermissions();
        return { success: true, data: permission };
      } catch (err) {
        const message = err?.message || "Failed to create permission";
        setError(message);
        toast.error(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [fetchPermissions]
  );

  const updatePermission = useCallback(
    async (id, payload) => {
      setIsLoading(true);
      setError(null);
      try {
        const permission = await adminPermissionService.update(id, payload);
        toast.success("Permission updated successfully");
        await fetchPermissions();
        return { success: true, data: permission };
      } catch (err) {
        const message = err?.message || "Failed to update permission";
        setError(message);
        toast.error(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [fetchPermissions]
  );

  const getPermission = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const permission = await adminPermissionService.getById(id);
      return { success: true, data: permission };
    } catch (err) {
      const message = err?.message || "Failed to fetch permission";
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    permissions,
    isLoading,
    error,
    params,
    fetchPermissions,
    setSearch,
    setResource,
    setAction,
    createPermission,
    updatePermission,
    getPermission,
  };
}

