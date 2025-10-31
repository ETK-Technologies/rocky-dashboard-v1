# Backend API Endpoints Required for File Manager

## 📋 Complete API Endpoint List

### 1. Folder Management Endpoints

#### Create Folder

```
POST /api/v1/uploads/folders
Content-Type: application/json
Authorization: Bearer <token>

Request Body:
{
  "name": "My Folder",
  "parentId": null | "folder_id" // null for root level
}

Response (201 Created):
{
  "id": "folder_123",
  "name": "My Folder",
  "parentId": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "itemCount": 0
}
```

#### List Folders

```
GET /api/v1/uploads/folders?parentId=null
Authorization: Bearer <token>

Query Parameters:
- parentId (optional): Filter by parent folder ID (null for root)
- search (optional): Search folders by name
- sortBy (optional): createdAt, name, updatedAt
- sortOrder (optional): asc, desc
- limit (optional): Number of results
- offset (optional): Pagination offset

Response (200 OK):
{
  "folders": [
    {
      "id": "folder_123",
      "name": "My Folder",
      "parentId": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "itemCount": 5
    }
  ],
  "pagination": {
    "total": 10,
    "limit": 20,
    "offset": 0,
    "pages": 1
  }
}
```

#### Get Folder by ID

```
GET /api/v1/uploads/folders/:id
Authorization: Bearer <token>

Response (200 OK):
{
  "id": "folder_123",
  "name": "My Folder",
  "parentId": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "itemCount": 5,
  "filesCount": 3,
  "foldersCount": 2
}
```

#### Update Folder (Rename)

```
PATCH /api/v1/uploads/folders/:id
Content-Type: application/json
Authorization: Bearer <token>

Request Body:
{
  "name": "Renamed Folder"
}

Response (200 OK):
{
  "id": "folder_123",
  "name": "Renamed Folder",
  "parentId": null,
  "updatedAt": "2024-01-01T01:00:00.000Z"
}
```

#### Move Folder

```
PATCH /api/v1/uploads/folders/:id/move
Content-Type: application/json
Authorization: Bearer <token>

Request Body:
{
  "parentId": "new_parent_folder_id" | null
}

Response (200 OK):
{
  "id": "folder_123",
  "name": "My Folder",
  "parentId": "new_parent_folder_id",
  "updatedAt": "2024-01-01T01:00:00.000Z"
}
```

#### Delete Folder

```
DELETE /api/v1/uploads/folders/:id
Authorization: Bearer <token>

Response (200 OK):
{
  "message": "Folder deleted successfully",
  "id": "folder_123"
}

Note: Should handle:
- Recursive deletion of subfolders
- Moving files to parent folder or root
- Or rejecting deletion if folder contains items (based on your business logic)
```

---

### 2. File-to-Folder Relationship Endpoints

#### Assign File to Folder (Move File)

```
PATCH /api/v1/uploads/:fileId/folder
Content-Type: application/json
Authorization: Bearer <token>

Request Body:
{
  "folderId": "folder_123" | null // null to move to root
}

Response (200 OK):
{
  "id": "file_456",
  "folderId": "folder_123",
  "updatedAt": "2024-01-01T01:00:00.000Z"
}
```

#### Get Files in Folder

```
GET /api/v1/uploads?folderId=folder_123
Authorization: Bearer <token>

Query Parameters:
- folderId (optional): Filter files by folder (null for root files)
- search (optional): Search files by name
- mimeType (optional): Filter by MIME type
- sortBy (optional): createdAt, name, size
- sortOrder (optional): asc, desc
- limit (optional): Number of results
- offset (optional): Pagination offset

Response (200 OK):
{
  "files": [
    {
      "id": "file_456",
      "originalName": "image.jpg",
      "filename": "uploaded_image_123.jpg",
      "mimeType": "image/jpeg",
      "size": 1024000,
      "cdnUrl": "https://cdn.example.com/file.jpg",
      "folderId": "folder_123",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 50,
    "limit": 20,
    "offset": 0,
    "pages": 3
  }
}
```

#### Bulk Move Files

