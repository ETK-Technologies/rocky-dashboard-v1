import { makeRequest } from "@/utils/makeRequest";

/**
 * Search service for API calls
 */
export const searchService = {
    /**
     * Search products using Meilisearch
     * @param {Object} params - Search parameters
     * @param {string} params.q - Search query (required)
     * @param {string} [params.type] - Product type filter (SIMPLE, VARIABLE, SUBSCRIPTION, VARIABLE_SUBSCRIPTION)
     * @param {string} [params.categoryIds] - Comma-separated category IDs
     * @param {number} [params.minPrice] - Minimum price filter
     * @param {number} [params.maxPrice] - Maximum price filter
     * @param {boolean} [params.inStock] - Filter by stock status
     * @param {number} [params.limit] - Results limit (default: 20)
     * @param {number} [params.offset] - Results offset (default: 0)
     * @param {string} [params.sort] - Sort by field:direction (e.g., "basePrice:asc")
     * @returns {Promise<Object>} Search results with hits, totalHits, processingTimeMs, and query
     */
    async searchProducts(params = {}) {
        const { q, ...restParams } = params;

        if (!q) {
            throw new Error("Search query (q) is required");
        }

        const queryParams = new URLSearchParams();
        queryParams.append("q", q);

        // Add all other parameters
        Object.keys(restParams).forEach((key) => {
            if (restParams[key] !== undefined && restParams[key] !== null) {
                queryParams.append(key, restParams[key].toString());
            }
        });

        const queryString = queryParams.toString();
        const endpoint = `/api/v1/search/products${
            queryString ? `?${queryString}` : ""
        }`;

        return makeRequest(endpoint, {
            method: "GET",
        });
    },

    /**
     * Search posts using Meilisearch
     * @param {Object} params - Search parameters
     * @param {string} params.q - Search query (required)
     * @param {string} [params.status] - Post status filter (DRAFT, PUBLISHED, ARCHIVED)
     * @param {string} [params.categoryIds] - Comma-separated category IDs
     * @param {number} [params.limit] - Results limit (default: 20)
     * @param {number} [params.offset] - Results offset (default: 0)
     * @param {string} [params.sort] - Sort by field:direction (e.g., "publishedAt:desc")
     * @returns {Promise<Object>} Search results with hits, totalHits, processingTimeMs, and query
     */
    async searchBlogs(params = {}) {
        const { q, ...restParams } = params;

        if (!q) {
            throw new Error("Search query (q) is required");
        }

        const queryParams = new URLSearchParams();
        queryParams.append("q", q);

        // Add all other parameters
        Object.keys(restParams).forEach((key) => {
            if (restParams[key] !== undefined && restParams[key] !== null) {
                queryParams.append(key, restParams[key].toString());
            }
        });

        const queryString = queryParams.toString();
        const endpoint = `/api/v1/search/blogs${
            queryString ? `?${queryString}` : ""
        }`;

        return makeRequest(endpoint, {
            method: "GET",
        });
    },

    /**
     * Reindex all products (Admin only)
     * @returns {Promise<Object>} Reindex status
     */
    async reindex() {
        return makeRequest("/api/v1/search/reindex", {
            method: "POST",
        });
    },

    /**
     * Get search index statistics (Admin only)
     * @returns {Promise<Object>} Search statistics
     */
    async getStats() {
        return makeRequest("/api/v1/search/stats", {
            method: "GET",
        });
    },
};
