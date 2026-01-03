/**
 * API Service Layer
 * 
 * Centralized API calls using Axios.
 * Handles authentication, habits, and tracking endpoints.
 * 
 * SECURITY:
 * - Credentials included for httpOnly cookies
 * - Base URL from environment variable
 * - Error handling for all requests
 */

import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true, // Include cookies in requests
    headers: {
        'Content-Type': 'application/json'
    }
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle specific error cases
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;

            // Note: We don't redirect on 401 here to avoid infinite loops
            // The ProtectedRoute component handles redirects properly

            // Return error message from server
            return Promise.reject(data.message || 'An error occurred');
        } else if (error.request) {
            // Request made but no response
            return Promise.reject('No response from server. Please check your connection.');
        } else {
            // Error setting up request
            return Promise.reject(error.message);
        }
    }
);

// ============================================
// AUTH API
// ============================================

/**
 * Register new user
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} User data and token
 */
export const register = async (credentials) => {
    const { data } = await api.post('/auth/register', credentials);
    return data;
};

/**
 * Login user
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} User data and token
 */
export const login = async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
};

/**
 * Logout user
 * @returns {Promise<Object>} Success message
 */
export const logout = async () => {
    const { data } = await api.post('/auth/logout');
    return data;
};

/**
 * Get current user profile
 * @returns {Promise<Object>} User data
 */
export const getCurrentUser = async () => {
    const { data } = await api.get('/auth/me');
    return data;
};

// ============================================
// HABITS API
// ============================================

/**
 * Get all habits for current user
 * @returns {Promise<Array>} Array of habits
 */
export const getHabits = async () => {
    const { data } = await api.get('/habits');
    return data.habits;
};

/**
 * Create new habit
 * @param {Object} habit - { name, icon }
 * @returns {Promise<Object>} Created habit
 */
export const createHabit = async (habit) => {
    const { data } = await api.post('/habits', habit);
    return data.habit;
};

/**
 * Delete habit
 * @param {string} habitId - Habit ID
 * @returns {Promise<Object>} Success message
 */
export const deleteHabit = async (habitId) => {
    const { data } = await api.delete(`/habits/${habitId}`);
    return data;
};

// ============================================
// TRACKING API
// ============================================

/**
 * Log habit completion for a date
 * @param {Object} logData - { habitId, date, completed }
 * @returns {Promise<Object>} Log data
 */
export const logHabitCompletion = async (logData) => {
    const { data } = await api.post('/tracking/log', logData);
    return data.log;
};

/**
 * Get logs for date range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Array>} Array of logs
 */
export const getLogs = async (startDate, endDate) => {
    const { data } = await api.get('/tracking/logs', {
        params: { startDate, endDate }
    });
    return data.logs;
};

/**
 * Get current streaks for all habits
 * @returns {Promise<Object>} Object mapping habitId to streak count
 */
export const getStreaks = async () => {
    const { data } = await api.get('/tracking/streaks');
    return data.streaks;
};

/**
 * Get earned badges for all habits
 * @returns {Promise<Object>} Object with badges and nextBadges
 */
export const getBadges = async () => {
    const { data } = await api.get('/tracking/badges');
    return data;
};

/**
 * Get comprehensive stats
 * @returns {Promise<Object>} Stats object with streaks, badges, completion rate
 */
export const getStats = async () => {
    const { data } = await api.get('/tracking/stats');
    return data.stats;
};

export default api;
