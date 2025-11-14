/**
 * Centralized HTTP request utility
 * Makes API calls with proper error handling and automatic token refresh
 */

// Track refresh token promise to prevent concurrent refresh attempts
let refreshTokenPromise = null;

// Store reference to auth store's clearAuth method (set dynamically to avoid circular dependency)
let clearAuthStore = null;

/**
 * Set the auth store's clearAuth method
 * This allows makeRequest to clear auth state in the store when refresh fails
 */
export const setAuthStoreClearAuth = (clearAuthFn) => {
  clearAuthStore = clearAuthFn;
};

/**
 * Get access token from localStorage
 */
const getAccessToken = () => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("access_token");
  } catch {
    return null;
  }
};

/**
 * Get refresh token from localStorage
 */
const getRefreshToken = () => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("refresh_token");
  } catch {
    return null;
  }
};

/**
 * Save tokens to localStorage
 */
const saveTokens = (accessToken, refreshToken) => {
  if (typeof window === "undefined") return false;
  try {
    if (accessToken) {
      localStorage.setItem("access_token", accessToken);
    }
    if (refreshToken) {
      localStorage.setItem("refresh_token", refreshToken);
    }
    return true;
  } catch (error) {
    console.error("Error saving tokens:", error);
    return false;
  }
};

/**
 * Clear all auth tokens
 */
const clearAuth = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  } catch (error) {
    console.error("Error clearing auth:", error);
  }
};

/**
 * Refresh access token using refresh token
 */
const refreshAccessToken = async () => {
  // If refresh is already in progress, wait for it
  if (refreshTokenPromise) {
    return refreshTokenPromise;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  // Create refresh promise
  refreshTokenPromise = (async () => {
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!baseURL) {
        throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
      }

      const url = `${baseURL}/api/v1/auth/refresh`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        data = {
          message: responseText || "An error occurred",
        };
      }

      if (!response.ok) {
        // Refresh failed - clear auth and throw error
        clearAuth();
        // Also clear auth store if available
        if (clearAuthStore) {
          clearAuthStore();
        }
        throw {
          status: response.status,
          statusCode: response.status,
          message: data.message || "Token refresh failed",
          error: data.error || "HTTPError",
          data,
        };
      }

      if (!data || !data.access_token) {
        clearAuth();
        // Also clear auth store if available
        if (clearAuthStore) {
          clearAuthStore();
        }
        throw {
          status: 401,
          statusCode: 401,
          message: "Invalid refresh response",
          error: "AuthError",
        };
      }

      // Save new tokens
      saveTokens(data.access_token, data.refresh_token || refreshToken);

      return data.access_token;
    } finally {
      // Clear the promise so next refresh can proceed
      refreshTokenPromise = null;
    }
  })();

  return refreshTokenPromise;
};

export async function makeRequest(endpoint, options = {}) {
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseURL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
  }

  const url = `${baseURL}${endpoint}`;

  // Skip token refresh for auth endpoints
  const isAuthEndpoint =
    endpoint.includes("/auth/login") ||
    endpoint.includes("/auth/refresh") ||
    endpoint.includes("/auth/logout");

  // Get access token from localStorage
  const accessToken = getAccessToken();

  // Don't set Content-Type for FormData - let browser set it automatically
  const isFormData = options.body instanceof FormData;

  const defaultHeaders = isFormData
    ? {
        ...(accessToken && !isAuthEndpoint && {
          Authorization: `Bearer ${accessToken}`,
        }),
        ...options.headers,
      }
    : {
        "Content-Type": "application/json",
        ...(accessToken && !isAuthEndpoint && {
          Authorization: `Bearer ${accessToken}`,
        }),
        ...options.headers,
      };

  const config = {
    ...options,
    headers: defaultHeaders,
  };

  // Log request start
  const startTime = performance.now();
  console.log(`🌐 API Request: ${options.method || "GET"} ${url}`);

  try {
    const response = await fetch(url, config);

    // Get response text first to handle non-JSON responses
    const responseText = await response.text();
    let data;

    // Try to parse as JSON
    try {
      data = JSON.parse(responseText);
    } catch {
      // If not JSON, create an error message
      data = {
        message: responseText || "An error occurred",
      };
    }

    // Calculate request duration
    const duration = (performance.now() - startTime).toFixed(2);

    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && !isAuthEndpoint && accessToken) {
      console.log("🔄 Access token expired, attempting refresh...");

      try {
        // Attempt to refresh the token
        const newAccessToken = await refreshAccessToken();

        // Retry the original request with new token
        console.log("🔄 Retrying request with new token...");
        const retryConfig = {
          ...config,
          headers: {
            ...config.headers,
            Authorization: `Bearer ${newAccessToken}`,
          },
        };

        const retryResponse = await fetch(url, retryConfig);
        const retryResponseText = await retryResponse.text();
        let retryData;

        try {
          retryData = JSON.parse(retryResponseText);
        } catch {
          retryData = {
            message: retryResponseText || "An error occurred",
          };
        }

        const retryDuration = (performance.now() - startTime).toFixed(2);

        if (!retryResponse.ok) {
          // Retry also failed - clear auth and throw error
          clearAuth();
          // Also clear auth store if available
          if (clearAuthStore) {
            clearAuthStore();
          }
          console.error(
            `❌ API Error (after refresh): ${options.method || "GET"} ${url} - ${
              retryResponse.status
            } (${retryDuration}ms)`
          );
          throw {
            status: retryResponse.status,
            statusCode: retryResponse.status,
            message:
              retryData.message ||
              `Request failed with status ${retryResponse.status}`,
            error: retryData.error || "HTTPError",
            data: retryData,
          };
        }

        // Retry succeeded
        console.log(
          `✅ API Success (after refresh): ${options.method || "GET"} ${url} - ${
            retryResponse.status
          } (${retryDuration}ms)`
        );

        return retryData;
      } catch (refreshError) {
        // Refresh failed - clear auth and throw error
        clearAuth();
        // Also clear auth store if available
        if (clearAuthStore) {
          clearAuthStore();
        }
        console.error("❌ Token refresh failed:", refreshError);

        // If it's already a structured error, re-throw it
        if (refreshError.statusCode) {
          throw refreshError;
        }

        throw {
          status: 401,
          statusCode: 401,
          message: "Session expired. Please log in again.",
          error: "AuthError",
          originalError: refreshError,
        };
      }
    }

    if (!response.ok) {
      // Log error
      console.error(
        `❌ API Error: ${options.method || "GET"} ${url} - ${
          response.status
        } (${duration}ms)`
      );
      console.error("Error details:", data);

      // Return error data from API
      throw {
        status: response.status,
        statusCode: response.status,
        message:
          data.message || `Request failed with status ${response.status}`,
        error: data.error || "HTTPError",
        data,
      };
    }

    // Log success
    console.log(
      `✅ API Success: ${options.method || "GET"} ${url} - ${
        response.status
      } (${duration}ms)`
    );

    return data;
  } catch (error) {
    // If it's already a structured error, re-throw it
    if (error.statusCode) {
      throw error;
    }

    // Network or other errors
    const errorMessage =
      error.message ||
      "Network error. Please check your connection and ensure the API server is running.";

    throw {
      status: 500,
      statusCode: 500,
      message: errorMessage,
      error: "NetworkError",
      originalError: error,
    };
  }
}
