"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Search, Tag, Package } from "lucide-react";
import {
  CustomButton,
  PageContainer,
  PageHeader,
  DataTable,
  CustomInput,
  IconButton,
  CustomCard,
  CustomCardContent,
  LoadingState,
  ErrorState,
  CustomConfirmationDialog,
} from "@/components/ui";
import { useProducts } from "../hooks/useProducts";
import { productAttributeService } from "../services/productAttributeService";
import { toast } from "react-toastify";

export default function ProductAttributes() {
  const router = useRouter();
  const { products, loading: productsLoading } = useProducts();
  const [selectedProductId, setSelectedProductId] = useState("");
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newAttributeName, setNewAttributeName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [attributeToDelete, setAttributeToDelete] = useState(null);

  // Fetch attributes when product is selected
  useEffect(() => {
    if (selectedProductId) {
      fetchAttributes();
    } else {
      setAttributes([]);
    }
  }, [selectedProductId]);

  const fetchAttributes = async () => {
    if (!selectedProductId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await productAttributeService.getAll(selectedProductId);
      // Handle different possible response shapes
      const attributesList = Array.isArray(data)
        ? data
        : data?.data || data?.attributes || [];
      setAttributes(attributesList);
    } catch (err) {
      setError(err.message || "Failed to load attributes");
      toast.error(err.message || "Failed to load attributes");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAttribute = async () => {
    if (!selectedProductId) {
      toast.error("Please select a product first");
      return;
    }

    if (!newAttributeName.trim()) {
      toast.error("Attribute name is required");
      return;
    }

    // Check if attribute already exists
    if (attributes.includes(newAttributeName.trim())) {
      toast.error("Attribute already exists");
      return;
    }

    setLoading(true);
    try {
      const updatedAttributes = [...attributes, newAttributeName.trim()];
      await productAttributeService.upsert(
        selectedProductId,
        updatedAttributes
      );
      setAttributes(updatedAttributes);
      setNewAttributeName("");
      toast.success("Attribute added successfully");
    } catch (err) {
      toast.error(err.message || "Failed to add attribute");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (attributeName) => {
    setAttributeToDelete(attributeName);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!attributeToDelete || !selectedProductId) return;

    setLoading(true);
    try {
      await productAttributeService.delete(
        selectedProductId,
        attributeToDelete
      );
      setAttributes(attributes.filter((attr) => attr !== attributeToDelete));
      setDeleteDialogOpen(false);
      setAttributeToDelete(null);
      toast.success("Attribute deleted successfully");
    } catch (err) {
      toast.error(err.message || "Failed to delete attribute");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setAttributeToDelete(null);
  };

  // Filter attributes by search term
  const filteredAttributes = attributes.filter((attr) =>
    attr.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  return (
    <PageContainer>
      <PageHeader
        title="Products Attributes"
        description="Manage attributes for products"
        action={
          <CustomButton
            variant="outline"
            onClick={() => router.push("/dashboard/products")}
            size="sm"
          >
            Back to Products
          </CustomButton>
        }
      />

      {/* Product Selection */}
      <CustomCard className="mb-6">
        <CustomCardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Select Product
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className={`
                  flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors
                  bg-white text-gray-900 border-gray-300
                  dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                  focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400
                `}
              >
                <option value="">-- Select a product --</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} {product.sku && `(${product.sku})`}
                  </option>
                ))}
              </select>
            </div>

            {selectedProduct && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Managing attributes for:{" "}
                  <span className="font-medium text-foreground">
                    {selectedProduct.name}
                  </span>
                </p>
              </div>
            )}
          </div>
        </CustomCardContent>
      </CustomCard>

      {!selectedProductId ? (
        <CustomCard>
          <CustomCardContent className="pt-12 pb-12">
            <div className="text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                No Product Selected
              </h3>
              <p className="text-sm text-muted-foreground">
                Please select a product above to manage its attributes.
              </p>
            </div>
          </CustomCardContent>
        </CustomCard>
      ) : (
        <>
          {/* Add Attribute Section */}
          <CustomCard className="mb-6">
            <CustomCardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Add New Attribute</h3>
              <div className="flex gap-2">
                <CustomInput
                  type="text"
                  placeholder="Enter attribute name (e.g., Color, Size)"
                  value={newAttributeName}
                  onChange={(e) => setNewAttributeName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAddAttribute();
                    }
                  }}
                  disabled={loading}
                  className="flex-1"
                />
                <CustomButton
                  onClick={handleAddAttribute}
                  disabled={loading || !newAttributeName.trim()}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Attribute
                </CustomButton>
              </div>
            </CustomCardContent>
          </CustomCard>

          {/* Attributes List */}
          <CustomCard>
            <CustomCardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Attributes</h3>
                <div className="relative flex-1 max-w-md ml-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <CustomInput
                    type="text"
                    placeholder="Search attributes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {loading && !attributes.length ? (
                <LoadingState message="Loading attributes..." />
              ) : error ? (
                <ErrorState
                  title="Error loading attributes"
                  message={error}
                  action={
                    <CustomButton onClick={fetchAttributes}>Retry</CustomButton>
                  }
                />
              ) : filteredAttributes.length === 0 ? (
                <div className="text-center py-12">
                  <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">
                    {searchTerm ? "No attributes found" : "No attributes"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm
                      ? "Try adjusting your search term"
                      : "Add your first attribute above"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAttributes.map((attribute, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">
                          {attribute}
                        </span>
                      </div>
                      <IconButton
                        icon={Trash2}
                        label="Delete"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(attribute)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400"
                        disabled={loading}
                      />
                    </div>
                  ))}
                </div>
              )}

              {attributes.length > 0 && (
                <div className="mt-4 text-sm text-muted-foreground">
                  Total: {attributes.length} attribute
                  {attributes.length !== 1 ? "s" : ""}
                </div>
              )}
            </CustomCardContent>
          </CustomCard>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <CustomConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Attribute"
        description={`Are you sure you want to delete the attribute "${attributeToDelete}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </PageContainer>
  );
}
