import { OrderDetails } from "@/features/orders";

export const metadata = {
  title: "Order Details | Dashboard",
  description: "Review and manage order details",
};

export default async function OrderDetailsPage(props) {
  const params = await props.params;
  return <OrderDetails orderId={params?.id} />;
}
