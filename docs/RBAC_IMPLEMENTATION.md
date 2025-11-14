# Role-Based Access Control (RBAC) Implementation Guide

## Overview

This document describes the complete RBAC (Role-Based Access Control) implementation for the Rocky Dashboard. The system provides both server-side and client-side protection for routes and components based on user roles.

## User Roles

The system supports three user roles with hierarchical permissions:

1. **user** - Basic user with limited access
2. **admin** - Administrator with extended permissions
3. **super_admin** - Super administrator with full system access

### Role Hierarchy

```
user (Level 1) < admin (Level 2) < super_admin (Level 3)
```

Higher-level roles automatically inherit permissions from lower-level roles.

## Architecture

### State Management

- **Zustand Store** (`src/lib/store/authStore.js`) - Manages authentication state and user data
- Persists user data to localStorage
- Provides role checking methods

### Authentication Flow

1. User logs in via `/login`
2. API returns access token and refresh token
3. System fetches user profile from `/api/v1/users/profile`
4. User data (including role) is stored in Zustand store and localStorage
5. User is redirected to dashboard

## Core Components

### 1. Zustand Auth Store

**Location**: `src/lib/store/authStore.js`

**Key Features**:
- User state management
- Role checking methods
- Token management
- Profile fetching

**Usage**:
```javascript
import { useAuthStore } from '@/lib/store/authStore';

function MyComponent() {
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
  
  if (isAdmin()) {
    // Admin-only functionality
  }
}
```

### 2. useAuth Hook

**Location**: `src/features/auth/hooks/useAuth.js`

**Key Features**:
- Wraps Zustand store with additional utilities
- Route protection helpers
- Token management
- Profile refresh

**Usage**:
```javascript
import { useAuth } from '@/features/auth/hooks/useAuth';

function MyComponent() {
  const {
    user,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    requireAuth,
    requireRole,
    logout,
  } = useAuth();
  
  // Check if user has specific role
  if (isAdmin()) {
    // Show admin features
  }
}
```

**Available Methods**:

| Method | Description |
|--------|-------------|
| `isUser()` | Check if user has 'user' role |
| `isAdmin()` | Check if user has 'admin' or 'super_admin' role |
| `isSuperAdmin()` | Check if user has 'super_admin' role |
| `hasRole(role)` | Check for specific role |
| `hasAnyRole(roles)` | Check if user has any of the specified roles |
| `isAuthorized(roles)` | Check if user can access resource requiring specific roles |
| `requireAuth()` | Require authentication, redirect if not authenticated |
| `requireRole(roles)` | Require specific role, redirect if unauthorized |

### 3. ProtectedRoute Component

**Location**: `src/components/common/ProtectedRoute.jsx`

**Purpose**: Client-side route protection

**Usage**:

```javascript
import ProtectedRoute from '@/components/common/ProtectedRoute';

export default function AdminPage() {
  return (
    <ProtectedRoute roles={["admin", "super_admin"]}>
      <div>Admin-only content</div>
    </ProtectedRoute>
  );
}
```

**Props**:

| Prop | Type | Description |
|------|------|-------------|
| `roles` | `string[]` | Required roles (empty = any authenticated user) |
| `redirectTo` | `string` | Redirect URL for unauthorized users (default: `/login`) |
| `loadingMessage` | `string` | Loading message |
| `fallback` | `ReactNode` | Custom loading component |
| `showAccessDenied` | `boolean` | Show toast notification (default: `true`) |

### 4. RoleGuard Components

**Purpose**: Conditionally render content based on role (no redirect)

**Available Components**:

#### RoleGuard
```javascript
import { RoleGuard } from '@/components/common/ProtectedRoute';

<RoleGuard roles={["admin"]} fallback={<div>Access Denied</div>}>
  <AdminFeature />
</RoleGuard>
```

#### AdminOnly
```javascript
import { AdminOnly } from '@/components/common/ProtectedRoute';

<AdminOnly fallback={<div>Admin Only</div>}>
  <AdminPanel />
</AdminOnly>
```

#### SuperAdminOnly
```javascript
import { SuperAdminOnly } from '@/components/common/ProtectedRoute';

<SuperAdminOnly>
  <SuperAdminPanel />
</SuperAdminOnly>
```

### 5. Next.js Middleware

**Location**: `middleware.js` (root level)

**Purpose**: Server-side route protection

**Protected Routes**:

