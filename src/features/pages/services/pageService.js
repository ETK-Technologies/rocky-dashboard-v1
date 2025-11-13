import { makeRequest } from "@/utils/makeRequest";

/**
 * Page service for API calls
 */
export const pageService = {
    /**
     * Get all pages with filtering and pagination
     * @param {Object} params - Query parameters
     * @param {string} params.search - Full-text search across title, excerpt, and content
     * @param {string} params.status - Filter by status (DRAFT, PUBLISHED, ARCHIVED)
     * @param {string} params.authorId - Filter by author ID
     * @param {string} params.template - Filter by template identifier
     * @param {string} params.sortBy - Sort field (createdAt, updatedAt, publishedAt, title)
     * @param {string} params.sortOrder - Sort order (asc, desc)
     * @param {number} params.page - Page number
     * @param {number} params.limit - Items per page
     * @returns {Promise<Object>} Pages data with pagination
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
        const endpoint = `/api/v1/admin/pages${
            queryString ? `?${queryString}` : ""
        }`;

        return makeRequest(endpoint, {
            method: "GET",
        });
    },

    /**
     * Get a single page by ID
     * @param {string} id - Page ID
     * @returns {Promise<Object>} Page data
     */
    async getById(id) {
        return makeRequest(`/api/v1/admin/pages/${id}`, {
            method: "GET",
        });
    },

    /**
     * Create a new page
     * @param {Object} data - Page data
     * @returns {Promise<Object>} Created page
     */
    async create(data) {
        return makeRequest("/api/v1/admin/pages", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    /**
     * Update a page
     * @param {string} id - Page ID
     * @param {Object} data - Page data
     * @returns {Promise<Object>} Updated page
     */
    async update(id, data) {
        return makeRequest(`/api/v1/admin/pages/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    },

    /**
     * Delete a page (soft delete)
     * @param {string} id - Page ID
     * @returns {Promise<void>}
     */
    async delete(id) {
        return makeRequest(`/api/v1/admin/pages/${id}`, {
            method: "DELETE",
        });
    },

    /**
     * Bulk delete pages
     * @param {Array<string>} ids - Array of page IDs
     * @returns {Promise<Object>} Response with deletedCount, deletedIds, and missingIds
     */
    async bulkDelete(ids) {
        return makeRequest("/api/v1/admin/pages/bulk-delete", {
            method: "POST",
            body: JSON.stringify({ ids }),
        });
    },
};
