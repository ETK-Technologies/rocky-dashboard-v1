"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2, X, Package } from "lucide-react";
import {
  CustomButton,
  PageContainer,
  PageHeader,
  CustomCard,
  CustomCardContent,
  FormField,
  CustomLabel,
  CustomInput,
  LoadingState,
} from "@/components/ui";
import { useProductForm } from "../hooks/useProductForm";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { cn } from "@/utils/cn";

const PRODUCT_TYPES = [
  { value: "SIMPLE", label: "Simple Product" },
  { value: "VARIABLE", label: "Variable Product" },
  { value: "SUBSCRIPTION", label: "Subscription Product" },
  { value: "VARIABLE_SUBSCRIPTION", label: "Variable Subscription" },
];

const SUBSCRIPTION_PERIODS = [
  { value: "DAY", label: "Day(s)" },
  { value: "WEEK", label: "Week(s)" },
  { value: "MONTH", label: "Month(s)" },
  { value: "YEAR", label: "Year(s)" },
];

const PRODUCT_STATUSES = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Archived" },
];

const TAX_STATUSES = [
  { value: "TAXABLE", label: "Taxable" },
  { value: "SHIPPING", label: "Shipping Only" },
  { value: "NONE", label: "None" },
];

const BACKORDER_OPTIONS = [
  { value: "NO", label: "Do not allow" },
  { value: "NOTIFY", label: "Allow, but notify customer" },
  { value: "YES", label: "Allow" },
];

