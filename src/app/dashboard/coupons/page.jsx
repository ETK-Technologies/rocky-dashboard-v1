import { CouponsList } from "@/features/coupons";

export const metadata = {
  title: "Coupons | Dashboard",
  description: "Manage discount coupons",
};

export default function CouponsPage() {
  return <CouponsList />;
}

