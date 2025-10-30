"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import {
  CustomButton,
  PageContainer,
  PageHeader,
  CustomCard,
  CustomCardContent,
  FormField,
  CustomLabel,
  CustomInput,
  SingleImageUpload,
  LoadingState,
  ErrorState,
} from "@/components/ui";
import { useCategoryForm } from "../hooks/useCategoryForm";
import { useCategories } from "../hooks/useCategories";
import { cn } from "@/utils/cn";

export default function CategoryForm({ categoryId = null }) {
  const router = useRouter();
  const { loading, fetchLoading, categoryData, isEditMode, submitForm } =
    useCategoryForm(categoryId);
  const { categories } = useCategories();

  // Form state
  const [formValues, setFormValues] = useState({
    name: "",
    slug: "",
    description: "",
    parentId: "",
    isActive: true,
    sortOrder: 0,
    metaTitle: "",
    metaDescription: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  // Load category data in edit mode
  useEffect(() => {
    if (categoryData && isEditMode) {
      setFormValues({
        name: categoryData.name || "",
        slug: categoryData.slug || "",
        description: categoryData.description || "",
        parentId: categoryData.parentId || "",
        isActive: categoryData.isActive ?? true,
        sortOrder: categoryData.sortOrder || 0,
        metaTitle: categoryData.metaTitle || "",
        metaDescription: categoryData.metaDescription || "",
      });
      setImagePreview(categoryData.image || null);
    }
  }, [categoryData, isEditMode]);

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
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormValues((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Auto-generate slug from name
    if (name === "name" && !isEditMode) {
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

  // Handle image change
  const handleImageChange = (file) => {
    setImageFile(file);
    if (errors.image) {
      setErrors((prev) => ({
        ...prev,
        image: undefined,
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
      // Prepare form values
      const submitData = {
        ...formValues,
        sortOrder: parseInt(formValues.sortOrder) || 0,
        parentId: formValues.parentId || null,
      };

      await submitForm(submitData, imageFile);
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  // Get parent categories (exclude current category in edit mode)
  const parentCategories = useMemo(() => {
    return categories.filter((cat) => cat.id !== categoryId);
  }, [categories, categoryId]);

  // Show loading state
  if (fetchLoading) {
    return (
      <PageContainer>
        <LoadingState message="Loading category..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={isEditMode ? "Edit Category" : "Add Category"}
        description={
          isEditMode ? "Update category information" : "Create a new category"
        }
        action={
          <CustomButton
            variant="outline"
            onClick={() => router.push("/dashboard/categories")}
            className="flex items-center gap-2"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Categories</span>
            <span className="sm:hidden">Back</span>
          </CustomButton>
        }
      />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <CustomCard>
              <CustomCardContent className="pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Basic Information
                </h3>

                <div className="space-y-4">
                  <FormField
                    id="name"
                    name="name"
                    label="Name"
                    value={formValues.name}
                    onChange={handleInputChange}
                    error={errors.name}
                    required
                    placeholder="Enter category name"
                  />

                  <FormField
                    id="slug"
                    name="slug"
                    label="Slug"
                    value={formValues.slug}
                    onChange={handleInputChange}
                    error={errors.slug}
                    required
                    placeholder="category-slug"
                    helperText="URL-friendly version of the name"
                  />

                  <div className="space-y-2">
                    <CustomLabel htmlFor="description">Description</CustomLabel>
                    <textarea
                      id="description"
                      name="description"
                      value={formValues.description}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Enter category description"
                      className={cn(
                        "flex w-full rounded-md border px-3 py-2 text-sm transition-colors",
                        "bg-white text-gray-900 border-gray-300",
                        "placeholder:text-gray-500",
                        "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600",
                        "dark:placeholder:text-gray-400",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                        "focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400",
                        "focus-visible:border-blue-500 dark:focus-visible:border-blue-400",
                        "disabled:cursor-not-allowed disabled:opacity-50"
                      )}
                    />
                  </div>
                </div>
              </CustomCardContent>
            </CustomCard>

            {/* SEO Information */}
            <CustomCard>
              <CustomCardContent className="pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  SEO Information
                </h3>

                <div className="space-y-4">
                  <FormField
                    id="metaTitle"
                    name="metaTitle"
                    label="Meta Title"
                    value={formValues.metaTitle}
                    onChange={handleInputChange}
                    placeholder="Enter meta title"
                    helperText="Recommended: 50-60 characters"
                  />

                  <div className="space-y-2">
                    <CustomLabel htmlFor="metaDescription">
                      Meta Description
                    </CustomLabel>
                    <textarea
                      id="metaDescription"
                      name="metaDescription"
                      value={formValues.metaDescription}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Enter meta description"
                      className={cn(
                        "flex w-full rounded-md border px-3 py-2 text-sm transition-colors",
                        "bg-white text-gray-900 border-gray-300",
                        "placeholder:text-gray-500",
                        "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600",
                        "dark:placeholder:text-gray-400",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                        "focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400",
                        "focus-visible:border-blue-500 dark:focus-visible:border-blue-400",
                        "disabled:cursor-not-allowed disabled:opacity-50"
                      )}
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Recommended: 150-160 characters
                    </p>
                  </div>
                </div>
              </CustomCardContent>
            </CustomCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Image */}
            <CustomCard>
              <CustomCardContent className="pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Category Image
                </h3>
                <SingleImageUpload
                  value={imagePreview}
                  onChange={handleImageChange}
                  onRemove={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  error={errors.image}
                />
              </CustomCardContent>
            </CustomCard>

            {/* Settings */}
            <CustomCard>
              <CustomCardContent className="pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Settings
                </h3>

                <div className="space-y-4">
                  {/* Parent Category */}
                  <div className="space-y-2">
                    <CustomLabel htmlFor="parentId">
                      Parent Category
                    </CustomLabel>
                    <select
                      id="parentId"
                      name="parentId"
                      value={formValues.parentId}
                      onChange={handleInputChange}
                      className={cn(
                        "flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors",
                        "bg-white text-gray-900 border-gray-300",
                        "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                        "focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400",
                        "disabled:cursor-not-allowed disabled:opacity-50"
                      )}
                    >
                      <option value="">None (Top Level)</option>
                      {parentCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Is Active Toggle */}
                  <div className="flex items-center justify-between">
                    <CustomLabel htmlFor="isActive">Active Status</CustomLabel>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={formValues.isActive}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Sort Order */}
                  <FormField
                    id="sortOrder"
                    name="sortOrder"
                    type="number"
                    label="Sort Order"
                    value={formValues.sortOrder}
                    onChange={handleInputChange}
                    placeholder="0"
                    helperText="Lower numbers appear first"
                  />
                </div>
              </CustomCardContent>
            </CustomCard>

            {/* Actions */}
            <CustomCard>
              <CustomCardContent className="pt-6">
                <div className="space-y-3">
                  <CustomButton
                    type="submit"
                    className="w-full flex items-center justify-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        {isEditMode ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {isEditMode ? "Update Category" : "Create Category"}
                      </>
                    )}
                  </CustomButton>

                  <CustomButton
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push("/dashboard/categories")}
                    disabled={loading}
                  >
                    Cancel
                  </CustomButton>
                </div>
              </CustomCardContent>
            </CustomCard>
          </div>
        </div>
      </form>
    </PageContainer>
  );
}
