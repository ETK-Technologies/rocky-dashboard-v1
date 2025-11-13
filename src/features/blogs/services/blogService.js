import { makeRequest } from "@/utils/makeRequest";

/**
 * Blog service for API calls
 */
export const blogService = {
    /**
     * Get all blogs with filtering and pagination
     * @param {Object} params - Query parameters
     * @param {string} params.search - Full-text search across title, excerpt, and content
     * @param {string} params.status - Filter by status (DRAFT, SCHEDULED, PUBLISHED)
     * @param {string} params.categoryId - Filter by category ID
     * @param {string} params.tagId - Filter by tag ID
     * @param {string} params.authorId - Filter by author ID
     * @param {boolean} params.isFeatured - Filter by featured posts
     * @param {string} params.sortBy - Sort field (createdAt, updatedAt, publishedAt)
     * @param {string} params.sortOrder - Sort order (asc, desc)
     * @param {number} params.page - Page number
     * @param {number} params.limit - Items per page
     * @returns {Promise<Object>} Blogs data with pagination
     */
    async getAll(params = {}) {
        const queryParams = new URLSearchParams();

        // Add all provided parameters
        Object.keys(params).forEach((key) => {
            if (params[key] !== undefined && params[key] !== null) {
                queryParams.append(key, params[key]);
            }
        });

        const queryString = queryParams.toString();
        const endpoint = `/api/v1/admin/blogs/posts${
            queryString ? `?${queryString}` : ""
        }`;

        return makeRequest(endpoint, {
            method: "GET",
        });
    },

    /**
     * Get a single blog by ID or slug
     * @param {string} id - Blog ID or slug
     * @returns {Promise<Object>} Blog data
     */
    async getById(id) {
        return makeRequest(`/api/v1/admin/blogs/posts/${id}`, {
            method: "GET",
        });
    },

    /**
     * Search posts by query
     * @param {string} query - Search query
     * @param {number} limit - Result limit
     * @returns {Promise<Array>} Search results
     */
    async search(query, limit = 10) {
        const queryParams = new URLSearchParams({ q: query, limit });
        return makeRequest(`/api/v1/blogs/search?${queryParams.toString()}`, {
            method: "GET",
        });
    },

    /**
     * Create a new post
     * @param {Object} data - Blog data
     * @returns {Promise<Object>} Created post
     */
    async create(data) {
        return makeRequest("/api/v1/admin/blogs/posts", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    /**
     * Update a post
     * @param {string} id - Blog ID
     * @param {Object} data - Blog data
     * @returns {Promise<Object>} Updated post
     */
    async update(id, data) {
        return makeRequest(`/api/v1/admin/blogs/posts/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    },

    /**
     * Delete a post (soft delete)
     * @param {string} id - Blog ID
     * @returns {Promise<void>}
     */
    async delete(id) {
        return makeRequest(`/api/v1/admin/blogs/posts/${id}`, {
            method: "DELETE",
        });
    },

    /**
     * Bulk delete posts
     * @param {Array<string>} ids - Array of post IDs
     * @returns {Promise<Object>} Response with deletedCount, deletedIds, and missingIds
     */
    async bulkDelete(ids) {
        return makeRequest("/api/v1/admin/blogs/posts/bulk-delete", {
            method: "POST",
            body: JSON.stringify({ ids }),
        });
    },

    /**
     * Get all metadata for a post
     * @param {string} id - Blog ID
     * @returns {Promise<Array>} Metadata array
     */
    async getMetadata(id) {
        return makeRequest(`/api/v1/blogs/${id}/metadata`, {
            method: "GET",
        });
    },

    /**
     * Get specific metadata field by key
     * @param {string} id - Blog ID
     * @param {string} key - Metadata key
     * @returns {Promise<Object>} Metadata value
     */
    async getMetadataByKey(id, key) {
        return makeRequest(`/api/v1/blogs/${id}/metadata/${key}`, {
            method: "GET",
        });
    },

    /**
     * Create or update post metadata field
     * @param {string} id - Blog ID
     * @param {Object} data - Metadata {key, value}
     * @returns {Promise<Object>} Metadata object
     */
    async upsertMetadata(id, data) {
        return makeRequest(`/api/v1/blogs/${id}/metadata`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    /**
     * Bulk update post metadata
     * @param {string} id - Blog ID
     * @param {Array} metadataArray - Array of {key, value} objects
     * @returns {Promise<Array>} Updated metadata array
     */
    async bulkUpdateMetadata(id, metadataArray) {
        return makeRequest(`/api/v1/blogs/${id}/metadata/bulk`, {
            method: "POST",
            body: JSON.stringify(metadataArray),
        });
    },

    /**
     * Delete specific metadata field
     * @param {string} id - Blog ID
     * @param {string} key - Metadata key
     * @returns {Promise<void>}
     */
    async deleteMetadata(id, key) {
        return makeRequest(`/api/v1/blogs/${id}/metadata/${key}`, {
            method: "DELETE",
        });
    },
};
