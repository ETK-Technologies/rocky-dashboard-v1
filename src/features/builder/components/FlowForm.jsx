"use client";

import React, { useState, useEffect } from "react";
import { FormField } from "./../../../components/ui/FormField";

export default function FlowForm({
    initialValues = null,
    onSubmit = null,
    loading = false,
}) {
    // Form state
    const [formValues, setFormValues] = useState({
        name: initialValues?.name || "",
        slug: initialValues?.slug || "",
        apiUrl: initialValues?.apiUrl || "",
        jwtToken: initialValues?.jwtToken || "",
    });

    const [errors, setErrors] = useState({});

    // Update form values when initialValues change
    useEffect(() => {
        if (initialValues) {
            setFormValues({
                name: initialValues.name || "",
                slug: initialValues.slug || "",
                apiUrl: initialValues.apiUrl || "",
                jwtToken: initialValues.jwtToken || "",
            });
        }
    }, [initialValues]);

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

        setFormValues((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Auto-generate slug from name
        if (name === "name" && !initialValues?.slug) {
            setFormValues((prev) => ({
                ...prev,
                slug: generateSlug(value),
            }));
        }

        // Clear error for this field
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: undefined,
            }));
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
        } else {
            // Validate slug format
            const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
            if (!slugPattern.test(formValues.slug)) {
                newErrors.slug =
                    "Slug must be lowercase letters, numbers, and hyphens only";
            }
        }

        if (!formValues.apiUrl.trim()) {
            newErrors.apiUrl = "API URL is required";
        } else {
            // Validate URL format
            try {
                new URL(formValues.apiUrl);
            } catch (e) {
                newErrors.apiUrl = "Please enter a valid URL";
            }
        }

        if (!formValues.jwtToken.trim()) {
            newErrors.jwtToken = "JWT Token is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e?.preventDefault();

        if (!validateForm()) {
            return false;
        }

        if (onSubmit) {
            try {
                await onSubmit(formValues);
                return true;
            } catch (error) {
                // Error handling can be done in parent component
                return false;
            }
        }

        return true;
    };

    return (
        <div className="group bg-card rounded-lg border border-border p-4 ">
            {/* <h2 className="text-lg font-semibold text-foreground mb-4">
                Flow Information
            </h2> */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormField
                    id="name"
                    name="name"
                    label="Name"
                    value={formValues.name}
                    onChange={handleInputChange}
                    error={errors.name}
                    required
                    placeholder="Enter flow name"
                    disabled={loading}
                />

                <FormField
                    id="slug"
                    name="slug"
                    label="Slug"
                    value={formValues.slug}
                    onChange={handleInputChange}
                    error={errors.slug}
                    required
                    placeholder="flow-slug"
                    disabled={loading}
                    helperText="URL-friendly version of the name"
                />

                <FormField
                    id="apiUrl"
                    name="apiUrl"
                    label="API URL"
                    value={formValues.apiUrl}
                    onChange={handleInputChange}
                    error={errors.apiUrl}
                    required
                    placeholder="https://api.example.com"
                    disabled={loading}
                />

                <FormField
                    id="jwtToken"
                    name="jwtToken"
                    label="JWT Token"
                    value={formValues.jwtToken}
                    onChange={handleInputChange}
                    error={errors.jwtToken}
                    required
                    placeholder="Enter JWT Token"
                    disabled={loading}
                />
            </div>
        </div>
    );
}
