"use client";

import { useRouter } from "next/navigation";
import {
  Clock,
  Store,
  Shield,
  CreditCard,
  Package,
  Receipt,
  Repeat,
  Mail,
  HardDrive,
} from "lucide-react";
import { PageContainer, PageHeader } from "@/components/ui";
import { DashboardCard } from "@/features/dashboard/components/DashboardCard";
import { cn } from "@/utils/cn";

const settingsCategories = [
  {
    id: "general",
    title: "General Settings",
    description: "Timezone, date/time format, pagination, maintenance mode",
    icon: Clock,
    href: "/dashboard/admin-settings/general",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    id: "store",
    title: "Store Settings",
    description: "Store info, address, contact details, currency",
    icon: Store,
    href: "/dashboard/admin-settings/store",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
  },
  {
    id: "account",
    title: "Account & Privacy",
    description: "Registration, privacy, password strength, GDPR",
    icon: Shield,
    href: "/dashboard/admin-settings/account",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/30",
  },
  {
    id: "payments",
    title: "Payment Settings",
    description: "Payment gateways, currency settings",
    icon: CreditCard,
    href: "/dashboard/admin-settings/payments",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    id: "products",
    title: "Product Settings",
    description: "Product defaults, inventory management",
    icon: Package,
    href: "/dashboard/admin-settings/products",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
  },
  {
    id: "tax",
    title: "Tax Settings",
    description: "Tax calculation, rates, rounding",
    icon: Receipt,
    href: "/dashboard/admin-settings/tax",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/30",
  },
  {
    id: "subscriptions",
    title: "Subscription Settings",
    description: "Subscription settings, grace period, renewals",
    icon: Repeat,
    href: "/dashboard/admin-settings/subscriptions",
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
  },
  {
    id: "email",
    title: "Email Settings",
    description: "Email provider, templates, test users",
    icon: Mail,
    href: "/dashboard/admin-settings/email",
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-50 dark:bg-cyan-950/30",
  },
  {
    id: "storage",
    title: "Storage Settings",
    description: "Storage providers, file constraints",
    icon: HardDrive,
    href: "/dashboard/admin-settings/storage",
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-50 dark:bg-gray-950/30",
  },
];

export default function AdminSettingsPage() {
  const router = useRouter();

  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        subtitle="Configure your system settings and preferences"
      />

      <div className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settingsCategories.map((category) => {
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

