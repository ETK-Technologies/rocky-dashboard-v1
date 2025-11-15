# 📐 Project Structure - Rocky Dashboard

This document outlines the project structure and how to work with it.

## 🎯 Project Overview

**Framework**: Next.js 16 (App Router)  
**Language**: JavaScript  
**Styling**: TailwindCSS  
**Architecture**: Feature-based with shared components

## 📁 Directory Structure

```
rocky-dashboard-v1/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── dashboard/                # Dashboard pages
│   │   │   ├── [feature]/           # Feature pages
│   │   │   │   ├── page.jsx         # Page wrapper (thin)
│   │   │   │   ├── [id]/           # Dynamic routes
│   │   │   │   └── new/            # Create pages
│   │   │   └── layout.jsx          # Dashboard layout
│   │   ├── layout.jsx               # Root layout
│   │   └── page.jsx                 # Home page
│   │
│   ├── components/                   # Shared components
│   │   ├── ui/                      # Reusable UI components
│   │   │   ├── CustomButton.jsx
│   │   │   ├── CustomCard.jsx
│   │   │   ├── DataTable.jsx
│   │   │   ├── FormField.jsx
│   │   │   ├── PageContainer.jsx
│   │   │   ├── PageHeader.jsx
│   │   │   └── index.js            # Centralized exports
│   │   └── common/                  # Common components
│   │       ├── StatCard.jsx
│   │       ├── FolderCard.jsx
│   │       └── index.js
│   │
│   ├── features/                     # Feature modules
│   │   ├── products/
│   │   │   ├── components/          # Feature components
│   │   │   │   ├── Products.jsx
│   │   │   │   └── ProductForm.jsx
│   │   │   ├── hooks/               # Custom hooks
│   │   │   │   ├── useProducts.js
│   │   │   │   └── useProductForm.js
│   │   │   ├── services/            # API services
│   │   │   │   └── productService.js
│   │   │   └── index.js             # Public exports
│   │   ├── auth/
│   │   ├── categories/
│   │   └── ...
│   │
│   ├── lib/                          # Libraries
│   │   └── store/                   # Zustand stores
│   │       └── authStore.js
│   │
│   └── utils/                        # Utilities
│       ├── cn.js                    # className utility
│       └── makeRequest.js           # API request utility
│
├── public/                           # Static assets
├── package.json                      # Dependencies
├── next.config.js                    # Next.js config
├── tailwind.config.js                # Tailwind config
└── jsconfig.json                     # Path aliases
```

## 🎨 Component Architecture

### 1. Shared UI Components (`src/components/ui/`)

**Purpose**: Reusable components used across multiple features

**Examples**:
- `CustomButton` - Buttons with variants
- `CustomCard` - Card containers
- `DataTable` - Data tables
- `FormField` - Form inputs
- `PageContainer` - Page wrapper
- `PageHeader` - Page headers
- `LoadingState` - Loading indicators
- `ErrorState` - Error displays

**When to use**: Always check here first before creating new components

**How to import**:
```jsx
import {
  CustomButton,
  CustomCard,
  PageContainer,
  PageHeader,
} from "@/components/ui";
```

### 2. Common Components (`src/components/common/`)

**Purpose**: Common components that don't fit UI category

**Examples**:
- `StatCard` - Statistics cards
- `FolderCard` - Folder/item cards
- `ProtectedRoute` - Route protection

**How to import**:
```jsx
import { StatCard, FolderCard } from "@/components/common";
```

### 3. Feature Components (`src/features/[feature]/components/`)

**Purpose**: Feature-specific components

**Examples**:
- `Products.jsx` - Products list component
- `ProductForm.jsx` - Product form component
- `CategoryForm.jsx` - Category form component

**When to use**: Components specific to one feature

**How to import**:
```jsx
import { Products, ProductForm } from "@/features/products";
```

## 🏗️ Feature Structure

Each feature follows this structure:

```
src/features/[feature-name]/
├── components/           # Feature components
│   ├── FeatureList.jsx
│   └── FeatureForm.jsx
├── hooks/                # Custom hooks
│   ├── useFeature.js
│   └── useFeatureForm.js
├── services/             # API services
│   └── featureService.js
└── index.js              # Public exports
```

### Feature Index Pattern

```jsx
// src/features/[feature]/index.js

// Components
export { default as FeatureList } from "./components/FeatureList";
export { default as FeatureForm } from "./components/FeatureForm";

// Hooks
export { useFeature } from "./hooks/useFeature";
export { useFeatureForm } from "./hooks/useFeatureForm";

// Services
export { featureService } from "./services/featureService";
```

## 📄 Page Structure

### Page Files (`src/app/dashboard/[feature]/page.jsx`)

Pages are **thin wrappers** that:
1. Export metadata for SEO
2. Import and render feature components
3. Handle route-level concerns

**Pattern**:
```jsx
import { FeatureComponent } from "@/features/[feature]";

export const metadata = {
  title: "Feature | Dashboard",
  description: "Feature description",
};

export default function FeaturePage() {
  return <FeatureComponent />;
}
```

### Layout Files

**Root Layout** (`src/app/layout.jsx`):
- Global providers
- Global styles
- Toast container
- Theme provider

**Dashboard Layout** (`src/app/dashboard/layout.jsx`):
- Sidebar navigation
- Topbar
- Auth protection
- Dashboard-specific layout

## 🔄 Data Flow

