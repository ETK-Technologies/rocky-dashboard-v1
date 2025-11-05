"use client";

import { useState, useEffect, useRef } from "react";
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
  SingleImageUpload,
  MultiImageUpload,
} from "@/components/ui";
import { useProductForm } from "../hooks/useProductForm";
import { useCategories } from "@/features/categories/hooks/useCategories";
import {
  useGlobalAttributes,
  useProductGlobalAttributes,
} from "@/features/attributes";
import { cn } from "@/utils/cn";
import { toast } from "react-toastify";
import { Globe } from "lucide-react";
import { productGlobalAttributeService } from "@/features/attributes/services/productGlobalAttributeService";
import { productAttributeService } from "@/features/products/services/productAttributeService";

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
  const { attributes: globalAttributes, loading: globalAttributesLoading } =
    useGlobalAttributes({ autoFetch: true });

  // For editing: fetch existing product global attributes
  const {
    attributes: fetchedProductGlobalAttributes,
    refetch: refetchProductGlobalAttributes,
  } = useProductGlobalAttributes(isEditMode ? productId : null);

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

  const [featuredImage, setFeaturedImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [attributes, setAttributes] = useState([]); // For variable products variant generation
  const [productGlobalAttributes, setProductGlobalAttributes] = useState([]); // Selected global attributes with values
  const [variants, setVariants] = useState([]);
  const [categoryIds, setCategoryIds] = useState([]);
  const [metadata, setMetadata] = useState([]);
  const [errors, setErrors] = useState({});

  // Ref to track if attributes have been loaded to prevent infinite loops
  const attributesLoadedRef = useRef(false);
  const inlineAttributesLoadedRef = useRef(false);

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

      // Handle images - if it's an array, first image is featured, rest are gallery
      if (productData.images && Array.isArray(productData.images)) {
        if (productData.images.length > 0) {
          const firstImage = productData.images[0];
          setFeaturedImage(
            typeof firstImage === "string" ? firstImage : firstImage.url
          );
          if (productData.images.length > 1) {
            setGalleryImages(
              productData.images
                .slice(1)
                .map((img) => (typeof img === "string" ? img : img.url))
            );
          }
        }
      }
      // Load inline attributes from productData (may be incomplete)
      // We'll fetch them separately via the dedicated endpoint to ensure completeness
      if (productData.attributes && !inlineAttributesLoadedRef.current) {
        setAttributes(productData.attributes);
      }

      // Note: Global attributes will be loaded separately via useProductGlobalAttributes hook
      // and merged into the display when they're fetched

      if (productData.variants) setVariants(productData.variants);

      // Handle categories - API returns categories array with categoryId field
      if (productData.categories && Array.isArray(productData.categories)) {
        setCategoryIds(productData.categories.map((c) => c.categoryId));
      } else if (productData.categoryIds) {
        setCategoryIds(productData.categoryIds);
      }

      if (productData.metadata) setMetadata(productData.metadata);
    }
  }, [productData, isEditMode]);

  // Reset attributes loaded flags when productId changes
  useEffect(() => {
    attributesLoadedRef.current = false;
    inlineAttributesLoadedRef.current = false;
  }, [productId]);

  // Fetch inline attributes separately when editing (more reliable than relying on productData.attributes)
  useEffect(() => {
    if (isEditMode && productId && !inlineAttributesLoadedRef.current) {
      const fetchInlineAttributes = async () => {
        try {
          const fetchedAttributes = await productAttributeService.getAll(
            productId
          );
          if (
            Array.isArray(fetchedAttributes) &&
            fetchedAttributes.length > 0
          ) {
            setAttributes(fetchedAttributes);
          }
          inlineAttributesLoadedRef.current = true;
        } catch (error) {
          console.error("Failed to fetch inline attributes:", error);
          // Don't show error toast as it's not critical - productData.attributes is fallback
        }
      };
      fetchInlineAttributes();
    }
  }, [isEditMode, productId]);

  // Load product global attributes when productId changes (edit mode)
  useEffect(() => {
    if (isEditMode && productId) {
      // Reset flag when productId changes
      attributesLoadedRef.current = false;
      refetchProductGlobalAttributes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, productId]);

  // Load product global attributes when they're fetched
  useEffect(() => {
    if (isEditMode && Array.isArray(fetchedProductGlobalAttributes)) {
      // Always update when we have fresh data from the API
      const newAttributes = fetchedProductGlobalAttributes.map((attr) => ({
        globalAttributeId: attr.globalAttributeId,
        globalAttribute: attr.globalAttribute || {},
        value: attr.value || "",
        position: attr.position || 0,
        visible: attr.visible !== undefined ? attr.visible : true,
        variation: attr.variation !== undefined ? attr.variation : false,
      }));

      // Compare JSON strings to detect any changes (IDs, values, or count)
      const currentData = JSON.stringify(
        productGlobalAttributes
          .map((a) => ({
            id: a.globalAttributeId,
            value: a.value,
          }))
          .sort((a, b) => a.id.localeCompare(b.id))
      );
      const newData = JSON.stringify(
        newAttributes
          .map((a) => ({
            id: a.globalAttributeId,
            value: a.value,
          }))
          .sort((a, b) => a.id.localeCompare(b.id))
      );

      // Update if data has changed or if this is the initial load
      if (currentData !== newData || !attributesLoadedRef.current) {
        setProductGlobalAttributes(newAttributes);
        attributesLoadedRef.current = true;

        // Also merge global attributes (used for variations) into the attributes array
        // so they appear in the variant attributes section when editing
        if (
          isEditMode &&
          (formValues.type === "VARIABLE" ||
            formValues.type === "VARIABLE_SUBSCRIPTION")
        ) {
          setAttributes((prevAttributes) => {
            // Get existing attributes that aren't from global attributes
            const globalAttrNames = newAttributes
              .filter((attr) => attr.variation)
              .map((attr) => (attr.globalAttribute?.name || "").toLowerCase());

            const existingNonGlobal = prevAttributes.filter(
              (attr) =>
                !globalAttrNames.includes(attr.name?.toLowerCase() || "")
            );

            // Add global attributes that are used for variations
            const globalAttrsForVariants = newAttributes
              .filter(
                (attr) => attr.variation && attr.value && attr.value.trim()
              )
              .map((attr) => {
                const globalAttr = attr.globalAttribute || {};
                return {
                  name: globalAttr.name || "",
                  value: attr.value.trim(),
                  slug:
                    globalAttr.slug ||
                    globalAttr.name?.toLowerCase().replace(/\s+/g, "-") ||
                    "",
                  position: attr.position || 0,
                  visible: attr.visible !== undefined ? attr.visible : true,
                  variation: true,
                };
              });

            // Combine, ensuring no duplicates
            const combined = [...existingNonGlobal];
            globalAttrsForVariants.forEach((globalAttr) => {
              if (
                !combined.some(
                  (a) =>
                    a.name?.toLowerCase() === globalAttr.name?.toLowerCase()
                )
              ) {
                combined.push(globalAttr);
              }
            });

            return combined;
          });
        }
      }
    } else if (isEditMode && fetchedProductGlobalAttributes === null) {
      // If explicitly null (no attributes), clear the list
      if (productGlobalAttributes.length > 0) {
        setProductGlobalAttributes([]);
      }
      attributesLoadedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedProductGlobalAttributes, isEditMode, formValues.type]);

  // Add global attribute to product
  const handleAddGlobalAttribute = (globalAttributeId) => {
    const globalAttr = globalAttributes.find(
      (ga) => ga.id === globalAttributeId
    );
    if (!globalAttr) {
      toast.error("Attribute not found");
      return;
    }

    // Check if already added
    if (
      productGlobalAttributes.some(
        (pga) => pga.globalAttributeId === globalAttributeId
      )
    ) {
      toast.error("This attribute is already added");
      return;
    }

    setProductGlobalAttributes((prev) => [
      ...prev,
      {
        globalAttributeId: globalAttributeId,
        globalAttribute: globalAttr,
        value: "",
        position: prev.length,
        visible: true,
        variation: globalAttr.variation || false,
      },
    ]);

    toast.success(`${globalAttr.name} added successfully`);
  };

  // Update global attribute value
  const handleUpdateGlobalAttribute = (index, field, value) => {
    setProductGlobalAttributes((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Remove global attribute
  const handleRemoveGlobalAttribute = (index) => {
    setProductGlobalAttributes((prev) => prev.filter((_, i) => i !== index));
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

  // Image handlers - now using separate featured and gallery images

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

  // Add global attribute to variant attributes list
  const handleAddGlobalToVariants = (globalAttrIndex) => {
    const globalAttr = productGlobalAttributes[globalAttrIndex];
    if (!globalAttr || !globalAttr.value || !globalAttr.value.trim()) {
      toast.error("Please enter a value for the attribute first");
      return;
    }

    const globalAttributeDef = globalAttr.globalAttribute || {};
    const attributeName = globalAttributeDef.name || "";
    const attributeValue = globalAttr.value.trim();

    // Check if attribute with same name already exists in variant attributes
    const existingIndex = attributes.findIndex(
      (attr) => attr.name.toLowerCase() === attributeName.toLowerCase()
    );

    if (existingIndex >= 0) {
      // Merge values if attribute already exists
      const existing = attributes[existingIndex];
      const existingValues = existing.value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
      const newValues = attributeValue
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
      const combinedValues = [...new Set([...existingValues, ...newValues])];

      updateAttribute(existingIndex, "value", combinedValues.join(", "));
      toast.success(`Updated "${attributeName}" with new values`);
    } else {
      // Add new attribute to variant attributes
      setAttributes((prev) => [
        ...prev,
        {
          name: attributeName,
          value: attributeValue,
          slug:
            globalAttributeDef.slug ||
            attributeName.toLowerCase().replace(/\s+/g, "-"),
          position: prev.length,
          visible: globalAttr.visible !== undefined ? globalAttr.visible : true,
          variation: true,
        },
      ]);
      toast.success(`Added "${attributeName}" to variant attributes`);
    }
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

      // Combine featured image and gallery images
      const allImages = [];
      if (featuredImage) {
        allImages.push({ url: featuredImage, altText: "", sortOrder: 0 });
      }
      galleryImages.forEach((url, index) => {
        allImages.push({ url, altText: "", sortOrder: index + 1 });
      });
      if (allImages.length > 0) {
        submitData.images = allImages;
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
        // Clean attributes - only include allowed properties
        const inlineAttributes = attributes
          .filter((attr) => attr.name && attr.value)
          .map((attr) => ({
            name: attr.name,
            value: attr.value,
            slug: attr.slug || attr.name.toLowerCase().replace(/\s+/g, "-"),
            position: attr.position || 0,
            visible: attr.visible !== undefined ? attr.visible : true,
            variation: attr.variation !== undefined ? attr.variation : false,
          }));

        // Merge global attributes (that are used for variations) into attributes array
        console.log("🔍 Product Global Attributes:", productGlobalAttributes);
        const globalAttributesForVariants = productGlobalAttributes
          .filter((attr) => {
            const hasVariation = attr.variation === true;
            const hasValue = attr.value && attr.value.trim();
            console.log(
              `  - ${attr.globalAttribute?.name || "Unknown"}: variation=${
                attr.variation
              }, value=${attr.value}, included=${hasVariation && hasValue}`
            );
            return hasVariation && hasValue;
          })
          .map((attr) => {
            const globalAttr = attr.globalAttribute || {};
            // Generate slug from name (not from global attribute slug which might be outdated)
            const attributeName = globalAttr.name || "";
            const slug = attributeName.toLowerCase().replace(/\s+/g, "-");
            return {
              name: attributeName,
              value: attr.value.trim(),
              slug: slug,
              position: attr.position || 0,
              visible: attr.visible !== undefined ? attr.visible : true,
              variation: true,
            };
          });

        // Combine inline and global attributes, handling duplicates intelligently
        const allAttributes = [...inlineAttributes];
        globalAttributesForVariants.forEach((globalAttr) => {
          // Check if attribute with same name already exists
          const existingIndex = allAttributes.findIndex(
            (a) => a.name.toLowerCase() === globalAttr.name.toLowerCase()
          );

          if (existingIndex >= 0) {
            // If exists, merge values (combine comma-separated values)
            const existing = allAttributes[existingIndex];
            const existingValues = existing.value
              .split(",")
              .map((v) => v.trim())
              .filter(Boolean);
            const newValues = globalAttr.value
              .split(",")
              .map((v) => v.trim())
              .filter(Boolean);
            const combinedValues = [
              ...new Set([...existingValues, ...newValues]),
            ];
            allAttributes[existingIndex] = {
              ...existing,
              value: combinedValues.join(", "),
              variation: true, // Ensure variation is true if global attribute has it
            };
          } else {
            // If doesn't exist, add it
            allAttributes.push(globalAttr);
          }
        });

        submitData.attributes = allAttributes;

        // Debug log to verify attributes are being merged
        console.log("📦 Merged attributes for submission:", {
          inline: inlineAttributes.length,
          global: globalAttributesForVariants.length,
          total: allAttributes.length,
          attributes: allAttributes,
        });

        // Ensure attributes array is always sent (even if empty for variable products)
        if (
          (formValues.type === "VARIABLE" ||
            formValues.type === "VARIABLE_SUBSCRIPTION") &&
          (!submitData.attributes || submitData.attributes.length === 0)
        ) {
          console.warn("⚠️ No attributes found for variable product!");
        }

        // Clean variants - only include allowed properties
        submitData.variants = variants
          .filter((variant) => variant.name)
          .map((variant) => {
            const cleaned = {
              name: variant.name,
            };

            if (variant.sku) cleaned.sku = variant.sku;
            if (variant.price) cleaned.price = parseFloat(variant.price);
            if (variant.salePrice)
              cleaned.salePrice = parseFloat(variant.salePrice);
            if (variant.stockQuantity !== undefined)
              cleaned.stockQuantity = parseInt(variant.stockQuantity) || 0;
            if (variant.manageStock !== undefined)
              cleaned.manageStock = variant.manageStock;
            if (variant.imageUrl) cleaned.imageUrl = variant.imageUrl;

            // Subscription fields for variable subscription products
            if (formValues.type === "VARIABLE_SUBSCRIPTION") {
              if (variant.subscriptionPeriod)
                cleaned.subscriptionPeriod = variant.subscriptionPeriod;
              if (variant.subscriptionInterval !== undefined)
                cleaned.subscriptionInterval =
                  parseInt(variant.subscriptionInterval) || 1;
              if (variant.subscriptionLength !== undefined)
                cleaned.subscriptionLength =
                  parseInt(variant.subscriptionLength) || 0;
              if (variant.subscriptionSignUpFee !== undefined)
                cleaned.subscriptionSignUpFee =
                  parseFloat(variant.subscriptionSignUpFee) || 0;
              if (variant.subscriptionTrialLength !== undefined)
                cleaned.subscriptionTrialLength =
                  parseInt(variant.subscriptionTrialLength) || 0;
              if (variant.subscriptionTrialPeriod)
                cleaned.subscriptionTrialPeriod =
                  variant.subscriptionTrialPeriod;
            }

            // Only include attributes if they exist and are valid
            if (
              variant.attributes &&
              Array.isArray(variant.attributes) &&
              variant.attributes.length > 0
            ) {
              // Parse variant name to extract attribute values
              // Format: "color: red | size: xl | heelo: lool | material: coton"
              const variantNameParts = variant.name
                .split("|")
                .map((part) => part.trim())
                .filter(Boolean);

              cleaned.attributes = variant.attributes.map((attr) => {
                // Find the value for this attribute from the variant name
                const attrPart = variantNameParts.find((part) =>
                  part.toLowerCase().startsWith(attr.name.toLowerCase() + ":")
                );

                let value = "";
                if (attrPart) {
                  // Extract value after the colon
                  const colonIndex = attrPart.indexOf(":");
                  if (colonIndex >= 0) {
                    value = attrPart.substring(colonIndex + 1).trim();
                  }
                } else if (attr.value) {
                  // Fallback to attr.value if available
                  value = attr.value;
                }

                return {
                  name: attr.name,
                  value: value || attr.name, // Fallback to name if no value found
                };
              });
            }

            return cleaned;
          });
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

      const savedProduct = await submitForm(submitData);

      // After product is saved, we need to:
      // 1. Save attributes via the separate attributes endpoint (if variable product)
      // 2. Assign/update global attributes via global attributes endpoint
      // Note: savedProduct might be undefined if redirect happens before return
      // So we use productId for edit mode or savedProduct.id if available
      const productIdToUse = isEditMode ? productId : savedProduct?.id;

      if (productIdToUse) {
        // Save inline attributes via the separate attributes endpoint
        // This ensures all attributes (including merged global ones) are saved
        if (
          formValues.type === "VARIABLE" ||
          formValues.type === "VARIABLE_SUBSCRIPTION"
        ) {
          try {
            if (isEditMode) {
              // In edit mode: First, fetch current attributes to determine what to delete
              const currentInlineAttributes =
                await productAttributeService.getAll(productIdToUse);
              const currentAttributeNames = (currentInlineAttributes || []).map(
                (a) => a.name?.toLowerCase()
              );
              const newAttributeNames = (submitData.attributes || []).map((a) =>
                a.name?.toLowerCase()
              );

              // Delete attributes that were removed
              const attributesToDelete = currentAttributeNames.filter(
                (name) => !newAttributeNames.includes(name)
              );
              for (const attributeName of attributesToDelete) {
                try {
                  // Find the original name (preserving case)
                  const originalAttr = currentInlineAttributes.find(
                    (a) => a.name?.toLowerCase() === attributeName
                  );
                  if (originalAttr?.name) {
                    await productAttributeService.delete(
                      productIdToUse,
                      originalAttr.name
                    );
                    console.log(`🗑️ Deleted attribute: ${originalAttr.name}`);
                  }
                } catch (deleteError) {
                  console.error(
                    `Failed to delete attribute ${attributeName}:`,
                    deleteError
                  );
                  // Continue with other deletions
                }
              }
            }

            // Upsert remaining/new attributes
            if (submitData.attributes && submitData.attributes.length > 0) {
              console.log(
                "💾 Saving attributes via attributes endpoint:",
                submitData.attributes
              );
              await productAttributeService.upsert(
                productIdToUse,
                submitData.attributes
              );
              console.log("✅ Attributes saved successfully");
            } else if (isEditMode) {
              // If no attributes left and we're in edit mode, attributes were all deleted
              // (handled above in the deletion loop)
              console.log("✅ All attributes removed");
            }
          } catch (error) {
            console.error("Failed to save attributes:", error);
            toast.error("Product saved but failed to save some attributes");
          }
        }
        try {
          // Prepare attributes to assign (only those with values)
          const attributesToAssign = productGlobalAttributes
            .filter((attr) => attr.value && attr.value.trim())
            .map((attr) => ({
              globalAttributeId: attr.globalAttributeId,
              value: attr.value.trim(),
              position: attr.position,
              visible: attr.visible,
              variation: attr.variation,
            }));

          if (isEditMode) {
            // For updates: Get current attributes and determine what to remove/add
            const currentAttributes = fetchedProductGlobalAttributes || [];
            const currentIds = currentAttributes.map(
              (a) => a.globalAttributeId
            );
            const newIds = attributesToAssign.map((a) => a.globalAttributeId);

            // Remove attributes that are no longer in the list
            const toRemove = currentIds.filter((id) => !newIds.includes(id));
            for (const globalAttributeId of toRemove) {
              try {
                await productGlobalAttributeService.remove(
                  productIdToUse,
                  globalAttributeId
                );
              } catch (error) {
                console.error(
                  `Failed to remove attribute ${globalAttributeId}:`,
                  error
                );
              }
            }

            // Assign/update all attributes (bulkAssign will update existing ones)
            if (attributesToAssign.length > 0) {
              await productGlobalAttributeService.bulkAssign(productIdToUse, {
                attributes: attributesToAssign,
              });
            }

            // Refetch product global attributes to sync with backend after save
            await refetchProductGlobalAttributes();
            // Reset the loaded flag so attributes reload properly
            attributesLoadedRef.current = false;
          } else {
            // For new products: Just assign all attributes
            if (attributesToAssign.length > 0) {
              await productGlobalAttributeService.bulkAssign(productIdToUse, {
                attributes: attributesToAssign,
              });
            }
          }
        } catch (error) {
          console.error("Failed to assign global attributes:", error);
          toast.error("Product saved but failed to assign some attributes");
        }
      }

      // Redirect to products list after everything is saved
      router.push("/dashboard/products");
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

            {/* Global Attributes */}
            <CustomCard>
              <CustomCardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    Global Attributes
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* Add Global Attribute */}
                  <div className="space-y-2">
                    <CustomLabel>Add Global Attribute</CustomLabel>
                    <div className="flex gap-2">
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddGlobalAttribute(e.target.value);
                            e.target.value = "";
                          }
                        }}
                        disabled={loading || globalAttributesLoading}
                        className={cn(
                          "flex-1 h-10 rounded-md border px-3 py-2 text-sm transition-colors",
                          "bg-white text-gray-900 border-gray-300",
                          "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                          "focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400",
                          "disabled:cursor-not-allowed disabled:opacity-50"
                        )}
                      >
                        <option value="">Select a global attribute...</option>
                        {globalAttributes
                          .filter(
                            (ga) =>
                              !productGlobalAttributes.some(
                                (pga) => pga.globalAttributeId === ga.id
                              )
                          )
                          .map((attr) => (
                            <option key={attr.id} value={attr.id}>
                              {attr.name}
                              {attr.description && ` - ${attr.description}`}
                            </option>
                          ))}
                      </select>
                    </div>
                    {globalAttributes.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No global attributes available. Go to Global Attributes
                        page to create one.
                      </p>
                    )}
                  </div>

                  {/* Selected Global Attributes */}
                  <div className="space-y-3">
                    <CustomLabel>Assigned Attributes</CustomLabel>
                    {productGlobalAttributes.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        No attributes assigned yet. Select an attribute from the
                        dropdown above.
                      </p>
                    ) : (
                      productGlobalAttributes.map((attr, index) => {
                        const globalAttr = attr.globalAttribute || {};
                        return (
                          <div
                            key={`${attr.globalAttributeId}-${index}`}
                            className="p-3 border border-border rounded-lg space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {globalAttr.name || "Unknown"}
                                </span>
                                {globalAttr.description && (
                                  <span className="text-xs text-muted-foreground">
                                    ({globalAttr.description})
                                  </span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveGlobalAttribute(index)
                                }
                                disabled={loading}
                                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            <CustomInput
                              placeholder={`Enter value for ${globalAttr.name}`}
                              value={attr.value}
                              onChange={(e) =>
                                handleUpdateGlobalAttribute(
                                  index,
                                  "value",
                                  e.target.value
                                )
                              }
                              disabled={loading}
                            />
                            <div className="flex items-center gap-4 text-sm">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={attr.visible}
                                  onChange={(e) =>
                                    handleUpdateGlobalAttribute(
                                      index,
                                      "visible",
                                      e.target.checked
                                    )
                                  }
                                  className="h-4 w-4 rounded border-gray-300"
                                  disabled={loading}
                                />
                                <span>Visible</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={attr.variation}
                                  onChange={(e) =>
                                    handleUpdateGlobalAttribute(
                                      index,
                                      "variation",
                                      e.target.checked
                                    )
                                  }
                                  className="h-4 w-4 rounded border-gray-300"
                                  disabled={loading}
                                />
                                <span>Used for Variations</span>
                              </label>
                            </div>
                            {isVariableProduct &&
                              attr.variation &&
                              attr.value &&
                              attr.value.trim() && (
                                <div className="mt-2">
                                  <CustomButton
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleAddGlobalToVariants(index)
                                    }
                                    disabled={loading}
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add to Variant Attributes
                                  </CustomButton>
                                </div>
                              )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </CustomCardContent>
            </CustomCard>

            {/* Attributes (for variable products variant generation) */}
            {isVariableProduct && (
              <CustomCard>
                <CustomCardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">
                      Variant Attributes (for variant generation)
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
                      {isVariableProduct && (
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
                                  .split(/[,|/]+/)
                                  .map((v) => v.trim())
                                  .filter(Boolean),
                              }))
                              .filter((a) => a.values.length > 0);

                            if (parsed.length === 0) return;

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

                            const valueLists = cleaned.map((p) => p.values);
                            const combos = valueLists.reduce(
                              (acc, vals) =>
                                acc.flatMap((a) => vals.map((v) => [...a, v])),
                              [[]]
                            );

                            // Generate variants - include subscription fields only for VARIABLE_SUBSCRIPTION
                            const newVariants = combos.map((values, idx) => {
                              const baseVariant = {
                                name: values
                                  .map((v, i) => `${cleaned[i].name}: ${v}`)
                                  .join(" | "),
                                sku: "",
                                price: "",
                                salePrice: "",
                                manageStock: true,
                                stockQuantity: 0,
                                attributes: cleaned.map((p) => ({
                                  name: p.name,
                                })),
                              };

                              // Add subscription fields only for VARIABLE_SUBSCRIPTION
                              if (isVariableSubscription) {
                                baseVariant.subscriptionPeriod =
                                  formValues.subscriptionPeriod;
                                baseVariant.subscriptionInterval = 1;
                                baseVariant.subscriptionLength = 0;
                                baseVariant.subscriptionSignUpFee = "0";
                                baseVariant.subscriptionTrialLength = 0;
                                baseVariant.subscriptionTrialPeriod =
                                  formValues.subscriptionTrialPeriod;
                              }

                              return baseVariant;
                            });

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
                            placeholder="Attribute name (e.g., Size, Color)"
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
            {/* Featured Image */}
            <CustomCard>
              <CustomCardContent className="pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Featured Image
                </h3>
                <SingleImageUpload
                  value={featuredImage}
                  onChange={setFeaturedImage}
                />
              </CustomCardContent>
            </CustomCard>

            {/* Gallery Images */}
            <CustomCard>
              <CustomCardContent className="pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Gallery Images
                </h3>
                <MultiImageUpload
                  value={galleryImages}
                  onChange={setGalleryImages}
                  maxImages={20}
                  helperText="Upload multiple images for the product gallery"
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
            <CustomCard className="md:sticky md:top-4">
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
