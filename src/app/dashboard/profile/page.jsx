/**
 * User Profile Page
 * Accessible by all authenticated users
 */

"use client";

import { ProtectedRoute } from "@/components/common";
import { PageContainer, PageHeader } from "@/components/ui";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { User, Mail, Shield, Calendar, Key } from "lucide-react";

export default function ProfilePage() {
  const { user, getUserFullName, getRoleDisplayName, isAdmin, isSuperAdmin } = useAuth();

  const profileSections = [
    {
      icon: User,
      label: "Full Name",
      value: getUserFullName() || "Not set",
    },
    {
      icon: Mail,
      label: "Email",
      value: user?.email || "Not set",
    },
    {
      icon: Shield,
      label: "Role",
      value: getRoleDisplayName(),
      badge: true,
    },
    {
      icon: Key,
      label: "User ID",
      value: user?.id || "N/A",
    },
    {
      icon: Calendar,
      label: "Account Status",
      value: "Active",
      status: true,
    },
  ];

  const getRoleBadgeColor = () => {
    if (isSuperAdmin()) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    if (isAdmin()) return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
    return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
  };

  return (
    <ProtectedRoute>
      <PageContainer>
        <PageHeader
          title="My Profile"
          subtitle="View and manage your account information"
        />

        {/* Profile Header Card */}
        <div className="mb-8 p-8 bg-gradient-to-r from-[#af7f56] to-purple-600 rounded-lg shadow-lg text-white">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={getUserFullName()}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-12 h-12" />
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">{getUserFullName()}</h2>
              <p className="text-white/90 mb-3">{user?.email}</p>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor()}`}>
                  {getRoleDisplayName()}
                </span>
                {(isAdmin() || isSuperAdmin()) && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur">
                    Administrator
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {profileSections.map((section, index) => (
            <div
              key={index}
              className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <section.icon className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {section.label}
                  </div>
                  {section.badge ? (
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor()}`}>
                      {section.value}
                    </span>
                  ) : section.status ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {section.value}
                      </span>
                    </span>
                  ) : (
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {section.value}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Permissions Card */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            Your Permissions
          </h3>
          <div className="space-y-3">
            <PermissionItem
              allowed={true}
              text="View Dashboard"
            />
            <PermissionItem
              allowed={true}
              text="View Profile"
            />
            <PermissionItem
              allowed={isAdmin() || isSuperAdmin()}
              text="Manage Products"
            />
            <PermissionItem
              allowed={isAdmin() || isSuperAdmin()}
              text="Manage Categories"
            />
            <PermissionItem
              allowed={isAdmin() || isSuperAdmin()}
              text="Access Admin Panel"
            />
            <PermissionItem
              allowed={isSuperAdmin()}
              text="Access Super Admin Panel"
            />
            <PermissionItem
              allowed={isSuperAdmin()}
              text="Manage System Settings"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Edit Profile
          </button>
          <button className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium">
            Change Password
          </button>
        </div>
      </PageContainer>
    </ProtectedRoute>
  );
}

function PermissionItem({ allowed, text }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
        allowed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
      }`}>
        {allowed ? (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </div>
      <span className={`text-sm ${
        allowed
          ? 'text-gray-900 dark:text-white font-medium'
          : 'text-gray-500 dark:text-gray-500'
      }`}>
        {text}
      </span>
    </div>
  );
}

