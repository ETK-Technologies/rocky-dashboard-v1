# RBAC Setup Instructions

## 🎯 Prerequisites

1. Backend API running with the following endpoints:
   - `POST /api/v1/auth/login` - Login endpoint
   - `GET /api/v1/users/profile` - User profile endpoint (returns role)
   - `POST /api/v1/auth/logout` - Logout endpoint

2. Backend must return user role in profile response:
```json
{
  "id": "user_123",
  "email": "admin@rocky.com",
  "firstName": "Admin",
  "lastName": "User",
  "role": "admin",  // ← REQUIRED: user, admin, or super_admin
  "avatar": null
}
```

## 📦 Installation

All dependencies are already installed:
- ✅ `zustand` - State management
- ✅ `jwt-decode` - JWT token decoding
- ✅ `react-toastify` - Toast notifications

## 🚀 Quick Start

### Step 1: No Additional Configuration Needed!

The RBAC system is **already integrated** with your existing login flow. Just login and it works!

### Step 2: Test the Implementation

1. **Start your development server**:
```bash
npm run dev
```

2. **Login with different user roles**:
   - User with `role: "user"`
   - User with `role: "admin"`
   - User with `role: "super_admin"`

3. **Test protected routes**:
   - `/dashboard` - All authenticated users
   - `/dashboard/profile` - All authenticated users
   - `/dashboard/products` - Admin and Super Admin only
   - `/dashboard/categories` - Admin and Super Admin only
   - `/dashboard/admin` - Admin and Super Admin only
   - `/dashboard/super-admin` - Super Admin only

### Step 3: Verify Features

1. **Check Sidebar Navigation**:
   - Regular users: See "Files", "Profile", "Settings"
   - Admins: Also see "Categories", "Products", "Admin Panel"
   - Super Admins: Also see "Super Admin"

2. **Check Topbar**:
   - User name should display
   - Role badge should show (User/Admin/Super Admin)
   - Admin/Super Admin icons appear

3. **Test Access Control**:
   - Try accessing `/dashboard/admin` as regular user → Redirects to dashboard
   - Try accessing `/dashboard/super-admin` as admin → Redirects to dashboard
   - Access denied toast should appear

## 🔧 Customization

### Add New Protected Route

```javascript
// src/app/dashboard/my-feature/page.jsx
"use client";

import ProtectedRoute from "@/components/common/ProtectedRoute";

export default function MyFeaturePage() {
  return (
    <ProtectedRoute roles={["admin", "super_admin"]}>
      <div>My Feature Content</div>
    </ProtectedRoute>
  );
}
```

### Update Middleware Routes

Edit `middleware.js` to add new protected routes:

```javascript
const ROUTE_CONFIG = {
  // Add your custom routes
  admin: [
    "/dashboard/products",
    "/dashboard/categories",
    "/dashboard/my-feature", // ← Add here
  ],
};
```

### Add Role-Based UI Element

```javascript
import { useAuth } from "@/features/auth/hooks/useAuth";

function MyComponent() {
  const { isAdmin } = useAuth();

  return (
    <div>
      {isAdmin() && (
        <button>Admin Action</button>
      )}
    </div>
  );
}
```

## 🔑 Environment Variables

Make sure you have:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

(Or your backend API URL)

## 🧪 Testing Checklist

Use this checklist to verify everything works:

### Authentication
- [ ] Login works
- [ ] User profile is fetched after login
- [ ] User data persists after page refresh
- [ ] Logout clears all data
- [ ] Redirected to login when not authenticated

### Role-Based Access
- [ ] Regular users can access dashboard and profile
- [ ] Regular users CANNOT access products/categories
- [ ] Admins can access products and categories
- [ ] Admins can access admin panel
- [ ] Admins CANNOT access super admin panel
- [ ] Super admins can access everything

### UI Updates
- [ ] Sidebar shows role-appropriate menu items
- [ ] Topbar displays user name and role
- [ ] Admin/Super Admin badges appear in topbar
- [ ] Navigation links work correctly

### Notifications
- [ ] Login success toast shows with role
- [ ] Access denied toast shows for unauthorized access
- [ ] Logout success toast shows

