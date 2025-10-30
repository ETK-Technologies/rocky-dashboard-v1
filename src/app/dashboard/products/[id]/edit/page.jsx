"use client";

import { ProductForm } from "@/features/products";
import { use } from "react";

export default function EditProductPage({ params }) {
  const resolvedParams = use(Promise.resolve(params));
  return <ProductForm productId={resolvedParams.id} />;
}
