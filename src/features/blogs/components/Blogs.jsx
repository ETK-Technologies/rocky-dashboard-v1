"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import {
    Search,
    Plus,
    FileText,
    Filter,
    Trash2,
    ArrowUp,
    ArrowDown,
    X,
    ChevronDown,
    Check,
    Edit,
    Eye,
    Download,
} from "lucide-react";
import {
    CustomButton,
    PageContainer,
    PageHeader,
    DataTable,
    CustomInput,
    CustomBadge,
    CustomConfirmationDialog,
    ErrorState,
    Pagination,
} from "@/components/ui";
import { useBlogs } from "../hooks/useBlogs";
import { useBlogCategories } from "@/features/blog-categories";
import { useBlogTags } from "@/features/blog-tags";
import { LoadingState } from "@/components/ui/LoadingState";
import { cn } from "@/utils/cn";

export default function Blogs() {
    const router = useRouter();
    const {
        blogs,
        loading,
        error,
        deleteBlog,
        bulkDeleteBlogs,
        pagination,
        updateFilters,
    } = useBlogs();
    const { categories: availableCategories, loading: categoriesLoading } =
        useBlogCategories({ limit: 100 });
    const { tags: availableTags, loading: tagsLoading } = useBlogTags({
        limit: 100,
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [blogToDelete, setBlogToDelete] = useState(null);
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
    const [selectedBlogIds, setSelectedPostIds] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [bulkAction, setBulkAction] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [authorFilter, setAuthorFilter] = useState("");
    const [quickEditBlogId, setQuickEditPostId] = useState(null);
    const [quickEditData, setQuickEditData] = useState(null);
    const [quickEditCategoryDropdownOpen, setQuickEditCategoryDropdownOpen] =
        useState(false);
    const [quickEditTagDropdownOpen, setQuickEditTagDropdownOpen] =
        useState(false);
    const [quickEditCategorySearchQuery, setQuickEditCategorySearchQuery] =
        useState("");
    const [quickEditTagSearchQuery, setQuickEditTagSearchQuery] = useState("");
    const [filterValues, setFilterValues] = useState({
        status: "",
        categoryId: "",
        sort: "",
    });
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: "asc",
    });

    // Refs for quick edit dropdowns
    const quickEditCategoryDropdownRef = useRef(null);
    const quickEditTagDropdownRef = useRef(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                quickEditCategoryDropdownRef.current &&
                !quickEditCategoryDropdownRef.current.contains(event.target)
            ) {
                setQuickEditCategoryDropdownOpen(false);
            }
            if (
                quickEditTagDropdownRef.current &&
                !quickEditTagDropdownRef.current.contains(event.target)
            ) {
                setQuickEditTagDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Handle search
    const handleSearch = (value) => {
        setSearchTerm(value);
        if (value.trim()) {
            updateFilters({ search: value, page: 1 });
        } else {
            updateFilters({ search: undefined, page: 1 });
        }
    };

    // Handle filter change
    const handleFilterChange = (key, value) => {
        const newFilters = { ...filterValues, [key]: value };
        setFilterValues(newFilters);

        // Apply filters - only include non-empty values
        const appliedFilters = { page: 1 };
        if (newFilters.status && newFilters.status.trim() !== "") {
            appliedFilters.status = newFilters.status;
        } else {
            appliedFilters.status = undefined;
        }
        if (newFilters.categoryId !== undefined) {
            // Send empty string for "All Categories", actual ID for specific category
            appliedFilters.categoryId = newFilters.categoryId || "";
        }
        if (newFilters.sort && newFilters.sort.trim() !== "") {
            appliedFilters.sort = newFilters.sort;
        } else {
            appliedFilters.sort = undefined;
        }

        updateFilters(appliedFilters);
    };

    // Handle delete confirmation
    const handleDeleteClick = (blog) => {
        setBlogToDelete(blog);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (blogToDelete) {
            try {
                await deleteBlog(blogToDelete.id);
                setDeleteDialogOpen(false);
                setBlogToDelete(null);
            } catch (error) {
                // Error is already handled in the hook
            }
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setBlogToDelete(null);
    };

    // Handle bulk delete
    const handleBulkDeleteClick = () => {
        if (selectedBlogIds.length > 0) {
            setBulkDeleteDialogOpen(true);
        }
    };

    const handleBulkDeleteConfirm = async () => {
        if (selectedBlogIds.length > 0) {
            try {
                await bulkDeleteBlogs(selectedBlogIds);
                setBulkDeleteDialogOpen(false);
                setSelectedPostIds([]);
                setBulkAction(""); // Reset bulk action after delete
            } catch (error) {
                // Error is already handled in the hook
            }
        }
    };

    const handleBulkDeleteCancel = () => {
        setBulkDeleteDialogOpen(false);
    };

    // Handle selection change
    const handleSelectionChange = (selectedIds) => {
        setSelectedPostIds(selectedIds);
    };

    // Handle bulk action apply
    const handleBulkActionApply = () => {
        if (selectedBlogIds.length === 0) {
            // No posts selected
            return;
        }

        switch (bulkAction) {
            case "delete":
                setBulkDeleteDialogOpen(true);
                break;
            case "edit":
                // TODO: Implement bulk edit functionality
                console.log("Bulk edit:", selectedBlogIds);
                alert(
                    `Bulk edit for ${selectedBlogIds.length} blogs - Feature coming soon!`
                );
                break;
            case "download":
                // TODO: Implement bulk download functionality
                console.log("Bulk download:", selectedBlogIds);
                alert(
                    `Downloading ${selectedBlogIds.length} blogs - Feature coming soon!`
                );
                break;
            case "export":
                // TODO: Implement bulk export functionality
                console.log("Bulk export:", selectedBlogIds);
                alert(
                    `Exporting ${selectedBlogIds.length} blogs - Feature coming soon!`
                );
                break;
            default:
                // No action selected
                break;
        }
    };

    // Handle date filter change
    const handleDateFilterChange = (value) => {
        setDateFilter(value);
        // TODO: Add date filtering logic when backend supports it
        // Format: "MM/YYYY" (e.g., "10/2025" for October 2025)
        // You can send this to the backend API to filter posts by month
        if (value) {
            console.log("Filter posts by month:", value);
            // Example: updateFilters({ month: value, page: 1 });
        }
    };

    // Handle author filter change
    const handleAuthorFilterChange = (value) => {
        setAuthorFilter(value);
        // You can add author filtering logic here when the backend supports it
        // For now, we'll just store the value
    };

    // Handle quick edit
    const handleQuickEditClick = (blog) => {
        setQuickEditPostId(blog.id);
        const date = blog.publishedAt ? new Date(blog.publishedAt) : new Date();
        const isScheduled = blog.status === "SCHEDULED";
        // Extract category IDs as array
        const categoryIds =
            blog.categories
                ?.map((cat) => cat.categoryId || cat.category?.id || cat.id)
                .filter(Boolean) || [];
        // Extract tag IDs as array
        const tagIds =
            blog.tags
                ?.map((tag) => tag.tagId || tag.tag?.id || tag.id)
                .filter(Boolean) || [];

        setQuickEditData({
            title: blog.title || "",
            slug: blog.slug || "",
            status: blog.status || "DRAFT",
            categoryIds: categoryIds,
            tagIds: tagIds,
            // Only include date fields if status is SCHEDULED
            ...(isScheduled && {
                dateMonth: String(date.getMonth() + 1).padStart(2, "0"),
                dateDay: String(date.getDate()).padStart(2, "0"),
                dateYear: String(date.getFullYear()),
                dateHour: String(date.getHours()).padStart(2, "0"),
                dateMinute: String(date.getMinutes()).padStart(2, "0"),
            }),
        });
    };

    // Handle quick edit cancel
    const handleQuickEditCancel = () => {
        setQuickEditPostId(null);
        setQuickEditData(null);
    };

    // Handle CSV download for a single blog
    const handleDownloadCSV = (blog) => {
        // Convert blog object to CSV format
        const escapeCSV = (value) => {
            if (value === null || value === undefined) return "";
            const stringValue = String(value);
            // If value contains comma, newline, or quote, wrap in quotes and escape quotes
            if (
                stringValue.includes(",") ||
                stringValue.includes("\n") ||
                stringValue.includes('"')
            ) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        };

        // Prepare CSV data
        const headers = [
            "ID",
            "Title",
            "Slug",
            "Excerpt",
            "Status",
            "Author",
            "Author Email",
            "Categories",
            "Tags",
            "Published At",
            "Created At",
            "Updated At",
        ];

        const row = [
            blog.id || "",
            blog.title || "",
            blog.slug || "",
            blog.excerpt || "",
            blog.status || "",
            blog.author?.name || blog.authorName || "",
            blog.author?.email || "",
            // Extract category names from nested structure
            (blog.categories || [])
                .map((cat) => cat.category?.name || cat.name)
                .join("; ") || "",
            // Extract tag names from nested structure
            (blog.tags || [])
                .map((tag) => tag.tag?.name || tag.name)
                .join("; ") || "",
            blog.publishedAt || "",
            blog.createdAt || "",
            blog.updatedAt || "",
        ];

        // Create CSV content
        const csvContent = [
            headers.map(escapeCSV).join(","),
            row.map(escapeCSV).join(","),
        ].join("\n");

        // Create blob and download
        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${blog.slug || blog.id || "blog"}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Get unique months from posts
    const getAvailableMonths = () => {
        if (!Array.isArray(blogs) || blogs.length === 0) return [];

        const monthsSet = new Set();
        blogs.forEach((blog) => {
            const date = blog.publishedAt || blog.createdAt || blog.updatedAt;
            if (date) {
                const d = new Date(date);
                const monthYear = `${d.getMonth() + 1}/${d.getFullYear()}`;
                monthsSet.add(monthYear);
            }
        });

        // Convert to array and sort by date (newest first)
        return Array.from(monthsSet)
            .map((monthYear) => {
                const [month, year] = monthYear.split("/");
                return {
                    value: monthYear,
                    date: new Date(parseInt(year), parseInt(month) - 1, 1),
                };
            })
            .sort((a, b) => b.date - a.date)
            .map((item) => {
                const monthName = item.date.toLocaleString("default", {
                    month: "long",
                });
                const year = item.date.getFullYear();
                return {
                    value: item.value,
                    label: `${monthName} ${year}`,
                };
            });
    };

    const availableMonths = getAvailableMonths();

    // Handle quick edit save
    const handleQuickEditSave = async () => {
        if (!quickEditData || !quickEditBlogId) return;

        try {
            // Import blogService at the top if not already imported
            const { blogService } = await import("../services/blogService");

            // Prepare update data
            const updateData = {
                title: quickEditData.title.trim(),
                slug: quickEditData.slug.trim(),
                status: quickEditData.status,
                // categoryIds and tagIds are already arrays
                categoryIds: Array.isArray(quickEditData.categoryIds)
                    ? quickEditData.categoryIds
                    : [],
                tagIds: Array.isArray(quickEditData.tagIds)
                    ? quickEditData.tagIds
                    : [],
            };

            // Add publishedAt if status is SCHEDULED and date fields exist
            if (
                quickEditData.status === "SCHEDULED" &&
                quickEditData.dateMonth &&
                quickEditData.dateDay &&
                quickEditData.dateYear &&
                quickEditData.dateHour !== undefined &&
                quickEditData.dateMinute !== undefined
            ) {
                const publishedDate = new Date(
                    parseInt(quickEditData.dateYear),
                    parseInt(quickEditData.dateMonth) - 1,
                    parseInt(quickEditData.dateDay),
                    parseInt(quickEditData.dateHour),
                    parseInt(quickEditData.dateMinute)
                );
                updateData.publishedAt = publishedDate.toISOString();
            }

            await blogService.update(quickEditBlogId, updateData);

            setQuickEditPostId(null);
            setQuickEditData(null);

            // Refresh the blogs list
            updateFilters({});
        } catch (error) {
            console.error("Failed to update blog:", error);
            // Error toast is already shown by the service
        }
    };

    // Handle column sort
    const handleSort = (columnKey) => {
        let direction = "asc";
        if (sortConfig.key === columnKey && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key: columnKey, direction });
    };

    // Sort blogs data
    const sortedBlogs = React.useMemo(() => {
        if (!Array.isArray(blogs) || blogs.length === 0) return [];
        if (!sortConfig.key) return blogs;

        const sorted = [...blogs].sort((a, b) => {
            let aValue, bValue;

            switch (sortConfig.key) {
                case "title":
                    aValue = a.title?.toLowerCase() || "";
                    bValue = b.title?.toLowerCase() || "";
                    break;
                case "author":
                    aValue = (
                        a.author?.name ||
                        a.authorName ||
                        ""
                    ).toLowerCase();
                    bValue = (
                        b.author?.name ||
                        b.authorName ||
                        ""
                    ).toLowerCase();
                    break;
                case "categories":
                    aValue = (a.categories || [])
                        .map((c) => c.name)
                        .join(", ")
                        .toLowerCase();
                    bValue = (b.categories || [])
                        .map((c) => c.name)
                        .join(", ")
                        .toLowerCase();
                    break;
                case "tags":
                    aValue = (a.tags || []).join(", ").toLowerCase();
                    bValue = (b.tags || []).join(", ").toLowerCase();
                    break;
                case "date":
                    aValue = new Date(
                        a.publishedAt || a.updatedAt || 0
                    ).getTime();
                    bValue = new Date(
                        b.publishedAt || b.updatedAt || 0
                    ).getTime();
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) {
                return sortConfig.direction === "asc" ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === "asc" ? 1 : -1;
            }
            return 0;
        });

        return sorted;
    }, [blogs, sortConfig]);

    const DEFAULT_STATUS_BADGE_CLASS =
        "bg-secondary text-secondary-foreground dark:bg-slate-400/20 dark:text-slate-200";
    const STATUS_BADGE_CLASSES = {
        PUBLISHED:
            "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-200",
        DRAFT: "bg-amber-100 text-amber-700 dark:bg-amber-400/20 dark:text-amber-200",
        ARCHIVED:
            "bg-slate-100 text-slate-700 dark:bg-slate-400/20 dark:text-slate-200",
    };

    const getStatusBadgeClass = (status) =>
        STATUS_BADGE_CLASSES[status?.toUpperCase()] ||
        DEFAULT_STATUS_BADGE_CLASS;

    // Filter categories and tags based on search query for quick edit
    const filteredQuickEditCategories =
        quickEditData && availableCategories
            ? availableCategories.filter((category) =>
                  category.name
                      .toLowerCase()
                      .includes(quickEditCategorySearchQuery.toLowerCase())
              )
            : [];
    const filteredQuickEditTags =
        quickEditData && availableTags
            ? availableTags.filter((tag) =>
                  tag.name
                      .toLowerCase()
                      .includes(quickEditTagSearchQuery.toLowerCase())
              )
            : [];

    // Get selected category and tag names for display in quick edit
    const selectedQuickEditCategories =
        quickEditData && availableCategories
            ? availableCategories.filter((cat) =>
                  quickEditData.categoryIds?.includes(cat.id)
              )
            : [];
    const selectedQuickEditTags =
        quickEditData && availableTags
            ? availableTags.filter((tag) =>
                  quickEditData.tagIds?.includes(tag.id)
              )
            : [];

    // Format date
    const formatDate = (date) => {
        if (!date) return "—";
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        let hours = d.getHours();
        const minutes = String(d.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? "pm" : "am";
        hours = hours % 12;
        hours = hours ? hours : 12; // 0 should be 12
        return `${year}/${month}/${day} at ${hours}:${minutes} ${ampm}`;
    };

    // Render Quick Edit inline form
    const renderQuickEditRow = (blog) => {
        if (!quickEditData) return null;

        return (
            <tr className="bg-yellow-50 dark:bg-yellow-900/10">
                <td colSpan="100%" className="p-4">
                    <div className="bg-background border border-border rounded-lg p-4">
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold mb-3">
                                QUICK EDIT
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Left Column */}
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium mb-1">
                                        Title
                                    </label>
                                    <CustomInput
                                        type="text"
                                        value={quickEditData.title}
                                        onChange={(e) =>
                                            setQuickEditData({
                                                ...quickEditData,
                                                title: e.target.value,
                                            })
                                        }
                                        className="text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1">
                                        Slug
                                    </label>
                                    <CustomInput
                                        type="text"
                                        value={quickEditData.slug}
                                        onChange={(e) =>
                                            setQuickEditData({
                                                ...quickEditData,
                                                slug: e.target.value,
                                            })
                                        }
                                        className="text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1">
                                        Categories
                                    </label>
                                    <div
                                        className="relative"
                                        ref={quickEditCategoryDropdownRef}
                                    >
                                        {/* Selected Categories Display */}
                                        {selectedQuickEditCategories.length >
                                            0 && (
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {selectedQuickEditCategories.map(
                                                    (category) => (
                                                        <span
                                                            key={category.id}
                                                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium"
                                                        >
                                                            {category.name}
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setQuickEditData(
                                                                        {
                                                                            ...quickEditData,
                                                                            categoryIds:
                                                                                quickEditData.categoryIds.filter(
                                                                                    (
                                                                                        id
                                                                                    ) =>
                                                                                        id !==
                                                                                        category.id
                                                                                ),
                                                                        }
                                                                    );
                                                                }}
                                                                className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                        )}

                                        {/* Multi-Select Dropdown */}
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setQuickEditCategoryDropdownOpen(
                                                        !quickEditCategoryDropdownOpen
                                                    );
                                                    setQuickEditCategorySearchQuery(
                                                        ""
                                                    );
                                                }}
                                                className={cn(
                                                    "w-full px-3 py-2 text-sm bg-background border rounded-md text-left flex items-center justify-between",
                                                    "border-input text-foreground",
                                                    "focus:outline-none focus:ring-2 focus:ring-primary",
                                                    "hover:border-gray-400 dark:hover:border-gray-500 bg-gray-800"
                                                )}
                                            >
                                                <span className="text-muted-foreground">
                                                    {selectedQuickEditCategories.length >
                                                    0
                                                        ? `${selectedQuickEditCategories.length} selected`
                                                        : "Select categories..."}
                                                </span>
                                                <ChevronDown
                                                    className={cn(
                                                        "h-4 w-4 text-muted-foreground transition-transform",
                                                        quickEditCategoryDropdownOpen &&
                                                            "transform rotate-180"
                                                    )}
                                                />
                                            </button>

                                            {/* Dropdown Menu */}
                                            {quickEditCategoryDropdownOpen && (
                                                <div
                                                    className={cn(
                                                        "absolute z-50 w-full mt-1 bg-background border border-input rounded-md shadow-lg",
                                                        "max-h-64 overflow-hidden flex flex-col bg-gray-800"
                                                    )}
                                                >
                                                    {/* Search Input */}
                                                    <div className="p-2 border-b border-input">
                                                        <CustomInput
                                                            type="text"
                                                            placeholder="Search categories..."
                                                            value={
                                                                quickEditCategorySearchQuery
                                                            }
                                                            onChange={(e) =>
                                                                setQuickEditCategorySearchQuery(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            className="w-full"
                                                            onClick={(e) =>
                                                                e.stopPropagation()
                                                            }
                                                        />
                                                    </div>

                                                    {/* Options List */}
                                                    <div className="overflow-y-auto max-h-48 bg-gray-800">
                                                        {categoriesLoading ? (
                                                            <div className="p-3 text-sm text-muted-foreground text-center">
                                                                Loading
                                                                categories...
                                                            </div>
                                                        ) : filteredQuickEditCategories.length ===
                                                          0 ? (
                                                            <div className="p-3 text-sm text-muted-foreground text-center">
                                                                {quickEditCategorySearchQuery
                                                                    ? "No categories found"
                                                                    : "No categories available"}
                                                            </div>
                                                        ) : (
                                                            <div className="py-1">
                                                                {filteredQuickEditCategories.map(
                                                                    (
                                                                        category
                                                                    ) => {
                                                                        const isSelected =
                                                                            quickEditData.categoryIds?.includes(
                                                                                category.id
                                                                            );
                                                                        return (
                                                                            <button
                                                                                key={
                                                                                    category.id
                                                                                }
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    const currentIds =
                                                                                        quickEditData.categoryIds ||
                                                                                        [];
                                                                                    if (
                                                                                        isSelected
                                                                                    ) {
                                                                                        setQuickEditData(
                                                                                            {
                                                                                                ...quickEditData,
                                                                                                categoryIds:
                                                                                                    currentIds.filter(
                                                                                                        (
                                                                                                            id
                                                                                                        ) =>
                                                                                                            id !==
                                                                                                            category.id
                                                                                                    ),
                                                                                            }
                                                                                        );
                                                                                    } else {
                                                                                        setQuickEditData(
                                                                                            {
                                                                                                ...quickEditData,
                                                                                                categoryIds:
                                                                                                    [
                                                                                                        ...currentIds,
                                                                                                        category.id,
                                                                                                    ],
                                                                                            }
                                                                                        );
                                                                                    }
                                                                                }}
                                                                                className={cn(
                                                                                    "w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors",
                                                                                    isSelected
                                                                                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-200"
                                                                                        : "hover:bg-muted/50 text-foreground"
                                                                                )}
                                                                            >
                                                                                {isSelected && (
                                                                                    <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                                                )}
                                                                                <span
                                                                                    className={
                                                                                        isSelected
                                                                                            ? ""
                                                                                            : "ml-6"
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        category.name
                                                                                    }
                                                                                </span>
                                                                            </button>
                                                                        );
                                                                    }
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium mb-1">
                                        Tags
                                    </label>
                                    <div
                                        className="relative"
                                        ref={quickEditTagDropdownRef}
                                    >
                                        {/* Selected Tags Display */}
                                        {selectedQuickEditTags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {selectedQuickEditTags.map(
                                                    (tag) => (
                                                        <span
                                                            key={tag.id}
                                                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium"
                                                        >
                                                            {tag.name}
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setQuickEditData(
                                                                        {
                                                                            ...quickEditData,
                                                                            tagIds: quickEditData.tagIds.filter(
                                                                                (
                                                                                    id
                                                                                ) =>
                                                                                    id !==
                                                                                    tag.id
                                                                            ),
                                                                        }
                                                                    );
                                                                }}
                                                                className="ml-1 hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-0.5 transition-colors"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                        )}

                                        {/* Multi-Select Dropdown */}
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setQuickEditTagDropdownOpen(
                                                        !quickEditTagDropdownOpen
                                                    );
                                                    setQuickEditTagSearchQuery(
                                                        ""
                                                    );
                                                }}
                                                className={cn(
                                                    "w-full px-3 py-2 text-sm bg-background border rounded-md text-left flex items-center justify-between",
                                                    "border-input text-foreground",
                                                    "focus:outline-none focus:ring-2 focus:ring-primary",
                                                    "hover:border-gray-400 dark:hover:border-gray-500 bg-gray-800"
                                                )}
                                            >
                                                <span className="text-muted-foreground">
                                                    {selectedQuickEditTags.length >
                                                    0
                                                        ? `${selectedQuickEditTags.length} selected`
                                                        : "Select tags..."}
                                                </span>
                                                <ChevronDown
                                                    className={cn(
                                                        "h-4 w-4 text-muted-foreground transition-transform",
                                                        quickEditTagDropdownOpen &&
                                                            "transform rotate-180"
                                                    )}
                                                />
                                            </button>

                                            {/* Dropdown Menu */}
                                            {quickEditTagDropdownOpen && (
                                                <div
                                                    className={cn(
                                                        "absolute z-50 w-full mt-1 bg-background border border-input rounded-md shadow-lg",
                                                        "max-h-64 overflow-hidden flex flex-col bg-gray-800"
                                                    )}
                                                >
                                                    {/* Search Input */}
                                                    <div className="p-2 border-b border-input">
                                                        <CustomInput
                                                            type="text"
                                                            placeholder="Search tags..."
                                                            value={
                                                                quickEditTagSearchQuery
                                                            }
                                                            onChange={(e) =>
                                                                setQuickEditTagSearchQuery(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            className="w-full"
                                                            onClick={(e) =>
                                                                e.stopPropagation()
                                                            }
                                                        />
                                                    </div>

                                                    {/* Options List */}
                                                    <div className="overflow-y-auto max-h-48 bg-gray-800">
                                                        {tagsLoading ? (
                                                            <div className="p-3 text-sm text-muted-foreground text-center">
                                                                Loading tags...
                                                            </div>
                                                        ) : filteredQuickEditTags.length ===
                                                          0 ? (
                                                            <div className="p-3 text-sm text-muted-foreground text-center">
                                                                {quickEditTagSearchQuery
                                                                    ? "No tags found"
                                                                    : "No tags available"}
                                                            </div>
                                                        ) : (
                                                            <div className="py-1">
                                                                {filteredQuickEditTags.map(
                                                                    (tag) => {
                                                                        const isSelected =
                                                                            quickEditData.tagIds?.includes(
                                                                                tag.id
                                                                            );
                                                                        return (
                                                                            <button
                                                                                key={
                                                                                    tag.id
                                                                                }
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    const currentIds =
                                                                                        quickEditData.tagIds ||
                                                                                        [];
                                                                                    if (
                                                                                        isSelected
                                                                                    ) {
                                                                                        setQuickEditData(
                                                                                            {
                                                                                                ...quickEditData,
                                                                                                tagIds: currentIds.filter(
                                                                                                    (
                                                                                                        id
                                                                                                    ) =>
                                                                                                        id !==
                                                                                                        tag.id
                                                                                                ),
                                                                                            }
                                                                                        );
                                                                                    } else {
                                                                                        setQuickEditData(
                                                                                            {
                                                                                                ...quickEditData,
                                                                                                tagIds: [
                                                                                                    ...currentIds,
                                                                                                    tag.id,
                                                                                                ],
                                                                                            }
                                                                                        );
                                                                                    }
                                                                                }}
                                                                                className={cn(
                                                                                    "w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors",
                                                                                    isSelected
                                                                                        ? "bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-200"
                                                                                        : "hover:bg-muted/50 text-foreground"
                                                                                )}
                                                                            >
                                                                                {isSelected && (
                                                                                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                                                )}
                                                                                <span
                                                                                    className={
                                                                                        isSelected
                                                                                            ? ""
                                                                                            : "ml-6"
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        tag.name
                                                                                    }
                                                                                </span>
                                                                            </button>
                                                                        );
                                                                    }
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={quickEditData.status}
                                        onChange={(e) => {
                                            const newStatus = e.target.value;
                                            setQuickEditData({
                                                ...quickEditData,
                                                status: newStatus,
                                                // Initialize date fields when switching to SCHEDULED
                                                ...(newStatus === "SCHEDULED" &&
                                                    !quickEditData.dateMonth && {
                                                        dateMonth: String(
                                                            new Date().getMonth() +
                                                                1
                                                        ).padStart(2, "0"),
                                                        dateDay: String(
                                                            new Date().getDate()
                                                        ).padStart(2, "0"),
                                                        dateYear: String(
                                                            new Date().getFullYear()
                                                        ),
                                                        dateHour: String(
                                                            new Date().getHours()
                                                        ).padStart(2, "0"),
                                                        dateMinute: String(
                                                            new Date().getMinutes()
                                                        ).padStart(2, "0"),
                                                    }),
                                            });
                                        }}
                                        className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:border-gray-700"
                                    >
                                        <option value="DRAFT">Draft</option>
                                        <option value="PUBLISHED">
                                            Published
                                        </option>
                                        <option value="SCHEDULED">
                                            Scheduled
                                        </option>
                                    </select>
                                </div>

                                {/* Date field - only show when status is SCHEDULED */}
                                {quickEditData.status === "SCHEDULED" && (
                                    <div>
                                        <label className="block text-xs font-medium mb-1">
                                            Publish Date & Time
                                            <span className="text-red-500 ml-1">
                                                *
                                            </span>
                                        </label>
                                        <div className="flex items-center gap-1 flex-wrap">
                                            <select
                                                value={
                                                    quickEditData.dateMonth ||
                                                    String(
                                                        new Date().getMonth() +
                                                            1
                                                    ).padStart(2, "0")
                                                }
                                                onChange={(e) =>
                                                    setQuickEditData({
                                                        ...quickEditData,
                                                        dateMonth:
                                                            e.target.value,
                                                    })
                                                }
                                                className=" px-3 py-2 text-sm bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:border-gray-700"
                                            >
                                                <option value="01">Jan</option>
                                                <option value="02">Feb</option>
                                                <option value="03">Mar</option>
                                                <option value="04">Apr</option>
                                                <option value="05">May</option>
                                                <option value="06">Jun</option>
                                                <option value="07">Jul</option>
                                                <option value="08">Aug</option>
                                                <option value="09">Sep</option>
                                                <option value="10">Oct</option>
                                                <option value="11">Nov</option>
                                                <option value="12">Dec</option>
                                            </select>
                                            <CustomInput
                                                type="text"
                                                value={
                                                    quickEditData.dateDay ||
                                                    String(
                                                        new Date().getDate()
                                                    ).padStart(2, "0")
                                                }
                                                onChange={(e) =>
                                                    setQuickEditData({
                                                        ...quickEditData,
                                                        dateDay: e.target.value,
                                                    })
                                                }
                                                className="w-12 text-xs"
                                                placeholder="DD"
                                                maxLength={2}
                                            />
                                            <CustomInput
                                                type="text"
                                                value={
                                                    quickEditData.dateYear ||
                                                    String(
                                                        new Date().getFullYear()
                                                    )
                                                }
                                                onChange={(e) =>
                                                    setQuickEditData({
                                                        ...quickEditData,
                                                        dateYear:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-16 text-xs"
                                                placeholder="YYYY"
                                                maxLength={4}
                                            />
                                            <span className="text-xs text-muted-foreground">
                                                at
                                            </span>
                                            <CustomInput
                                                type="text"
                                                value={
                                                    quickEditData.dateHour ||
                                                    String(
                                                        new Date().getHours()
                                                    ).padStart(2, "0")
                                                }
                                                onChange={(e) =>
                                                    setQuickEditData({
                                                        ...quickEditData,
                                                        dateHour:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-12 text-xs"
                                                placeholder="HH"
                                                maxLength={2}
                                            />
                                            <span className="text-xs text-muted-foreground">
                                                :
                                            </span>
                                            <CustomInput
                                                type="text"
                                                value={
                                                    quickEditData.dateMinute ||
                                                    String(
                                                        new Date().getMinutes()
                                                    ).padStart(2, "0")
                                                }
                                                onChange={(e) =>
                                                    setQuickEditData({
                                                        ...quickEditData,
                                                        dateMinute:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-12 text-xs"
                                                placeholder="MM"
                                                maxLength={2}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-4 flex items-center gap-2 pt-3 border-t border-border">
                            <CustomButton
                                onClick={handleQuickEditSave}
                                size="sm"
                                className="bg-primary text-primary-foreground"
                            >
                                Update
                            </CustomButton>
                            <CustomButton
                                onClick={handleQuickEditCancel}
                                variant="outline"
                                size="sm"
                            >
                                Cancel
                            </CustomButton>
                        </div>
                    </div>
                </td>
            </tr>
        );
    };

    // Render sort icon
    const renderSortIcon = (columnKey) => {
        if (sortConfig.key === columnKey) {
            return sortConfig.direction === "asc" ? (
                <ArrowUp className="inline h-3 w-3 ml-1" />
            ) : (
                <ArrowDown className="inline h-3 w-3 ml-1" />
            );
        }
        // Show a neutral indicator for sortable columns
        return (
            <span className="inline-flex flex-col ml-1 opacity-40">
                <ArrowUp className="h-2 w-2 -mb-1" />
                <ArrowDown className="h-2 w-2" />
            </span>
        );
    };

    // Table columns
    const columns = [
        {
            key: "title",
            label: "Title",
            width: "30%",
            sortable: true,
            onSort: () => handleSort("title"),
            renderLabel: () => (
                <button
                    onClick={() => handleSort("title")}
                    className="flex items-center hover:text-primary cursor-pointer uppercase"
                >
                    Title
                    {renderSortIcon("title")}
                </button>
            ),
            render: (blog) => (
                <span
                    className="font-medium text-foreground hover:text-primary cursor-pointer break-words whitespace-break-spaces line-clamp-2"
                    data-tooltip-id="blog-tooltip"
                    data-tooltip-content={blog.title}
                >
                    {blog.title}{" "}
                    <span className="text-xs text-muted-foreground mt-0.5">
                        — Classic editor
                    </span>
                </span>
            ),
        },
        {
            key: "author",
            label: "Authors",
            width: "15%",
            sortable: true,
            onSort: () => handleSort("author"),
            renderLabel: () => (
                <button
                    onClick={() => handleSort("author")}
                    className="flex items-center hover:text-primary cursor-pointer uppercase"
                >
                    Authors
                    {renderSortIcon("author")}
                </button>
            ),
            render: (blog) => (
                <span
                    className="text-sm text-foreground break-words"
                    data-tooltip-id="blog-tooltip"
                    data-tooltip-content={
                        blog.author?.name ||
                        blog.authorName ||
                        blog?.author?.firstName +
                            " " +
                            blog?.author?.lastName ||
                        "—"
                    }
                >
                    {blog.author?.name ||
                        blog.authorName ||
                        blog?.author?.firstName +
                            " " +
                            blog?.author?.lastName ||
                        "—"}
                </span>
            ),
        },
        {
            key: "categories",
            label: "Categories",
            width: "15%",
            sortable: true,
            onSort: () => handleSort("categories"),
            renderLabel: () => (
                <button
                    onClick={() => handleSort("categories")}
                    className="flex items-center hover:text-primary cursor-pointer uppercase"
                >
                    Categories
                    {renderSortIcon("categories")}
                </button>
            ),
            render: (blog) => {
                const postCategories = blog.categories || [];
                if (postCategories.length === 0)
                    return (
                        <span className="text-sm text-muted-foreground">—</span>
                    );
                // Extract category names from nested structure
                const categoriesText = postCategories
                    .map((cat) => cat.category?.name || cat.name || cat)
                    .join(", ");
                return (
                    <span
                        className="text-sm text-foreground break-words"
                        data-tooltip-id="blog-tooltip"
                        data-tooltip-content={categoriesText}
                    >
                        {categoriesText}
                    </span>
                );
            },
        },
        {
            key: "tags",
            label: "Tags",
            width: "15%",
            sortable: true,
            onSort: () => handleSort("tags"),
            renderLabel: () => (
                <button
                    onClick={() => handleSort("tags")}
                    className="flex items-center hover:text-primary cursor-pointer uppercase"
                >
                    Tags
                    {renderSortIcon("tags")}
                </button>
            ),
            render: (blog) => {
                const postTags = blog.tags || [];
                if (postTags.length === 0)
                    return (
                        <span className="text-sm text-muted-foreground">—</span>
                    );
                // Extract tag names from nested structure
                const tagNames = postTags.map(
                    (tag) => tag.tag?.name || tag.name || tag
                );
                const allTagsText = tagNames.join(", ");
                const displayText =
                    tagNames.slice(0, 2).join(", ") +
                    (tagNames.length > 2 ? `, +${tagNames.length - 2}` : "");
                return (
                    <span
                        className="text-sm text-foreground break-words"
                        data-tooltip-id="blog-tooltip"
                        data-tooltip-content={allTagsText}
                    >
                        {displayText}
                    </span>
                );
            },
        },
        {
            key: "comments",
            label: "💬",
            width: "5%",
            render: (blog) => (
                <span className="text-sm text-muted-foreground">—</span>
            ),
        },
        {
            key: "date",
            label: "Date",
            width: "15%",
            sortable: true,
            onSort: () => handleSort("date"),
            renderLabel: () => (
                <button
                    onClick={() => handleSort("date")}
                    className="flex items-center hover:text-primary cursor-pointer uppercase"
                >
                    Date
                    {renderSortIcon("date")}
                </button>
            ),
            render: (blog) => {
                const statusText =
                    blog.status === "PUBLISHED"
                        ? "Published"
                        : blog.status === "DRAFT"
                        ? "Last Modified"
                        : blog.status === "SCHEDULED"
                        ? "Scheduled"
                        : "Unknown";
                const dateText = formatDate(blog.publishedAt || blog.updatedAt);
                const fullText = `${statusText} - ${dateText}`;
                return (
                    <div
                        className="flex flex-col text-sm"
                        data-tooltip-id="blog-tooltip"
                        data-tooltip-content={fullText}
                    >
                        <span className="text-foreground">{statusText}</span>
                        <span className="text-muted-foreground text-xs">
                            {dateText}
                        </span>
                    </div>
                );
            },
        },
        {
            key: "actions",
            label: "Actions",
            width: "20%",
            render: (blog) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/blogs/${blog.id}/edit`);
                        }}
                        className="p-1.5 hover:bg-accent rounded transition-colors"
                        data-tooltip-id="blog-tooltip"
                        data-tooltip-content="Edit"
                        type="button"
                    >
                        <Edit className="h-4 w-4 text-foreground hover:text-primary" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleQuickEditClick(blog);
                        }}
                        className="px-2 py-1 text-xs text-primary hover:bg-accent rounded transition-colors"
                        data-tooltip-id="blog-tooltip"
                        data-tooltip-content="Quick Edit"
                        type="button"
                    >
                        Quick Edit
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(blog);
                        }}
                        className="p-1.5 hover:bg-accent rounded transition-colors"
                        data-tooltip-id="blog-tooltip"
                        data-tooltip-content="Delete"
                        type="button"
                    >
                        <Trash2 className="h-4 w-4 text-foreground hover:text-red-600 dark:hover:text-red-400" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(`/blogs/${blog.id}`, "_blank");
                        }}
                        className="p-1.5 hover:bg-accent rounded transition-colors"
                        data-tooltip-id="blog-tooltip"
                        data-tooltip-content="View"
                        type="button"
                    >
                        <Eye className="h-4 w-4 text-foreground hover:text-primary" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadCSV(blog);
                        }}
                        className="p-1.5 hover:bg-accent rounded transition-colors"
                        data-tooltip-id="blog-tooltip"
                        data-tooltip-content="Download CSV"
                        type="button"
                    >
                        <Download className="h-4 w-4 text-foreground hover:text-primary" />
                    </button>
                </div>
            ),
        },
    ];

    // Check if filters are active
    const hasActiveFilters =
        searchTerm ||
        filterValues.status ||
        filterValues.categoryId ||
        filterValues.sort ||
        dateFilter ||
        authorFilter;

    // Handle clear filters
    const handleClearFilters = () => {
        setSearchTerm("");
        setBulkAction("");
        setDateFilter("");
        setAuthorFilter("");
        setFilterValues({
            status: "",
            categoryId: "",
            sort: "",
        });
        updateFilters({
            search: undefined,
            status: undefined,
            categoryId: "", // Empty string for "All Categories"
            sort: undefined,
            page: 1,
        });
    };

    // Show error state if there's an error
    if (error && !loading) {
        return (
            <PageContainer>
                <PageHeader
                    title="Blogs"
                    description=""
                    action={
                        <CustomButton
                            onClick={() => router.push("/dashboard/blogs/new")}
                            className="flex items-center gap-2"
                            size="sm"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">Add Blog</span>
                            <span className="sm:hidden">Add</span>
                        </CustomButton>
                    }
                />
                <ErrorState
                    title="Failed to load blogs"
                    message={error}
                    action={
                        <CustomButton onClick={() => window.location.reload()}>
                            Retry
                        </CustomButton>
                    }
                />
            </PageContainer>
        );
    }

    // Calculate status counts
    const allPostsCount = blogs.length;
    const publishedCount = blogs.filter((p) => p.status === "PUBLISHED").length;
    const draftCount = blogs.filter((p) => p.status === "DRAFT").length;
    const scheduledCount = blogs.filter((p) => p.status === "SCHEDULED").length;

    return (
        <PageContainer>
            {/* <LoadingState
                message="Loading blogs..."
                loading={loading}
                fullScreen={true}
            /> */}
            <PageHeader
                title="Blogs"
                description=""
                action={
                    <CustomButton
                        onClick={() => router.push("/dashboard/blogs/new")}
                        className="flex items-center gap-2"
                        size="sm"
                    >
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Add Blog</span>
                        <span className="sm:hidden">Add</span>
                    </CustomButton>
                }
            />

            {/* Status Tabs and Search Bar - Combined Row on Large Screens */}
            <div className="mb-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-2 border-b border-border">
                {/* Status Tabs */}
                <div className="flex items-center gap-1 text-sm">
                    <button
                        onClick={() => handleFilterChange("status", "")}
                        className={`px-2 py-1 ${
                            !filterValues.status
                                ? "text-primary font-medium"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        All ({pagination.total || 0})
                    </button>
                    <span className="text-muted-foreground">|</span>
                    <button
                        onClick={() =>
                            handleFilterChange("status", "PUBLISHED")
                        }
                        className={`px-2 py-1 ${
                            filterValues.status === "PUBLISHED"
                                ? "text-primary font-medium"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Published ({publishedCount})
                    </button>
                    <span className="text-muted-foreground">|</span>
                    <button
                        onClick={() => handleFilterChange("status", "DRAFT")}
                        className={`px-2 py-1 ${
                            filterValues.status === "DRAFT"
                                ? "text-primary font-medium"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Drafts ({draftCount})
                    </button>
                    <span className="text-muted-foreground">|</span>
                    <button
                        onClick={() =>
                            handleFilterChange("status", "SCHEDULED")
                        }
                        className={`px-2 py-1 ${
                            filterValues.status === "SCHEDULED"
                                ? "text-primary font-medium"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Scheduled ({scheduledCount})
                    </button>
                </div>

                {/* Search and Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 sm:max-w-md lg:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <CustomInput
                            type="text"
                            placeholder="Search blogs..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="flex gap-2">
                        <CustomButton
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2"
                        >
                            <Filter className="h-4 w-4" />
                            Filters
                        </CustomButton>
                    </div>
                </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="mb-6 flex flex-wrap items-center gap-2">
                    {/* Bulk Actions */}
                    <select
                        value={bulkAction}
                        onChange={(e) => setBulkAction(e.target.value)}
                        className="px-3 py-1.5 text-sm bg-background border border-input rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:border-gray-700"
                    >
                        <option value="">Bulk actions</option>
                        <option value="edit">Edit</option>
                        <option value="delete">Move to Trash</option>
                        <option value="download">Download</option>
                        <option value="export">Export</option>
                    </select>

                    <CustomButton
                        variant="outline"
                        size="sm"
                        onClick={handleBulkActionApply}
                        disabled={!bulkAction || selectedBlogIds.length === 0}
                        className="me-3"
                    >
                        Apply
                    </CustomButton>

                    {/* All Dates */}
                    <select
                        value={dateFilter}
                        onChange={(e) => handleDateFilterChange(e.target.value)}
                        className="px-3 py-1.5 text-sm bg-background border border-input rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:border-gray-700"
                    >
                        <option value="">All dates</option>
                        {availableMonths.map((month) => (
                            <option key={month.value} value={month.value}>
                                {month.label}
                            </option>
                        ))}
                    </select>

                    {/* All Categories */}
                    <select
                        value={filterValues.categoryId}
                        onChange={(e) =>
                            setFilterValues({
                                ...filterValues,
                                categoryId: e.target.value,
                            })
                        }
                        className="px-3 py-1.5 text-sm bg-background border border-input rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:border-gray-700"
                    >
                        <option value="">All Categories</option>
                        {Array.isArray(availableCategories) &&
                            availableCategories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                    </select>

                    {/* All Authors */}
                    <select
                        value={authorFilter}
                        onChange={(e) =>
                            handleAuthorFilterChange(e.target.value)
                        }
                        className="px-3 py-1.5 text-sm bg-background border border-input rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:border-gray-700"
                    >
                        <option value="">All Authors</option>
                        <option value="john">John Doe</option>
                        <option value="jane">Jane Smith</option>
                        <option value="alex">Alex Johnson</option>
                        <option value="mike">Mike Wilson</option>
                    </select>

                    {/* Filter Button */}
                    <CustomButton
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            // Apply the filters
                            const appliedFilters = { page: 1 };
                            // Always send categoryId (empty string for "All Categories")
                            appliedFilters.categoryId =
                                filterValues.categoryId || "";
                            updateFilters(appliedFilters);
                        }}
                    >
                        Filter
                    </CustomButton>

                    {hasActiveFilters && (
                        <CustomButton
                            onClick={handleClearFilters}
                            variant="ghost"
                            size="sm"
                        >
                            Clear Filters
                        </CustomButton>
                    )}
                </div>
            )}

            {/* Bulk Actions Bar */}
            {/* {selectedBlogIds.length > 0 && (
                <div className="mb-4 p-3 bg-accent rounded-lg border border-border flex items-center justify-between">
                    <span className="text-sm text-foreground">
                        {selectedBlogIds.length} post
                        {selectedBlogIds.length > 1 ? "s" : ""} selected
                    </span>
                    <CustomButton
                        onClick={handleBulkDeleteClick}
                        variant="destructive"
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete Selected
                    </CustomButton>
                </div>
            )} */}

            {/* Item Count */}
            {!loading && pagination.total > 0 && (
                <div className="mb-2 flex justify-end">
                    <span className="text-sm text-muted-foreground">
                        {pagination.total}{" "}
                        {pagination.total === 1 ? "item" : "items"}
                    </span>
                </div>
            )}

            {/* Posts Table */}
            <DataTable
                columns={columns}
                data={sortedBlogs}
                loading={loading}
                selectable={true}
                selectedRows={selectedBlogIds}
                onSelectionChange={handleSelectionChange}
                getRowId={(row) => row.id}
                renderCustomRow={(row, rowId) => {
                    if (quickEditBlogId === rowId) {
                        return renderQuickEditRow(row);
                    }
                    return null;
                }}
                shouldHideRow={(row, rowId) => quickEditBlogId === rowId}
                emptyState={{
                    icon: FileText,
                    title: "No blogs found",
                    description: hasActiveFilters
                        ? "No blogs match your current filters. Try adjusting your search or filter criteria."
                        : "Get started by creating your first blog to share with your audience.",
                    action: hasActiveFilters ? (
                        <CustomButton
                            onClick={handleClearFilters}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            Clear Filters
                        </CustomButton>
                    ) : (
                        <CustomButton
                            onClick={() => router.push("/dashboard/blogs/new")}
                            className="flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add Your First Blog
                        </CustomButton>
                    ),
                }}
            />

            {/* Pagination */}
            {pagination && pagination.total > 0 && (
                <Pagination
                    currentPage={pagination.page || 1}
                    totalPages={pagination.totalPages || 1}
                    total={pagination.total || 0}
                    limit={pagination.limit || 10}
                    onPageChange={(page) => updateFilters({ page })}
                    disabled={loading}
                    resourceName="blogs"
                />
            )}

            {/* Delete Confirmation Dialog */}
            <CustomConfirmationDialog
                isOpen={deleteDialogOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Delete Blog"
                description={`Are you sure you want to delete "${blogToDelete?.title}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />

            {/* Bulk Delete Confirmation Dialog */}
            <CustomConfirmationDialog
                isOpen={bulkDeleteDialogOpen}
                onClose={handleBulkDeleteCancel}
                onConfirm={handleBulkDeleteConfirm}
                title="Delete Blogs"
                description={`Are you sure you want to delete ${
                    selectedBlogIds.length
                } blog${
                    selectedBlogIds.length > 1 ? "s" : ""
                }? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />

            {/* Tooltip */}
            <Tooltip
                id="blog-tooltip"
                place="top"
                className="z-50 !bg-[#f1f2f4] !text-[#65758b] dark:!bg-gray-700 dark:!text-white !opacity-100 !max-w-xs !whitespace-normal !break-words "
            />
        </PageContainer>
    );
}
