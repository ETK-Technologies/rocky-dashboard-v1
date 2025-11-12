"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { globalAttributeService } from "../services/globalAttributeService";
import { generateSlug } from "@/utils/generateSlug";
import { cn } from "@/utils/cn";
import { Loader2, Plus } from "lucide-react";
import { toast } from "react-toastify";

/**
 * Autocomplete component for selecting or creating terms for a global attribute
 * @param {Object} props
 * @param {string} props.attributeId - The global attribute ID (required if attribute not provided)
 * @param {Object} props.attribute - The global attribute object with terms (optional, preferred)
 * @param {Function} props.onSelect - Callback when a term is selected (receives term name)
 * @param {Function} props.onAttributeUpdate - Callback when attribute is updated (for refreshing terms)
 * @param {boolean} props.disabled - Whether the input is disabled
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.value - Current input value
 * @param {Function} props.onChange - Callback when input value changes
 */
export function TermAutocomplete({
  attributeId,
  attribute,
  onSelect,
  onAttributeUpdate,
  disabled = false,
  placeholder = "Search or type to create term...",
  className,
  value = "",
  onChange,
}) {
  const [searchQuery, setSearchQuery] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [attributeData, setAttributeData] = useState(attribute);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Use attributeId if attribute object is not provided
  const effectiveAttributeId = attributeData?.id || attributeId;

  // Sync with external value prop
  useEffect(() => {
    setSearchQuery(value);
  }, [value]);

  // Sync attribute data
  useEffect(() => {
    if (attribute) {
      setAttributeData(attribute);
    }
  }, [attribute]);

  // Fetch attribute with terms if only ID is provided
  useEffect(() => {
    const fetchAttribute = async () => {
      if (effectiveAttributeId && !attributeData) {
        setLoading(true);
        try {
          const fetchedAttribute = await globalAttributeService.getById(
            effectiveAttributeId
          );
          setAttributeData(fetchedAttribute);
        } catch (error) {
          console.error("Failed to fetch attribute:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAttribute();
  }, [effectiveAttributeId, attributeData]);

  // Filter terms client-side based on search query
  const filterTerms = useCallback(
    (query) => {
      if (!attributeData || !attributeData.terms) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      if (!query || query.trim().length < 1) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      const queryLower = query.trim().toLowerCase();
      const filtered = (attributeData.terms || []).filter((term) => {
        const termName = term.name || "";
        return termName.toLowerCase().includes(queryLower);
      });

      setSuggestions(filtered);
      setShowSuggestions(true);
      setHighlightedIndex(-1);
    },
    [attributeData]
  );

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    if (onChange) {
      onChange(e);
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search (client-side filtering)
    searchTimeoutRef.current = setTimeout(() => {
      filterTerms(newValue);
    }, 150);
  };

  // Handle selecting an existing term
  const handleSelectTerm = (term) => {
    const termName = term.name || term;
    setSuggestions([]);
    setShowSuggestions(false);
    // Clear search query - parent will handle adding the value
    setSearchQuery("");
    if (onSelect) {
      onSelect(termName);
    }
    // Also trigger onChange with empty value to clear the input
    if (onChange) {
      const syntheticEvent = {
        target: { value: "" },
      };
      onChange(syntheticEvent);
    }
  };

  // Handle creating a new term
  const handleCreateNew = async () => {
    const name = searchQuery.trim();
    if (!name || !effectiveAttributeId) return;

    setLoading(true);
    try {
      const newTerm = await globalAttributeService.createTerm(
        effectiveAttributeId,
        {
          name: name,
          slug: generateSlug(name),
          description: "",
          position: 0,
        }
      );

      // Update local attribute data with new term
      if (attributeData) {
        const updatedAttribute = {
          ...attributeData,
          terms: [...(attributeData.terms || []), newTerm],
        };
        setAttributeData(updatedAttribute);
        // Notify parent to update attribute
        if (onAttributeUpdate) {
          onAttributeUpdate(updatedAttribute);
        }
      } else {
        // Refetch attribute to get updated terms
        try {
          const fetchedAttribute = await globalAttributeService.getById(
            effectiveAttributeId
          );
          setAttributeData(fetchedAttribute);
          if (onAttributeUpdate) {
            onAttributeUpdate(fetchedAttribute);
          }
        } catch (fetchError) {
          console.error("Failed to refetch attribute:", fetchError);
        }
      }

      setSuggestions([]);
      setShowSuggestions(false);
      // Clear search query - parent will handle adding the value
      setSearchQuery("");

      if (onSelect) {
        onSelect(newTerm.name || name);
      }
      // Also trigger onChange with empty value to clear the input
      if (onChange) {
        const syntheticEvent = {
          target: { value: "" },
        };
        onChange(syntheticEvent);
      }
      toast.success(`Term "${name}" created successfully`);
    } catch (error) {
      console.error("Failed to create term:", error);
      toast.error(error.message || "Failed to create term");
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
        handleSelectTerm(suggestions[highlightedIndex]);
      } else if (searchQuery.trim() && !loading && effectiveAttributeId) {
        // Check if exact match exists
        const exactMatch = suggestions.find(
          (term) =>
            (term.name || term).toLowerCase() ===
            searchQuery.trim().toLowerCase()
        );
        if (exactMatch) {
          handleSelectTerm(exactMatch);
        } else {
          // Create new term
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
    effectiveAttributeId &&
    !suggestions.some(
      (term) =>
        (term.name || term).toLowerCase() === searchQuery.trim().toLowerCase()
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

  if (!effectiveAttributeId) {
    // If no attribute is selected, show regular input
    return (
      <input
        type="text"
        value={searchQuery}
        onChange={handleInputChange}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          "flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors",
          "bg-white text-gray-900 border-gray-300",
          "dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      />
    );
  }

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
            if (searchQuery.trim()) {
              filterTerms(searchQuery);
            } else if (suggestions.length > 0) {
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
          {suggestions.map((term, index) => {
            const termName = term.name || term;
            const termDescription = term.description;
            return (
              <button
                key={term.id || index}
                type="button"
                onClick={() => handleSelectTerm(term)}
                className={cn(
                  "w-full text-left px-4 py-2 text-sm transition-colors",
                  "hover:bg-gray-100 dark:hover:bg-gray-700",
                  index === highlightedIndex && "bg-gray-100 dark:bg-gray-700"
                )}
              >
                <div className="font-medium">{termName}</div>
                {termDescription && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {termDescription}
                  </div>
                )}
              </button>
            );
          })}

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
