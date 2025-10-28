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

  const defaultHeaders = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const config = {
    ...options,
    headers: defaultHeaders,
  };

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

    if (!response.ok) {
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
