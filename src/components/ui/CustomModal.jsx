"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { CustomCard } from "@/components/ui/CustomCard";
import { cn } from "@/utils/cn";

/**
 * Modal component for displaying content in a dialog
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Close modal handler
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.size - Modal size (sm, md, lg, xl, full)
 */
export function CustomModal({
    isOpen,
    onClose,
    title,
    children,
    className,
    size = "lg",
}) {
    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
        }
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: "max-w-md",
        md: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
        full: "max-w-full mx-4",
    };

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <CustomCard
                className={cn(
                    "relative w-full shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col",
                    sizeClasses[size],
                    className
                )}
            >
                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between p-6 pb-4 border-b border-border">
                        <h2 className="text-lg font-semibold text-foreground">
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className={cn(
                                "p-1.5 rounded-lg transition-colors",
                                "text-muted-foreground hover:text-foreground",
                                "hover:bg-accent"
                            )}
                            aria-label="Close modal"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="overflow-y-auto flex-1 md:px-6 py-6">
                    {children}
                </div>
            </CustomCard>
        </div>
    );

    // Render to document body using portal
    if (typeof window !== "undefined") {
        return createPortal(modalContent, document.body);
    }

    return null;
}
