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
  Filter,
  Upload,
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
  ErrorState,
  Pagination,
} from "@/components/ui";
import { useProducts } from "../hooks/useProducts";
import { useCategories } from "@/features/categories";
import { ProductImportModal } from "./ProductImportModal";

export default function Products() {
  const router = useRouter();
  const {
    products,
    loading,
    error,
    deleteProduct,
    bulkDeleteProducts,
    pagination,
    updateFilters,
  } = useProducts();
  const { categories } = useCategories();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [filterValues, setFilterValues] = useState({
    type: "",
    status: "",
    categoryIds: "",
    minPrice: "",
    maxPrice: "",
    inStock: "",
    sort: "",
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
    if (newFilters.type && newFilters.type.trim() !== "") {
      appliedFilters.type = newFilters.type;
    } else {
      // Explicitly remove type filter when "All Types" is selected
      appliedFilters.type = undefined;
    }
    if (newFilters.status && newFilters.status.trim() !== "") {
      appliedFilters.status = newFilters.status;
    } else {
      appliedFilters.status = undefined;
    }
    if (newFilters.categoryIds && newFilters.categoryIds.trim() !== "") {
      appliedFilters.categoryIds = newFilters.categoryIds;
    } else {
      appliedFilters.categoryIds = undefined;
    }
    if (newFilters.minPrice && newFilters.minPrice.trim() !== "") {
      appliedFilters.minPrice = parseFloat(newFilters.minPrice);
    } else {
      appliedFilters.minPrice = undefined;
    }
    if (newFilters.maxPrice && newFilters.maxPrice.trim() !== "") {
      appliedFilters.maxPrice = parseFloat(newFilters.maxPrice);
    } else {
      appliedFilters.maxPrice = undefined;
    }
    if (newFilters.inStock !== "" && newFilters.inStock !== null) {
      appliedFilters.inStock = newFilters.inStock === "true";
    } else {
      appliedFilters.inStock = undefined;
    }
    if (newFilters.sort && newFilters.sort.trim() !== "") {
      appliedFilters.sort = newFilters.sort;
    } else {
      appliedFilters.sort = undefined;
    }

    updateFilters(appliedFilters);
  };

  // Handle delete confirmation
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (productToDelete) {
      try {
        await deleteProduct(productToDelete.id);
        setDeleteDialogOpen(false);
        setProductToDelete(null);
      } catch (error) {
        // Error is already handled in the hook
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  // Handle bulk delete
  const handleBulkDeleteClick = () => {
    if (selectedProductIds.length > 0) {
      setBulkDeleteDialogOpen(true);
    }
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedProductIds.length > 0) {
      try {
        await bulkDeleteProducts(selectedProductIds);
        setBulkDeleteDialogOpen(false);
        setSelectedProductIds([]);
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
    setSelectedProductIds(selectedIds);
  };

  // Get product type badge variant
  const getTypeBadgeVariant = (type) => {
    switch (type) {
      case "SIMPLE":
        return "default";
      case "VARIABLE":
        return "info";
      case "SUBSCRIPTION":
        return "warning";
      case "VARIABLE_SUBSCRIPTION":
        return "success";
      default:
        return "default";
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "PUBLISHED":
        return "success";
      case "DRAFT":
        return "warning";
      case "ARCHIVED":
        return "secondary";
      default:
        return "default";
    }
  };

  // Format price
  const formatPrice = (price) => {
    if (!price) return "-";
    return `$${parseFloat(price).toFixed(2)}`;
  };

  // Table columns
  const columns = [
    {
      key: "image",
      label: "Image",
      width: "80px",
      render: (product) => {
        const firstImage = product.images?.[0];
        return (
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
            {firstImage?.url ? (
              <img
                src={firstImage.url}
                alt={firstImage.altText || product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package className="h-6 w-6 text-gray-400" />
            )}
          </div>
        );
      },
    },
    {
      key: "name",
      label: "Product",
      width: "300px",
      truncate: true,
      render: (product) => (
        <div className="flex flex-col">
          <div
            className="font-medium text-foreground truncate"
            data-tooltip-id="product-tooltip"
            data-tooltip-content={product.name}
          >
            {product.name}
          </div>
          {product.description && (
            <div
              className="text-sm text-muted-foreground truncate mt-0.5"
              data-tooltip-id="product-tooltip"
              data-tooltip-content={product.description}
            >
              {product.description}
            </div>
          )}
          {product.sku && (
            <code className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded mt-1 inline-block w-fit">
              {product.sku}
            </code>
          )}
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      width: "150px",
      render: (product) => (
        <CustomBadge variant={getTypeBadgeVariant(product.type)}>
          {product.type?.replace("_", " ")}
        </CustomBadge>
      ),
    },
    {
      key: "price",
      label: "Price",
      width: "120px",
      render: (product) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">
            {formatPrice(product.basePrice)}
          </span>
          {product.salePrice && (
            <span className="text-sm text-green-600 dark:text-green-400">
              Sale: {formatPrice(product.salePrice)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: "120px",
      render: (product) => (
        <CustomBadge variant={getStatusBadgeVariant(product.status)}>
          {product.status || "DRAFT"}
        </CustomBadge>
      ),
    },
    {
      key: "variants",
      label: "Variants",
      width: "100px",
      render: (product) => {
        const variantCount = product.variants?.length || 0;
        return (
          <span className="text-sm text-muted-foreground">
            {variantCount > 0 ? `${variantCount}` : "-"}
          </span>
        );
      },
    },
  ];

  // Render action buttons for each row
  const renderActions = (product) => (
    <div
      className="flex items-center gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        data-tooltip-id="product-tooltip"
        data-tooltip-content="Edit product"
      >
        <IconButton
          icon={Edit}
          label="Edit"
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/products/${product.id}/edit`)}
        />
      </div>
      <div
        data-tooltip-id="product-tooltip"
        data-tooltip-content="Delete product"
      >
        <IconButton
          icon={Trash2}
          label="Delete"
          variant="ghost"
          size="sm"
          onClick={() => handleDeleteClick(product)}
          className="text-red-600 hover:text-red-700 dark:text-red-400"
        />
      </div>
    </div>
  );

  // Check if filters are active
  const hasActiveFilters =
    searchTerm ||
    filterValues.type ||
    filterValues.status ||
    filterValues.categoryIds ||
    filterValues.minPrice ||
    filterValues.maxPrice ||
    filterValues.inStock !== "" ||
    filterValues.sort;

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterValues({
      type: "",
      status: "",
      categoryIds: "",
      minPrice: "",
      maxPrice: "",
      inStock: "",
      sort: "",
    });
    updateFilters({
      search: undefined,
      type: undefined,
      status: undefined,
      categoryIds: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      inStock: undefined,
      sort: undefined,
      page: 1,
    });
  };

  // Handle import success - refresh products
  const handleImportSuccess = () => {
    window.location.reload();
  };

  // Show error state if there's an error
  if (error && !loading) {
    return (
      <PageContainer>
        <PageHeader
          title="Products"
          description="Manage your products"
          action={
            <div className="flex items-center gap-2">
              <CustomButton
                onClick={() => setImportModalOpen(true)}
                variant="outline"
                className="flex items-center gap-2"
                size="sm"
              >
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Import</span>
                <span className="sm:hidden">Import</span>
              </CustomButton>
              <CustomButton
                onClick={() => router.push("/dashboard/products/new")}
                className="flex items-center gap-2"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Product</span>
                <span className="sm:hidden">Add</span>
              </CustomButton>
            </div>
          }
        />
        <ErrorState
          title="Failed to load products"
          message={error}
          action={
            <CustomButton onClick={() => window.location.reload()}>
              Retry
            </CustomButton>
          }
        />
        <ProductImportModal
          isOpen={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          onImportSuccess={handleImportSuccess}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Products"
        description="Manage your products"
        action={
          <div className="flex items-center gap-2">
            <CustomButton
              onClick={() => setImportModalOpen(true)}
              variant="outline"
              className="flex items-center gap-2"
              size="sm"
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Import</span>
              <span className="sm:hidden">Import</span>
            </CustomButton>
            <CustomButton
              onClick={() => router.push("/dashboard/products/new")}
              className="flex items-center gap-2"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Product</span>
              <span className="sm:hidden">Add</span>
            </CustomButton>
          </div>
        }
      />

      {/* Search and Filter Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <CustomInput
            type="text"
            placeholder="Search products..."
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

      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-card rounded-lg border border-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Type
              </label>
              <select
                value={filterValues.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-primary"
              >
                <option value="">All Types</option>
                <option value="SIMPLE">Simple</option>
                <option value="VARIABLE">Variable</option>
                <option value="SUBSCRIPTION">Subscription</option>
                <option value="VARIABLE_SUBSCRIPTION">
                  Variable Subscription
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Status
              </label>
              <select
                value={filterValues.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-primary"
              >
                <option value="">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Category
              </label>
              <select
                value={filterValues.categoryIds}
                onChange={(e) =>
                  handleFilterChange("categoryIds", e.target.value)
                }
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-primary"
              >
                <option value="">All Categories</option>
                {Array.isArray(categories) &&
                  categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Stock Status
              </label>
              <select
                value={filterValues.inStock}
                onChange={(e) => handleFilterChange("inStock", e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-primary"
              >
                <option value="">All</option>
                <option value="true">In Stock</option>
                <option value="false">Out of Stock</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Min Price ($)
              </label>
              <CustomInput
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={filterValues.minPrice}
                onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Max Price ($)
              </label>
              <CustomInput
                type="number"
                min="0"
                step="0.01"
                placeholder="1000.00"
                value={filterValues.maxPrice}
                onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Sort By
              </label>
              <select
                value={filterValues.sort}
                onChange={(e) => handleFilterChange("sort", e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-primary"
              >
                <option value="">Default (Relevance)</option>
                <option value="basePrice:asc">Price: Low to High</option>
                <option value="basePrice:desc">Price: High to Low</option>
                <option value="name:asc">Name: A to Z</option>
                <option value="name:desc">Name: Z to A</option>
                <option value="createdAt:desc">Newest First</option>
                <option value="createdAt:asc">Oldest First</option>
              </select>
            </div>

            {hasActiveFilters && (
              <div className="flex items-end">
                <CustomButton
                  onClick={handleClearFilters}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Clear All
                </CustomButton>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedProductIds.length > 0 && (
        <div className="mb-4 p-3 bg-accent rounded-lg border border-border flex items-center justify-between">
          <span className="text-sm text-foreground">
            {selectedProductIds.length} product
            {selectedProductIds.length > 1 ? "s" : ""} selected
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
      )}

      {/* Products Table */}
      <DataTable
        columns={columns}
        data={Array.isArray(products) ? products : []}
        renderActions={renderActions}
        loading={loading}
        selectable={true}
        selectedRows={selectedProductIds}
        onSelectionChange={handleSelectionChange}
        getRowId={(row) => row.id}
        emptyState={{
          icon: Package,
          title: "No products found",
          description: hasActiveFilters
            ? "No products match your current filters. Try adjusting your search or filter criteria."
            : "Get started by creating your first product to showcase in your store.",
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
              onClick={() => router.push("/dashboard/products/new")}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Your First Product
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
        />
      )}

      {/* Delete Confirmation Dialog */}
      <CustomConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        description={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Bulk Delete Confirmation Dialog */}
      <CustomConfirmationDialog
        isOpen={bulkDeleteDialogOpen}
        onClose={handleBulkDeleteCancel}
        onConfirm={handleBulkDeleteConfirm}
        title="Delete Products"
        description={`Are you sure you want to delete ${
          selectedProductIds.length
        } product${
          selectedProductIds.length > 1 ? "s" : ""
        }? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      <ProductImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />

      {/* Tooltip */}
      <Tooltip
        id="product-tooltip"
        place="top"
        className="z-50 !bg-[#f1f2f4] !text-[#65758b] max-w-[300px] dark:!bg-gray-700 dark:!text-white !opacity-100 !max-w-xs !whitespace-normal !break-words "
      />
    </PageContainer>
  );
}
