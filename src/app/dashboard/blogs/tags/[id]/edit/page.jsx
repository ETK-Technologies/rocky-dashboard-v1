"use client";

import { BlogTagForm } from "@/features/blog-tags";
import { useParams } from "next/navigation";

export default function EditBlogTagPage() {
    const params = useParams();
    const tagId = params.id;

    return <BlogTagForm tagId={tagId} />;
}



