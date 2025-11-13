import { makeRequest } from "@/utils/makeRequest";

/**
 * Blog Tag service for API calls
 */
export const blogTagService = {
    /**
     * Get all blog tags
     * @param {Object} params - Query parameters
     * @param {string} params.search - Search by name or description
     * @param {number} params.page - Page number
     * @param {number} params.limit - Items per page
     * @returns {Promise<Object>} List of blog tags with pagination
     */
    async getAll(params = {}) {
        // Build query string from params
        const queryParams = new URLSearchParams();

        if (params.search) queryParams.append("search", params.search);
        if (params.page) queryParams.append("page", params.page);
        if (params.limit) queryParams.append("limit", params.limit);

        const queryString = queryParams.toString();
        const endpoint = `/api/v1/admin/blogs/tags${
            queryString ? `?${queryString}` : ""
        }`;

        return makeRequest(endpoint, {
            method: "GET",
        });
    },

    /**
     * Get a single blog tag by ID
     * @param {string|number} id - Tag ID
     * @returns {Promise<Object>} Tag data
     */
    async getById(id) {
        return makeRequest(`/api/v1/admin/blogs/tags/${id}`, {
            method: "GET",
        });
    },

    /**
     * Create a new blog tag
     * @param {Object} data - Tag data
     * @returns {Promise<Object>} Created tag
     */
    async create(data) {
        return makeRequest("/api/v1/admin/blogs/tags", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    /**
     * Update a blog tag
     * @param {string|number} id - Tag ID
     * @param {Object} data - Tag data
     * @returns {Promise<Object>} Updated tag
     */
    async update(id, data) {
        return makeRequest(`/api/v1/admin/blogs/tags/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    },

    /**
     * Delete a blog tag
     * @param {string|number} id - Tag ID
     * @returns {Promise<Object>} Deletion result
     */
    async delete(id) {
        return makeRequest(`/api/v1/admin/blogs/tags/${id}`, {
            method: "DELETE",
        });
    },

    /**
     * Bulk delete blog tags
     * @param {Array<string|number>} ids - Array of tag IDs
     * @returns {Promise<Object>} Deletion result
     */
    async bulkDelete(ids) {
        return makeRequest("/api/v1/admin/blogs/tags/bulk-delete", {
            method: "POST",
            body: JSON.stringify({ ids }),
        });
    },
};
