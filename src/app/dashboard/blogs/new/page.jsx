import { BlogForm } from "@/features/blogs";

export const metadata = {
    title: "New Blog | Dashboard",
    description: "Create a new blog post",
};

export default function NewBlogPage() {
    return <BlogForm />;
}
