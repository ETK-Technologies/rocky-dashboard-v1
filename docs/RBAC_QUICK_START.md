# RBAC Quick Start Guide

## 🚀 Quick Start

### 1. Login Flow (Automatic)

The login flow now automatically:
1. Authenticates with backend
2. Fetches user profile (including role)
3. Stores user data in Zustand + localStorage
4. Redirects to dashboard

**No changes needed** - existing login already integrated!

### 2. Protect a Page (Client-Side)

```javascript
"use client";

import ProtectedRoute from "@/components/common/ProtectedRoute";

export default function AdminPage() {
  return (
    <ProtectedRoute roles={["admin", "super_admin"]}>
      <div>Admin content here</div>
    </ProtectedRoute>
  );
}
```

### 3. Check User Role in Component

```javascript
"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";

export default function Dashboard() {
  const { user, isAdmin, isSuperAdmin } = useAuth();

  return (
    <div>
      <h1>Welcome, {user?.firstName}!</h1>
      
      {isAdmin() && <button>Admin Action</button>}
      {isSuperAdmin() && <button>Super Admin Action</button>}
    </div>
  );
}
```

### 4. Conditional Rendering

```javascript
import { AdminOnly, SuperAdminOnly } from "@/components/common/ProtectedRoute";

<AdminOnly>
  <AdminPanel />
</AdminOnly>

<SuperAdminOnly>
  <SuperAdminSettings />
</SuperAdminOnly>
```

### 5. Server-Side Protection (Middleware)

Already configured in `middleware.js` - routes are automatically protected based on role!

**Protected Routes:**
- `/dashboard/products/*` → admin+
- `/dashboard/categories/*` → admin+
- `/dashboard/admin` → admin+
- `/dashboard/super-admin` → super_admin only
- `/dashboard/settings` → super_admin only

## 🔑 User Roles

| Role | Access Level |
|------|--------------|
| `user` | Basic dashboard, profile |
| `admin` | + Products, Categories, Admin Panel |
| `super_admin` | + Full system access, Super Admin Panel |

## 📝 Common Patterns

### Pattern 1: Protected Page with Custom Loading

```javascript
<ProtectedRoute 
  roles={["admin"]} 
  loadingMessage="Verifying admin access..."
  fallback={<CustomLoader />}
>
  <AdminContent />
</ProtectedRoute>
```

### Pattern 2: Check Before Action

```javascript
const { canAccess } = useAuth();

const handleDelete = () => {
  if (!canAccess(["admin"])) {
    toast.error("Permission denied");
    return;
  }
  // Proceed with delete
};
```

### Pattern 3: Multiple Role Checks

```javascript
const { hasAnyRole } = useAuth();

if (hasAnyRole(["admin", "super_admin"])) {
  // Show admin features
}
```

## 🎯 Example Pages Created

Try these pages to see RBAC in action:

1. **Profile** (All users): `/dashboard/profile`
2. **Admin Panel** (Admin+): `/dashboard/admin`
3. **Super Admin** (Super Admin only): `/dashboard/super-admin`

## 🛠️ Available Hooks & Utilities

### useAuth Hook

```javascript
import { useAuth } from "@/features/auth/hooks/useAuth";

const {
  // State
  user,                    // Current user object
  isAuthenticated,         // Boolean
  isLoading,              // Boolean
  
  // Role checks
  isUser,                 // Function
  isAdmin,                // Function
  isSuperAdmin,           // Function
  hasRole,                // Function(role)
  hasAnyRole,             // Function(roles[])
  canAccess,              // Function(roles[])
  
  // Actions
  logout,                 // Function
  refreshProfile,         // Function
  
  // Utils
  getUserFullName,        // Function
  getRoleDisplayName,     // Function
} = useAuth();
```

### Components

```javascript
// Route protection (redirects)
import ProtectedRoute from "@/components/common/ProtectedRoute";

// Conditional rendering (no redirect)
import { 
  RoleGuard, 
  AdminOnly, 
  SuperAdminOnly 
} from "@/components/common/ProtectedRoute";
```

## 🔍 Testing Different Roles

To test different roles, login with different user accounts:

1. **User role**: Regular user account
2. **Admin role**: Admin account
3. **Super Admin role**: Super admin account

The backend `/api/v1/users/profile` endpoint should return the appropriate role.

## 🐛 Troubleshooting

### Problem: User role not showing

**Solution**: Check if backend returns `role` field in profile:
```bash
GET /api/v1/users/profile
Response: { ..., "role": "admin" }
```

### Problem: Redirected to login after successful login

**Solution**: Check browser console for errors. Ensure profile fetch is successful.

### Problem: Can't access admin pages

**Solution**: Verify your user has admin/super_admin role in the database.

## 📚 Full Documentation

For complete details, see `RBAC_IMPLEMENTATION.md`

## ⚡ Next Steps

1. Test the login flow
2. Try accessing `/dashboard/admin` as different roles
3. Check the Sidebar - admin links appear based on role
4. View Topbar - displays user role badge
5. Visit `/dashboard/profile` to see your permissions

---

**That's it!** 🎉 Your RBAC system is ready to use.

