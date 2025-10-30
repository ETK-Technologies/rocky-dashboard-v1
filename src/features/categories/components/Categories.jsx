"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import {
  Edit,
  Trash2,
  Search,
  Plus,
  Package,
  MoreVertical,
} from "lucide-react";
import {
  CustomButton,
  PageContainer,
  PageHeader,
  DataTable,
  CustomInput,
  IconButton,
  CustomBadge,
  CustomConfirmationDialog,
} from "@/components/ui";
import { useCategories } from "../hooks/useCategories";

export default function Categories() {
  const router = useRouter();
  const { categories, loading, deleteCategory } = useCategories();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories;

    const term = searchTerm.toLowerCase();
    return categories.filter(
      (category) =>
        category.name?.toLowerCase().includes(term) ||
        category.slug?.toLowerCase().includes(term)
    );
  }, [categories, searchTerm]);

  // Handle delete confirmation
  const handleDeleteClick = (category) => {
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

  // Table columns
  const columns = [
    {
      key: "image",
      label: "Image",
      width: "80px",
      render: (category) => (
        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
          {category.image ? (
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="h-6 w-6 text-gray-400" />
          )}
        </div>
      ),
    },
    {
      key: "name",
      label: "Name",
      width: "250px",
      truncate: true,
      render: (category) => (
        <div className="flex flex-col">
          <div
            className="font-medium text-foreground truncate"
            data-tooltip-id="category-tooltip"
            data-tooltip-content={category.name}
          >
            {category.name}
          </div>
          {category.description && (
            <div
              className="text-sm text-muted-foreground truncate mt-0.5"
              data-tooltip-id="category-tooltip"
              data-tooltip-content={category.description}
            >
              {category.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "slug",
      label: "Slug",
      width: "180px",
      truncate: true,
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
      key: "parent",
      label: "Parent",
      width: "150px",
      truncate: true,
      render: (category) => {
        if (!category.parentId) {
          return <span className="text-sm text-muted-foreground">-</span>;
        }
        const parent = categories.find((c) => c.id === category.parentId);
        const parentName = parent?.name || `ID: ${category.parentId}`;
        return (
          <span
            className="text-sm text-foreground block truncate"
            data-tooltip-id="category-tooltip"
            data-tooltip-content={parentName}
          >
            {parentName}
          </span>
        );
      },
    },
    {
      key: "isActive",
      label: "Status",
      width: "120px",
      render: (category) => (
        <CustomBadge variant={category.isActive ? "success" : "secondary"}>
          {category.isActive ? "Active" : "Inactive"}
        </CustomBadge>
      ),
    },
    {
      key: "sortOrder",
      label: "Sort Order",
      width: "120px",
      render: (category) => (
        <span className="text-sm text-muted-foreground">
          {category.sortOrder ?? "-"}
        </span>
      ),
    },
  ];

  // Render action buttons for each row
  const renderActions = (category) => (
    <div
      className="flex items-center gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        data-tooltip-id="category-tooltip"
        data-tooltip-content="Edit category"
      >
        <IconButton
          icon={Edit}
          label="Edit"
          variant="ghost"
          size="sm"
          onClick={() =>
            router.push(`/dashboard/categories/${category.id}/edit`)
          }
        />
      </div>
      <div
        data-tooltip-id="category-tooltip"
        data-tooltip-content="Delete category"
      >
        <IconButton
          icon={Trash2}
          label="Delete"
          variant="ghost"
          size="sm"
          onClick={() => handleDeleteClick(category)}
          className="text-red-600 hover:text-red-700 dark:text-red-400"
        />
      </div>
    </div>
  );

  return (
    <PageContainer>
      <PageHeader
        title="Categories"
        description="Manage your product categories"
        action={
          <CustomButton
            onClick={() => router.push("/dashboard/categories/new")}
            className="flex items-center gap-2"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Category</span>
            <span className="sm:hidden">Add</span>
          </CustomButton>
        }
      />

      {/* Search Bar */}
      <div className="mb-6">
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
        data={filteredCategories}
        renderActions={renderActions}
        loading={loading}
        emptyState={{
          icon: Package,
          title: "No categories found",
          description: searchTerm
            ? "Try adjusting your search terms"
            : "Get started by creating your first category",
          action: !searchTerm && (
            <CustomButton
              onClick={() => router.push("/dashboard/categories/new")}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </CustomButton>
          ),
        }}
      />

      {/* Delete Confirmation Dialog */}
      <CustomConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        description={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Tooltip */}
      <Tooltip
        id="category-tooltip"
        place="top"
        className="z-50 !bg-[#f1f2f4] !text-[#65758b] max-w-[300px] dark:!bg-gray-700 dark:!text-white !opacity-100 !max-w-xs !whitespace-normal !break-words "
      />
    </PageContainer>
  );
}
