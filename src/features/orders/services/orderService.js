import { makeRequest } from "@/utils/makeRequest";

/**
 * Order service for admin API calls
 */
export const orderService = {
  /**
   * Get all orders with filtering and pagination
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Orders data with pagination metadata
   */
  async getAll(params = {}) {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return;
      }

      if (Array.isArray(value)) {
        value
          .filter((item) => item !== undefined && item !== null && item !== "")
          .forEach((item) => queryParams.append(key, item));
        return;
      }

      queryParams.append(key, value);
    });

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/admin/orders${
      queryString ? `?${queryString}` : ""
    }`;

    return makeRequest(endpoint, {
      method: "GET",
    });
  },

  /**
   * Get detailed information about a specific order
   * @param {string} id - Order ID
   * @returns {Promise<Object>} Order data
   */
  async getById(id) {
    return makeRequest(`/api/v1/admin/orders/${id}`, {
      method: "GET",
    });
  },

  /**
   * Update order status
   * @param {string} id - Order ID
   * @param {Object} data - Status update payload
   * @returns {Promise<Object>} Updated order data
   */
  async updateStatus(id, data) {
    return makeRequest(`/api/v1/admin/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * Process a full or partial refund
   * @param {string} id - Order ID
   * @param {Object} data - Refund payload
   * @returns {Promise<Object>} Refund response
   */
  async processRefund(id, data) {
    return makeRequest(`/api/v1/admin/orders/${id}/refund`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Mark order as shipped
   * @param {string} id - Order ID
   * @param {Object} data - Shipping payload
   * @returns {Promise<Object>} Updated order data
   */
  async markAsShipped(id, data) {
    return makeRequest(`/api/v1/admin/orders/${id}/ship`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Retrieve payment intent details
   * @param {string} id - Order ID
   * @returns {Promise<Object>} Stripe payment intent details
   */
  async getPaymentIntent(id) {
    return makeRequest(`/api/v1/admin/orders/${id}/payment-intent`, {
      method: "GET",
    });
  },

  /**
   * Manually capture a pre-authorized payment
   * @param {string} id - Order ID
   * @returns {Promise<Object>} Capture response
   */
  async capturePayment(id) {
    return makeRequest(`/api/v1/admin/orders/${id}/capture`, {
      method: "POST",
    });
  },

  /**
   * Create an order note (customer-visible or internal)
   * @param {string} id - Order ID
   * @param {Object} data - Note payload
   * @returns {Promise<Object>} Created note data
   */
  async addOrderNote(id, data) {
    return makeRequest(`/api/v1/admin/orders/${id}/notes`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Create a system/internal note
   * @param {string} id - Order ID
   * @param {Object} data - System note payload
   * @returns {Promise<Object>} Created note data
   */
  async addSystemNote(id, data) {
    return makeRequest(`/api/v1/admin/orders/${id}/system-notes`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Assign or update the doctor associated with an order
   * @param {string} id - Order ID
   * @param {Object} data - Assignment payload
   * @returns {Promise<Object>} Updated order data
   */
  async assignDoctor(id, doctorId) {
    return makeRequest(`/api/v1/admin/orders/${id}/doctor`, {
      method: "PATCH",
      body: JSON.stringify({
        doctorId: doctorId ?? null,
      }),
    });
  },

  /**
   * Retrieve doctor options for assignment
   * @param {Object} params - Query params (e.g. search)
   * @returns {Promise<Object>} Doctor options
   */
  async getDoctorOptions(params = {}) {
    const query = new URLSearchParams();
    if (params.search) {
      query.set("search", params.search);
    }
    const queryString = query.toString();

    return makeRequest(
      `/api/v1/admin/orders/doctors${queryString ? `?${queryString}` : ""}`,
      {
        method: "GET",
      }
    );
  },

  /**
   * Import an order from WordPress/WooCommerce
   * @param {Object} data - Import payload
   * @returns {Promise<Object>} Created order data
   */
  async importOrder(data) {
    return makeRequest("/api/v1/admin/orders/import", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
