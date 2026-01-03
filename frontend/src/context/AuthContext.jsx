/**
 * Authentication Context
 * 
 * Manages global authentication state using React Context API.
 * Provides login, register, logout functions and user state.
 * 
 * FEATURES:
 * - Persistent authentication check on mount
 * - Loading states
 * - Error handling
 * - Automatic token management via httpOnly cookies
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout, getCurrentUser } from '../services/api';

const AuthContext = createContext(null);

/**
 * Custom hook to use auth context
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

/**
 * Auth Provider Component
 * Wraps app to provide authentication state
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Check if user is authenticated on mount
     * Attempts to fetch current user from backend
     */
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const data = await getCurrentUser();
                setUser(data.user);
            } catch (err) {
                // User not authenticated - this is normal
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    /**
     * Login user
     * @param {Object} credentials - { email, password }
     */
    const login = async (credentials) => {
        try {
            setError(null);
            setLoading(true);
            const data = await apiLogin(credentials);
            setUser(data.user);
            return { success: true };
        } catch (err) {
            setError(err);
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Register new user
     * @param {Object} credentials - { email, password }
     */
    const register = async (credentials) => {
        try {
            setError(null);
            setLoading(true);
            const data = await apiRegister(credentials);
            setUser(data.user);
            return { success: true };
        } catch (err) {
            setError(err);
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Logout user
     */
    const logout = async () => {
        try {
            setError(null);
            await apiLogout();
            setUser(null);
            return { success: true };
        } catch (err) {
            setError(err);
            return { success: false, error: err };
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