export default function ProductForm({ productId = null }) {
  const router = useRouter();
  const { loading, fetchLoading, productData, isEditMode, submitForm } =
    useProductForm(productId);
  const { categories } = useCategories();

  // Form state
  const [formValues, setFormValues] = useState({
    name: "",
    slug: "",
    type: "SIMPLE",
    status: "DRAFT",
    basePrice: "",
    salePrice: "",
    description: "",
    shortDescription: "",
    sku: "",
    trackInventory: false,
    stockQuantity: 0,
    lowStockThreshold: 0,
    featured: false,
    virtual: false,
    downloadable: false,
    reviewsAllowed: true,
    taxStatus: "TAXABLE",
    taxClass: "standard",
    shippingRequired: true,
    shippingClass: "",
    backorders: "NO",
    weight: "",
    length: "",
    width: "",
    height: "",

    // Subscription fields
    subscriptionPeriod: "MONTH",
    subscriptionInterval: 1,
    subscriptionLength: 0,
    subscriptionSignUpFee: 0,
    subscriptionTrialLength: 0,
    subscriptionTrialPeriod: "DAY",

    // Metadata
    metaTitle: "",
    metaDescription: "",
  });

  const [images, setImages] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [variants, setVariants] = useState([]);
  const [categoryIds, setCategoryIds] = useState([]);
  const [metadata, setMetadata] = useState([]);
  const [errors, setErrors] = useState({});

  // Load product data in edit mode
  useEffect(() => {
    if (productData && isEditMode) {
      setFormValues({
        name: productData.name || "",
        slug: productData.slug || "",
        type: productData.type || "SIMPLE",
        status: productData.status || "DRAFT",
        basePrice: productData.basePrice || "",
        salePrice: productData.salePrice || "",
        description: productData.description || "",
        shortDescription: productData.shortDescription || "",
        sku: productData.sku || "",
        trackInventory: productData.trackInventory || false,
        stockQuantity: productData.stockQuantity || 0,
        lowStockThreshold: productData.lowStockThreshold || 0,
        featured: productData.featured || false,
        virtual: productData.virtual || false,
        downloadable: productData.downloadable || false,
        reviewsAllowed: productData.reviewsAllowed !== false,
        taxStatus: productData.taxStatus || "TAXABLE",
        taxClass: productData.taxClass || "standard",
        shippingRequired: productData.shippingRequired !== false,
        shippingClass: productData.shippingClass || "",
        backorders: productData.backorders || "NO",
        weight: productData.weight || "",
        length: productData.length || "",
        width: productData.width || "",
        height: productData.height || "",

        subscriptionPeriod: productData.subscriptionPeriod || "MONTH",
        subscriptionInterval: productData.subscriptionInterval || 1,
        subscriptionLength: productData.subscriptionLength || 0,
        subscriptionSignUpFee: productData.subscriptionSignUpFee || 0,
        subscriptionTrialLength: productData.subscriptionTrialLength || 0,
        subscriptionTrialPeriod: productData.subscriptionTrialPeriod || "DAY",

        metaTitle: productData.metaTitle || "",
        metaDescription: productData.metaDescription || "",
      });

      if (productData.images) setImages(productData.images);
      if (productData.attributes) setAttributes(productData.attributes);
      if (productData.variants) setVariants(productData.variants);
      if (productData.categoryIds) setCategoryIds(productData.categoryIds);
      if (productData.metadata) setMetadata(productData.metadata);
    }
  }, [productData, isEditMode]);

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

  // Category selection
  const handleCategoryToggle = (categoryId) => {
    setCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Add/Update/Remove helpers
  const addImage = () => {
    setImages((prev) => [
      ...prev,
      { url: "", altText: "", name: "", sortOrder: prev.length },
    ]);
  };

  const updateImage = (index, field, value) => {
    setImages((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addAttribute = () => {
    setAttributes((prev) => [
      ...prev,
      { name: "", value: "", variation: true },
    ]);
  };

  const updateAttribute = (index, field, value) => {
    setAttributes((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeAttribute = (index) => {
    setAttributes((prev) => prev.filter((_, i) => i !== index));
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        name: "",
        sku: "",
        price: "",
        salePrice: "",
        stockQuantity: 0,
        manageStock: false,
        attributes: [],
      },
    ]);
  };

  const updateVariant = (index, field, value) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeVariant = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const addMetadata = () => {
    setMetadata((prev) => [...prev, { key: "", value: "" }]);
  };

  const updateMetadata = (index, field, value) => {
    setMetadata((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeMetadata = (index) => {
    setMetadata((prev) => prev.filter((_, i) => i !== index));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formValues.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formValues.slug.trim()) {
      newErrors.slug = "Slug is required";
    }

    if (!formValues.basePrice || parseFloat(formValues.basePrice) <= 0) {
      newErrors.basePrice = "Valid base price is required";
    }

    // Type-specific validation
    if (
      (formValues.type === "VARIABLE" ||
        formValues.type === "VARIABLE_SUBSCRIPTION") &&
      attributes.length === 0
    ) {
      newErrors.attributes = "Variable products require at least one attribute";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const submitData = {
        name: formValues.name,
        slug: formValues.slug,
        type: formValues.type,
        status: formValues.status,
        basePrice: parseFloat(formValues.basePrice),
        description: formValues.description,
        shortDescription: formValues.shortDescription,
        sku: formValues.sku,
        trackInventory: formValues.trackInventory,
        stockQuantity: parseInt(formValues.stockQuantity) || 0,
        lowStockThreshold: parseInt(formValues.lowStockThreshold) || 0,
        featured: formValues.featured,
        virtual: formValues.virtual,
        downloadable: formValues.downloadable,
        reviewsAllowed: formValues.reviewsAllowed,
        taxStatus: formValues.taxStatus,
        taxClass: formValues.taxClass,
        shippingRequired: formValues.shippingRequired,
        shippingClass: formValues.shippingClass,
        backorders: formValues.backorders,
        metaTitle: formValues.metaTitle,
        metaDescription: formValues.metaDescription,
      };

      if (formValues.salePrice) {
        submitData.salePrice = parseFloat(formValues.salePrice);
      }

      if (formValues.weight) {
        submitData.weight = parseFloat(formValues.weight);
      }

      if (formValues.length) submitData.length = parseFloat(formValues.length);
      if (formValues.width) submitData.width = parseFloat(formValues.width);
      if (formValues.height) submitData.height = parseFloat(formValues.height);

      if (images.length > 0) {
        submitData.images = images.filter((img) => img.url);
      }

      if (categoryIds.length > 0) {
        submitData.categoryIds = categoryIds;
      }

      if (metadata.length > 0) {
        submitData.metadata = metadata.filter((meta) => meta.key && meta.value);
      }

      if (
        formValues.type === "VARIABLE" ||
        formValues.type === "VARIABLE_SUBSCRIPTION"
      ) {
        submitData.attributes = attributes.filter(
          (attr) => attr.name && attr.value
        );
        submitData.variants = variants.filter((variant) => variant.name);
      }

      if (
        formValues.type === "SUBSCRIPTION" ||
        formValues.type === "VARIABLE_SUBSCRIPTION"
      ) {
        submitData.subscriptionPeriod = formValues.subscriptionPeriod;
        submitData.subscriptionInterval = parseInt(
          formValues.subscriptionInterval
        );
        submitData.subscriptionLength = parseInt(formValues.subscriptionLength);
        submitData.subscriptionSignUpFee = parseFloat(
          formValues.subscriptionSignUpFee
        );
        submitData.subscriptionTrialLength = parseInt(
          formValues.subscriptionTrialLength
        );
        submitData.subscriptionTrialPeriod = formValues.subscriptionTrialPeriod;
      }

      await submitForm(submitData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  // Show loading state
  if (fetchLoading) {
    return (
      <PageContainer>
        <LoadingState message="Loading product..." />
      </PageContainer>
    );
  }

  const isVariableProduct =
    formValues.type === "VARIABLE" ||
    formValues.type === "VARIABLE_SUBSCRIPTION";
  const hasSubscription =
    formValues.type === "SUBSCRIPTION" ||
    formValues.type === "VARIABLE_SUBSCRIPTION";
  const isVariableSubscription = formValues.type === "VARIABLE_SUBSCRIPTION";

  return (
    <PageContainer>
      <PageHeader
        title={isEditMode ? "Edit Product" : "Create Product"}
        description={
          isEditMode
            ? "Update product details"
            : "Add a new product to your store"
        }
        action={
          <CustomButton
            variant="outline"
            onClick={() => router.push("/dashboard/products")}
            className="flex items-center gap-2"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Products</span>
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
                    label="Product Name"
                    value={formValues.name}
                    onChange={handleInputChange}
                    error={errors.name}
                    required
                    placeholder="Enter product name"
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
                    placeholder="product-slug"
                    helperText="URL-friendly version of the name"
                    disabled={loading}
                  />

                  <div className="space-y-2">
                    <CustomLabel htmlFor="description">Description</CustomLabel>
                    <textarea
                      id="description"
                      name="description"
                      value={formValues.description}
                      onChange={handleInputChange}
                      placeholder="Enter product description"
                      disabled={loading}
                      rows={4}
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

                  <div className="space-y-2">
                    <CustomLabel htmlFor="shortDescription">
                      Short Description
                    </CustomLabel>
                    <textarea
                      id="shortDescription"
                      name="shortDescription"
                      value={formValues.shortDescription}
                      onChange={handleInputChange}
                      placeholder="Enter short description"
                      disabled={loading}
                      rows={2}
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

            {/* Pricing */}
            <CustomCard>
              <CustomCardContent className="pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Pricing
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      id="basePrice"
                      name="basePrice"
                      label="Base Price"
                      type="number"
                      step="0.01"
                      value={formValues.basePrice}
                      onChange={handleInputChange}
                      error={errors.basePrice}
                      required
                      placeholder="0.00"
                      disabled={loading}
                    />

                    <FormField
                      id="salePrice"
                      name="salePrice"
                      label="Sale Price"
                      type="number"
                      step="0.01"
                      value={formValues.salePrice}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      disabled={loading}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <CustomLabel htmlFor="taxStatus">Tax Status</CustomLabel>
                      <select
                        id="taxStatus"
                        name="taxStatus"
                        value={formValues.taxStatus}
                        onChange={handleInputChange}
                        disabled={loading}
                        className={cn(
                          "flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors",
                          "bg-white text-gray-900 border-gray-300",
                          "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                          "focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400"
                        )}
                      >
                        {TAX_STATUSES.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <FormField
                      id="taxClass"
                      name="taxClass"
                      label="Tax Class"
                      value={formValues.taxClass}
                      onChange={handleInputChange}
                      placeholder="standard"
                      disabled={loading}
                    />
                  </div>
                </div>
              </CustomCardContent>
            </CustomCard>

            {/* Product Type */}
            <CustomCard>
              <CustomCardContent className="pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Product Type
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <CustomLabel htmlFor="type" required>
                      Type
                    </CustomLabel>
                    <select
                      id="type"
                      name="type"
                      value={formValues.type}
                      onChange={handleInputChange}
                      disabled={loading || isEditMode}
                      className={cn(
                        "flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors",
                        "bg-white text-gray-900 border-gray-300",
                        "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                        "focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400",
                        "disabled:cursor-not-allowed disabled:opacity-50"
                      )}
                    >
                      {PRODUCT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    {isEditMode && (
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Product type cannot be changed after creation
                      </p>
                    )}
                  </div>
                </div>
              </CustomCardContent>
            </CustomCard>

            {/* Subscription Settings */}
            {hasSubscription && (
              <CustomCard>
                <CustomCardContent className="pt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Subscription Settings
                  </h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <CustomLabel htmlFor="subscriptionPeriod">
                          Billing Period
                        </CustomLabel>
                        <select
                          id="subscriptionPeriod"
                          name="subscriptionPeriod"
                          value={formValues.subscriptionPeriod}
                          onChange={handleInputChange}
                          disabled={loading}
                          className={cn(
                            "flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors",
                            "bg-white text-gray-900 border-gray-300",
                            "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                            "focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400"
                          )}
                        >
                          {SUBSCRIPTION_PERIODS.map((period) => (
                            <option key={period.value} value={period.value}>
                              {period.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <FormField
                        id="subscriptionInterval"
                        name="subscriptionInterval"
                        label="Billing Interval"
                        type="number"
                        min="1"
                        value={formValues.subscriptionInterval}
                        onChange={handleInputChange}
                        helperText="Bill every N period(s)"
                        disabled={loading}
                      />

                      <FormField
                        id="subscriptionSignUpFee"
                        name="subscriptionSignUpFee"
                        label="Sign-up Fee"
                        type="number"
                        step="0.01"
                        value={formValues.subscriptionSignUpFee}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        disabled={loading}
                      />

                      <FormField
                        id="subscriptionLength"
                        name="subscriptionLength"
                        label="Subscription Length"
                        type="number"
                        min="0"
                        value={formValues.subscriptionLength}
                        onChange={handleInputChange}
                        helperText="0 = never expires"
                        disabled={loading}
                      />

                      <FormField
                        id="subscriptionTrialLength"
                        name="subscriptionTrialLength"
                        label="Trial Length"
                        type="number"
                        min="0"
                        value={formValues.subscriptionTrialLength}
                        onChange={handleInputChange}
                        disabled={loading}
                      />

                      <div className="space-y-2">
                        <CustomLabel htmlFor="subscriptionTrialPeriod">
                          Trial Period
                        </CustomLabel>
                        <select
                          id="subscriptionTrialPeriod"
                          name="subscriptionTrialPeriod"
                          value={formValues.subscriptionTrialPeriod}
                          onChange={handleInputChange}
                          disabled={loading}
                          className={cn(
                            "flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors",
                            "bg-white text-gray-900 border-gray-300",
                            "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                            "focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400"
                          )}
                        >
                          {SUBSCRIPTION_PERIODS.map((period) => (
                            <option key={period.value} value={period.value}>
                              {period.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </CustomCardContent>
              </CustomCard>
            )}

            {/* Attributes (for variable products) */}
            {isVariableProduct && (
              <CustomCard>
                <CustomCardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">
                      Attributes
                    </h3>
                    <div className="flex items-center gap-2">
                      <CustomButton
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addAttribute}
                        disabled={loading}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Attribute
                      </CustomButton>
                      {isVariableSubscription && (
                        <CustomButton
                          type="button"
                          size="sm"
                          onClick={() => {
                            // Generate variants from attribute combinations
                            const parsed = attributes
                              .filter((a) => a.name && a.value)
                              .map((a) => ({
                                name: a.name.trim(),
                                values: a.value
                                  // Support comma, pipe, or slash separators
                                  .split(/[,|/]+/)
                                  .map((v) => v.trim())
                                  .filter(Boolean),
                              }))
                              .filter((a) => a.values.length > 0);

                            if (parsed.length === 0) return;

                            // Merge rows with same attribute name and de-duplicate values
                            const mergedMap = parsed.reduce((map, p) => {
                              const key = p.name.toLowerCase();
                              const set = map.get(key) || new Set();
                              p.values.forEach((v) => set.add(v));
                              map.set(key, set);
                              return map;
                            }, new Map());

                            const merged = Array.from(mergedMap.entries()).map(
                              ([key, set]) => ({
                                name:
                                  parsed.find(
                                    (x) => x.name.toLowerCase() === key
                                  )?.name || key,
                                values: Array.from(set),
                              })
                            );

                            // Clean values: remove accidental "name:" prefixes from each value
                            const cleaned = merged.map((p) => ({
                              name: p.name,
                              values: p.values.map((v) =>
                                v
                                  .replace(
                                    new RegExp(`^${p.name}\\s*:\\s*`, "i"),
                                    ""
                                  )
                                  .trim()
                              ),
                            }));

                            // Cartesian product of values only
                            const valueLists = cleaned.map((p) => p.values);
                            const combos = valueLists.reduce(
                              (acc, vals) =>
                                acc.flatMap((a) => vals.map((v) => [...a, v])),
                              [[]]
                            );

                            const newVariants = combos.map((values, idx) => ({
                              name: values
                                .map((v, i) => `${cleaned[i].name}: ${v}`)
                                .join(" | "),
                              sku: "",
                              price: "",
                              salePrice: "",
                              // initialize per-variant subscription fields (editable later)
                              subscriptionPeriod: formValues.subscriptionPeriod,
                              subscriptionInterval: 1,
                              subscriptionLength: 0,
                              subscriptionSignUpFee: "0",
                              subscriptionTrialLength: 0,
                              subscriptionTrialPeriod:
                                formValues.subscriptionTrialPeriod,
                              manageStock: true,
                              stockQuantity: 0,
                              attributes: cleaned.map((p) => ({
                                name: p.name,
                              })),
                            }));

                            setVariants(newVariants);
                          }}
                          disabled={loading || attributes.length === 0}
                        >
                          Generate Variants
                        </CustomButton>
                      )}
                    </div>
                  </div>

                  {errors.attributes && (
                    <p className="text-sm text-red-600 mb-4">
                      {errors.attributes}
                    </p>
                  )}

                  <div className="space-y-3">
                    {attributes.map((attribute, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                          <CustomInput
                            placeholder="Attribute name (e.g., Size)"
                            value={attribute.name}
                            onChange={(e) =>
                              updateAttribute(index, "name", e.target.value)
                            }
                            disabled={loading}
                          />
                          <CustomInput
                            placeholder="Values (comma-separated: S, M, L)"
                            value={attribute.value}
                            onChange={(e) =>
                              updateAttribute(index, "value", e.target.value)
                            }
                            disabled={loading}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttribute(index)}
                          disabled={loading}
                          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </CustomCardContent>
              </CustomCard>
            )}

            {/* Variants (for variable products) */}
            {isVariableProduct && (
              <CustomCard>
                <CustomCardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">
                      Variants
                    </h3>
                    <CustomButton
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addVariant}
                      disabled={loading}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Variant
                    </CustomButton>
                  </div>

                  <div className="space-y-4">
                    {variants.map((variant, index) => (
                      <div
                        key={index}
                        className="p-4 border border-border rounded-lg space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Variant {index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeVariant(index)}
                            disabled={loading}
                            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <CustomInput
                            placeholder="Variant name"
                            value={variant.name}
                            onChange={(e) =>
                              updateVariant(index, "name", e.target.value)
                            }
                            disabled={loading}
                          />
                          <CustomInput
                            placeholder="SKU"
                            value={variant.sku}
                            onChange={(e) =>
                              updateVariant(index, "sku", e.target.value)
                            }
                            disabled={loading}
                          />
                          <CustomInput
                            type="number"
                            step="0.01"
                            placeholder="Price"
                            value={variant.price}
                            onChange={(e) =>
                              updateVariant(index, "price", e.target.value)
                            }
                            disabled={loading}
                          />
                          <CustomInput
                            type="number"
                            step="0.01"
                            placeholder="Sale Price"
                            value={variant.salePrice}
                            onChange={(e) =>
                              updateVariant(index, "salePrice", e.target.value)
                            }
                            disabled={loading}
                          />
                          <CustomInput
                            placeholder="Image URL"
                            value={variant.imageUrl || ""}
                            onChange={(e) =>
                              updateVariant(index, "imageUrl", e.target.value)
                            }
                            disabled={loading}
                          />
                          <CustomInput
                            type="number"
                            placeholder="Stock Quantity"
                            value={variant.stockQuantity ?? 0}
                            onChange={(e) =>
                              updateVariant(
                                index,
                                "stockQuantity",
                                Number(e.target.value)
                              )
                            }
                            disabled={loading}
                          />
                        </div>

                        {isVariableSubscription && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                            <div className="space-y-2">
                              <CustomLabel htmlFor={`v-${index}-period`}>
                                Subscription Period
                              </CustomLabel>
                              <select
                                id={`v-${index}-period`}
                                value={
                                  variant.subscriptionPeriod ||
                                  formValues.subscriptionPeriod
                                }
                                onChange={(e) =>
                                  updateVariant(
                                    index,
                                    "subscriptionPeriod",
                                    e.target.value
                                  )
                                }
                                disabled={loading}
                                className={cn(
                                  "flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors",
                                  "bg-white text-gray-900 border-gray-300",
                                  "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600",
                                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                                  "focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400"
                                )}
                              >
                                {SUBSCRIPTION_PERIODS.map((p) => (
                                  <option key={p.value} value={p.value}>
                                    {p.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <FormField
                              id={`v-${index}-interval`}
                              label="Interval"
                              type="number"
                              min="1"
                              value={variant.subscriptionInterval ?? 1}
                              onChange={(e) =>
                                updateVariant(
                                  index,
                                  "subscriptionInterval",
                                  Number(e.target.value)
                                )
                              }
                              disabled={loading}
                            />
                            <FormField
                              id={`v-${index}-length`}
                              label="Length"
                              type="number"
                              min="0"
                              value={variant.subscriptionLength ?? 0}
                              onChange={(e) =>
                                updateVariant(
                                  index,
                                  "subscriptionLength",
                                  Number(e.target.value)
                                )
                              }
                              helperText="0 = never expires"
                              disabled={loading}
                            />
                            <FormField
                              id={`v-${index}-signup`}
                              label="Sign-up Fee"
                              type="number"
                              step="0.01"
                              value={variant.subscriptionSignUpFee ?? "0"}
                              onChange={(e) =>
                                updateVariant(
                                  index,
                                  "subscriptionSignUpFee",
                                  e.target.value
                                )
                              }
                              disabled={loading}
                            />
                            <FormField
                              id={`v-${index}-trial-len`}
                              label="Trial Length"
                              type="number"
                              min="0"
                              value={variant.subscriptionTrialLength ?? 0}
                              onChange={(e) =>
                                updateVariant(
                                  index,
                                  "subscriptionTrialLength",
                                  Number(e.target.value)
                                )
                              }
                              disabled={loading}
                            />
                            <div className="space-y-2">
                              <CustomLabel htmlFor={`v-${index}-trial-period`}>
                                Trial Period
                              </CustomLabel>
                              <select
                                id={`v-${index}-trial-period`}
                                value={
                                  variant.subscriptionTrialPeriod ||
                                  formValues.subscriptionTrialPeriod
                                }
                                onChange={(e) =>
                                  updateVariant(
                                    index,
                                    "subscriptionTrialPeriod",
                                    e.target.value
                                  )
                                }
                                disabled={loading}
                                className={cn(
                                  "flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors",
                                  "bg-white text-gray-900 border-gray-300",
                                  "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600",
                                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                                  "focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400"
                                )}
                              >
                                {SUBSCRIPTION_PERIODS.map((period) => (
                                  <option
                                    key={period.value}
                                    value={period.value}
                                  >
                                    {period.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CustomCardContent>
              </CustomCard>
            )}

            {/* Generated Variants preview removed; editing inline above for VARIABLE_SUBSCRIPTION */}

            {/* Inventory */}
            <CustomCard>
              <CustomCardContent className="pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Inventory
                </h3>

                <div className="space-y-4">
                  <FormField
                    id="sku"
                    name="sku"
                    label="SKU"
                    value={formValues.sku}
                    onChange={handleInputChange}
                    placeholder="Product SKU"
                    disabled={loading}
                  />

                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="trackInventory"
                        checked={formValues.trackInventory}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                      <span className="text-sm font-medium">
                        Track inventory
                      </span>
                    </label>
                  </div>

                  {formValues.trackInventory && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        id="stockQuantity"
                        name="stockQuantity"
                        label="Stock Quantity"
                        type="number"
                        value={formValues.stockQuantity}
                        onChange={handleInputChange}
                        disabled={loading}
                      />

                      <FormField
                        id="lowStockThreshold"
                        name="lowStockThreshold"
                        label="Low Stock Threshold"
                        type="number"
                        value={formValues.lowStockThreshold}
                        onChange={handleInputChange}
                        disabled={loading}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <CustomLabel htmlFor="backorders">
                      Allow backorders?
                    </CustomLabel>
                    <select
                      id="backorders"
                      name="backorders"
                      value={formValues.backorders}
                      onChange={handleInputChange}
                      disabled={loading}
                      className={cn(
                        "flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors",
                        "bg-white text-gray-900 border-gray-300",
                        "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                        "focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400"
                      )}
                    >
                      {BACKORDER_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CustomCardContent>
            </CustomCard>

            {/* Shipping */}
            <CustomCard>
              <CustomCardContent className="pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Shipping
                </h3>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="shippingRequired"
                        checked={formValues.shippingRequired}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                      <span className="text-sm font-medium">
                        This product requires shipping
                      </span>
                    </label>
                  </div>

                  {formValues.shippingRequired && (
                    <>
                      <FormField
                        id="shippingClass"
                        name="shippingClass"
                        label="Shipping Class"
                        value={formValues.shippingClass}
                        onChange={handleInputChange}
                        placeholder="e.g., prescriptions"
                        disabled={loading}
                      />

                      <FormField
                        id="weight"
                        name="weight"
                        label="Weight (kg)"
                        type="number"
                        step="0.01"
                        value={formValues.weight}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        disabled={loading}
                      />

                      <div className="space-y-2">
                        <CustomLabel>Dimensions (cm)</CustomLabel>
                        <div className="grid grid-cols-3 gap-2">
                          <CustomInput
                            placeholder="Length"
                            type="number"
                            step="0.01"
                            name="length"
                            value={formValues.length}
                            onChange={handleInputChange}
                            disabled={loading}
                          />
                          <CustomInput
                            placeholder="Width"
                            type="number"
                            step="0.01"
                            name="width"
                            value={formValues.width}
                            onChange={handleInputChange}
                            disabled={loading}
                          />
                          <CustomInput
                            placeholder="Height"
                            type="number"
                            step="0.01"
                            name="height"
                            value={formValues.height}
                            onChange={handleInputChange}
                            disabled={loading}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CustomCardContent>
            </CustomCard>

            {/* Metadata */}
            <CustomCard>
              <CustomCardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    Custom Metadata
                  </h3>
                  <CustomButton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addMetadata}
                    disabled={loading}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Metadata
                  </CustomButton>
                </div>

                <div className="space-y-3">
                  {metadata.map((meta, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                        <CustomInput
                          placeholder="Key"
                          value={meta.key}
                          onChange={(e) =>
                            updateMetadata(index, "key", e.target.value)
                          }
                          disabled={loading}
                        />
                        <CustomInput
                          placeholder="Value"
                          value={meta.value}
                          onChange={(e) =>
                            updateMetadata(index, "value", e.target.value)
                          }
                          disabled={loading}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMetadata(index)}
                        disabled={loading}
                        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </CustomCardContent>
            </CustomCard>

            {/* SEO */}
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
                    placeholder="SEO title"
                    helperText="Recommended: 50-60 characters"
                    disabled={loading}
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
                      placeholder="SEO description"
                      disabled={loading}
                      rows={3}
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
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Recommended: 150-160 characters
                    </p>
                  </div>

                  {/* Meta keywords removed from payload; field omitted to match backend schema */}
                </div>
              </CustomCardContent>
            </CustomCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Product Images */}
            <CustomCard>
              <CustomCardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    Product Images
                  </h3>
                  <CustomButton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addImage}
                    disabled={loading}
                  >
                    <Plus className="h-4 w-4" />
                  </CustomButton>
                </div>

                <div className="space-y-3">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className="p-3 border border-border rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Image {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          disabled={loading}
                          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <CustomInput
                        placeholder="Image URL"
                        value={image.url}
                        onChange={(e) =>
                          updateImage(index, "url", e.target.value)
                        }
                        disabled={loading}
                        className="text-sm"
                      />
                      <CustomInput
                        placeholder="Alt text"
                        value={image.altText}
                        onChange={(e) =>
                          updateImage(index, "altText", e.target.value)
                        }
                        disabled={loading}
                        className="text-sm"
                      />
                    </div>
                  ))}

                  {images.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No images added yet</p>
                    </div>
                  )}
                </div>
              </CustomCardContent>
            </CustomCard>

            {/* Settings */}
            <CustomCard>
              <CustomCardContent className="pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Settings
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <CustomLabel htmlFor="status">Status</CustomLabel>
                    <select
                      id="status"
                      name="status"
                      value={formValues.status}
                      onChange={handleInputChange}
                      disabled={loading}
                      className={cn(
                        "flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors",
                        "bg-white text-gray-900 border-gray-300",
                        "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                        "focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400"
                      )}
                    >
                      {PRODUCT_STATUSES.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <CustomLabel htmlFor="featured">Featured</CustomLabel>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        id="featured"
                        name="featured"
                        checked={formValues.featured}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <CustomLabel htmlFor="virtual">Virtual</CustomLabel>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        id="virtual"
                        name="virtual"
                        checked={formValues.virtual}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <CustomLabel htmlFor="downloadable">
                      Downloadable
                    </CustomLabel>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        id="downloadable"
                        name="downloadable"
                        checked={formValues.downloadable}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <CustomLabel htmlFor="reviewsAllowed">
                      Enable reviews
                    </CustomLabel>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        id="reviewsAllowed"
                        name="reviewsAllowed"
                        checked={formValues.reviewsAllowed}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </CustomCardContent>
            </CustomCard>

            {/* Categories */}
            <CustomCard>
              <CustomCardContent className="pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Categories
                </h3>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={categoryIds.includes(category.id)}
                        onChange={() => handleCategoryToggle(category.id)}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                      <span className="text-sm">{category.name}</span>
                    </label>
                  ))}

                  {categories.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No categories available
                    </p>
                  )}
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
                        {isEditMode ? "Update Product" : "Create Product"}
                      </>
                    )}
                  </CustomButton>

                  <CustomButton
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push("/dashboard/products")}
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
