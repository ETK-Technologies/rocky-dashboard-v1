"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Edit,
  Trash2,
  Search,
  Plus,
  Tag,
  Save,
  X,
  Eye,
  EyeOff,
  Layers,
} from "lucide-react";
import {
  CustomButton,
  PageContainer,
  PageHeader,
  CustomInput,
  IconButton,
  CustomBadge,
  CustomConfirmationDialog,
  LoadingState,
  ErrorState,
  CustomCard,
  CustomCardContent,
  CustomLabel,
  CustomModal,
} from "@/components/ui";
import { useGlobalAttributes } from "../hooks/useGlobalAttributes";
import { toast } from "react-toastify";

export default function GlobalAttributes() {
  const router = useRouter();
  const {
    attributes,
    loading,
    error,
    search,
    setSearch,
    createAttribute,
    updateAttribute,
    deleteAttribute,
    refetch,
  } = useGlobalAttributes();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [attributeToDelete, setAttributeToDelete] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    position: 0,
    visible: true,
    variation: false,
  });

  // Handle search
  const handleSearch = (value) => {
    setSearch(value);
  };

  // Handle create/edit form
  const handleOpenCreate = () => {
    setEditingAttribute(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      position: 0,
      visible: true,
      variation: false,
    });
    setEditModalOpen(true);
  };

  const handleOpenEdit = (attribute) => {
    setEditingAttribute(attribute);
    setFormData({
      name: attribute.name || "",
      slug: attribute.slug || "",
      description: attribute.description || "",
      position: attribute.position || 0,
      visible: attribute.visible !== undefined ? attribute.visible : true,
      variation:
        attribute.variation !== undefined ? attribute.variation : false,
    });
    setEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setEditModalOpen(false);
    setEditingAttribute(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      position: 0,
      visible: true,
      variation: false,
    });
  };

  // Generate slug from name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (name) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name),
    }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingAttribute) {
        await updateAttribute(editingAttribute.id, formData);
      } else {
        await createAttribute(formData);
      }
      handleCloseEdit();
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  // Handle delete
  const handleDeleteClick = (attribute) => {
    setAttributeToDelete(attribute);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (attributeToDelete) {
      try {
        await deleteAttribute(attributeToDelete.id);
        setDeleteDialogOpen(false);
        setAttributeToDelete(null);
      } catch (error) {
        // Error is already handled in the hook
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setAttributeToDelete(null);
  };

  // Filter attributes by search
  const filteredAttributes = attributes.filter((attr) => {
    const searchLower = search.toLowerCase();
    return (
      attr.name?.toLowerCase().includes(searchLower) ||
      attr.slug?.toLowerCase().includes(searchLower) ||
      attr.description?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <PageContainer>
      <PageHeader
        title="Global Attributes"
        description="Manage reusable attribute definitions that can be assigned to products"
        action={
          <div className="flex gap-2">
            <CustomButton
              variant="outline"
              onClick={() => router.push("/dashboard/products")}
              size="sm"
            >
              Back to Products
            </CustomButton>
            <CustomButton onClick={handleOpenCreate} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Attribute
            </CustomButton>
          </div>
        }
      />

      {/* Search */}
      <CustomCard className="mb-6">
        <CustomCardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <CustomInput
              type="text"
              placeholder="Search attributes by name, slug, or description..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CustomCardContent>
      </CustomCard>

      {/* Attributes List */}
      <CustomCard>
        <CustomCardContent className="pt-6">
          {loading && !attributes.length ? (
            <LoadingState message="Loading global attributes..." />
          ) : error ? (
            <ErrorState
              title="Error loading attributes"
              message={error}
              action={<CustomButton onClick={refetch}>Retry</CustomButton>}
            />
          ) : filteredAttributes.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                {search ? "No attributes found" : "No global attributes"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {search
                  ? "Try adjusting your search term"
                  : "Create your first global attribute to get started"}
              </p>
              {!search && (
                <CustomButton onClick={handleOpenCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Attribute
                </CustomButton>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAttributes.map((attribute) => (
                <div
                  key={attribute.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Tag className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-semibold text-foreground">
                        {attribute.name}
                      </h3>
                      {attribute.slug && (
                        <span className="text-sm text-muted-foreground">
                          ({attribute.slug})
                        </span>
                      )}
                      <div className="flex gap-2 ml-2">
                        {attribute.visible && (
                          <CustomBadge variant="success" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            Visible
                          </CustomBadge>
                        )}
                        {attribute.variation && (
                          <CustomBadge variant="info" size="sm">
                            <Layers className="h-3 w-3 mr-1" />
                            Variation
                          </CustomBadge>
                        )}
                      </div>
                    </div>
                    {attribute.description && (
                      <p className="text-sm text-muted-foreground ml-8">
                        {attribute.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 ml-8 text-xs text-muted-foreground">
                      {attribute.position !== undefined && (
                        <span>Position: {attribute.position}</span>
                      )}
                      {attribute.createdAt && (
                        <span>
                          Created:{" "}
                          {new Date(attribute.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconButton
                      icon={Edit}
                      label="Edit"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(attribute)}
                      disabled={loading}
                    />
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
                </div>
              ))}
            </div>
          )}

          {attributes.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Total: {filteredAttributes.length} of {attributes.length}{" "}
              attribute
              {attributes.length !== 1 ? "s" : ""}
            </div>
          )}
        </CustomCardContent>
      </CustomCard>

      {/* Create/Edit Modal */}
      <CustomModal
        isOpen={editModalOpen}
        onClose={handleCloseEdit}
        title={
          editingAttribute ? "Edit Global Attribute" : "Create Global Attribute"
        }
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <CustomLabel htmlFor="name">Name *</CustomLabel>
            <CustomInput
              id="name"
              type="text"
              placeholder="e.g., Color, Size, Material"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
          </div>

          <div>
            <CustomLabel htmlFor="slug">Slug *</CustomLabel>
            <CustomInput
              id="slug"
              type="text"
              placeholder="e.g., color, size, material"
              value={formData.slug}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, slug: e.target.value }))
              }
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              URL-friendly identifier (auto-generated from name)
            </p>
          </div>

          <div>
            <CustomLabel htmlFor="description">Description</CustomLabel>
            <textarea
              id="description"
              placeholder="Optional description for this attribute"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
              className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div>
            <CustomLabel htmlFor="position">Position</CustomLabel>
            <CustomInput
              id="position"
              type="number"
              placeholder="0"
              value={formData.position}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  position: parseInt(e.target.value) || 0,
                }))
              }
              min="0"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Display order (lower numbers appear first)
            </p>
          </div>

          {/* <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.visible}
                onChange={(e) =>
                  setFormData((prev) => ({
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
                checked={formData.variation}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    variation: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium">Used for Variations</span>
            </label>
          </div> */}

          <div className="flex justify-end gap-2 pt-4">
            <CustomButton
              type="button"
              variant="outline"
              onClick={handleCloseEdit}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </CustomButton>
            <CustomButton type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {editingAttribute ? "Update" : "Create"}
            </CustomButton>
          </div>
        </form>
      </CustomModal>

      {/* Delete Confirmation Dialog */}
      <CustomConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Global Attribute"
        description={`Are you sure you want to delete the global attribute "${attributeToDelete?.name}"? This action cannot be undone. Products using this attribute will not be affected, but you will need to reassign it if needed.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </PageContainer>
  );
}
