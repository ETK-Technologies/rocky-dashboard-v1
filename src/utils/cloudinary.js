/**
 * Cloudinary image upload utility
 *
 * Setup instructions:
 * 1. Create a Cloudinary account at https://cloudinary.com
 * 2. Get your cloud name and upload preset
 * 3. Add to .env.local:
 *    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
 *    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
 */

/**
 * Upload an image to Cloudinary
 * @param {File} file - Image file to upload
 * @param {Object} options - Upload options
 * @returns {Promise<string>} - URL of uploaded image
 */
export async function uploadToCloudinary(file, options = {}) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary configuration missing. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET"
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  // Optional: Add folder organization
  if (options.folder) {
    formData.append("folder", options.folder);
  }

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();

    // Return the secure URL of the uploaded image
    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
}

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - Public ID of the image to delete
 * @returns {Promise<Object>} - Deletion result
 */
export async function deleteFromCloudinary(publicId) {
  // Note: Deletion requires server-side API with authentication
  // This should be implemented as an API route in Next.js
  console.warn("Image deletion should be handled server-side");

  // Example implementation would be:
  // return fetch('/api/cloudinary/delete', {
  //   method: 'POST',
  //   body: JSON.stringify({ publicId })
  // });
}

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} - Public ID or null
 */
export function getPublicIdFromUrl(url) {
  if (!url || typeof url !== "string") return null;

  try {
    // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/image.jpg
    const parts = url.split("/");
    const uploadIndex = parts.indexOf("upload");

    if (uploadIndex === -1) return null;

    // Get everything after upload/ and remove version
    const pathParts = parts.slice(uploadIndex + 1);

    // Remove version if present (v1234567890)
    if (pathParts[0].startsWith("v") && !isNaN(pathParts[0].substring(1))) {
      pathParts.shift();
    }

    // Join and remove extension
    const publicId = pathParts.join("/");
    return publicId.replace(/\.[^/.]+$/, "");
  } catch (error) {
    console.error("Error extracting public ID:", error);
    return null;
  }
}
