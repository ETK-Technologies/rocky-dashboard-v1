import { ProductForm } from "@/features/products";

export const metadata = {
  title: "New Product | Dashboard",
  description: "Create a new product",
};

export default function NewProductPage() {
  return <ProductForm />;
}
