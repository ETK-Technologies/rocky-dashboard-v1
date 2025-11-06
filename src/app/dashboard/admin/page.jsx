/**
 * Admin Page
 * Only accessible by admin and super_admin roles
 */

"use client";

import { ProtectedRoute } from "@/components/common";
import { PageContainer, PageHeader } from "@/components/ui";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Shield, Users, Settings, Database } from "lucide-react";

export default function AdminPage() {
  const { user, getUserFullName, getRoleDisplayName } = useAuth();

  const adminFeatures = [
    {
      icon: Users,
      title: "User Management",
      description: "Manage user accounts, roles, and permissions",
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      icon: Database,
      title: "Data Management",
      description: "Access and manage all products and categories",
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      icon: Settings,
      title: "System Settings",
      description: "Configure system-wide settings and preferences",
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      icon: Shield,
      title: "Security",
      description: "Monitor security logs and manage access controls",
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-900/20",
    },
  ];

  return (
    <ProtectedRoute roles={["admin", "super_admin"]}>
      <PageContainer>
        <PageHeader
          title="Admin Panel"
          subtitle="Advanced administration and management tools"
        />

        {/* User Info Card */}
        <div className="mb-8 p-6 bg-gradient-to-r from-[#af7f56] to-purple-600 rounded-lg shadow-lg text-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{getUserFullName()}</h2>
              <p className="text-white/90">
                Role: {getRoleDisplayName()} • Email: {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Admin Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {adminFeatures.map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className={`inline-flex p-3 rounded-lg ${feature.bgColor} mb-4`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">1,234</div>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Sessions</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">567</div>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="text-sm text-gray-600 dark:text-gray-400">System Health</div>
            <div className="text-2xl font-bold text-green-500">100%</div>
          </div>
        </div>

        {/* Notice */}
        <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                Admin Access
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                You have administrative privileges. Please use these tools responsibly.
                All actions are logged for security purposes.
              </p>
            </div>
          </div>
        </div>
      </PageContainer>
    </ProtectedRoute>
  );
}

