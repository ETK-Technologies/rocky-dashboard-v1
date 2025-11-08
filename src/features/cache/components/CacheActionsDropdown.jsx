"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { ChevronDown, Check, Database, Loader2 } from "lucide-react";

import { cacheService } from "../services/cacheService";
import { CustomButton } from "@/components/ui/CustomButton";

const CACHE_PATTERN_OPTIONS = [
  { label: "All caches", value: "" },
  { label: "Category caches", value: "category:*" },
  { label: "Product caches", value: "product:*" },
];

/**
 * Dropdown control for clearing application caches.
 */
export function CacheActionsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPatterns, setSelectedPatterns] = useState([]);
  const [showPatternOptions, setShowPatternOptions] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const dropdownRef = useRef(null);

  /**
   * Toggle dropdown visibility.
   */
  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  /**
   * Close dropdown helper.
   */
  const closeDropdown = () => {
    setIsOpen(false);
  };

  /**
   * Handle click outside to close dropdown.
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        closeDropdown();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setShowPatternOptions(false);
    }
  }, [isOpen]);

  /**
   * Parse the textarea input into a string array for the API.
   * Supports comma or newline separated values.
   */
  const parsePatterns = () =>
    selectedPatterns.map((pattern) => pattern.trim()).filter(Boolean);

  /**
   * Handle pattern selection changes.
   */
  const handlePatternToggle = (value) => {
    if (value === "") {
      setSelectedPatterns([]);
      setShowPatternOptions(false);
      return;
    }

    setSelectedPatterns((prev) => {
      const exists = prev.includes(value);
      if (exists) {
        return prev.filter((pattern) => pattern !== value);
      }
      return [...prev, value];
    });
  };

  const togglePatternOptions = () => {
    setShowPatternOptions((prev) => !prev);
  };

  const patternsDisplay =
    selectedPatterns.length === 0
      ? "All caches"
      : `${selectedPatterns.length} pattern${
          selectedPatterns.length > 1 ? "s" : ""
        } selected`;

  /**
   * Trigger cache clearing request.
   */
  const handleClearCache = async (event) => {
    event.preventDefault();
    if (isClearing) return;

    const patterns = parsePatterns();

    setIsClearing(true);
    try {
      const response = await cacheService.clearCache(patterns);
      const cleared = Array.isArray(response?.cleared)
        ? response.cleared
        : [];

      toast.success(
        cleared.length > 0
          ? `Cleared: ${cleared.join(", ")}`
          : "Cache cleared successfully."
      );

      setSelectedPatterns([]);
      closeDropdown();
    } catch (error) {
      const errorMessage =
        error?.message || "Failed to clear cache. Please try again.";
      toast.error(errorMessage);
      console.error("Cache clear error:", error);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
        aria-label="Cache actions"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Database className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-card border border-border rounded-lg shadow-lg z-50">
          <div className="p-4 space-y-3">
            <div>
              <h4 className="text-sm font-semibold text-foreground">
                Clear caches
              </h4>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Clear cached data immediately. Leave patterns empty to flush
                everything or target specific namespaces.
              </p>
            </div>

            <form onSubmit={handleClearCache} className="space-y-3">
              <div className="space-y-2">
                <label
                  htmlFor="cache-patterns"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  Patterns
                </label>
                <div className="relative">
                  <button
                    id="cache-patterns"
                    type="button"
                    onClick={togglePatternOptions}
                    className="w-full rounded-md border border-border bg-secondary text-sm text-foreground px-3 py-2 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                  >
                    <span className="truncate text-left">{patternsDisplay}</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        showPatternOptions ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showPatternOptions && (
                    <div className="absolute left-0 right-0 mt-1 rounded-md border border-border bg-card shadow-lg z-10 max-h-48 overflow-y-auto">
                      <ul className="py-1 text-sm text-foreground">
                        {CACHE_PATTERN_OPTIONS.map((option) => {
                          const isSelected =
                            option.value === ""
                              ? selectedPatterns.length === 0
                              : selectedPatterns.includes(option.value);

                          return (
                            <li key={option.value || "all"}>
                              <button
                                type="button"
                                onClick={() => handlePatternToggle(option.value)}
                                className={`w-full px-3 py-2 flex items-center justify-between hover:bg-accent ${
                                  isSelected ? "bg-accent/60" : ""
                                }`}
                              >
                                <span>{option.label}</span>
                                {isSelected && (
                                  <Check className="h-4 w-4 text-primary" />
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Select one or more patterns. Leave empty to flush everything.
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <CustomButton
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={closeDropdown}
                  disabled={isClearing}
                >
                  Cancel
                </CustomButton>
                <CustomButton type="submit" size="sm" disabled={isClearing}>
                  {isClearing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Clearing...
                    </span>
                  ) : (
                    "Clear cache"
                  )}
                </CustomButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


