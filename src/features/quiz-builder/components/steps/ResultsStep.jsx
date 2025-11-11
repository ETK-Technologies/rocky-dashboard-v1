"use client";
/* eslint-disable @next/next/no-img-element */

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
    Link2,
    X,
} from "lucide-react";
import {
    CustomButton,
    CustomInput,
    CustomLabel,
    FormField,
} from "@/components/ui";
import { useProducts } from "@/features/products/hooks/useProducts";
import { SingleImageUpload } from "../SingleImageUpload";

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

    const getProductId = (product) => product?.id || product?._id || "";
    const getProductName = (product) =>
        product?.name || product?.title || "Unnamed Product";

    // Initialize results with default if empty
    const results = useMemo(() => {
        const normalizeResult = (result, index) => ({
            ...result,
            isDefault: result?.isDefault ?? index === 0,
            resultType: result?.resultType || "Product",
            alertImage: result?.alertImage || "",
            alertDescription: result?.alertDescription || "",
            alertImageType: result?.alertImageType || "upload",
            redirectUrl: result?.redirectUrl || "",
            mainProductId: result?.mainProductId || "",
            title: result?.title || "",
        });

        const existingResults = (data?.results || []).map((result, index) =>
            normalizeResult(result, index)
        );
        if (existingResults.length === 0) {
            return [
                {
                    id: 1,
                    isDefault: true,
                    resultType: "Product",
                    alertImage: "",
                    alertDescription: "",
                    alertImageType: "upload",
                    mainProductId: "",
                    redirectUrl: "",
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
    const [productSearchTerms, setProductSearchTerms] = useState({});
    const [activeProductDropdown, setActiveProductDropdown] = useState(null);
    const [mainProductSearchTerms, setMainProductSearchTerms] = useState({});
    const [activeMainProductDropdown, setActiveMainProductDropdown] =
        useState(null);

    // Check if a result is complete
    const isResultComplete = (result) => {
        const resultType = result?.resultType || "Product";

        // Title is required
        if (!result.title?.trim()) {
            return false;
        }

        if (resultType === "Product") {
            if (!result.mainProductId?.trim()) {
                return false;
            }
        } else if (resultType === "Redirect") {
            if (!result.redirectUrl?.trim()) {
                return false;
            }
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
            resultType: "Product",
            alertImage: "",
            alertDescription: "",
            alertImageType: "upload",
            mainProductId: "",
            redirectUrl: "",
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
                resultType: resultToDuplicate.resultType || "Product",
                alertImage: resultToDuplicate.alertImage || "",
                alertDescription: resultToDuplicate.alertDescription || "",
                alertImageType: resultToDuplicate.alertImageType || "upload",
                mainProductId: resultToDuplicate.mainProductId || "",
                redirectUrl: resultToDuplicate.redirectUrl || "",
                title:
                    (resultToDuplicate.resultType || "Product") === "Product"
                        ? resultToDuplicate.title || ""
                        : `${resultToDuplicate.title || "Result"} (Copy)`,
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

    const applyProductUpdate = (result, newProducts, extraFields = {}) => ({
        ...result,
        ...extraFields,
        products: Array.isArray(newProducts) ? newProducts : [],
    });

    const handleResultTypeChange = (id, newType) => {
        setResults(
            results.map((r) => {
                if (r.id !== id) {
                    return r;
                }
                return {
                    ...r,
                    resultType: newType,
                    title: "",
                    mainProductId: "",
                    selectedProductId: "",
                    products: [],
                    continuePopup:
                        newType === "Product" ? r.continuePopup : false,
                    addons: newType === "Product" ? r.addons : false,
                };
            })
        );

        setProductSearchTerms((prev) => {
            if (!prev[id]) {
                return prev;
            }
            const next = { ...prev };
            delete next[id];
            return next;
        });

        setMainProductSearchTerms((prev) => {
            if (!prev[id]) {
                return prev;
            }
            const next = { ...prev };
            delete next[id];
            return next;
        });

        setActiveProductDropdown((current) =>
            current === id ? null : current
        );
        setActiveMainProductDropdown((current) =>
            current === id ? null : current
        );
    };

    const handleMainProductChange = (currentResult, productId) => {
        const productSource = productId
            ? allProducts.find(
                  (product) => getProductId(product) === productId
              ) ||
              (Array.isArray(currentResult.products)
                  ? currentResult.products.find(
                        (product) => getProductId(product) === productId
                    )
                  : null)
            : null;
        const productName = productSource ? getProductName(productSource) : "";

        setResults(
            results.map((r) => {
                if (r.id !== currentResult.id) {
                    return r;
                }

                if (!productId) {
                    return {
                        ...r,
                        mainProductId: "",
                        title: "",
                    };
                }

                return {
                    ...r,
                    mainProductId: productId,
                    title: productName || r.title || "",
                };
            })
        );

        setMainProductSearchTerms((prev) => {
            const next = { ...prev };
            if (productId) {
                next[currentResult.id] = productName;
            } else {
                delete next[currentResult.id];
            }
            return next;
        });

        setActiveMainProductDropdown((current) =>
            current === currentResult.id ? null : current
        );
    };

    const handleProductSearchChange = (resultId, value) => {
        setProductSearchTerms((prev) => ({
            ...prev,
            [resultId]: value,
        }));
    };

    const handleMainProductSearchChange = (resultId, value) => {
        setMainProductSearchTerms((prev) => ({
            ...prev,
            [resultId]: value,
        }));
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

    const handleToggleAddons = (resultId, isChecked) => {
        setResults(
            results.map((r) => {
                if (r.id !== resultId) {
                    return r;
                }

                const updatedResult = {
                    ...r,
                    addons: isChecked,
                };

                if (!isChecked) {
                    updatedResult.products = [];
                    updatedResult.selectedProductId = "";
                }

                return updatedResult;
            })
        );
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
                                            <span className="px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium capitalize">
                                                {result.resultType || "Product"}
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
                                    <div className="grid  gap-4">
                                        <div className="flex flex-col gap-2">
                                            <CustomLabel
                                                htmlFor={`result-type-${result.id}`}
                                            >
                                                Result Type
                                            </CustomLabel>
                                            <select
                                                id={`result-type-${result.id}`}
                                                value={
                                                    result.resultType ||
                                                    "Product"
                                                }
                                                onChange={(e) =>
                                                    handleResultTypeChange(
                                                        result.id,
                                                        e.target.value
                                                    )
                                                }
                                                className="px-3 py-2 border border-input rounded-md bg-background dark:bg-gray-800 dark:text-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                            >
                                                <option value="Product">
                                                    Product
                                                </option>
                                                <option value="Alert">
                                                    Alert
                                                </option>
                                                <option value="Redirect">
                                                    Redirect
                                                </option>
                                            </select>
                                        </div>
                                    </div>

                                    {(result.resultType || "Product") ===
                                    "Product" ? (
                                        (() => {
                                            const allProductsList =
                                                Array.isArray(allProducts)
                                                    ? allProducts
                                                    : [];
                                            const primaryProductId =
                                                result.mainProductId ||
                                                (Array.isArray(result.products)
                                                    ? getProductId(
                                                          result.products.find(
                                                              (product) =>
                                                                  product?.isPrimary
                                                          )
                                                      )
                                                    : "") ||
                                                "";

                                            const selectedMainProduct =
                                                primaryProductId
                                                    ? allProductsList.find(
                                                          (product) =>
                                                              getProductId(
                                                                  product
                                                              ) ===
                                                              primaryProductId
                                                      ) ||
                                                      (Array.isArray(
                                                          result.products
                                                      )
                                                          ? result.products.find(
                                                                (product) =>
                                                                    getProductId(
                                                                        product
                                                                    ) ===
                                                                    primaryProductId
                                                            )
                                                          : null)
                                                    : null;

                                            return (
                                                <div className="space-y-3 flex flex-col gap-0">
                                                    <CustomLabel
                                                        htmlFor={`main-product-${result.id}`}
                                                    >
                                                        Product{" "}
                                                        <span className="text-red-500">
                                                            *
                                                        </span>
                                                    </CustomLabel>

                                                    <div className="relative w-full">
                                                        {(() => {
                                                            const searchTerm =
                                                                mainProductSearchTerms[
                                                                    result.id
                                                                ] ??
                                                                (selectedMainProduct
                                                                    ? getProductName(
                                                                          selectedMainProduct
                                                                      )
                                                                    : "");
                                                            const normalizedTerm =
                                                                searchTerm
                                                                    .toLowerCase()
                                                                    .trim();
                                                            const filteredProducts =
                                                                allProductsList.filter(
                                                                    (
                                                                        product
                                                                    ) => {
                                                                        const productName =
                                                                            getProductName(
                                                                                product
                                                                            ).toLowerCase();
                                                                        return (
                                                                            normalizedTerm.length ===
                                                                                0 ||
                                                                            productName.includes(
                                                                                normalizedTerm
                                                                            )
                                                                        );
                                                                    }
                                                                );

                                                            return (
                                                                <>
                                                                    <CustomInput
                                                                        value={
                                                                            searchTerm
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) => {
                                                                            handleMainProductSearchChange(
                                                                                result.id,
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            );
                                                                            setActiveMainProductDropdown(
                                                                                result.id
                                                                            );
                                                                        }}
                                                                        onFocus={() =>
                                                                            setActiveMainProductDropdown(
                                                                                result.id
                                                                            )
                                                                        }
                                                                        onBlur={() => {
                                                                            setTimeout(
                                                                                () => {
                                                                                    setActiveMainProductDropdown(
                                                                                        (
                                                                                            current
                                                                                        ) =>
                                                                                            current ===
                                                                                            result.id
                                                                                                ? null
                                                                                                : current
                                                                                    );

                                                                                    if (
                                                                                        !primaryProductId
                                                                                    ) {
                                                                                        setMainProductSearchTerms(
                                                                                            (
                                                                                                prev
                                                                                            ) => {
                                                                                                const next =
                                                                                                    {
                                                                                                        ...prev,
                                                                                                    };
                                                                                                if (
                                                                                                    (
                                                                                                        prev[
                                                                                                            result
                                                                                                                .id
                                                                                                        ] ||
                                                                                                        ""
                                                                                                    ).trim() ===
                                                                                                    ""
                                                                                                ) {
                                                                                                    delete next[
                                                                                                        result
                                                                                                            .id
                                                                                                    ];
                                                                                                }
                                                                                                return next;
                                                                                            }
                                                                                        );
                                                                                    } else if (
                                                                                        selectedMainProduct
                                                                                    ) {
                                                                                        const desiredName =
                                                                                            getProductName(
                                                                                                selectedMainProduct
                                                                                            );
                                                                                        setMainProductSearchTerms(
                                                                                            (
                                                                                                prev
                                                                                            ) => {
                                                                                                if (
                                                                                                    prev[
                                                                                                        result
                                                                                                            .id
                                                                                                    ] ===
                                                                                                    desiredName
                                                                                                ) {
                                                                                                    return prev;
                                                                                                }
                                                                                                return {
                                                                                                    ...prev,
                                                                                                    [result.id]:
                                                                                                        desiredName,
                                                                                                };
                                                                                            }
                                                                                        );
                                                                                    }
                                                                                },
                                                                                150
                                                                            );
                                                                        }}
                                                                        placeholder="Search products..."
                                                                        className="w-full"
                                                                        disabled={
                                                                            productsLoading
                                                                        }
                                                                    />
                                                                    {activeMainProductDropdown ===
                                                                        result.id && (
                                                                        <div className="absolute z-40 mt-2 w-full max-h-60 overflow-y-auto rounded-md border border-border bg-popover shadow-lg">
                                                                            {productsLoading ? (
                                                                                <p className="px-3 py-2 text-sm text-muted-foreground">
                                                                                    Loading
                                                                                    products...
                                                                                </p>
                                                                            ) : filteredProducts.length ===
                                                                              0 ? (
                                                                                <p className="px-3 py-2 text-sm text-muted-foreground">
                                                                                    No
                                                                                    products
                                                                                    found
                                                                                </p>
                                                                            ) : (
                                                                                filteredProducts.map(
                                                                                    (
                                                                                        product
                                                                                    ) => {
                                                                                        const productId =
                                                                                            getProductId(
                                                                                                product
                                                                                            );
                                                                                        const productName =
                                                                                            getProductName(
                                                                                                product
                                                                                            );
                                                                                        const productPrice =
                                                                                            product.basePrice ||
                                                                                            product.price ||
                                                                                            product.amount ||
                                                                                            "0.00";

                                                                                        return (
                                                                                            <button
                                                                                                key={
                                                                                                    productId
                                                                                                }
                                                                                                type="button"
                                                                                                className="flex w-full flex-col items-start px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                                                                                                onMouseDown={(
                                                                                                    event
                                                                                                ) => {
                                                                                                    event.preventDefault();
                                                                                                    handleMainProductChange(
                                                                                                        result,
                                                                                                        productId
                                                                                                    );
                                                                                                    setMainProductSearchTerms(
                                                                                                        (
                                                                                                            prev
                                                                                                        ) => ({
                                                                                                            ...prev,
                                                                                                            [result.id]:
                                                                                                                productName,
                                                                                                        })
                                                                                                    );
                                                                                                    setActiveMainProductDropdown(
                                                                                                        null
                                                                                                    );
                                                                                                }}
                                                                                            >
                                                                                                <span className="font-medium">
                                                                                                    {
                                                                                                        productName
                                                                                                    }
                                                                                                </span>
                                                                                                <span className="text-xs text-muted-foreground">
                                                                                                    $
                                                                                                    {
                                                                                                        productPrice
                                                                                                    }
                                                                                                </span>
                                                                                            </button>
                                                                                        );
                                                                                    }
                                                                                )
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </>
                                                            );
                                                        })()}
                                                    </div>

                                                    {!selectedMainProduct && (
                                                        <p
                                                            className={`text-xs ${
                                                                primaryProductId
                                                                    ? "text-muted-foreground"
                                                                    : "text-red-500"
                                                            }`}
                                                        >
                                                            Product selection is
                                                            required.
                                                        </p>
                                                    )}
                                                    {primaryProductId &&
                                                        selectedMainProduct && (
                                                            <div className="border rounded-lg p-4 bg-card space-y-3">
                                                                <div className="flex items-start justify-between gap-4">
                                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                        <div className="w-16 h-16 rounded-md border border-input flex items-center justify-center bg-muted shrink-0 relative overflow-hidden">
                                                                            {selectedMainProduct.images &&
                                                                            selectedMainProduct
                                                                                .images
                                                                                .length >
                                                                                0 ? (
                                                                                <img
                                                                                    src={
                                                                                        selectedMainProduct
                                                                                            .images[0]
                                                                                            .url ||
                                                                                        selectedMainProduct
                                                                                            .images[0]
                                                                                            .src
                                                                                    }
                                                                                    alt={getProductName(
                                                                                        selectedMainProduct
                                                                                    )}
                                                                                    className="w-full h-full object-cover rounded-md"
                                                                                    onError={(
                                                                                        e
                                                                                    ) => {
                                                                                        e.target.style.display =
                                                                                            "none";
                                                                                        const placeholder =
                                                                                            e.target.parentElement.querySelector(
                                                                                                ".main-product-placeholder"
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
                                                                                className="main-product-placeholder w-full h-full flex items-center justify-center text-xs text-muted-foreground"
                                                                                style={{
                                                                                    display:
                                                                                        selectedMainProduct.images &&
                                                                                        selectedMainProduct
                                                                                            .images
                                                                                            .length >
                                                                                            0
                                                                                            ? "none"
                                                                                            : "flex",
                                                                                }}
                                                                            >
                                                                                No
                                                                                Image
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <p className="font-semibold text-sm line-clamp-1">
                                                                                {getProductName(
                                                                                    selectedMainProduct
                                                                                )}
                                                                            </p>
                                                                            <p className="text-sm text-muted-foreground">
                                                                                $
                                                                                {selectedMainProduct.basePrice ||
                                                                                    selectedMainProduct.price ||
                                                                                    selectedMainProduct.amount ||
                                                                                    "0.00"}
                                                                            </p>
                                                                            <p
                                                                                className="text-xs text-muted-foreground"
                                                                                dangerouslySetInnerHTML={{
                                                                                    __html:
                                                                                        selectedMainProduct.description ||
                                                                                        "",
                                                                                }}
                                                                            ></p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    {primaryProductId &&
                                                        result.title && (
                                                            <p className="text-xs text-muted-foreground">
                                                                Result title:{" "}
                                                                <span className="font-medium">
                                                                    {
                                                                        result.title
                                                                    }
                                                                </span>
                                                            </p>
                                                        )}
                                                </div>
                                            );
                                        })()
                                    ) : (
                                        <FormField
                                            id={`title-${result.id}`}
                                            label="Title"
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
                                    )}

                                    {(result.resultType || "Product") ===
                                        "Alert" && (
                                        <div className="space-y-4">
                                            <div className="flex flex-col gap-2">
                                                <CustomLabel
                                                    htmlFor={`alert-description-${result.id}`}
                                                >
                                                    Description
                                                </CustomLabel>
                                                <textarea
                                                    id={`alert-description-${result.id}`}
                                                    value={
                                                        result.alertDescription ||
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        updateResult(
                                                            result.id,
                                                            "alertDescription",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Provide a description for this alert..."
                                                    className="px-3 py-2 border border-input rounded-md bg-background dark:bg-gray-800 dark:text-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-h-[120px]"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <CustomLabel>Image</CustomLabel>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateResult(
                                                                result.id,
                                                                "alertImageType",
                                                                "upload"
                                                            )
                                                        }
                                                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                                                            (result.alertImageType ||
                                                                "upload") ===
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
                                                            updateResult(
                                                                result.id,
                                                                "alertImageType",
                                                                "link"
                                                            )
                                                        }
                                                        className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1 ${
                                                            (result.alertImageType ||
                                                                "upload") ===
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

                                            {(result.alertImageType ||
                                                "upload") === "upload" ? (
                                                <SingleImageUpload
                                                    label=""
                                                    value={
                                                        result.alertImage || ""
                                                    }
                                                    onChange={(url) =>
                                                        updateResult(
                                                            result.id,
                                                            "alertImage",
                                                            url || ""
                                                        )
                                                    }
                                                    onRemove={() =>
                                                        updateResult(
                                                            result.id,
                                                            "alertImage",
                                                            ""
                                                        )
                                                    }
                                                    helperText="Optional image for this alert."
                                                    className="md:w-[50%] sm:w-[70%] w-full"
                                                />
                                            ) : (
                                                <div className="space-y-3">
                                                    <CustomLabel
                                                        htmlFor={`alert-image-link-${result.id}`}
                                                    >
                                                        Image Link
                                                    </CustomLabel>
                                                    <CustomInput
                                                        id={`alert-image-link-${result.id}`}
                                                        value={
                                                            result.alertImage ||
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            updateResult(
                                                                result.id,
                                                                "alertImage",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="https://example.com/alert-image.jpg"
                                                        className="w-full"
                                                        type="url"
                                                    />
                                                    {result.alertImage && (
                                                        <div className="relative inline-block">
                                                            <img
                                                                src={
                                                                    result.alertImage
                                                                }
                                                                alt="Alert preview"
                                                                className="max-w-full h-auto max-h-64 rounded-md border border-input object-contain"
                                                                onError={(
                                                                    e
                                                                ) => {
                                                                    e.target.style.display =
                                                                        "none";
                                                                }}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    updateResult(
                                                                        result.id,
                                                                        "alertImage",
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
                                    )}

                                    {(result.resultType || "Product") ===
                                        "Redirect" && (
                                        <div className="space-y-2">
                                            <CustomLabel
                                                htmlFor={`redirect-url-${result.id}`}
                                            >
                                                Redirect Link{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </CustomLabel>
                                            <CustomInput
                                                id={`redirect-url-${result.id}`}
                                                type="url"
                                                value={result.redirectUrl || ""}
                                                onChange={(e) =>
                                                    updateResult(
                                                        result.id,
                                                        "redirectUrl",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="https://example.com/thank-you"
                                                className="w-full"
                                            />
                                            <p
                                                className={`text-xs ${
                                                    result.redirectUrl?.trim()
                                                        ? "text-muted-foreground"
                                                        : "text-red-500"
                                                }`}
                                            >
                                                Redirect link is required.
                                            </p>
                                        </div>
                                    )}

                                    {(result.resultType || "Product") ===
                                        "Product" && (
                                        <div className="border px-4 py-3 rounded-md space-y-3">
                                            <div className="flex items-center justify-between">
                                                <CustomLabel>
                                                    Cross Sell
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
                                                                e.target
                                                                    .checked;
                                                            setResults(
                                                                results.map(
                                                                    (r) =>
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
                                                                handleToggleAddons(
                                                                    result.id,
                                                                    e.target
                                                                        .checked
                                                                )
                                                            }
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Products Section */}
                                    {(result.resultType || "Product") ===
                                        "Product" &&
                                        result.addons && (
                                            <div className="space-y-4">
                                                <div>
                                                    <CustomLabel
                                                        htmlFor={`products-${result.id}`}
                                                    >
                                                        Add-ons Products
                                                    </CustomLabel>
                                                    <p className="text-xs mt-1 text-muted-foreground">
                                                        Optional products to
                                                        show in the add-ons
                                                        modal
                                                    </p>
                                                </div>
                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                                                    <div className="relative flex-1 w-full">
                                                        {(() => {
                                                            const allProductsList =
                                                                Array.isArray(
                                                                    allProducts
                                                                )
                                                                    ? allProducts
                                                                    : [];
                                                            const currentProducts =
                                                                Array.isArray(
                                                                    result.products
                                                                )
                                                                    ? result.products
                                                                    : [];
                                                            const selectedProduct =
                                                                (result.selectedProductId &&
                                                                    (allProductsList.find(
                                                                        (
                                                                            product
                                                                        ) =>
                                                                            getProductId(
                                                                                product
                                                                            ) ===
                                                                            result.selectedProductId
                                                                    ) ||
                                                                        currentProducts.find(
                                                                            (
                                                                                product
                                                                            ) =>
                                                                                getProductId(
                                                                                    product
                                                                                ) ===
                                                                                result.selectedProductId
                                                                        ))) ||
                                                                null;
                                                            const searchTerm =
                                                                productSearchTerms[
                                                                    result.id
                                                                ] ??
                                                                (selectedProduct
                                                                    ? getProductName(
                                                                          selectedProduct
                                                                      )
                                                                    : "");
                                                            const normalizedTerm =
                                                                searchTerm
                                                                    .toLowerCase()
                                                                    .trim();
                                                            const filteredProducts =
                                                                allProductsList.filter(
                                                                    (
                                                                        product
                                                                    ) => {
                                                                        const productName =
                                                                            getProductName(
                                                                                product
                                                                            ).toLowerCase();
                                                                        return (
                                                                            normalizedTerm.length ===
                                                                                0 ||
                                                                            productName.includes(
                                                                                normalizedTerm
                                                                            )
                                                                        );
                                                                    }
                                                                );

                                                            return (
                                                                <>
                                                                    <CustomInput
                                                                        value={
                                                                            searchTerm
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) => {
                                                                            handleProductSearchChange(
                                                                                result.id,
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            );
                                                                            setActiveProductDropdown(
                                                                                result.id
                                                                            );
                                                                        }}
                                                                        onFocus={() =>
                                                                            setActiveProductDropdown(
                                                                                result.id
                                                                            )
                                                                        }
                                                                        onBlur={() => {
                                                                            setTimeout(
                                                                                () => {
                                                                                    setActiveProductDropdown(
                                                                                        (
                                                                                            current
                                                                                        ) =>
                                                                                            current ===
                                                                                            result.id
                                                                                                ? null
                                                                                                : current
                                                                                    );
                                                                                },
                                                                                150
                                                                            );
                                                                        }}
                                                                        placeholder="Search products..."
                                                                        className="w-full"
                                                                        disabled={
                                                                            productsLoading
                                                                        }
                                                                    />
                                                                    {activeProductDropdown ===
                                                                        result.id && (
                                                                        <div className="absolute z-40 mt-2 w-full max-h-60 overflow-y-auto rounded-md border border-border bg-popover shadow-lg">
                                                                            {productsLoading ? (
                                                                                <p className="px-3 py-2 text-sm text-muted-foreground">
                                                                                    Loading
                                                                                    products...
                                                                                </p>
                                                                            ) : filteredProducts.length ===
                                                                              0 ? (
                                                                                <p className="px-3 py-2 text-sm text-muted-foreground">
                                                                                    No
                                                                                    products
                                                                                    found
                                                                                </p>
                                                                            ) : (
                                                                                filteredProducts.map(
                                                                                    (
                                                                                        product
                                                                                    ) => {
                                                                                        const productId =
                                                                                            getProductId(
                                                                                                product
                                                                                            );
                                                                                        const productName =
                                                                                            getProductName(
                                                                                                product
                                                                                            );
                                                                                        const productPrice =
                                                                                            product.basePrice ||
                                                                                            product.price ||
                                                                                            product.amount ||
                                                                                            "0.00";
                                                                                        const isAlreadyAdded =
                                                                                            currentProducts.some(
                                                                                                (
                                                                                                    p
                                                                                                ) =>
                                                                                                    getProductId(
                                                                                                        p
                                                                                                    ) ===
                                                                                                    productId
                                                                                            );

                                                                                        return (
                                                                                            <button
                                                                                                key={
                                                                                                    productId
                                                                                                }
                                                                                                type="button"
                                                                                                className={`flex w-full flex-col items-start px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${
                                                                                                    isAlreadyAdded
                                                                                                        ? "cursor-not-allowed opacity-60"
                                                                                                        : ""
                                                                                                }`}
                                                                                                disabled={
                                                                                                    isAlreadyAdded
                                                                                                }
                                                                                                onMouseDown={(
                                                                                                    event
                                                                                                ) => {
                                                                                                    event.preventDefault();
                                                                                                    if (
                                                                                                        isAlreadyAdded
                                                                                                    ) {
                                                                                                        return;
                                                                                                    }
                                                                                                    updateResult(
                                                                                                        result.id,
                                                                                                        "selectedProductId",
                                                                                                        productId
                                                                                                    );
                                                                                                    handleProductSearchChange(
                                                                                                        result.id,
                                                                                                        productName
                                                                                                    );
                                                                                                    setActiveProductDropdown(
                                                                                                        null
                                                                                                    );
                                                                                                }}
                                                                                            >
                                                                                                <span className="font-medium">
                                                                                                    {
                                                                                                        productName
                                                                                                    }
                                                                                                </span>
                                                                                                <span className="text-xs text-muted-foreground">
                                                                                                    $
                                                                                                    {
                                                                                                        productPrice
                                                                                                    }
                                                                                                </span>
                                                                                                {isAlreadyAdded && (
                                                                                                    <span className="text-[10px] uppercase text-muted-foreground">
                                                                                                        Already
                                                                                                        added
                                                                                                    </span>
                                                                                                )}
                                                                                            </button>
                                                                                        );
                                                                                    }
                                                                                )
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </>
                                                            );
                                                        })()}
                                                    </div>
                                                    <CustomButton
                                                        onClick={() => {
                                                            const selectedProduct =
                                                                allProducts.find(
                                                                    (p) =>
                                                                        getProductId(
                                                                            p
                                                                        ) ===
                                                                        result.selectedProductId
                                                                );
                                                            if (
                                                                selectedProduct
                                                            ) {
                                                                const currentProducts =
                                                                    Array.isArray(
                                                                        result.products
                                                                    )
                                                                        ? result.products
                                                                        : [];
                                                                const newProducts =
                                                                    [
                                                                        ...currentProducts,
                                                                        {
                                                                            ...selectedProduct,
                                                                        },
                                                                    ];
                                                                setResults(
                                                                    results.map(
                                                                        (r) =>
                                                                            r.id ===
                                                                            result.id
                                                                                ? applyProductUpdate(
                                                                                      {
                                                                                          ...r,
                                                                                          selectedProductId:
                                                                                              "",
                                                                                      },
                                                                                      newProducts
                                                                                  )
                                                                                : r
                                                                    )
                                                                );
                                                                setProductSearchTerms(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        [result.id]:
                                                                            "",
                                                                    })
                                                                );
                                                                setActiveProductDropdown(
                                                                    null
                                                                );
                                                            }
                                                        }}
                                                        disabled={
                                                            !result.selectedProductId ||
                                                            (
                                                                result.products ||
                                                                []
                                                            ).some(
                                                                (p) =>
                                                                    (p.id ||
                                                                        p._id) ===
                                                                    result.selectedProductId
                                                            )
                                                        }
                                                        className="flex items-center gap-2"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                        Add Product
                                                    </CustomButton>
                                                </div>
                                                {/* Product Cards */}
                                                {Array.isArray(
                                                    result.products
                                                ) &&
                                                    result.products.length >
                                                        0 && (
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
                                                                        product
                                                                            .images
                                                                            .length >
                                                                            0
                                                                            ? product
                                                                                  .images[0]
                                                                                  .url ||
                                                                              product
                                                                                  .images[0]
                                                                                  .src
                                                                            : null;
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
                                                                                            </div>
                                                                                            <p className="text-lg font-bold text-primary">
                                                                                                $
                                                                                                {
                                                                                                    productPrice
                                                                                                }
                                                                                            </p>
                                                                                        </div>
                                                                                        <div>
                                                                                            <CustomButton
                                                                                                variant="ghost"
                                                                                                size="sm"
                                                                                                onClick={() => {
                                                                                                    const currentProducts =
                                                                                                        Array.isArray(
                                                                                                            result.products
                                                                                                        )
                                                                                                            ? result.products
                                                                                                            : [];
                                                                                                    const newProducts =
                                                                                                        currentProducts.filter(
                                                                                                            (
                                                                                                                _,
                                                                                                                idx
                                                                                                            ) =>
                                                                                                                idx !==
                                                                                                                productIndex
                                                                                                        );
                                                                                                    setResults(
                                                                                                        results.map(
                                                                                                            (
                                                                                                                r
                                                                                                            ) =>
                                                                                                                r.id ===
                                                                                                                result.id
                                                                                                                    ? applyProductUpdate(
                                                                                                                          r,
                                                                                                                          newProducts
                                                                                                                      )
                                                                                                                    : r
                                                                                                        )
                                                                                                    );
                                                                                                }}
                                                                                                className="text-destructive hover:text-white dark:text-red-500"
                                                                                            >
                                                                                                <Trash2 className="h-4 w-4" />
                                                                                            </CustomButton>
                                                                                        </div>
                                                                                    </div>
                                                                                    {productDescription && (
                                                                                        <p
                                                                                            className="text-sm text-muted-foreground line-clamp-2"
                                                                                            dangerouslySetInnerHTML={{
                                                                                                __html: productDescription,
                                                                                            }}
                                                                                        ></p>
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
                                        )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
