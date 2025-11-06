"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Tag, X, Plus, Loader2, Search } from "lucide-react";
import { cn } from "@/utils/cn";
import { CustomLabel } from "./CustomLabel";
import { CustomButton } from "./CustomButton";
import { CustomInput } from "./CustomInput";
import { tagService } from "@/features/products/services/tagService";
import { toast } from "react-toastify";

/**
 * TagsSelector component for selecting product tags
 * @param {Object} props - Component props
 * @param {string} props.label - Field label
 * @param {Array<Object>} props.value - Array of selected tag objects { id, name, slug }
 * @param {Function} props.onChange - Callback when tags change (receives array of tag objects)
 * @param {string} props.error - Error message
 * @param {boolean} props.required - Whether field is required
 * @param {string} props.helperText - Helper text
 * @param {string} props.className - Additional CSS classes
 */
export function TagsSelector({
  label,
  value = [],
  onChange,
  error,
  required,
  helperText,
  className,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [availableTags, setAvailableTags] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagSlug, setNewTagSlug] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const searchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const loadTags = useCallback(async () => {
    try {
      setIsSearching(true);
      const tags = await tagService.getAll();
      // Filter out already selected tags
      const selectedIds = value.map((tag) => tag.id);
      setAvailableTags(tags.filter((tag) => !selectedIds.includes(tag.id)));
    } catch (error) {
      console.error("Failed to load tags:", error);
      toast.error("Failed to load tags");
    } finally {
      setIsSearching(false);
    }
  }, [value]);

  const searchTags = useCallback(
    async (query) => {
      try {
        setIsSearching(true);
        const tags = await tagService.getAll({ search: query });
        // Filter out already selected tags
        const selectedIds = value.map((tag) => tag.id);
        setAvailableTags(tags.filter((tag) => !selectedIds.includes(tag.id)));
      } catch (error) {
        console.error("Failed to search tags:", error);
        toast.error("Failed to search tags");
      } finally {
        setIsSearching(false);
      }
    },
    [value]
  );

  // Load all tags on mount
  useEffect(() => {
    loadTags();
  }, [loadTags]);

  // Search tags when query changes
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        searchTags(searchQuery);
      }, 300);
    } else {
      loadTags();
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, loadTags, searchTags]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectTag = (tag) => {
    const newTags = [...value, tag];
    onChange?.(newTags);
    setSearchQuery("");
    setShowDropdown(false);
    // Reload available tags
    loadTags();
  };

  const handleRemoveTag = (tagId) => {
    const newTags = value.filter((tag) => tag.id !== tagId);
    onChange?.(newTags);
    // Reload available tags
    loadTags();
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast.error("Tag name is required");
      return;
    }

    const slug =
      newTagSlug.trim() || newTagName.toLowerCase().replace(/\s+/g, "-");

    try {
      setIsCreating(true);
      const newTag = await tagService.create({
        name: newTagName.trim(),
        slug: slug,
        description: "",
      });

      // Add the new tag to selected tags
      handleSelectTag(newTag);
      setNewTagName("");
      setNewTagSlug("");
      setShowCreateForm(false);
      toast.success("Tag created successfully");
    } catch (error) {
      console.error("Failed to create tag:", error);
      const errorMessage = error?.message || "Failed to create tag";
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSearchFocus = () => {
    if (searchQuery.trim() || availableTags.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowDropdown(true);
  };

  const selectedTagIds = value.map((tag) => tag.id);
  const filteredAvailableTags = availableTags.filter(
    (tag) => !selectedTagIds.includes(tag.id)
  );

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <CustomLabel>
          {label}
          {required && (
            <span className="text-red-600 dark:text-red-400 ml-1">*</span>
          )}
        </CustomLabel>
      )}

      {/* Selected Tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <div
              key={tag.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium"
            >
              <Tag className="h-3.5 w-3.5" />
              <span>{tag.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(tag.id)}
                className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search and Add Area */}
      <div className="space-y-2">
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <CustomInput
              ref={searchInputRef}
              type="text"
              placeholder="Search or add tags..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              className="pl-10 pr-10"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 animate-spin" />
            )}
          </div>

          {/* Dropdown */}
          {showDropdown && (
            <div
              ref={dropdownRef}
              className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              {filteredAvailableTags.length > 0 ? (
                <div className="py-1">
                  {filteredAvailableTags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleSelectTag(tag)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <Tag className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {tag.name}
                      </span>
                      {tag.description && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                          {tag.description}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                  {isSearching ? "Searching..." : "No tags found"}
                </div>
              )}

              {/* Create New Tag Option */}
              {searchQuery.trim() &&
                !filteredAvailableTags.some(
                  (tag) =>
                    tag.name.toLowerCase() === searchQuery.toLowerCase() ||
                    tag.slug.toLowerCase() === searchQuery.toLowerCase()
                ) && (
                  <div className="border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => {
                        setNewTagName(searchQuery);
                        setNewTagSlug("");
                        setShowCreateForm(true);
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-blue-600 dark:text-blue-400"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Create &quot;{searchQuery}&quot;
                      </span>
                    </button>
                  </div>
                )}
            </div>
          )}
        </div>

        {/* Create Tag Form */}
        {showCreateForm && (
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-900 space-y-3">
            <div className="space-y-2">
              <CustomLabel htmlFor="new-tag-name">
                Tag Name{" "}
                <span className="text-red-600 dark:text-red-400">*</span>
              </CustomLabel>
              <CustomInput
                id="new-tag-name"
                type="text"
                placeholder="Enter tag name"
                value={newTagName}
                onChange={(e) => {
                  setNewTagName(e.target.value);
                  // Auto-generate slug if not manually set
                  if (
                    !newTagSlug ||
                    newTagSlug === newTagName.toLowerCase().replace(/\s+/g, "-")
                  ) {
                    setNewTagSlug(
                      e.target.value.toLowerCase().replace(/\s+/g, "-")
                    );
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <CustomLabel htmlFor="new-tag-slug">Slug</CustomLabel>
              <CustomInput
                id="new-tag-slug"
                type="text"
                placeholder="tag-slug"
                value={newTagSlug}
                onChange={(e) =>
                  setNewTagSlug(
                    e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                  )
                }
              />
            </div>
            <div className="flex gap-2">
              <CustomButton
                type="button"
                onClick={handleCreateTag}
                disabled={isCreating || !newTagName.trim()}
                className="flex-1"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Tag
                  </>
                )}
              </CustomButton>
              <CustomButton
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewTagName("");
                  setNewTagSlug("");
                }}
              >
                Cancel
              </CustomButton>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
}
