"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Settings,
  FileText,
  Users,
  X,
  Folder,
  Shield,
  Crown,
  User,
  Upload,
  Tag,
  Globe,
  ChevronDown,
  ChevronRight,
  GitBranch,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { RoleGuard } from "@/components/common/ProtectedRoute";
import { useAuth } from "@/features/auth/hooks/useAuth";

const navigation = [
  { name: "Files", href: "/dashboard", icon: LayoutDashboard },
  {
    name: "Categories",
    href: "/dashboard/categories",
    icon: Folder,
    roles: ["admin", "super_admin"],
  },
  {
    name: "Products",
    href: "/dashboard/products",
    icon: Package,
    roles: ["admin", "super_admin"],
    children: [
      {
        name: "Global Attributes",
        href: "/dashboard/products/global-attributes",
        icon: Globe,
        roles: ["admin", "super_admin"],
      },
    ],
  },
];

const adminNavigation = [
  {
    name: "Admin Panel",
    href: "/dashboard/admin",
    icon: Shield,
    roles: ["admin", "super_admin"],
  },
  {
    name: "Super Admin",
    href: "/dashboard/super-admin",
    icon: Crown,
    roles: ["super_admin"],
  },
  {
    name: "Users",
    href: "/dashboard/super-admin/users",
    icon: Users,
    roles: ["super_admin"],
  },
  {
    name: "Media",
    href: "/dashboard/super-admin/uploads",
    icon: Upload,
    roles: ["super_admin"],
  },
  {
    name: "Builder",
    href: "/dashboard/builder",
    icon: Folder,
    roles: ["admin", "super_admin"],
  },
  {
    name: "Flow",
    href: "/dashboard/flow",
    icon: GitBranch,
    roles: ["admin", "super_admin"],
  },
];

const bottomNavigation = [
  { name: "Profile", href: "/dashboard/profile", icon: User },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { isAuthorized } = useAuth();
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpand = (itemName) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
    }));
  };

  const NavItem = ({ item }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems[item.name] ?? true;
    const isActive =
      pathname === item.href ||
      (hasChildren && item.children.some((child) => pathname === child.href));

    // Check if user has required role for this nav item
    if (item.roles && !isAuthorized(item.roles)) {
      return null;
    }

    // Filter children by role
    const visibleChildren = hasChildren
      ? item.children.filter(
          (child) => !child.roles || isAuthorized(child.roles)
        )
      : [];

    return (
      <li>
        <div>
          <div
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            {hasChildren && (
              <button
                type="button"
                className="p-0 m-0 border-0 bg-transparent cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(item.name);
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-4" />}
            <item.icon className="h-5 w-5" />
            <Link href={item.href} onClick={onClose} className="flex-1">
              {item.name}
            </Link>
          </div>
          {hasChildren && isExpanded && visibleChildren.length > 0 && (
            <ul className="ml-4 mt-1 space-y-1">
              {visibleChildren.map((child) => {
                const isChildActive = pathname === child.href;
                return (
                  <li key={child.name}>
                    <Link
                      href={child.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                        isChildActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <child.icon className="h-4 w-4" />
                      {child.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </li>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-card border-r border-border w-64 z-40 transition-all duration-300 ease-in-out",
          "lg:translate-x-0 shadow-sm",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <h1 className="text-base sm:text-lg font-semibold text-foreground">
              Rocky Dashboard
            </h1>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 sm:mt-6 px-4 flex flex-col h-[calc(100vh-100px)] sm:h-[calc(100vh-120px)]">
          <ul className="space-y-1 flex-1">
            {/* Main Navigation */}
            {navigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}

            {/* Admin Navigation Section */}
            {isAuthorized(["admin", "super_admin"]) && (
              <>
                <li className="pt-4 pb-2">
                  <div className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Administration
                  </div>
                </li>
                {adminNavigation.map((item) => (
                  <NavItem key={item.name} item={item} />
                ))}
              </>
            )}
          </ul>

          {/* Bottom Navigation */}
          <div className="border-t border-border pt-4 pb-4">
            <ul className="space-y-1">
              {bottomNavigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </ul>
          </div>
        </nav>
      </aside>
    </>
  );
}
