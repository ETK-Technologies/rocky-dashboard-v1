"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar, Topbar } from "@/features/dashboard";
import { authStorage } from "@/features/auth";
import { cn } from "@/utils/cn";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load sidebar collapsed state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState !== null) {
      setIsSidebarCollapsed(savedState === "true");
    }
  }, []);

  // Auto-collapse sidebar when entering settings or jobs pages
  useEffect(() => {
    // Check if we're on a settings or jobs page
    const isSettingsPage = pathname?.startsWith("/dashboard/admin-settings");
    const isJobsPage = pathname?.startsWith("/dashboard/admin-jobs");

    if (isSettingsPage || isJobsPage) {
      // Save current state before collapsing
      const currentState = localStorage.getItem("sidebarCollapsed");
      if (currentState !== "true") {
        localStorage.setItem("sidebarCollapsedPrevious", currentState || "false");
        setIsSidebarCollapsed(true);
        localStorage.setItem("sidebarCollapsed", "true");
      }
    } else {
      // Restore previous state when leaving settings/jobs (only if it was saved)
      const previousState = localStorage.getItem("sidebarCollapsedPrevious");
      if (previousState !== null) {
        setIsSidebarCollapsed(previousState === "true");
        localStorage.setItem("sidebarCollapsed", previousState);
        localStorage.removeItem("sidebarCollapsedPrevious");
      }
    }
  }, [pathname]);

  useEffect(() => {
    // Check authentication
    if (!authStorage.isAuthenticated()) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const toggleSidebarCollapse = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", String(newState));
  };

  // Don't render until auth check is complete
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />

      <div
        className={cn(
          "flex-1 flex flex-col w-full relative z-0 min-w-0 transition-all duration-300",
          isSidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
        )}
      >
        <Topbar onMenuClick={toggleSidebar} />

        <main className="flex-1 overflow-auto relative z-0 bg-background w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
