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
    Edit,
    Eye,
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
import { usePages } from "../hooks/usePages";
import { LoadingState } from "@/components/ui/LoadingState";

export default function Pages() {
    const router = useRouter();
    const {
        pages,
        loading,
        error,
        deletePage,
        bulkDeletePages,
        pagination,
        updateFilters,
    } = usePages();
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [pageToDelete, setPageToDelete] = useState(null);
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
    const [selectedPageIds, setSelectedPageIds] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [bulkAction, setBulkAction] = useState("");
    const [quickEditPageId, setQuickEditPageId] = useState(null);
    const [quickEditData, setQuickEditData] = useState(null);
    const [filterValues, setFilterValues] = useState({
        status: "",
        template: "",
        sort: "",
    });
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: "asc",
    });

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
        if (newFilters.template && newFilters.template.trim() !== "") {
            appliedFilters.template = newFilters.template;
        } else {
            appliedFilters.template = undefined;
        }
        if (newFilters.sort && newFilters.sort.trim() !== "") {
            appliedFilters.sort = newFilters.sort;
        } else {
            appliedFilters.sort = undefined;
        }

        updateFilters(appliedFilters);
    };

    // Handle delete confirmation
    const handleDeleteClick = (page) => {
        setPageToDelete(page);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (pageToDelete) {
            try {
                await deletePage(pageToDelete.id);
                setDeleteDialogOpen(false);
                setPageToDelete(null);
            } catch (error) {
                // Error is already handled in the hook
            }
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setPageToDelete(null);
    };

    // Handle bulk delete
    const handleBulkDeleteClick = () => {
        if (selectedPageIds.length > 0) {
            setBulkDeleteDialogOpen(true);
        }
    };

    const handleBulkDeleteConfirm = async () => {
        if (selectedPageIds.length > 0) {
            try {
                await bulkDeletePages(selectedPageIds);
                setBulkDeleteDialogOpen(false);
                setSelectedPageIds([]);
                setBulkAction("");
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
        setSelectedPageIds(selectedIds);
    };

    // Handle bulk action apply
    const handleBulkActionApply = () => {
        if (selectedPageIds.length === 0) {
            return;
        }

        switch (bulkAction) {
            case "delete":
                setBulkDeleteDialogOpen(true);
                break;
            case "edit":
                console.log("Bulk edit:", selectedPageIds);
                alert(
                    `Bulk edit for ${selectedPageIds.length} pages - Feature coming soon!`
                );
                break;
            default:
                break;
        }
    };

    // Handle quick edit
    const handleQuickEditClick = (page) => {
        setQuickEditPageId(page.id);
        const date = page.publishedAt ? new Date(page.publishedAt) : new Date();
        setQuickEditData({
            title: page.title || "",
            slug: page.slug || "",
            status: page.status || "DRAFT",
            template: page.template || "",
            dateMonth: String(date.getMonth() + 1).padStart(2, "0"),
            dateDay: String(date.getDate()).padStart(2, "0"),
            dateYear: String(date.getFullYear()),
            dateHour: String(date.getHours()).padStart(2, "0"),
            dateMinute: String(date.getMinutes()).padStart(2, "0"),
        });
    };

    // Handle quick edit cancel
    const handleQuickEditCancel = () => {
        setQuickEditPageId(null);
        setQuickEditData(null);
    };

    // Handle quick edit save
    const handleQuickEditSave = async () => {
        if (!quickEditData || !quickEditPageId) return;

        try {
            const { pageService } = await import("../services/pageService");

            // Prepare update data
            const updateData = {
                title: quickEditData.title.trim(),
                slug: quickEditData.slug.trim(),
                status: quickEditData.status,
                template: quickEditData.template.trim(),
            };

            await pageService.update(quickEditPageId, updateData);

            setQuickEditPageId(null);
            setQuickEditData(null);

            // Refresh the pages list
            updateFilters({});
        } catch (error) {
            console.error("Failed to update page:", error);
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

    // Sort pages data
    const sortedPages = React.useMemo(() => {
        if (!Array.isArray(pages) || pages.length === 0) return [];
        if (!sortConfig.key) return pages;

        const sorted = [...pages].sort((a, b) => {
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
                case "template":
                    aValue = a.template?.toLowerCase() || "";
                    bValue = b.template?.toLowerCase() || "";
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
    }, [pages, sortConfig]);

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
        hours = hours ? hours : 12;
        return `${year}/${month}/${day} at ${hours}:${minutes} ${ampm}`;
    };

    // Render Quick Edit inline form
    const renderQuickEditRow = (page) => {
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
                            </div>

                            {/* Right Column */}
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={quickEditData.status}
                                        onChange={(e) =>
                                            setQuickEditData({
                                                ...quickEditData,
                                                status: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:border-gray-700"
                                    >
                                        <option value="DRAFT">Draft</option>
                                        <option value="PUBLISHED">
                                            Published
                                        </option>
                                        <option value="ARCHIVED">
                                            Archived
                                        </option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1">
                                        Template
                                    </label>
                                    <CustomInput
                                        type="text"
                                        value={quickEditData.template}
                                        onChange={(e) =>
                                            setQuickEditData({
                                                ...quickEditData,
                                                template: e.target.value,
                                            })
                                        }
                                        className="text-sm"
                                        placeholder="page-home"
                                    />
                                </div>
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
            width: "50%",
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
            render: (page) => (
                <span
                    className="font-medium text-foreground hover:text-primary cursor-pointer break-words whitespace-break-spaces line-clamp-2"
                    data-tooltip-id="page-tooltip"
                    data-tooltip-content={page.title}
                >
                    {page.title}
                </span>
            ),
        },
        {
            key: "author",
            label: "Author",
            width: "15%",
            sortable: true,
            onSort: () => handleSort("author"),
            renderLabel: () => (
                <button
                    onClick={() => handleSort("author")}
                    className="flex items-center hover:text-primary cursor-pointer uppercase"
                >
                    Author
                    {renderSortIcon("author")}
                </button>
            ),
            render: (page) => (
                <span
                    className="text-sm text-foreground break-words"
                    data-tooltip-id="page-tooltip"
                    data-tooltip-content={
                        page.author?.name ||
                        page.authorName ||
                        page?.author?.firstName +
                            " " +
                            page?.author?.lastName ||
                        "—"
                    }
                >
                    {page.author?.name ||
                        page.authorName ||
                        page?.author?.firstName +
                            " " +
                            page?.author?.lastName ||
                        "—"}
                </span>
            ),
        },
        {
            key: "template",
            label: "Template",
            width: "15%",
            sortable: true,
            onSort: () => handleSort("template"),
            renderLabel: () => (
                <button
                    onClick={() => handleSort("template")}
                    className="flex items-center hover:text-primary cursor-pointer uppercase"
                >
                    Template
                    {renderSortIcon("template")}
                </button>
            ),
            render: (page) => (
                <span className="text-sm text-foreground break-words">
                    {page.template || "—"}
                </span>
            ),
        },
        {
            key: "date",
            label: "Date",
            width: "20%",
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
            render: (page) => {
                const statusText =
                    page.status === "PUBLISHED"
                        ? "Published"
                        : page.status === "DRAFT"
                        ? "Last Modified"
                        : page.status === "ARCHIVED"
                        ? "Archived"
                        : "Unknown";
                const dateText = formatDate(page.publishedAt || page.updatedAt);
                const fullText = `${statusText} - ${dateText}`;
                return (
                    <div
                        className="flex flex-col text-sm"
                        data-tooltip-id="page-tooltip"
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
            render: (page) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/pages/${page.id}/edit`);
                        }}
                        className="p-1.5 hover:bg-accent rounded transition-colors"
                        data-tooltip-id="page-tooltip"
                        data-tooltip-content="Edit"
                        type="button"
                    >
                        <Edit className="h-4 w-4 text-foreground hover:text-primary" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleQuickEditClick(page);
                        }}
                        className="px-2 py-1 text-xs text-primary hover:bg-accent rounded transition-colors"
                        data-tooltip-id="page-tooltip"
                        data-tooltip-content="Quick Edit"
                        type="button"
                    >
                        Quick Edit
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(page);
                        }}
                        className="p-1.5 hover:bg-accent rounded transition-colors"
                        data-tooltip-id="page-tooltip"
                        data-tooltip-content="Delete"
                        type="button"
                    >
                        <Trash2 className="h-4 w-4 text-foreground hover:text-red-600 dark:hover:text-red-400" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(`/pages/${page.slug}`, "_blank");
                        }}
                        className="p-1.5 hover:bg-accent rounded transition-colors"
                        data-tooltip-id="page-tooltip"
                        data-tooltip-content="View"
                        type="button"
                    >
                        <Eye className="h-4 w-4 text-foreground hover:text-primary" />
                    </button>
                </div>
            ),
        },
    ];

    // Check if filters are active
    const hasActiveFilters =
        searchTerm ||
        filterValues.status ||
        filterValues.template ||
        filterValues.sort;

    // Handle clear filters
    const handleClearFilters = () => {
        setSearchTerm("");
        setBulkAction("");
        setFilterValues({
            status: "",
            template: "",
            sort: "",
        });
        updateFilters({
            search: undefined,
            status: undefined,
            template: undefined,
            sort: undefined,
            page: 1,
        });
    };

    // Show error state if there's an error
    if (error && !loading) {
        return (
            <PageContainer>
                <PageHeader
                    title="Pages"
                    description=""
                    action={
                        <CustomButton
                            onClick={() => router.push("/dashboard/pages/new")}
                            className="flex items-center gap-2"
                            size="sm"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">Add Page</span>
                            <span className="sm:hidden">Add</span>
                        </CustomButton>
                    }
                />
                <ErrorState
                    title="Failed to load pages"
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
    const allPagesCount = pages.length;
    const publishedCount = pages.filter((p) => p.status === "PUBLISHED").length;
    const draftCount = pages.filter((p) => p.status === "DRAFT").length;
    const archivedCount = pages.filter((p) => p.status === "ARCHIVED").length;

    return (
        <PageContainer>
            {/* <LoadingState
                message="Loading pages..."
                loading={loading}
                fullScreen={true}
            /> */}
            <PageHeader
                title="Pages"
                description=""
                action={
                    <CustomButton
                        onClick={() => router.push("/dashboard/pages/new")}
                        className="flex items-center gap-2"
                        size="sm"
                    >
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Add Page</span>
                        <span className="sm:hidden">Add</span>
                    </CustomButton>
                }
            />

            {/* Status Tabs and Search Bar */}
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
                        onClick={() => handleFilterChange("status", "ARCHIVED")}
                        className={`px-2 py-1 ${
                            filterValues.status === "ARCHIVED"
                                ? "text-primary font-medium"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Archived ({archivedCount})
                    </button>
                </div>

                {/* Search and Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 sm:max-w-md lg:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <CustomInput
                            type="text"
                            placeholder="Search pages..."
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
                    </select>

                    <CustomButton
                        variant="outline"
                        size="sm"
                        onClick={handleBulkActionApply}
                        disabled={!bulkAction || selectedPageIds.length === 0}
                        className="me-3"
                    >
                        Apply
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

            {/* Item Count */}
            {!loading && pagination.total > 0 && (
                <div className="mb-2 flex justify-end">
                    <span className="text-sm text-muted-foreground">
                        {pagination.total}{" "}
                        {pagination.total === 1 ? "item" : "items"}
                    </span>
                </div>
            )}

            {/* Pages Table */}
            <DataTable
                columns={columns}
                data={sortedPages}
                loading={loading}
                selectable={true}
                selectedRows={selectedPageIds}
                onSelectionChange={handleSelectionChange}
                getRowId={(row) => row.id}
                renderCustomRow={(row, rowId) => {
                    if (quickEditPageId === rowId) {
                        return renderQuickEditRow(row);
                    }
                    return null;
                }}
                shouldHideRow={(row, rowId) => quickEditPageId === rowId}
                emptyState={{
                    icon: FileText,
                    title: "No pages found",
                    description: hasActiveFilters
                        ? "No pages match your current filters. Try adjusting your search or filter criteria."
                        : "Get started by creating your first page.",
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
                            onClick={() => router.push("/dashboard/pages/new")}
                            className="flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add Your First Page
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
                    resourceName="pages"
                />
            )}

            {/* Delete Confirmation Dialog */}
            <CustomConfirmationDialog
                isOpen={deleteDialogOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Delete Page"
                description={`Are you sure you want to delete "${pageToDelete?.title}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />

            {/* Bulk Delete Confirmation Dialog */}
            <CustomConfirmationDialog
                isOpen={bulkDeleteDialogOpen}
                onClose={handleBulkDeleteCancel}
                onConfirm={handleBulkDeleteConfirm}
                title="Delete Pages"
                description={`Are you sure you want to delete ${
                    selectedPageIds.length
                } page${
                    selectedPageIds.length > 1 ? "s" : ""
                }? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />

            {/* Tooltip */}
            <Tooltip
                id="page-tooltip"
                place="top"
                className="z-50 !bg-[#f1f2f4] !text-[#65758b] dark:!bg-gray-700 dark:!text-white !opacity-100 !max-w-xs !whitespace-normal !break-words "
            />
        </PageContainer>
    );
}
