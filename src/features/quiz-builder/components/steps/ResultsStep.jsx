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
    Link2,
    X,
    ChevronsUpDown,
    ChevronsDownUp,
} from "lucide-react";
import {
    CustomButton,
    CustomInput,
    CustomLabel,
    FormField,
} from "@/components/ui";
import { cn } from "@/utils/cn";
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

    // Initialize results with default if empty
    const results = useMemo(() => {
        const existingResults = data?.results || [];
        if (existingResults.length === 0) {
            return [
                {
                    id: 1,
                    isDefault: true,
                    title: "",
                    description: "",
                    note: "",
                    image: "",
                    imageType: "upload",
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
        // Ensure all results have imageType
        return normalizedResults.map((r) => ({
            ...r,
            imageType: r.imageType || "upload",
        }));
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
        return (
            result.title?.trim() &&
            result.description?.trim() &&
            result.image?.trim()
        );
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
            description: "",
            note: "",
            image: "",
            imageType: "upload",
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

    const updateResultImageType = (id, imageType) => {
        setResults(
            results.map((r) =>
                r.id === id ? { ...r, imageType: imageType || "upload" } : r
            )
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

                                    <div className="space-y-2">
                                        <CustomLabel
                                            htmlFor={`description-${result.id}`}
                                        >
                                            Description
                                            <span className="text-red-600 dark:text-red-400 ml-1">
                                                *
                                            </span>
                                        </CustomLabel>
                                        <textarea
                                            id={`description-${result.id}`}
                                            value={result.description || ""}
                                            onChange={(e) =>
                                                updateResult(
                                                    result.id,
                                                    "description",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Enter result description"
                                            rows={4}
                                            className="w-full px-3 py-2 border border-input rounded-md bg-background dark:bg-gray-800 text-white dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <CustomLabel
                                            htmlFor={`note-${result.id}`}
                                        >
                                            Note
                                        </CustomLabel>
                                        <textarea
                                            id={`note-${result.id}`}
                                            value={result.note || ""}
                                            onChange={(e) =>
                                                updateResult(
                                                    result.id,
                                                    "note",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Enter additional notes (optional)"
                                            rows={3}
                                            className="w-full px-3 py-2 border border-input rounded-md bg-background dark:bg-gray-800 text-white dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <CustomLabel>
                                                Image
                                                <span className="text-red-600 dark:text-red-400 ml-1">
                                                    *
                                                </span>
                                            </CustomLabel>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateResultImageType(
                                                            result.id,
                                                            "upload"
                                                        )
                                                    }
                                                    className={cn(
                                                        "px-2 py-1 text-xs rounded transition-colors",
                                                        result.imageType ===
                                                            "upload"
                                                            ? "bg-primary text-primary-foreground"
                                                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                                    )}
                                                >
                                                    Upload
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateResultImageType(
                                                            result.id,
                                                            "link"
                                                        )
                                                    }
                                                    className={cn(
                                                        "px-2 py-1 text-xs rounded transition-colors flex items-center gap-1",
                                                        result.imageType ===
                                                            "link"
                                                            ? "bg-primary text-primary-foreground"
                                                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                                    )}
                                                >
                                                    <Link2 className="h-3 w-3" />
                                                    Link
                                                </button>
                                            </div>
                                        </div>
                                        {result.imageType === "upload" ? (
                                            <SingleImageUpload
                                                label=""
                                                value={result.image || ""}
                                                onChange={(url) =>
                                                    updateResult(
                                                        result.id,
                                                        "image",
                                                        url || ""
                                                    )
                                                }
                                                onRemove={() =>
                                                    updateResult(
                                                        result.id,
                                                        "image",
                                                        ""
                                                    )
                                                }
                                                className="md:w-[70%] w-full"
                                            />
                                        ) : (
                                            <div className="space-y-2">
                                                <FormField
                                                    id={`image-link-${result.id}`}
                                                    label=""
                                                    value={result.image || ""}
                                                    onChange={(e) =>
                                                        updateResult(
                                                            result.id,
                                                            "image",
                                                            e.target.value || ""
                                                        )
                                                    }
                                                    placeholder="https://example.com/image.jpg"
                                                    type="url"
                                                />
                                                {result.image && (
                                                    <div className="relative inline-block">
                                                        <img
                                                            src={result.image}
                                                            alt="Result preview"
                                                            className="max-w-full h-auto max-h-32 rounded-md border border-input object-contain"
                                                            onError={(e) => {
                                                                e.target.style.display =
                                                                    "none";
                                                            }}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateResult(
                                                                    result.id,
                                                                    "image",
                                                                    ""
                                                                )
                                                            }
                                                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                                            title="Remove image"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
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
