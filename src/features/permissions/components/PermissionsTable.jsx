"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit, Search, Plus, Key, Filter, X } from "lucide-react";
import {
    CustomButton,
    CustomInput,
    DataTable,
    CustomBadge,
    IconButton,
    ErrorState,
    LoadingState,
} from "@/components/ui";
import { useAdminPermissions } from "../hooks/useAdminPermissions";

export function PermissionsTable() {
    const router = useRouter();
    const {
        permissions,
        isLoading,
        error,
        params,
        setSearch,
        setResource,
        setAction,
    } = useAdminPermissions();

    const [showFilters, setShowFilters] = useState(false);

    // Get unique resources and actions for filters
    const uniqueResources = [
        ...new Set(permissions.map((p) => p.resource).filter(Boolean)),
    ].sort();
    const uniqueActions = [
        ...new Set(permissions.map((p) => p.action).filter(Boolean)),
    ].sort();

    const hasActiveFilters = params.search || params.resource || params.action;

    const handleClearFilters = () => {
        setSearch("");
        setResource("");
        setAction("");
    };

    // Table columns
    const columns = [
        {
            key: "name",
            label: "Permission Name",
            width: "250px",
            render: (permission) => (
                <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">
                        {permission.name}
                    </span>
                </div>
            ),
        },
        {
            key: "slug",
            label: "Slug",
            width: "200px",
            render: (permission) => (
                <span className="text-sm text-muted-foreground font-mono">
                    {permission.slug}
                </span>
            ),
        },
        {
            key: "resource",
            label: "Resource",
            width: "150px",
            render: (permission) => (
                <CustomBadge variant="outline">
                    {permission.resource}
                </CustomBadge>
            ),
        },
        {
            key: "action",
            label: "Action",
            width: "120px",
            render: (permission) => (
                <CustomBadge variant="secondary">
                    {permission.action}
                </CustomBadge>
            ),
        },
        {
            key: "description",
            label: "Description",
            width: "300px",
            truncate: true,
            render: (permission) => (
                <span className="text-sm text-muted-foreground">
                    {permission.description || "-"}
                </span>
            ),
        },
    ];

    const renderActions = (permission) => (
        <div
            className="flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
        >
            <IconButton
                icon={Edit}
                label="Edit"
                variant="ghost"
                size="sm"
                onClick={() =>
                    router.push(
                        `/dashboard/roles-permissions/permissions/${permission.id}`
                    )
                }
            />
        </div>
    );

    if (!isLoading && error) {
        return (
            <ErrorState
                title="Failed to load permissions"
                message={error}
                action={
                    <CustomButton onClick={() => window.location.reload()}>
                        Retry
                    </CustomButton>
                }
            />
        );
    }

    if (isLoading) {
        return <LoadingState loading={isLoading} fullScreen={true} />;
    }

    return (
        <div className="space-y-4">
            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <CustomInput
                        type="text"
                        placeholder="Search permissions..."
                        value={params.search || ""}
                        onChange={(e) => setSearch(e.target.value)}
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
                        {hasActiveFilters && (
                            <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                                {
                                    [
                                        params.search,
                                        params.resource,
                                        params.action,
                                    ].filter(Boolean).length
                                }
                            </span>
                        )}
                    </CustomButton>
                    <CustomButton
                        onClick={() =>
                            router.push(
                                "/dashboard/roles-permissions/permissions/new"
                            )
                        }
                        className="flex items-center gap-2"
                        size="sm"
                    >
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Add Permission</span>
                        <span className="sm:hidden">Add</span>
                    </CustomButton>
                </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="p-4 bg-card rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium">Filters</h3>
                        <button
                            onClick={() => setShowFilters(false)}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Resource
                            </label>
                            <select
                                value={params.resource || ""}
                                onChange={(e) => setResource(e.target.value)}
                                className="flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors bg-white text-gray-900 border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-900"
                            >
                                <option value="">All Resources</option>
                                {uniqueResources.map((resource) => (
                                    <option key={resource} value={resource}>
                                        {resource}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Action
                            </label>
                            <select
                                value={params.action || ""}
                                onChange={(e) => setAction(e.target.value)}
                                className="flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors bg-white text-gray-900 border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 focus-visible:border-blue-500 dark:focus-visible:border-blue-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-900"
                            >
                                <option value="">All Actions</option>
                                {uniqueActions.map((action) => (
                                    <option key={action} value={action}>
                                        {action}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <div className="mt-4">
                            <CustomButton
                                onClick={handleClearFilters}
                                variant="outline"
                                size="sm"
                            >
                                Clear Filters
                            </CustomButton>
                        </div>
                    )}
                </div>
            )}

            {/* Permissions Table */}
            <DataTable
                columns={columns}
                data={Array.isArray(permissions) ? permissions : []}
                renderActions={renderActions}
                loading={isLoading}
                emptyState={{
                    icon: Key,
                    title: "No permissions found",
                    description: hasActiveFilters
                        ? "No permissions match your current filters. Try adjusting your search or filter criteria."
                        : "Get started by creating your first permission.",
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
                            onClick={() =>
                                router.push(
                                    "/dashboard/roles-permissions/permissions/new"
                                )
                            }
                            className="flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add Your First Permission
                        </CustomButton>
                    ),
                }}
            />
        </div>
    );
}
