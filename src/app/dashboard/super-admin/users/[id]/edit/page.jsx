"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { UserForm, userService } from "@/features/users";
import { LoadingState, ErrorState } from "@/components/ui";

export default function EditUserPage() {
  const params = useParams();
  const id = params?.id;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await userService.getUser(id);
        if (mounted) setUser(data);
      } catch (err) {
        if (mounted) setError(err?.message || "Failed to load user");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (id) load();
    return () => {
      mounted = false;
    };
  }, [id]);

  return (
    <ProtectedRoute roles={["super_admin"]}>
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <LoadingState message="Loading user..." />
        </div>
      ) : error ? (
        <ErrorState title="Failed to load user" message={error} />
      ) : (
        <UserForm userId={id} defaultValues={user} />
      )}
    </ProtectedRoute>
  );
}