| Route Pattern | Required Role |
|--------------|---------------|
| `/dashboard` | user |
| `/dashboard/products/*` | admin |
| `/dashboard/categories/*` | admin |
| `/dashboard/admin` | admin |
| `/dashboard/super-admin` | super_admin |
| `/dashboard/settings` | super_admin |
| `/dashboard/profile` | user |

**How it Works**:
1. Checks for access token in cookies or Authorization header
2. Decodes JWT to extract user role
3. Verifies user has required role for the route
4. Redirects unauthorized users to dashboard with error

**Public Routes** (no authentication required):
- `/login`
- `/` (home page)

## Implementation Examples

### Example 1: Protect an Entire Page

```javascript
// src/app/dashboard/admin/page.jsx
"use client";

import { ProtectedRoute } from '@/components/common';

export default function AdminPage() {
  return (
    <ProtectedRoute roles={["admin", "super_admin"]}>
      <div>
        <h1>Admin Panel</h1>
        {/* Admin content */}
      </div>
    </ProtectedRoute>
  );
}
```

### Example 2: Conditionally Render UI Elements

```javascript
"use client";

import { useAuth } from '@/features/auth/hooks/useAuth';
import { AdminOnly } from '@/components/common/ProtectedRoute';

export default function Dashboard() {
  const { isAdmin, user } = useAuth();

  return (
    <div>
      <h1>Welcome, {user?.firstName}</h1>
      
      {/* Show for all users */}
      <UserStats />
      
      {/* Only show for admins */}
      <AdminOnly>
        <AdminStats />
      </AdminOnly>
      
      {/* Conditional rendering */}
      {isAdmin() && (
        <button>Admin Action</button>
      )}
    </div>
  );
}
```

### Example 3: Protect API Actions

```javascript
"use client";

import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'react-toastify';

export default function DataTable() {
  const { isAdmin, canAccess } = useAuth();

  const handleDelete = async (id) => {
    // Check permission before action
    if (!canAccess(["admin", "super_admin"])) {
      toast.error("You don't have permission to delete items");
      return;
    }

    // Proceed with delete
    await deleteItem(id);
  };

  return (
    <div>
      {/* Show delete button only to admins */}
      {isAdmin() && (
        <button onClick={handleDelete}>Delete</button>
      )}
    </div>
  );
}
```

### Example 4: Role-Based Navigation

Already implemented in `src/features/dashboard/components/Sidebar.jsx`:

```javascript
const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { 
    name: "Products", 
    href: "/dashboard/products", 
    icon: Package,
    roles: ["admin", "super_admin"] // Only show to admins
  },
];
```

### Example 5: Higher-Order Component (HOC)

```javascript
import { withProtection } from '@/components/common/ProtectedRoute';

function AdminSettings() {
  return <div>Admin Settings</div>;
}

export default withProtection(AdminSettings, {
  roles: ["admin", "super_admin"],
  redirectTo: "/dashboard"
});
```

## Route Structure

```
/
├── login (public)
├── dashboard (user+)
│   ├── profile (user+)
│   ├── products (admin+)
│   │   ├── new (admin+)
│   │   └── [id]/edit (admin+)
│   ├── categories (admin+)
│   │   ├── new (admin+)
│   │   └── [id]/edit (admin+)
│   ├── admin (admin+)
│   ├── super-admin (super_admin)
│   └── settings (super_admin)
```

Legend: `user+` = user and above, `admin+` = admin and above

## Token Management

### Token Storage

Tokens are stored in localStorage:
- `access_token` - Short-lived access token
- `refresh_token` - Long-lived refresh token
- `user` - User profile data (including role)

### Token in Requests

The `makeRequest` utility automatically adds the Authorization header:

```javascript
import { makeRequest } from '@/utils/makeRequest';

// Token is automatically included
const data = await makeRequest('/api/v1/products', {
  method: 'GET'
});
```

## User Profile Structure

After successful login, the user profile is fetched from `/api/v1/users/profile` and includes:

```json
{
  "id": "user_123",
  "email": "admin@rocky.com",
  "firstName": "Admin",
  "lastName": "User",
  "role": "admin",
  "avatar": null
}
```

## Toast Notifications

The system uses `react-toastify` for user feedback:

- **Login Success**: "Welcome back, [Name] as [Role]!"
- **Logout Success**: "You have been logged out successfully"
- **Access Denied**: "You don't have permission to access this page"
- **Session Required**: "Please login to access this page"

## Best Practices

### 1. Always Use Both Server & Client Protection

