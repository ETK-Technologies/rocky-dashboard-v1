"use client";

import { useParams } from "next/navigation";
import { PermissionForm } from "@/features/permissions/components/PermissionForm";

export default function PermissionFormPage() {
  const params = useParams();
  const permissionId = params?.id || null;
  return <PermissionForm permissionId={permissionId} />;
}
