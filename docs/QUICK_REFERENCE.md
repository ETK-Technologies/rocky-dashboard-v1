# ⚡ Quick Reference Guide - Rocky Dashboard

Quick reference for common patterns and best practices.

## 📦 Import Patterns

```jsx
// Shared UI Components
import {
  CustomButton,
  CustomCard,
  PageContainer,
  PageHeader,
  DataTable,
  FormField,
  LoadingState,
  ErrorState,
} from "@/components/ui";

// Common Components
import { StatCard, FolderCard } from "@/components/common";

// Features
import { Products, useProducts } from "@/features/products";

// Utils
import { cn } from "@/utils/cn";
import { makeRequest } from "@/utils/makeRequest";
```

## 🎨 Component Creation Checklist

### Shared Component (`src/components/ui/`)
- [ ] Used in 2+ features
- [ ] Generic and reusable
- [ ] Added to `src/components/ui/index.js`
- [ ] Uses `cn` utility for className
- [ ] Supports variants and error states

### Feature Component (`src/features/[feature]/components/`)
- [ ] Feature-specific
- [ ] Uses shared UI components
- [ ] Business logic in hooks
- [ ] Exported from feature `index.js`

## 📄 Page Template

```jsx
// src/app/dashboard/[feature]/page.jsx
import { FeatureComponent } from "@/features/[feature]";

export const metadata = {
  title: "Feature | Dashboard",
  description: "Feature description",
};

export default function FeaturePage() {
  return <FeatureComponent />;
}
```

## 🎣 Hook Template

```jsx
// src/features/[feature]/hooks/useFeature.js
"use client";

import { useState, useEffect } from "react";
import { featureService } from "../services/featureService";
import { toast } from "react-toastify";

export function useFeature() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await featureService.getAll();
      setData(result);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
```

## 🔌 Service Template

```jsx
// src/features/[feature]/services/featureService.js
import { makeRequest } from "@/utils/makeRequest";

export const featureService = {
  getAll: async (filters) => {
    return makeRequest("/api/features", {
      method: "GET",
      params: filters,
    });
  },
  
  getById: async (id) => {
    return makeRequest(`/api/features/${id}`, {
      method: "GET",
    });
  },
  
  create: async (data) => {
    return makeRequest("/api/features", {
      method: "POST",
      data,
    });
  },
  
  update: async (id, data) => {
    return makeRequest(`/api/features/${id}`, {
      method: "PUT",
      data,
    });
  },
  
  delete: async (id) => {
    return makeRequest(`/api/features/${id}`, {
      method: "DELETE",
    });
  },
};
```

## 🧩 Component Template

```jsx
// src/features/[feature]/components/FeatureComponent.jsx
"use client";

import { useState } from "react";
import {
  PageContainer,
  PageHeader,
  CustomButton,
  LoadingState,
  ErrorState,
} from "@/components/ui";
import { useFeature } from "../hooks/useFeature";
import { Plus } from "lucide-react";

export default function FeatureComponent() {
  const { data, loading, error } = useFeature();

  if (loading) {
    return <LoadingState message="Loading..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <PageContainer>
      <PageHeader
        title="Feature"
        description="Feature description"
        action={
          <CustomButton>
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </CustomButton>
        }
      />
      {/* Content */}
    </PageContainer>
  );
}
```

## 📋 Form Template

```jsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField, CustomButton, CustomCard } from "@/components/ui";
import { toast } from "react-toastify";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

export default function FeatureForm({ onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data);
      toast.success("Saved successfully");
    } catch (error) {
      toast.error("Failed to save");
    }
  };

  return (
    <CustomCard>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <FormField
          label="Name"
          error={errors.name?.message}
          {...register("name")}
        />
        <FormField
          label="Email"
          type="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <CustomButton type="submit" disabled={isSubmitting}>
          Save
        </CustomButton>
      </form>
    </CustomCard>
  );
}
```

## 📊 DataTable Template

