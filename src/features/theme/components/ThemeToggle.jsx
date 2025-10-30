"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { CustomButton } from "@/components/ui/CustomButton";

/**
 * Theme Toggle Button
 * Allows users to switch between light and dark modes
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.variant - Button variant
 * @param {string} props.size - Button size
 */
export function ThemeToggle({ className, variant = "ghost", size = "icon" }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <CustomButton
      variant={variant}
      size={size}
      onClick={toggleTheme}
      className={className}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5 transition-all" />
      ) : (
        <Sun className="h-5 w-5 transition-all" />
      )}
    </CustomButton>
  );
}
