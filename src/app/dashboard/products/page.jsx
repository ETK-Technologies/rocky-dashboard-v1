"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Package, Plus } from "lucide-react";

export default function ProductsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1 text-sm">
            Manage your product catalog
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">All Products</CardTitle>
          <CardDescription>View and manage all your products</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Package}
            title="No products yet"
            description="Get started by creating your first product. Products will appear here once you add them."
            action={
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Product
              </Button>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
