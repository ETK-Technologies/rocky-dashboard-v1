"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, X, Plus } from "lucide-react";
import {
    CustomCard,
    CustomCardHeader,
    CustomCardTitle,
    CustomCardContent,
    CustomLabel,
    CustomButton,
} from "@/components/ui";
import { FormField } from "@/components/ui/FormField";
import { cn } from "@/utils/cn";

export default function EditStep({
    selectedStep = null,
    steps = [],
    onUpdateStep = null,
    onReorderSteps = null,
    noCard = false,
}) {
    const [formValues, setFormValues] = useState({
        title: "",
        stepIndex: "",
        rules: "[]",
    });
    const [fields, setFields] = useState([]);

    // Helper function to get next unique field ID across all steps
    const getNextFieldId = () => {
        // Extract all field IDs from all steps
        const allFieldIds = [];
        steps.forEach((step) => {
            if (step.fields && Array.isArray(step.fields)) {
                step.fields.forEach((field) => {
                    if (field.fieldId) {
                        // Extract number from fieldId (e.g., "q6" -> 6)
                        const match = field.fieldId.match(/^q(\d+)$/);
                        if (match) {
                            allFieldIds.push(parseInt(match[1]));
                        }
                    }
                });
            }
        });

        // Find the highest number and increment
        const maxId = allFieldIds.length > 0 ? Math.max(...allFieldIds) : 0;
        return `q${maxId + 1}`;
    };

    // Update form when selected step changes
    useEffect(() => {
        if (selectedStep) {
            // Get step index from steps array
            const getStepIndex = () => {
                if (!selectedStep || !steps.length) return "";
                const index = steps.findIndex((s) => s.id === selectedStep.id);
                return index >= 0 ? (index + 1).toString() : "";
            };

            // Parse rules if they exist, otherwise default to empty array
            let rulesValue = "[]";
            if (selectedStep.rules) {
                try {
                    rulesValue =
                        typeof selectedStep.rules === "string"
                            ? selectedStep.rules
                            : JSON.stringify(selectedStep.rules);
                } catch {
                    rulesValue = "[]";
                }
            }

            setFormValues({
                title: selectedStep.label || "",
                stepIndex: getStepIndex(),
                rules: rulesValue,
            });

            // Load fields from selected step
            if (selectedStep.fields && Array.isArray(selectedStep.fields)) {
                setFields(selectedStep.fields);
            } else {
                // For form/question types, initialize with one default field
                if (
                    selectedStep.type === "form" ||
                    selectedStep.type === "question"
                ) {
                    // Helper function inside useEffect to avoid dependency issues
                    const getAllFieldIds = () => {
                        const allFieldIds = [];
                        steps.forEach((step) => {
                            if (step.fields && Array.isArray(step.fields)) {
                                step.fields.forEach((field) => {
                                    if (field.fieldId) {
                                        const match =
                                            field.fieldId.match(/^q(\d+)$/);
                                        if (match) {
                                            allFieldIds.push(
                                                parseInt(match[1])
                                            );
                                        }
                                    }
                                });
                            }
                        });
                        const maxId =
                            allFieldIds.length > 0
                                ? Math.max(...allFieldIds)
                                : 0;
                        return `q${maxId + 1}`;
                    };

                    const fieldId = getAllFieldIds();
                    const defaultField = {
                        id: `field-${Date.now()}-${Math.random()
                            .toString(36)
                            .substr(2, 9)}`,
                        fieldId: fieldId,
                        fieldType: "radio",
                        label: "",
                        required: false,
                        options: "",
                    };
                    setFields([defaultField]);
                    // Auto-save the default field
                    if (onUpdateStep) {
                        onUpdateStep(selectedStep.id, {
                            fields: [defaultField],
                        });
                    }
                } else {
                    setFields([]);
                }
            }
        }
    }, [selectedStep, steps, onUpdateStep]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Update step when title or rules changes
        if (onUpdateStep && selectedStep) {
            if (name === "title") {
                onUpdateStep(selectedStep.id, { label: value });
            } else if (name === "rules") {
                // Validate JSON before updating
                try {
                    JSON.parse(value);
                    onUpdateStep(selectedStep.id, { rules: value });
                } catch (err) {
                    // Invalid JSON, but still update the field for editing
                    // User can fix it
                }
            }
        }
    };

    const handleStepIndexChange = (e) => {
        if (
            parseInt(e.target.value) < 1 ||
            parseInt(e.target.value) > steps.length
        )
            return null;

        const newIndex = parseInt(e.target.value);
        if (
            !isNaN(newIndex) &&
            newIndex > 0 &&
            newIndex <= steps.length &&
            selectedStep &&
            onReorderSteps
        ) {
            // Get current index (0-based)
            const currentIndex = steps.findIndex(
                (s) => s.id === selectedStep.id
            );
            const targetIndex = newIndex - 1; // Convert to 0-based index

            // Only reorder if the index actually changed
            if (currentIndex !== targetIndex && currentIndex >= 0) {
                const newSteps = [...steps];
                // Remove step from current position
                const [movedStep] = newSteps.splice(currentIndex, 1);
                // Insert at new position
                newSteps.splice(targetIndex, 0, movedStep);
                // Update the steps
                onReorderSteps(newSteps);
            } else {
                // Just update the display value if invalid
                setFormValues((prev) => ({
                    ...prev,
                    stepIndex: e.target.value,
                }));
            }
        } else {
            // Update display value even if validation fails
            setFormValues((prev) => ({
                ...prev,
                stepIndex: e.target.value,
            }));
        }
    };

    // Check if this step type should show simple configuration
    const isSimpleType =
        selectedStep &&
        selectedStep.type !== "form" &&
        selectedStep.type !== "question" &&
        selectedStep.type !== "recommendation";

    const isRecommendation =
        selectedStep && selectedStep.type === "recommendation";

    const isFormOrQuestion =
        selectedStep &&
        (selectedStep.type === "form" || selectedStep.type === "question");

    // Handle field changes
    const handleFieldChange = (fieldIndex, fieldUpdates) => {
        const updatedFields = fields.map((field, idx) =>
            idx === fieldIndex ? { ...field, ...fieldUpdates } : field
        );
        setFields(updatedFields);
        if (onUpdateStep && selectedStep) {
            onUpdateStep(selectedStep.id, { fields: updatedFields });
        }
    };

    // Add new field
    const handleAddField = () => {
        const fieldId = getNextFieldId(); // Use unique ID across all steps
        const newField = {
            id: `field-${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 9)}`,
            fieldId: fieldId,
            fieldType: "radio",
            label: "",
            required: false,
            options: "",
        };
        const updatedFields = [...fields, newField];
        setFields(updatedFields);
        if (onUpdateStep && selectedStep) {
            onUpdateStep(selectedStep.id, { fields: updatedFields });
        }
    };

    // Remove field
    const handleRemoveField = (fieldIndex) => {
        const updatedFields = fields.filter((_, idx) => idx !== fieldIndex);
        setFields(updatedFields);
        if (onUpdateStep && selectedStep) {
            onUpdateStep(selectedStep.id, { fields: updatedFields });
        }
    };

    // Check if options field should be shown for a field
    const showOptionsForField = (fieldType) => {
        return (
            fieldType === "radio" ||
            fieldType === "checkbox" ||
            fieldType === "select"
        );
    };

    const content = (
        <>
            {!noCard && (
                <CustomCardHeader>
                    <CustomCardTitle className="text-lg font-semibold">
                        Edit Step
                    </CustomCardTitle>
                </CustomCardHeader>
            )}
            <CustomCardContent>
                {!selectedStep ? (
                    <div className="flex items-center justify-center py-16 px-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <ArrowLeft className="h-5 w-5" />
                            <span className="text-sm">Select a step</span>
                        </div>
                    </div>
                ) : isRecommendation ? (
                    <div className="space-y-6">
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-border">
                            <h3 className="text-sm font-semibold text-foreground mb-4">
                                STEP CONFIGURATION
                            </h3>
                            <div className="space-y-4">
                                <FormField
                                    id="title"
                                    name="title"
                                    label="Title"
                                    value={formValues.title}
                                    onChange={handleInputChange}
                                    placeholder="Enter step title"
                                />
                                <FormField
                                    id="stepIndex"
                                    name="stepIndex"
                                    label="Step Index"
                                    type="number"
                                    value={formValues.stepIndex}
                                    onChange={handleStepIndexChange}
                                    placeholder="Step position"
                                    min={1}
                                    max={steps.length}
                                />
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-border">
                            <h3 className="text-sm font-semibold text-foreground mb-4">
                                RECOMMENDATION ENGINE
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <CustomLabel htmlFor="rules">
                                        Rules (JSON):
                                    </CustomLabel>
                                    <textarea
                                        id="rules"
                                        name="rules"
                                        value={formValues.rules}
                                        onChange={handleInputChange}
                                        placeholder="[]"
                                        rows={10}
                                        className={cn(
                                            "flex w-full rounded-md border px-3 py-2 text-sm transition-colors font-mono",
                                            "bg-white text-gray-900 border-gray-300",
                                            "placeholder:text-gray-500",
                                            "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600",
                                            "dark:placeholder:text-gray-400",
                                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                                            "focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400",
                                            "focus-visible:border-blue-500 dark:focus-visible:border-blue-400",
                                            "resize-y"
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : isSimpleType ? (
                    <div className="space-y-6">
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-border">
                            <h3 className="text-sm font-semibold text-foreground mb-4">
                                STEP CONFIGURATION
                            </h3>
                            <div className="space-y-4">
                                <FormField
                                    id="title"
                                    name="title"
                                    label="Title"
                                    value={formValues.title}
                                    onChange={handleInputChange}
                                    placeholder="Enter step title"
                                />
                                <FormField
                                    id="stepIndex"
                                    name="stepIndex"
                                    label="Step Index"
                                    type="number"
                                    value={formValues.stepIndex}
                                    onChange={handleStepIndexChange}
                                    placeholder="Step position"
                                    min={1}
                                    max={steps.length}
                                />
                            </div>
                        </div>
                    </div>
                ) : isFormOrQuestion ? (
                    <div className="space-y-6">
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-border">
                            <h3 className="text-sm font-semibold text-foreground mb-4">
                                STEP CONFIGURATION
                            </h3>
                            <div className="space-y-4">
                                <FormField
                                    id="title"
                                    name="title"
                                    label="Title"
                                    value={formValues.title}
                                    onChange={handleInputChange}
                                    placeholder="Enter step title"
                                />
                                <FormField
                                    id="stepIndex"
                                    name="stepIndex"
                                    label="Step Index"
                                    type="number"
                                    value={formValues.stepIndex}
                                    onChange={handleStepIndexChange}
                                    placeholder="Step position"
                                    min={1}
                                    max={steps.length}
                                />
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-border">
                            <h3 className="text-sm font-semibold text-foreground mb-4">
                                FIELDS
                            </h3>
                            <div className="space-y-4">
                                {fields.map((field, index) => (
                                    <div
                                        key={field.id || index}
                                        className="bg-white dark:bg-gray-800 rounded-lg border-2 border-l-4 border-l-blue-500 border-gray-200 dark:border-gray-700 p-4"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-sm font-medium text-foreground">
                                                Field {index + 1}
                                            </h4>
                                            <button
                                                onClick={() =>
                                                    handleRemoveField(index)
                                                }
                                                className="px-3 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded transition-colors"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            <FormField
                                                id={`fieldId-${index}`}
                                                name="fieldId"
                                                label="Field ID:"
                                                value={field.fieldId || ""}
                                                onChange={(e) =>
                                                    handleFieldChange(index, {
                                                        fieldId: e.target.value,
                                                    })
                                                }
                                                placeholder="q6"
                                            />
                                            <div className="space-y-2">
                                                <CustomLabel
                                                    htmlFor={`fieldType-${index}`}
                                                >
                                                    Field Type:
                                                </CustomLabel>
                                                <select
                                                    id={`fieldType-${index}`}
                                                    value={
                                                        field.fieldType ||
                                                        "radio"
                                                    }
                                                    onChange={(e) =>
                                                        handleFieldChange(
                                                            index,
                                                            {
                                                                fieldType:
                                                                    e.target
                                                                        .value,
                                                            }
                                                        )
                                                    }
                                                    className={cn(
                                                        "flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors",
                                                        "bg-white text-gray-900 border-gray-300",
                                                        "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600",
                                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                                                        "focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400",
                                                        "focus-visible:border-blue-500 dark:focus-visible:border-blue-400"
                                                    )}
                                                >
                                                    <option value="radio">
                                                        Radio
                                                    </option>
                                                    <option value="checkbox">
                                                        Checkbox
                                                    </option>
                                                    <option value="text-input">
                                                        Text Input
                                                    </option>
                                                    <option value="textarea">
                                                        Textarea
                                                    </option>
                                                    <option value="date-input">
                                                        Date
                                                    </option>

                                                    <option value="file-input">
                                                        File
                                                    </option>
                                                    <option value="select">
                                                        Select
                                                    </option>
                                                </select>
                                            </div>
                                            <FormField
                                                id={`label-${index}`}
                                                name="label"
                                                label="Label:"
                                                value={field.label || ""}
                                                onChange={(e) =>
                                                    handleFieldChange(index, {
                                                        label: e.target.value,
                                                    })
                                                }
                                                placeholder="Field label text"
                                            />
                                            {showOptionsForField(
                                                field.fieldType
                                            ) && (
                                                <FormField
                                                    id={`options-${index}`}
                                                    name="options"
                                                    label="Options (comma-separated):"
                                                    value={field.options || ""}
                                                    onChange={(e) =>
                                                        handleFieldChange(
                                                            index,
                                                            {
                                                                options:
                                                                    e.target
                                                                        .value,
                                                            }
                                                        )
                                                    }
                                                    placeholder="Option 1, Option 2, Option 3"
                                                />
                                            )}
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id={`required-${index}`}
                                                    checked={
                                                        field.required || false
                                                    }
                                                    onChange={(e) =>
                                                        handleFieldChange(
                                                            index,
                                                            {
                                                                required:
                                                                    e.target
                                                                        .checked,
                                                            }
                                                        )
                                                    }
                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <CustomLabel
                                                    htmlFor={`required-${index}`}
                                                    className="!mb-0"
                                                >
                                                    Required field
                                                </CustomLabel>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <CustomButton
                                    onClick={handleAddField}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Field
                                </CustomButton>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Editing: {selectedStep.type}
                        </p>
                    </div>
                )}
            </CustomCardContent>
        </>
    );

    if (noCard) {
        return content;
    }

    return <CustomCard>{content}</CustomCard>;
}
