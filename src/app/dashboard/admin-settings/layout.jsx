"use client";

import { usePathname } from "next/navigation";
import { SettingsLayout } from "@/features/admin-settings/components/SettingsLayout";

export default function AdminSettingsLayout({ children }) {
  const pathname = usePathname();
  // Don't apply settings layout to the dashboard page itself
  const isDashboardPage = pathname === "/dashboard/admin-settings";

  if (isDashboardPage) {
    return <>{children}</>;
  }

  return <SettingsLayout>{children}</SettingsLayout>;
}

