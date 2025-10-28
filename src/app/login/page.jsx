"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/features/auth";
import { authStorage } from "@/features/auth";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (authStorage.isAuthenticated()) {
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F6F8] p-4">
      <LoginForm />
    </div>
  );
}
