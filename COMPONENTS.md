# Reusable Components Guide

This guide shows all the custom reusable components in the project and how to use them.

## Import Pattern

All UI components can be imported from a single location:

```javascript
import {
  CustomButton,
  CustomCard,
  PageContainer,
  PageHeader,
  // ... other components
} from "@/components/ui";
```

## Layout Components

### PageContainer

Provides consistent page layout with responsive padding and max-width.

```javascript
import { PageContainer } from "@/components/ui";

<PageContainer maxWidth="2xl">{/* Your page content */}</PageContainer>;
```

**Props:**

- `maxWidth`: `"sm" | "md" | "lg" | "xl" | "2xl" | "full"` (default: `"2xl"`)
- `className`: Additional CSS classes

### PageHeader

Consistent page title, description, and action button layout.

```javascript
import { PageHeader, CustomButton } from "@/components/ui";
import { Plus } from "lucide-react";

<PageHeader
  title="Products"
  description="Manage your product catalog"
  action={
    <CustomButton>
      <Plus className="h-4 w-4 mr-2" />
      Add Product
    </CustomButton>
  }
/>;
```

**Props:**

- `title`: Page title (required)
- `description`: Page description
- `action`: React node for action button/content
- `className`: Additional CSS classes

### SectionHeader

Similar to PageHeader but for sections within a page.

```javascript
import { SectionHeader } from "@/components/ui";

<SectionHeader
  title="Quick Access"
  description="Your recently accessed items"
  action={<button>View All</button>}
/>;
```

## Form Components

### FormField

Combines label, input, and error message into one component.

```javascript
import { FormField } from "@/components/ui";

<FormField
  id="email"
  label="Email Address"
  type="email"
  placeholder="Enter your email"
  required
  error={errors.email?.message}
  helperText="We'll never share your email"
/>;
```

**Props:**

- `id`: Input ID (required)
- `label`: Field label
- `error`: Error message to display
- `helperText`: Helper text below input
- `required`: Shows asterisk next to label
- All other props passed to CustomInput

### CustomInput

Styled input field with error state.

```javascript
import { CustomInput } from "@/components/ui";

<CustomInput
  id="username"
  type="text"
  placeholder="Enter username"
  error={hasError}
  disabled={isLoading}
/>;
```

### CustomLabel

Styled label for form fields.

```javascript
import { CustomLabel } from "@/components/ui";

<CustomLabel htmlFor="email">Email Address</CustomLabel>;
```

## Button Components

### CustomButton

Versatile button with multiple variants and sizes.

```javascript
import { CustomButton } from "@/components/ui";

<CustomButton
  variant="primary"
  size="lg"
  disabled={isLoading}
  onClick={handleClick}
>
  Save Changes
</CustomButton>;
```

**Props:**

- `variant`: `"primary" | "secondary" | "destructive" | "outline" | "ghost"` (default: `"primary"`)
- `size`: `"sm" | "default" | "lg" | "icon"` (default: `"default"`)
- `disabled`: Boolean
- `type`: `"button" | "submit" | "reset"` (default: `"button"`)

### IconButton

Button specifically for icons only.

```javascript
import { IconButton } from "@/components/ui";
import { Settings } from "lucide-react";

<IconButton
  icon={Settings}
  label="Settings"
  size="md"
  variant="ghost"
  onClick={handleSettings}
/>;
```

**Props:**

- `icon`: Icon component (required)
- `label`: Aria label for accessibility (required)
- `size`: `"sm" | "md" | "lg"` (default: `"md"`)
- `variant`: Same as CustomButton

## Card Components

### CustomCard

Container component with border and shadow.

```javascript
import {
  CustomCard,
  CustomCardHeader,
  CustomCardTitle,
  CustomCardDescription,
  CustomCardContent,
  CustomCardFooter,
} from "@/components/ui";

<CustomCard>
  <CustomCardHeader>
    <CustomCardTitle>Card Title</CustomCardTitle>
    <CustomCardDescription>Card description text</CustomCardDescription>
  </CustomCardHeader>
  <CustomCardContent>{/* Main content */}</CustomCardContent>
  <CustomCardFooter>{/* Footer content */}</CustomCardFooter>
</CustomCard>;
```

## State Components

### LoadingState

Display loading spinner with message.

```javascript
import { LoadingState } from "@/components/ui";

// Inline loading
<LoadingState message="Loading data..." size="md" />

// Full screen loading
<LoadingState
  message="Processing your request..."
  size="lg"
  fullScreen
/>
```

**Props:**

- `message`: Loading message (default: `"Loading..."`)
- `size`: `"sm" | "md" | "lg"` (default: `"md"`)
- `fullScreen`: Boolean (default: `false`)
- `className`: Additional CSS classes

### ErrorState

Display error message with retry option.

```javascript
import { ErrorState } from "@/components/ui";

<ErrorState
  title="Failed to load data"
  message="An error occurred while fetching the data."
  onRetry={handleRetry}
  retryText="Try Again"
/>;
```

**Props:**

- `title`: Error title (default: `"Something went wrong"`)
- `message`: Error message (default: `"An error occurred. Please try again."`)
- `onRetry`: Retry callback function
- `retryText`: Retry button text (default: `"Try Again"`)

### CustomEmptyState

Display when there's no data to show.

```javascript
import { CustomEmptyState, CustomButton } from "@/components/ui";
import { Package, Plus } from "lucide-react";

<CustomEmptyState
  icon={Package}
  title="No products yet"
  description="Get started by creating your first product."
  action={
    <CustomButton>
      <Plus className="h-4 w-4 mr-2" />
      Create Product
    </CustomButton>
  }
/>;
```

**Props:**

