"use client";

import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  List,
  Repeat,
  Trash2,
  Database,
  Upload,
} from "lucide-react";
import { PageContainer, PageHeader } from "@/components/ui";
import { cn } from "@/utils/cn";

const jobsCategories = [
  {
    id: "overview",
    title: "Jobs Overview",
    description: "Monitor all background job queues, statistics, and recent jobs",
    icon: LayoutDashboard,
    href: "/dashboard/admin-jobs/overview",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    id: "queues",
    title: "Queue Management",
    description: "View and manage jobs in specific queues (renewals, product-import)",
    icon: List,
    href: "/dashboard/admin-jobs/queues",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
  },
  {
    id: "renewals",
    title: "Renewals Job",
    description: "Configure renewals job schedule and concurrency settings",
    icon: Repeat,
    href: "/dashboard/admin-jobs/renewals",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/30",
  },
  {
    id: "data-cleanup",
    title: "Data Cleanup",
    description: "Monitor and manage data retention cleanup operations",
    icon: Trash2,
    href: "/dashboard/admin-jobs/data-cleanup",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/30",
  },
  {
    id: "import-jobs",
    title: "Product Import Jobs",
    description: "Track and monitor product import jobs from CSV files",
    icon: Upload,
    href: "/dashboard/admin-jobs/import-jobs",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
  },
];

export default function AdminJobsPage() {
  const router = useRouter();

  return (
    <PageContainer>
      <PageHeader
        title="Jobs Management"
        subtitle="Monitor and manage background job queues and operations"
      />

      <div className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobsCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.id}
                onClick={() => router.push(category.href)}
                className={cn(
                  "group relative bg-card rounded-xl border border-border p-6 cursor-pointer transition-all duration-200",
                  "hover:shadow-lg hover:border-ring hover:-translate-y-1"
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    "w-14 h-14 rounded-lg flex items-center justify-center mb-4",
                    category.bgColor
                  )}
                >
                  <Icon className={cn("h-7 w-7", category.color)} />
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {category.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {category.description}
                </p>

                {/* Arrow indicator */}
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg
                    className="w-5 h-5 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}

