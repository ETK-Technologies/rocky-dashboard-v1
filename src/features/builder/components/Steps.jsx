"use client";

import React from "react";
import {
    HelpCircle,
    FileText,
    Upload,
    Star,
    CheckCircle,
    Lightbulb,
} from "lucide-react";
import {
    CustomCard,
    CustomCardHeader,
    CustomCardTitle,
    CustomCardContent,
} from "@/components/ui";

export const stepTypes = [
    {
        id: "question",
        label: "Question",
        icon: HelpCircle,
        iconColor: "text-red-600 dark:text-red-400",
        bgColor: "bg-gray-50 dark:bg-gray-900/50",
    },
    {
        id: "form",
        label: "Form",
        icon: FileText,
        iconColor: "text-orange-600 dark:text-orange-400",
        bgColor: "bg-gray-50 dark:bg-gray-900/50",
    },
    {
        id: "upload",
        label: "Upload",
        icon: Upload,
        iconColor: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-gray-50 dark:bg-gray-900/50",
    },
    {
        id: "recommendation",
        label: "Recommendation",
        icon: Star,
        iconColor: "text-yellow-600 dark:text-yellow-400",
        bgColor: "bg-gray-50 dark:bg-gray-900/50",
    },
    {
        id: "thankyou",
        label: "Thank You",
        icon: CheckCircle,
        iconColor: "text-green-600 dark:text-green-400",
        bgColor: "bg-gray-50 dark:bg-gray-900/50",
    },
];

export default function Steps({ onAddStep }) {
    const handleDragStart = (e, stepType) => {
        // Only serialize the ID, not the icon component
        const data = JSON.stringify({ id: stepType.id });
        e.dataTransfer.setData("application/json", data);
        e.dataTransfer.setData("text/plain", "new-step"); // Mark as new step
        e.dataTransfer.effectAllowed = "copy";
    };

    const handleClick = (stepType) => {
        if (onAddStep) {
            onAddStep(stepType);
        }
    };

    return (
        <CustomCard>
            <CustomCardHeader>
                <CustomCardTitle className="text-lg font-semibold">
                    Add Steps
                </CustomCardTitle>
            </CustomCardHeader>
            <CustomCardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
                    {stepTypes.map((stepType) => {
                        const Icon = stepType.icon;
                        return (
                            <button
                                key={stepType.id}
                                type="button"
                                draggable
                                onDragStart={(e) =>
                                    handleDragStart(e, stepType)
                                }
                                onClick={() => handleClick(stepType)}
                                className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-border bg-gray-50 dark:bg-gray-900/50 hover:border-primary/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-all duration-200 cursor-move active:cursor-grabbing"
                            >
                                <Icon
                                    className={`h-5 w-5 ${stepType.iconColor}`}
                                />
                                <span className="text-sm font-medium text-foreground">
                                    {stepType.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border-l-2 border-l-blue-200 dark:border-l-blue-900/50 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-xs text-blue-900 dark:text-blue-300">
                        Drag or click to add
                    </span>
                </div>
            </CustomCardContent>
        </CustomCard>
    );
}
