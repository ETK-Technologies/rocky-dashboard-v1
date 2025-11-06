"use client";

import { useState, useEffect, useRef } from "react";
import { CustomLabel, CustomInput, FormField } from "@/components/ui";
import { Link2, X } from "lucide-react";
import { SingleImageUpload } from "../SingleImageUpload";

export default function QuizDetailsStep({
    onComplete,
    onValidationChange,
    data,
    updateData,
}) {
    const formData = data?.quizDetails || {
        name: "",
        slug: "",
        requireLogin: false,
        preQuiz: false,
        addThankYouPage: false,
        thankYouTitle: "",
        thankYouDescription: "",
        thankYouImage: "",
        thankYouImageType: "upload",
    };
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const validationCallbackRef = useRef(onValidationChange);

    // Keep ref in sync with prop
    useEffect(() => {
        validationCallbackRef.current = onValidationChange;
    }, [onValidationChange]);

    // Auto-generate slug from name (only if not manually edited)
    useEffect(() => {
        if (formData.name && !slugManuallyEdited) {
            const generatedSlug = formData.name
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, "")
                .replace(/[\s_-]+/g, "-")
                .replace(/^-+|-+$/g, "");
            updateData("quizDetails", {
                ...formData,
                slug: generatedSlug,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.name, slugManuallyEdited]);

    // Validate required fields (only show errors for touched fields)
    useEffect(() => {
        const newErrors = {};
        let isValid = true;

        // Validate Quiz Name (only show error if field has been touched)
        if (touched.name && !formData.name.trim()) {
            newErrors.name = "Quiz Name is required";
            isValid = false;
        } else if (!formData.name.trim()) {
            // Field is invalid but not touched yet
            isValid = false;
        }

        // Validate Quiz Slug (only show error if field has been touched)
        if (touched.slug && !formData.slug.trim()) {
            newErrors.slug = "Quiz Slug is required";
            isValid = false;
        } else if (!formData.slug.trim()) {
            // Field is invalid but not touched yet
            isValid = false;
        }

        setErrors(newErrors);

        // Use ref to avoid dependency issues
        validationCallbackRef.current?.(isValid);
    }, [formData.name, formData.slug, touched]);

    const handleChange = (field, value) => {
        // Mark field as touched when user starts typing
        if (!touched[field]) {
            setTouched((prev) => ({
                ...prev,
                [field]: true,
            }));
        }
        // Ensure string fields are never null
        const sanitizedValue =
            value === null || value === undefined ? "" : value;
        updateData("quizDetails", {
            ...formData,
            [field]: sanitizedValue,
        });
    };

    const handleBlur = (field) => {
        setTouched((prev) => ({
            ...prev,
            [field]: true,
        }));
    };

    const handleToggle = (field) => {
        updateData("quizDetails", {
            ...formData,
            [field]: !formData[field],
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold mb-2">Quiz Details</h2>
                <p className="text-muted-foreground">
                    Set up the basic information for your quiz
                </p>
            </div>

            <div className="space-y-6">
                <FormField
                    id="name"
                    label="Quiz Name"
                    required
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    onBlur={() => handleBlur("name")}
                    placeholder="Enter quiz name"
                    error={errors.name}
                />

                <FormField
                    id="slug"
                    label="Quiz Slug"
                    required
                    value={formData.slug}
                    onChange={(e) => {
                        setSlugManuallyEdited(true);
                        handleChange("slug", e.target.value);
                    }}
                    onBlur={() => handleBlur("slug")}
                    placeholder="quiz-slug"
                    helperText="Auto-generated from name, but you can edit it"
                    error={errors.slug}
                />

                <div className="flex items-center justify-between border sm:px-6 px-2 py-6 gap-2 rounded-md">
                    <div className="flex flex-col">
                        <CustomLabel>Require Login</CustomLabel>
                        <p className="text-sm text-muted-foreground mt-1">
                            Users must be logged in to take the quiz
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.requireLogin}
                            onChange={() => handleToggle("requireLogin")}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>

                <div className="flex items-center justify-between border sm:px-6 px-2 py-6 gap-2 rounded-md">
                    <div className="flex flex-col">
                        <CustomLabel>Pre-Quiz</CustomLabel>
                        <p className="text-sm text-muted-foreground mt-1">
                            Show an introduction page before the quiz
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.preQuiz}
                            onChange={() => handleToggle("preQuiz")}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>

                <div className=" border sm:px-6 px-2 py-6 gap-2 rounded-md">
                    <div className="flex items-center justify-between ">
                        <div className="flex flex-col">
                            <CustomLabel>Add Thank You Page</CustomLabel>
                            <p className="text-sm text-muted-foreground mt-1">
                                Show a thank you page after quiz completion
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.addThankYouPage}
                                onChange={() => handleToggle("addThankYouPage")}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                    {formData.addThankYouPage && (
                        <div className="border sm:px-6 px-2 py-6 rounded-md space-y-6 mt-3">
                            <FormField
                                id="thankYouTitle"
                                label="Title"
                                value={formData.thankYouTitle}
                                onChange={(e) =>
                                    handleChange(
                                        "thankYouTitle",
                                        e.target.value
                                    )
                                }
                                placeholder="Thank you for completing the quiz!"
                                helperText="Optional - Default: 'Thank You!'"
                            />

                            <div className="space-y-2">
                                <CustomLabel htmlFor="thankYouDescription">
                                    Description
                                </CustomLabel>
                                <textarea
                                    id="thankYouDescription"
                                    value={formData.thankYouDescription}
                                    onChange={(e) =>
                                        handleChange(
                                            "thankYouDescription",
                                            e.target.value
                                        )
                                    }
                                    placeholder="We appreciate your time and feedback."
                                    rows={4}
                                    className="w-full px-3 py-2 border border-input rounded-md bg-background dark:bg-gray-800 text-black dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                />
                                <p className="text-sm text-muted-foreground">
                                    Optional - Default: &apos;Thank you for
                                    taking the quiz!&apos;
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <CustomLabel>Image</CustomLabel>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleChange(
                                                    "thankYouImageType",
                                                    "upload"
                                                )
                                            }
                                            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                                                formData.thankYouImageType ===
                                                "upload"
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                            }`}
                                        >
                                            Upload
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleChange(
                                                    "thankYouImageType",
                                                    "link"
                                                )
                                            }
                                            className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1 ${
                                                formData.thankYouImageType ===
                                                "link"
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                            }`}
                                        >
                                            <Link2 className="h-3 w-3" />
                                            Link
                                        </button>
                                    </div>
                                </div>

                                {formData.thankYouImageType === "upload" ? (
                                    <SingleImageUpload
                                        label=""
                                        value={formData.thankYouImage || ""}
                                        onChange={(url) =>
                                            handleChange(
                                                "thankYouImage",
                                                url || ""
                                            )
                                        }
                                        onRemove={() =>
                                            handleChange("thankYouImage", "")
                                        }
                                        helperText="Optional - Default image will be used if not provided"
                                        className="md:w-[50%] sm:w-[70%] w-full"
                                    />
                                ) : (
                                    <div className="space-y-4">
                                        <FormField
                                            id="thankYouImageLink"
                                            label=""
                                            value={formData.thankYouImage || ""}
                                            onChange={(e) =>
                                                handleChange(
                                                    "thankYouImage",
                                                    e.target.value || ""
                                                )
                                            }
                                            placeholder="https://example.com/image.jpg"
                                            type="url"
                                            helperText="Optional - Default image will be used if not provided"
                                        />
                                        {formData.thankYouImage && (
                                            <div className="relative inline-block">
                                                <img
                                                    src={formData.thankYouImage}
                                                    alt="Thank you page preview"
                                                    className="max-w-full h-auto max-h-64 rounded-md border border-input object-contain"
                                                    onError={(e) => {
                                                        e.target.style.display =
                                                            "none";
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleChange(
                                                            "thankYouImage",
                                                            ""
                                                        )
                                                    }
                                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                                    title="Remove image"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
