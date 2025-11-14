"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    CustomButton,
    PageContainer,
    PageHeader,
    CustomCard,
    CustomCardContent,
    CustomLabel,
    CustomInput,
    CustomTextarea,
    LoadingState,
} from "@/components/ui";
import { useBlogTagForm } from "../hooks/useBlogTagForm";

export default function BlogTagForm({ tagId = null }) {
    const router = useRouter();
    const { loading, fetchLoading, tagData, isEditMode, submitForm } =
        useBlogTagForm(tagId);

    // Form state
    const [formValues, setFormValues] = useState({
        name: "",
        slug: "",
        description: "",
    });
    const [errors, setErrors] = useState({});

    // Load tag data in edit mode
    useEffect(() => {
        if (tagData && isEditMode) {
            setFormValues({
                name: tagData.name || "",
                slug: tagData.slug || "",
                description: tagData.description || "",
            });
        }
    }, [tagData, isEditMode]);

    // Generate slug from name
    const generateSlug = (name) => {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");
    };

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormValues((prev) => {
            const newValues = {
                ...prev,
                [name]: value,
            };

            // Auto-generate slug from name
            if (name === "name" && !isEditMode) {
                newValues.slug = generateSlug(value);
            }

            return newValues;
        });

        // Clear error for this field
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formValues.name.trim()) {
            newErrors.name = "Name is required";
        }

        if (!formValues.slug.trim()) {
            newErrors.slug = "Slug is required";
        } else if (!/^[a-z0-9-]+$/.test(formValues.slug)) {
            newErrors.slug =
                "Slug can only contain lowercase letters, numbers, and hyphens";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            await submitForm({
                name: formValues.name.trim(),
                slug: formValues.slug.trim(),
                description: formValues.description.trim(),
            });
        } catch (error) {
            // Error is already handled in the hook
        }
    };

    // if (fetchLoading) {
    //     return (
    //         <PageContainer>
    //             <LoadingState message="Loading tag..." />
    //         </PageContainer>
    //     );
    // }

    return (
        <PageContainer>
            <LoadingState
                message="Loading tag..."
                loading={fetchLoading || loading}
                fullScreen={true}
            />
            <PageHeader
                title={isEditMode ? "Edit Tag" : "Add Tag"}
                description={
                    isEditMode
                        ? "Update tag information"
                        : "Create a new blog tag"
                }
                action={
                    <CustomButton
                        variant="outline"
                        onClick={() => router.push("/dashboard/blogs/tags")}
                    >
                        Back to Tags
                    </CustomButton>
                }
            />

            <div className="max-w-full mx-auto">
                <CustomCard>
                    <CustomCardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                                <div className="md:col-span-1">
                                    <CustomLabel
                                        htmlFor="name"
                                        className="text-sm font-medium"
                                    >
                                        Name
                                    </CustomLabel>
                                </div>
                                <div className="md:col-span-3">
                                    <CustomInput
                                        id="name"
                                        name="name"
                                        value={formValues.name}
                                        onChange={handleInputChange}
                                        placeholder="Tag name"
                                        className={
                                            errors.name ? "border-red-500" : ""
                                        }
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        The name is how it appears on your site.
                                    </p>
                                    {errors.name && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {errors.name}
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
                                        name="slug"
                                        value={formValues.slug}
                                        onChange={handleInputChange}
                                        placeholder="tag-slug"
                                        className={
                                            errors.slug ? "border-red-500" : ""
                                        }
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        The &quot;slug&quot; is the URL-friendly
                                        version of the name. It is usually all
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

                            {/* Description */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                                <div className="md:col-span-1">
                                    <CustomLabel
                                        htmlFor="description"
                                        className="text-sm font-medium"
                                    >
                                        Description
                                    </CustomLabel>
                                </div>
                                <div className="md:col-span-3">
                                    <CustomTextarea
                                        id="description"
                                        name="description"
                                        value={formValues.description}
                                        onChange={handleInputChange}
                                        placeholder="Optional description for this tag"
                                        rows={4}
                                        className={
                                            errors.description
                                                ? "border-red-500"
                                                : ""
                                        }
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        The description is not prominent by
                                        default; however, some themes may show
                                        it.
                                    </p>
                                    {errors.description && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {errors.description}
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
                                        ? "Update Tag"
                                        : "Add Tag"}
                                </CustomButton>
                            </div>
                        </form>
                    </CustomCardContent>
                </CustomCard>
            </div>
        </PageContainer>
    );
}
