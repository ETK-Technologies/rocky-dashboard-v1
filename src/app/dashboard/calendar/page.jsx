"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
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

      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Your Calendar</CardTitle>
          <CardDescription>View and manage your events</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Calendar}
            title="No events scheduled"
            description="Your calendar events will appear here once you create them."
          />
        </CardContent>
      </Card>
    </div>
  );
}
