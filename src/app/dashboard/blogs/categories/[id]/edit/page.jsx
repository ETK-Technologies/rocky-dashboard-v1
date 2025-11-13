"use client";

import { BlogCategoryForm } from "@/features/blog-categories";
import { useParams } from "next/navigation";

export default function EditBlogCategoryPage() {
    const params = useParams();
    const categoryId = params.id;

    return <BlogCategoryForm categoryId={categoryId} />;
}



