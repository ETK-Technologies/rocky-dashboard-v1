# 🚀 Quick Setup Guide

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

The `.env.local` file has been created with default settings:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

**Important:** Update this URL to match your backend API server.

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### 4. Login

Navigate to `/login` or the app will redirect you automatically.

**Demo Credentials:**

- Email: `admin@rocky.com`
- Password: `admin123`

## 📱 Testing the Application

### Login Flow

1. Open [http://localhost:3000](http://localhost:3000)
2. You'll be redirected to `/login`
3. Enter the demo credentials
4. Click "Sign In"
5. Upon successful authentication, you'll be redirected to `/dashboard`

### Dashboard Features

- **Main Dashboard**: Overview with stats and quick actions
- **Products Page**: Empty state ready for product management
- **Orders Page**: Empty state ready for order management
- **Settings Page**: Basic settings placeholder
- **Logout**: Click the logout icon in the topbar

### Mobile Responsiveness

- Sidebar collapses on mobile
- Toggle menu using the hamburger icon in the topbar
- Fully responsive design tested on mobile, tablet, and desktop

## 🔧 Backend API Requirements

Your backend API must support the following endpoint:

### Login Endpoint

```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@rocky.com",
  "password": "admin123"
}
```

### Expected Response

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_123",
    "email": "admin@rocky.com",
    "firstName": "Admin",
    "lastName": "User",
    "avatar": null
  }
}
```

### Error Response (401)

```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

## 🎨 Customization

### Colors

Edit `src/app/globals.css` to customize the color scheme:

```css
:root {
  --primary: 207 69% 44%; /* #2271b1 - WordPress blue */
  --background: 245 246 248; /* #F5F6F8 */
  /* ... more colors */
}
```

### Logo

Edit `src/components/layout/Sidebar.jsx` line 42 to change the logo text.

### Navigation Items

Edit `src/components/layout/Sidebar.jsx` lines 10-15 to customize sidebar navigation.

## 📁 Adding New Features

### Example: Adding a "Users" Feature

1. **Create the feature structure:**

```bash
mkdir -p src/features/users/{components,hooks,services,utils}
```

2. **Create the service:**

```javascript
// src/features/users/services/userService.js
import { makeRequest } from "@/utils/makeRequest";

export const userService = {
  async getAll() {
    return await makeRequest("/api/v1/users");
  },
};
```

3. **Create a page:**

```javascript
// src/app/dashboard/users/page.jsx
"use client";

export default function UsersPage() {
  return <div>Users Page</div>;
}
```

4. **Add to navigation:**

```javascript
// In src/components/layout/Sidebar.jsx
import { Users } from "lucide-react";

const navigation = [
  // ... existing items
  { name: "Users", href: "/dashboard/users", icon: Users },
];
```

## 🔐 Adding Protected API Calls

To add authentication headers to API requests:

```javascript
// src/utils/makeRequest.js
import { authStorage } from "@/features/auth";

export async function makeAuthenticatedRequest(endpoint, options = {}) {
  const token = authStorage.getAccessToken();

  return makeRequest(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}
```

## 🐛 Troubleshooting

### "Module not found" errors

```bash
npm install
```

### Tailwind styles not working

```bash
npm run dev
# Stop and restart the dev server
```

### API connection issues

- Check that `NEXT_PUBLIC_API_BASE_URL` is correct
- Ensure your backend is running
- Check browser console for CORS errors

### Login redirects to login page

- Clear localStorage: `localStorage.clear()`
- Check that your backend returns the correct response format

## 📚 Next Steps

Now that your dashboard is running, consider adding:

1. ✅ Refresh token handling
2. ✅ Logout API endpoint integration
3. ✅ Products CRUD operations
4. ✅ Orders management
5. ✅ User profile editing
6. ✅ Role-based permissions
7. ✅ Form components for data entry
8. ✅ Data tables with sorting/filtering
9. ✅ File upload functionality
10. ✅ Charts and analytics

Happy coding! 🎉
