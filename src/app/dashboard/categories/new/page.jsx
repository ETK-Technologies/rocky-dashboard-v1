import { CategoryForm } from "@/features/categories";

export const metadata = {
  title: "Add Category | Dashboard",
  description: "Create a new category",
};

export default function NewCategoryPage() {
  return <CategoryForm />;
}
