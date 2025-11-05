"use client";

import { ProductForm } from "@/features/products";
import { useParams } from "next/navigation";

export default function EditProductPage() {
  const params = useParams();
  const productId = params.id;

  return <ProductForm productId={productId} />;
}
