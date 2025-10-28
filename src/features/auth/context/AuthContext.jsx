"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { authStorage } from "../utils/authStorage";

/**
 * Auth context for managing authentication state across the app
 */
const AuthContext = createContext({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    login: () => { },
    logout: () => { },
    refreshAuth: () => { },
});

/**
 * Auth provider component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Refresh authentication state from storage
     */
    const refreshAuth = () => {
        const authState = authStorage.getAuthState();
        setUser(authState.user);
        setIsAuthenticated(authState.isAuthenticated);
        setIsLoading(false);
    };

    /**
     * Login function
     * @param {Object} authData - Authentication data
     */
    const login = (authData) => {
        authStorage.saveAuth(authData);
        refreshAuth();
    };

    /**
     * Logout function
     */
    const logout = () => {
        authStorage.clearAuth();
        refreshAuth();
    };

    // Initialize auth state on mount
    useEffect(() => {
        refreshAuth();
    }, []);

    const value = {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshAuth,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook to use auth context
 * @returns {Object} - Auth context value
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
