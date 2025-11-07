import { OrderDetails } from "@/features/orders";

export const metadata = {
  title: "Order Details | Dashboard",
  description: "Review and manage order details",
};

export default function OrderDetailsPage({ params }) {
  return <OrderDetails orderId={params?.id} />;
}

