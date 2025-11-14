"use client";

import { useState, useEffect, useRef } from "react";
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
import { usePageForm } from "../hooks/usePageForm";
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
 * PageForm component for creating and editing pages
 * @param {Object} props - Component props
 * @param {string|null} props.pageId - Page ID for edit mode
 */
export default function PageForm({ pageId = null }) {
    const router = useRouter();
    const { pageData, isEditMode, submitForm, loading, fetchLoading } =
        usePageForm(pageId);

    // Get authenticated user for authorId
    const { user } = useAuthStore();

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        featuredImageId: null,
        status: "DRAFT",
        publishedAt: "",
        template: "",
        metaTitle: "",
        metaDescription: "",
        metaKeywords: "",
    });

    const [autoSlug, setAutoSlug] = useState(true);
    const [errors, setErrors] = useState({});
    const [isDirty, setIsDirty] = useState(false);
    const [imageInputType, setImageInputType] = useState("upload");
    const [imageUrl, setImageUrl] = useState("");
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const formRef = useRef(null);

    // Initialize form data when pageData is loaded (edit mode)
    useEffect(() => {
        if (pageData) {
            // Extract content - handle both plain text and JSON formats
            let content = "";
            if (pageData.content) {
                try {
                    const parsed = JSON.parse(pageData.content);
                    if (parsed && typeof parsed === "object") {
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
                            content =
                                typeof parsed === "string"
                                    ? parsed
                                    : pageData.content;
                        }
                    } else {
                        content = pageData.content;
                    }
                } catch (e) {
                    content = pageData.content;
                }
            }

            setFormData({
                title: pageData.title || "",
                slug: pageData.slug || "",
                excerpt: pageData.excerpt || "",
                content: content,
                featuredImageId:
                    pageData.featuredImageId ||
                    pageData.featuredImage?.id ||
                    null,
                status: pageData.status || "DRAFT",
                publishedAt: pageData.publishedAt
                    ? pageData.publishedAt.slice(0, 16)
                    : "",
                template: pageData.template || "",
                metaTitle: pageData.metaTitle || "",
                metaDescription: pageData.metaDescription || "",
                metaKeywords: pageData.metaKeywords || "",
            });

            // Set preview URL if available
            if (pageData.featuredImage) {
                const previewUrl =
                    pageData.featuredImage.cdnUrl ||
                    pageData.featuredImage.url ||
                    pageData.featuredImage;
                setImagePreviewUrl(previewUrl);
                setImageInputType("upload");
            }

            setAutoSlug(false);
        }
    }, [pageData]);

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
        setIsDirty(true);
    };

    // Handle image input type change
    const handleImageInputTypeChange = (type) => {
        setImageInputType(type);
        if (type === "url") {
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

        // Validate rich text content
        const contentText = formData.content?.replace(/<[^>]*>/g, "").trim();
        if (!contentText) {
            newErrors.content = "Content is required";
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
                toast.error("You must be logged in to create a page");
                return;
            }

            // Prepare submission data
            const submitData = {
                title: formData.title.trim(),
                slug: formData.slug.trim(),
                excerpt: formData.excerpt.trim(),
                content: formData.content.trim(),
                status: formData.status,
                metaTitle: formData.metaTitle.trim() || formData.title.trim(),
                metaDescription:
                    formData.metaDescription.trim() || formData.excerpt.trim(),
                metaKeywords: formData.metaKeywords.trim(),
            };

            // Only add authorId when creating (not editing)
            if (!isEditMode) {
                submitData.authorId = user.id;
            }

            // Add featuredImageId if provided
            if (formData.featuredImageId) {
                submitData.featuredImageId = formData.featuredImageId;
            }

            // Add template if provided
            if (formData.template) {
                submitData.template = formData.template;
            }

            // Add publishedAt if provided
            if (formData.publishedAt) {
                submitData.publishedAt = new Date(
                    formData.publishedAt
                ).toISOString();
            }

            await submitForm(submitData);
            setIsDirty(false);

            // Redirect to pages list
            router.push("/dashboard/pages");
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
                router.push("/dashboard/pages");
            }
        } else {
            router.push("/dashboard/pages");
        }
    };

    // Show loading state while fetching page data
    // if (fetchLoading) {
    //     return (
    //         <PageContainer>
    //             <LoadingState message="Loading page..." loading={fetchLoading || loading} fullScreen={true} />
    //         </PageContainer>
    //     );
    // }

    return (
        <PageContainer>
            <LoadingState
                message="Loading page..."
                loading={fetchLoading || loading}
                fullScreen={true}
            />
            <PageHeader
                title={isEditMode ? "Edit Page" : "Add Page"}
                description={
                    isEditMode ? "Update page information" : "Create a new page"
                }
                action={
                    <div className="flex gap-2">
                        <CustomButton
                            variant="outline"
                            onClick={() => router.push("/dashboard/pages")}
                        >
                            Back to Pages
                        </CustomButton>
                        <CustomButton
                            onClick={(e) => {
                                e.preventDefault();
                                if (formRef.current) {
                                    formRef.current.requestSubmit();
                                }
                            }}
                            disabled={loading}
                            className="bg-[#af7f56] hover:bg-[#9d6f46] text-white"
                        >
                            {loading
                                ? isEditMode
                                    ? "Updating..."
                                    : "Creating..."
                                : isEditMode
                                ? "Update Page"
                                : "Add Page"}
                        </CustomButton>
                    </div>
                }
            />

            <div className="max-w-full mx-auto">
                <form
                    ref={formRef}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    {/* Two-column layout for large screens */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left Column - All Inputs */}
                        <div className="lg:col-span-8 space-y-6">
                            <CustomCard>
                                <CustomCardContent className="pt-6 space-y-6">
                                    {/* Title */}
                                    <div>
                                        <CustomLabel
                                            htmlFor="title"
                                            className="text-sm font-medium block mb-2"
                                        >
                                            Title
                                        </CustomLabel>
                                        <CustomInput
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) =>
                                                handleChange(
                                                    "title",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Enter page title"
                                            className={
                                                errors.title
                                                    ? "border-red-500"
                                                    : ""
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

                                    {/* Slug */}
                                    <div>
                                        <CustomLabel
                                            htmlFor="slug"
                                            className="text-sm font-medium block mb-2"
                                        >
                                            Slug
                                        </CustomLabel>
                                        <CustomInput
                                            id="slug"
                                            value={formData.slug}
                                            onChange={(e) =>
                                                handleSlugChange(e.target.value)
                                            }
                                            placeholder="page-slug"
                                            className={
                                                errors.slug
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            The &quot;slug&quot; is the
                                            URL-friendly version of the title.
                                            It is usually all lowercase and
                                            contains only letters, numbers, and
                                            hyphens.
                                        </p>
                                        {errors.slug && (
                                            <p className="text-xs text-red-500 mt-1">
                                                {errors.slug}
                                            </p>
                                        )}
                                    </div>

                                    {/* Excerpt */}
                                    <div>
                                        <CustomLabel
                                            htmlFor="excerpt"
                                            className="text-sm font-medium block mb-2"
                                        >
                                            Excerpt
                                        </CustomLabel>
                                        <textarea
                                            id="excerpt"
                                            value={formData.excerpt}
                                            onChange={(e) =>
                                                handleChange(
                                                    "excerpt",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Brief description of the page"
                                            rows={4}
                                            className={cn(
                                                "w-full px-3 py-2 text-sm bg-background border rounded-md text-foreground",
                                                "focus:outline-none focus:ring-2 focus:ring-primary",
                                                "border-input dark:bg-gray-800 dark:border-gray-700",
                                                "resize-none"
                                            )}
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Excerpts are optional hand-crafted
                                            summaries of your content.
                                        </p>
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <CustomLabel
                                            htmlFor="status"
                                            className="text-sm font-medium block mb-2"
                                        >
                                            Status
                                        </CustomLabel>
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
                                            <option value="ARCHIVED">
                                                Archived
                                            </option>
                                        </select>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Set the publication status of your
                                            page.
                                        </p>
                                    </div>

                                    {/* Template */}
                                    <div>
                                        <CustomLabel
                                            htmlFor="template"
                                            className="text-sm font-medium block mb-2"
                                        >
                                            Template
                                        </CustomLabel>
                                        <CustomInput
                                            id="template"
                                            value={formData.template}
                                            onChange={(e) =>
                                                handleChange(
                                                    "template",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="page-home"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Template identifier for custom page
                                            layouts (optional).
                                        </p>
                                    </div>
                                </CustomCardContent>
                            </CustomCard>

                            {/* Content - Rich Text Editor */}
                            <CustomCard>
                                <CustomCardContent className="pt-6">
                                    <div>
                                        <CustomLabel
                                            htmlFor="content"
                                            className="text-sm font-medium block mb-2"
                                        >
                                            Content
                                        </CustomLabel>
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
                                                    handleChange(
                                                        "content",
                                                        value
                                                    )
                                                }
                                                modules={quillModules}
                                                formats={quillFormats}
                                                placeholder="Start writing your page content..."
                                                className="bg-background text-foreground"
                                                style={{ minHeight: "400px" }}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Write your page content using the
                                            rich text editor.
                                        </p>
                                        {errors.content && (
                                            <p className="text-xs text-red-500 mt-1">
                                                {errors.content}
                                            </p>
                                        )}
                                    </div>
                                </CustomCardContent>
                            </CustomCard>
                        </div>

                        {/* Right Column - Featured Image and Metadata */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Featured Image Card */}
                            <CustomCard>
                                <CustomCardContent className="pt-6">
                                    <div>
                                        <CustomLabel
                                            htmlFor="image"
                                            className="text-sm font-medium block mb-2"
                                        >
                                            Featured Image
                                        </CustomLabel>
                                        {/* Image Input Type Selector */}
                                        <div className="flex gap-4 mb-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="imageInputType"
                                                    value="upload"
                                                    checked={
                                                        imageInputType ===
                                                        "upload"
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
                                                            featuredImageId:
                                                                null,
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
                                                helperText="Upload a featured image for your page"
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
                                                    Enter the URL of the image
                                                    you want to use
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
                                </CustomCardContent>
                            </CustomCard>

                            {/* SEO Metadata Card */}
                            <CustomCard>
                                <CustomCardContent className="pt-6 space-y-6">
                                    <div>
                                        <h3 className="text-sm font-medium mb-4">
                                            SEO Settings
                                        </h3>
                                    </div>

                                    {/* Meta Title */}
                                    <div>
                                        <CustomLabel
                                            htmlFor="metaTitle"
                                            className="text-sm font-medium block mb-2"
                                        >
                                            Meta Title
                                        </CustomLabel>
                                        <CustomInput
                                            id="metaTitle"
                                            value={formData.metaTitle}
                                            onChange={(e) =>
                                                handleChange(
                                                    "metaTitle",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="SEO title"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Optimized title for search engines
                                            (defaults to page title).
                                        </p>
                                    </div>

                                    {/* Meta Description */}
                                    <div>
                                        <CustomLabel
                                            htmlFor="metaDescription"
                                            className="text-sm font-medium block mb-2"
                                        >
                                            Meta Description
                                        </CustomLabel>
                                        <textarea
                                            id="metaDescription"
                                            value={formData.metaDescription}
                                            onChange={(e) =>
                                                handleChange(
                                                    "metaDescription",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="SEO description"
                                            rows={4}
                                            className={cn(
                                                "w-full px-3 py-2 text-sm bg-background border rounded-md text-foreground",
                                                "focus:outline-none focus:ring-2 focus:ring-primary",
                                                "border-input dark:bg-gray-800 dark:border-gray-700",
                                                "resize-none"
                                            )}
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Brief description for search engine
                                            results.
                                        </p>
                                    </div>

                                    {/* Meta Keywords */}
                                    <div>
                                        <CustomLabel
                                            htmlFor="metaKeywords"
                                            className="text-sm font-medium block mb-2"
                                        >
                                            Meta Keywords
                                        </CustomLabel>
                                        <CustomInput
                                            id="metaKeywords"
                                            value={formData.metaKeywords}
                                            onChange={(e) =>
                                                handleChange(
                                                    "metaKeywords",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="company, mission, leadership"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Comma-separated keywords for SEO.
                                        </p>
                                    </div>
                                </CustomCardContent>
                            </CustomCard>
                        </div>
                    </div>
                </form>
            </div>
        </PageContainer>
    );
}
