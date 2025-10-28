# Quick Start Guide - Minecloud Dashboard

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

Already done! Your project is ready to run.

### Run Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧭 Navigation

### Main Routes

- **Login**: `/login` - Authentication page
- **Dashboard**: `/dashboard` - Main file manager view
- **Products**: `/dashboard/products` - Product management
- **Orders**: `/dashboard/orders` - Order tracking
- **Settings**: `/dashboard/settings` - Configuration
- **Activity**: `/dashboard/activity` - Activity logs (new)
- **Calendar**: `/dashboard/calendar` - Calendar view (new)
- **Contact**: `/dashboard/contact` - Contacts (new)

---

## 🎯 First Steps

### 1. Login

Navigate to `/login` and use the existing auth flow.

### 2. Explore Dashboard

The main dashboard (`/dashboard`) now shows:

- **Quick Access**: 4 frequently used items
- **All Files**: Grid or list view of folders
- **View Toggle**: Switch between grid and list layouts
- **Search Bar**: (UI ready, needs implementation)

### 3. Navigate

Use the sidebar to access:

- Files (Dashboard home)
- Activity
- Calendar
- Contact
- Settings

---

## 🔧 Common Tasks

### Add a New Page

1. Create folder: `src/app/dashboard/your-page/`
2. Add `page.jsx`:

```javascript
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

export default function YourPage() {
  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Your Page</h1>
        <p className="text-gray-600 mt-1 text-sm">Description here</p>
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Section Title</CardTitle>
        </CardHeader>
        <CardContent>{/* Your content */}</CardContent>
      </Card>
    </div>
  );
}
```

3. Add to sidebar navigation (`src/features/dashboard/components/Sidebar.jsx`):

```javascript
const navigation = [
  // ... existing items
  { name: "Your Page", href: "/dashboard/your-page", icon: YourIcon },
];
```

### Create a New Feature

1. Create folder structure:

```
src/features/your-feature/
├── components/
├── hooks/
├── services/
└── index.js
```

2. Export from `index.js`:

```javascript
export { YourComponent } from "./components/YourComponent";
```

3. Import in your pages:

```javascript
import { YourComponent } from "@/features/your-feature";
```

### Add a New UI Component

1. Create component: `src/components/ui/YourComponent.jsx`
2. Follow shadcn/ui patterns
3. Export and use:

```javascript
import { YourComponent } from "@/components/ui/YourComponent";
```

---

## 🎨 Customization

### Change Branding

**Logo & Name** (`src/features/dashboard/components/Sidebar.jsx`):

```javascript
<h1 className="text-lg font-semibold text-gray-900">Your Brand</h1>
```

**Application Name** (`src/app/dashboard/settings/page.jsx`):

```javascript
defaultValue = "Your Dashboard";
```

### Change Colors

Edit `src/app/globals.css`:

```css
:root {
  --primary: 221 83% 53%; /* Your primary color */
  --accent: 221 83% 53%; /* Your accent color */
}
```

### Change Font

Edit `tailwind.config.js`:

```javascript
fontFamily: {
  sans: ["YourFont", "Inter", "system-ui", "sans-serif"],
}
```

Then import your font in `src/app/layout.jsx`.

---

## 📦 Key Components

### Dashboard Cards

**Quick Access Card:**

```javascript
import { QuickAccessCard } from "@/features/dashboard";

<QuickAccessCard
  title="Folder Name"
  size="2.3 GB"
  itemCount="23 items"
  icon={Folder}
  iconColor="text-blue-600"
  bgColor="bg-blue-50"
  onClick={() => handleClick()}
/>;
```

**Dashboard Card:**

```javascript
import { DashboardCard } from "@/features/dashboard";

<DashboardCard
  title="Products"
  size="2.5 GB"
  itemCount="45 items"
  icon={Package}
  iconColor="text-purple-600"
  bgColor="bg-purple-50"
  onClick={() => router.push("/dashboard/products")}
/>;
```

### Avatar

```javascript
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";

<Avatar>
  <AvatarImage src="/avatar.jpg" alt="User" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>;
```

### Badge

```javascript
import { Badge } from "@/components/ui/Badge";

<Badge variant="default">New</Badge>
<Badge variant="secondary">Draft</Badge>
<Badge variant="destructive">Urgent</Badge>
```

---

## 🔌 Connect to Backend

### Example: Fetch Folders

```javascript
// In src/features/dashboard/services/dashboardService.js
export const fetchFolders = async () => {
  const response = await fetch("/api/folders");
  return response.json();
};

// In component
import { fetchFolders } from "@/features/dashboard/services/dashboardService";

useEffect(() => {
  const loadFolders = async () => {
    const data = await fetchFolders();
    setFolders(data);
  };
  loadFolders();
}, []);
```

### Example: Search Functionality

```javascript
// In Topbar.jsx
const [searchQuery, setSearchQuery] = useState("");

const handleSearch = async (e) => {
  e.preventDefault();
  // Call your search API
  const results = await fetch(`/api/search?q=${searchQuery}`);
  // Handle results
};

<form onSubmit={handleSearch}>
  <input
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    placeholder="Search anything..."
  />
</form>;
```

---

## 📱 Responsive Testing

### Test Breakpoints

1. **Mobile** (< 640px):

   - Sidebar should be hidden
   - Hamburger menu visible
   - Single column layout

2. **Tablet** (640px - 1024px):

   - Sidebar toggles with overlay
   - 2 column grid
   - Compact spacing

3. **Desktop** (> 1024px):
   - Fixed sidebar visible
   - 3-4 column grid
   - Full spacing

### Browser DevTools

1. Open DevTools (F12)
2. Click device toolbar icon
3. Test on different devices/sizes

---

## 🐛 Troubleshooting

### Styles Not Applying

```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Import Errors

- Check file paths use `@/` prefix
- Verify component exports in `index.js`

### Build Errors

```bash
# Check for linting errors
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

### Sidebar Not Showing

- Clear browser cache
- Check if logged in
- Verify layout imports

---

## 📚 Resources

### Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Lucide Icons](https://lucide.dev/icons)

### Project Files

- `REFACTORING_SUMMARY.md` - Complete change log
- `VISUAL_GUIDE.md` - Design system reference
- `PROJECT_OVERVIEW.md` - Original project overview

---

## 🎯 Next Steps

### Essential

1. ✅ Explore the new dashboard
2. ⏳ Test all navigation links
3. ⏳ Verify responsive design
4. ⏳ Customize branding

### Optional

1. ⏳ Connect to real data APIs
2. ⏳ Implement search functionality
3. ⏳ Add notification dropdown
4. ⏳ Build activity, calendar, contact pages
5. ⏳ Add file upload functionality

### Advanced

1. ⏳ Add dark mode support
2. ⏳ Implement drag & drop
3. ⏳ Add keyboard shortcuts
4. ⏳ Create file preview modal
5. ⏳ Add bulk actions

---

## 🎉 You're Ready!

The dashboard is fully refactored and ready to use. Start the dev server and explore the new design:

```bash
npm run dev
```

Visit: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

---

**Need help?** Check the other documentation files:

- `REFACTORING_SUMMARY.md` - What changed
- `VISUAL_GUIDE.md` - Design reference

**Happy building! 🚀**
