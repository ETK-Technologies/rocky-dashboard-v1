"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { toast } from "react-toastify";
import {
    Search,
    Plus,
    Folder,
    ArrowUp,
    ArrowDown,
    Edit,
    Trash2,
    Eye,
} from "lucide-react";
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
import { useBlogCategories } from "../hooks/useBlogCategories";
import { blogCategoryService } from "../services/blogCategoryService";
import { LoadingState } from "@/components/ui/LoadingState";

// Default category slug that cannot be deleted
const DEFAULT_CATEGORY_SLUG = "lifestyle";

export default function BlogCategories() {
    const router = useRouter();
    const {
        categories,
        loading,
        pagination,
        deleteCategory,
        bulkDeleteCategories,
        updateFilters,
    } = useBlogCategories();
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
    const [bulkAction, setBulkAction] = useState("");
    const [quickEditCategoryId, setQuickEditCategoryId] = useState(null);
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

    // Check if category is default (cannot be deleted)
    const isDefaultCategory = (category) => {
        return category.slug === DEFAULT_CATEGORY_SLUG || category.isDefault;
    };

    // Handle delete confirmation
    const handleDeleteClick = (category) => {
        if (isDefaultCategory(category)) {
            return; // Don't allow deleting default category
        }
        setCategoryToDelete(category);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (categoryToDelete) {
            try {
                await deleteCategory(categoryToDelete.id);
                setDeleteDialogOpen(false);
                setCategoryToDelete(null);
            } catch (error) {
                // Error is already handled in the hook
            }
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setCategoryToDelete(null);
    };

    // Handle bulk actions
    const handleBulkActionApply = () => {
        if (selectedCategoryIds.length === 0) {
            return;
        }

        // Filter out default category from selection
        const deletableIds = selectedCategoryIds.filter((id) => {
            const category = categories.find((c) => c.id === id);
            return category && !isDefaultCategory(category);
        });

        if (deletableIds.length === 0) {
            return;
        }

        switch (bulkAction) {
            case "delete":
                setBulkDeleteDialogOpen(true);
                break;
            case "captureCharge":
                // Handle capture charge action
                handleCaptureCharge(deletableIds);
                break;
            default:
                break;
        }
    };

    const handleBulkDeleteConfirm = async () => {
        // Filter out default category from selection
        const deletableIds = selectedCategoryIds.filter((id) => {
            const category = categories.find((c) => c.id === id);
            return category && !isDefaultCategory(category);
        });

        if (deletableIds.length > 0) {
            try {
                await bulkDeleteCategories(deletableIds);
                setBulkDeleteDialogOpen(false);
                setSelectedCategoryIds([]);
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
    const handleCaptureCharge = async (categoryIds) => {
        if (categoryIds.length === 0) {
            return;
        }

        try {
            // In a real app, this would call an API to capture charges
            // For now, we'll just show a success message
            toast.success(
                `Capture charge initiated for ${categoryIds.length} categor${
                    categoryIds.length !== 1 ? "ies" : "y"
                }`
            );
            setBulkAction("");
            setSelectedCategoryIds([]);
        } catch (error) {
            toast.error("Failed to capture charge");
            console.error("Error capturing charge:", error);
        }
    };

    // Handle quick edit
    const handleQuickEditClick = (category) => {
        setQuickEditCategoryId(category.id);
        setQuickEditData({
            name: category.name || "",
            slug: category.slug || "",
        });
    };

    // Handle quick edit cancel
    const handleQuickEditCancel = () => {
        setQuickEditCategoryId(null);
        setQuickEditData(null);
    };

    // Handle quick edit save
    const handleQuickEditSave = async () => {
        if (!quickEditCategoryId || !quickEditData) return;

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
            // Call API to update category
            await blogCategoryService.update(quickEditCategoryId, {
                name: quickEditData.name.trim(),
                slug: quickEditData.slug.trim(),
            });

            toast.success("Category updated successfully");
            setQuickEditCategoryId(null);
            setQuickEditData(null);

            // Refresh categories to show updated data
            updateFilters({});
        } catch (error) {
            const errorMessage =
                error.message ||
                error.data?.message ||
                "Failed to update category";
            toast.error(errorMessage);
            console.error("Error updating category:", error);
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

    // Sort categories data
    const sortedCategories = React.useMemo(() => {
        if (!Array.isArray(categories) || categories.length === 0) return [];
        if (!sortConfig.key) return categories;

        const sorted = [...categories].sort((a, b) => {
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
    }, [categories, sortConfig]);

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
            width: "35%",
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
            render: (category) => (
                <span className="font-medium text-foreground">
                    {category.name}
                </span>
            ),
        },
        {
            key: "description",
            label: "Description",
            width: "35%",
            render: (category) => (
                <span className="text-sm text-muted-foreground">
                    {category.description || "—"}
                </span>
            ),
        },
        {
            key: "slug",
            label: "Slug",
            width: "20%",
            render: (category) => (
                <code
                    className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded block truncate"
                    data-tooltip-id="category-tooltip"
                    data-tooltip-content={category.slug}
                >
                    {category.slug}
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
            render: (category) => (
                <span className="text-sm text-foreground">
                    {category._count?.posts ??
                        category.count ??
                        category.postCount ??
                        0}
                </span>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            width: "20%",
            render: (category) => {
                const isDefault = isDefaultCategory(category);
                return (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push(
                                    `/dashboard/blogs/categories/${category.id}/edit`
                                );
                            }}
                            className="p-1.5 hover:bg-accent rounded transition-colors"
                            data-tooltip-id="category-tooltip"
                            data-tooltip-content="Edit"
                            type="button"
                        >
                            <Edit className="h-4 w-4 text-foreground hover:text-primary" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleQuickEditClick(category);
                            }}
                            className="px-2 py-1 text-xs text-primary hover:bg-accent rounded transition-colors"
                            data-tooltip-id="category-tooltip"
                            data-tooltip-content="Quick Edit"
                            type="button"
                        >
                            Quick Edit
                        </button>
                        {!isDefault && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(category);
                                }}
                                className="p-1.5 hover:bg-accent rounded transition-colors"
                                data-tooltip-id="category-tooltip"
                                data-tooltip-content="Delete"
                                type="button"
                            >
                                <Trash2 className="h-4 w-4 text-foreground hover:text-red-600 dark:hover:text-red-400" />
                            </button>
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(
                                    `/categories/${category.slug}`,
                                    "_blank"
                                );
                            }}
                            className="p-1.5 hover:bg-accent rounded transition-colors"
                            data-tooltip-id="category-tooltip"
                            data-tooltip-content="View"
                            type="button"
                        >
                            <Eye className="h-4 w-4 text-foreground hover:text-primary" />
                        </button>
                    </div>
                );
            },
        },
    ];

    // Get row ID for selection
    const getRowId = (category) => category.id;

    // Check if row should be hidden (default category uses custom row, quick edit row replaces normal row)
    const shouldHideRow = (category) => {
        return (
            isDefaultCategory(category) || quickEditCategoryId === category.id
        );
    };

    // Handle selection change - filter out default category
    const handleSelectionChange = (selectedIds) => {
        const validIds = selectedIds.filter((id) => {
            const category = categories.find((c) => c.id === id);
            return category && !isDefaultCategory(category);
        });
        setSelectedCategoryIds(validIds);
    };

    // Render custom row (quick edit or default category)
    const renderCustomRow = (category) => {
        // Check for quick edit first
        if (quickEditCategoryId === category.id && quickEditData) {
            const rowId = getRowId(category);
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
                                    {quickEditLoading
                                        ? "Updating..."
                                        : "Update"}
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
        }

        // Check for default category
        if (!isDefaultCategory(category)) {
            return null; // Use default rendering for non-default categories
        }

        // Custom row for default category - with disabled checkbox
        const rowId = getRowId(category);
        return (
            <tr key={rowId} className="transition-colors hover:bg-accent">
                {/* Checkbox column for default category - disabled */}
                <td
                    className="px-3 sm:px-4 md:px-6 py-4 whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                >
                    <input
                        type="checkbox"
                        checked={false}
                        disabled={true}
                        className="w-4 h-4 text-primary bg-background border-input rounded focus:ring-primary focus:ring-2 cursor-not-allowed opacity-50"
                        onClick={(e) => e.stopPropagation()}
                    />
                </td>
                {columns.map((column) => (
                    <td
                        key={column.key}
                        style={{ width: column.width }}
                        className="px-3 sm:px-4 md:px-6 py-4"
                    >
                        {column.render(category)}
                    </td>
                ))}
            </tr>
        );
    };

    return (
        <PageContainer>
            {/* {loading && (
                <LoadingState
                    message="Loading categories..."
                    loading={loading}
                    fullScreen={true}
                />
            )} */}
            <PageHeader
                title="Categories"
                description=""
                action={
                    <CustomButton
                        onClick={() =>
                            router.push("/dashboard/blogs/categories/new")
                        }
                        className="flex items-center gap-2"
                        size="sm"
                    >
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Add Category</span>
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
                        disabled={
                            !bulkAction || selectedCategoryIds.length === 0
                        }
                        variant="outline"
                        size="sm"
                    >
                        Apply
                    </CustomButton>
                    {selectedCategoryIds.length > 0 && (
                        <span className="text-sm text-muted-foreground">
                            {selectedCategoryIds.length} item
                            {selectedCategoryIds.length !== 1 ? "s" : ""}{" "}
                            selected
                        </span>
                    )}
                </div>

                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <CustomInput
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Categories Table */}
            <DataTable
                columns={columns}
                data={sortedCategories}
                loading={loading}
                selectable={true}
                selectedRows={selectedCategoryIds}
                onSelectionChange={handleSelectionChange}
                getRowId={getRowId}
                shouldHideRow={shouldHideRow}
                renderCustomRow={renderCustomRow}
                emptyState={{
                    icon: Folder,
                    title: "No categories found",
                    description: searchTerm
                        ? "Try adjusting your search terms"
                        : "Get started by creating your first category",
                    action: !searchTerm && (
                        <CustomButton
                            onClick={() =>
                                router.push("/dashboard/blogs/categories/new")
                            }
                            className="flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add Category
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
                        resourceName="categories"
                    />
                </div>
            )}

            {/* Info Text */}
            <div className="mt-6 text-sm text-muted-foreground space-y-2">
                <p>
                    Deleting a category does not delete the posts in that
                    category. Instead, posts that were only assigned to the
                    deleted category are set to the default category Lifestyle.
                    The default category cannot be deleted.
                </p>
                <p>
                    Categories can be selectively converted to tags using the{" "}
                    <a
                        href="#"
                        className="text-primary hover:underline"
                        onClick={(e) => {
                            e.preventDefault();
                            // TODO: Implement category to tag converter
                            alert("Category to tag converter - Coming soon!");
                        }}
                    >
                        category to tag converter
                    </a>
                    .
                </p>
            </div>

            {/* Delete Confirmation Dialog */}
            <CustomConfirmationDialog
                isOpen={deleteDialogOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Delete Category"
                description={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone. Posts in this category will be moved to the default category.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />

            {/* Bulk Delete Confirmation Dialog */}
            <CustomConfirmationDialog
                isOpen={bulkDeleteDialogOpen}
                onClose={handleBulkDeleteCancel}
                onConfirm={handleBulkDeleteConfirm}
                title="Delete Categories"
                description={`Are you sure you want to delete ${
                    selectedCategoryIds.length
                } categor${
                    selectedCategoryIds.length !== 1 ? "ies" : "y"
                }? This action cannot be undone. Posts in these categories will be moved to the default category.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />

            {/* Tooltip */}
            <Tooltip
                id="category-tooltip"
                place="top"
                className="z-50 !bg-[#f1f2f4] !text-[#65758b] dark:!bg-gray-700 dark:!text-white !opacity-100 !max-w-xs !whitespace-normal !break-words "
            />
        </PageContainer>
    );
}