```jsx
import { DataTable, IconButton } from "@/components/ui";
import { Edit, Trash2 } from "lucide-react";

const columns = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  {
    key: "status",
    label: "Status",
    render: (row) => <CustomBadge>{row.status}</CustomBadge>,
  },
];

export default function FeatureTable({ data, onEdit, onDelete }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      onRowClick={(row) => router.push(`/dashboard/features/${row.id}`)}
      renderActions={(row) => (
        <>
          <IconButton
            icon={Edit}
            label="Edit"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(row);
            }}
          />
          <IconButton
            icon={Trash2}
            label="Delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(row);
            }}
          />
        </>
      )}
    />
  );
}
```

## 🔐 Protected Route Pattern

```jsx
// In dashboard layout or page
import { authStorage } from "@/features/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProtectedPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (!authStorage.isAuthenticated()) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  if (!isAuthenticated) {
    return null;
  }

  return <div>Protected Content</div>;
}
```

## 🎯 Decision Tree

```
New Component Needed?
│
├─ Used in 2+ features? → src/components/ui/
├─ Generic/Reusable? → src/components/ui/
└─ Feature-specific? → src/features/[feature]/components/
```

## 📁 File Structure

```
src/
├── app/
│   └── dashboard/
│       └── [feature]/
│           └── page.jsx          # Thin wrapper
│
├── components/
│   ├── ui/                       # Shared UI components
│   └── common/                   # Common components
│
├── features/
│   └── [feature]/
│       ├── components/           # Feature components
│       ├── hooks/                # Custom hooks
│       ├── services/             # API services
│       └── index.js              # Exports
│
└── utils/                        # Utilities
```

## 🚨 Common Mistakes

### ❌ Wrong
```jsx
// Business logic in page
export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  // ... fetch logic
  return <div>{/* ... */}</div>;
}

// Duplicate component
// src/features/products/components/Button.jsx
// src/features/orders/components/Button.jsx

// Inline styles
<div style={{ padding: '20px' }}>
```

### ✅ Right
```jsx
// Thin page wrapper
export default function ProductsPage() {
  return <Products />;
}

// Shared component
// src/components/ui/CustomButton.jsx

// Tailwind classes
<div className="p-5">
```

## 🎨 Styling Guidelines

```jsx
// Use cn utility for conditional classes
import { cn } from "@/utils/cn";

<div className={cn(
  "base-classes",
  condition && "conditional-classes",
  className
)} />

// Use Tailwind classes
<button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
  Click me
</button>
```

## 🔔 Toast Notifications

```jsx
import { toast } from "react-toastify";

// Success
toast.success("Operation successful!");

// Error
toast.error("Operation failed!");

// Info
toast.info("Information message");

// Warning
toast.warning("Warning message");
```

## 🔄 State Management

```jsx
// Local state
const [state, setState] = useState();

// Global state (Zustand)
import { useAuthStore } from "@/lib/store/authStore";

const { user, setUser } = useAuthStore();
```

## 📝 Export Pattern

```jsx
// src/features/[feature]/index.js
// Components
export { default as FeatureComponent } from "./components/FeatureComponent";

// Hooks
export { useFeature } from "./hooks/useFeature";

// Services
export { featureService } from "./services/featureService";
```

## 🎯 Next.js Patterns

```jsx
// Server Component (default)
export default function Page() {
  return <div>Static Content</div>;
}

// Client Component
"use client";

export default function Page() {
  const [state, setState] = useState();
  return <div>Interactive Content</div>;
}

// Metadata
export const metadata = {
  title: "Page Title | Dashboard",
  description: "Page description",
};
```

## 🚀 Quick Start Checklist

1. [ ] Create feature structure
2. [ ] Create service (API layer)
3. [ ] Create hook (business logic)
4. [ ] Create component (UI)
5. [ ] Export from index.js
6. [ ] Create page wrapper
7. [ ] Add metadata
8. [ ] Test and refine

---

**Remember**: Always check `src/components/ui` before creating new components!

