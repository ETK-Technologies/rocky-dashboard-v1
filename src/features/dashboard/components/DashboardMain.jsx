"use client";

import { useEffect, useState } from "react";
import {
  Folder,
  Package,
  MoreHorizontal,
  MoreVertical,
  Upload,
  Settings,
  GitBranch,
  Globe,
  DollarSign,
  ShoppingCart,
  Users,
  CreditCard,
  TrendingUp,
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
import { useOverviewAnalytics } from "@/features/analytics";

export default function DashboardMain() {
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [counts, setCounts] = useState({
    products: null,
    categories: null,
    media: null,
    globalAttributes: null,
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Get current date range for analytics (last 30 days)
  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  };

  // Fetch analytics overview
  const {
    data: analyticsData,
    loading: analyticsLoading,
    error: analyticsError,
  } = useOverviewAnalytics(
    {
      ...getDateRange(),
      groupBy: "day",
    },
    true
  );

  useEffect(() => {
    const userData = authStorage.getUser();
    setUser(userData);
  }, []);

  // Fetch counts for cards
  useEffect(() => {
    const fetchCounts = async () => {
      // Dynamic imports to avoid SSR issues
      const [
        { productService },
        { categoryService },
        { uploadService },
        { globalAttributeService },
      ] = await Promise.all([
        import("@/features/products/services/productService"),
        import("@/features/categories/services/categoryService"),
        import("@/features/uploads/services/uploadService"),
        import("@/features/attributes/services/globalAttributeService"),
      ]);

      try {
        setLoading(true);
        const [productsRes, categoriesRes, mediaRes, globalAttributesRes] =
          await Promise.allSettled([
            productService.getAll({ limit: 1 }),
            categoryService.getAll(),
            uploadService.getUploads({ limit: 1 }),
            globalAttributeService.getAll(),
          ]);

        const newCounts = {
          products:
            productsRes.status === "fulfilled"
              ? productsRes.value?.pagination?.total ||
                productsRes.value?.total ||
                null
              : null,
          categories:
            categoriesRes.status === "fulfilled"
              ? Array.isArray(categoriesRes.value)
                ? categoriesRes.value.length
                : categoriesRes.value?.length || null
              : null,
          media:
            mediaRes.status === "fulfilled"
              ? mediaRes.value?.pagination?.total ||
                mediaRes.value?.total ||
                null
              : null,
          globalAttributes:
            globalAttributesRes.status === "fulfilled"
              ? Array.isArray(globalAttributesRes.value)
                ? globalAttributesRes.value.length
                : globalAttributesRes.value?.length || null
              : null,
        };

        setCounts(newCounts);
      } catch (error) {
        console.error("Error fetching counts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  // Format count for display
  const formatCount = (count) => {
    if (count === null) return "Loading...";
    if (count === 0) return "0 items";
    return `${count} ${count === 1 ? "item" : "items"}`;
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format number
  const formatNumber = (num) => {
    if (num === null || num === undefined) return "—";
    return new Intl.NumberFormat("en-US").format(num);
  };

  // Quick access folders
  const quickAccessItems = [
    {
      title: "Products",
      itemCount: formatCount(counts.products),
      icon: Package,
      iconColor: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
      onClick: () => router.push("/dashboard/products"),
    },
    {
      title: "Categories",
      itemCount: formatCount(counts.categories),
      icon: Folder,
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      onClick: () => router.push("/dashboard/categories"),
    },
    {
      title: "Media",
      itemCount: formatCount(counts.media),
      icon: Upload,
      iconColor: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/30",
      onClick: () => router.push("/dashboard/super-admin/uploads"),
    },
    {
      title: "Global Attributes",
      itemCount: formatCount(counts.globalAttributes),
      icon: Globe,
      iconColor: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
      onClick: () => router.push("/dashboard/products/global-attributes"),
    },
  ];

  // Main folders
  const folders = [
    {
      title: "Products",
      itemCount: formatCount(counts.products),
      icon: Package,
      iconColor: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
      onClick: () => router.push("/dashboard/products"),
    },
    {
      title: "Categories",
      itemCount: formatCount(counts.categories),
      icon: Folder,
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      onClick: () => router.push("/dashboard/categories"),
    },
    {
      title: "Media",
      itemCount: formatCount(counts.media),
      icon: Upload,
      iconColor: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/30",
      onClick: () => router.push("/dashboard/super-admin/uploads"),
    },
    {
      title: "Global Attributes",
      itemCount: formatCount(counts.globalAttributes),
      icon: Globe,
      iconColor: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
      onClick: () => router.push("/dashboard/products/global-attributes"),
    },
    {
      title: "Builder",
      icon: GitBranch,
      iconColor: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
      onClick: () => router.push("/dashboard/builder"),
    },
    {
      title: "Flow",
      icon: GitBranch,
      iconColor: "text-cyan-600 dark:text-cyan-400",
      bgColor: "bg-cyan-50 dark:bg-cyan-950/30",
      onClick: () => router.push("/dashboard/flow"),
    },
    {
      title: "Settings",
      icon: Settings,
      iconColor: "text-gray-600 dark:text-gray-400",
      bgColor: "bg-gray-50 dark:bg-gray-950/30",
      onClick: () => router.push("/dashboard/settings"),
    },
  ];

  // Analytics stats cards
  const analyticsStats = [
    {
      title: "Total Revenue",
      value: formatCurrency(analyticsData?.sales?.totalRevenue),
      icon: DollarSign,
      iconColor: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/30",
      trend: analyticsData?.sales?.growth,
    },
    {
      title: "Total Orders",
      value: formatNumber(analyticsData?.sales?.orderCount),
      icon: ShoppingCart,
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      title: "Total Customers",
      value: formatNumber(analyticsData?.customers?.totalCustomers),
      icon: Users,
      iconColor: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      title: "Active Subscriptions",
      value: formatNumber(analyticsData?.subscriptions?.activeCount),
      icon: CreditCard,
      iconColor: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
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

      {/* Analytics Overview Section */}
      <div className="mb-8">
        <SectionHeader
          title="Analytics Overview"
          action={
            <IconButton
              icon={TrendingUp}
              label="View full analytics"
              variant="ghost"
              onClick={() => router.push("/dashboard/analytics")}
            />
          }
        />

        {analyticsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-card rounded-xl border border-border p-5 animate-pulse"
              >
                <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : analyticsError ? (
          <div className="bg-card rounded-xl border border-border p-5 text-center text-sm text-muted-foreground">
            {analyticsError.statusCode === 403
              ? "Analytics require admin access"
              : `Failed to load analytics: ${analyticsError.message}`}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {analyticsStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bgColor}`}
                    >
                      <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                    </div>
                    {stat.trend !== undefined && stat.trend !== null && (
                      <div
                        className={`text-xs font-medium ${
                          stat.trend >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {stat.trend >= 0 ? "+" : ""}
                        {stat.trend.toFixed(1)}%
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">
                    {stat.title}
                  </div>
                  <div className="text-2xl font-semibold text-foreground">
                    {stat.value}
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
                Items
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
                        {folder.itemCount || "-"}
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
