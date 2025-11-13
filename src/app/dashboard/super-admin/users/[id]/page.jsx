"use client";

import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { UserForm } from "@/features/users";

export default function UserPage() {
  const params = useParams();
  const id = params?.id;

  return (
    <ProtectedRoute roles={["super_admin"]}>
      <UserForm userId={id} />
    </ProtectedRoute>
  );
}

