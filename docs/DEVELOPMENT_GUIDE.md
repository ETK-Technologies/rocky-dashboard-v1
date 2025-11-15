# 🚀 Development Guide - Rocky Dashboard

This guide explains the project structure, component architecture, and Next.js best practices for the Rocky Dashboard project.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard pages
│   │   ├── [feature]/    # Feature pages
│   │   │   └── page.jsx  # Page component (simple wrapper)
│   │   └── layout.jsx    # Dashboard layout
│   ├── layout.jsx        # Root layout
│   └── page.jsx          # Home page
│
├── components/            # Shared components
│   ├── ui/               # Reusable UI components
│   │   ├── CustomButton.jsx
│   │   ├── CustomCard.jsx
│   │   ├── DataTable.jsx
│   │   └── index.js      # Centralized exports
│   └── common/           # Common components
│       ├── StatCard.jsx
│       ├── FolderCard.jsx
│       └── index.js
│
├── features/             # Feature-based modules
│   ├── products/
│   │   ├── components/   # Feature-specific components
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # API services
│   │   └── index.js      # Public exports
│   └── auth/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── index.js
│
├── lib/                  # Libraries and stores
│   └── store/           # Zustand stores
│
└── utils/               # Utility functions
    ├── cn.js           # className utility
    └── makeRequest.js  # API request utility
```

## 🎯 Core Principles

### 1. Feature-Based Architecture
- Each feature is self-contained in `src/features/[feature-name]`
- Features have their own components, hooks, and services
- Features export via `index.js` for clean imports

### 2. Shared Components First
- **Always check** `src/components/ui` before creating new components
- Use shared components whenever possible
- Create shared components if they can be reused across features

### 3. Separation of Concerns
- **Services**: Handle API calls and data fetching
- **Hooks**: Manage business logic and state
- **Components**: Handle presentation and UI
- **Utils**: Provide helper functions

## 🔧 Component Architecture

### Shared Components (`src/components/ui`)

**When to create a shared component:**
- ✅ Used in 2+ features
- ✅ Generic and reusable (buttons, inputs, cards)
- ✅ Part of the design system

**How to create a shared component:**
1. Create component in `src/components/ui/ComponentName.jsx`
2. Export from `src/components/ui/index.js`
3. Use consistent prop patterns
4. Follow existing component styles

**Example:**
```jsx
// src/components/ui/CustomSelect.jsx
"use client";

import { cn } from "@/utils/cn";

