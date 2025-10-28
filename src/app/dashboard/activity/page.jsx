"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
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

      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <CardDescription>Track all changes and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Activity}
            title="No activity yet"
            description="Activity logs will appear here when you start using the dashboard."
          />
        </CardContent>
      </Card>
    </div>
  );
}
