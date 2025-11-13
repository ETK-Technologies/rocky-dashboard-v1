"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { roleService } from "../services/roleService";

export function useRoles() {
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [params, setParams] = useState({
    search: "",
    includePermissions: true,
  });

  const hasFetchedRef = useRef(false);

  const fetchRoles = useCallback(async () => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    setIsLoading(true);
    setError(null);
    try {
      const data = await roleService.getAll(params);
      setRoles(Array.isArray(data) ? data : []);
    } catch (err) {
      const message = err?.message || "Failed to fetch roles";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    hasFetchedRef.current = false;
    fetchRoles();
  }, [fetchRoles]);

  const setSearch = (search) => setParams((p) => ({ ...p, search }));
  const setIncludePermissions = (includePermissions) =>
    setParams((p) => ({ ...p, includePermissions }));

  const createRole = useCallback(
    async (payload) => {
      setIsLoading(true);
      setError(null);
      try {
        const role = await roleService.create(payload);
        toast.success("Role created successfully");
        await fetchRoles();
        return { success: true, data: role };
      } catch (err) {
        const message = err?.message || "Failed to create role";
        setError(message);
        toast.error(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [fetchRoles]
  );

  const updateRole = useCallback(
    async (id, payload) => {
      setIsLoading(true);
      setError(null);
      try {
        const role = await roleService.update(id, payload);
        toast.success("Role updated successfully");
        await fetchRoles();
        return { success: true, data: role };
      } catch (err) {
        const message = err?.message || "Failed to update role";
        setError(message);
        toast.error(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [fetchRoles]
  );

  const deleteRole = useCallback(
    async (id) => {
      setIsLoading(true);
      setError(null);
      try {
        await roleService.delete(id);
        toast.success("Role deactivated successfully");
        await fetchRoles();
        return { success: true };
      } catch (err) {
        const message = err?.message || "Failed to deactivate role";
        setError(message);
        toast.error(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [fetchRoles]
  );

  const getRole = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const role = await roleService.getById(id);
      return { success: true, data: role };
    } catch (err) {
      const message = err?.message || "Failed to fetch role";
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    roles,
    isLoading,
    error,
    params,
    fetchRoles,
    setSearch,
    setIncludePermissions,
    createRole,
    updateRole,
    deleteRole,
    getRole,
  };
}

