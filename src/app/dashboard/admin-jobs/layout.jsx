"use client";

import { usePathname } from "next/navigation";
import { JobsLayout } from "@/features/admin-jobs/components/JobsLayout";

export default function AdminJobsLayout({ children }) {
  const pathname = usePathname();
  // Don't apply jobs layout to the dashboard page itself
  const isDashboardPage = pathname === "/dashboard/admin-jobs";

  if (isDashboardPage) {
    return <>{children}</>;
  }

  return <JobsLayout>{children}</JobsLayout>;
}

