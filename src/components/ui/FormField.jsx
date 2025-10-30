"use client";

import { CustomLabel } from "./CustomLabel";
import { CustomInput } from "./CustomInput";
import { cn } from "@/utils/cn";

/**
 * FormField component that combines label, input, and error message
 * @param {Object} props - Component props
 * @param {string} props.id - Input ID
 * @param {string} props.label - Field label
 * @param {string} props.error - Error message
 * @param {string} props.helperText - Helper text
 * @param {boolean} props.required - Whether field is required
 * @param {string} props.className - Additional CSS classes for container
 * @param {Object} props.inputProps - Props to pass to input
 */
export function FormField({
  id,
  label,
  error,
  helperText,
  required,
  className,
  ...inputProps
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <CustomLabel htmlFor={id}>
          {label}
          {required && (
            <span className="text-red-600 dark:text-red-400 ml-1">*</span>
          )}
        </CustomLabel>
      )}
      <CustomInput id={id} error={error} {...inputProps} />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
}