```
PATCH /api/v1/uploads/bulk-move
Content-Type: application/json
Authorization: Bearer <token>

Request Body:
{
  "fileIds": ["file_1", "file_2", "file_3"],
  "folderId": "folder_123" | null
}

Response (200 OK):
{
  "message": "3 files moved successfully",
  "updated": 3
}
```

---

### 3. Enhanced Upload Endpoint (Optional - to assign folder during upload)

#### Upload Files to Specific Folder

```
POST /api/v1/uploads
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- files: File[] (multiple files)
- folderId: string | null (optional, defaults to null/root)

Response (201 Created):
{
  "message": "Files uploaded successfully",
  "files": [
    {
      "id": "file_789",
      "originalName": "photo.jpg",
      "filename": "uploaded_photo_123.jpg",
      "mimeType": "image/jpeg",
      "size": 2048000,
      "cdnUrl": "https://cdn.example.com/photo.jpg",
      "folderId": "folder_123",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 4. Folder Statistics Endpoint (Optional - for item counts)

#### Get Folder Statistics

```
GET /api/v1/uploads/folders/:id/stats
Authorization: Bearer <token>

Response (200 OK):
{
  "folderId": "folder_123",
  "filesCount": 10,
  "foldersCount": 3,
  "totalItems": 13,
  "totalSize": 52428800 // bytes
}
```

---

### 5. Rename File Endpoint (If not already exists)

#### Rename File

```
PATCH /api/v1/uploads/:id
Content-Type: application/json
Authorization: Bearer <token>

Request Body:
{
  "originalName": "new_filename.jpg"
}

Response (200 OK):
{
  "id": "file_456",
  "originalName": "new_filename.jpg",
  "updatedAt": "2024-01-01T01:00:00.000Z"
}
```

---

## 📊 Database Schema Requirements

### Folders Table

```sql
CREATE TABLE folders (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  parentId VARCHAR(255) NULL, -- Foreign key to folders.id
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  createdBy VARCHAR(255), -- User ID who created
  FOREIGN KEY (parentId) REFERENCES folders(id) ON DELETE CASCADE
);
```

### Files Table (Update existing)

```sql
-- Add folderId column if not exists
ALTER TABLE uploads ADD COLUMN folderId VARCHAR(255) NULL;
ALTER TABLE uploads ADD FOREIGN KEY (folderId) REFERENCES folders(id) ON DELETE SET NULL;
```

---

## 🔐 Permission Requirements

- **Super Admin**: Full access to all folders and files
- **Admin**: Can create/manage folders, upload files
- All endpoints should require authentication (JWT token)

---

## ✅ Implementation Checklist

### Backend Tasks:

- [ ] Create folders table in database
- [ ] Add folderId column to files/uploads table
- [ ] Implement folder CRUD endpoints
- [ ] Implement file-to-folder assignment endpoint
- [ ] Update file upload endpoint to accept folderId
- [ ] Update file listing endpoint to filter by folderId
- [ ] Implement folder statistics endpoint
- [ ] Add validation (prevent circular folder references)
- [ ] Add permission checks
- [ ] Handle recursive folder deletion
- [ ] Update file rename endpoint (if needed)

### Frontend Tasks (After Backend is Ready):

- [ ] Update `folderStorage.js` to use API instead of localStorage
- [ ] Update `useFileManager.js` to fetch folders from API
- [ ] Update `uploadService.js` to include folderId in upload
- [ ] Remove localStorage folder logic
- [ ] Add error handling for API failures

---

## 📝 Example API Response Formats

### Success Response:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response:

```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

---

## 🚨 Important Considerations

1. **Circular References**: Prevent folders from being moved into themselves or their descendants
2. **Cascade Deletion**: Decide how to handle files when folder is deleted
   - Option A: Move files to parent folder
   - Option B: Move files to root
   - Option C: Reject deletion if folder contains files
3. **Performance**: Consider adding indexes on `folderId` and `parentId` columns
4. **Validation**:
   - Folder names must be unique within same parent
   - Folder names cannot be empty
   - Validate parentId exists (if not null)
