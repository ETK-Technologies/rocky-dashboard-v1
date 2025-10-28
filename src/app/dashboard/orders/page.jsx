"use client";

import {
  CustomCard,
  CustomCardContent,
  CustomCardDescription,
  CustomCardHeader,
  CustomCardTitle,
} from "@/components/ui/CustomCard";
import { CustomEmptyState } from "@/components/ui/CustomEmptyState";
import { ShoppingCart } from "lucide-react";

export default function OrdersPage() {
  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 mt-1 text-sm">
          Track and manage customer orders
        </p>
      </div>

      <CustomCard className="border-gray-200 shadow-sm">
        <CustomCardHeader>
          <CustomCardTitle className="text-lg">All Orders</CustomCardTitle>
          <CustomCardDescription>View and manage all customer orders</CustomCardDescription>
        </CustomCardHeader>
        <CustomCardContent>
          <CustomEmptyState
            icon={ShoppingCart}
            title="No orders yet"
            description="Orders from customers will appear here. Start by adding some products to your catalog."
          />
        </CustomCardContent>
      </CustomCard>
    </div>
  );
}