```
Page (thin wrapper)
  ↓
Feature Component (UI)
  ↓
Custom Hook (business logic)
  ↓
Service (API calls)
  ↓
Backend API
```

### Example Flow

```jsx
// 1. Page (src/app/dashboard/products/page.jsx)
import { Products } from "@/features/products";
export default function ProductsPage() {
  return <Products />;
}

// 2. Component (src/features/products/components/Products.jsx)
import { useProducts } from "../hooks/useProducts";
export default function Products() {
  const { products, loading } = useProducts();
  // Render UI
}

// 3. Hook (src/features/products/hooks/useProducts.js)
import { productService } from "../services/productService";
export function useProducts() {
  const data = await productService.getAll();
  // Business logic
}

// 4. Service (src/features/products/services/productService.js)
import { makeRequest } from "@/utils/makeRequest";
export const productService = {
  getAll: () => makeRequest("/api/products"),
};
```

## 🎯 Import Paths

### Path Aliases (`jsconfig.json`)

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Import Patterns

```jsx
// Shared components
import { CustomButton } from "@/components/ui";

// Common components
import { StatCard } from "@/components/common";

// Features
import { Products, useProducts } from "@/features/products";

// Utils
import { cn } from "@/utils/cn";
import { makeRequest } from "@/utils/makeRequest";

// Stores
import { useAuthStore } from "@/lib/store/authStore";
```

## 🚀 Development Workflow

### 1. Creating a New Feature

```
1. Create feature structure
   src/features/[feature-name]/
   ├── components/
   ├── hooks/
   ├── services/
   └── index.js

2. Create service (API layer)
   src/features/[feature]/services/featureService.js

3. Create hook (business logic)
   src/features/[feature]/hooks/useFeature.js

4. Create component (UI)
   src/features/[feature]/components/Feature.jsx

5. Export from index.js
   src/features/[feature]/index.js

6. Create page wrapper
   src/app/dashboard/[feature]/page.jsx
```

### 2. Creating a Shared Component

```
1. Check if component exists
   src/components/ui/

2. Create component
   src/components/ui/ComponentName.jsx

3. Export from index.js
   src/components/ui/index.js

4. Use in features
   import { ComponentName } from "@/components/ui";
```

### 3. Creating a Feature Component

```
1. Check if shared component exists
   src/components/ui/

2. Create feature component
   src/features/[feature]/components/ComponentName.jsx

3. Use shared components
   import { CustomButton } from "@/components/ui";

4. Export from feature index.js
   src/features/[feature]/index.js
```

## 📋 Best Practices

### ✅ Do

1. **Use shared components first**
   - Always check `src/components/ui` before creating new components
   - Use shared components whenever possible

2. **Keep pages thin**
   - Pages should be simple wrappers
   - No business logic in pages
   - Import feature components

3. **Separate concerns**
   - Services: API calls
   - Hooks: Business logic
   - Components: UI presentation

4. **Export from index.js**
   - All features export from `index.js`
   - All shared components export from `index.js`
   - Clean imports

5. **Use path aliases**
   - Use `@/` for imports
   - Consistent import paths

### ❌ Don't

1. **Don't create duplicate components**
   - Check if component exists first
   - Use shared components

2. **Don't put business logic in pages**
   - Use hooks for business logic
   - Keep pages thin

3. **Don't mix server and client code**
   - Use `"use client"` for client components
   - Server components by default

4. **Don't forget error handling**
   - Always handle errors
   - Use ErrorState component
   - Show user-friendly messages

5. **Don't skip loading states**
   - Use LoadingState component
   - Show loading indicators
   - Better UX

## 🎨 Styling Guidelines

### TailwindCSS

- Use Tailwind classes
- Use `cn` utility for conditional classes
- Follow design system
- Consistent spacing and colors

### Component Styling

```jsx
import { cn } from "@/utils/cn";

export function CustomButton({ className, variant, ...props }) {
  return (
    <button
      className={cn(
        "base-styles",
        variant === "primary" && "primary-styles",
        className
      )}
      {...props}
    />
  );
}
```

## 🔍 Code Organization

### File Naming

- **Components**: PascalCase (`ProductCard.jsx`)
- **Hooks**: camelCase with "use" (`useProducts.js`)
- **Services**: camelCase (`productService.js`)
- **Utils**: camelCase (`cn.js`)

### Folder Organization

- One component per file
- Related components in same directory
- Clear folder structure
- Exports via `index.js`

## 📚 Documentation

- **DEVELOPMENT_GUIDE.md**: Comprehensive development guide
- **QUICK_REFERENCE.md**: Quick reference for common patterns
- **COMPONENTS.md**: Component documentation
- **PROJECT_OVERVIEW.md**: Project overview

## 🎯 Key Principles

1. **Feature-Based Architecture**: Organize by features, not by file type
2. **Shared Components First**: Always check shared components before creating new ones
3. **Thin Pages**: Pages should be simple wrappers
4. **Separation of Concerns**: Services → Hooks → Components
5. **Next.js Best Practices**: Server/Client components, metadata, routing
6. **Clean Imports**: Use centralized exports via `index.js`
7. **Error Handling**: Always handle errors and show loading states

## 🚀 Next Steps

1. Read **DEVELOPMENT_GUIDE.md** for detailed guidelines
2. Check **QUICK_REFERENCE.md** for common patterns
3. Review **COMPONENTS.md** for component documentation
4. Follow the patterns in existing features
5. Use shared components whenever possible

---

**Remember**: Always check `src/components/ui` before creating new components! 🎨

