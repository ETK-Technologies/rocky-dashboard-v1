"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  X,
  Info,
  PackageCheck,
  Truck,
  Tag,
  GitBranch,
  Settings,
  Repeat,
  FileText,
  ChevronDown,
} from "lucide-react";
import {
  CustomButton,
  PageContainer,
  PageHeader,
  CustomCard,
  CustomCardContent,
  CustomCardHeader,
  CustomCardTitle,
  FormField,
  CustomLabel,
  CustomInput,
  LoadingState,
  SingleImageUpload,
  MultiImageUpload,
  TagsSelector,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui";
import { useProductForm } from "../hooks/useProductForm";
import { useCategories } from "@/features/categories/hooks/useCategories";
import {
  useGlobalAttributes,
  useProductGlobalAttributes,
} from "@/features/attributes";
import { cn } from "@/utils/cn";
import { generateSlug } from "@/utils/generateSlug";
import { toast } from "react-toastify";
import { Globe } from "lucide-react";
import { productGlobalAttributeService } from "@/features/attributes/services/productGlobalAttributeService";
import { productAttributeService } from "@/features/products/services/productAttributeService";
import { tagService } from "@/features/products/services/tagService";
import Image from "next/image";

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

const TAX_CLASSES = [
  { value: "standard", label: "Standard" },
  { value: "reduced-rate", label: "Reduced rate" },
  { value: "zero-rate", label: "Zero rate" },
];

const BACKORDER_OPTIONS = [
  { value: "NO", label: "Do not allow" },
  { value: "NOTIFY", label: "Allow, but notify customer" },
  { value: "YES", label: "Allow" },
];

const parseAttributeValues = (value) =>
  value
    ? value
        .split(/[,|/]+/)
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

const formatAttributeValues = (values) =>
  values.length > 0 ? values.join(", ") : "";

const AttributeValuesEditor = ({
  id,
  label,
  value,
  onChange,
  disabled = false,
  placeholder = "Type a value and press Enter",
  helperText,
}) => {
  const [inputValue, setInputValue] = useState("");
  const values = parseAttributeValues(value);

  const addValue = (rawValue) => {
    const nextValue = rawValue.trim();

    if (!nextValue) {
      setInputValue("");
      return;
    }

    const exists = values.some(
      (existing) => existing.toLowerCase() === nextValue.toLowerCase()
    );

    if (exists) {
      setInputValue("");
      return;
    }

    onChange(formatAttributeValues([...values, nextValue]));
    setInputValue("");
  };

  const removeValue = (valueToRemove) => {
    const updatedValues = values.filter(
      (existing) => existing.toLowerCase() !== valueToRemove.toLowerCase()
    );
    onChange(formatAttributeValues(updatedValues));
  };

  const handleKeyDown = (event) => {
    if (disabled) return;

    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addValue(inputValue);
      return;
    }

    if (event.key === "Tab") {
      if (inputValue.trim()) {
        event.preventDefault();
        addValue(inputValue);
      }
      return;
    }

    if (event.key === "Backspace" && inputValue === "" && values.length > 0) {
      event.preventDefault();
      const updated = values.slice(0, -1);
      onChange(formatAttributeValues(updated));
    }
  };

  const handleBlur = () => {
    if (disabled) return;
    addValue(inputValue);
  };

  return (
    <div className="space-y-2">
      {label && <CustomLabel htmlFor={id}>{label}</CustomLabel>}

      <div
        className={cn(
          "flex flex-wrap items-center gap-2 rounded-md border px-3 py-2 transition-colors",
          "bg-white text-foreground border-gray-200",
          "dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700",
          disabled && "cursor-not-allowed opacity-60"
        )}
      >
        {values.map((item) => (
          <span
            key={`${item}`}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-foreground transition-colors dark:bg-gray-800/80"
          >
            <span>{item}</span>
            {!disabled && (
              <button
                type="button"
                onClick={() => removeValue(item)}
                className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 dark:hover:bg-gray-700"
                aria-label={`Remove ${item}`}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}

        <input
          id={id}
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={values.length === 0 ? placeholder : "Add another value"}
          className={cn(
            " min-w-[150px] rounded-md border border-dashed border-border bg-background px-2 py-1 text-sm outline-none transition-colors",
            "focus-visible:border-foreground focus-visible:ring-0",
            "dark:bg-gray-900/80 dark:focus-visible:border-gray-100",
            disabled && "cursor-not-allowed bg-muted text-muted-foreground"
          )}
          disabled={disabled}
        />
      </div>

      {helperText && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
};

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
    minCartQty: null,
    maxCartQty: null,
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
  const [selectedTags, setSelectedTags] = useState([]); // Selected tags [{ id, name, slug }]
  const [attributes, setAttributes] = useState([]); // Product attributes (for all products, used for variant generation in variable products)
  const [productGlobalAttributes, setProductGlobalAttributes] = useState([]); // Selected global attributes with values
  const [variants, setVariants] = useState([]);
  const [categoryIds, setCategoryIds] = useState([]);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [metadata, setMetadata] = useState([]);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("basic");
  const categoryDropdownRef = useRef(null);

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
        minCartQty: productData.minCartQty ?? null,
        maxCartQty: productData.maxCartQty ?? null,
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

      // Handle images - check featured property, otherwise use first image as featured
      if (productData.images && Array.isArray(productData.images)) {
        const featuredImg = productData.images.find(
          (img) => (typeof img === "object" ? img.featured : false) || false
        );
        const galleryImgs = productData.images.filter(
          (img) => !(typeof img === "object" ? img.featured : false)
        );

        // Set Product image (use found Product image or first image)
        if (featuredImg) {
          setFeaturedImage(
            typeof featuredImg === "string" ? featuredImg : featuredImg.url
          );
        } else if (productData.images.length > 0) {
          // Fallback to first image if no Product image is set
          const firstImage = productData.images[0];
          setFeaturedImage(
            typeof firstImage === "string" ? firstImage : firstImage.url
          );
        }

        // Set Product gallery (all non-Product images)
        if (galleryImgs.length > 0) {
          setGalleryImages(
            galleryImgs.map((img) => (typeof img === "string" ? img : img.url))
          );
        } else if (featuredImg && productData.images.length > 1) {
          // If we found a Product image, use the rest as gallery
          setGalleryImages(
            productData.images
              .filter((img) => {
                const imgUrl = typeof img === "string" ? img : img.url;
                const featuredUrl =
                  typeof featuredImg === "string"
                    ? featuredImg
                    : featuredImg.url;
                return imgUrl !== featuredUrl;
              })
              .map((img) => (typeof img === "string" ? img : img.url))
          );
        }
      }

      // Load tags from productData
      if (productData.tags && Array.isArray(productData.tags)) {
        // Tags might be in format [{ tag: { id, name, slug } }] or [{ id, name, slug }]
        const tags = productData.tags.map((tagItem) => {
          if (tagItem.tag) {
            return tagItem.tag;
          }
          return tagItem;
        });
        setSelectedTags(tags);
      }

      // Load inline attributes from productData (may be incomplete)
      // We'll fetch them separately via the dedicated endpoint to ensure completeness
      if (productData.attributes && !inlineAttributesLoadedRef.current) {
        setAttributes(productData.attributes);
      }

      // Note: Global attributes will be loaded separately via useProductGlobalAttributes hook
      // and merged into the display when they're fetched

      if (productData.variants) {
        // Parse variant names to extract attribute selections
        const parsedVariants = productData.variants.map((variant) => {
          const parsed = { ...variant };

          // First try to get from variant.attributes array (preferred)
          if (
            variant.attributes &&
            Array.isArray(variant.attributes) &&
            variant.attributes.length > 0
          ) {
            // Get first attribute
            if (variant.attributes[0]) {
              parsed.attribute1Name = variant.attributes[0].name || "";
              parsed.attribute1Value = variant.attributes[0].value || "";
            }
            // Get second attribute
            if (variant.attributes[1]) {
              parsed.attribute2Name = variant.attributes[1].name || "";
              parsed.attribute2Value = variant.attributes[1].value || "";
            }
          } else if (variant.name) {
            // Fallback: Parse variant name format: "Attribute1: Value1 | Attribute2: Value2"
            const parts = variant.name
              .split("|")
              .map((part) => part.trim())
              .filter(Boolean);

            if (parts.length > 0) {
              const part1 = parts[0];
              const colonIndex1 = part1.indexOf(":");
              if (colonIndex1 >= 0) {
                parsed.attribute1Name = part1.substring(0, colonIndex1).trim();
                parsed.attribute1Value = part1
                  .substring(colonIndex1 + 1)
                  .trim();
              }

              if (parts.length > 1) {
                const part2 = parts[1];
                const colonIndex2 = part2.indexOf(":");
                if (colonIndex2 >= 0) {
                  parsed.attribute2Name = part2
                    .substring(0, colonIndex2)
                    .trim();
                  parsed.attribute2Value = part2
                    .substring(colonIndex2 + 1)
                    .trim();
                }
              }
            }
          }

          // Ensure default values for settings
          if (!parsed.status) parsed.status = "DRAFT";
          if (parsed.featured === undefined) parsed.featured = false;
          if (parsed.virtual === undefined) parsed.virtual = false;
          if (parsed.downloadable === undefined) parsed.downloadable = false;
          if (parsed.reviewsAllowed === undefined) parsed.reviewsAllowed = true;

          return parsed;
        });

        setVariants(parsedVariants);
      }

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

    // Removed toast - attribute is added silently
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

  const handleCategoryToggle = (categoryId) => {
    setCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const closeCategoryDropdown = () => setCategoryDropdownOpen(false);
  const toggleCategoryDropdown = () => setCategoryDropdownOpen((prev) => !prev);

  useEffect(() => {
    if (!categoryDropdownOpen) {
      return;
    }

    const handleClickOutside = (event) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target)
      ) {
        setCategoryDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setCategoryDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [categoryDropdownOpen]);

  // Image handlers - now using separate featured and Product gallery

  const addAttribute = () => {
    setAttributes((prev) => [
      ...prev,
      { name: "", value: "", visible: true, variation: false },
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
        // Per-variant settings
        status: formValues.status || "DRAFT",
        featured: false,
        virtual: false,
        downloadable: false,
        reviewsAllowed: true,
        // For variant name selection
        attribute1Name: "",
        attribute1Value: "",
        attribute2Name: "",
        attribute2Value: "",
      },
    ]);
  };

  // Get variation attributes (those marked for variations)
  const getVariationAttributes = () => {
    const variationAttrs = [];

    // Get from inline attributes
    attributes
      .filter((attr) => attr.variation && attr.name && attr.value)
      .forEach((attr) => {
        const values = attr.value
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);
        if (values.length > 0) {
          variationAttrs.push({
            name: attr.name,
            values: values,
            source: "inline",
          });
        }
      });

    // Get from global attributes
    productGlobalAttributes
      .filter((attr) => attr.variation && attr.value)
      .forEach((attr) => {
        const globalAttr = attr.globalAttribute || {};
        const values = attr.value
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);
        if (values.length > 0) {
          variationAttrs.push({
            name: globalAttr.name || attr.name,
            values: values,
            source: "global",
          });
        }
      });

    // Merge attributes with same name
    const mergedMap = new Map();
    variationAttrs.forEach((attr) => {
      const key = attr.name.toLowerCase();
      if (!mergedMap.has(key)) {
        mergedMap.set(key, { name: attr.name, values: new Set() });
      }
      attr.values.forEach((v) => mergedMap.get(key).values.add(v));
    });

    return Array.from(mergedMap.values()).map((attr) => ({
      name: attr.name,
      values: Array.from(attr.values),
    }));
  };

  const updateVariant = (index, field, value) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // Auto-generate variant name when attribute selections change
      if (field.startsWith("attribute")) {
        const variant = updated[index];
        const parts = [];

        if (variant.attribute1Name && variant.attribute1Value) {
          parts.push(`${variant.attribute1Name}: ${variant.attribute1Value}`);
        }
        if (variant.attribute2Name && variant.attribute2Value) {
          parts.push(`${variant.attribute2Name}: ${variant.attribute2Value}`);
        }

        updated[index].name = parts.join(" | ");
      }

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

    // Only require base price for SIMPLE and SUBSCRIPTION products
    if (formValues.type === "SIMPLE" || formValues.type === "SUBSCRIPTION") {
      if (!formValues.basePrice || parseFloat(formValues.basePrice) <= 0) {
        newErrors.basePrice = "Valid base price is required";
      }
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
        minCartQty:
          formValues.minCartQty !== null &&
          formValues.minCartQty !== "" &&
          !isNaN(parseInt(formValues.minCartQty))
            ? parseInt(formValues.minCartQty)
            : null,
        maxCartQty:
          formValues.maxCartQty !== null &&
          formValues.maxCartQty !== "" &&
          !isNaN(parseInt(formValues.maxCartQty))
            ? parseInt(formValues.maxCartQty)
            : null,
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

      // Combine Product image and Product gallery with featured flag
      const allImages = [];
      if (featuredImage) {
        allImages.push({
          url: featuredImage,
          altText: "",
          sortOrder: 0,
          featured: true,
        });
      }
      galleryImages.forEach((url, index) => {
        allImages.push({
          url,
          altText: "",
          sortOrder: index + 1,
          featured: false,
        });
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

            // Per-variant settings
            if (variant.status) cleaned.status = variant.status;
            if (variant.featured !== undefined)
              cleaned.featured = variant.featured;
            if (variant.virtual !== undefined)
              cleaned.virtual = variant.virtual;
            if (variant.downloadable !== undefined)
              cleaned.downloadable = variant.downloadable;
            if (variant.reviewsAllowed !== undefined)
              cleaned.reviewsAllowed = variant.reviewsAllowed;

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

      // Attach tags to product
      if (productIdToUse && selectedTags.length > 0) {
        try {
          const tagIds = selectedTags.map((tag) => tag.id);
          await tagService.attachToProduct(productIdToUse, tagIds);
          console.log("✅ Tags attached successfully");
        } catch (error) {
          console.error("Failed to attach tags:", error);
          toast.error("Product saved but failed to attach tags");
        }
      } else if (productIdToUse && selectedTags.length === 0) {
        // If no tags selected, remove all tags by sending empty array
        try {
          await tagService.attachToProduct(productIdToUse, []);
          console.log("✅ Tags removed successfully");
        } catch (error) {
          console.error("Failed to remove tags:", error);
          // Don't show error for removing tags, it's not critical
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
  // Only show subscription tab for SUBSCRIPTION type, not VARIABLE_SUBSCRIPTION
  // (VARIABLE_SUBSCRIPTION subscription data is handled in variants)
  const hasSubscription = formValues.type === "SUBSCRIPTION";
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content with Tabs */}
          <div className="lg:col-span-3">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Sidebar - Tabs List */}
                <div className="lg:w-[200px] flex-shrink-0 lg:sticky lg:top-6 lg:self-start">
                  <TabsList
                    orientation="vertical"
                    className="w-full hidden lg:block"
                  >
                    <div className="flex flex-col gap-2 w-full">
                      <TabsTrigger value="basic" icon={Info}>
                        Basic Info
                      </TabsTrigger>
                      <TabsTrigger value="inventory" icon={PackageCheck}>
                        Inventory
                      </TabsTrigger>
                      <TabsTrigger value="shipping" icon={Truck}>
                        Shipping
                      </TabsTrigger>
                      <TabsTrigger value="attributes" icon={Tag}>
                        Attributes
                      </TabsTrigger>
                      {isVariableProduct && (
                        <TabsTrigger value="variants" icon={GitBranch}>
                          Variants
                        </TabsTrigger>
                      )}
                      {hasSubscription && (
                        <TabsTrigger value="subscription" icon={Repeat}>
                          Subscription
                        </TabsTrigger>
                      )}
                      <TabsTrigger value="additional" icon={FileText}>
                        Additional
                      </TabsTrigger>
                    </div>
                  </TabsList>
                  {/* Mobile: Horizontal tabs */}
                  <TabsList
                    orientation="horizontal"
                    className="w-full lg:hidden mb-4"
                  >
                    <div className="flex flex-row gap-2 w-full overflow-x-auto">
                      <TabsTrigger value="basic" icon={Info}>
                        Basic
                      </TabsTrigger>
                      <TabsTrigger value="inventory" icon={PackageCheck}>
                        Inventory
                      </TabsTrigger>
                      <TabsTrigger value="shipping" icon={Truck}>
                        Shipping
                      </TabsTrigger>
                      <TabsTrigger value="attributes" icon={Tag}>
                        Attributes
                      </TabsTrigger>
                      {isVariableProduct && (
                        <TabsTrigger value="variants" icon={GitBranch}>
                          Variants
                        </TabsTrigger>
                      )}
                      {hasSubscription && (
                        <TabsTrigger value="subscription" icon={Repeat}>
                          Subscription
                        </TabsTrigger>
                      )}
                      <TabsTrigger value="additional" icon={FileText}>
                        Additional
                      </TabsTrigger>
                    </div>
                  </TabsList>
                </div>

                {/* Tab Content */}
                <div className="flex-1 min-w-0">
                  {/* Basic Info & Product Type Tab */}
                  <TabsContent value="basic" className="space-y-6">
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
                            <CustomLabel htmlFor="description">
                              Description
                            </CustomLabel>
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

                    {/* Pricing - Only for SIMPLE products */}
                    {formValues.type === "SIMPLE" && (
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
                          </div>
                        </CustomCardContent>
                      </CustomCard>
                    )}

                    {/* Tax Settings - For all product types */}
                    <CustomCard>
                      <CustomCardContent className="pt-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4">
                          Tax Settings
                        </h3>

                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <CustomLabel htmlFor="taxStatus">
                                Tax Status
                              </CustomLabel>
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
                                  <option
                                    key={status.value}
                                    value={status.value}
                                  >
                                    {status.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-2">
                              <CustomLabel htmlFor="taxClass">
                                Tax Class
                              </CustomLabel>
                              <select
                                id="taxClass"
                                name="taxClass"
                                value={formValues.taxClass}
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
                                {TAX_CLASSES.map((taxClass) => (
                                  <option
                                    key={taxClass.value}
                                    value={taxClass.value}
                                  >
                                    {taxClass.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </CustomCardContent>
                    </CustomCard>

                    {/* Categories - For all product types */}
                    <CustomCard>
                      <CustomCardContent className="pt-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4">
                          Categories
                        </h3>

                        {categories.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-8">
                            No categories available
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {/* <CustomLabel htmlFor="productCategories">
                              Categories
                            </CustomLabel> */}
                            <div className="relative" ref={categoryDropdownRef}>
                              <button
                                type="button"
                                id="productCategories"
                                name="productCategories"
                                onClick={toggleCategoryDropdown}
                                disabled={loading}
                                className={cn(
                                  "flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors",
                                  "bg-white text-foreground border-gray-200",
                                  "dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700",
                                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                                  "focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400",
                                  loading && "cursor-not-allowed opacity-70"
                                )}
                                aria-haspopup="listbox"
                                aria-expanded={categoryDropdownOpen}
                              >
                                <span className="truncate text-left">
                                  {categoryIds.length === 0
                                    ? "Select categories"
                                    : categories
                                        .filter((category) =>
                                          categoryIds.includes(category.id)
                                        )
                                        .map((category) => category.name)
                                        .join(", ")}
                                </span>
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              </button>

                              {categoryDropdownOpen && (
                                <div
                                  className={cn(
                                    "absolute left-0 right-0 z-50 mt-2 max-h-64 overflow-y-auto rounded-md border shadow-lg",
                                    "bg-white text-foreground border-gray-200",
                                    "dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
                                  )}
                                  role="listbox"
                                  aria-multiselectable="true"
                                >
                                  <div className="py-1">
                                    {categories.map((category) => {
                                      const selected = categoryIds.includes(
                                        category.id
                                      );

                                      return (
                                        <label
                                          key={category.id}
                                          className={cn(
                                            "flex cursor-pointer items-center gap-3 px-3 py-2 text-sm transition-colors",
                                            "hover:bg-blue-50 hover:text-blue-600",
                                            "dark:hover:bg-blue-500/15 dark:hover:text-blue-200",
                                            selected
                                              ? "bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-200"
                                              : "text-foreground dark:text-gray-200"
                                          )}
                                        >
                                          <input
                                            type="checkbox"
                                            checked={selected}
                                            onChange={() =>
                                              handleCategoryToggle(category.id)
                                            }
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:focus:ring-blue-400"
                                          />
                                          <span className="truncate">
                                            {category.name}
                                          </span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                  <div className="border-t border-gray-200/80 p-2 text-right dark:border-gray-700">
                                    <button
                                      type="button"
                                      onClick={closeCategoryDropdown}
                                      className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                      Done
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                            {categoryIds.length > 0 && (
                              <div className="flex flex-wrap gap-2 rounded-md border border-dashed border-gray-200 bg-gray-50 p-3 text-sm text-foreground dark:border-gray-700 dark:bg-gray-900">
                                {categories
                                  .filter((category) =>
                                    categoryIds.includes(category.id)
                                  )
                                  .map((category) => (
                                    <button
                                      key={category.id}
                                      type="button"
                                      onClick={() =>
                                        handleCategoryToggle(category.id)
                                      }
                                      className={cn(
                                        "flex items-center gap-2 rounded-full border px-3 py-1 font-medium transition-colors",
                                        "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200",
                                        "dark:bg-blue-500/20 dark:text-blue-200 dark:border-blue-500/40 dark:hover:bg-blue-500/30"
                                      )}
                                    >
                                      <span className="truncate">
                                        {category.name}
                                      </span>
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                  ))}
                              </div>
                            )}
                            {categoryIds.length > 0 && (
                              <p className="text-sm text-muted-foreground">
                                {categoryIds.length} categor
                                {categoryIds.length === 1 ? "y" : "ies"}{" "}
                                selected
                              </p>
                            )}
                          </div>
                        )}
                      </CustomCardContent>
                    </CustomCard>
                  </TabsContent>

                  {/* Inventory Tab */}
                  <TabsContent value="inventory" className="space-y-6">
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

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              id="minCartQty"
                              name="minCartQty"
                              label="Minimum Cart Quantity"
                              type="number"
                              value={formValues.minCartQty ?? ""}
                              onChange={handleInputChange}
                              disabled={loading}
                              helperText="Minimum quantity required in cart (leave empty for no limit)"
                            />

                            <FormField
                              id="maxCartQty"
                              name="maxCartQty"
                              label="Maximum Cart Quantity"
                              type="number"
                              value={formValues.maxCartQty ?? ""}
                              onChange={handleInputChange}
                              disabled={loading}
                              helperText="Maximum quantity allowed in cart (leave empty for no limit)"
                            />
                          </div>

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
                  </TabsContent>

                  {/* Shipping Tab */}
                  <TabsContent value="shipping" className="space-y-6">
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
                                  <FormField
                                    id="length"
                                    label="Length"
                                    type="number"
                                    step="0.01"
                                    name="length"
                                    value={formValues.length}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                  />
                                  <FormField
                                    id="width"
                                    label="Width"
                                    type="number"
                                    step="0.01"
                                    name="width"
                                    value={formValues.width}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                  />
                                  <FormField
                                    id="height"
                                    label="Height"
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
                  </TabsContent>

                  {/* Attributes Tab */}
                  <TabsContent value="attributes" className="space-y-6">
                    {/* Product Attributes - For all product types */}
                    <CustomCard>
                      <CustomCardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-foreground">
                            Product Attributes
                          </h3>
                        </div>

                        <div className="space-y-4">
                          {/* Add Attribute */}
                          <div className="space-y-2">
                            <CustomLabel>Add Attribute</CustomLabel>
                            <div className="flex gap-2">
                              <CustomButton
                                type="button"
                                variant="outline"
                                onClick={addAttribute}
                                disabled={loading}
                                className="flex-shrink-0"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                New
                              </CustomButton>
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
                                <option value="">Add existing...</option>
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
                                      {attr.description &&
                                        ` - ${attr.description}`}
                                    </option>
                                  ))}
                              </select>
                            </div>
                          </div>

                          {/* Assigned Attributes - Global and Inline */}
                          {(productGlobalAttributes.length > 0 ||
                            attributes.length > 0) && (
                            <div className="space-y-3">
                              <CustomLabel>Assigned Attributes</CustomLabel>
                              {errors.attributes && (
                                <p className="text-sm text-red-600 mb-4">
                                  {errors.attributes}
                                </p>
                              )}

                              {/* Global Attributes */}
                              {productGlobalAttributes.map((attr, index) => {
                                const globalAttr = attr.globalAttribute || {};
                                return (
                                  <div
                                    key={`global-${attr.globalAttributeId}-${index}`}
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
                                    <AttributeValuesEditor
                                      id={`global-attr-${index}-value`}
                                      label={`Values for ${globalAttr.name}`}
                                      value={attr.value || ""}
                                      onChange={(newValue) =>
                                        handleUpdateGlobalAttribute(
                                          index,
                                          "value",
                                          newValue
                                        )
                                      }
                                      disabled={loading}
                                      helperText="Press Enter or comma to add each value."
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
                                  </div>
                                );
                              })}

                              {/* Inline Product Attributes */}
                              {attributes.map((attribute, index) => (
                                <div
                                  key={`inline-${index}`}
                                  className="p-3 border border-border rounded-lg space-y-2"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex-1">
                                      <FormField
                                        id={`attr-${index}-name`}
                                        label="Attribute Name"
                                        placeholder="e.g., Size, Color"
                                        value={attribute.name}
                                        onChange={(e) =>
                                          updateAttribute(
                                            index,
                                            "name",
                                            e.target.value
                                          )
                                        }
                                        disabled={loading}
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => removeAttribute(index)}
                                      disabled={loading}
                                      className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-red-600 mt-6"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                  <AttributeValuesEditor
                                    id={`attr-${index}-value`}
                                    label="Attribute Values"
                                    value={attribute.value || ""}
                                    onChange={(newValue) =>
                                      updateAttribute(index, "value", newValue)
                                    }
                                    disabled={loading}
                                    placeholder="Type a value and press Enter"
                                    helperText="Press Enter or comma to add each value."
                                  />
                                  <div className="flex items-center gap-4 text-sm">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={
                                          attribute.visible !== undefined
                                            ? attribute.visible
                                            : true
                                        }
                                        onChange={(e) =>
                                          updateAttribute(
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
                                        checked={
                                          attribute.variation !== undefined
                                            ? attribute.variation
                                            : false
                                        }
                                        onChange={(e) =>
                                          updateAttribute(
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
                                </div>
                              ))}
                            </div>
                          )}

                          {productGlobalAttributes.length === 0 &&
                            attributes.length === 0 && (
                              <p className="text-sm text-muted-foreground py-4 text-center">
                                No attributes assigned yet. Click
                                &quot;New&quot; to create one or select from
                                &quot;Add existing&quot;.
                              </p>
                            )}
                        </div>
                      </CustomCardContent>
                    </CustomCard>

                    {/* Generate Variants Button - Only for variable products */}
                    {isVariableProduct && (
                      <div className="flex justify-end">
                        <CustomButton
                          type="button"
                          size="default"
                          onClick={() => {
                            // Collect attributes from both sources:
                            // 1. Inline attributes (manually added) - only those marked for variations
                            const inlineAttrs = attributes
                              .filter(
                                (a) => a.name && a.value && a.variation === true
                              )
                              .map((a) => ({
                                name: a.name.trim(),
                                values: a.value
                                  .split(/[,|/]+/)
                                  .map((v) => v.trim())
                                  .filter(Boolean),
                              }))
                              .filter((a) => a.values.length > 0);

                            // 2. Global attributes (selected from global, marked for variations)
                            const globalAttrs = productGlobalAttributes
                              .filter(
                                (attr) =>
                                  attr.variation &&
                                  attr.value &&
                                  attr.value.trim() &&
                                  attr.globalAttribute
                              )
                              .map((attr) => {
                                const globalAttr = attr.globalAttribute || {};
                                return {
                                  name: globalAttr.name || "",
                                  values: attr.value
                                    .split(/[,|/]+/)
                                    .map((v) => v.trim())
                                    .filter(Boolean),
                                };
                              })
                              .filter((a) => a.name && a.values.length > 0);

                            // Combine both sources
                            const allAttrs = [...inlineAttrs, ...globalAttrs];

                            if (allAttrs.length === 0) {
                              toast.error(
                                "No attributes with values found. Add attributes and mark them for variations."
                              );
                              return;
                            }

                            // Merge attributes with same name
                            const mergedMap = allAttrs.reduce((map, p) => {
                              const key = p.name.toLowerCase();
                              const set = map.get(key) || new Set();
                              p.values.forEach((v) => set.add(v));
                              map.set(key, set);
                              return map;
                            }, new Map());

                            const merged = Array.from(mergedMap.entries()).map(
                              ([key, set]) => ({
                                name:
                                  allAttrs.find(
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
                              const nameParts = values
                                .map((v, i) => `${cleaned[i].name}: ${v}`)
                                .join(" | ");

                              const baseVariant = {
                                name: nameParts,
                                sku: "",
                                price: "",
                                salePrice: "",
                                manageStock: true,
                                stockQuantity: 0,
                                attributes: cleaned.map((p) => ({
                                  name: p.name,
                                })),
                                // Per-variant settings
                                status: formValues.status || "DRAFT",
                                featured: false,
                                virtual: false,
                                downloadable: false,
                                reviewsAllowed: true,
                                // Set first two attributes for the select boxes
                                attribute1Name: cleaned[0]?.name || "",
                                attribute1Value: values[0] || "",
                                attribute2Name: cleaned[1]?.name || "",
                                attribute2Value: values[1] || "",
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
                            toast.success(
                              `Generated ${newVariants.length} variant(s)`
                            );
                            // Automatically switch to variants tab
                            setActiveTab("variants");
                          }}
                          disabled={
                            loading ||
                            (attributes.filter(
                              (a) => a.name && a.value && a.variation === true
                            ).length === 0 &&
                              productGlobalAttributes.filter(
                                (attr) =>
                                  attr.variation &&
                                  attr.value &&
                                  attr.value.trim()
                              ).length === 0)
                          }
                        >
                          <GitBranch className="h-4 w-4 mr-2" />
                          Generate Variants
                        </CustomButton>
                      </div>
                    )}
                  </TabsContent>

                  {/* Variants Tab */}
                  <TabsContent value="variants" className="space-y-6">
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
                                className="p-4 border border-border rounded-lg space-y-3 bg-[#0b111e]"
                              >
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium">
                                    Variant {index + 1}
                                  </h4>
                                  <button
                                    type="button"
                                    onClick={() => removeVariant(index)}
                                    disabled={loading}
                                    className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>

                                {/* Variant Name - 2 Select Boxes */}
                                {(() => {
                                  const variationAttrs =
                                    getVariationAttributes();
                                  const attr1 = variationAttrs.find(
                                    (a) => a.name === variant.attribute1Name
                                  );
                                  const attr2 = variationAttrs.find(
                                    (a) => a.name === variant.attribute2Name
                                  );

                                  return (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                      {/* First Attribute */}
                                      {/* <div className="space-y-2">
                                        <CustomLabel
                                          htmlFor={`variant-${index}-attr1-name`}
                                        >
                                          Attribute 1
                                        </CustomLabel>
                                        <select
                                          id={`variant-${index}-attr1-name`}
                                          value={variant.attribute1Name || ""}
                                          onChange={(e) => {
                                            updateVariant(
                                              index,
                                              "attribute1Name",
                                              e.target.value
                                            );
                                            updateVariant(
                                              index,
                                              "attribute1Value",
                                              ""
                                            );
                                          }}
                                          disabled={loading}
                                          className={cn(
                                            "flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors",
                                            "bg-white text-gray-900 border-gray-300",
                                            "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600",
                                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                                            "focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400"
                                          )}
                                        >
                                          <option value="">
                                            Select Attribute
                                          </option>
                                          {variationAttrs.map((attr) => (
                                            <option
                                              key={attr.name}
                                              value={attr.name}
                                            >
                                              {attr.name}
                                            </option>
                                          ))}
                                        </select>
                                      </div> */}
                                      <div className="space-y-2">
                                        {/* <CustomLabel
                                          htmlFor={`variant-${index}-attr1-value`}
                                        >
                                          Value 1
                                        </CustomLabel> */}
                                        <select
                                          id={`variant-${index}-attr1-value`}
                                          value={variant.attribute1Value || ""}
                                          onChange={(e) =>
                                            updateVariant(
                                              index,
                                              "attribute1Value",
                                              e.target.value
                                            )
                                          }
                                          disabled={
                                            loading || !variant.attribute1Name
                                          }
                                          className={cn(
                                            "flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors",
                                            "bg-white text-gray-900 border-gray-300",
                                            "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600",
                                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                                            "focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400",
                                            "disabled:opacity-50 disabled:cursor-not-allowed"
                                          )}
                                        >
                                          <option value="">Select Value</option>
                                          {attr1?.values.map((val) => (
                                            <option key={val} value={val}>
                                              {val}
                                            </option>
                                          ))}
                                        </select>
                                      </div>

                                      {/* Second Attribute */}
                                      {/* <div className="space-y-2">
                                        <CustomLabel
                                          htmlFor={`variant-${index}-attr2-name`}
                                        >
                                          Attribute 2
                                        </CustomLabel>
                                        <select
                                          id={`variant-${index}-attr2-name`}
                                          value={variant.attribute2Name || ""}
                                          onChange={(e) => {
                                            updateVariant(
                                              index,
                                              "attribute2Name",
                                              e.target.value
                                            );
                                            updateVariant(
                                              index,
                                              "attribute2Value",
                                              ""
                                            );
                                          }}
                                          disabled={loading}
                                          className={cn(
                                            "flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors",
                                            "bg-white text-gray-900 border-gray-300",
                                            "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600",
                                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                                            "focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400"
                                          )}
                                        >
                                          <option value="">
                                            Select Attribute
                                          </option>
                                          {variationAttrs
                                            .filter(
                                              (attr) =>
                                                attr.name !==
                                                variant.attribute1Name
                                            )
                                            .map((attr) => (
                                              <option
                                                key={attr.name}
                                                value={attr.name}
                                              >
                                                {attr.name}
                                              </option>
                                            ))}
                                        </select>
                                      </div> */}
                                      <div className="space-y-2">
                                        {/* <CustomLabel
                                          htmlFor={`variant-${index}-attr2-value`}
                                        >
                                          Value 2
                                        </CustomLabel> */}
                                        <select
                                          id={`variant-${index}-attr2-value`}
                                          value={variant.attribute2Value || ""}
                                          onChange={(e) =>
                                            updateVariant(
                                              index,
                                              "attribute2Value",
                                              e.target.value
                                            )
                                          }
                                          disabled={
                                            loading || !variant.attribute2Name
                                          }
                                          className={cn(
                                            "flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors",
                                            "bg-white text-gray-900 border-gray-300",
                                            "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600",
                                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                                            "focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400",
                                            "disabled:opacity-50 disabled:cursor-not-allowed"
                                          )}
                                        >
                                          <option value="">Select Value</option>
                                          {attr2?.values.map((val) => (
                                            <option key={val} value={val}>
                                              {val}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>
                                  );
                                })()}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <FormField
                                    id={`variant-${index}-sku`}
                                    label="SKU"
                                    value={variant.sku}
                                    onChange={(e) =>
                                      updateVariant(
                                        index,
                                        "sku",
                                        e.target.value
                                      )
                                    }
                                    disabled={loading}
                                  />
                                  <FormField
                                    id={`variant-${index}-price`}
                                    label="Price"
                                    type="number"
                                    step="0.01"
                                    value={variant.price}
                                    onChange={(e) =>
                                      updateVariant(
                                        index,
                                        "price",
                                        e.target.value
                                      )
                                    }
                                    disabled={loading}
                                  />
                                  <FormField
                                    id={`variant-${index}-sale-price`}
                                    label="Sale Price"
                                    type="number"
                                    step="0.01"
                                    value={variant.salePrice}
                                    onChange={(e) =>
                                      updateVariant(
                                        index,
                                        "salePrice",
                                        e.target.value
                                      )
                                    }
                                    disabled={loading}
                                  />
                                  <div className="md:col-span-2">
                                    <SingleImageUpload
                                      label="Variant Image"
                                      value={variant.imageUrl || ""}
                                      onChange={(url) =>
                                        updateVariant(index, "imageUrl", url)
                                      }
                                      onRemove={() =>
                                        updateVariant(index, "imageUrl", "")
                                      }
                                      disabled={loading}
                                    />
                                  </div>
                                  <FormField
                                    id={`variant-${index}-stock`}
                                    label="Stock Quantity"
                                    type="number"
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

                                {/* Per-Variant Settings */}
                                <div className="border-t border-border pt-4 mt-4">
                                  <h5 className="text-sm font-semibold text-foreground mb-3">
                                    Variant Settings
                                  </h5>
                                  <div className="grid grid-cols-1  gap-4">
                                    {/* Enabled/Disabled Toggle */}
                                    <div className="flex items-center justify-between">
                                      <CustomLabel
                                        htmlFor={`variant-${index}-enabled`}
                                      >
                                        Enabled
                                      </CustomLabel>
                                      <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                          type="checkbox"
                                          id={`variant-${index}-enabled`}
                                          checked={
                                            variant.status === "PUBLISHED" ||
                                            (!variant.status &&
                                              formValues.status === "PUBLISHED")
                                          }
                                          onChange={(e) =>
                                            updateVariant(
                                              index,
                                              "status",
                                              e.target.checked
                                                ? "PUBLISHED"
                                                : "DRAFT"
                                            )
                                          }
                                          disabled={loading}
                                          className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                      </label>
                                    </div>

                                    {/* Featured */}
                                    <div className="flex items-center justify-between">
                                      <CustomLabel
                                        htmlFor={`variant-${index}-featured`}
                                      >
                                        Featured
                                      </CustomLabel>
                                      <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                          type="checkbox"
                                          id={`variant-${index}-featured`}
                                          checked={variant.featured || false}
                                          onChange={(e) =>
                                            updateVariant(
                                              index,
                                              "featured",
                                              e.target.checked
                                            )
                                          }
                                          disabled={loading}
                                          className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                      </label>
                                    </div>

                                    {/* Virtual */}
                                    <div className="flex items-center justify-between">
                                      <CustomLabel
                                        htmlFor={`variant-${index}-virtual`}
                                      >
                                        Virtual
                                      </CustomLabel>
                                      <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                          type="checkbox"
                                          id={`variant-${index}-virtual`}
                                          checked={variant.virtual || false}
                                          onChange={(e) =>
                                            updateVariant(
                                              index,
                                              "virtual",
                                              e.target.checked
                                            )
                                          }
                                          disabled={loading}
                                          className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                      </label>
                                    </div>

                                    {/* Downloadable */}
                                    <div className="flex items-center justify-between">
                                      <CustomLabel
                                        htmlFor={`variant-${index}-downloadable`}
                                      >
                                        Downloadable
                                      </CustomLabel>
                                      <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                          type="checkbox"
                                          id={`variant-${index}-downloadable`}
                                          checked={
                                            variant.downloadable || false
                                          }
                                          onChange={(e) =>
                                            updateVariant(
                                              index,
                                              "downloadable",
                                              e.target.checked
                                            )
                                          }
                                          disabled={loading}
                                          className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                      </label>
                                    </div>

                                    {/* Enable Reviews */}
                                    <div className="flex items-center justify-between">
                                      <CustomLabel
                                        htmlFor={`variant-${index}-reviews`}
                                      >
                                        Enable Reviews
                                      </CustomLabel>
                                      <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                          type="checkbox"
                                          id={`variant-${index}-reviews`}
                                          checked={
                                            variant.reviewsAllowed !== undefined
                                              ? variant.reviewsAllowed
                                              : true
                                          }
                                          onChange={(e) =>
                                            updateVariant(
                                              index,
                                              "reviewsAllowed",
                                              e.target.checked
                                            )
                                          }
                                          disabled={loading}
                                          className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                      </label>
                                    </div>
                                  </div>
                                </div>

                                {isVariableSubscription && (
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                                    <div className="space-y-2">
                                      <CustomLabel
                                        htmlFor={`v-${index}-period`}
                                      >
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
                                      value={
                                        variant.subscriptionSignUpFee ?? "0"
                                      }
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
                                      value={
                                        variant.subscriptionTrialLength ?? 0
                                      }
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
                                      <CustomLabel
                                        htmlFor={`v-${index}-trial-period`}
                                      >
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
                  </TabsContent>

                  {/* Subscription Settings Tab */}
                  {hasSubscription && (
                    <TabsContent value="subscription" className="space-y-6">
                      <CustomCard>
                        <CustomCardContent className="pt-6">
                          <h3 className="text-lg font-semibold text-foreground mb-4">
                            Subscription Settings
                          </h3>

                          <div className="space-y-4">
                            {/* Pricing for Subscription Products */}
                            {formValues.type === "SUBSCRIPTION" && (
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
                            )}

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
                                    <option
                                      key={period.value}
                                      value={period.value}
                                    >
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
                          </div>
                        </CustomCardContent>
                      </CustomCard>
                    </TabsContent>
                  )}

                  {/* Additional Settings Tab */}
                  <TabsContent value="additional" className="space-y-6">
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
                                <FormField
                                  id={`meta-${index}-key`}
                                  label="Key"
                                  value={meta.key}
                                  onChange={(e) =>
                                    updateMetadata(index, "key", e.target.value)
                                  }
                                  disabled={loading}
                                />
                                <FormField
                                  id={`meta-${index}-value`}
                                  label="Value"
                                  value={meta.value}
                                  onChange={(e) =>
                                    updateMetadata(
                                      index,
                                      "value",
                                      e.target.value
                                    )
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
                  </TabsContent>
                </div>
              </div>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
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

            {/* Product image */}
            <CustomCard collapsible>
              <CustomCardHeader
                className="flex-row items-center justify-between space-y-0"
                showIndicator
              >
                <CustomCardTitle className="text-lg font-semibold">
                  Product image
                </CustomCardTitle>
              </CustomCardHeader>
              <CustomCardContent className="pt-0">
                <SingleImageUpload
                  value={featuredImage}
                  onChange={setFeaturedImage}
                />
              </CustomCardContent>
            </CustomCard>

            {/* Product gallery */}
            <CustomCard collapsible>
              <CustomCardHeader
                className="flex-row items-center justify-between space-y-0"
                showIndicator
              >
                <CustomCardTitle className="text-lg font-semibold">
                  Product gallery
                </CustomCardTitle>
              </CustomCardHeader>
              <CustomCardContent className="pt-0">
                <MultiImageUpload
                  value={galleryImages}
                  onChange={setGalleryImages}
                  maxImages={20}
                  helperText="Upload multiple images for the product gallery"
                />
              </CustomCardContent>
            </CustomCard>

            {/* Product tags */}
            <CustomCard collapsible>
              <CustomCardHeader
                className="flex-row items-center justify-between space-y-0"
                showIndicator
              >
                <CustomCardTitle className="text-lg font-semibold">
                  Product tags
                </CustomCardTitle>
              </CustomCardHeader>
              <CustomCardContent className="pt-0">
                <TagsSelector
                  value={selectedTags}
                  onChange={setSelectedTags}
                  helperText="Add tags to categorize and filter products"
                />
              </CustomCardContent>
            </CustomCard>

            {/* Settings - General product settings for all product types */}
            <CustomCard collapsible>
              <CustomCardHeader
                className="flex-row items-center justify-between space-y-0"
                showIndicator
              >
                <CustomCardTitle className="text-lg font-semibold">
                  Settings
                </CustomCardTitle>
              </CustomCardHeader>
              <CustomCardContent className="pt-0">
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
          </div>
        </div>
      </form>
    </PageContainer>
  );
}
