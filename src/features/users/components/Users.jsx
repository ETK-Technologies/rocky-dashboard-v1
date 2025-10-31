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
  Users as UsersIcon,
  Shield,
  Crown,
  User as UserIcon,
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
} from "@/components/ui";
import { useUsers } from "../hooks/useUsers";
import { APP_ROLES } from "../utils/roleMap";

export default function Users() {
  const router = useRouter();
  const {
    users,
    isLoading,
    error,
    params,
    pagination,
    setSearch,
    setRole,
    setActive,
    setSort,
    setLimit,
    nextPage,
    prevPage,
    deleteUser,
  } = useUsers();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Handle delete confirmation
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete.id);
        setDeleteDialogOpen(false);
        setUserToDelete(null);
      } catch (error) {
        // Error is already handled in the hook
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  // Get role badge variant
  const getRoleBadgeVariant = (role) => {
    const r = (role || "").toLowerCase();
    if (r === "super_admin") return "default";
    if (r === "admin") return "secondary";
    return "outline";
  };

  // Format role display
  const formatRole = (role) => {
    const r = (role || "").toLowerCase();
    if (r === "super_admin") return "Super Admin";
    if (r === "admin") return "Admin";
    return "User";
  };

  // Get status badge variant
  const getStatusBadgeVariant = (isActive) => {
    return isActive ? "default" : "secondary";
  };

  // Table columns
  const columns = [
    {
      key: "avatar",
      label: "Avatar",
      width: "80px",
      render: (user) => (
        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <UserIcon className="h-6 w-6 text-gray-400" />
          )}
        </div>
      ),
    },
    {
      key: "name",
      label: "User",
      width: "250px",
      truncate: true,
      render: (user) => (
        <div className="flex flex-col">
          <div
            className="font-medium text-foreground truncate"
            data-tooltip-id="user-tooltip"
            data-tooltip-content={`${user.firstName} ${
              user.lastName || ""
            }`.trim()}
          >
            {`${user.firstName} ${user.lastName || ""}`.trim() || user.email}
          </div>
          <div
            className="text-sm text-muted-foreground truncate mt-0.5"
            data-tooltip-id="user-tooltip"
            data-tooltip-content={user.email}
          >
            {user.email}
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      width: "150px",
      render: (user) => {
        const role = user.role || "user";
        return (
          <CustomBadge variant={getRoleBadgeVariant(role)}>
            {formatRole(role)}
          </CustomBadge>
        );
      },
    },
    {
      key: "isActive",
      label: "Status",
      width: "120px",
      render: (user) => (
        <CustomBadge variant={getStatusBadgeVariant(user.isActive)}>
          {user.isActive ? "Active" : "Inactive"}
        </CustomBadge>
      ),
    },
    {
      key: "lastLoginAt",
      label: "Last Login",
      width: "150px",
      render: (user) => {
        if (!user.lastLoginAt)
          return <span className="text-sm text-muted-foreground">Never</span>;
        const date = new Date(user.lastLoginAt);
        return (
          <span className="text-sm text-muted-foreground">
            {date.toLocaleDateString()}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      label: "Created",
      width: "150px",
      render: (user) => {
        if (!user.createdAt)
          return <span className="text-sm text-muted-foreground">-</span>;
        const date = new Date(user.createdAt);
        return (
          <span className="text-sm text-muted-foreground">
            {date.toLocaleDateString()}
          </span>
        );
      },
    },
  ];

  // Render action buttons for each row
  const renderActions = (user) => (
    <div
      className="flex items-center gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      <div data-tooltip-id="user-tooltip" data-tooltip-content="Edit user">
        <IconButton
          icon={Edit}
          label="Edit"
          variant="ghost"
          size="sm"
          onClick={() =>
            router.push(`/dashboard/super-admin/users/${user.id}/edit`)
          }
        />
      </div>
      <div data-tooltip-id="user-tooltip" data-tooltip-content="Delete user">
        <IconButton
          icon={Trash2}
          label="Delete"
          variant="ghost"
          size="sm"
          onClick={() => handleDeleteClick(user)}
          className="text-red-600 hover:text-red-700 dark:text-red-400"
        />
      </div>
    </div>
  );

  // Check if filters are active
  const hasActiveFilters = params.search || params.role || params.isActive;

  // Handle clear filters
  const handleClearFilters = () => {
    setSearch("");
    setRole("");
    setActive("");
  };

  // Show error state if there's an error
  if (error && !isLoading) {
    return (
      <PageContainer>
        <PageHeader
          title="Users"
          description="Manage all users. Only super admins can access this section."
          action={
            <CustomButton
              onClick={() => router.push("/dashboard/super-admin/users/new")}
              className="flex items-center gap-2"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add User</span>
              <span className="sm:hidden">Add</span>
            </CustomButton>
          }
        />
        <ErrorState
          title="Failed to load users"
          message={error}
          action={
            <CustomButton onClick={() => window.location.reload()}>
              Retry
            </CustomButton>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Users"
        description="Manage all users. Only super admins can access this section."
        action={
          <CustomButton
            onClick={() => router.push("/dashboard/super-admin/users/new")}
            className="flex items-center gap-2"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add User</span>
            <span className="sm:hidden">Add</span>
          </CustomButton>
        }
      />

      {/* Search and Filter Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <CustomInput
            type="text"
            placeholder="Search users..."
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
            Filters
          </CustomButton>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-card rounded-lg border border-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <select
                value={params.role || ""}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground"
              >
                <option value="">All Roles</option>
                {APP_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {formatRole(r)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={params.isActive || ""}
                onChange={(e) => setActive(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Sort By</label>
              <select
                value={params.sortBy || "createdAt"}
                onChange={(e) => setSort(e.target.value, params.sortOrder)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground"
              >
                <option value="createdAt">Created Date</option>
                <option value="email">Email</option>
                <option value="firstName">First Name</option>
                <option value="lastName">Last Name</option>
                <option value="lastLoginAt">Last Login</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Order</label>
              <select
                value={params.sortOrder || "desc"}
                onChange={(e) => setSort(params.sortBy, e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
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

      {/* Users Table */}
      <DataTable
        columns={columns}
        data={Array.isArray(users) ? users : []}
        renderActions={renderActions}
        loading={isLoading}
        emptyState={{
          icon: UsersIcon,
          title: "No users found",
          description: hasActiveFilters
            ? "No users match your current filters. Try adjusting your search or filter criteria."
            : "Get started by creating your first user.",
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
              onClick={() => router.push("/dashboard/super-admin/users/new")}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Your First User
            </CustomButton>
          ),
        }}
      />

      {/* Pagination Info */}
      {pagination && pagination.total > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {users.length} of {pagination.total} users
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page</span>
            <select
              className="border rounded-md h-9 px-2 bg-white text-gray-900 border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
              value={params.limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <CustomButton
              size="sm"
              variant="outline"
              onClick={prevPage}
              disabled={params.offset === 0}
            >
              Prev
            </CustomButton>
            <CustomButton size="sm" variant="outline" onClick={nextPage}>
              Next
            </CustomButton>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <CustomConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        description={`Are you sure you want to delete "${
          userToDelete?.firstName && userToDelete?.lastName
            ? `${userToDelete.firstName} ${userToDelete.lastName}`
            : userToDelete?.email || "this user"
        }"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Tooltip */}
      <Tooltip
        id="user-tooltip"
        place="top"
        className="z-50 !bg-[#f1f2f4] !text-[#65758b] max-w-[300px] dark:!bg-gray-700 dark:!text-white !opacity-100 !max-w-xs !whitespace-normal !break-words "
      />
    </PageContainer>
  );
}