```javascript
// ✅ GOOD: Protected on both server (middleware) and client (ProtectedRoute)
export default function AdminPage() {
  return (
    <ProtectedRoute roles={["admin"]}>
      <AdminContent />
    </ProtectedRoute>
  );
}

// ❌ BAD: Only client-side protection
export default function AdminPage() {
  const { isAdmin } = useAuth();
  if (!isAdmin()) return null;
  return <AdminContent />;
}
```

### 2. Check Permissions Before Actions

```javascript
// ✅ GOOD: Check permission before API call
const handleDelete = async () => {
  if (!canAccess(["admin"])) {
    toast.error("Permission denied");
    return;
  }
  await deleteItem();
};

// ❌ BAD: No permission check
const handleDelete = async () => {
  await deleteItem(); // Will fail on backend
};
```

### 3. Use Appropriate Components

- Use `ProtectedRoute` for entire pages
- Use `RoleGuard` for conditional rendering
- Use `useAuth` hooks for complex logic

### 4. Handle Loading States

```javascript
export default function MyPage() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) return <LoadingState />;
  if (!isAuthenticated) return <Redirect to="/login" />;

  return <PageContent />;
}
```

## Troubleshooting

### User Role Not Updating

If user role doesn't update after login:

```javascript
import { useAuthStore } from '@/lib/store/authStore';

const { refreshProfile } = useAuthStore();
await refreshProfile(); // Force profile refresh
```

### Middleware Not Working

1. Ensure token is in cookies (for SSR)
2. Check middleware matcher configuration
3. Verify JWT contains role field

### Protected Routes Not Working

1. Verify user is authenticated
2. Check user has correct role
3. Ensure `ProtectedRoute` is client component (`"use client"`)

## Testing

### Test Different Roles

```javascript
// Mock user with different roles for testing
import { useAuthStore } from '@/lib/store/authStore';

const { setUser } = useAuthStore();

// Test as admin
setUser({ ...userData, role: 'admin' });

// Test as super_admin
setUser({ ...userData, role: 'super_admin' });

// Test as regular user
setUser({ ...userData, role: 'user' });
```

## Security Notes

1. **Never trust client-side checks alone** - Always validate permissions on the backend
2. **JWT tokens should be validated** - Backend must verify token signature
3. **Roles should be in JWT claims** - For faster client-side checks
4. **Use HTTPS in production** - Protect tokens in transit
5. **Implement token refresh** - Handle expired tokens gracefully

## Migration from Old Auth System

If you were using the old `AuthContext`, here's how to migrate:

### Before (AuthContext)
```javascript
import { useAuth } from '@/features/auth/context/AuthContext';

const { user, isAuthenticated } = useAuth();
```

### After (Zustand + useAuth)
```javascript
import { useAuth } from '@/features/auth/hooks/useAuth';

const { user, isAuthenticated, isAdmin } = useAuth();
```

The API is mostly compatible, but now includes role-checking methods.

## API Reference

### useAuthStore

Direct access to Zustand store (use sparingly, prefer `useAuth` hook).

```javascript
import { useAuthStore } from '@/lib/store/authStore';

const store = useAuthStore();
```

### ROLES Constant

```javascript
import { ROLES } from '@/lib/store/authStore';

ROLES.USER // "user"
ROLES.ADMIN // "admin"
ROLES.SUPER_ADMIN // "super_admin"
```

## File Structure

```
src/
├── lib/
│   └── store/
│       └── authStore.js          # Zustand auth store
├── features/
│   └── auth/
│       ├── hooks/
│       │   ├── useAuth.js        # Main auth hook
│       │   ├── useLogin.js       # Login hook
│       │   └── useLogout.js      # Logout hook
│       ├── services/
│       │   └── authService.js    # Auth API calls
│       └── utils/
│           └── authStorage.js    # localStorage utilities
├── components/
│   └── common/
│       └── ProtectedRoute.jsx    # Route protection components
├── app/
│   └── dashboard/
│       ├── admin/
│       │   └── page.jsx          # Admin page
│       ├── super-admin/
│       │   └── page.jsx          # Super admin page
│       └── profile/
│           └── page.jsx          # User profile
└── middleware.js                 # Next.js middleware (root)
```

## Support

For issues or questions:
1. Check this documentation
2. Review example pages (`/dashboard/admin`, `/dashboard/super-admin`)
3. Inspect browser console for detailed error messages
4. Check backend API logs for authentication failures

---

**Last Updated**: 2025-10-30  
**Version**: 1.0.0  
**Next.js Version**: 16.0.0

