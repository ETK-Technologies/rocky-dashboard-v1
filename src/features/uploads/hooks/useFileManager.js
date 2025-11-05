"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import { uploadService } from "../services/uploadService";

export function useFileManager() {
  const [items, setItems] = useState([]); // Combined folders and files
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: "Root" }]);
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  /**
   * Build breadcrumbs from folder path
   * Returns array like: [Root, Parent1, Parent2, CurrentFolder]
   */
  const buildBreadcrumbs = useCallback(async (folderId) => {
    if (folderId === null || folderId === undefined) {
      return [{ id: null, name: "Root" }];
    }

    // Start with root
    const path = [{ id: null, name: "Root" }];
    const folderChain = [];
    let currentId = folderId;
    const visited = new Set(); // Prevent infinite loops

    // Build chain by traversing up the folder tree (from current to root)
    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);

      try {
        const folder = await uploadService.getFolderById(currentId);
        if (folder) {
          // Add current folder to chain (we'll reverse this later)
          folderChain.push({ id: folder.id, name: folder.name });

          // Move to parent
          currentId = folder.parentId;

          // If parent is null, we've reached root
          if (currentId === null || currentId === undefined) {
            break;
          }
        } else {
          break;
        }
      } catch (err) {
        console.error("Error building breadcrumbs:", err);
        break;
      }
    }

    // Reverse the chain so it goes: Root -> Parent1 -> Parent2 -> Current
    // folderChain is built from current to root, so reverse it
    const reversedChain = folderChain.reverse();

    // Combine: Root + reversed chain
    const fullPath = [...path, ...reversedChain];

    console.log("buildBreadcrumbs - folderId:", folderId, "path:", fullPath);
    return fullPath;
  }, []);

  /**
   * Fetch folders and files in current directory
   */
  const fetchItems = useCallback(async (folderId = null) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("fetchItems called with folderId:", folderId);

      // Fetch folders and files in parallel
      const [foldersResponse, filesResponse] = await Promise.all([
        uploadService.getFolders({
          parentId: folderId,
          limit: 100, // Get more folders per page
        }),
        uploadService.getUploads({
          folderId: folderId,
          limit: 100, // Get more files per page
        }),
      ]);

      console.log("fetchItems - foldersResponse:", foldersResponse);
      console.log("fetchItems - filesResponse:", filesResponse);

      // Extract folders from response
      let folders = [];
      if (Array.isArray(foldersResponse?.folders)) {
        folders = foldersResponse.folders;
      } else if (Array.isArray(foldersResponse)) {
        folders = foldersResponse;
      }

      // Client-side filter: Ensure folders match the requested parentId
      // This prevents showing folders in wrong locations due to API issues
      folders = folders.filter((folder) => {
        const folderParentId = folder.parentId;
        if (folderId === null) {
          // Root folder: only show folders with parentId === null or undefined
          return folderParentId === null || folderParentId === undefined;
        } else {
          // Child folder: only show folders with matching parentId
          return folderParentId === folderId;
        }
      });

      console.log("fetchItems - filtered folders:", folders);
      console.log(
        `fetchItems - Showing ${folders.length} folders for folderId: ${folderId}`
      );

      // Extract files from response
      let files = [];
      if (Array.isArray(filesResponse?.data)) {
        files = filesResponse.data;
      } else if (Array.isArray(filesResponse?.files)) {
        files = filesResponse.files;
      } else if (Array.isArray(filesResponse)) {
        files = filesResponse;
      }

      // Client-side filter: Ensure files match the requested folderId
      files = files.filter((file) => {
        const fileFolderId = file.folderId;
        if (folderId === null) {
          // Root folder: only show files with folderId === null or undefined
          return fileFolderId === null || fileFolderId === undefined;
        } else {
          // Child folder: only show files with matching folderId
          return fileFolderId === folderId;
        }
      });

      console.log("fetchItems - filtered files:", files);

      // Add type property and ensure itemCount is available
      const foldersWithType = folders.map((folder) => ({
        ...folder,
        type: "folder",
        itemCount:
          folder.itemCount || folder.filesCount + folder.foldersCount || 0,
      }));

      // Add type property to files
      // Apply client-side file renames if any (for display purposes)
      const fileRenames =
        typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem("file_renames") || "{}")
          : {};

      const filesWithType = files.map((file) => {
        const renamed = fileRenames[file.id];
        return {
          ...file,
          type: "file",
          // Apply rename for display if available
          ...(renamed && { displayName: renamed, originalName: renamed }),
        };
      });

      const allItems = [...foldersWithType, ...filesWithType];
      console.log("fetchItems - final items:", allItems);
      setItems(allItems);
    } catch (err) {
      const message = err?.message || "Failed to fetch items";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Navigate into a folder
   */
  const navigateToFolder = useCallback(
    async (folderId, folderName) => {
      setCurrentFolderId(folderId);

      // Update breadcrumbs
      const newBreadcrumbs = await buildBreadcrumbs(folderId);
      setBreadcrumbs(newBreadcrumbs);

      await fetchItems(folderId);
    },
    [fetchItems, buildBreadcrumbs]
  );

  /**
   * Navigate up (to parent folder)
   */
  const navigateUp = useCallback(async () => {
    if (breadcrumbs.length <= 1) return;

    // Get the parent breadcrumb (second to last)
    const newBreadcrumbs = breadcrumbs.slice(0, -1);
    const parentBreadcrumb = newBreadcrumbs[newBreadcrumbs.length - 1];

    if (!parentBreadcrumb) return;

    const targetFolderId = parentBreadcrumb.id;

    console.log("navigateUp - targetFolderId:", targetFolderId);
    console.log("navigateUp - newBreadcrumbs:", newBreadcrumbs);

    setCurrentFolderId(targetFolderId);

    // Use the existing breadcrumbs structure (already built correctly)
    // No need to rebuild - just use the slice we already have
    setBreadcrumbs(newBreadcrumbs);

    await fetchItems(targetFolderId);
  }, [breadcrumbs, fetchItems]);

  /**
   * Navigate to breadcrumb
   */
  const navigateToBreadcrumb = useCallback(
    async (index) => {
      const targetBreadcrumb = breadcrumbs[index];
      if (!targetBreadcrumb) return;

      const targetFolderId = targetBreadcrumb.id;
      setCurrentFolderId(targetFolderId);

      // Rebuild breadcrumbs to ensure consistency
      if (targetFolderId === null) {
        setBreadcrumbs([{ id: null, name: "Root" }]);
      } else {
        const rebuiltBreadcrumbs = await buildBreadcrumbs(targetFolderId);
        setBreadcrumbs(rebuiltBreadcrumbs);
      }

      await fetchItems(targetFolderId);
    },
    [breadcrumbs, fetchItems, buildBreadcrumbs]
  );

  /**
   * Create a new folder
   */
  const createFolder = useCallback(
    async (name, parentId = undefined) => {
      setIsLoading(true);
      setError(null);
      try {
        // If parentId is explicitly provided (including null for root), use it
        // Otherwise, use currentFolderId (which can be null for root)
        const targetParentId =
          parentId !== undefined ? parentId : currentFolderId;

        console.log("Creating folder:", {
          name,
          parentId,
          currentFolderId,
          targetParentId,
        });

        await uploadService.createFolder(name, targetParentId);
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
        await uploadService.renameFolder(id, newName);
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
        await uploadService.deleteFolder(id);
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
        await uploadService.moveFolder(id, targetParentId);
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
   * Note: The API spec doesn't explicitly include file rename endpoint,
   * so this functionality is stored locally as a fallback.
   * If the backend supports PATCH /api/v1/uploads/:id with { originalName },
   * it should be implemented in uploadService.
   */
  const renameFile = useCallback(
    async (id, newName) => {
      setIsLoading(true);
      setError(null);
      try {
        // Check if file exists
        await uploadService.getUploadById(id);

        // Store rename in localStorage as metadata (backend doesn't support rename per spec)
        // This is a client-side enhancement until backend adds rename support
        const fileRenames = JSON.parse(
          localStorage.getItem("file_renames") || "{}"
        );
        fileRenames[id] = newName;
        localStorage.setItem("file_renames", JSON.stringify(fileRenames));

        toast.success("File renamed (stored locally)");
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
   * Move a file to a folder (or root)
   */
  const moveFile = useCallback(
    async (id, targetFolderId) => {
      setIsLoading(true);
      setError(null);
      try {
        await uploadService.moveFileToFolder(id, targetFolderId);
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
        // move files to the current folder via API
        if (currentFolderId && uploadedFiles.length > 0) {
          const fileIds = uploadedFiles
            .map((file) => file.id || file.uploadId || file._id)
            .filter(Boolean);

          if (fileIds.length > 0) {
            try {
              await uploadService.bulkMoveFiles(fileIds, currentFolderId);
            } catch (moveErr) {
              // Log error but don't fail the upload
              console.error("Failed to move files to folder:", moveErr);
            }
          }
        }

        if (uploadedFiles.length > 0 || response.success) {
          toast.success(
            response.message ||
              `${uploadedFiles.length} file(s) uploaded successfully`
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

  /**
   * Get all folders for folder selector (flat list)
   * Used for move dialog
   */
  const getAllFolders = useCallback(async () => {
    try {
      const response = await uploadService.getFolders({
        limit: 1000, // Get all folders
      });

      if (Array.isArray(response?.folders)) {
        return response.folders;
      } else if (Array.isArray(response)) {
        return response;
      }
      return [];
    } catch (err) {
      console.error("Failed to fetch folders:", err);
      return [];
    }
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
    getAllFolders,
  };
}
