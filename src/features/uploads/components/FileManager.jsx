"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Tooltip as ReactTooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import {
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Image as ImageIcon,
  FileText,
  Video,
  Music,
  Archive,
  Settings,
  Folder,
  FolderPlus,
  Upload as UploadIcon,
  Grid3x3,
  List as ListIcon,
  MoreVertical,
  ChevronRight,
  Home,
  Copy,
  Move,
  File,
} from "lucide-react";
import {
  CustomButton,
  PageContainer,
  PageHeader,
  CustomInput,
  IconButton,
  CustomBadge,
  CustomConfirmationDialog,
  ErrorState,
  LoadingState,
  FileUpload,
  ViewToggle,
  Tooltip,
} from "@/components/ui";
import { FolderCard } from "@/components/common/FolderCard";
import { useFileManager } from "../hooks/useFileManager";
import { FolderSelector } from "./FolderSelector";
import { images } from "next.config";
import Image from "next/image";

// Helper function to get all descendant folder IDs (prevents circular moves)
const getAllDescendantFolderIds = (folderId, items) => {
  const descendants = [];
  const folders = items.filter((item) => item.type === "folder");

  const findDescendants = (parentId) => {
    folders.forEach((folder) => {
      if (folder.parentId === parentId) {
        descendants.push(folder.id);
        findDescendants(folder.id);
      }
    });
  };

  findDescendants(folderId);
  return descendants;
};

