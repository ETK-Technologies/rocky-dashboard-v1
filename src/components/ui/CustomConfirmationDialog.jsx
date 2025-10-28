"use client";

import { CustomButton } from "@/components/ui/CustomButton";
import {
    CustomCard,
    CustomCardContent,
    CustomCardDescription,
    CustomCardHeader,
    CustomCardTitle,
} from "@/components/ui/CustomCard";
import { AlertTriangle, X } from "lucide-react";

/**
 * Confirmation dialog component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether dialog is open
 * @param {Function} props.onClose - Close dialog handler
 * @param {Function} props.onConfirm - Confirm action handler
 * @param {string} props.title - Dialog title
 * @param {string} props.description - Dialog description
 * @param {string} props.confirmText - Confirm button text
 * @param {string} props.cancelText - Cancel button text
 * @param {boolean} props.isLoading - Loading state
 * @param {string} props.variant - Dialog variant (danger, warning, info)
 */
export function CustomConfirmationDialog({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    description = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    isLoading = false,
    variant = "warning",
}) {
    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            icon: AlertTriangle,
            iconColor: "text-red-600",
            iconBg: "bg-red-100",
            confirmButton: "bg-red-600 hover:bg-red-700 text-white",
        },
        warning: {
            icon: AlertTriangle,
            iconColor: "text-yellow-600",
            iconBg: "bg-yellow-100",
            confirmButton: "bg-yellow-600 hover:bg-yellow-700 text-white",
        },
        info: {
            icon: AlertTriangle,
            iconColor: "text-blue-600",
            iconBg: "bg-blue-100",
            confirmButton: "bg-blue-600 hover:bg-blue-700 text-white",
        },
    };

    const styles = variantStyles[variant];
    const IconComponent = styles.icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={onClose}
            />

            {/* Dialog */}
            <CustomCard className="relative w-full max-w-md mx-4">
                <CustomCardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${styles.iconBg}`}>
                                <IconComponent className={`h-5 w-5 ${styles.iconColor}`} />
                            </div>
                            <CustomCardTitle className="text-lg">{title}</CustomCardTitle>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            disabled={isLoading}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </CustomCardHeader>

                <CustomCardContent className="space-y-4">
                    <CustomCardDescription className="text-base">
                        {description}
                    </CustomCardDescription>

                    <div className="flex gap-3 justify-end">
                        <CustomButton
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            {cancelText}
                        </CustomButton>
                        <CustomButton
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={styles.confirmButton}
                        >
                            {isLoading ? "Processing..." : confirmText}
                        </CustomButton>
                    </div>
                </CustomCardContent>
            </CustomCard>
        </div>
    );
}
