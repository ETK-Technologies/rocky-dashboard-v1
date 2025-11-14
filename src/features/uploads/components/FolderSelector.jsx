"use client";

import { useState, useEffect, useMemo } from "react";
import { Folder, ChevronRight, Home, Loader2 } from "lucide-react";
import { CustomButton, CustomInput, LoadingState } from "@/components/ui";
import { uploadService } from "../services/uploadService";

export function FolderSelector({
    currentFolderId,
    excludeFolderId = null,
    excludeParentIds = [],
    onSelect,
    onCancel,
}) {
    const [allFolders, setAllFolders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFolderId, setSelectedFolderId] = useState(null);
    const [expandedFolders, setExpandedFolders] = useState(new Set());

    // Fetch all folders
    useEffect(() => {
        // Helper function to extract folders from API response
        const extractFolders = (response) => {
            if (Array.isArray(response?.folders)) {
                return response.folders;
            } else if (Array.isArray(response?.data)) {
                return response.data;
            } else if (Array.isArray(response)) {
                return response;
            } else if (response && typeof response === "object") {
                // Try to find any array property that might contain folders
                for (const key in response) {
                    if (
                        Array.isArray(response[key]) &&
                        key.toLowerCase().includes("folder")
                    ) {
                        return response[key];
                    }
                }
            }
            return [];
        };

        // Recursively fetch all folders
        const fetchAllFolders = async (
            parentId = null,
            visited = new Set()
        ) => {
            try {
                // Avoid fetching the same parent twice
                const key = parentId || "null";
                if (visited.has(key)) {
                    return [];
                }
                visited.add(key);

                const response = await uploadService.getFolders({
                    parentId: parentId,
                    limit: 100,
                    offset: 0,
                });

                console.log(
                    `FolderSelector - Fetching folders for parentId: ${parentId}`,
                    response
                );

                let folders = extractFolders(response);
                console.log(
                    `FolderSelector - Found ${folders.length} folders for parentId: ${parentId}`
                );

                // Handle pagination for this parent
                if (
                    response?.pagination &&
                    response.pagination.total > folders.length
                ) {
                    const totalPages = Math.ceil(
                        response.pagination.total / response.pagination.limit
                    );
                    const additionalPromises = [];

                    for (let page = 2; page <= totalPages; page++) {
                        additionalPromises.push(
                            uploadService.getFolders({
                                parentId: parentId,
                                limit: 1000,
                                offset: (page - 1) * response.pagination.limit,
                            })
                        );
                    }

                    if (additionalPromises.length > 0) {
                        const additionalResponses = await Promise.all(
                            additionalPromises
                        );
                        additionalResponses.forEach((additionalResponse) => {
                            const additionalFolders =
                                extractFolders(additionalResponse);
                            folders = [...folders, ...additionalFolders];
                        });
                    }
                }

                // Recursively fetch folders for each child folder
                const childFolders = folders.filter((f) => f.id);
                let allChildFolders = [];

                if (childFolders.length > 0) {
                    const childPromises = childFolders.map((folder) =>
                        fetchAllFolders(folder.id, visited)
                    );
                    const childResults = await Promise.all(childPromises);
                    // Flatten all child results
                    allChildFolders = childResults.flat();
                }

                // Return current folders + all child folders
                return [...folders, ...allChildFolders];
            } catch (err) {
                console.error(
                    `Failed to fetch folders for parentId ${parentId}:`,
                    err
                );
                return [];
            }
        };

        const fetchFolders = async () => {
            setIsLoading(true);
            try {
                // Start by fetching root folders (parentId: null), then recursively fetch all children
                const allFolders = await fetchAllFolders(null, new Set());

                // Remove duplicates by ID
                const uniqueFolders = Array.from(
                    new Map(
                        allFolders.map((folder) => [folder.id, folder])
                    ).values()
                );

                console.log(
                    "FolderSelector - Total folders fetched:",
                    uniqueFolders.length
                );
                console.log("FolderSelector - All folders:", uniqueFolders);

                setAllFolders(uniqueFolders);
            } catch (err) {
                console.error("Failed to fetch folders:", err);
                console.error("Error details:", err.message, err.data);
                setAllFolders([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFolders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Build folder tree structure
    const folderTree = useMemo(() => {
        if (!allFolders.length) return [];

        // Filter out excluded folders
        const filteredFolders = allFolders.filter(
            (folder) =>
                folder.id !== excludeFolderId &&
                !excludeParentIds.includes(folder.id) &&
                (!searchTerm ||
                    folder.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()))
        );

        // Build tree structure
        const buildTree = (parentId) => {
            return filteredFolders
                .filter((folder) => {
                    if (parentId === null) {
                        return (
                            folder.parentId === null ||
                            folder.parentId === undefined
                        );
                    }
                    return folder.parentId === parentId;
                })
                .map((folder) => ({
                    ...folder,
                    children: buildTree(folder.id),
                }))
                .sort((a, b) => a.name.localeCompare(b.name));
        };

        return buildTree(null);
    }, [allFolders, excludeFolderId, excludeParentIds, searchTerm]);

    // Toggle folder expansion
    const toggleExpand = (folderId) => {
        setExpandedFolders((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(folderId)) {
                newSet.delete(folderId);
            } else {
                newSet.add(folderId);
            }
            return newSet;
        });
    };

    // Get folder path
    const getFolderPath = (folderId) => {
        const path = [];
        let currentId = folderId;
        const folderMap = new Map(allFolders.map((f) => [f.id, f]));

        while (currentId) {
            const folder = folderMap.get(currentId);
            if (folder) {
                path.unshift(folder);
                currentId = folder.parentId;
            } else {
                break;
            }
        }

        return path;
    };

    // Render folder tree item
    const renderFolderItem = (folder, level = 0) => {
        const hasChildren = folder.children && folder.children.length > 0;
        const isExpanded = expandedFolders.has(folder.id);
        const isSelected = selectedFolderId === folder.id;
        const path = getFolderPath(folder.id);

        return (
            <div key={folder.id}>
                <div
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                            ? "bg-primary/10 border border-primary"
                            : "hover:bg-accent"
                    }`}
                    style={{ paddingLeft: `${level * 20 + 8}px` }}
                    onClick={() => setSelectedFolderId(folder.id)}
                >
                    {hasChildren ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(folder.id);
                            }}
                            className="p-0.5 hover:bg-accent rounded"
                        >
                            <ChevronRight
                                className={`h-4 w-4 transition-transform ${
                                    isExpanded ? "rotate-90" : ""
                                }`}
                            />
                        </button>
                    ) : (
                        <div className="w-5" />
                    )}
                    <Folder className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                    <span className="text-sm font-medium flex-1 truncate">
                        {folder.name}
                    </span>
                    {path.length > 0 && (
                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {path.map((p) => p.name).join(" / ")}
                        </span>
                    )}
                </div>
                {hasChildren && isExpanded && (
                    <div>
                        {folder.children.map((child) =>
                            renderFolderItem(child, level + 1)
                        )}
                    </div>
                )}
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <LoadingState
                    message="Loading folders..."
                    loading={isLoading}
                    fullScreen={true}
                />
            </div>
        );
    }

    // Show error state if folders failed to load
    if (allFolders.length === 0 && !isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-8">
                <Folder className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground mb-4">
                    No folders available. Create a folder first.
                </p>
                <CustomButton variant="outline" onClick={onCancel}>
                    Close
                </CustomButton>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Search */}
            <div className="mb-4">
                <CustomInput
                    type="text"
                    placeholder="Search folders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                />
            </div>

            {/* Root option */}
            <div
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors mb-2 ${
                    selectedFolderId === null
                        ? "bg-primary/10 border border-primary"
                        : "hover:bg-accent"
                }`}
                onClick={() => setSelectedFolderId(null)}
            >
                <Home className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Root</span>
            </div>

            {/* Folder Tree */}
            <div className="flex-1 overflow-y-auto border border-border rounded-lg p-2 max-h-[400px]">
                {folderTree.length > 0 ? (
                    folderTree.map((folder) => renderFolderItem(folder))
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">
                            {searchTerm
                                ? "No folders match your search"
                                : allFolders.length > 0
                                ? "All folders are excluded (cannot move into itself or descendants)"
                                : "No folders available"}
                        </p>
                        {allFolders.length > 0 && folderTree.length === 0 && (
                            <p className="text-xs mt-2 text-muted-foreground">
                                Try selecting Root to move the item to the root
                                folder.
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
                <CustomButton variant="outline" onClick={onCancel}>
                    Cancel
                </CustomButton>
                <CustomButton onClick={() => onSelect(selectedFolderId)}>
                    Move Here
                </CustomButton>
            </div>
        </div>
    );
}
