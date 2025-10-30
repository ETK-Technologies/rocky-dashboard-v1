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
} from "lucide-react";
import { authStorage } from "@/features/auth";
import { DashboardCard, QuickAccessCard } from "./DashboardCard";
import {
  CustomButton,
  PageContainer,
  SectionHeader,
  ViewToggle,
  IconButton,
} from "@/components/ui";
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
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      title: "Source",
      size: "1.2 MB",
      itemCount: "1 item",
      icon: Folder,
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      title: "Brand Assets",
      size: "241 MB",
      itemCount: "8 items",
      icon: Folder,
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      title: "Great Studios Pitch...",
      size: "12.3 MB",
      itemCount: "pptx",
      icon: FileText,
      iconColor: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
    },
  ];

  // Main folders
  const folders = [
    {
      title: "Products",
      size: "2.5 GB",
      itemCount: "45 items",
      icon: Package,
      iconColor: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
      onClick: () => router.push("/dashboard/products"),
    },
    {
      title: "Orders",
      size: "512 MB",
      itemCount: "128 items",
      icon: ShoppingCart,
      iconColor: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/30",
      onClick: () => router.push("/dashboard/orders"),
    },
    {
      title: "Analytics",
      size: "45 MB",
      itemCount: "12 items",
      icon: TrendingUp,
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      title: "Documents",
      size: "1.8 GB",
      itemCount: "234 items",
      icon: FileText,
      iconColor: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
    },
    {
      title: "Images",
      size: "3.2 GB",
      itemCount: "567 items",
      icon: ImageIcon,
      iconColor: "text-pink-600 dark:text-pink-400",
      bgColor: "bg-pink-50 dark:bg-pink-950/30",
    },
    {
      title: "Designs",
      size: "892 MB",
      itemCount: "89 items",
      icon: Folder,
      iconColor: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
    },
  ];

  return (
    <PageContainer>
      {/* Header with breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Home</span>
          </div>
          <div className="flex items-center gap-2">
            <ViewToggle view={viewMode} onViewChange={setViewMode} />
            <CustomButton className="ml-2" size="sm">
              + Add New
            </CustomButton>
          </div>
        </div>
      </div>

      {/* Quick Access Section */}
      <div className="mb-8">
        <SectionHeader
          title="Quick Access"
          action={
            <IconButton
              icon={MoreHorizontal}
              label="More options"
              variant="ghost"
            />
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickAccessItems.map((item, index) => (
            <QuickAccessCard key={index} {...item} />
          ))}
        </div>
      </div>

      {/* Main Folders Section */}
      <div>
        <SectionHeader
          title="All Files"
          action={
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <button className="hover:text-foreground transition-colors">
                Name
              </button>
              <button className="hover:text-foreground transition-colors">
                Size
              </button>
              <button className="hover:text-foreground transition-colors">
                Modified
              </button>
            </div>
          }
        />

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {folders.map((folder, index) => (
              <DashboardCard key={index} {...folder} />
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-secondary border-b border-border">
                <tr>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                    Name
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                    Size
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                    Items
                  </th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {folders.map((folder, index) => {
                  const Icon = folder.icon;
                  return (
                    <tr
                      key={index}
                      className="hover:bg-accent cursor-pointer transition-colors"
                      onClick={folder.onClick}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${folder.bgColor}`}
                          >
                            <Icon className={`h-5 w-5 ${folder.iconColor}`} />
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {folder.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {folder.size}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {folder.itemCount}
                      </td>
                      <td className="px-6 py-4">
                        <button className="p-1 hover:bg-accent rounded-lg transition-colors">
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
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
    </PageContainer>
  );
}
