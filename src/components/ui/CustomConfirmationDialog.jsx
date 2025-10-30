"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { CustomButton } from "@/components/ui/CustomButton";
import {
  CustomCard,
  CustomCardContent,
  CustomCardHeader,
  CustomCardTitle,
} from "@/components/ui/CustomCard";
import { AlertTriangle, AlertCircle, Info, X, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

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
  // Prevent body scroll when dialog is open
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
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isLoading, onClose]);

  const variantStyles = {
    danger: {
      icon: AlertCircle,
      iconColor: "text-destructive",
      iconBg: "bg-destructive/10",
      confirmButton:
        "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
    },
    warning: {
      icon: AlertTriangle,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
      confirmButton: "bg-primary hover:bg-primary/90 text-primary-foreground",
    },
    info: {
      icon: Info,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
      confirmButton: "bg-primary hover:bg-primary/90 text-primary-foreground",
    },
  };

  const styles = variantStyles[variant];
  const IconComponent = styles.icon;

  if (!isOpen) return null;

  const dialogContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        onClick={!isLoading ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Dialog */}
      <CustomCard className="relative w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <CustomCardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div
                className={cn("p-2 rounded-lg flex-shrink-0", styles.iconBg)}
              >
                <IconComponent className={cn("h-5 w-5", styles.iconColor)} />
              </div>
              <div className="flex-1 pt-0.5">
                <CustomCardTitle className="text-lg font-semibold text-card-foreground">
                  {title}
                </CustomCardTitle>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className={cn(
                "p-1.5 rounded-lg transition-colors flex-shrink-0",
                "text-muted-foreground hover:text-foreground",
                "hover:bg-accent",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </CustomCardHeader>

        {/* Content */}
        <CustomCardContent className="space-y-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-2">
            <CustomButton
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="min-w-[80px]"
            >
              {cancelText}
            </CustomButton>
            <CustomButton
              onClick={onConfirm}
              disabled={isLoading}
              className={cn("min-w-[80px]", styles.confirmButton)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                confirmText
              )}
            </CustomButton>
          </div>
        </CustomCardContent>
      </CustomCard>
    </div>
  );

  // Render to document body using portal
  if (typeof window !== "undefined") {
    return createPortal(dialogContent, document.body);
  }

  return null;
}
