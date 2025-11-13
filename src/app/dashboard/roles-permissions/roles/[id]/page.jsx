"use client";

import { useParams } from "next/navigation";
import { RoleForm } from "@/features/roles/components/RoleForm";

export default function RoleFormPage() {
  const params = useParams();
  const roleId = params?.id || null;
  return <RoleForm roleId={roleId} />;
}
