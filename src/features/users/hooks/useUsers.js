"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { userService } from "../services/userService";

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [params, setParams] = useState({
    search: "",
    role: "",
    isActive: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    limit: 20,
    offset: 0,
  });
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });

  const hasFetchedRef = useRef(false);

  const fetchUsers = useCallback(async () => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    setIsLoading(true);
    setError(null);
    try {
      const data = await userService.getUsers(params);
      if (Array.isArray(data?.users)) {
        setUsers(data.users);
        if (data.pagination) setPagination(data.pagination);
      } else if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers([]);
      }
    } catch (err) {
      const message = err?.message || "Failed to fetch users";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    hasFetchedRef.current = false;
    fetchUsers();
  }, [fetchUsers]);

  const setSearch = (search) => setParams((p) => ({ ...p, search, offset: 0 }));
  const setRole = (role) => setParams((p) => ({ ...p, role, offset: 0 }));
  const setActive = (isActive) =>
    setParams((p) => ({ ...p, isActive, offset: 0 }));
  const setSort = (sortBy, sortOrder) =>
    setParams((p) => ({ ...p, sortBy, sortOrder }));
  const setLimit = (limit) => setParams((p) => ({ ...p, limit, offset: 0 }));
  const nextPage = () =>
    setParams((p) => ({ ...p, offset: p.offset + p.limit }));
  const prevPage = () =>
    setParams((p) => ({ ...p, offset: Math.max(0, p.offset - p.limit) }));

  const createUser = useCallback(
    async (payload) => {
      setIsLoading(true);
      setError(null);
      try {
        await userService.createUser(payload);
        toast.success("User created");
        await fetchUsers();
        return true;
      } catch (err) {
        const message = err?.message || "Failed to create user";
        setError(message);
        toast.error(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchUsers]
  );

  const updateUser = useCallback(
    async (id, payload) => {
      setIsLoading(true);
      setError(null);
      try {
        await userService.updateUser(id, payload);
        toast.success("User updated");
        await fetchUsers();
        return true;
      } catch (err) {
        const message = err?.message || "Failed to update user";
        setError(message);
        toast.error(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchUsers]
  );

  const changeRole = useCallback(
    async (id, role) => {
      setIsLoading(true);
      setError(null);
      try {
        await userService.assignRoles(id, [role]);
        toast.success("Role updated");
        await fetchUsers();
        return true;
      } catch (err) {
        const message = err?.message || "Failed to change role";
        setError(message);
        toast.error(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchUsers]
  );

  const deleteUser = useCallback(
    async (id) => {
      setIsLoading(true);
      setError(null);
      try {
        await userService.deleteUser(id);
        toast.success("User deleted");
        await fetchUsers();
        return true;
      } catch (err) {
        const message = err?.message || "Failed to delete user";
        setError(message);
        toast.error(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchUsers]
  );

  const getUserRoles = useCallback(async (id) => {
    try {
      return await userService.getUserRoles(id);
    } catch (err) {
      toast.error(err?.message || "Failed to load roles");
      throw err;
    }
  }, []);

  const removeUserRole = useCallback(
    async (id, roleId) => {
      setIsLoading(true);
      setError(null);
      try {
        await userService.removeUserRole(id, roleId);
        toast.success("Role removed");
        await fetchUsers();
        return true;
      } catch (err) {
        const message = err?.message || "Failed to remove role";
        setError(message);
        toast.error(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchUsers]
  );

  const getUserPermissions = useCallback(async (id) => {
    try {
      return await userService.getUserPermissions(id);
    } catch (err) {
      toast.error(err?.message || "Failed to load permissions");
      throw err;
    }
  }, []);

  return {
    users,
    isLoading,
    error,
    fetchUsers,
    // query
    params,
    pagination,
    setSearch,
    setRole,
    setActive,
    setSort,
    setLimit,
    nextPage,
    prevPage,
    createUser,
    updateUser,
    changeRole,
    deleteUser,
    getUserRoles,
    removeUserRole,
    getUserPermissions,
  };
}
