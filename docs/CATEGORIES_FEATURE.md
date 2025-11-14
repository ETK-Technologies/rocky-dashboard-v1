# Categories Feature Module

A comprehensive categories management feature for the Next.js dashboard with full CRUD operations, image uploads, and advanced filtering.

## 📁 File Structure

```
src/
├── features/categories/
│   ├── components/
│   │   ├── Categories.jsx          # Main list page with table and filters
│   │   └── CategoryForm.jsx        # Add/Edit form component
│   ├── hooks/
│   │   ├── useCategories.js        # Hook for fetching/managing categories list
│   │   └── useCategoryForm.js      # Hook for form state and submission
│   ├── services/
│   │   └── categoryService.js      # API service layer
│   └── index.js                    # Feature exports
│
├── app/dashboard/categories/
│   ├── page.jsx                    # List page route
│   ├── new/page.jsx                # Create page route
│   └── [id]/edit/page.jsx          # Edit page route
│
└── components/ui/
    └── SingleImageUpload.jsx       # Reusable image upload component
```

## ✨ Features

### 1. **Categories List Page** (`/dashboard/categories`)

- **DataTable Display**: Shows all categories in a clean, organized table
- **Table Columns**:
  - Image (with placeholder icon if no image)
  - Name (with description preview)
  - Slug (formatted as code)
  - Parent category
  - Active/Inactive status badge
  - Sort order
  - Actions (Edit/Delete buttons)
- **Real-time Search**: Filter categories by name or slug
- **Loading States**: Skeleton loading while fetching data
- **Empty States**: Helpful messages when no categories exist
- **Delete Confirmation**: Modal dialog to prevent accidental deletions

### 2. **Add Category Page** (`/dashboard/categories/new`)

- Clean, modern form layout
- Automatic slug generation from name
- Form validation with error messages
- Image upload with drag & drop
- Parent category selection
- Active/Inactive toggle
- SEO meta fields
- Loading states during submission

### 3. **Edit Category Page** (`/dashboard/categories/{id}/edit`)

- Same form as Add page (reusable component)
- Pre-populated with existing category data
- Updates via PATCH request
- Image preview with current image
- Prevents selecting itself as parent

## 🎨 Components

### SingleImageUpload

A reusable image upload component with:

- Click to upload
- Drag & drop support
- Image preview
- Remove functionality
- Error handling
- File type validation
- Responsive design

### Categories

Main list component featuring:

- Server-side data fetching
- Client-side filtering
- Action buttons per row
- Confirmation dialogs
- Toast notifications
- Responsive table layout

### CategoryForm

Unified form for create/edit with:

- Auto-detection of mode (based on categoryId prop)
- Dynamic form loading
- Validation
- Image handling
- Parent category dropdown
- Toggle switches
- SEO fields

## 🔧 Technical Details

### API Endpoints

All API calls use the centralized `makeRequest` utility and send **JSON format**:

- `GET /api/v1/categories` - Fetch all categories
- `GET /api/v1/categories/{id}` - Fetch single category
- `POST /api/v1/categories` - Create category (JSON with image URL)
- `PATCH /api/v1/categories/{id}` - Update category (JSON with image URL)
- `DELETE /api/v1/categories/{id}` - Delete category

### Image Upload Strategy

Images are uploaded to **Cloudinary** (or similar CDN) first, then the URL is sent with the category data:

1. User selects an image file
2. Upload to Cloudinary (future implementation)
3. Get back the image URL
4. Send category data + image URL as JSON

### Form Data Structure

**Request Body (JSON)**

```javascript
{
  "name": "Men's Health",
  "slug": "mens-health",
  "description": "Products for men's health and wellness",
  "image": "https://res.cloudinary.com/demo/image/upload/v1234/category.jpg", // Cloudinary URL
  "parentId": "parent-category-id", // or null
  "isActive": true,
  "sortOrder": 1,
  "metaTitle": "Men's Health Products | Best Prices",
  "metaDescription": "Discover our wide range of men's health products"
}
```

