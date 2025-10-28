"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Users } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
        <p className="text-gray-600 mt-1 text-sm">
          Manage your contacts and connections
        </p>
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">All Contacts</CardTitle>
          <CardDescription>View and manage your contacts</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Users}
            title="No contacts yet"
            description="Your contacts will appear here once you add them."
          />
        </CardContent>
      </Card>
    </div>
  );
}
