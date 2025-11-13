"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import {
    CustomButton,
    PageContainer,
    PageHeader,
    CustomCard,
    CustomCardContent,
    CustomLabel,
    CustomInput,
    LoadingState,
} from "@/components/ui";
import { SingleImageUploadWithId } from "@/components/ui/SingleImageUploadWithId";
import { useBlogForm } from "../hooks/useBlogForm";
import { cn } from "@/utils/cn";
import { generateSlug } from "@/utils/generateSlug";
import { toast } from "react-toastify";
import { useAuthStore } from "@/lib/store/authStore";

// Dynamic import for ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

// Quill editor modules configuration
const quillModules = {
    toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ font: [] }],
        [{ size: [] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [
            { list: "ordered" },
            { list: "bullet" },
            { indent: "-1" },
            { indent: "+1" },
        ],
        ["link", "image", "video"],
        [{ align: [] }],
        [{ color: [] }, { background: [] }],
        ["clean"],
    ],
    clipboard: {
        matchVisual: false,
    },
};

const quillFormats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "indent",
    "link",
    "image",
    "video",
    "align",
    "color",
    "background",
];

/**
 * PostForm component for creating and editing posts
 * @param {Object} props - Component props
 * @param {string|null} props.postId - Post ID for edit mode
 */
export default function BlogForm({ blogId = null }) {
    const router = useRouter();
    const { blogData, isEditMode, submitForm, loading, fetchLoading } =
        useBlogForm(blogId);

    // Get authenticated user for authorId
    const { user } = useAuthStore();

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        content: "",
        featuredImageId: null, // Store the upload ID
        status: "DRAFT", // Default status
        publishedAt: "", // For scheduled posts
    });

    const [autoSlug, setAutoSlug] = useState(true);
    const [errors, setErrors] = useState({});
    const [isDirty, setIsDirty] = useState(false);
    const [imageInputType, setImageInputType] = useState("upload"); // "upload" or "url"
    const [imageUrl, setImageUrl] = useState("");
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null); // For preview display

    // Initialize form data when blogData is loaded (edit mode)
    useEffect(() => {
        if (blogData) {
            // Extract content - handle both plain text and JSON formats
            let content = "";
            if (blogData.content) {
                try {
                    // Try to parse as JSON (might be Editor.js format)
                    const parsed = JSON.parse(blogData.content);
                    if (parsed && typeof parsed === "object") {
                        // If it's Editor.js format, try to extract text from blocks
                        if (parsed.blocks && Array.isArray(parsed.blocks)) {
                            content = parsed.blocks
                                .map((block) => {
                                    if (
                                        block.type === "paragraph" &&
                                        block.data?.text
                                    ) {
                                        return block.data.text;
                                    }
                                    if (
                                        block.type === "header" &&
                                        block.data?.text
                                    ) {
                                        return `# ${block.data.text}`;
                                    }
                                    return "";
                                })
                                .filter(Boolean)
                                .join("\n\n");
                        } else {
                            // Not Editor.js format, use as-is or stringify
                            content =
                                typeof parsed === "string"
                                    ? parsed
                                    : blogData.content;
                        }
                    } else {
                        content = blogData.content;
                    }
                } catch (e) {
                    // Not JSON, use as plain text
                    content = blogData.content;
                }
            } else if (blogData.contentBlocks) {
                // Handle contentBlocks if it exists
                try {
                    const parsed =
                        typeof blogData.contentBlocks === "string"
                            ? JSON.parse(blogData.contentBlocks)
                            : blogData.contentBlocks;
                    if (parsed?.blocks && Array.isArray(parsed.blocks)) {
                        content = parsed.blocks
                            .map((block) => {
                                if (
                                    block.type === "paragraph" &&
                                    block.data?.text
                                ) {
                                    return block.data.text;
                                }
                                if (
                                    block.type === "header" &&
                                    block.data?.text
                                ) {
                                    return `# ${block.data.text}`;
                                }
                                return "";
                            })
                            .filter(Boolean)
                            .join("\n\n");
                    }
                } catch (e) {
                    content = "";
                }
            }

            setFormData({
                title: blogData.title || "",
                slug: blogData.slug || "",
                content: content,
                featuredImageId:
                    blogData.featuredImageId ||
                    blogData.featuredImage?.id ||
                    null,
                status: blogData.status || "DRAFT",
                publishedAt: blogData.publishedAt
                    ? blogData.publishedAt.slice(0, 16)
                    : "",
            });

            // Set preview URL if available
            if (blogData.featuredImage) {
                const previewUrl =
                    blogData.featuredImage.cdnUrl ||
                    blogData.featuredImage.url ||
                    blogData.featuredImage;
                setImagePreviewUrl(previewUrl);
                setImageInputType("upload");
            }

            setAutoSlug(false);
        }
    }, [blogData]);

    // Handle form field changes
    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setIsDirty(true);

        // Auto-generate slug from title
        if (field === "title" && autoSlug) {
            setFormData((prev) => ({
                ...prev,
                slug: generateSlug(value),
            }));
        }

        // Clear error for this field
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    // Handle slug manual edit
    const handleSlugChange = (value) => {
        setAutoSlug(false);
        handleChange("slug", value);
    };

    // Handle image URL input
    const handleImageUrlChange = (value) => {
        setImageUrl(value);
        // Note: URL mode is not currently integrated with backend
        // Backend expects featuredImageId (upload ID), not URL
        // TODO: Either upload URL to get an ID, or add backend support for URLs
        setIsDirty(true);
    };

    // Handle image input type change
    const handleImageInputTypeChange = (type) => {
        setImageInputType(type);
        if (type === "url") {
            // Clear the upload ID when switching to URL mode
            setFormData((prev) => ({
                ...prev,
                featuredImageId: null,
            }));
        } else {
            setFormData((prev) => ({ ...prev, featuredImageId: null }));
            setImageUrl("");
            setImagePreviewUrl(null);
        }
        setIsDirty(true);
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.title?.trim()) {
            newErrors.title = "Title is required";
        }

        if (!formData.slug?.trim()) {
            newErrors.slug = "Slug is required";
        }

        // Validate rich text content (check if it has actual text, not just HTML tags)
        const contentText = formData.content?.replace(/<[^>]*>/g, "").trim();
        if (!contentText) {
            newErrors.content = "Content is required";
        }

        // Validate publishedAt when status is SCHEDULED
        if (formData.status === "SCHEDULED" && !formData.publishedAt) {
            newErrors.publishedAt =
                "Published date is required for scheduled posts";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please fix the errors before submitting");
            return;
        }

        try {
            // Check if user is authenticated
            if (!user || !user.id) {
                toast.error("You must be logged in to create a post");
                return;
            }

            // Prepare submission data
            // Generate excerpt from content (first 160 characters)
            const contentText = formData.content?.trim() || "";
            const excerpt =
                contentText.length > 160
                    ? contentText.substring(0, 160) + "..."
                    : contentText;

            const submitData = {
                title: formData.title.trim(),
                slug: formData.slug.trim(),
                excerpt: excerpt,
                content: contentText,
                status: formData.status, // Use status from form data
                // Extract category IDs from nested structure
                categoryIds:
                    blogData?.categories?.map(
                        (c) => c.categoryId || c.category?.id
                    ) || [],
                // Extract tag IDs from nested structure
                tagIds: blogData?.tags?.map((t) => t.tagId || t.tag?.id) || [],
            };

            // Only add authorId when creating (not editing)
            if (!isEditMode) {
                submitData.authorId = user.id;
            }

            // Add featuredImageId if provided
            if (formData.featuredImageId) {
                submitData.featuredImageId = formData.featuredImageId;
            }

            // Add publishedAt if status is SCHEDULED
            if (formData.status === "SCHEDULED") {
                if (formData.publishedAt) {
                    submitData.publishedAt = new Date(
                        formData.publishedAt
                    ).toISOString();
                }
            }

            await submitForm(submitData);
            setIsDirty(false);

            // Redirect to blogs list
            router.push("/dashboard/blogs");
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        if (isDirty) {
            if (
                confirm(
                    "You have unsaved changes. Are you sure you want to leave this page?"
                )
            ) {
                router.push("/dashboard/blogs");
            }
        } else {
            router.push("/dashboard/blogs");
        }
    };

    // Show loading state while fetching post data
    if (fetchLoading) {
        return (
            <PageContainer>
                <LoadingState message="Loading post..." />
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader
                title={isEditMode ? "Edit Blog" : "Add Blog"}
                description={
                    isEditMode
                        ? "Update blog post information"
                        : "Create a new blog post"
                }
                action={
                    <CustomButton
                        variant="outline"
                        onClick={() => router.push("/dashboard/blogs")}
                    >
                        Back to Blogs
                    </CustomButton>
                }
            />

            <div className="max-w-full mx-auto">
                <CustomCard>
                    <CustomCardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                                <div className="md:col-span-1">
                                    <CustomLabel
                                        htmlFor="title"
                                        className="text-sm font-medium"
                                    >
                                        Title
                                    </CustomLabel>
                                </div>
                                <div className="md:col-span-3">
                                    <CustomInput
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) =>
                                            handleChange(
                                                "title",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter blog title"
                                        className={
                                            errors.title ? "border-red-500" : ""
                                        }
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        The title is how it appears on your
                                        site.
                                    </p>
                                    {errors.title && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {errors.title}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Slug */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                                <div className="md:col-span-1">
                                    <CustomLabel
                                        htmlFor="slug"
                                        className="text-sm font-medium"
                                    >
                                        Slug
                                    </CustomLabel>
                                </div>
                                <div className="md:col-span-3">
                                    <CustomInput
                                        id="slug"
                                        value={formData.slug}
                                        onChange={(e) =>
                                            handleSlugChange(e.target.value)
                                        }
                                        placeholder="blog-slug"
                                        className={
                                            errors.slug ? "border-red-500" : ""
                                        }
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        The &quot;slug&quot; is the URL-friendly
                                        version of the title. It is usually all
                                        lowercase and contains only letters,
                                        numbers, and hyphens.
                                    </p>
                                    {errors.slug && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {errors.slug}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Status */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                                <div className="md:col-span-1">
                                    <CustomLabel
                                        htmlFor="status"
                                        className="text-sm font-medium"
                                    >
                                        Status
                                    </CustomLabel>
                                </div>
                                <div className="md:col-span-3">
                                    <select
                                        id="status"
                                        value={formData.status}
                                        onChange={(e) =>
                                            handleChange(
                                                "status",
                                                e.target.value
                                            )
                                        }
                                        className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:border-gray-700"
                                    >
                                        <option value="DRAFT">Draft</option>
                                        <option value="PUBLISHED">
                                            Published
                                        </option>
                                        <option value="SCHEDULED">
                                            Scheduled
                                        </option>
                                    </select>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Set the publication status of your blog
                                        post.
                                    </p>
                                </div>
                            </div>

                            {/* Published Date (only for SCHEDULED status) */}
                            {formData.status === "SCHEDULED" && (
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                                    <div className="md:col-span-1">
                                        <CustomLabel
                                            htmlFor="publishedAt"
                                            className="text-sm font-medium"
                                        >
                                            Publish Date & Time
                                            <span className="text-red-500 ml-1">
                                                *
                                            </span>
                                        </CustomLabel>
                                    </div>
                                    <div className="md:col-span-3">
                                        <CustomInput
                                            id="publishedAt"
                                            type="datetime-local"
                                            value={formData.publishedAt}
                                            onChange={(e) =>
                                                handleChange(
                                                    "publishedAt",
                                                    e.target.value
                                                )
                                            }
                                            className={
                                                errors.publishedAt
                                                    ? "border-red-500 w-full block"
                                                    : " w-full block"
                                            }
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Set when this post should be
                                            automatically published.
                                        </p>
                                        {errors.publishedAt && (
                                            <p className="text-xs text-red-500 mt-1">
                                                {errors.publishedAt}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Featured Image */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                                <div className="md:col-span-1">
                                    <CustomLabel
                                        htmlFor="image"
                                        className="text-sm font-medium"
                                    >
                                        Featured Image
                                    </CustomLabel>
                                </div>
                                <div className="md:col-span-3">
                                    {/* Image Input Type Selector */}
                                    <div className="flex gap-4 mb-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="imageInputType"
                                                value="upload"
                                                checked={
                                                    imageInputType === "upload"
                                                }
                                                onChange={() =>
                                                    handleImageInputTypeChange(
                                                        "upload"
                                                    )
                                                }
                                                className="rounded-full border-gray-300 text-primary focus:ring-primary"
                                            />
                                            <span className="text-sm text-foreground">
                                                Upload Image
                                            </span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="imageInputType"
                                                value="url"
                                                checked={
                                                    imageInputType === "url"
                                                }
                                                onChange={() =>
                                                    handleImageInputTypeChange(
                                                        "url"
                                                    )
                                                }
                                                className="rounded-full border-gray-300 text-primary focus:ring-primary"
                                            />
                                            <span className="text-sm text-foreground">
                                                Image URL
                                            </span>
                                        </label>
                                    </div>

                                    {/* Conditional Input Based on Type */}
                                    {imageInputType === "upload" ? (
                                        <SingleImageUploadWithId
                                            value={imagePreviewUrl}
                                            onChange={(imageData) => {
                                                // Handle removal (null)
                                                if (imageData === null) {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        featuredImageId: null,
                                                    }));
                                                    setImagePreviewUrl("");
                                                }
                                                // Handle object with id and url
                                                else if (
                                                    typeof imageData ===
                                                        "object" &&
                                                    imageData.id
                                                ) {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        featuredImageId:
                                                            imageData.id,
                                                    }));
                                                    setImagePreviewUrl(
                                                        imageData.url
                                                    );
                                                }
                                                // Fallback for backward compatibility (string)
                                                else if (
                                                    typeof imageData ===
                                                    "string"
                                                ) {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        featuredImageId:
                                                            imageData,
                                                    }));
                                                }
                                                setIsDirty(true);
                                            }}
                                            helperText="Upload a featured image for your blog post"
                                        />
                                    ) : (
                                        <div>
                                            <CustomInput
                                                id="imageUrl"
                                                value={imageUrl}
                                                onChange={(e) =>
                                                    handleImageUrlChange(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="https://example.com/image.jpg"
                                                type="url"
                                            />
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Enter the URL of the image you
                                                want to use
                                            </p>
                                            {imageUrl && (
                                                <div className="mt-3">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={imageUrl}
                                                        alt="Preview"
                                                        className="max-w-xs rounded-md border border-input"
                                                        onError={(e) => {
                                                            e.target.style.display =
                                                                "none";
                                                        }}
                                                        onLoad={(e) => {
                                                            e.target.style.display =
                                                                "block";
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Content - Rich Text Editor */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                                <div className="md:col-span-1">
                                    <CustomLabel
                                        htmlFor="content"
                                        className="text-sm font-medium"
                                    >
                                        Content
                                    </CustomLabel>
                                </div>
                                <div className="md:col-span-3">
                                    <div
                                        className={cn(
                                            "bg-background border rounded-md overflow-hidden",
                                            errors.content
                                                ? "border-red-500"
                                                : "border-input"
                                        )}
                                    >
                                        <ReactQuill
                                            theme="snow"
                                            value={formData.content}
                                            onChange={(value) =>
                                                handleChange("content", value)
                                            }
                                            modules={quillModules}
                                            formats={quillFormats}
                                            placeholder="Start writing your blog post..."
                                            className="bg-background text-foreground"
                                            style={{ minHeight: "400px" }}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Write your blog content using the rich
                                        text editor.
                                    </p>
                                    {errors.content && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {errors.content}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="pt-4 flex justify-end">
                                <CustomButton
                                    type="submit"
                                    disabled={loading}
                                    className="bg-[#af7f56] hover:bg-[#9d6f46] text-white"
                                >
                                    {loading
                                        ? isEditMode
                                            ? "Updating..."
                                            : "Creating..."
                                        : isEditMode
                                        ? "Update Blog"
                                        : "Add Blog"}
                                </CustomButton>
                            </div>
                        </form>
                    </CustomCardContent>
                </CustomCard>
            </div>
        </PageContainer>
    );
}
