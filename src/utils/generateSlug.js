/**
 * Generate a URL-friendly slug from a string
 * @param {string} text - The text to convert to a slug
 * @returns {string} - The generated slug
 */
export function generateSlug(text) {
  if (!text) return "";

  return text
    .toString()
    .toLowerCase()
    .trim()
    // Replace spaces with hyphens
    .replace(/\s+/g, "-")
    // Remove special characters except hyphens
    .replace(/[^\w\-]+/g, "")
    // Replace multiple consecutive hyphens with a single hyphen
    .replace(/\-\-+/g, "-")
    // Remove leading and trailing hyphens
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}
