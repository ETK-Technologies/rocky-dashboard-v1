import { makeRequest } from "@/utils/makeRequest";

/**
 * Analytics service for API calls
 * All endpoints require admin access
 */
export const analyticsService = {
  /**
   * Get dashboard overview analytics
   * @param {Object} params - Query parameters
   * @param {string} [params.startDate] - Start date (ISO 8601 format)
   * @param {string} [params.endDate] - End date (ISO 8601 format)
   * @param {string} [params.groupBy] - Grouping period: day, week, month, year (default: day)
   * @returns {Promise<Object>} Dashboard overview data
   */
  async getOverview(params = {}) {
    const { startDate, endDate, groupBy = "day" } = params;

    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);
    queryParams.append("groupBy", groupBy);

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/admin/analytics/overview${
      queryString ? `?${queryString}` : ""
    }`;

    return makeRequest(endpoint, {
      method: "GET",
    });
  },

  /**
   * Get sales analytics
   * @param {Object} params - Query parameters
   * @param {string} [params.startDate] - Start date (ISO 8601 format)
   * @param {string} [params.endDate] - End date (ISO 8601 format)
   * @param {string} [params.groupBy] - Grouping period: day, week, month, year (default: day)
   * @returns {Promise<Object>} Sales analytics data
   */
  async getSales(params = {}) {
    const { startDate, endDate, groupBy = "day" } = params;

    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);
    queryParams.append("groupBy", groupBy);

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/admin/analytics/sales${
      queryString ? `?${queryString}` : ""
    }`;

    return makeRequest(endpoint, {
      method: "GET",
    });
  },

  /**
   * Get sales by period (time-series data)
   * @param {Object} params - Query parameters
   * @param {string} [params.startDate] - Start date (ISO 8601 format)
   * @param {string} [params.endDate] - End date (ISO 8601 format)
   * @param {string} [params.groupBy] - Grouping period: day, week, month, year (default: day)
   * @returns {Promise<Object>} Time-series sales data
   */
  async getSalesByPeriod(params = {}) {
    const { startDate, endDate, groupBy = "day" } = params;

    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);
    queryParams.append("groupBy", groupBy);

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/admin/analytics/sales/period${
      queryString ? `?${queryString}` : ""
    }`;

    return makeRequest(endpoint, {
      method: "GET",
    });
  },

  /**
   * Get product performance analytics
   * @param {Object} params - Query parameters
   * @param {string} [params.startDate] - Start date (ISO 8601 format)
   * @param {string} [params.endDate] - End date (ISO 8601 format)
   * @param {string} [params.groupBy] - Grouping period: day, week, month, year (default: day)
   * @returns {Promise<Object>} Product performance data
   */
  async getProducts(params = {}) {
    const { startDate, endDate, groupBy = "day" } = params;

    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);
    queryParams.append("groupBy", groupBy);

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/admin/analytics/products${
      queryString ? `?${queryString}` : ""
    }`;

    return makeRequest(endpoint, {
      method: "GET",
    });
  },

  /**
   * Get customer analytics
   * @param {Object} params - Query parameters
   * @param {string} [params.startDate] - Start date (ISO 8601 format)
   * @param {string} [params.endDate] - End date (ISO 8601 format)
   * @param {string} [params.groupBy] - Grouping period: day, week, month, year (default: day)
   * @returns {Promise<Object>} Customer analytics data
   */
  async getCustomers(params = {}) {
    const { startDate, endDate, groupBy = "day" } = params;

    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);
    queryParams.append("groupBy", groupBy);

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/admin/analytics/customers${
      queryString ? `?${queryString}` : ""
    }`;

    return makeRequest(endpoint, {
      method: "GET",
    });
  },

  /**
   * Get subscription metrics
   * @param {Object} params - Query parameters
   * @param {string} [params.startDate] - Start date (ISO 8601 format)
   * @param {string} [params.endDate] - End date (ISO 8601 format)
   * @param {string} [params.groupBy] - Grouping period: day, week, month, year (default: day)
   * @returns {Promise<Object>} Subscription metrics data
   */
  async getSubscriptions(params = {}) {
    const { startDate, endDate, groupBy = "day" } = params;

    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);
    queryParams.append("groupBy", groupBy);

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/admin/analytics/subscriptions${
      queryString ? `?${queryString}` : ""
    }`;

    return makeRequest(endpoint, {
      method: "GET",
    });
  },

  /**
   * Get coupon analytics
   * @param {Object} params - Query parameters
   * @param {string} [params.startDate] - Start date (ISO 8601 format)
   * @param {string} [params.endDate] - End date (ISO 8601 format)
   * @param {string} [params.groupBy] - Grouping period: day, week, month, year (default: day)
   * @returns {Promise<Object>} Coupon analytics data
   */
  async getCoupons(params = {}) {
    const { startDate, endDate, groupBy = "day" } = params;

    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);
    queryParams.append("groupBy", groupBy);

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/admin/analytics/coupons${
      queryString ? `?${queryString}` : ""
    }`;

    return makeRequest(endpoint, {
      method: "GET",
    });
  },
};
