"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { emailTestUserService } from "../services/emailTestUserService";

/**
 * Hook to manage email test users
 */
export function useEmailTestUsers() {
  const [testUsers, setTestUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTestUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await emailTestUserService.getAll();
      setTestUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      const message =
        err?.message || "Failed to fetch test users. Please try again.";
      setError(message);
      setTestUsers([]);
      toast.error(message);
      console.error("Error fetching test users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTestUser = useCallback(
    async (userData) => {
      try {
        const newUser = await emailTestUserService.create(userData);
        setTestUsers((prev) => [...prev, newUser]);
        toast.success("Test user created successfully");
        return newUser;
      } catch (err) {
        const message =
          err?.message || "Failed to create test user. Please try again.";
        toast.error(message);
        throw err;
      }
    },
    []
  );

  useEffect(() => {
    fetchTestUsers();
  }, [fetchTestUsers]);

  return {
    testUsers,
    loading,
    error,
    createTestUser,
    refetch: fetchTestUsers,
  };
}

