"use client";

import {
  CustomCard,
  CustomCardContent,
  CustomCardDescription,
  CustomCardHeader,
  CustomCardTitle,
} from "@/components/ui/CustomCard";
import { CustomInput } from "@/components/ui/CustomInput";
import { CustomLabel } from "@/components/ui/CustomLabel";
import { CustomButton } from "@/components/ui/CustomButton";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-[1000px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1 text-sm">
          Manage your account and application preferences
        </p>
      </div>

      <div className="space-y-6">
        <CustomCard className="border-gray-200 shadow-sm">
          <CustomCardHeader>
            <CustomCardTitle className="text-lg">General Settings</CustomCardTitle>
            <CustomCardDescription>
              Basic application settings and preferences
            </CustomCardDescription>
          </CustomCardHeader>
          <CustomCardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <CustomLabel htmlFor="app-name">Application Name</CustomLabel>
                <CustomInput
                  id="app-name"
                  defaultValue="Rocky Dashboard"
                  className="max-w-md"
                />
              </div>
              <div className="space-y-2">
                <CustomLabel htmlFor="version">Version</CustomLabel>
                <CustomInput
                  id="version"
                  defaultValue="1.0.0"
                  disabled
                  className="max-w-md"
                />
              </div>
            </div>
          </CustomCardContent>
        </CustomCard>

        <CustomCard className="border-gray-200 shadow-sm">
          <CustomCardHeader>
            <CustomCardTitle className="text-lg">Account Settings</CustomCardTitle>
            <CustomCardDescription>Manage your account information</CustomCardDescription>
          </CustomCardHeader>
          <CustomCardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <CustomLabel htmlFor="email">Email Address</CustomLabel>
                <CustomInput
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  className="max-w-md"
                />
              </div>
              <div className="space-y-2">
                <CustomLabel htmlFor="name">Full Name</CustomLabel>
                <CustomInput id="name" placeholder="John Doe" className="max-w-md" />
              </div>
              <CustomButton className="bg-blue-600 hover:bg-blue-700 mt-4">
                Save Changes
              </CustomButton>
            </div>
          </CustomCardContent>
        </CustomCard>
      </div>
    </div>
  );
}
