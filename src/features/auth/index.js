/**
 * Authentication feature exports
 * Centralized exports for all auth-related functionality
 */

// Components
export { LoginForm } from "./components/LoginForm";
export { LogoutButton } from "./components/LogoutButton";

// Context (Legacy - prefer useAuth hook from hooks/useAuth.js)
export { AuthProvider, useAuth as useAuthContext } from "./context/AuthContext";

// Hooks
export { useAuth } from "./hooks/useAuth"; // New RBAC-enabled hook
export { useLogin } from "./hooks/useLogin";
export { useLogout } from "./hooks/useLogout";

// Services
export { authService } from "./services/authService";

// Utils
export { authStorage } from "./utils/authStorage";

// Middleware
export {
  isAuthenticated,
  getCurrentUser,
  getAuthState,
  requireAuth,
  redirectIfAuthenticated,
  getServerAuthState,
  AUTH_ROUTES,
} from "./middleware";

// Types and Constants
export {
  STORAGE_KEYS,
  AUTH_ENDPOINTS,
  AUTH_ERRORS,
  AUTH_SUCCESS,
  VALIDATION_RULES,
} from "./constants";