export function CustomSelect({
  children,
  className,
  error,
  ...props
}) {
  return (
    <select
      className={cn(
        "base-styles",
        error && "error-styles",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
```

```jsx
// src/components/ui/index.js
export { CustomSelect } from "./CustomSelect";
```

### Feature-Specific Components (`src/features/[feature]/components`)

**When to create a feature component:**
- ✅ Used only within one feature
- ✅ Contains feature-specific business logic
- ✅ Tightly coupled to feature domain

**How to create a feature component:**
1. Create in `src/features/[feature]/components/ComponentName.jsx`
2. Export from `src/features/[feature]/index.js`
3. Use shared UI components when possible
4. Keep business logic in hooks

**Example:**
```jsx
// src/features/products/components/ProductCard.jsx
"use client";

import { CustomCard, CustomButton } from "@/components/ui";
import { useProducts } from "../hooks/useProducts";

export default function ProductCard({ product }) {
  const { deleteProduct } = useProducts();
  
  return (
    <CustomCard>
      {/* Product-specific UI */}
    </CustomCard>
  );
}
```

## 📄 Page Structure (Next.js App Router)

### Page Files (`src/app/dashboard/[feature]/page.jsx`)

Pages should be **thin wrappers** that:
- Export metadata for SEO
- Import and render feature components
- Handle route-level concerns

**Best Practice:**
```jsx
// src/app/dashboard/products/page.jsx
import { Products } from "@/features/products";

export const metadata = {
  title: "Products | Dashboard",
  description: "Manage your products",
};

export default function ProductsPage() {
  return <Products />;
}
```

### Layout Files

- **Root Layout** (`src/app/layout.jsx`): Global providers, styles, fonts
- **Dashboard Layout** (`src/app/dashboard/layout.jsx`): Dashboard-specific layout (sidebar, topbar)

**Best Practice:**
```jsx
// src/app/layout.jsx
"use client";

import "./globals.css";
import { ThemeProvider } from "@/features/theme";
import { ToastContainer } from "react-toastify";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
          <ToastContainer />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

## 🎨 Next.js Best Practices

### 1. Server vs Client Components

**Server Components (Default):**
- Use for static content
- Data fetching
- No interactivity
- No browser APIs

**Client Components (`"use client"`):**
- Use for interactivity (onClick, useState, etc.)
- Browser APIs (localStorage, window)
- Context providers
- Event handlers

**Best Practice:**
```jsx
// ✅ Server Component (default)
export default function ProductsPage() {
  return <Products />;
}

// ✅ Client Component (when needed)
"use client";

export default function Products() {
  const [state, setState] = useState();
  // ...
}
```

### 2. Metadata and SEO

Always export metadata from page files:
```jsx
export const metadata = {
  title: "Page Title | Dashboard",
  description: "Page description",
};
```

### 3. Route Organization

```
app/
├── dashboard/
│   ├── products/
│   │   ├── page.jsx          # /dashboard/products
│   │   ├── [id]/
│   │   │   └── page.jsx      # /dashboard/products/[id]
│   │   └── new/
│   │       └── page.jsx      # /dashboard/products/new
```

### 4. Data Fetching

**In Server Components:**
```jsx
// Server Component - direct fetch
export default async function ProductsPage() {
  const products = await fetch('/api/products').then(r => r.json());
  return <ProductsList products={products} />;
}
```

**In Client Components:**
```jsx
// Client Component - use hooks/services
"use client";

import { useProducts } from "@/features/products";

export default function Products() {
  const { products, loading } = useProducts();
  // ...
}
```

### 5. Error Handling

Use Error Boundaries and error states:
```jsx
import { ErrorState } from "@/components/ui";

if (error) {
  return (
    <ErrorState
      title="Failed to load products"
      message={error.message}
      onRetry={refetch}
    />
  );
}
```

### 6. Loading States

Use LoadingState component:
```jsx
import { LoadingState } from "@/components/ui";

if (loading) {
  return <LoadingState message="Loading products..." />;
}
```

### 7. Form Handling

Use React Hook Form with Zod validation:
```jsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "@/components/ui";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

export default function ProductForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField
        label="Name"
        error={errors.name?.message}
        {...register("name")}
      />
    </form>
  );
}
```

## 🏗️ Feature Development Workflow

### Step 1: Create Feature Structure
```
src/features/[feature-name]/
├── components/
│   └── FeatureComponent.jsx
├── hooks/
│   └── useFeature.js
├── services/
│   └── featureService.js
└── index.js
```

### Step 2: Create Service (API Layer)
```jsx
// src/features/products/services/productService.js
import { makeRequest } from "@/utils/makeRequest";

export const productService = {
  getAll: async (filters) => {
    return makeRequest("/api/products", {
      method: "GET",
      params: filters,
    });
  },
  
  getById: async (id) => {
    return makeRequest(`/api/products/${id}`, {
      method: "GET",
    });
  },
  
  create: async (data) => {
    return makeRequest("/api/products", {
      method: "POST",
      data,
    });
  },
  
  update: async (id, data) => {
    return makeRequest(`/api/products/${id}`, {
      method: "PUT",
      data,
    });
  },
  
  delete: async (id) => {
    return makeRequest(`/api/products/${id}`, {
      method: "DELETE",
    });
  },
};
```

### Step 3: Create Hook (Business Logic)
```jsx
// src/features/products/hooks/useProducts.js
"use client";

import { useState, useEffect } from "react";
import { productService } from "../services/productService";
import { toast } from "react-toastify";

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAll();
      setProducts(data);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    try {
      await productService.delete(id);
      setProducts(products.filter(p => p.id !== id));
      toast.success("Product deleted successfully");
    } catch (err) {
      toast.error("Failed to delete product");
    }
  };

  return {
    products,
    loading,
    error,
    deleteProduct,
    refetch: fetchProducts,
  };
}
```

### Step 4: Create Component (UI)
```jsx
// src/features/products/components/Products.jsx
"use client";

import { PageContainer, PageHeader, DataTable, CustomButton } from "@/components/ui";
import { useProducts } from "../hooks/useProducts";
import { Plus } from "lucide-react";

export default function Products() {
  const { products, loading, error, deleteProduct } = useProducts();

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <PageContainer>
      <PageHeader
        title="Products"
        description="Manage your products"
        action={
          <CustomButton>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </CustomButton>
        }
      />
      <DataTable
        columns={columns}
        data={products}
        onRowClick={(row) => router.push(`/dashboard/products/${row.id}`)}
      />
    </PageContainer>
  );
}
```

### Step 5: Export from Index
```jsx
// src/features/products/index.js
export { default as Products } from "./components/Products";
export { useProducts } from "./hooks/useProducts";
export { productService } from "./services/productService";
```

### Step 6: Create Page
```jsx
// src/app/dashboard/products/page.jsx
import { Products } from "@/features/products";

export const metadata = {
  title: "Products | Dashboard",
  description: "Manage your products",
};

export default function ProductsPage() {
  return <Products />;
}
```

## 📦 Import Patterns

### Shared Components
```jsx
import {
  CustomButton,
  CustomCard,
  PageContainer,
  PageHeader,
} from "@/components/ui";
```

### Common Components
```jsx
import { StatCard, FolderCard } from "@/components/common";
```

### Features
```jsx
import { Products, useProducts } from "@/features/products";
```

### Utils
```jsx
import { cn } from "@/utils/cn";
import { makeRequest } from "@/utils/makeRequest";
```

## 🎯 Component Decision Tree

```
Need a new component?
│
├─ Is it used in 2+ features?
│  ├─ Yes → Create in src/components/ui/
│  └─ No → Continue
│
├─ Is it generic/reusable?
│  ├─ Yes → Create in src/components/ui/
│  └─ No → Continue
│
└─ Is it feature-specific?
   └─ Yes → Create in src/features/[feature]/components/
```

## ✅ Checklist for New Components

### Shared Components
- [ ] Component is reusable across features
- [ ] Added to `src/components/ui/index.js`
- [ ] Follows existing component patterns
- [ ] Uses `cn` utility for className merging
- [ ] Supports error states and variants
- [ ] Has proper TypeScript/JSDoc comments
- [ ] Tested in multiple contexts

### Feature Components
- [ ] Component is feature-specific
- [ ] Uses shared UI components
- [ ] Business logic in hooks
- [ ] API calls in services
- [ ] Exported from feature `index.js`
- [ ] Follows feature structure

### Pages
- [ ] Page is a thin wrapper
- [ ] Exports metadata
- [ ] Imports feature component
- [ ] No business logic in page
- [ ] Follows route structure

## 🔍 Code Quality Guidelines

### 1. Naming Conventions
- **Components**: PascalCase (`ProductCard`, `CustomButton`)
- **Hooks**: camelCase with "use" prefix (`useProducts`, `useAuth`)
- **Services**: camelCase (`productService`, `authService`)
- **Files**: Match component/hook name (`ProductCard.jsx`, `useProducts.js`)

### 2. File Organization
- One component per file
- Related components in same directory
- Exports via `index.js`
- Clear folder structure

### 3. Props and State
- Use descriptive prop names
- Destructure props for clarity
- Use TypeScript/JSDoc for types
- Default props where appropriate

### 4. Error Handling
- Always handle errors
- Show user-friendly messages
- Use ErrorState component
- Log errors for debugging

### 5. Performance
- Use React.memo for expensive components
- Use useMemo/useCallback when needed
- Avoid unnecessary re-renders
- Lazy load heavy components

## 🚨 Common Pitfalls to Avoid

### ❌ Don't:
- Put business logic in page components
- Create duplicate components
- Mix server and client code incorrectly
- Forget to export from index.js
- Use inline styles (use Tailwind)
- Create components in wrong location
- Skip error handling
- Forget loading states

### ✅ Do:
- Use shared components first
- Keep pages thin
- Separate concerns (services, hooks, components)
- Export from index.js
- Handle errors gracefully
- Show loading states
- Follow naming conventions
- Use TypeScript/JSDoc

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)

## 🎉 Summary

1. **Feature-Based Architecture**: Organize by features, not by file type
2. **Shared Components First**: Always check `src/components/ui` before creating new components
3. **Thin Pages**: Pages should be simple wrappers that import feature components
4. **Separation of Concerns**: Services → Hooks → Components
5. **Next.js Best Practices**: Server/Client components, metadata, routing
6. **Clean Imports**: Use centralized exports via `index.js`
7. **Error Handling**: Always handle errors and show loading states

Follow these guidelines to maintain a clean, scalable, and maintainable codebase! 🚀

