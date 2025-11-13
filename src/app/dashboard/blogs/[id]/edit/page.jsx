"use client";

import { BlogForm } from "@/features/blogs";
import { useParams } from "next/navigation";

export default function EditBlogPage() {
    const params = useParams();
    const blogId = params.id;

    return <BlogForm blogId={blogId} />;
}
