# Rocky Dashboard - Next.js 16

A modern, WordPress-style admin dashboard built with Next.js 16, featuring authentication, beautiful UI, and a modular architecture.

## 🚀 Features

- ✅ **Next.js 16** with App Router
- ✅ **Authentication** - Login with email/password
- ✅ **WordPress-inspired Design** - Familiar and professional UI
- ✅ **Modular Architecture** - Features-based folder structure
- ✅ **Form Validation** - React Hook Form + Zod
- ✅ **Toast Notifications** - React Toastify integration
- ✅ **Responsive Layout** - Mobile-friendly sidebar and navigation
- ✅ **TypeScript-free** - Pure JavaScript implementation
- ✅ **TailwindCSS** - Utility-first styling
- ✅ **shadcn/ui** - Beautiful, accessible components

## 📂 Project Structure

```
src/
├── app/
│   ├── layout.jsx              # Root layout with ToastContainer
│   ├── page.jsx                # Home page (redirects to login)
│   ├── globals.css             # Global styles and theme
│   ├── login/
│   │   └── page.jsx           # Login page
│   └── dashboard/
│       ├── layout.jsx         # Dashboard layout with auth protection
│       ├── page.jsx           # Dashboard home
│       ├── products/
│       │   └── page.jsx       # Products page
│       ├── orders/
│       │   └── page.jsx       # Orders page
│       └── settings/
│           └── page.jsx       # Settings page
│
├── features/
│   └── auth/
│       ├── components/
│       │   └── LoginForm.jsx  # Login form component
│       ├── hooks/
│       │   └── useLogin.js    # Login hook with validation
│       ├── services/
│       │   └── authService.js # Auth API calls
│       ├── utils/
│       │   └── authStorage.js # LocalStorage management
│       └── index.js           # Feature exports
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx        # Dashboard sidebar navigation
│   │   ├── Topbar.jsx         # Top navigation bar
│   │   └── MainWrapper.jsx    # Main content wrapper
│   └── ui/
│       ├── Button.jsx         # Button component
│       ├── Input.jsx          # Input component
│       ├── Card.jsx           # Card components
│       ├── Label.jsx          # Label component
│       └── EmptyState.jsx     # Empty state component
│
└── utils/
    ├── makeRequest.js         # HTTP request utility
    └── cn.js                  # Class name utility
```

## 🛠️ Installation

1. **Install dependencies:**

```bash
npm install
```

2. **Configure environment variables:**
   Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

3. **Run development server:**

```bash
npm run dev
```

4. **Open your browser:**
   Visit [http://localhost:3000](http://localhost:3000)

## 🔐 Authentication

### API Endpoint

```
POST ${NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/login
```

### Demo Credentials

```
Email: admin@rocky.com
Password: admin123
```

### Request Body

```json
{
  "email": "admin@rocky.com",
  "password": "admin123"
}
```

### Success Response

```json
{
  "access_token": "...",
  "refresh_token": "...",
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

## 🎨 Design System

### Colors

- **Background**: `#F5F6F8`
- **Card**: White (`#FFFFFF`)
- **Primary/Accent**: `#2271b1` (WordPress blue)
- **Sidebar**: `#1d2327` (Dark gray)
- **Text**: `#1d2327`

### Components

All UI components are built with TailwindCSS and follow shadcn/ui design patterns.

## 🧩 Features in Detail

### Authentication Flow

1. User enters credentials on `/login` page
2. Form validates using Zod schema
3. API call via `authService.login()`
4. Tokens and user data stored in localStorage via `authStorage`
5. Success toast notification
6. Redirect to `/dashboard`

### Auth Protection

- Dashboard layout checks for authentication on mount
- Redirects to `/login` if no access token found
- Tokens stored in localStorage

### Logout Flow

1. User clicks logout button in topbar
2. Auth data cleared from localStorage
3. Info toast notification
4. Redirect to `/login`

## 📦 Dependencies

### Core

- `next` - Next.js framework
- `react` - React library
- `react-dom` - React DOM

### UI & Styling

- `tailwindcss` - Utility-first CSS
- `lucide-react` - Icon library
- `classnames` - Conditional classes
- `clsx` - Class names utility
- `tailwind-merge` - Merge Tailwind classes

### Forms & Validation

- `react-hook-form` - Form management
- `zod` - Schema validation
- `@hookform/resolvers` - Form resolvers

### Notifications

- `react-toastify` - Toast notifications

## 🚧 Next Steps

This dashboard is ready for expansion. Consider adding:

1. **Refresh Token Handling** - Auto-refresh expired tokens
2. **Logout API Call** - Backend logout endpoint
3. **Products CRUD** - Full product management
4. **Orders Management** - Order tracking and fulfillment
5. **User Profile** - Edit profile and settings
6. **Role-based Access** - Different user permissions
7. **API Error Handling** - Better error boundaries
8. **Loading States** - Skeleton screens
9. **Dark Mode** - Theme toggling
10. **Analytics** - Dashboard metrics

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🤝 Contributing

This is a template project. Feel free to customize and extend it for your needs.

## 📄 License

MIT License - Feel free to use this project for personal or commercial purposes.

---

Built with ❤️ using Next.js 16
