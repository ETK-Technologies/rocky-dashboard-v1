"use client";

import { LogoutButton } from "@/features/auth";
import { useAuth } from "@/features/auth";

/**
 * Example usage of LogoutButton in a dashboard header
 */
export function DashboardHeader() {
    const { user } = useAuth();

    return (
        <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <h1 className="text-xl font-semibold text-gray-900">
                            Dashboard
                        </h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-700">
                            Welcome, {user?.firstName || user?.name || "User"}
                        </div>

                        {/* Logout Button */}
                        <LogoutButton
                            variant="outline"
                            size="sm"
                            showIcon={true}
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}

/**
 * Example usage in a sidebar
 */
export function SidebarFooter() {
    return (
        <div className="p-4 border-t">
            <LogoutButton
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                showIcon={true}
            >
                Sign Out
            </LogoutButton>
        </div>
    );
}

/**
 * Example usage as a simple button
 */
export function SimpleLogoutExample() {
    return (
        <div className="p-4">
            <LogoutButton />
        </div>
    );
}
