"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  List,
  Repeat,
  Trash2,
  Upload,
} from "lucide-react";
import { cn } from "@/utils/cn";

const jobsTabs = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    href: "/dashboard/admin-jobs/overview",
  },
  {
    id: "queues",
    label: "Queues",
    icon: List,
    href: "/dashboard/admin-jobs/queues",
  },
  {
    id: "renewals",
    label: "Renewals",
    icon: Repeat,
    href: "/dashboard/admin-jobs/renewals",
  },
  {
    id: "data-cleanup",
    label: "Data Cleanup",
    icon: Trash2,
    href: "/dashboard/admin-jobs/data-cleanup",
  },
  {
    id: "import-jobs",
    label: "Import Jobs",
    icon: Upload,
    href: "/dashboard/admin-jobs/import-jobs",
  },
];

export function JobsNavigation({ mobile = false }) {
  const pathname = usePathname();

  if (mobile) {
    return (
      <div className="flex items-center gap-1 px-4 py-3 overflow-x-auto">
        {jobsTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border p-6">
      <nav className="space-y-1">
        {jobsTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