- `icon`: Lucide icon component (required)
- `title`: Empty state title (required)
- `description`: Description text
- `action`: Action button/content

## Data Display Components

### DataTable

Display data in a table format.

```javascript
import { DataTable } from "@/components/ui";

const columns = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  {
    key: "status",
    label: "Status",
    render: (row) => <Badge>{row.status}</Badge>,
  },
];

const data = [
  { name: "John Doe", email: "john@example.com", status: "Active" },
  // ... more rows
];

<DataTable
  columns={columns}
  data={data}
  onRowClick={(row) => console.log(row)}
  renderActions={(row) => <IconButton icon={MoreVertical} label="Actions" />}
  loading={isLoading}
  emptyState={{
    icon: Users,
    title: "No users found",
    description: "Add your first user to get started.",
  }}
/>;
```

**Props:**

- `columns`: Column definitions array (required)
- `data`: Data array (required)
- `onRowClick`: Row click handler
- `renderActions`: Function to render row actions
- `loading`: Boolean loading state
- `emptyState`: Empty state props

### ViewToggle

Toggle between grid and list views.

```javascript
import { ViewToggle } from "@/components/ui";

const [view, setView] = useState("grid");

<ViewToggle view={view} onViewChange={setView} />;
```

## Utility Components

### Divider

Horizontal divider with optional text.

```javascript
import { Divider } from "@/components/ui";

// Simple divider
<Divider />

// With text
<Divider text="Or continue with email" />
```

### CustomBadge

Display status badges.

```javascript
import { CustomBadge } from "@/components/ui";

<CustomBadge variant="default">Active</CustomBadge>
<CustomBadge variant="secondary">Pending</CustomBadge>
<CustomBadge variant="destructive">Inactive</CustomBadge>
<CustomBadge variant="outline">Draft</CustomBadge>
```

### CustomConfirmationDialog

Modal dialog for confirmations.

```javascript
import { CustomConfirmationDialog } from "@/components/ui";

const [isOpen, setIsOpen] = useState(false);

<CustomConfirmationDialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleDelete}
  title="Delete Item"
  description="Are you sure you want to delete this item? This action cannot be undone."
  confirmText="Delete"
  cancelText="Cancel"
  variant="danger"
  isLoading={isDeleting}
/>;
```

**Props:**

- `isOpen`: Boolean to control visibility (required)
- `onClose`: Close handler (required)
- `onConfirm`: Confirm handler (required)
- `title`: Dialog title
- `description`: Dialog description
- `confirmText`: Confirm button text (default: `"Confirm"`)
- `cancelText`: Cancel button text (default: `"Cancel"`)
- `variant`: `"danger" | "warning" | "info"` (default: `"warning"`)
- `isLoading`: Boolean loading state

## Common Components

### FolderCard

Display folder/item cards (from `@/components/common`).

```javascript
import { FolderCard } from "@/components/common";
import { Folder } from "lucide-react";

<FolderCard
  title="Documents"
  size="2.3 GB"
  itemCount="45 items"
  icon={Folder}
  iconColor="text-blue-600"
  bgColor="bg-blue-50"
  onClick={handleClick}
/>;
```

### StatCard

Display statistics with trends.

```javascript
import { StatCard } from "@/components/common";
import { Package } from "lucide-react";

<StatCard
  title="Total Products"
  value="1,234"
  change="+12%"
  trend="up"
  icon={Package}
  iconColor="text-blue-600"
  iconBg="bg-blue-50"
/>;
```

## Complete Page Example

Here's a complete example of a page using reusable components:

```javascript
"use client";

import {
  CustomCard,
  CustomCardContent,
  CustomCardHeader,
  CustomCardTitle,
  CustomButton,
  CustomEmptyState,
  PageContainer,
  PageHeader,
} from "@/components/ui";
import { Package, Plus } from "lucide-react";

export default function ProductsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Products"
        description="Manage your product catalog"
        action={
          <CustomButton>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </CustomButton>
        }
      />

      <CustomCard>
        <CustomCardHeader>
          <CustomCardTitle>All Products</CustomCardTitle>
        </CustomCardHeader>
        <CustomCardContent>
          <CustomEmptyState
            icon={Package}
            title="No products yet"
            description="Get started by creating your first product."
            action={
              <CustomButton>
                <Plus className="h-4 w-4 mr-2" />
                Create Product
              </CustomButton>
            }
          />
        </CustomCardContent>
      </CustomCard>
    </PageContainer>
  );
}
```

## Toastify Messages

For notifications, use react-toastify (already configured):

```javascript
import { toast } from "react-toastify";

// Success
toast.success("Product created successfully!");

// Error
toast.error("Failed to delete product");

// Info
toast.info("Processing your request...");

// Warning
toast.warning("This action cannot be undone");
```

## Best Practices

1. **Always use PageContainer** for consistent page layout
2. **Use PageHeader** for page titles instead of custom divs
3. **Use FormField** instead of combining Label + Input manually
4. **Use LoadingState** for consistent loading indicators
5. **Use ErrorState** for error displays with retry
6. **Import from @/components/ui** for all UI components
7. **Use toastify for notifications**, not custom alert components
8. **Use CustomConfirmationDialog** for destructive actions

## Component Hierarchy

```
PageContainer (wrapper)
├── PageHeader (title + description + action)
├── CustomCard (content container)
│   ├── CustomCardHeader
│   │   ├── CustomCardTitle
│   │   └── CustomCardDescription
│   ├── CustomCardContent
│   │   ├── FormField (forms)
│   │   ├── DataTable (tables)
│   │   ├── CustomEmptyState (no data)
│   │   └── LoadingState (loading)
│   └── CustomCardFooter
```

This component structure keeps your code clean, consistent, and easy to maintain!
