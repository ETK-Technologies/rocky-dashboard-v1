"use client";

import { useParams } from "next/navigation";
import { UserForm } from "@/features/users";

export default function UserPage() {
  const params = useParams();
  const id = params?.id;

  return <UserForm userId={id} />;
}

