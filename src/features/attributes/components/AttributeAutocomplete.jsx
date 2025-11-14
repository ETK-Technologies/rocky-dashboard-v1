"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { globalAttributeService } from "../services/globalAttributeService";
import { generateSlug } from "@/utils/generateSlug";
import { cn } from "@/utils/cn";
import { Loader2, Plus } from "lucide-react";
import { toast } from "react-toastify";

/**
 * Autocomplete component for selecting or creating global attributes
 * @param {Object} props
 * @param {Array} props.excludeIds - Array of attribute IDs to exclude from results
 * @param {Function} props.onSelect - Callback when an attribute is selected
 * @param {Function} props.onCreate - Callback when a new attribute should be created
 * @param {boolean} props.disabled - Whether the input is disabled
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.className - Additional CSS classes
 */
export function AttributeAutocomplete({
  excludeIds = [],
  onSelect,
  onCreate,
  disabled = false,
  placeholder = "Search or type to create attribute...",
  className,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Debounced search
  const searchAttributes = useCallback(
    async (query) => {
      if (!query || query.trim().length < 1) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setLoading(true);
      try {
        const results = await globalAttributeService.getAll({
          search: query.trim(),
        });

        // Filter out excluded attributes
        const filtered = Array.isArray(results)
          ? results.filter((attr) => !excludeIds.includes(attr.id))
          : [];

        setSuggestions(filtered);
        setShowSuggestions(true);
        setHighlightedIndex(-1);
      } catch (error) {
        console.error("Failed to search attributes:", error);
        toast.error("Failed to search attributes");
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    },
    [excludeIds]
  );

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      searchAttributes(value);
    }, 300);
  };

  // Handle selecting an existing attribute
  const handleSelectAttribute = (attribute) => {
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    if (onSelect) {
      onSelect(attribute);
    }
  };

  // Handle creating a new attribute
  const handleCreateNew = async () => {
    const name = searchQuery.trim();
    if (!name) return;

    setLoading(true);
    try {
      const newAttribute = await globalAttributeService.create({
        name: name,
        slug: generateSlug(name),
        description: "",
        position: 0,
        visible: true,
        variation: false,
      });

      setSearchQuery("");
      setSuggestions([]);
      setShowSuggestions(false);

      if (onSelect) {
        onSelect(newAttribute);
      }
      toast.success(`Attribute "${name}" created successfully`);
    } catch (error) {
      console.error("Failed to create attribute:", error);
      toast.error(error.message || "Failed to create attribute");
    } finally {
      setLoading(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        handleSelectAttribute(suggestions[highlightedIndex]);
      } else if (searchQuery.trim() && !loading) {
        // Check if exact match exists
        const exactMatch = suggestions.find(
          (attr) => attr.name.toLowerCase() === searchQuery.trim().toLowerCase()
        );
        if (exactMatch) {
          handleSelectAttribute(exactMatch);
        } else {
          // Create new attribute
          handleCreateNew();
        }
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  };

  // Check if we should show "Create new" option
  const shouldShowCreateNew =
    searchQuery.trim() &&
    !loading &&
    !suggestions.some(
      (attr) => attr.name.toLowerCase() === searchQuery.trim().toLowerCase()
    );

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0 || searchQuery.trim()) {
              setShowSuggestions(true);
            }
          }}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            "flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors",
            "bg-white text-gray-900 border-gray-300",
            "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            "focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "pr-10"
          )}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || shouldShowCreateNew) && (
        <div
          className={cn(
            "absolute z-50 w-full mt-1 bg-white dark:bg-gray-800",
            "border border-gray-300 dark:border-gray-600 rounded-md shadow-lg",
            "max-h-60 overflow-auto"
          )}
        >
          {suggestions.map((attribute, index) => (
            <button
              key={attribute.id}
              type="button"
              onClick={() => handleSelectAttribute(attribute)}
              className={cn(
                "w-full text-left px-4 py-2 text-sm transition-colors",
                "hover:bg-gray-100 dark:hover:bg-gray-700",
                index === highlightedIndex && "bg-gray-100 dark:bg-gray-700"
              )}
            >
              <div className="font-medium">{attribute.name}</div>
              {attribute.description && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {attribute.description}
                </div>
              )}
            </button>
          ))}

          {shouldShowCreateNew && (
            <button
              type="button"
              onClick={handleCreateNew}
              className={cn(
                "w-full text-left px-4 py-2 text-sm transition-colors",
                "hover:bg-gray-100 dark:hover:bg-gray-700",
                "border-t border-gray-200 dark:border-gray-700",
                "flex items-center gap-2",
                highlightedIndex === suggestions.length &&
                  "bg-gray-100 dark:bg-gray-700"
              )}
            >
              <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>
                Create new: <strong>{searchQuery.trim()}</strong>
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}


