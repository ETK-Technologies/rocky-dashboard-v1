"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Search, Package, Link2, Globe } from "lucide-react";
import {
    CustomButton,
    PageContainer,
    PageHeader,
    CustomInput,
    IconButton,
    CustomCard,
    CustomCardContent,
    LoadingState,
    ErrorState,
    CustomConfirmationDialog,
    CustomBadge,
    CustomModal,
    CustomLabel,
} from "@/components/ui";
import { useProducts } from "../hooks/useProducts";
import {
    useGlobalAttributes,
    useProductGlobalAttributes,
} from "@/features/attributes";
import { toast } from "react-toastify";

export default function ProductAttributes() {
    const router = useRouter();
    const { products, loading: productsLoading } = useProducts();
    const [selectedProductId, setSelectedProductId] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [attributeToDelete, setAttributeToDelete] = useState(null);

    // Global attributes
    const {
        attributes: globalAttributesList,
        loading: globalAttributesLoading,
    } = useGlobalAttributes({
        autoFetch: true,
    });
    const {
        attributes: productGlobalAttributes,
        loading: productGlobalAttributesLoading,
        error: globalError,
        bulkAssign,
        removeAttribute,
    } = useProductGlobalAttributes(selectedProductId);

    // Assign global attribute modal
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedGlobalAttribute, setSelectedGlobalAttribute] =
        useState(null);
    const [assignFormData, setAssignFormData] = useState({
        value: "",
        position: 0,
        visible: true,
        variation: false,
    });

    // Handle assign global attribute
    const handleOpenAssignModal = (globalAttribute) => {
        setSelectedGlobalAttribute(globalAttribute);
        setAssignFormData({
            value: "",
            position: productGlobalAttributes.length,
            visible: true,
            variation: globalAttribute.variation || false,
        });
        setAssignModalOpen(true);
    };

    const handleCloseAssignModal = () => {
        setAssignModalOpen(false);
        setSelectedGlobalAttribute(null);
        setAssignFormData({
            value: "",
            position: 0,
            visible: true,
            variation: false,
        });
    };

    const handleAssignGlobalAttribute = async (e) => {
        e.preventDefault();
        if (!selectedGlobalAttribute || !selectedProductId) return;

        if (!assignFormData.value.trim()) {
            toast.error("Attribute value is required");
            return;
        }

        try {
            await bulkAssign([
                {
                    globalAttributeId: selectedGlobalAttribute.id,
                    value: assignFormData.value.trim(),
                    position: assignFormData.position,
                    visible: assignFormData.visible,
                    variation: assignFormData.variation,
                },
            ]);
            handleCloseAssignModal();
        } catch (error) {
            // Error handled in hook
        }
    };

    const handleDeleteClick = (attribute) => {
        setAttributeToDelete(attribute);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!attributeToDelete || !selectedProductId) return;

        try {
            await removeAttribute(attributeToDelete.globalAttributeId);
            setDeleteDialogOpen(false);
            setAttributeToDelete(null);
        } catch (error) {
            // Error handled in hook
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setAttributeToDelete(null);
    };

    // Filter available global attributes (not yet assigned)
    const availableGlobalAttributes = globalAttributesList.filter(
        (ga) =>
            !productGlobalAttributes.some(
                (pga) => pga.globalAttributeId === ga.id
            )
    );

    const filteredAvailableAttributes = availableGlobalAttributes.filter(
        (attr) => {
            const searchLower = searchTerm.toLowerCase();
            return (
                attr.name?.toLowerCase().includes(searchLower) ||
                attr.slug?.toLowerCase().includes(searchLower) ||
                attr.description?.toLowerCase().includes(searchLower)
            );
        }
    );

    // Filter assigned global attributes
    const filteredAssignedAttributes = productGlobalAttributes.filter(
        (attr) => {
            const searchLower = searchTerm.toLowerCase();
            const globalAttr = attr.globalAttribute || {};
            const name = globalAttr.name || "";
            const value = attr.value || "";
            return (
                name.toLowerCase().includes(searchLower) ||
                value.toLowerCase().includes(searchLower)
            );
        }
    );

    const selectedProduct = products.find((p) => p.id === selectedProductId);

    return (
        <PageContainer>
            <PageHeader
                title="Product Attributes"
                description="Manage global attributes for products"
                action={
                    <div className="flex gap-2">
                        <CustomButton
                            variant="outline"
                            onClick={() =>
                                router.push(
                                    "/dashboard/products/global-attributes"
                                )
                            }
                            size="sm"
                        >
                            <Globe className="h-4 w-4 mr-2" />
                            Manage Global Attributes
                        </CustomButton>
                        <CustomButton
                            variant="outline"
                            onClick={() => router.push("/dashboard/products")}
                            size="sm"
                        >
                            Back to Products
                        </CustomButton>
                    </div>
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
                                onChange={(e) =>
                                    setSelectedProductId(e.target.value)
                                }
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
                                        {product.name}{" "}
                                        {product.sku && `(${product.sku})`}
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
                                Please select a product above to manage its
                                attributes.
                            </p>
                        </div>
                    </CustomCardContent>
                </CustomCard>
            ) : (
                <>
                    {/* Assign Global Attribute Section */}
                    <CustomCard className="mb-6">
                        <CustomCardContent className="pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">
                                    Available Global Attributes
                                </h3>
                                <div className="flex gap-2">
                                    <div className="relative flex-1 max-w-md">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <CustomInput
                                            type="text"
                                            placeholder="Search attributes..."
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                            className="pl-10"
                                        />
                                    </div>
                                    <CustomButton
                                        onClick={() =>
                                            router.push(
                                                "/dashboard/products/global-attributes"
                                            )
                                        }
                                        variant="outline"
                                        size="sm"
                                    >
                                        <Globe className="h-4 w-4 mr-2" />
                                        Manage Global Attributes
                                    </CustomButton>
                                </div>
                            </div>
                            {globalAttributesLoading ? (
                                <LoadingState
                                    message="Loading global attributes..."
                                    loading={globalAttributesLoading}
                                    fullScreen={true}
                                />
                            ) : globalAttributesList.length === 0 ? (
                                <div className="text-center py-6">
                                    <p className="text-sm text-muted-foreground mb-4">
                                        No global attributes available. Create
                                        one first.
                                    </p>
                                    <CustomButton
                                        onClick={() =>
                                            router.push(
                                                "/dashboard/products/global-attributes"
                                            )
                                        }
                                    >
                                        Create Global Attribute
                                    </CustomButton>
                                </div>
                            ) : filteredAvailableAttributes.length === 0 ? (
                                <div className="text-center py-6">
                                    <p className="text-sm text-muted-foreground">
                                        {searchTerm
                                            ? "No matching attributes found"
                                            : "All global attributes have been assigned to this product"}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {filteredAvailableAttributes.map(
                                        (globalAttr) => (
                                            <div
                                                key={globalAttr.id}
                                                className="p-3 border border-border rounded-lg hover:bg-accent transition-colors"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="font-medium">
                                                            {globalAttr.name}
                                                        </div>
                                                        {globalAttr.description && (
                                                            <div className="text-xs text-muted-foreground mt-1">
                                                                {
                                                                    globalAttr.description
                                                                }
                                                            </div>
                                                        )}
                                                        {globalAttr.slug && (
                                                            <div className="text-xs text-muted-foreground mt-1">
                                                                Slug:{" "}
                                                                {
                                                                    globalAttr.slug
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                    <IconButton
                                                        icon={Link2}
                                                        label="Assign"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleOpenAssignModal(
                                                                globalAttr
                                                            )
                                                        }
                                                        disabled={
                                                            productGlobalAttributesLoading
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </CustomCardContent>
                    </CustomCard>

                    {/* Assigned Global Attributes List */}
                    <CustomCard>
                        <CustomCardContent className="pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">
                                    Assigned Global Attributes
                                </h3>
                                <div className="relative flex-1 max-w-md ml-4">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <CustomInput
                                        type="text"
                                        placeholder="Search assigned attributes..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {productGlobalAttributesLoading &&
                            !productGlobalAttributes.length ? (
                                <LoadingState
                                    message="Loading assigned attributes..."
                                    loading={productGlobalAttributesLoading}
                                />
                            ) : globalError ? (
                                <ErrorState
                                    title="Error loading attributes"
                                    message={globalError}
                                    action={
                                        <CustomButton
                                            onClick={() =>
                                                window.location.reload()
                                            }
                                        >
                                            Retry
                                        </CustomButton>
                                    }
                                />
                            ) : filteredAssignedAttributes.length === 0 ? (
                                <div className="text-center py-12">
                                    <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                                    <h3 className="text-lg font-semibold mb-2">
                                        {searchTerm
                                            ? "No attributes found"
                                            : "No global attributes assigned"}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {searchTerm
                                            ? "Try adjusting your search term"
                                            : "Assign a global attribute from above"}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {filteredAssignedAttributes.map((attr) => {
                                        const globalAttr =
                                            attr.globalAttribute || {};
                                        return (
                                            <div
                                                key={attr.id}
                                                className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent transition-colors"
                                            >
                                                <div className="flex items-center gap-2 flex-1">
                                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-foreground">
                                                                {globalAttr.name ||
                                                                    "Unknown"}
                                                            </span>
                                                            {attr.value && (
                                                                <span className="text-sm text-muted-foreground">
                                                                    :{" "}
                                                                    {attr.value}
                                                                </span>
                                                            )}
                                                            <div className="flex gap-2 ml-2">
                                                                {attr.visible && (
                                                                    <CustomBadge
                                                                        variant="success"
                                                                        size="sm"
                                                                    >
                                                                        Visible
                                                                    </CustomBadge>
                                                                )}
                                                                {attr.variation && (
                                                                    <CustomBadge
                                                                        variant="info"
                                                                        size="sm"
                                                                    >
                                                                        Variation
                                                                    </CustomBadge>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {globalAttr.description && (
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                {
                                                                    globalAttr.description
                                                                }
                                                            </p>
                                                        )}
                                                        {attr.position !==
                                                            undefined && (
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                Position:{" "}
                                                                {attr.position}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <IconButton
                                                    icon={Trash2}
                                                    label="Remove"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDeleteClick(attr)
                                                    }
                                                    className="text-red-600 hover:text-red-700 dark:text-red-400"
                                                    disabled={
                                                        productGlobalAttributesLoading
                                                    }
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {productGlobalAttributes.length > 0 && (
                                <div className="mt-4 text-sm text-muted-foreground">
                                    Total: {filteredAssignedAttributes.length}{" "}
                                    of {productGlobalAttributes.length}{" "}
                                    attribute
                                    {productGlobalAttributes.length !== 1
                                        ? "s"
                                        : ""}
                                </div>
                            )}
                        </CustomCardContent>
                    </CustomCard>
                </>
            )}

            {/* Assign Global Attribute Modal */}
            <CustomModal
                isOpen={assignModalOpen}
                onClose={handleCloseAssignModal}
                title={`Assign "${selectedGlobalAttribute?.name}" to Product`}
                size="md"
            >
                <form
                    onSubmit={handleAssignGlobalAttribute}
                    className="space-y-4"
                >
                    <div>
                        <CustomLabel htmlFor="assignValue">Value *</CustomLabel>
                        <CustomInput
                            id="assignValue"
                            type="text"
                            placeholder={`Enter value for ${selectedGlobalAttribute?.name}`}
                            value={assignFormData.value}
                            onChange={(e) =>
                                setAssignFormData((prev) => ({
                                    ...prev,
                                    value: e.target.value,
                                }))
                            }
                            required
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            The specific value for this product (e.g.,
                            &quot;Blue&quot; for Color)
                        </p>
                    </div>

                    <div>
                        <CustomLabel htmlFor="assignPosition">
                            Position
                        </CustomLabel>
                        <CustomInput
                            id="assignPosition"
                            type="number"
                            placeholder="0"
                            value={assignFormData.position}
                            onChange={(e) =>
                                setAssignFormData((prev) => ({
                                    ...prev,
                                    position: parseInt(e.target.value) || 0,
                                }))
                            }
                            min="0"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={assignFormData.visible}
                                onChange={(e) =>
                                    setAssignFormData((prev) => ({
                                        ...prev,
                                        visible: e.target.checked,
                                    }))
                                }
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium">Visible</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={assignFormData.variation}
                                onChange={(e) =>
                                    setAssignFormData((prev) => ({
                                        ...prev,
                                        variation: e.target.checked,
                                    }))
                                }
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium">
                                Used for Variations
                            </span>
                        </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <CustomButton
                            type="button"
                            variant="outline"
                            onClick={handleCloseAssignModal}
                        >
                            Cancel
                        </CustomButton>
                        <CustomButton type="submit" disabled={globalLoading}>
                            Assign Attribute
                        </CustomButton>
                    </div>
                </form>
            </CustomModal>

            {/* Delete Confirmation Dialog */}
            <CustomConfirmationDialog
                isOpen={deleteDialogOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Remove Global Attribute"
                description={`Are you sure you want to remove the global attribute "${
                    attributeToDelete?.globalAttribute?.name || "this attribute"
                }" from this product? This action cannot be undone.`}
                confirmText="Remove"
                cancelText="Cancel"
                variant="danger"
            />
        </PageContainer>
    );
}
