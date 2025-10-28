"use client";

import { useEffect, useState } from "react";
import {
  Folder,
  FileText,
  Image as ImageIcon,
  Package,
  ShoppingCart,
  TrendingUp,
  MoreHorizontal,
  MoreVertical,
  Grid3x3,
  List,
} from "lucide-react";
import { authStorage } from "@/features/auth";
import { DashboardCard, QuickAccessCard } from "./DashboardCard";
import { CustomButton } from "@/components/ui/CustomButton";
import { useRouter } from "next/navigation";

export default function DashboardMain() {
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const router = useRouter();

  useEffect(() => {
    const userData = authStorage.getUser();
    setUser(userData);
  }, []);

  // Quick access folders
  const quickAccessItems = [
    {
      title: "Studio Work",
      size: "2.3 GB",
      itemCount: "23 items",
      icon: Folder,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Source",
      size: "1.2 MB",
      itemCount: "1 item",
      icon: Folder,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Brand Assets",
      size: "241 MB",
      itemCount: "8 items",
      icon: Folder,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Great Studios Pitch...",
      size: "12.3 MB",
      itemCount: "pptx",
      icon: FileText,
      iconColor: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  // Main folders
  const folders = [
    {
      title: "Products",
      size: "2.5 GB",
      itemCount: "45 items",
      icon: Package,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-50",
      onClick: () => router.push("/dashboard/products"),
    },
    {
      title: "Orders",
      size: "512 MB",
      itemCount: "128 items",
      icon: ShoppingCart,
      iconColor: "text-green-600",
      bgColor: "bg-green-50",
      onClick: () => router.push("/dashboard/orders"),
    },
    {
      title: "Analytics",
      size: "45 MB",
      itemCount: "12 items",
      icon: TrendingUp,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Documents",
      size: "1.8 GB",
      itemCount: "234 items",
      icon: FileText,
      iconColor: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Images",
      size: "3.2 GB",
      itemCount: "567 items",
      icon: ImageIcon,
      iconColor: "text-pink-600",
      bgColor: "bg-pink-50",
    },
    {
      title: "Designs",
      size: "892 MB",
      itemCount: "89 items",
      icon: Folder,
      iconColor: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header with breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium text-gray-900">Home</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "grid"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                }`}
            >
              <Grid3x3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "list"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                }`}
            >
              <List className="h-4 w-4" />
            </button>
            <CustomButton
              className="ml-2 bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              + Add New
            </CustomButton>
          </div>
        </div>
      </div>

      {/* Quick Access Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Quick Access</h2>
          <button className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickAccessItems.map((item, index) => (
            <QuickAccessCard key={index} {...item} />
          ))}
        </div>
      </div>

      {/* Main Folders Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">All Files</h2>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <button className="hover:text-gray-900 transition-colors">
              Name
            </button>
            <button className="hover:text-gray-900 transition-colors">
              Size
            </button>
            <button className="hover:text-gray-900 transition-colors">
              Modified
            </button>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {folders.map((folder, index) => (
              <DashboardCard key={index} {...folder} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Name
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Size
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Items
                  </th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {folders.map((folder, index) => {
                  const Icon = folder.icon;
                  return (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={folder.onClick}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${folder.bgColor}`}
                          >
                            <Icon className={`h-5 w-5 ${folder.iconColor}`} />
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {folder.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {folder.size}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {folder.itemCount}
                      </td>
                      <td className="px-6 py-4">
                        <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreVertical className="h-4 w-4 text-gray-400" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
