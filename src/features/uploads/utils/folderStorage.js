/**
 * Client-side folder storage utility
 * Stores folder structure in localStorage since there's no folder API
 */

const STORAGE_KEY = "file_manager_folders";

export const folderStorage = {
  /**
   * Get all folders
   */
  getFolders() {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  /**
   * Save folders
   */
  saveFolders(folders) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(folders));
    } catch (error) {
      console.error("Failed to save folders:", error);
    }
  },

  /**
   * Create a new folder
   */
  createFolder(name, parentId = null) {
    const folders = this.getFolders();
    const newFolder = {
      id: `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      parentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      itemCount: 0,
    };
    folders.push(newFolder);
    this.saveFolders(folders);
    return newFolder;
  },

  /**
   * Get folders by parent
   */
  getFoldersByParent(parentId = null) {
    const folders = this.getFolders();
    return folders.filter((folder) => {
      if (parentId === null) return folder.parentId === null;
      return folder.parentId === parentId;
    });
  },

  /**
   * Get folder by ID
   */
  getFolderById(id) {
    const folders = this.getFolders();
    return folders.find((f) => f.id === id);
  },

  /**
   * Update folder
   */
  updateFolder(id, updates) {
    const folders = this.getFolders();
    const index = folders.findIndex((f) => f.id === id);
    if (index >= 0) {
      folders[index] = {
        ...folders[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.saveFolders(folders);
      return folders[index];
    }
    return null;
  },

  /**
   * Delete folder
   */
  deleteFolder(id) {
    const folders = this.getFolders();

    // Also delete child folders recursively
    const deleteChildren = (parentId) => {
      const children = folders.filter((f) => f.parentId === parentId);
      children.forEach((child) => {
        deleteChildren(child.id);
      });
    };
    deleteChildren(id);

    const filtered = folders.filter((f) => f.id !== id && f.parentId !== id);

    // Also remove all child folders
    const removeChildren = (parentId) => {
      return filtered.filter((f) => {
        if (f.parentId === parentId) {
          removeChildren(f.id);
          return false;
        }
        return true;
      });
    };

    const finalFolders = removeChildren(id);
    this.saveFolders(finalFolders);
  },

  /**
   * Move folder
   */
  moveFolder(id, newParentId) {
    return this.updateFolder(id, { parentId: newParentId });
  },

  /**
   * Get folder path (breadcrumb trail)
   */
  getFolderPath(folderId) {
    const path = [];
    let currentId = folderId;

    while (currentId) {
      const folder = this.getFolderById(currentId);
      if (folder) {
        path.unshift(folder);
        currentId = folder.parentId;
      } else {
        break;
      }
    }

    return path;
  },

  /**
   * Count items in folder (files will be counted separately)
   */
  updateFolderItemCount(folderId, count) {
    return this.updateFolder(folderId, { itemCount: count });
  },
};
