import { redirect } from "next/navigation";

export const metadata = {
  title: "Carts | Dashboard",
  description: "Manage redundant and abandoned carts",
};

export default function CartsPage() {
  // Redirect to redundant carts by default
  redirect("/dashboard/carts/redundant");
}
