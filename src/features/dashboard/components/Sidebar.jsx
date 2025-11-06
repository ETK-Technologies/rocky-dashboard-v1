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
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Globe,
  GitBranch,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { RoleGuard } from "@/components/common/ProtectedRoute";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Tooltip } from "@/components/ui/Tooltip";

const navigation = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },

  {
    name: "Products",
    href: "/dashboard/products",
    icon: Package,
    roles: ["admin", "super_admin"],
    children: [
      {
        name: "Categories",
        href: "/dashboard/categories",
        icon: Folder,
        roles: ["admin", "super_admin"],
      },
      {
        name: "Attributes",
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
    name: "Quiz Builder",
    href: "/dashboard/quiz-builder",
    icon: ClipboardList,
    roles: ["admin", "super_admin"],
  },
];

const bottomNavigation = [
  { name: "Profile", href: "/dashboard/profile", icon: User },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar({
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}) {
  const pathname = usePathname();
  const { isAuthorized } = useAuth();
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpand = (itemName) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
    }));
  };

  const NavItem = ({ item, isCollapsed }) => {
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
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
              isCollapsed && "justify-center px-2"
            )}
          >
            {/* {!hasChildren && <div className="w-4" />} */}
            {isCollapsed ? (
              <Tooltip content={item.name} side="right" usePortal={true}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center justify-center w-full"
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                </Link>
              </Tooltip>
            ) : (
              <>
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <Link href={item.href} onClick={onClose} className="flex-1">
                  {item.name}
                </Link>
              </>
            )}
            {hasChildren && !isCollapsed && (
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
          </div>
          {hasChildren &&
            isExpanded &&
            !isCollapsed &&
            visibleChildren.length > 0 && (
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
          "fixed left-0 top-0 h-full bg-card border-r border-border z-40 transition-all duration-300 ease-in-out flex flex-col shadow-sm",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-16 lg:w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6 border-b border-border">
          <div
            className={cn(
              "flex items-center gap-2",
              isCollapsed && "justify-center w-full"
            )}
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-[#af7f56] to-[#9d6f46] rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            {!isCollapsed && (
              <h1 className="text-base sm:text-lg font-semibold text-foreground whitespace-nowrap">
                Rocky Dashboard
              </h1>
            )}
          </div>
          <div className="flex items-center gap-1">
            {/* Desktop collapse toggle */}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-accent"
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? (
                  <ChevronRightIcon className="h-5 w-5" />
                ) : (
                  <ChevronLeft className="h-5 w-5" />
                )}
              </button>
            )}
            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {/* Main Navigation */}
            {navigation.map((item) => (
              <NavItem key={item.name} item={item} isCollapsed={isCollapsed} />
            ))}

            {/* Admin Navigation Section */}
            {isAuthorized(["admin", "super_admin"]) && (
              <>
                {!isCollapsed && (
                  <li className="pt-4 pb-2">
                    <div className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Administration
                    </div>
                  </li>
                )}
                {adminNavigation.map((item) => (
                  <NavItem
                    key={item.name}
                    item={item}
                    isCollapsed={isCollapsed}
                  />
                ))}
              </>
            )}
          </ul>

          {/* Bottom Navigation */}
          <div className="border-t border-border pt-4 pb-4 mt-4">
            <ul className="space-y-1 px-2">
              {bottomNavigation.map((item) => (
                <NavItem
                  key={item.name}
                  item={item}
                  isCollapsed={isCollapsed}
                />
              ))}
            </ul>
          </div>
        </nav>
      </aside>
    </>
  );
}
