# File Manager Architecture Explanation

## How Folders Work

### Client-Side Folder System

Since there's **no folder API endpoint**, folders are managed entirely on the client-side using `localStorage`.

### Storage Keys

1. **`file_manager_folders`** - Stores all folder definitions

   ```javascript
   [
     {
       id: "folder_1234567890_abc",
       name: "My Folder",
       parentId: null, // or another folder ID for nested folders
       createdAt: "2024-01-01T00:00:00.000Z",
       updatedAt: "2024-01-01T00:00:00.000Z",
       itemCount: 0,
     },
   ];
   ```

2. **`file_folder_mappings`** - Maps files to folders

   ```javascript
   {
     "file_id_1": "folder_id_1",
     "file_id_2": "folder_id_1",
     "file_id_3": null // files in root
   }
   ```

3. **`file_renames`** - Stores renamed files
   ```javascript
   {
     "file_id": "new_filename.jpg"
   }
   ```

### Why Folders Don't Appear in API Responses

- **Folders are NOT stored on the server**
- **Folders exist ONLY in the browser's localStorage**
- **API endpoints only return files:**
  - `GET /api/v1/uploads` → Returns files from database
  - No `GET /api/v1/uploads/folders` endpoint exists

### How It Works Together

1. **Creating a folder:**

   - User clicks "New Folder"
   - Folder saved to `localStorage` (NOT sent to API)
   - Folder appears immediately in UI

2. **Uploading files:**

   - Files uploaded to `POST /api/v1/uploads` (stored on server)
   - File IDs mapped to current folder in `localStorage`
   - Files appear in the correct folder

3. **Viewing folder contents:**
   - Fetches ALL files from API
   - Filters files by folder mapping in `localStorage`
   - Shows files that match current folder ID

### Limitations

⚠️ **Important:** Folders are browser-specific:

- If user clears localStorage → Folders are lost
- If user switches browsers → Folders don't transfer
- If user logs in from different device → Folders don't sync

### To Check Your Folders

Open browser console and run:

```javascript
// View all folders
console.log(JSON.parse(localStorage.getItem("file_manager_folders")));

// View file-to-folder mappings
console.log(JSON.parse(localStorage.getItem("file_folder_mappings")));
```

### To Make Folders Server-Side

You would need to:

1. Create folder API endpoints:

   - `POST /api/v1/uploads/folders` - Create folder
   - `GET /api/v1/uploads/folders` - List folders
   - `PATCH /api/v1/uploads/folders/:id` - Update folder
   - `DELETE /api/v1/uploads/folders/:id` - Delete folder

2. Update `folderStorage.js` to use API instead of localStorage
3. Update `useFileManager.js` to fetch folders from API
