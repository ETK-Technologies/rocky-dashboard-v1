"use client";

import {
  CustomCard,
  CustomCardContent,
  CustomCardDescription,
  CustomCardHeader,
  CustomCardTitle,
} from "@/components/ui/CustomCard";
import { CustomEmptyState } from "@/components/ui/CustomEmptyState";
import { CustomButton } from "@/components/ui/CustomButton";
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
        <CustomButton className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </CustomButton>
      </div>

      <CustomCard className="border-gray-200 shadow-sm">
        <CustomCardHeader>
          <CustomCardTitle className="text-lg">All Products</CustomCardTitle>
          <CustomCardDescription>View and manage all your products</CustomCardDescription>
        </CustomCardHeader>
        <CustomCardContent>
          <CustomEmptyState
            icon={Package}
            title="No products yet"
            description="Get started by creating your first product. Products will appear here once you add them."
            action={
              <CustomButton className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Product
              </CustomButton>
            }
          />
        </CustomCardContent>
      </CustomCard>
    </div>
  );
}
