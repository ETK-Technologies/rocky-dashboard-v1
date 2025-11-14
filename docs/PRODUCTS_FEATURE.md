# Products Feature Documentation

## Overview

The Products feature provides a comprehensive product management system with support for multiple product types, variants, subscriptions, and extensive customization options.

## Product Types

### 1. SIMPLE Products

- **Use Case**: Basic one-time purchase products (single items, digital downloads)
- **Required Fields**: name, slug, type, basePrice
- **Optional Fields**: salePrice, description, images, metadata, inventory settings
- **NOT Required**: attributes, variants, subscription settings

### 2. VARIABLE Products

- **Use Case**: Products with variants (size, color, material) - one-time purchase
- **Required Fields**: name, slug, type, basePrice, attributes[], variants[]
- **Optional Fields**: salePrice, description, images, metadata, inventory settings
- **NOT Required**: subscription settings
- **Workflow**:
  1. Define attributes (e.g., "Size", "Color")
  2. Create variants based on attribute combinations
  3. Set pricing for each variant

### 3. SUBSCRIPTION Products

- **Use Case**: Recurring billing products (monthly boxes, services)
- **Required Fields**: name, slug, type, basePrice, subscription settings
- **Optional Fields**: salePrice, description, images, metadata, inventory settings
- **NOT Required**: attributes, variants
- **Subscription Settings**:
  - period (DAY, WEEK, MONTH, YEAR)
  - interval (e.g., every 3 months)
  - length (0 = never expires)
  - signUpFee
  - trial settings (length, period)

### 4. VARIABLE_SUBSCRIPTION Products

- **Use Case**: Subscriptions with multiple options (medication dosages, box sizes)
- **Required Fields**: name, slug, type, basePrice, attributes[], variants[], subscription settings
- **Optional Fields**: salePrice, description, images, metadata, inventory settings
- **Workflow**:
  1. Define attributes (e.g., "Dosage", "Supply Type")
  2. Create variants based on attribute combinations
  3. Set subscription pricing and settings for each variant

## Feature Structure

```
src/features/products/
├── components/
│   ├── Products.jsx           # Product list with filtering
│   └── ProductForm.jsx         # Product creation/editing form
├── hooks/
│   ├── useProducts.js          # Product list management
│   └── useProductForm.js       # Product form management
├── services/
│   └── productService.js       # API integration
└── index.js                    # Feature exports

src/app/dashboard/products/
├── page.jsx                    # Product list page
├── new/
│   └── page.jsx               # New product page
└── [id]/
    └── edit/
        └── page.jsx           # Edit product page
```

## Key Features

### 1. Product List (Products.jsx)

- **Data Table Display**: Shows products with images, name, type, price, status, and variant count
- **Search**: Full-text search across product name, description, and SKU
- **Filters**:
  - Product type (SIMPLE, VARIABLE, SUBSCRIPTION, VARIABLE_SUBSCRIPTION)
  - Status (DRAFT, PUBLISHED, ARCHIVED)
- **Actions**: Edit and delete operations with confirmation
- **Pagination**: Built-in pagination support
- **Empty State**: Helpful empty state with action button

### 2. Product Form (ProductForm.jsx)

The form adapts based on the selected product type:

#### Basic Information

- Product name (with auto-slug generation)
- Slug (URL-friendly identifier)
- Product type (fixed after creation)
- Status (DRAFT, PUBLISHED, ARCHIVED)
- Description

#### Pricing

- Base price (required)
- Sale price (optional)

#### Subscription Settings (for subscription products)

- Billing period and interval
- Subscription length
- Sign-up fee
- Trial period settings

#### Attributes (for variable products)

- Dynamic attribute creation
- Name and comma-separated values
- Multiple attributes supported

#### Variants (for variable products)

- Dynamic variant creation
- Name, SKU, price, sale price per variant
- Stock quantity per variant
- Subscription settings per variant (for variable subscriptions)

#### Images

- Multiple image support
- URL, alt text, and name fields
- Image preview (when available)

#### Inventory