### Edge Cases
- [ ] Middleware redirects unauthorized users
- [ ] ProtectedRoute shows loading state
- [ ] Token expiration handled gracefully
- [ ] Direct URL access is protected

## 🐛 Troubleshooting

### Issue: User role not showing after login

**Solution 1**: Check backend response
```bash
# Test the profile endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/users/profile
```

Make sure it returns the `role` field.

**Solution 2**: Check browser console
```javascript
// In browser console
localStorage.getItem('user')
```

Should show user data with role.

**Solution 3**: Force profile refresh
```javascript
import { useAuthStore } from '@/lib/store/authStore';

const { refreshProfile } = useAuthStore();
await refreshProfile();
```

### Issue: Middleware not protecting routes

**Cause**: Token might not be in cookies (middleware checks cookies first)

**Solution**: Token is in localStorage. Middleware will fall back to checking if user data exists. This is expected behavior.

**Alternative**: Update `authStorage.js` to also store token in cookies:

```javascript
// Add to authStorage.saveAuth()
document.cookie = `access_token=${data.access_token}; path=/; secure; samesite=strict`;
```

### Issue: "Module not found" errors

**Solution**: Restart dev server
```bash
# Stop the server (Ctrl+C)
# Restart
npm run dev
```

### Issue: Infinite redirect loop

**Cause**: Middleware and ProtectedRoute might be conflicting

**Solution**: Check middleware matcher in `middleware.js`:
```javascript
export const config = {
  matcher: [
    '/((?!api/v1|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
```

### Issue: Token expired

**Current Behavior**: User must login again

**Future Enhancement**: Implement automatic token refresh

## 📚 Documentation

- **Quick Start**: `RBAC_QUICK_START.md`
- **Full Documentation**: `RBAC_IMPLEMENTATION.md`
- **Summary**: `RBAC_SUMMARY.md`
- **This File**: `RBAC_SETUP_INSTRUCTIONS.md`

## 🎓 Learning Resources

### Understanding the Flow

1. **Login** → 
2. **Fetch Profile** → 
3. **Store in Zustand** → 
4. **Middleware Checks** → 
5. **Component Renders** → 
6. **Role-Based UI**

### Key Files to Understand

1. `src/lib/store/authStore.js` - State management
2. `src/features/auth/hooks/useAuth.js` - Auth utilities
3. `src/components/common/ProtectedRoute.jsx` - Route protection
4. `middleware.js` - Server-side protection

## 🚀 Deployment Notes

### Production Checklist

1. **Environment Variables**
   - [ ] Set `NEXT_PUBLIC_API_BASE_URL` to production API
   - [ ] Use HTTPS for API endpoints

2. **Security**
   - [ ] Ensure backend validates JWT signatures
   - [ ] Use secure cookies in production
   - [ ] Enable CORS properly
   - [ ] Rate limit authentication endpoints

3. **Performance**
   - [ ] Build and test production build
   ```bash
   npm run build
   npm run start
   ```

4. **Monitoring**
   - [ ] Log authentication failures
   - [ ] Monitor unauthorized access attempts
   - [ ] Track role distribution

### Recommended Production Enhancements

1. Store tokens in httpOnly cookies
2. Implement token refresh before expiration
3. Add rate limiting
4. Add session timeout
5. Log all role-based access

## 💡 Tips

1. **Use TypeScript**: Consider converting to TypeScript for better type safety

2. **Test Coverage**: Add tests for:
   - Role checking functions
   - Protected route components
   - Middleware logic

3. **Error Boundary**: Wrap ProtectedRoute with error boundary:
```javascript
<ErrorBoundary>
  <ProtectedRoute roles={["admin"]}>
    <AdminContent />
  </ProtectedRoute>
</ErrorBoundary>
```

4. **Performance**: Use React DevTools to check for unnecessary re-renders

5. **Accessibility**: Ensure error messages are accessible

## 🎉 You're All Set!

Your RBAC system is ready to use. Start by logging in with different user roles and exploring the features.

For questions or issues, refer to the comprehensive documentation in `RBAC_IMPLEMENTATION.md`.

---

**Need Help?**
- Check browser console for errors
- Review documentation files
- Verify backend API responses
- Test with different user roles

**Happy Coding!** 🚀

