import { makeRequest } from "@/utils/makeRequest";

/**
 * Blog Category service for API calls
 */
export const blogCategoryService = {
    /**
     * Get all blog categories
     * @param {Object} params - Query parameters
     * @param {string} params.search - Search by name or description
     * @param {string} params.parentId - Filter by parent category ID
     * @param {boolean} params.isActive - Filter by active status
     * @param {number} params.page - Page number
     * @param {number} params.limit - Items per page
     * @returns {Promise<Object>} List of blog categories with pagination
     */
    async getAll(params = {}) {
        // Build query string from params
        const queryParams = new URLSearchParams();

        if (params.search) queryParams.append("search", params.search);
        if (params.parentId !== undefined)
            queryParams.append("parentId", params.parentId);
        if (params.isActive !== undefined)
            queryParams.append("isActive", params.isActive);
        if (params.page) queryParams.append("page", params.page);
        if (params.limit) queryParams.append("limit", params.limit);

        const queryString = queryParams.toString();
        const endpoint = `/api/v1/admin/blogs/categories${
            queryString ? `?${queryString}` : ""
        }`;

        return makeRequest(endpoint, {
            method: "GET",
        });
    },

    /**
     * Get a single blog category by ID
     * @param {string|number} id - Category ID
     * @returns {Promise<Object>} Category data
     */
    async getById(id) {
        return makeRequest(`/api/v1/admin/blogs/categories/${id}`, {
            method: "GET",
        });
    },

    /**
     * Create a new blog category
     * @param {Object} data - Category data
     * @returns {Promise<Object>} Created category
     */
    async create(data) {
        return makeRequest("/api/v1/admin/blogs/categories", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    /**
     * Update a blog category
     * @param {string|number} id - Category ID
     * @param {Object} data - Category data
     * @returns {Promise<Object>} Updated category
     */
    async update(id, data) {
        return makeRequest(`/api/v1/admin/blogs/categories/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    },

    /**
     * Delete a blog category
     * @param {string|number} id - Category ID
     * @returns {Promise<Object>} Deletion result
     */
    async delete(id) {
        return makeRequest(`/api/v1/admin/blogs/categories/${id}`, {
            method: "DELETE",
        });
    },

    /**
     * Bulk delete blog categories
     * @param {Array<string|number>} ids - Array of category IDs
     * @returns {Promise<Object>} Deletion result
     */
    async bulkDelete(ids) {
        return makeRequest("/api/v1/admin/blogs/categories/bulk-delete", {
            method: "POST",
            body: JSON.stringify({ ids }),
        });
    },
};