export default function FileManager() {
  const router = useRouter();
  const {
    items,
    isLoading,
    error,
    currentFolderId,
    breadcrumbs,
    viewMode,
    setViewMode,
    navigateToFolder,
    navigateUp,
    navigateToBreadcrumb,
    createFolder,
    renameFolder,
    deleteFolder,
    moveFolder,
    renameFile,
    moveFile,
    deleteFile,
    uploadFiles,
    fetchItems,
  } = useFileManager();

  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemToRename, setItemToRename] = useState(null);
  const [itemToMove, setItemToMove] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);

  // Filter items by search
  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    const term = searchTerm.toLowerCase();
    return items.filter(
      (item) =>
        item.name?.toLowerCase().includes(term) ||
        item.originalName?.toLowerCase().includes(term) ||
        item.filename?.toLowerCase().includes(term)
    );
  }, [items, searchTerm]);

  // Separate folders and files
  const folders = useMemo(
    () => filteredItems.filter((item) => item.type === "folder"),
    [filteredItems]
  );
  const files = useMemo(
    () => filteredItems.filter((item) => item.type === "file"),
    [filteredItems]
  );

  // Handle create folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    console.log("FileManager - Creating folder:", {
      name: newFolderName.trim(),
      currentFolderId,
    });
    const success = await createFolder(newFolderName.trim());
    if (success) {
      setShowCreateFolder(false);
      setNewFolderName("");
    }
  };

  // Handle delete
  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === "folder") {
      await deleteFolder(itemToDelete.id);
    } else {
      await deleteFile(itemToDelete.id);
    }
    setShowDeleteDialog(false);
    setItemToDelete(null);
  };

  // Handle rename
  const handleRenameClick = (item) => {
    setItemToRename(item);
    setRenameValue(item.name || item.originalName || "");
    setShowRenameDialog(true);
  };

  const handleRenameConfirm = async () => {
    if (!itemToRename || !renameValue.trim()) return;
    if (itemToRename.type === "folder") {
      await renameFolder(itemToRename.id, renameValue.trim());
    } else {
      await renameFile(itemToRename.id, renameValue.trim());
    }
    setShowRenameDialog(false);
    setItemToRename(null);
    setRenameValue("");
  };

  // Handle move
  const handleMoveClick = (item) => {
    setItemToMove(item);
    setShowMoveDialog(true);
  };

  const handleMoveConfirm = async (targetFolderId) => {
    if (!itemToMove) return;
    if (itemToMove.type === "folder") {
      await moveFolder(itemToMove.id, targetFolderId);
    } else {
      await moveFile(itemToMove.id, targetFolderId);
    }
    setShowMoveDialog(false);
    setItemToMove(null);
  };

  // Handle upload complete
  const handleUploadComplete = async (uploadedFiles) => {
    setShowUpload(false);
    await fetchItems(currentFolderId);
  };

  // Get file icon
  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith("image/")) return ImageIcon;
    if (mimeType?.startsWith("video/")) return Video;
    if (mimeType?.startsWith("audio/")) return Music;
    if (mimeType === "application/pdf" || mimeType?.includes("document"))
      return FileText;
    if (mimeType?.includes("zip") || mimeType?.includes("archive"))
      return Archive;
    return FileText;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "-";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  // Render context menu
  const renderContextMenu = (item) => (
    <div className="flex items-center gap-1 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg p-1 shadow-xl border border-gray-200 dark:border-gray-700">
      {item.type === "file" && item.cdnUrl && (
        <Tooltip content="Download" side="top">
          <IconButton
            icon={Download}
            label="Download"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              window.open(item.cdnUrl, "_blank");
            }}
            className="hover:bg-gray-100 dark:hover:bg-gray-700"
          />
        </Tooltip>
      )}
      <Tooltip content="Rename" side="top">
        <IconButton
          icon={Edit}
          label="Rename"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleRenameClick(item);
          }}
          className="hover:bg-gray-100 dark:hover:bg-gray-700"
        />
      </Tooltip>
      <Tooltip content="Move" side="top">
        <IconButton
          icon={Move}
          label="Move"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleMoveClick(item);
          }}
          className="hover:bg-gray-100 dark:hover:bg-gray-700"
        />
      </Tooltip>
      <Tooltip content="Delete" side="top">
        <IconButton
          icon={Trash2}
          label="Delete"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteClick(item);
          }}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
        />
      </Tooltip>
    </div>
  );

  return (
    <PageContainer>
      {/* <PageHeader
        title="File Manager"
        description="Manage files and folders with full control"
      /> */}

      {/* File Manager Container with Professional Layout */}
      <div
        className="bg-card border border-border rounded-lg shadow-lg overflow-hidden flex flex-col"
        style={{ maxHeight: "calc(100vh - 250px)", minHeight: "600px" }}
      >
        {/* Toolbar */}
        <div className="border-b border-border bg-secondary/50 px-4 py-3 flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-2 flex-1">
            <CustomButton
              variant="outline"
              size="sm"
              onClick={() => navigateUp()}
              disabled={breadcrumbs.length <= 1}
              className="flex items-center gap-2"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
              <span className="hidden sm:inline">Back</span>
            </CustomButton>

            <CustomButton
              variant="outline"
              onClick={() => setShowCreateFolder(true)}
              size="sm"
              className="flex items-center gap-2"
            >
              <FolderPlus className="h-4 w-4" />
              <span className="hidden sm:inline">New Folder</span>
            </CustomButton>

            <CustomButton
              onClick={() => setShowUpload(!showUpload)}
              size="sm"
              className="flex items-center gap-2"
            >
              <UploadIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Upload</span>
            </CustomButton>

            <div className="h-6 w-px bg-border mx-2" />

            <ViewToggle view={viewMode} onViewChange={setViewMode} />
          </div>

          <div className="flex items-center gap-2">
            <CustomButton
              variant="outline"
              onClick={() =>
                router.push("/dashboard/super-admin/uploads/settings")
              }
              size="sm"
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </CustomButton>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="border-b border-border bg-secondary/30 px-4 py-2 flex items-center gap-2 text-sm flex-shrink-0">
          <button
            onClick={() => navigateToBreadcrumb(0)}
            className="p-1 hover:bg-accent rounded transition-colors"
            title="Go to Root"
          >
            <Home className="h-4 w-4 text-muted-foreground" />
          </button>
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.id || "root"} className="flex items-center gap-2">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              <button
                onClick={() => navigateToBreadcrumb(index)}
                className={`px-2 py-1 rounded transition-colors ${
                  index === breadcrumbs.length - 1
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {index === 0 ? "Root" : crumb.name}
              </button>
            </div>
          ))}
        </div>

        {/* Search Bar */}
        <div className="border-b border-border px-4 py-3 flex-shrink-0">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <CustomInput
              type="text"
              placeholder="Search files and folders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Upload Section */}
        {showUpload && (
          <div className="border-b border-border p-4 bg-secondary/30 flex-shrink-0">
            <div className="max-w-2xl">
              <h3 className="text-sm font-semibold mb-3 text-foreground">
                Upload Files
              </h3>
              <FileUpload
                onUploadComplete={handleUploadComplete}
                onUpload={uploadFiles}
                multiple={true}
                accept="image/*,application/pdf,video/*,audio/*,application/*"
                maxFiles={10}
              />
            </div>
          </div>
        )}

        {/* Create Folder Dialog */}
        {showCreateFolder && (
          <div className="border-b border-border p-4 bg-secondary/30 flex-shrink-0">
            <div className="flex items-center gap-2 max-w-md">
              <CustomInput
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleCreateFolder();
                }}
                className="flex-1"
                autoFocus
              />
              <CustomButton onClick={handleCreateFolder} size="sm">
                Create
              </CustomButton>
              <CustomButton
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowCreateFolder(false);
                  setNewFolderName("");
                }}
              >
                Cancel
              </CustomButton>
            </div>
          </div>
        )}

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-background">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <LoadingState message="Loading files and folders..." />
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="p-8">
              <ErrorState
                title="Failed to load items"
                message={error}
                action={
                  <CustomButton onClick={() => fetchItems(currentFolderId)}>
                    Retry
                  </CustomButton>
                }
              />
            </div>
          )}

          {/* Grid View */}
          {!isLoading && !error && viewMode === "grid" && (
            <div className="p-4">
              {/* Combined View - Folders and Files together */}
              {folders.length > 0 || files.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {/* Folders */}
                  {folders.map((folder) => (
                    <div
                      key={folder.id}
                      className="relative group flex flex-col"
                      onClick={() => navigateToFolder(folder.id, folder.name)}
                    >
                      <div className="bg-card border border-border rounded-lg p-4 hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer flex flex-col items-center text-center h-full relative">
                        {/* Folder Icon */}
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex items-center justify-center bg-yellow-50 dark:bg-yellow-950/30 mb-3 flex-shrink-0">
                          <Folder className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
                        </div>

                        {/* Folder Name */}
                        <h3 className="font-medium text-foreground text-sm mb-1 truncate w-full">
                          {folder.name}
                        </h3>
                        {/* Item Count */}
                        <p className="text-xs text-muted-foreground">
                          {folder.itemCount || 0} items
                        </p>
                      </div>
                      {/* Action Menu - Only on hover */}
                      <div
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {renderContextMenu(folder)}
                      </div>
                    </div>
                  ))}

                  {/* Files */}
                  {files.map((file) => {
                    const FileIcon = getFileIcon(file.mimeType);
                    const isImage = file.mimeType?.startsWith("image/");
                    return (
                      <div
                        key={file.id}
                        className="relative group flex flex-col"
                        onClick={() => {
                          if (file.cdnUrl) window.open(file.cdnUrl, "_blank");
                        }}
                      >
                        <div className="bg-card border border-border rounded-lg p-4 hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer flex flex-col items-center text-center h-full relative">
                          {/* File Preview/Icon */}
                          <div className="w-20 h-20 rounded-lg overflow-hidden flex items-center justify-center bg-secondary mb-3 flex-shrink-0">
                            {isImage && file.cdnUrl ? (
                              // <img
                              //   src={file.cdnUrl}
                              //   alt={file.originalName || file.filename}
                              //   className="w-full h-full object-cover"
                              // />
                              <Image
                                src={file.cdnUrl}
                                alt={file.originalName || file.filename}
                                width={80}
                                height={80}
                              />
                            ) : (
                              <FileIcon className="h-10 w-10 text-muted-foreground" />
                            )}
                          </div>

                          {/* File Name */}
                          <h3 className="font-medium text-foreground text-sm mb-1 truncate w-full px-1">
                            {file.originalName || file.filename}
                          </h3>
                          {/* File Size */}
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                        {/* Action Menu - Only on hover */}
                        <div
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {renderContextMenu(file)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Folder className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No items found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm
                      ? "No items match your search"
                      : "Get started by uploading files or creating folders"}
                  </p>
                  <div className="flex gap-2 justify-center">
                    <CustomButton
                      variant="outline"
                      onClick={() => setShowCreateFolder(true)}
                    >
                      <FolderPlus className="h-4 w-4 mr-2" />
                      New Folder
                    </CustomButton>
                    <CustomButton onClick={() => setShowUpload(true)}>
                      <UploadIcon className="h-4 w-4 mr-2" />
                      Upload Files
                    </CustomButton>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* List View */}
          {!isLoading && !error && viewMode === "list" && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50 border-b border-border sticky top-0 z-10">
                  <tr>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-4 py-3">
                      Name
                    </th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-4 py-3">
                      Type
                    </th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-4 py-3">
                      Size
                    </th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-4 py-3">
                      Modified
                    </th>
                    <th className="text-right text-xs font-semibold text-muted-foreground uppercase px-4 py-3 w-24">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {folders.map((folder) => (
                    <tr
                      key={folder.id}
                      className="hover:bg-accent cursor-pointer transition-colors group"
                      onClick={() => navigateToFolder(folder.id, folder.name)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Folder className="h-5 w-5 text-yellow-600" />
                          <span className="font-medium">{folder.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        Folder
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        -
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {folder.updatedAt
                          ? new Date(folder.updatedAt).toLocaleDateString()
                          : "-"}
                      </td>
                      <td
                        className="px-4 py-3 text-right opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {renderContextMenu(folder)}
                      </td>
                    </tr>
                  ))}
                  {files.map((file) => {
                    const FileIcon = getFileIcon(file.mimeType);
                    return (
                      <tr
                        key={file.id}
                        className="hover:bg-accent cursor-pointer transition-colors group"
                        onClick={() => {
                          if (file.cdnUrl) window.open(file.cdnUrl, "_blank");
                        }}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <FileIcon className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">
                              {file.originalName || file.filename}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {file.mimeType?.split("/")[1] || "File"}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {formatFileSize(file.size)}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {file.updatedAt
                            ? new Date(file.updatedAt).toLocaleDateString()
                            : "-"}
                        </td>
                        <td
                          className="px-4 py-3 text-right opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {renderContextMenu(file)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {folders.length === 0 && files.length === 0 && (
                <div className="text-center py-16">
                  <Folder className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No items found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm
                      ? "No items match your search"
                      : "Get started by uploading files or creating folders"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="border-t border-border bg-secondary/30 px-4 py-2 flex items-center justify-between text-xs text-muted-foreground flex-shrink-0">
          <div className="flex items-center gap-4">
            <span>
              {folders.length} {folders.length === 1 ? "folder" : "folders"}
            </span>
            <span>
              {files.length} {files.length === 1 ? "file" : "files"}
            </span>
          </div>
          <div className="text-muted-foreground">
            {viewMode === "grid" ? "Grid View" : "List View"}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <CustomConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setItemToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${itemToDelete?.type === "folder" ? "Folder" : "File"}`}
        description={`Are you sure you want to delete "${
          itemToDelete?.name || itemToDelete?.originalName
        }"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Rename Dialog */}
      {showRenameDialog && itemToRename && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Rename {itemToRename.type === "folder" ? "Folder" : "File"}
            </h3>
            <CustomInput
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleRenameConfirm();
              }}
              placeholder="Enter new name"
              autoFocus
              className="mb-4"
            />
            <div className="flex justify-end gap-2">
              <CustomButton
                variant="outline"
                onClick={() => {
                  setShowRenameDialog(false);
                  setItemToRename(null);
                  setRenameValue("");
                }}
              >
                Cancel
              </CustomButton>
              <CustomButton onClick={handleRenameConfirm}>Rename</CustomButton>
            </div>
          </div>
        </div>
      )}

      {/* Move Dialog with Folder Selector */}
      {showMoveDialog && itemToMove && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
            <h3 className="text-lg font-semibold mb-4">
              Move {itemToMove.type === "folder" ? "Folder" : "File"}:{" "}
              <span className="text-muted-foreground">
                {itemToMove.name || itemToMove.originalName}
              </span>
            </h3>
            <FolderSelector
              currentFolderId={currentFolderId}
              excludeFolderId={
                itemToMove.type === "folder" ? itemToMove.id : null
              }
              excludeParentIds={
                itemToMove.type === "folder"
                  ? [
                      ...(itemToMove.id ? [itemToMove.id] : []),
                      ...getAllDescendantFolderIds(itemToMove.id, items),
                    ]
                  : []
              }
              onSelect={handleMoveConfirm}
              onCancel={() => {
                setShowMoveDialog(false);
                setItemToMove(null);
              }}
            />
          </div>
        </div>
      )}

      <ReactTooltip
        id="file-tooltip"
        place="top"
        className="z-50 !bg-[#f1f2f4] !text-[#65758b] max-w-[300px] dark:!bg-gray-700 dark:!text-white !opacity-100 !max-w-xs !whitespace-normal !break-words "
      />
    </PageContainer>
  );
}
