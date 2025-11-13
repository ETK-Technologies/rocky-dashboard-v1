"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { toast } from "react-toastify";
import { Search, Plus, Tag, ArrowUp, ArrowDown } from "lucide-react";
import {
    CustomButton,
    PageContainer,
    PageHeader,
    DataTable,
    CustomInput,
    CustomConfirmationDialog,
    Pagination,
    CustomTextarea,
} from "@/components/ui";
import { useBlogTags } from "../hooks/useBlogTags";
import { blogTagService } from "../services/blogTagService";

export default function BlogTags() {
    const router = useRouter();
    const {
        tags,
        loading,
        pagination,
        deleteTag,
        bulkDeleteTags,
        updateFilters,
    } = useBlogTags();
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
    const [tagToDelete, setTagToDelete] = useState(null);
    const [selectedTagIds, setSelectedTagIds] = useState([]);
    const [bulkAction, setBulkAction] = useState("");
    const [quickEditTagId, setQuickEditTagId] = useState(null);
    const [quickEditData, setQuickEditData] = useState(null);
    const [quickEditLoading, setQuickEditLoading] = useState(false);
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: "asc",
    });

    // Handle search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            updateFilters({
                search: searchTerm || undefined,
                page: 1, // Reset to first page on search
            });
        }, 300);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    // Handle page change
    const handlePageChange = (page) => {
        updateFilters({ page });
    };

    // Handle delete confirmation
    const handleDeleteClick = (tag) => {
        setTagToDelete(tag);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (tagToDelete) {
            try {
                await deleteTag(tagToDelete.id);
                setDeleteDialogOpen(false);
                setTagToDelete(null);
            } catch (error) {
                // Error is already handled in the hook
            }
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setTagToDelete(null);
    };

    // Handle bulk actions
    const handleBulkActionApply = () => {
        if (selectedTagIds.length === 0) {
            return;
        }

        switch (bulkAction) {
            case "delete":
                setBulkDeleteDialogOpen(true);
                break;
            case "captureCharge":
                // Handle capture charge action
                handleCaptureCharge(selectedTagIds);
                break;
            default:
                break;
        }
    };

    const handleBulkDeleteConfirm = async () => {
        if (selectedTagIds.length > 0) {
            try {
                await bulkDeleteTags(selectedTagIds);
                setBulkDeleteDialogOpen(false);
                setSelectedTagIds([]);
                setBulkAction("");
            } catch (error) {
                // Error is already handled in the hook
            }
        }
    };

    const handleBulkDeleteCancel = () => {
        setBulkDeleteDialogOpen(false);
    };

    // Handle capture charge
    const handleCaptureCharge = async (tagIds) => {
        if (tagIds.length === 0) {
            return;
        }

        try {
            // In a real app, this would call an API to capture charges
            // For now, we'll just show a success message
            toast.success(
                `Capture charge initiated for ${tagIds.length} tag${
                    tagIds.length !== 1 ? "s" : ""
                }`
            );
            setBulkAction("");
            setSelectedTagIds([]);
        } catch (error) {
            toast.error("Failed to capture charge");
            console.error("Error capturing charge:", error);
        }
    };

    // Handle quick edit
    const handleQuickEditClick = (tag) => {
        setQuickEditTagId(tag.id);
        setQuickEditData({
            name: tag.name || "",
            slug: tag.slug || "",
        });
    };

    // Handle quick edit cancel
    const handleQuickEditCancel = () => {
        setQuickEditTagId(null);
        setQuickEditData(null);
    };

    // Handle quick edit save
    const handleQuickEditSave = async () => {
        if (!quickEditTagId || !quickEditData) return;

        // Validate input
        if (!quickEditData.name.trim()) {
            toast.error("Name is required");
            return;
        }

        if (!quickEditData.slug.trim()) {
            toast.error("Slug is required");
            return;
        }

        if (!/^[a-z0-9-]+$/.test(quickEditData.slug)) {
            toast.error(
                "Slug can only contain lowercase letters, numbers, and hyphens"
            );
            return;
        }

        setQuickEditLoading(true);

        try {
            // Call API to update tag
            await blogTagService.update(quickEditTagId, {
                name: quickEditData.name.trim(),
                slug: quickEditData.slug.trim(),
            });

            toast.success("Tag updated successfully");
            setQuickEditTagId(null);
            setQuickEditData(null);

            // Refresh tags to show updated data
            updateFilters({});
        } catch (error) {
            const errorMessage =
                error.message || error.data?.message || "Failed to update tag";
            toast.error(errorMessage);
            console.error("Error updating tag:", error);
        } finally {
            setQuickEditLoading(false);
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

    // Sort tags data
    const sortedTags = React.useMemo(() => {
        if (!Array.isArray(tags) || tags.length === 0) return [];
        if (!sortConfig.key) return tags;

        const sorted = [...tags].sort((a, b) => {
            let aValue, bValue;

            switch (sortConfig.key) {
                case "name":
                    aValue = a.name?.toLowerCase() || "";
                    bValue = b.name?.toLowerCase() || "";
                    break;
                case "count":
                    aValue = a._count?.posts || a.count || a.postCount || 0;
                    bValue = b._count?.posts || b.count || b.postCount || 0;
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
    }, [tags, sortConfig]);

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
            key: "name",
            label: "Name",
            width: "40%",
            sortable: true,
            onSort: () => handleSort("name"),
            renderLabel: () => (
                <button
                    onClick={() => handleSort("name")}
                    className="flex items-center hover:text-primary cursor-pointer uppercase"
                >
                    Name
                    {renderSortIcon("name")}
                </button>
            ),
            render: (tag) => {
                return (
                    <div className="flex flex-col py-1 group">
                        <div className="">
                            <span className="font-medium text-foreground">
                                {tag.name}
                            </span>
                        </div>
                        {/* Row Actions - Visible on hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 mt-1 flex-wrap">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(
                                        `/dashboard/blogs/tags/${tag.id}/edit`
                                    );
                                }}
                                className="text-xs text-primary hover:underline"
                            >
                                Edit
                            </button>
                            <span className="text-muted-foreground text-xs">
                                |
                            </span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuickEditClick(tag);
                                }}
                                className="text-xs text-primary hover:underline"
                            >
                                Quick Edit
                            </button>
                            <span className="text-muted-foreground text-xs">
                                |
                            </span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(tag);
                                }}
                                className="text-xs text-red-600 hover:underline dark:text-red-400"
                            >
                                Delete
                            </button>
                            <span className="text-muted-foreground text-xs">
                                |
                            </span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(`/tags/${tag.slug}`, "_blank");
                                }}
                                className="text-xs text-primary hover:underline"
                            >
                                View
                            </button>
                        </div>
                    </div>
                );
            },
        },
        {
            key: "description",
            label: "Description",
            width: "30%",
            render: (tag) => (
                <span className="text-sm text-muted-foreground">
                    {tag.description || "—"}
                </span>
            ),
        },
        {
            key: "slug",
            label: "Slug",
            width: "20%",
            render: (tag) => (
                <code
                    className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded block truncate"
                    data-tooltip-id="tag-tooltip"
                    data-tooltip-content={tag.slug}
                >
                    {tag.slug}
                </code>
            ),
        },
        {
            key: "count",
            label: "Count",
            width: "10%",
            sortable: true,
            onSort: () => handleSort("count"),
            renderLabel: () => (
                <button
                    onClick={() => handleSort("count")}
                    className="flex items-center hover:text-primary cursor-pointer uppercase"
                >
                    Count
                    {renderSortIcon("count")}
                </button>
            ),
            render: (tag) => (
                <span className="text-sm text-foreground">
                    {tag._count?.posts ?? tag.count ?? tag.postCount ?? 0}
                </span>
            ),
        },
    ];

    // Get row ID for selection
    const getRowId = (tag) => tag.id;

    // Check if row should be hidden (quick edit row replaces normal row)
    const shouldHideRow = (tag) => {
        return quickEditTagId === tag.id;
    };

    // Handle selection change
    const handleSelectionChange = (selectedIds) => {
        setSelectedTagIds(selectedIds);
    };

    // Render quick edit row
    const renderQuickEditRow = (tag) => {
        if (quickEditTagId !== tag.id || !quickEditData) {
            return null;
        }

        const rowId = getRowId(tag);
        return (
            <tr key={`quick-edit-${rowId}`}>
                <td
                    colSpan={columns.length + 1}
                    className="px-3 sm:px-4 md:px-6 py-4 bg-accent/50"
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium mb-1">
                                    Name
                                </label>
                                <CustomInput
                                    value={quickEditData.name}
                                    onChange={(e) =>
                                        setQuickEditData({
                                            ...quickEditData,
                                            name: e.target.value,
                                        })
                                    }
                                    disabled={quickEditLoading}
                                    className="text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1">
                                    Slug
                                </label>
                                <CustomInput
                                    value={quickEditData.slug}
                                    onChange={(e) =>
                                        setQuickEditData({
                                            ...quickEditData,
                                            slug: e.target.value,
                                        })
                                    }
                                    disabled={quickEditLoading}
                                    className="text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 pt-2 border-t border-border">
                            <CustomButton
                                onClick={handleQuickEditSave}
                                size="sm"
                                disabled={quickEditLoading}
                                className="bg-primary text-primary-foreground"
                            >
                                {quickEditLoading ? "Updating..." : "Update"}
                            </CustomButton>
                            <CustomButton
                                onClick={handleQuickEditCancel}
                                variant="outline"
                                size="sm"
                                disabled={quickEditLoading}
                            >
                                Cancel
                            </CustomButton>
                        </div>
                    </div>
                </td>
            </tr>
        );
    };

    // Render custom row (quick edit)
    const renderCustomRow = (tag) => {
        // Check for quick edit
        if (quickEditTagId === tag.id && quickEditData) {
            return renderQuickEditRow(tag);
        }

        return null; // Use default rendering
    };

    return (
        <PageContainer>
            <PageHeader
                title="Tags"
                description=""
                action={
                    <CustomButton
                        onClick={() => router.push("/dashboard/blogs/tags/new")}
                        className="flex items-center gap-2"
                        size="sm"
                    >
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Add Tag</span>
                        <span className="sm:hidden">Add</span>
                    </CustomButton>
                }
            />

            {/* Bulk Actions and Search */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                    <select
                        value={bulkAction}
                        onChange={(e) => setBulkAction(e.target.value)}
                        className="px-3 py-1.5 text-sm bg-background border border-input rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:border-gray-700 min-w-[150px]"
                    >
                        <option value="">Bulk actions</option>
                        <option value="delete">Delete</option>
                        <option value="captureCharge">Capture Charge</option>
                    </select>
                    <CustomButton
                        onClick={handleBulkActionApply}
                        disabled={!bulkAction || selectedTagIds.length === 0}
                        variant="outline"
                        size="sm"
                    >
                        Apply
                    </CustomButton>
                    {selectedTagIds.length > 0 && (
                        <span className="text-sm text-muted-foreground">
                            {selectedTagIds.length} item
                            {selectedTagIds.length !== 1 ? "s" : ""} selected
                        </span>
                    )}
                </div>

                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <CustomInput
                        type="text"
                        placeholder="Search tags..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Tags Table */}
            <DataTable
                columns={columns}
                data={sortedTags}
                loading={loading}
                selectable={true}
                selectedRows={selectedTagIds}
                onSelectionChange={handleSelectionChange}
                getRowId={getRowId}
                shouldHideRow={shouldHideRow}
                renderCustomRow={renderCustomRow}
                emptyState={{
                    icon: Tag,
                    title: "No tags found",
                    description: searchTerm
                        ? "Try adjusting your search terms"
                        : "Get started by creating your first tag",
                    action: !searchTerm && (
                        <CustomButton
                            onClick={() =>
                                router.push("/dashboard/blogs/tags/new")
                            }
                            className="flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add Tag
                        </CustomButton>
                    ),
                }}
            />

            {/* Pagination */}
            {pagination && pagination.total > 0 && (
                <div className="mt-6">
                    <Pagination
                        currentPage={pagination.page || 1}
                        totalPages={pagination.totalPages || 1}
                        onPageChange={handlePageChange}
                        total={pagination.total || 0}
                        limit={pagination.limit || 10}
                        resourceName="tags"
                    />
                </div>
            )}

            {/* Info Text */}
            <div className="mt-6 text-sm text-muted-foreground space-y-2">
                <p>
                    You can assign keywords to your posts using tags. Unlike
                    categories, tags don&apos;t have a hierarchy, meaning
                    there&apos;s no relationship between tags.
                </p>
                <p>
                    Tags can be selectively converted to categories using the{" "}
                    <a
                        href="#"
                        className="text-primary hover:underline"
                        onClick={(e) => {
                            e.preventDefault();
                            // TODO: Implement tag to category converter
                            alert("Tag to category converter - Coming soon!");
                        }}
                    >
                        tag to category converter
                    </a>
                    .
                </p>
            </div>

            {/* Delete Confirmation Dialog */}
            <CustomConfirmationDialog
                isOpen={deleteDialogOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Delete Tag"
                description={`Are you sure you want to delete "${tagToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />

            {/* Bulk Delete Confirmation Dialog */}
            <CustomConfirmationDialog
                isOpen={bulkDeleteDialogOpen}
                onClose={handleBulkDeleteCancel}
                onConfirm={handleBulkDeleteConfirm}
                title="Delete Tags"
                description={`Are you sure you want to delete ${
                    selectedTagIds.length
                } tag${
                    selectedTagIds.length !== 1 ? "s" : ""
                }? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />

            {/* Tooltip */}
            <Tooltip
                id="tag-tooltip"
                place="top"
                className="z-50 !bg-[#f1f2f4] !text-[#65758b] dark:!bg-gray-700 dark:!text-white !opacity-100 !max-w-xs !whitespace-normal !break-words "
            />
        </PageContainer>
    );
}
