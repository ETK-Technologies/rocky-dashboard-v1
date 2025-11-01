"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";
import {
    CustomCard,
    CustomCardHeader,
    CustomCardTitle,
    CustomCardContent,
    CustomBadge,
} from "@/components/ui";
import { BookCopy, X, Edit } from "lucide-react";
import { stepTypes } from "./Steps";

export default function FlowSteps({
    steps = [],
    onStepClick,
    onRemoveStep,
    onReorderSteps,
    onAddStep,
    selectedStep,
    onEditStep,
}) {
    const stepCount = steps.length;
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [draggedStepIndex, setDraggedStepIndex] = useState(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Check if we're dragging a new step (from Steps component)
        const hasStepTypeData =
            e.dataTransfer.types.includes("application/json");
        if (hasStepTypeData) {
            e.dataTransfer.dropEffect = "copy";
        } else {
            e.dataTransfer.dropEffect = "move";
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverIndex(null);

        // Handle drop from Steps component (new step)
        const stepTypeData = e.dataTransfer.getData("application/json");
        if (stepTypeData) {
            try {
                const stepType = JSON.parse(stepTypeData);
                if (onAddStep && stepType.id) {
                    onAddStep(stepType);
                }
            } catch (err) {
                toast.error("Error adding step. Please try again.");
            }
        }
    };

    const handleStepDragStart = (e, index) => {
        setDraggedStepIndex(index);
        e.dataTransfer.effectAllowed = "move";
        // Set a flag to indicate we're dragging an existing step, not a new one
        e.dataTransfer.setData("text/plain", "reorder-step");
    };

    const handleStepDragOver = (e, index) => {
        e.preventDefault();
        e.stopPropagation();

        // Check if we're dragging a new step (from Steps component) vs reordering
        const hasJsonData = e.dataTransfer.types.includes("application/json");
        const isReordering = draggedStepIndex !== null;

        if (hasJsonData && !isReordering) {
            // New step being dragged over - show drop indicator
            setDragOverIndex(index);
            e.dataTransfer.dropEffect = "copy";
        } else if (isReordering && draggedStepIndex !== index) {
            // Reordering existing step
            setDragOverIndex(index);
            e.dataTransfer.dropEffect = "move";
        }
    };

    const handleStepDrop = (e, dropIndex) => {
        e.preventDefault();
        e.stopPropagation();

        const stepTypeData = e.dataTransfer.getData("application/json");
        const reorderFlag = e.dataTransfer.getData("text/plain");
        const isNewStep = stepTypeData && reorderFlag !== "reorder-step";

        if (isNewStep) {
            // Handle new step drop at this position
            try {
                const stepType = JSON.parse(stepTypeData);
                if (onAddStep && stepType.id) {
                    onAddStep(stepType, dropIndex);
                }
            } catch (err) {
                toast.error("Error adding step. Please try again.");
            }
        } else if (
            draggedStepIndex !== null &&
            draggedStepIndex !== dropIndex &&
            onReorderSteps
        ) {
            // Handle reordering
            const newSteps = [...steps];
            const draggedStep = newSteps[draggedStepIndex];
            newSteps.splice(draggedStepIndex, 1);
            newSteps.splice(dropIndex, 0, draggedStep);
            onReorderSteps(newSteps);
        }

        setDragOverIndex(null);
        setDraggedStepIndex(null);
    };

    const handleStepDragEnd = () => {
        setDragOverIndex(null);
        setDraggedStepIndex(null);
    };

    const getStepTypeConfig = (stepTypeId) => {
        return stepTypes.find((st) => st.id === stepTypeId) || stepTypes[0];
    };

    return (
        <CustomCard>
            <CustomCardHeader>
                <div className="flex items-center justify-between">
                    <CustomCardTitle className="text-lg font-semibold">
                        Flow Steps
                    </CustomCardTitle>
                    <CustomBadge
                        variant="secondary"
                        className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    >
                        {stepCount} {stepCount === 1 ? "step" : "steps"}
                    </CustomBadge>
                </div>
            </CustomCardHeader>
            <CustomCardContent
                onDragOver={(e) => {
                    // Allow drops anywhere in the container
                    const hasJsonData =
                        e.dataTransfer.types.includes("application/json");
                    if (hasJsonData) {
                        e.preventDefault();
                        e.stopPropagation();
                        e.dataTransfer.dropEffect = "copy";
                    }
                }}
                onDrop={(e) => {
                    // Allow dropping anywhere in the container
                    const stepTypeData =
                        e.dataTransfer.getData("application/json");
                    const reorderFlag = e.dataTransfer.getData("text/plain");
                    // Only handle if it's a new step (has JSON data) and not a reorder
                    if (stepTypeData && reorderFlag !== "reorder-step") {
                        handleDrop(e);
                    }
                }}
                onDragEnter={(e) => {
                    // Prevent default to allow drop
                    if (e.dataTransfer.types.includes("application/json")) {
                        e.preventDefault();
                    }
                }}
            >
                {stepCount === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-border rounded-lg bg-gray-50 dark:bg-gray-900/30 transition-colors ">
                        <div className="mb-4">
                            <BookCopy className="h-16 w-16 text-gray-300 dark:text-gray-700" />
                        </div>
                        <p className="text-sm text-muted-foreground text-center">
                            Drag step types here to build your flow
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {steps.map((step, index) => {
                            const stepConfig = getStepTypeConfig(step.type);
                            const Icon = stepConfig.icon;
                            const isSelected = selectedStep?.id === step.id;
                            const isDraggedOver =
                                dragOverIndex === index &&
                                draggedStepIndex !== index;

                            // Get field count (only for form and question types)
                            const hasFields =
                                step.type === "form" ||
                                step.type === "question";
                            const fieldCount =
                                hasFields &&
                                step.fields &&
                                Array.isArray(step.fields)
                                    ? step.fields.length
                                    : 0;

                            return (
                                <div
                                    key={step.id}
                                    draggable
                                    onDragStart={(e) =>
                                        handleStepDragStart(e, index)
                                    }
                                    onDragOver={(e) =>
                                        handleStepDragOver(e, index)
                                    }
                                    onDrop={(e) => handleStepDrop(e, index)}
                                    onDragEnd={handleStepDragEnd}
                                    onClick={() => onStepClick?.(step)}
                                    className={`
                                        relative p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer
                                        ${
                                            isSelected
                                                ? "lg:border-green-500 lg:bg-green-50 lg:dark:bg-green-950/20"
                                                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                                        }
                                        ${
                                            isDraggedOver
                                                ? "border-primary/50 bg-primary/10"
                                                : ""
                                        }
                                    `}
                                >
                                    <div className="flex flex-col gap-1 pr-20">
                                        {/* Step number */}
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Step {index + 1}
                                        </p>
                                        {/* Type and description */}
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            {stepConfig.label}:{" "}
                                            {step.label ||
                                                `New ${stepConfig.label}`}
                                        </p>
                                        {/* Field count (only for form and question) */}
                                        {hasFields && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {fieldCount}{" "}
                                                {fieldCount === 1
                                                    ? "field"
                                                    : "fields"}
                                            </p>
                                        )}
                                    </div>
                                    {/* Action buttons */}
                                    <div className="absolute top-[50%] translate-y-[-50%] right-3 flex items-center gap-2">
                                        {/* Edit button - shown on mobile, hidden on desktop */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEditStep?.(step);
                                            }}
                                            className="xl:hidden p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            aria-label="Edit step"
                                        >
                                            <Edit className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                        </button>
                                        {/* Remove button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRemoveStep?.(step.id);
                                            }}
                                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            aria-label="Remove step"
                                        >
                                            <X className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CustomCardContent>
        </CustomCard>
    );
}
