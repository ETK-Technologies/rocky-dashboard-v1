"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
    Plus,
    Trash2,
    Copy,
    ChevronDown,
    ChevronUp,
    CheckCircle2,
    XCircle,
    ChevronsUpDown,
    ChevronsDownUp,
} from "lucide-react";
import {
    CustomButton,
    CustomInput,
    CustomLabel,
    FormField,
} from "@/components/ui";
import { useProducts } from "@/features/products/hooks/useProducts";

export default function ResultsStep({
    onComplete,
    onValidationChange,
    data,
    updateData,
}) {
    const resultRefs = useRef({});
    const hasInitializedExpandedRef = useRef(false);

    // Get useDefaultForAllLogics setting
    const useDefaultForAllLogics =
        data?.quizDetails?.useDefaultForAllLogics || false;

    // Fetch all products once - useProducts hook will fetch on mount with initial filters
    const { products: allProducts, loading: productsLoading } = useProducts({
        limit: 100, // Get all products
    });

    // Initialize results with default if empty
    const results = useMemo(() => {
        const existingResults = data?.results || [];
        if (existingResults.length === 0) {
            return [
                {
                    id: 1,
                    isDefault: true,
                    title: "",
                    continuePopup: false,
                    addons: false,
                    products: [],
                    selectedProductId: "",
                },
            ];
        }
        // Ensure at least one result is marked as default
        const hasDefault = existingResults.some((r) => r.isDefault);
        const normalizedResults = hasDefault
            ? existingResults
            : existingResults.map((r, index) => ({
                  ...r,
                  isDefault: index === 0,
              }));
        return normalizedResults;
    }, [data?.results]);

    // Sort results: default first, then others
    const sortedResults = useMemo(() => {
        const defaultResult = results.find((r) => r.isDefault);
        const otherResults = results.filter((r) => !r.isDefault);
        return defaultResult ? [defaultResult, ...otherResults] : results;
    }, [results]);

    // Initialize expandedResults state
    const [expandedResults, setExpandedResults] = useState(new Set());
    const [scrollToResultId, setScrollToResultId] = useState(null);

    // Check if a result is complete
    const isResultComplete = (result) => {
        // Title is required
        if (!result.title?.trim()) {
            return false;
        }

        // At least one product is required
        if (
            !result.products ||
            !Array.isArray(result.products) ||
            result.products.length === 0
        ) {
            return false;
        }

        // At least one product must be primary
        const hasPrimaryProduct = result.products.some(
            (p) => p.isPrimary === true
        );
        if (!hasPrimaryProduct) {
            return false;
        }

        return true;
    };

    // Validate all results
    useEffect(() => {
        const isValid = sortedResults.every((result) =>
            isResultComplete(result)
        );
        onValidationChange?.(isValid);
    }, [sortedResults, onValidationChange]);

    // Auto-expand single result on first load or when returning to step
    // Only trigger when results change, not when expandedResults changes (to allow manual collapse)
    const prevResultsLengthRef = useRef(sortedResults.length);
    const prevResultsIdsRef = useRef(sortedResults.map((r) => r.id).join(","));

    useEffect(() => {
        const currentResultsIds = sortedResults.map((r) => r.id).join(",");
        const resultsChanged = prevResultsIdsRef.current !== currentResultsIds;
        prevResultsIdsRef.current = currentResultsIds;
        prevResultsLengthRef.current = sortedResults.length;

        if (!hasInitializedExpandedRef.current) {
            hasInitializedExpandedRef.current = true;
            // On first load, if only one result, expand it
            if (sortedResults.length === 1) {
                setExpandedResults(new Set([sortedResults[0].id]));
            }
            return;
        }

        // If returning to step (results changed) and only one result, check if it's expanded
        if (resultsChanged && sortedResults.length === 1) {
            setExpandedResults((prev) => {
                // Only expand if it's not already expanded
                if (prev.size === 0 || !prev.has(sortedResults[0].id)) {
                    return new Set([sortedResults[0].id]);
                }
                return prev; // Keep current state if already expanded
            });
        }
        // If there's more than one result now and it was expanded because it was single,
        // we don't auto-collapse - let user control it
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortedResults]); // Only depend on sortedResults, not expandedResults

    // Scroll to newly added or duplicated result
    useEffect(() => {
        if (scrollToResultId && resultRefs.current[scrollToResultId]) {
            const element = resultRefs.current[scrollToResultId];
            setTimeout(() => {
                element.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
                setScrollToResultId(null);
            }, 100);
        }
    }, [scrollToResultId, sortedResults]);

    const setResults = (newResults) => {
        updateData("results", newResults);
    };

    const addResult = () => {
        const newResultId = Date.now();
        const newResult = {
            id: newResultId,
            isDefault: false,
            title: "",
            continuePopup: false,
            addons: false,
            products: [],
            selectedProductId: "",
        };
        setResults([...results, newResult]);
        // Expand the new result
        setExpandedResults((prev) => new Set([...prev, newResultId]));
        // Set scroll target
        setScrollToResultId(newResultId);
    };

    const removeResult = (id) => {
        const resultToRemove = results.find((r) => r.id === id);
        if (resultToRemove && !resultToRemove.isDefault) {
            setResults(results.filter((r) => r.id !== id));
        }
    };

    const makeDefault = (id) => {
        setResults(
            results.map((r) => ({
                ...r,
                isDefault: r.id === id,
            }))
        );
    };

    const duplicateResult = (id) => {
        const resultToDuplicate = results.find((r) => r.id === id);
        if (resultToDuplicate) {
            const newResultId = Date.now();
            const newResult = {
                ...resultToDuplicate,
                id: newResultId,
                isDefault: false,
                title: `${resultToDuplicate.title || "Result"} (Copy)`,
                continuePopup: resultToDuplicate.continuePopup || false,
                addons: resultToDuplicate.addons || false,
                products: resultToDuplicate.products
                    ? [...resultToDuplicate.products]
                    : [],
                selectedProductId: "",
            };
            setResults([...results, newResult]);
            // Expand the duplicated result
            setExpandedResults((prev) => new Set([...prev, newResultId]));
            // Set scroll target
            setScrollToResultId(newResultId);
        }
    };

    const toggleResultExpanded = (id) => {
        setExpandedResults((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const allExpanded =
        sortedResults.length > 0 &&
        sortedResults.every((r) => expandedResults.has(r.id));

    const toggleAllResults = () => {
        if (allExpanded) {
            // Collapse all
            setExpandedResults(new Set());
        } else {
            // Expand all
            setExpandedResults(new Set(sortedResults.map((r) => r.id)));
        }
    };

    const updateResult = (id, field, value) => {
        setResults(
            results.map((r) => (r.id === id ? { ...r, [field]: value } : r))
        );
    };

    const handleUseDefaultForAllLogicsChange = (checked) => {
        updateData("quizDetails", {
            ...data?.quizDetails,
            useDefaultForAllLogics: checked,
        });

        // If checked, remove all results except default
        if (checked) {
            const defaultResult = results.find((r) => r.isDefault);
            if (defaultResult) {
                setResults([defaultResult]);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg py-4 border-b border-border mb-6 flex sm:items-center items-start justify-between sm:flex-row flex-col md:gap-4 gap-2">
                <div>
                    <h2 className="text-2xl font-semibold mb-2">Results</h2>
                    <p className="text-muted-foreground">
                        Configure result ranges and messages for your quiz
                    </p>
                </div>
                <div className="flex flex-col gap-2 justify-end">
                    <div className="flex items-center justify-between border sm:px-6 px-2 py-6 gap-4 rounded-md">
                        <div className="flex flex-col">
                            <CustomLabel>
                                Use Default Result for All Logics
                            </CustomLabel>
                            <p className="text-sm text-muted-foreground mt-1">
                                Use the default result for all logic connections
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={useDefaultForAllLogics}
                                onChange={(e) =>
                                    handleUseDefaultForAllLogicsChange(
                                        e.target.checked
                                    )
                                }
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>

                    <div className="flex md:items-center gap-2 flex-wrap sm:text-base text-sm md:self-end self-end justify-end">
                        {!useDefaultForAllLogics && (
                            <>
                                <CustomButton
                                    onClick={addResult}
                                    size="sm"
                                    className="flex items-center gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Result
                                </CustomButton>
                                {sortedResults.length > 0 && (
                                    <CustomButton
                                        onClick={toggleAllResults}
                                        variant="outline"
                                        className="flex items-center gap-2 py-3"
                                    >
                                        {allExpanded ? (
                                            <ChevronsUpDown className="h-4 w-4" />
                                        ) : (
                                            <ChevronsDownUp className="h-4 w-4" />
                                        )}
                                        {allExpanded
                                            ? "Collapse all"
                                            : "Expand all"}
                                    </CustomButton>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {sortedResults.map((result, index) => {
                    const isDefault = result.isDefault;
                    const isComplete = isResultComplete(result);
                    const isExpanded = expandedResults.has(result.id);

                    return (
                        <div
                            key={result.id}
                            ref={(el) => {
                                if (el) {
                                    resultRefs.current[result.id] = el;
                                }
                            }}
                            className="border rounded-lg p-6 space-y-6 bg-card"
                        >
                            {/* Result Header */}
                            <div className="flex sm:items-center items-start justify-between sm:flex-row flex-col md:gap-4 gap-4">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="flex flex-col gap-2 items-start">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium flex-shrink-0">
                                                {isDefault
                                                    ? "Default Result"
                                                    : `Result ${index + 1}`}
                                            </span>
                                            {isComplete ? (
                                                <span className="flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-medium">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Complete
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-medium">
                                                    <XCircle className="h-3 w-3" />
                                                    Incomplete
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 flex-1 min-w-0 px-3 flex-wrap">
                                            <span className="font-medium text-sm truncate">
                                                {result.title ||
                                                    "Untitled Result"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 sm:self-center self-end sm:flex-row flex-col">
                                    <div className="flex items-center gap-2 sm:flex-row flex-col sm:w-auto w-full">
                                        <CustomButton
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                toggleResultExpanded(result.id)
                                            }
                                            className="text-muted-foreground hover:text-white sm:text-base text-sm"
                                        >
                                            {isExpanded ? (
                                                <>
                                                    <ChevronUp className="h-4 w-4 mr-1" />
                                                    <span className="">
                                                        Hide Details
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronDown className="h-4 w-4 mr-1" />
                                                    <span className="">
                                                        Show Details
                                                    </span>
                                                </>
                                            )}
                                        </CustomButton>
                                        {!isDefault &&
                                            !useDefaultForAllLogics && (
                                                <CustomButton
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        makeDefault(result.id)
                                                    }
                                                    className="text-muted-foreground hover:text-white"
                                                >
                                                    Make Default
                                                </CustomButton>
                                            )}
                                    </div>
                                    <div className="flex items-center gap-2 sm:w-auto w-full sm:justify-start justify-end">
                                        {!useDefaultForAllLogics && (
                                            <CustomButton
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    duplicateResult(result.id)
                                                }
                                                className="text-muted-foreground hover:text-white"
                                            >
                                                <Copy className="h-4 w-4" />
                                            </CustomButton>
                                        )}
                                        {!isDefault &&
                                            !useDefaultForAllLogics && (
                                                <CustomButton
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        removeResult(result.id)
                                                    }
                                                    className="text-destructive hover:text-white dark:text-red-500"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </CustomButton>
                                            )}
                                    </div>
                                </div>
                            </div>

                            {/* Result Details - Collapsible */}
                            {isExpanded && (
                                <div className="space-y-4 pt-4 border-t">
                                    <FormField
                                        id={`title-${result.id}`}
                                        label="Result Title"
                                        required
                                        value={result.title || ""}
                                        onChange={(e) =>
                                            updateResult(
                                                result.id,
                                                "title",
                                                e.target.value
                                            )
                                        }
                                        placeholder="e.g., Excellent, Good, Needs Improvement"
                                    />

                                    {/* Continue Popup Toggle */}
                                    <div className="border px-4 py-3 rounded-md space-y-3">
                                        <div className="flex items-center justify-between">
                                            <CustomLabel>
                                                Continue Popup
                                            </CustomLabel>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        result.continuePopup ||
                                                        false
                                                    }
                                                    onChange={(e) => {
                                                        const isChecked =
                                                            e.target.checked;
                                                        setResults(
                                                            results.map((r) =>
                                                                r.id ===
                                                                result.id
                                                                    ? {
                                                                          ...r,
                                                                          continuePopup:
                                                                              isChecked,
                                                                          // If Continue Popup is turned off, also turn off Add-ons
                                                                          addons: isChecked
                                                                              ? r.addons
                                                                              : false,
                                                                      }
                                                                    : r
                                                            )
                                                        );
                                                    }}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                            </label>
                                        </div>

                                        {/* Add-ons Toggle - Only show if Continue Popup is active */}
                                        {result.continuePopup && (
                                            <div className="flex items-center justify-between pt-2 border-t">
                                                <CustomLabel>
                                                    Add-ons
                                                </CustomLabel>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            result.addons ||
                                                            false
                                                        }
                                                        onChange={(e) =>
                                                            updateResult(
                                                                result.id,
                                                                "addons",
                                                                e.target.checked
                                                            )
                                                        }
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                                </label>
                                            </div>
                                        )}
                                    </div>

                                    {/* Products Section */}
                                    <div className="space-y-4">
                                        <div>
                                            <CustomLabel
                                                htmlFor={`products-${result.id}`}
                                            >
                                                Products{" "}
                                                <span className="text-sm text-red-500">
                                                    *
                                                </span>
                                            </CustomLabel>
                                            <p
                                                className={`text-xs mt-1 ${
                                                    !result.products ||
                                                    !Array.isArray(
                                                        result.products
                                                    ) ||
                                                    result.products.length === 0
                                                        ? "text-red-500"
                                                        : "text-muted-foreground"
                                                }`}
                                            >
                                                At least one product is required
                                            </p>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <select
                                                id={`products-${result.id}`}
                                                value={
                                                    result.selectedProductId ||
                                                    ""
                                                }
                                                onChange={(e) => {
                                                    const selectedProductId =
                                                        e.target.value;
                                                    updateResult(
                                                        result.id,
                                                        "selectedProductId",
                                                        selectedProductId
                                                    );
                                                }}
                                                className="flex-1 px-3 py-2 !mt-1 border border-input rounded-md bg-background dark:bg-gray-800 dark:text-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                                disabled={productsLoading}
                                            >
                                                <option value="">
                                                    Select a product...
                                                </option>
                                                {productsLoading ? (
                                                    <option disabled>
                                                        Loading products...
                                                    </option>
                                                ) : allProducts.length === 0 ? (
                                                    <option disabled>
                                                        No products available
                                                    </option>
                                                ) : (
                                                    allProducts.map(
                                                        (product) => {
                                                            const productId =
                                                                product.id ||
                                                                product._id;
                                                            const productName =
                                                                product.name ||
                                                                product.title ||
                                                                "Unnamed Product";
                                                            const productPrice =
                                                                product.basePrice ||
                                                                product.price ||
                                                                product.amount ||
                                                                "0.00";
                                                            const currentProducts =
                                                                result.products ||
                                                                [];
                                                            const isAlreadyAdded =
                                                                currentProducts.some(
                                                                    (p) =>
                                                                        (p.id ||
                                                                            p._id) ===
                                                                        productId
                                                                );
                                                            return (
                                                                <option
                                                                    key={
                                                                        productId
                                                                    }
                                                                    value={
                                                                        productId
                                                                    }
                                                                    disabled={
                                                                        isAlreadyAdded
                                                                    }
                                                                >
                                                                    {
                                                                        productName
                                                                    }{" "}
                                                                    - $
                                                                    {
                                                                        productPrice
                                                                    }
                                                                    {isAlreadyAdded
                                                                        ? " (Already added)"
                                                                        : ""}
                                                                </option>
                                                            );
                                                        }
                                                    )
                                                )}
                                            </select>
                                            <CustomButton
                                                onClick={() => {
                                                    const selectedProduct =
                                                        allProducts.find(
                                                            (p) =>
                                                                (p.id ||
                                                                    p._id) ===
                                                                result.selectedProductId
                                                        );
                                                    if (selectedProduct) {
                                                        const currentProducts =
                                                            result.products ||
                                                            [];
                                                        const newProducts = [
                                                            ...currentProducts,
                                                            selectedProduct,
                                                        ];
                                                        setResults(
                                                            results.map((r) =>
                                                                r.id ===
                                                                result.id
                                                                    ? {
                                                                          ...r,
                                                                          products:
                                                                              newProducts,
                                                                          selectedProductId:
                                                                              "",
                                                                      }
                                                                    : r
                                                            )
                                                        );
                                                    }
                                                }}
                                                disabled={
                                                    !result.selectedProductId ||
                                                    (
                                                        result.products || []
                                                    ).some(
                                                        (p) =>
                                                            (p.id || p._id) ===
                                                            result.selectedProductId
                                                    )
                                                }
                                                className="flex items-center gap-2"
                                            >
                                                <Plus className="h-4 w-4" />
                                                Add Product
                                            </CustomButton>
                                        </div>
                                        <p
                                            className={`text-xs ${
                                                !result.products ||
                                                !Array.isArray(
                                                    result.products
                                                ) ||
                                                result.products.length === 0 ||
                                                !result.products.some(
                                                    (p) => p.isPrimary === true
                                                )
                                                    ? "text-red-500"
                                                    : "text-muted-foreground"
                                            } ${
                                                !result.products ||
                                                !Array.isArray(
                                                    result.products
                                                ) ||
                                                result?.products?.length === 0
                                                    ? "hidden"
                                                    : ""
                                            }`}
                                        >
                                            Mark one product as primary
                                        </p>

                                        {/* Product Cards */}
                                        {Array.isArray(result.products) &&
                                            result.products.length > 0 && (
                                                <div className="space-y-3">
                                                    {result.products.map(
                                                        (
                                                            product,
                                                            productIndex
                                                        ) => {
                                                            const productId =
                                                                product.id ||
                                                                product._id;
                                                            const productName =
                                                                product.name ||
                                                                product.title ||
                                                                "Unnamed Product";
                                                            const productPrice =
                                                                product.basePrice ||
                                                                product.price ||
                                                                product.amount ||
                                                                "0.00";
                                                            const productDescription =
                                                                product.description ||
                                                                product.shortDescription ||
                                                                "";
                                                            const productImage =
                                                                product.images &&
                                                                product.images
                                                                    .length > 0
                                                                    ? product
                                                                          .images[0]
                                                                          .url ||
                                                                      product
                                                                          .images[0]
                                                                          .src
                                                                    : null;
                                                            const isPrimary =
                                                                product.isPrimary ||
                                                                false;

                                                            return (
                                                                <div
                                                                    key={
                                                                        productId ||
                                                                        productIndex
                                                                    }
                                                                    className="border rounded-lg p-4 bg-card space-y-3"
                                                                >
                                                                    <div className="flex gap-4">
                                                                        <div className="w-24 h-24 rounded-md border border-input flex items-center justify-center bg-muted shrink-0 relative overflow-hidden">
                                                                            {productImage ? (
                                                                                <img
                                                                                    src={
                                                                                        productImage
                                                                                    }
                                                                                    alt={
                                                                                        productName
                                                                                    }
                                                                                    className="w-full h-full object-cover rounded-md"
                                                                                    onError={(
                                                                                        e
                                                                                    ) => {
                                                                                        e.target.style.display =
                                                                                            "none";
                                                                                        const placeholder =
                                                                                            e.target.parentElement.querySelector(
                                                                                                ".no-image-placeholder"
                                                                                            );
                                                                                        if (
                                                                                            placeholder
                                                                                        ) {
                                                                                            placeholder.style.display =
                                                                                                "flex";
                                                                                        }
                                                                                    }}
                                                                                />
                                                                            ) : null}
                                                                            <div
                                                                                className="no-image-placeholder w-full h-full flex items-center justify-center text-xs text-muted-foreground"
                                                                                style={{
                                                                                    display:
                                                                                        productImage
                                                                                            ? "none"
                                                                                            : "flex",
                                                                                }}
                                                                            >
                                                                                No
                                                                                Image
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex-1 space-y-2">
                                                                            <div className="flex items-start justify-between">
                                                                                <div className="flex-1">
                                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                                        <h4 className="font-semibold text-lg">
                                                                                            {
                                                                                                productName
                                                                                            }
                                                                                        </h4>
                                                                                        {isPrimary && (
                                                                                            <span className="px-2 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium">
                                                                                                Primary
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                    <p className="text-lg font-bold text-primary">
                                                                                        $
                                                                                        {
                                                                                            productPrice
                                                                                        }
                                                                                    </p>
                                                                                </div>
                                                                                <div className="flex items-center gap-2">
                                                                                    <CustomButton
                                                                                        onClick={() => {
                                                                                            const currentProducts =
                                                                                                result.products ||
                                                                                                [];
                                                                                            const newProducts =
                                                                                                currentProducts.map(
                                                                                                    (
                                                                                                        p,
                                                                                                        idx
                                                                                                    ) => ({
                                                                                                        ...p,
                                                                                                        isPrimary:
                                                                                                            idx ===
                                                                                                            productIndex
                                                                                                                ? !isPrimary
                                                                                                                : false,
                                                                                                    })
                                                                                                );
                                                                                            updateResult(
                                                                                                result.id,
                                                                                                "products",
                                                                                                newProducts
                                                                                            );
                                                                                        }}
                                                                                        variant={
                                                                                            isPrimary
                                                                                                ? "outline"
                                                                                                : "outline"
                                                                                        }
                                                                                        size="sm"
                                                                                    >
                                                                                        {isPrimary
                                                                                            ? "Unmark Primary"
                                                                                            : "Mark Primary"}
                                                                                    </CustomButton>
                                                                                    <CustomButton
                                                                                        variant="ghost"
                                                                                        size="sm"
                                                                                        onClick={() => {
                                                                                            const currentProducts =
                                                                                                result.products ||
                                                                                                [];
                                                                                            const newProducts =
                                                                                                currentProducts.filter(
                                                                                                    (
                                                                                                        _,
                                                                                                        idx
                                                                                                    ) =>
                                                                                                        idx !==
                                                                                                        productIndex
                                                                                                );
                                                                                            updateResult(
                                                                                                result.id,
                                                                                                "products",
                                                                                                newProducts
                                                                                            );
                                                                                        }}
                                                                                        className="text-destructive hover:text-white dark:text-red-500"
                                                                                    >
                                                                                        <Trash2 className="h-4 w-4" />
                                                                                    </CustomButton>
                                                                                </div>
                                                                            </div>
                                                                            {productDescription && (
                                                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                                                    {
                                                                                        productDescription
                                                                                    }
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                    )}
                                                </div>
                                            )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
