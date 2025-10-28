"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  Menu,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/dashboard/products", icon: Package },
  { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full text-white w-64 z-50 transition-transform duration-300 ease-in-out",
          "bg-[#1d2327]",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
          <h1 className="text-xl font-semibold text-white">Rocky Dashboard</h1>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-3">
          <ul className="space-y-0.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary text-white shadow-sm"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <p className="text-xs text-gray-500 text-center">
            © 2025 Rocky Dashboard
          </p>
        </div>
      </aside>
    </>
  );
}