- SKU management
- Stock tracking toggle
- Stock quantity
- Low stock threshold

#### Additional Options

- Featured product flag
- Virtual product (no shipping)
- Downloadable flag
- Shipping class
- Weight and dimensions

#### SEO

- Meta title
- Meta description
- Meta keywords

### 3. Service Layer (productService.js)

Complete API integration with methods for:

- `getAll(params)` - Fetch products with filtering and pagination
- `getById(id)` - Fetch single product
- `search(query, limit)` - Search products
- `create(data)` - Create new product
- `update(id, data)` - Update product
- `delete(id)` - Soft delete product
- `updateStock(id, stockData)` - Update stock
- `getMetadata(id)` - Get all metadata
- `getMetadataByKey(id, key)` - Get specific metadata
- `upsertMetadata(id, data)` - Create/update metadata
- `bulkUpdateMetadata(id, metadataArray)` - Bulk metadata update
- `deleteMetadata(id, key)` - Delete metadata

### 4. Hooks

#### useProducts(initialFilters)

Manages product list state with filtering and pagination:

```javascript
const {
  products, // Array of products
  pagination, // Pagination info
  loading, // Loading state
  error, // Error state
  filters, // Current filters
  updateFilters, // Update filters function
  fetchProducts, // Refetch products
  deleteProduct, // Delete product function
  searchProducts, // Search function
} = useProducts();
```

#### useProductForm(productId)

Manages product form state:

```javascript
const {
  loading, // Submit loading state
  fetchLoading, // Data fetch loading state
  error, // Error state
  productData, // Fetched product data
  isEditMode, // Edit mode flag
  submitForm, // Form submission function
  refetch, // Refetch product data
} = useProductForm(productId);
```

## API Endpoints

### Products

- `GET /api/v1/products` - List products with filters
- `GET /api/v1/products/:id` - Get single product
- `POST /api/v1/products` - Create product
- `PATCH /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product
- `GET /api/v1/products/search?q=query` - Search products

### Stock Management

- `PATCH /api/v1/products/:id/stock` - Update stock

### Metadata Management

- `GET /api/v1/products/:id/metadata` - Get all metadata
- `GET /api/v1/products/:id/metadata/:key` - Get specific metadata
- `POST /api/v1/products/:id/metadata` - Create/update metadata
- `POST /api/v1/products/:id/metadata/bulk` - Bulk update metadata
- `DELETE /api/v1/products/:id/metadata/:key` - Delete metadata

## Available Filters

When fetching products, you can use these filters:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search query
- `type` - Product type filter
- `status` - Status filter
- `categoryId` - Category filter
- `sortBy` - Sort field (name, price, createdAt)
- `sortOrder` - Sort direction (asc, desc)
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `inStock` - Stock availability filter
- `tags` - Tag filter
- `featured` - Featured products only
- `virtual` - Virtual products only
- `shippingClass` - Shipping class filter

## Usage Examples

### Creating a Simple Product

```javascript
const productData = {
  name: "Basic T-Shirt",
  slug: "basic-t-shirt",
  type: "SIMPLE",
  status: "PUBLISHED",
  basePrice: 29.99,
  salePrice: 24.99,
  description: "A comfortable cotton t-shirt",
  sku: "TSHIRT-001",
  images: [
    { url: "https://example.com/image.jpg", altText: "T-Shirt", name: "Main" },
  ],
};

await productService.create(productData);
```

### Creating a Variable Product

```javascript
const productData = {
  name: "Premium Hoodie",
  slug: "premium-hoodie",
  type: "VARIABLE",
  status: "PUBLISHED",
  basePrice: 79.99,
  attributes: [
    { name: "Size", value: "Small, Medium, Large", variation: true },
    { name: "Color", value: "Black, Navy, Gray", variation: true },
  ],
  variants: [
    {
      name: "Small Black",
      sku: "HOODIE-S-BLK",
      price: 79.99,
      attributes: [
        { name: "Size", value: "Small" },
        { name: "Color", value: "Black" },
      ],
    },
    // ... more variants
  ],
};

