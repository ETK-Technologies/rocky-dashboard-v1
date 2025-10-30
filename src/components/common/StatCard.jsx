"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { CustomCard } from "@/components/ui";
import { cn } from "@/utils/cn";

/**
 * StatCard component for displaying statistics
 * @param {Object} props - Component props
 * @param {string} props.title - Stat title
 * @param {string|number} props.value - Stat value
 * @param {string} props.change - Change percentage
 * @param {string} props.trend - Trend direction (up or down)
 * @param {Component} props.icon - Icon component
 * @param {string} props.iconColor - Icon color class
 * @param {string} props.iconBg - Icon background class
 * @param {string} props.className - Additional CSS classes
 */
export function StatCard({
  title,
  value,
  change,
  trend = "up",
  icon: Icon,
  iconColor = "text-primary",
  iconBg = "bg-primary/10",
  className,
}) {
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;
  const trendColor = trend === "up" ? "text-green-600" : "text-red-600";

  return (
    <CustomCard className={cn("p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            iconBg
          )}
        >
          <Icon className={cn("h-6 w-6", iconColor)} />
        </div>
        {change && (
          <div
            className={cn(
              "flex items-center gap-1 text-sm font-medium",
              trendColor
            )}
          >
            <TrendIcon className="h-4 w-4" />
            <span>{change}</span>
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-foreground mb-1">{value}</h3>
      <p className="text-sm text-muted-foreground">{title}</p>
    </CustomCard>
  );
}