**API Response**

```javascript
{
  "name": "Men's Health",
  "slug": "mens-health",
  "description": "Products for men's health and wellness",
  "image": "https://example.com/category-image.jpg",
  "parentId": "parent-category-id",
  "isActive": true,
  "sortOrder": 1,
  "metaTitle": "Men's Health Products | Best Prices",
  "metaDescription": "Discover our wide range of men's health products"
}
```

### Hooks

#### useCategories

```javascript
const {
  categories, // Array of categories
  loading, // Loading state
  error, // Error message
  fetchCategories, // Refresh function
  deleteCategory, // Delete function
} = useCategories();
```

#### useCategoryForm

```javascript
const {
  loading, // Submit loading
  fetchLoading, // Fetch loading (edit mode)
  error, // Error message
  categoryData, // Current category (edit mode)
  isEditMode, // Boolean flag
  submitForm, // Submit handler
  refetch, // Refresh function
} = useCategoryForm(categoryId);
```

## 🎯 Features Implemented

✅ Full CRUD operations (Create, Read, Update, Delete)  
✅ Image upload with drag & drop  
✅ Real-time search/filter  
✅ Parent-child category relationships  
✅ Active/Inactive status toggle  
✅ Sort order management  
✅ SEO meta fields (title, description)  
✅ Slug auto-generation  
✅ Form validation  
✅ Loading states  
✅ Error handling  
✅ Toast notifications  
✅ Delete confirmation dialog  
✅ Responsive design  
✅ Dark mode support  
✅ Consistent styling with existing features  
✅ Navigation link in sidebar

## 🚀 Usage

### Navigate to Categories

Click "Categories" in the sidebar or visit `/dashboard/categories`

### Create a Category

1. Click "+ Add Category" button
2. Fill in the form fields
3. Upload an image (optional)
4. Click "Create Category"

### Edit a Category

1. Click the Edit icon on any category row
2. Modify the fields
3. Click "Update Category"

### Delete a Category

1. Click the Delete icon on any category row
2. Confirm the deletion in the dialog

### Search Categories

Type in the search box to filter by name or slug in real-time

## 🎨 Design Consistency

The Categories feature follows the same design patterns as the existing dashboard:

- Uses custom UI components from `@/components/ui`
- Matches color scheme and typography
- Same table layout as other features
- Consistent button styles and icons
- Unified loading and empty states
- Toast notifications for feedback

## 📝 Notes

- All API calls send **JSON format** (not FormData)
- Images are uploaded to **Cloudinary first**, then URL is sent
- Parent category dropdown excludes the current category in edit mode
- Slug is automatically generated from name (can be manually edited)
- Form validates required fields before submission
- All state management is handled via React hooks
- Uses Next.js App Router with client-side components

## 🖼️ Image Upload with Cloudinary

The categories feature is designed to work with Cloudinary for image hosting:

### Setup (Future Implementation)

1. **Install Cloudinary:**

   ```bash
   npm install cloudinary
   ```

2. **Configure Environment Variables:**

   ```env
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
   ```

3. **Use the Upload Utility:**

   ```javascript
   import { uploadToCloudinary } from "@/utils/cloudinary";

   // In useCategoryForm.js:
   if (imageFile && imageFile instanceof File) {
     const uploadedUrl = await uploadToCloudinary(imageFile, {
       folder: "categories", // Optional: organize in folders
     });
     imageUrl = uploadedUrl;
   }
   ```

### Current Behavior

- **Image selection**: SingleImageUpload component handles file selection
- **Upload**: Shows info toast that Cloudinary is not yet implemented
- **Submit**: Sends existing image URL or null
- **Edit mode**: Preserves existing image URL if not changed

### Benefits of Cloudinary

✅ **CDN delivery** - Fast image loading worldwide  
✅ **Automatic optimization** - Resizes and compresses images  
✅ **Transformations** - On-the-fly image manipulation  
✅ **Storage** - No need to store images on your server  
✅ **URL-based** - Simple integration with JSON APIs
