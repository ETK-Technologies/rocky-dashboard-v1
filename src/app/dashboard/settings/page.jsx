"use client";

import {
  CustomCard,
  CustomCardContent,
  CustomCardDescription,
  CustomCardHeader,
  CustomCardTitle,
  CustomButton,
  FormField,
  PageContainer,
  PageHeader,
} from "@/components/ui";

export default function SettingsPage() {
  return (
    <PageContainer maxWidth="md">
      <PageHeader
        title="Settings"
        description="Manage your account and application preferences"
      />

      <div className="space-y-6">
        <CustomCard className="border-gray-200 shadow-sm">
          <CustomCardHeader>
            <CustomCardTitle className="text-lg">
              General Settings
            </CustomCardTitle>
            <CustomCardDescription>
              Basic application settings and preferences
            </CustomCardDescription>
          </CustomCardHeader>
          <CustomCardContent>
            <div className="space-y-4">
              <FormField
                id="app-name"
                label="Application Name"
                defaultValue="Rocky Dashboard"
                className="max-w-md"
              />
              <FormField
                id="version"
                label="Version"
                defaultValue="1.0.0"
                disabled
                className="max-w-md"
              />
            </div>
          </CustomCardContent>
        </CustomCard>

        <CustomCard className="border-gray-200 shadow-sm">
          <CustomCardHeader>
            <CustomCardTitle className="text-lg">
              Account Settings
            </CustomCardTitle>
            <CustomCardDescription>
              Manage your account information
            </CustomCardDescription>
          </CustomCardHeader>
          <CustomCardContent>
            <div className="space-y-4">
              <FormField
                id="email"
                label="Email Address"
                type="email"
                placeholder="your.email@example.com"
                className="max-w-md"
              />
              <FormField
                id="name"
                label="Full Name"
                placeholder="John Doe"
                className="max-w-md"
              />
              <CustomButton className="bg-blue-600 hover:bg-blue-700 mt-4">
                Save Changes
              </CustomButton>
            </div>
          </CustomCardContent>
        </CustomCard>
      </div>
    </PageContainer>
  );
}
