"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
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
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">General Settings</CardTitle>
            <CardDescription>
              Basic application settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="app-name">Application Name</Label>
                <Input
                  id="app-name"
                  defaultValue="Rocky Dashboard"
                  className="max-w-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  defaultValue="1.0.0"
                  disabled
                  className="max-w-md"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Account Settings</CardTitle>
            <CardDescription>Manage your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  className="max-w-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" className="max-w-md" />
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 mt-4">
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