await productService.create(productData);
```

### Creating a Subscription Product

```javascript
const productData = {
  name: "Monthly Vitamin Box",
  slug: "monthly-vitamin-box",
  type: "SUBSCRIPTION",
  status: "PUBLISHED",
  basePrice: 49.99,
  subscriptionPeriod: "MONTH",
  subscriptionInterval: 1,
  subscriptionLength: 0, // Never expires
  subscriptionSignUpFee: 0,
  subscriptionTrialLength: 7,
  subscriptionTrialPeriod: "DAY",
};

await productService.create(productData);
```

### Filtering Products

```javascript
const { products, pagination } = await productService.getAll({
  type: "VARIABLE",
  status: "PUBLISHED",
  minPrice: 50,
  maxPrice: 100,
  featured: true,
  page: 1,
  limit: 20,
  sortBy: "name",
  sortOrder: "asc",
});
```

## UI Components Used

The Products feature leverages these shared UI components:

- `PageContainer` - Main container wrapper
- `PageHeader` - Page title and actions
- `DataTable` - Product list table
- `CustomCard` / `CustomCardContent` - Card layouts
- `CustomButton` - Action buttons
- `CustomInput` - Form inputs
- `CustomLabel` - Form labels
- `FormField` - Form field wrapper with error display
- `CustomBadge` - Status and type badges
- `IconButton` - Action icons
- `CustomConfirmationDialog` - Delete confirmation
- `LoadingState` - Loading indicator
- `ErrorState` - Error display

## Validation

### Client-side Validation

- Product name required
- Slug required
- Base price required and must be positive
- Variable products must have at least one attribute
- Type-specific field requirements enforced

### Server-side Validation

- All client validations
- Slug uniqueness
- SKU uniqueness
- Price format validation
- Attribute/variant structure validation
- Subscription settings validation

## Best Practices

1. **Slug Generation**: Slugs are auto-generated from product name but can be manually edited
2. **Product Type**: Cannot be changed after creation (ensures data integrity)
3. **Images**: Store image URLs (integrate with Cloudinary or similar service)
4. **Variants**: Always create variants for variable products with proper attribute mapping
5. **Stock Management**: Enable stock tracking only when needed
6. **SEO**: Always fill in meta fields for better search engine visibility
7. **Status**: Use DRAFT for products under development, PUBLISHED for live products
8. **Pricing**: Ensure sale price is lower than base price for consistency

## Future Enhancements

Potential improvements:

- [ ] Bulk product import/export (CSV/Excel)
- [ ] Product categories assignment
- [ ] Related products
- [ ] Product reviews management
- [ ] Advanced image gallery with drag-and-drop ordering
- [ ] Duplicate product functionality
- [ ] Product tags management
- [ ] Advanced variant generation wizard
- [ ] Stock alerts and notifications
- [ ] Product analytics dashboard
- [ ] Cloudinary integration for image uploads
- [ ] Rich text editor for product descriptions
- [ ] Product comparison feature

## Navigation

The Products feature is accessible from the dashboard sidebar:

- **Products** - Main link to product list (`/dashboard/products`)
- Clicking "+ Add Product" navigates to `/dashboard/products/new`
- Clicking "Edit" on a product navigates to `/dashboard/products/:id/edit`

## Troubleshooting

### Common Issues

1. **Products not loading**

   - Check API connection
   - Verify NEXT_PUBLIC_API_BASE_URL environment variable
   - Check authentication token

2. **Form validation errors**

   - Ensure all required fields are filled
   - Check price formats (must be numeric)
   - Verify attribute/variant structure for variable products

3. **Images not displaying**

   - Verify image URLs are accessible
   - Check CORS settings if images are from external sources
   - Ensure image URLs are HTTPS

4. **Delete not working**
   - Check user permissions
   - Verify product ID
   - Check for related data dependencies

## Related Documentation

- [Categories Feature](./CATEGORIES_FEATURE.md)
- [Components Documentation](./COMPONENTS.md)
- [Project Overview](./PROJECT_OVERVIEW.md)
