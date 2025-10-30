/**
 * Centralized HTTP request utility
 * Makes API calls with proper error handling
 */
export async function makeRequest(endpoint, options = {}) {
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseURL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
  }

  const url = `${baseURL}${endpoint}`;

  // Get access token from localStorage
  const getAccessToken = () => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem("access_token");
    } catch {
      return null;
    }
  };

  const accessToken = getAccessToken();

  // Don't set Content-Type for FormData - let browser set it automatically
  const isFormData = options.body instanceof FormData;

  const defaultHeaders = isFormData
    ? {
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...options.headers,
      }
    : {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
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
