"use client";

import {
  CustomCard,
  CustomCardContent,
  CustomCardDescription,
  CustomCardHeader,
  CustomCardTitle,
} from "@/components/ui/CustomCard";
import { CustomEmptyState } from "@/components/ui/CustomEmptyState";
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

      <CustomCard className="border-gray-200 shadow-sm">
        <CustomCardHeader>
          <CustomCardTitle className="text-lg">All Contacts</CustomCardTitle>
          <CustomCardDescription>View and manage your contacts</CustomCardDescription>
        </CustomCardHeader>
        <CustomCardContent>
          <CustomEmptyState
            icon={Users}
            title="No contacts yet"
            description="Your contacts will appear here once you add them."
          />
        </CustomCardContent>
      </CustomCard>
    </div>
  );
}
