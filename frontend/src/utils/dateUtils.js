/**
 * Date Utility Functions
 * 
 * Helper functions for date formatting and manipulation.
 * All dates use YYYY-MM-DD format for consistency with backend.
 */

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string} Today's date
 */
export const getToday = () => {
    return new Date().toISOString().split('T')[0];
};

/**
 * Get date N days ago in YYYY-MM-DD format
 * @param {number} days - Number of days ago
 * @returns {string} Date N days ago
 */
export const getDaysAgo = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
};

/**
 * Get last N days as array of date strings
 * @param {number} count - Number of days to get
 * @returns {Array<string>} Array of dates in YYYY-MM-DD format
 */
export const getLastNDays = (count) => {
    const dates = [];
    for (let i = count - 1; i >= 0; i--) {
        dates.push(getDaysAgo(i));
    }
    return dates;
};

/**
 * Format date string to readable format
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {string} Formatted date (e.g., "Jan 15")
 */
export const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Format date string to day of week
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {string} Day of week (e.g., "Mon")
 */
export const formatDayOfWeek = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'short' });
};

/**
 * Check if date is today
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {boolean} True if date is today
 */
export const isToday = (dateStr) => {
    return dateStr === getToday();
};

/**
 * Get month name from date string
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {string} Month name (e.g., "January")
 */
export const getMonthName = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'long' });
};
