"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
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

      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">All Orders</CardTitle>
          <CardDescription>View and manage all customer orders</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={ShoppingCart}
            title="No orders yet"
            description="Orders from customers will appear here. Start by adding some products to your catalog."
          />
        </CardContent>
      </Card>
    </div>
  );
}
