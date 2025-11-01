"use client";

import { useState, useEffect } from "react";
import "react-tooltip/dist/react-tooltip.css";
import {
    CustomButton,
    PageContainer,
    PageHeader,
    CustomModal,
} from "@/components/ui";
import FlowForm from "./FlowForm";
import Steps, { stepTypes } from "./Steps";
import FlowSteps from "./FlowSteps";
import EditStep from "./EditStep";

export default function Categories() {
    const [steps, setSteps] = useState([]);
    const [selectedStep, setSelectedStep] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [stepToEditId, setStepToEditId] = useState(null);

    // Helper function to get next unique field ID
    const getNextFieldId = (allSteps) => {
        // Extract all field IDs from all steps
        const allFieldIds = [];
        allSteps.forEach((step) => {
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

    const handleAddStep = (stepTypeOrId, insertIndex = null) => {
        // Handle both full stepType object (from click) and serialized { id } (from drop)
        const stepType =
            typeof stepTypeOrId === "object" && stepTypeOrId.id
                ? stepTypes.find((st) => st.id === stepTypeOrId.id) ||
                  stepTypeOrId
                : stepTypeOrId;

        if (!stepType) return;

        const newStep = {
            id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: stepType.id,
            label: stepType.label,
            icon: stepType.icon,
            iconColor: stepType.iconColor,
            order: steps.length + 1,
        };

        // Auto-add a default field for form and question types
        if (stepType.id === "form" || stepType.id === "question") {
            const fieldId = getNextFieldId(steps);
            newStep.fields = [
                {
                    id: `field-${Date.now()}-${Math.random()
                        .toString(36)
                        .substr(2, 9)}`,
                    fieldId: fieldId,
                    fieldType: "text-input",
                    label: "",
                    required: false,
                    options: "",
                },
            ];
        }

        // if (insertIndex !== null && insertIndex >= 0) {
        //     // Insert at specific index
        //     const newSteps = [...steps];
        //     newSteps.splice(insertIndex, 0, newStep);
        //     setSteps(newSteps);
        // } else {
        //     // Append to end
        setSteps([...steps, newStep]);
        // }
    };

    const handleStepClick = (step) => {
        setSelectedStep(step);
    };

    const handleEditStep = (step) => {
        setStepToEditId(step.id);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setStepToEditId(null);
    };

    // Get the step to edit from the steps array
    const stepToEdit = stepToEditId
        ? steps.find((step) => step.id === stepToEditId)
        : null;

    const handleRemoveStep = (stepId) => {
        setSteps(steps.filter((step) => step.id !== stepId));
        if (selectedStep?.id === stepId) {
            setSelectedStep(null);
        }
        // Close modal if the step being edited is removed
        if (stepToEditId === stepId) {
            handleCloseEditModal();
        }
    };

    const handleReorderSteps = (newSteps) => {
        setSteps(newSteps);
    };

    const handleUpdateStep = (stepId, updates) => {
        setSteps((prevSteps) =>
            prevSteps.map((step) =>
                step.id === stepId ? { ...step, ...updates } : step
            )
        );
        // Update selected step if it's the one being edited
        if (selectedStep?.id === stepId) {
            setSelectedStep({ ...selectedStep, ...updates });
        }
        // stepToEdit is derived from steps array, so it will automatically update
    };

    return (
        <PageContainer>
            <PageHeader
                title="Flow Builder"
                description=""
                action={
                    <div className="flex items-center md:gap-3 gap-2 flex-wrap">
                        <CustomButton
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 hover:scale-95 transition-all duration-300 text-white"
                            size="sm"
                        >
                            Create Flow
                        </CustomButton>
                        <CustomButton
                            className="flex items-center gap-2  hover:scale-95 transition-all duration-300 text-white"
                            size="sm"
                        >
                            Save
                        </CustomButton>
                        <CustomButton
                            className="flex items-center gap-2  hover:scale-95 transition-all duration-300 text-white"
                            size="sm"
                        >
                            Validate
                        </CustomButton>
                        <CustomButton
                            className="flex items-center gap-2  hover:scale-95 transition-all duration-300 text-white"
                            size="sm"
                        >
                            Publish
                        </CustomButton>
                    </div>
                }
            />

            <FlowForm />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
                <div className="xl:col-span-3 lg:col-span-4">
                    <Steps onAddStep={handleAddStep} />
                </div>
                <div className="xl:col-span-6 lg:col-span-8">
                    <FlowSteps
                        steps={steps}
                        onStepClick={handleStepClick}
                        onRemoveStep={handleRemoveStep}
                        onReorderSteps={handleReorderSteps}
                        onAddStep={handleAddStep}
                        selectedStep={selectedStep}
                        onEditStep={handleEditStep}
                    />
                </div>
                {/* Hide EditStep on small screens, show only on desktop */}
                <div className="hidden xl:block xl:col-span-3">
                    <EditStep
                        selectedStep={selectedStep}
                        steps={steps}
                        onUpdateStep={handleUpdateStep}
                        onReorderSteps={handleReorderSteps}
                    />
                </div>
            </div>

            {/* Edit Step Modal for mobile */}
            <CustomModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                title="Edit Step"
                size="full"
            >
                <EditStep
                    selectedStep={stepToEdit}
                    steps={steps}
                    onUpdateStep={handleUpdateStep}
                    onReorderSteps={handleReorderSteps}
                    noCard={true}
                />
            </CustomModal>
        </PageContainer>
    );
}
