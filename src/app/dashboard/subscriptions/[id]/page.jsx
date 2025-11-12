import { SubscriptionDetails } from "@/features/subscriptions";

export const metadata = {
  title: "Subscription Details | Dashboard",
  description: "Review and manage subscription details",
};

export default async function SubscriptionDetailsPage(props) {
  const params = await props.params;
  return <SubscriptionDetails subscriptionId={params?.id} />;
}

