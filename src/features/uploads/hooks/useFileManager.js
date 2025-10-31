"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import { uploadService } from "../services/uploadService";
import { folderStorage } from "../utils/folderStorage";

export function useFileManager() {
  const [items, setItems] = useState([]); // Combined folders and files
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: "Root" }]);
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  /**
   * Calculate item count for a folder (files + subfolders)
   */
  const calculateFolderItemCount = useCallback(
    (folderId, allFiles, allFolders) => {
      // Count files mapped to this folder
      const fileMappings = JSON.parse(
        localStorage.getItem("file_folder_mappings") || "{}"
      );
      const filesInFolder = allFiles.filter((file) => {
        const mappedFolderId = fileMappings[file.id];
        return mappedFolderId === folderId;
      }).length;

      // Count subfolders (direct children only)
      const subfolders = allFolders.filter(
        (folder) => folder.parentId === folderId
      ).length;

      return filesInFolder + subfolders;
    },
    []
  );

  /**
   * Fetch folders and files in current directory
   */
  const fetchItems = useCallback(
    async (folderId = null) => {
      setIsLoading(true);
      setError(null);
      try {
        // Get all folders (not just current parent) to calculate counts
        const allFolders = folderStorage.getFolders();

        // Get folders from localStorage for current directory
        const folders = folderStorage.getFoldersByParent(folderId);

        // Fetch files from API
        // Note: If the API supports folderId filter, use it; otherwise filter client-side
        const filesResponse = await uploadService.getUploads({
          // folderId: folderId || undefined, // Uncomment if API supports this
        });

        // Extract files from response
        let files = [];
        if (Array.isArray(filesResponse?.data)) {
          files = filesResponse.data;
        } else if (Array.isArray(filesResponse?.files)) {
          files = filesResponse.files;
        } else if (Array.isArray(filesResponse)) {
          files = filesResponse;
        }

        // Calculate item counts for each folder
        const foldersWithCounts = folders.map((folder) => {
          const itemCount = calculateFolderItemCount(
            folder.id,
            files,
            allFolders
          );
          return { ...folder, itemCount, type: "folder" };
        });

        // Filter files by folder using localStorage mapping
        const fileMappings = JSON.parse(
          localStorage.getItem("file_folder_mappings") || "{}"
        );

        // Get file renames from localStorage
        const fileRenames = JSON.parse(
          localStorage.getItem("file_renames") || "{}"
        );

        const filesWithType = files
          .filter((file) => {
            const mappedFolderId = fileMappings[file.id];
            if (folderId === null) {
              // Show files that don't have a folder mapping or are explicitly mapped to null
              return !mappedFolderId || mappedFolderId === null;
            }
            // Show files mapped to current folder
            return mappedFolderId === folderId;
          })
          .map((f) => {
            // Apply rename if available
            const renamed = fileRenames[f.id];
            if (renamed) {
              return {
                ...f,
                type: "file",
                displayName: renamed,
                originalName: renamed, // Override for display
              };
            }
            return { ...f, type: "file" };
          });

        const allItems = [...foldersWithCounts, ...filesWithType];
        setItems(allItems);
      } catch (err) {
        const message = err?.message || "Failed to fetch items";
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [calculateFolderItemCount]
  );

  /**
   * Navigate into a folder
   */
  const navigateToFolder = useCallback(
    async (folderId, folderName) => {
      setCurrentFolderId(folderId);
      await fetchItems(folderId);

      // Update breadcrumbs
      setBreadcrumbs((prev) => {
        const index = prev.findIndex((b) => b.id === folderId);
        if (index >= 0) {
          return prev.slice(0, index + 1);
        }

        // Build path from folderId
        const path = folderStorage.getFolderPath(folderId);
        const newBreadcrumbs = [{ id: null, name: "Root" }];
        path.forEach((folder) => {
          newBreadcrumbs.push({ id: folder.id, name: folder.name });
        });
        return newBreadcrumbs;
      });
    },
    [fetchItems]
  );

  /**
   * Navigate up (to parent folder)
   */
  const navigateUp = useCallback(async () => {
    if (breadcrumbs.length <= 1) return;

    const newBreadcrumbs = breadcrumbs.slice(0, -1);
    const parentFolder = newBreadcrumbs[newBreadcrumbs.length - 1];
    setBreadcrumbs(newBreadcrumbs);
    setCurrentFolderId(parentFolder.id);
    await fetchItems(parentFolder.id);
  }, [breadcrumbs, fetchItems]);

  /**
   * Navigate to breadcrumb
   */
  const navigateToBreadcrumb = useCallback(
    async (index) => {
      const targetBreadcrumb = breadcrumbs[index];
      if (!targetBreadcrumb) return;

      setBreadcrumbs(breadcrumbs.slice(0, index + 1));
      setCurrentFolderId(targetBreadcrumb.id);
      await fetchItems(targetBreadcrumb.id);
    },
    [breadcrumbs, fetchItems]
  );

  /**
   * Create a new folder
   */
  const createFolder = useCallback(
    async (name, parentId = null) => {
      setIsLoading(true);
      setError(null);
      try {
        const folder = folderStorage.createFolder(
          name,
          parentId || currentFolderId
        );
        toast.success("Folder created successfully");
        await fetchItems(currentFolderId);
        return true;
      } catch (err) {
        const message = err?.message || "Failed to create folder";
        setError(message);
        toast.error(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [currentFolderId, fetchItems]
  );

  /**
   * Rename a folder
   */
  const renameFolder = useCallback(
    async (id, newName) => {
      setIsLoading(true);
      setError(null);
      try {
        folderStorage.updateFolder(id, { name: newName });
        toast.success("Folder renamed successfully");
        await fetchItems(currentFolderId);
        return true;
      } catch (err) {
        const message = err?.message || "Failed to rename folder";
        setError(message);
        toast.error(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [currentFolderId, fetchItems]
  );

  /**
   * Delete a folder
   */
  const deleteFolder = useCallback(
    async (id) => {
      setIsLoading(true);
      setError(null);
      try {
        folderStorage.deleteFolder(id);
        toast.success("Folder deleted successfully");
        await fetchItems(currentFolderId);
        return true;
      } catch (err) {
        const message = err?.message || "Failed to delete folder";
        setError(message);
        toast.error(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [currentFolderId, fetchItems]
  );

  /**
   * Move a folder
   */
  const moveFolder = useCallback(
    async (id, targetParentId) => {
      setIsLoading(true);
      setError(null);
      try {
        folderStorage.moveFolder(id, targetParentId);
        toast.success("Folder moved successfully");
        await fetchItems(currentFolderId);
        return true;
      } catch (err) {
        const message = err?.message || "Failed to move folder";
        setError(message);
        toast.error(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [currentFolderId, fetchItems]
  );

  /**
   * Rename a file
   * Note: If your API supports file rename via PATCH /api/v1/uploads/:id
   * with { originalName: newName }, implement it here
   */
  const renameFile = useCallback(
    async (id, newName) => {
      setIsLoading(true);
      setError(null);
      try {
        // Try to update via API if it supports rename
        try {
          await uploadService.getUploadById(id); // Check if file exists
          // If your API supports rename, uncomment and implement:
          // await makeRequest(`/api/v1/uploads/${id}`, {
          //   method: "PATCH",
          //   body: JSON.stringify({ originalName: newName }),
          // });

          // For now, store rename in localStorage as metadata
          const fileRenames = JSON.parse(
            localStorage.getItem("file_renames") || "{}"
          );
          fileRenames[id] = newName;
          localStorage.setItem("file_renames", JSON.stringify(fileRenames));

          toast.success("File renamed (stored locally)");
        } catch {
          toast.info("File rename stored locally (API rename not available)");
        }
        await fetchItems(currentFolderId);
        return true;
      } catch (err) {
        const message = err?.message || "Failed to rename file";
        setError(message);
        toast.error(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [currentFolderId, fetchItems]
  );

  /**
   * Move a file
   * Stores folder mapping in localStorage
   */
  const moveFile = useCallback(
    async (id, targetFolderId) => {
      setIsLoading(true);
      setError(null);
      try {
        // Store folder mapping in localStorage
        const fileMappings = JSON.parse(
          localStorage.getItem("file_folder_mappings") || "{}"
        );
        fileMappings[id] = targetFolderId;
        localStorage.setItem(
          "file_folder_mappings",
          JSON.stringify(fileMappings)
        );
        toast.success("File moved successfully");
        await fetchItems(currentFolderId);
        return true;
      } catch (err) {
        const message = err?.message || "Failed to move file";
        setError(message);
        toast.error(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [currentFolderId, fetchItems]
  );

  /**
   * Delete a file
   */
  const deleteFile = useCallback(
    async (id) => {
      setIsLoading(true);
      setError(null);
      try {
        await uploadService.deleteUpload(id);
        toast.success("File deleted successfully");
        await fetchItems(currentFolderId);
        return true;
      } catch (err) {
        const message = err?.message || "Failed to delete file";
        setError(message);
        toast.error(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [currentFolderId, fetchItems]
  );

  /**
   * Upload files to current folder
   */
  const uploadFiles = useCallback(
    async (files) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await uploadService.uploadFiles(files);

        // Extract files from response - handle different response structures
        let uploadedFiles = [];
        if (Array.isArray(response)) {
          uploadedFiles = response;
        } else if (Array.isArray(response.files)) {
          uploadedFiles = response.files;
        } else if (Array.isArray(response.data)) {
          uploadedFiles = response.data;
        } else if (response.data && Array.isArray(response.data.files)) {
          uploadedFiles = response.data.files;
        }

        // If upload was successful and we have a current folder,
        // store the mapping in localStorage
        if (currentFolderId && uploadedFiles.length > 0) {
          const fileMappings = JSON.parse(
            localStorage.getItem("file_folder_mappings") || "{}"
          );

          uploadedFiles.forEach((file) => {
            // Handle different file ID field names
            const fileId = file.id || file.uploadId || file._id;
            if (fileId) {
              fileMappings[fileId] = currentFolderId;
            }
          });

          localStorage.setItem(
            "file_folder_mappings",
            JSON.stringify(fileMappings)
          );
        }

        if (uploadedFiles.length > 0 || response.success) {
          toast.success(
            response.message || `${files.length} file(s) uploaded successfully`
          );
          await fetchItems(currentFolderId);
          return uploadedFiles;
        }
        throw new Error(response.message || "Upload failed");
      } catch (err) {
        const message = err?.message || "Failed to upload files";
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [currentFolderId, fetchItems]
  );

  // Initialize - fetch root items
  useEffect(() => {
    fetchItems(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    items,
    isLoading,
    error,
    currentFolderId,
    breadcrumbs,
    viewMode,
    setViewMode,
    fetchItems,
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
  };
}
