"use client";

import { useSearchParams, useParams } from "next/navigation";
import { CouponDetails } from "@/features/coupons";

export default function CouponDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "details";

  return <CouponDetails couponId={params?.id} initialTab={tab} />;
}

