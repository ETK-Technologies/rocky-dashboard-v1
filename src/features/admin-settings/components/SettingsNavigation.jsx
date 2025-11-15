"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { cn } from "@/utils/cn";

const settingsTabs = [
  {
    id: "general",
    label: "General",
    icon: Clock,
    href: "/dashboard/admin-settings/general",
  },
  {
    id: "store",
    label: "Store",
    icon: Store,
    href: "/dashboard/admin-settings/store",
  },
  {
    id: "account",
    label: "Account & Privacy",
    icon: Shield,
    href: "/dashboard/admin-settings/account",
  },
  {
    id: "payments",
    label: "Payments",
    icon: CreditCard,
    href: "/dashboard/admin-settings/payments",
  },
  {
    id: "products",
    label: "Products",
    icon: Package,
    href: "/dashboard/admin-settings/products",
  },
  {
    id: "tax",
    label: "Tax",
    icon: Receipt,
    href: "/dashboard/admin-settings/tax",
  },
  {
    id: "subscriptions",
    label: "Subscriptions",
    icon: Repeat,
    href: "/dashboard/admin-settings/subscriptions",
  },
  {
    id: "email",
    label: "Email",
    icon: Mail,
    href: "/dashboard/admin-settings/email",
  },
  {
    id: "storage",
    label: "Storage",
    icon: HardDrive,
    href: "/dashboard/admin-settings/storage",
  },
];

export function SettingsNavigation({ mobile = false }) {
  const pathname = usePathname();

  if (mobile) {
    return (
      <div className="px-4 py-3">
        <nav className="flex space-x-2">
          {settingsTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    );
  }

  return (
    <div className="w-64 h-full flex-shrink-0 border-r border-border bg-card">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Settings
        </h2>
        <nav className="space-y-1">
          {settingsTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

