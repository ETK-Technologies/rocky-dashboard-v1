"use client";

import {
  CustomCard,
  CustomCardContent,
  CustomCardDescription,
  CustomCardHeader,
  CustomCardTitle,
} from "@/components/ui/CustomCustomCard";
import { CustomCustomEmptyState } from "@/components/ui/CustomCustomEmptyState";
import { Calendar } from "lucide-react";

export default function CalendarPage() {
  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <p className="text-gray-600 mt-1 text-sm">
          Manage your schedule and events
        </p>
      </div>

      <CustomCard className="border-gray-200 shadow-sm">
        <CustomCardHeader>
          <CustomCardTitle className="text-lg">Your Calendar</CustomCardTitle>
          <CustomCardDescription>View and manage your events</CustomCardDescription>
        </CustomCardHeader>
        <CustomCardContent>
          <CustomEmptyState
            icon={Calendar}
            title="No events scheduled"
            description="Your calendar events will appear here once you create them."
          />
        </CustomCardContent>
      </CustomCard>
    </div>
  );
}
