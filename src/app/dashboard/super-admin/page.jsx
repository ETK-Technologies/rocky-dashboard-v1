/**
 * Super Admin Page
 */

"use client";

import { PageContainer, PageHeader } from "@/components/ui";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  Crown,
  Shield,
  Database,
  Lock,
  Zap,
  AlertTriangle,
} from "lucide-react";

export default function SuperAdminPage() {
  const { user, getUserFullName, getRoleDisplayName } = useAuth();

  const superAdminFeatures = [
    {
      icon: Crown,
      title: "Role Management",
      description: "Create, modify, and delete user roles and permissions",
      color: "text-yellow-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    },
    {
      icon: Database,
      title: "Database Administration",
      description: "Direct database access and maintenance tools",
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      icon: Lock,
      title: "System Configuration",
      description: "Configure core system settings and environment variables",
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-900/20",
    },
    {
      icon: Zap,
      title: "API Management",
      description: "Manage API keys, rate limits, and webhook configurations",
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      icon: Shield,
      title: "Security Audits",
      description: "View detailed security logs and audit trails",
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      icon: AlertTriangle,
      title: "Critical Operations",
      description: "Perform critical system operations and backups",
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Super Admin Dashboard"
        subtitle="Ultimate system control and configuration"
      />

      {/* Super Admin Badge */}
      <div className="mb-8 p-6 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-lg shadow-lg text-white">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-full">
            <Crown className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{getUserFullName()}</h2>
            <p className="text-yellow-100">
              {getRoleDisplayName()} • Full System Access • {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-800 dark:text-red-200">
              Super Administrator Access
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              You have unrestricted access to all system functions. Changes made
              here can affect the entire application. All actions are
              permanently logged and audited.
            </p>
          </div>
        </div>
      </div>

      {/* Super Admin Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {superAdminFeatures.map((feature, index) => (
          <div
            key={index}
            className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-transparent hover:border-yellow-500"
          >
            <div
              className={`inline-flex p-3 rounded-lg ${feature.bgColor} mb-4`}
            >
              <feature.icon className={`w-6 h-6 ${feature.color}`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="text-xs text-gray-600 dark:text-gray-400 uppercase">
            System Uptime
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            99.9%
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="text-xs text-gray-600 dark:text-gray-400 uppercase">
            Database Size
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            2.4 GB
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="text-xs text-gray-600 dark:text-gray-400 uppercase">
            API Calls Today
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            45.2K
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="text-xs text-gray-600 dark:text-gray-400 uppercase">
            Active Admins
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            12
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent System Activity
        </h3>
        <div className="space-y-3">
          {[
            {
              action: "Database backup completed",
              time: "5 minutes ago",
              type: "success",
            },
            {
              action: "New admin user created",
              time: "1 hour ago",
              type: "info",
            },
            {
              action: "System configuration updated",
              time: "2 hours ago",
              type: "warning",
            },
            {
              action: "Security audit passed",
              time: "6 hours ago",
              type: "success",
            },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded"
            >
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {activity.action}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
