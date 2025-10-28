# Logout Functionality

## Overview
Clean and simple logout implementation with confirmation dialog and API integration.

## Components

### LogoutButton
A reusable logout button component with built-in confirmation dialog.

**Features:**
- ✅ Confirmation dialog before logout
- ✅ API call to `/api/v1/auth/logout`
- ✅ Loading states
- ✅ Error handling
- ✅ Customizable styling
- ✅ Icon support

### ConfirmationDialog
A reusable confirmation dialog component.

**Features:**
- ✅ Multiple variants (danger, warning, info)
- ✅ Customizable content
- ✅ Loading states
- ✅ Backdrop click to close
- ✅ Keyboard accessible

## Usage

### Basic Usage
```jsx
import { LogoutButton } from "@/features/auth";

function Header() {
  return (
    <header>
      <LogoutButton />
    </header>
  );
}
```

### Customized Usage
```jsx
import { LogoutButton } from "@/features/auth";

function Sidebar() {
  return (
    <div className="sidebar-footer">
      <LogoutButton 
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        showIcon={true}
      >
        Sign Out
      </LogoutButton>
    </div>
  );
}
```

### Using the Hook Directly
```jsx
import { useLogout } from "@/features/auth";

function CustomLogout() {
  const { logout } = useLogout();
  
  const handleLogout = () => {
    logout({ showToast: true, redirectTo: "/login" });
  };
  
  return <button onClick={handleLogout}>Logout</button>;
}
```

## API Integration

The logout functionality calls the API endpoint:
- **Method:** POST
- **URL:** `/api/v1/auth/logout`
- **Response:** 200 OK on success

## Props

### LogoutButton Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | string | "outline" | Button variant |
| `size` | string | "default" | Button size |
| `className` | string | "" | Additional CSS classes |
| `showIcon` | boolean | true | Show logout icon |
| `children` | string | "Logout" | Button content |

### ConfirmationDialog Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | boolean | - | Whether dialog is open |
| `onClose` | function | - | Close dialog handler |
| `onConfirm` | function | - | Confirm action handler |
| `title` | string | "Confirm Action" | Dialog title |
| `description` | string | "Are you sure..." | Dialog description |
| `confirmText` | string | "Confirm" | Confirm button text |
| `cancelText` | string | "Cancel" | Cancel button text |
| `isLoading` | boolean | false | Loading state |
| `variant` | string | "warning" | Dialog variant |

## Error Handling

- API errors are logged but don't prevent logout
- Local storage is always cleared
- User is always redirected to login page
- Success toast is shown on completion
