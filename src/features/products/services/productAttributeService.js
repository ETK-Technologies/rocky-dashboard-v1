import { makeRequest } from "@/utils/makeRequest";

/**
 * Product attribute service for API calls
 * Manages inline product attributes (stored directly on product)
 * These are ProductAttributeDto objects: { name, value, slug, position, visible, variation }
 */
export const productAttributeService = {
  /**
   * Get all attributes for a product
   * @param {string} productId - Product ID
   * @returns {Promise<Array>} Array of ProductAttributeDto
   */
  async getAll(productId) {
    const response = await makeRequest(
      `/api/v1/admin/products/${productId}/attributes`,
      {
        method: "GET",
      }
    );
    // Normalize response - extract data if wrapped
    return response?.data || response || [];
  },

  /**
   * Add or update attributes for a product
   * @param {string} productId - Product ID
   * @param {Array<ProductAttributeDto>} attributes - Array of ProductAttributeDto
   * @returns {Promise<Array>} Updated attributes array
   */
  async upsert(productId, attributes) {
    // Ensure all attributes are in ProductAttributeDto format
    const normalizedAttributes = attributes.map((attr) => {
      if (typeof attr === "string") {
        // If string, convert to ProductAttributeDto
        return {
          name: attr,
          value: attr,
          slug: attr.toLowerCase().replace(/\s+/g, "-"),
          position: 0,
          visible: true,
          variation: false,
        };
      }
      // Ensure all required fields are present
      return {
        name: attr.name || "",
        value: attr.value || "",
        slug: attr.slug || attr.name?.toLowerCase().replace(/\s+/g, "-") || "",
        position: attr.position ?? 0,
        visible: attr.visible !== undefined ? attr.visible : true,
        variation: attr.variation !== undefined ? attr.variation : false,
      };
    });

    const response = await makeRequest(
      `/api/v1/admin/products/${productId}/attributes`,
      {
        method: "POST",
        body: JSON.stringify(normalizedAttributes),
      }
    );
    // Normalize response
    return response?.data || response || [];
  },

  /**
   * Delete an attribute from a product by name
   * @param {string} productId - Product ID
   * @param {string} name - Attribute name
   * @returns {Promise<void>}
   */
  async delete(productId, name) {
    return makeRequest(
      `/api/v1/admin/products/${productId}/attributes/${encodeURIComponent(
        name
      )}`,
      {
        method: "DELETE",
      }
    );
  },
};
