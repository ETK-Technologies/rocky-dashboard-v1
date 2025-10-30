"use client";

import { CategoryForm } from "@/features/categories";
import { useParams } from "next/navigation";

export default function EditCategoryPage() {
  const params = useParams();
  const categoryId = params.id;

  return <CategoryForm categoryId={categoryId} />;
}
