"use client";

import { useParams } from "next/navigation";
import { CouponForm } from "@/features/coupons";

export default function EditCouponPage() {
  const params = useParams();
  return <CouponForm couponId={params?.id} />;
}

