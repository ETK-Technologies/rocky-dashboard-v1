import { makeRequest } from "@/utils/makeRequest";

/**
 * Email template service for API calls
 * Uses the actual backend API: /api/v1/admin/settings/email/templates
 */
export const emailTemplateService = {
  /**
   * Get all email templates
   * @param {Object} params - Query parameters (e.g., { scope: "ORDER" })
   * @returns {Promise<Array>} Array of templates
   */
  async getAll(params = {}) {
    const queryParams = new URLSearchParams();

    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/admin/settings/email/templates${
      queryString ? `?${queryString}` : ""
    }`;

    return makeRequest(endpoint, {
      method: "GET",
    });
  },

  /**
   * Get a single email template by ID
   * @param {string} id - Template ID
   * @returns {Promise<Object>} Template data
   */
  async getById(id) {
    // The API doesn't have a GET by ID endpoint, so we'll get all and find the one
    const templates = await this.getAll();
    const template = templates.find((t) => t.id === id);

    if (!template) {
      throw new Error("Template not found");
    }

    // Convert API format to our format
    return {
      id: template.id,
      name: template.name,
      subject: template.subject,
      html: template.bodyHtml,
      bodyText: template.bodyText,
      design: template.metadata?.design || null,
      description: template.description,
      scope: template.scope,
      trigger: template.trigger,
      variables: template.variables || [],
      isEnabled: template.isEnabled,
      metadata: template.metadata || {},
    };
  },

  /**
   * Create a new email template
   * @param {Object} data - Template data { name, subject, html, design, scope, trigger, etc. }
   * @returns {Promise<Object>} Created template
   */
  async create(data) {
    const html = data.html || data.bodyHtml || "";
    const subject = data.subject || "";
    
    // Extract variables from both HTML and subject
    const extractedVariables = this.extractVariables(html, subject);
    
    // Use provided variables or extracted ones (merge if both exist)
    const variables = data.variables && data.variables.length > 0
      ? [...new Set([...data.variables, ...extractedVariables])]
      : extractedVariables;
    
    // Convert our format to API format
    const apiData = {
      name: data.name,
      description: data.description || "",
      scope: data.scope || "CUSTOM",
      trigger: data.trigger || (data.scope === "CUSTOM" ? "manual" : ""),
      subject: subject,
      bodyHtml: html,
      bodyText: data.bodyText || this.extractTextFromHtml(html),
      variables: variables,
      metadata: {
        category: data.metadata?.category || "",
        design: data.design, // Store the GrapesJS design JSON in metadata
        ...(data.metadata || {}),
      },
      isEnabled: data.isEnabled !== false,
    };

    return makeRequest("/api/v1/admin/settings/email/templates", {
      method: "POST",
      body: JSON.stringify(apiData),
    });
  },

  /**
   * Update an email template
   * @param {string} id - Template ID
   * @param {Object} data - Template data
   * @returns {Promise<Object>} Updated template
   */
  async update(id, data) {
    const html = data.html || data.bodyHtml || "";
    const subject = data.subject || "";
    
    // Extract variables from both HTML and subject
    const extractedVariables = this.extractVariables(html, subject);
    
    // Use provided variables or extracted ones (merge if both exist)
    const variables = data.variables && data.variables.length > 0
      ? [...new Set([...data.variables, ...extractedVariables])]
      : extractedVariables;
    
    // Convert our format to API format
    const apiData = {
      name: data.name,
      description: data.description || "",
      scope: data.scope || "CUSTOM",
      trigger: data.trigger || (data.scope === "CUSTOM" ? "manual" : ""),
      subject: subject,
      bodyHtml: html,
      bodyText: data.bodyText || this.extractTextFromHtml(html),
      variables: variables,
      metadata: {
        category: data.metadata?.category || "",
        design: data.design, // Store the GrapesJS design JSON in metadata
        ...(data.metadata || {}),
      },
      isEnabled: data.isEnabled !== false,
    };

    return makeRequest(`/api/v1/admin/settings/email/templates/${id}`, {
      method: "PATCH",
      body: JSON.stringify(apiData),
    });
  },

  /**
   * Delete/Archive an email template
   * @param {string} id - Template ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    return makeRequest(`/api/v1/admin/settings/email/templates/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Send a test email
   * @param {Object} data - Test email data { to, subject, html, text, variables }
   * @returns {Promise<Object>} Response
   */
  async sendTestEmail(data) {
    const testData = {
      to: data.to,
      subject: data.subject || "Test Email",
      html: data.html || "",
      text: data.text || this.extractTextFromHtml(data.html || ""),
      variables: data.variables || {},
    };

    return makeRequest("/api/v1/admin/settings/email/test", {
      method: "POST",
      body: JSON.stringify(testData),
    });
  },

  /**
   * Preview a rendered email template
   * @param {string} id - Template ID
   * @param {Object} variables - Variables to use for preview
   * @returns {Promise<Object>} Rendered template with subject and body
   */
  async preview(id, variables = {}) {
    return makeRequest(`/api/v1/admin/settings/email/templates/${id}/preview`, {
      method: "POST",
      body: JSON.stringify({ variables }),
    });
  },

  /**
   * Extract text from HTML (simple version)
   * @param {string} html - HTML string
   * @returns {string} Plain text
   */
  extractTextFromHtml(html) {
    if (!html) return "";
    // Simple text extraction - remove HTML tags
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .trim();
  },

  /**
   * Extract variables from HTML/design and subject
   * @param {string} html - HTML string
   * @param {string} subject - Subject string (optional)
   * @returns {Array<string>} Array of variable names in format "user.name"
   */
  extractVariables(html, subject = "") {
    const allText = [html, subject].filter(Boolean).join(" ");
    if (!allText) return [];
    // Extract variables in format {{variable}} or {variable}
    // API expects format like "user.name", "order.id", etc.
    const matches = allText.match(/\{\{(\w+(?:\.\w+)*)\}\}/g);
    if (!matches) return [];
    // Return unique variable names without braces
    // Convert {{user.name}} to "user.name"
    const variableNames = matches.map((m) => {
      // Remove all braces and return the variable path
      return m.replace(/[{}]/g, "");
    });
    return [...new Set(variableNames)];
  },

  /**
   * Get all email test users
   * @returns {Promise<Array>} Array of test users
   */
  async getTestUsers() {
    return makeRequest("/api/v1/admin/settings/email/test-users", {
      method: "GET",
    });
  },

  /**
   * Create a new email test user
   * @param {Object} data - Test user data { email, name, description, isActive }
   * @returns {Promise<Object>} Created test user
   */
  async createTestUser(data) {
    return makeRequest("/api/v1/admin/settings/email/test-users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
