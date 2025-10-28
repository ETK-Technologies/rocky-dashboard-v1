"use client";

import {
  CustomCard,
  CustomCardContent,
  CustomCardDescription,
  CustomCardHeader,
  CustomCardTitle,
} from "@/components/ui/CustomCard";
import { CustomEmptyState } from "@/components/ui/CustomEmptyState";
import { Activity } from "lucide-react";

export default function ActivityPage() {
  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Activity</h1>
        <p className="text-gray-600 mt-1 text-sm">
          View recent activity and changes
        </p>
      </div>

      <CustomCard className="border-gray-200 shadow-sm">
        <CustomCardHeader>
          <CustomCardTitle className="text-lg">Recent Activity</CustomCardTitle>
          <CustomCardDescription>Track all changes and updates</CustomCardDescription>
        </CustomCardHeader>
        <CustomCardContent>
          <CustomEmptyState
            icon={Activity}
            title="No activity yet"
            description="Activity logs will appear here when you start using the dashboard."
          />
        </CustomCardContent>
      </CustomCard>
    </div>
  );
}
