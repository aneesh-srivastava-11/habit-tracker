/**
 * Streak Calculation Utility
 * 
 * Calculates current streak from habit logs.
 * Streak = consecutive days of completion from today backward.
 * 
 * ALGORITHM:
 * 1. Get all completed logs for a habit, sorted by date descending
 * 2. Start from today and count backward
 * 3. Break on first missing day
 * 4. Return streak count
 * 
 * TIMEZONE SAFETY:
 * - All dates stored as YYYY-MM-DD strings (UTC)
 * - Comparison done on string level
 */

import HabitLog from '../models/HabitLog.js';

/**
 * Calculate current streak for a habit
 * @param {string} habitId - Habit ID
 * @param {string} userId - User ID
 * @returns {Promise<number>} Current streak count
 */
export const calculateStreak = async (habitId, userId) => {
    try {
        // Get all completed logs for this habit, sorted by date descending
        const logs = await HabitLog.find({
            habitId,
            userId,
            completed: true
        })
            .sort({ date: -1 }) // Most recent first
            .select('date')
            .lean();

        // If no logs, streak is 0
        if (logs.length === 0) {
            return 0;
        }

        // Get today's date in YYYY-MM-DD format (UTC)
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        // Start counting from today
        let currentDate = new Date(todayStr);
        let streak = 0;

        // Convert logs to a Set for O(1) lookup
        const completedDates = new Set(logs.map(log => log.date));

        // Count consecutive days backward from today
        while (true) {
            const dateStr = currentDate.toISOString().split('T')[0];

            // Check if this date is completed
            if (completedDates.has(dateStr)) {
                streak++;
                // Move to previous day
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                // Streak broken
                break;
            }

            // Safety check: don't go back more than 2 years
            if (streak > 730) {
                break;
            }
        }

        return streak;
    } catch (error) {
        console.error('Error calculating streak:', error);
        return 0;
    }
};

/**
 * Calculate streaks for multiple habits
 * @param {Array<string>} habitIds - Array of habit IDs
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Object mapping habitId to streak count
 */
export const calculateStreaksForHabits = async (habitIds, userId) => {
    try {
        const streaks = {};

        // Calculate streak for each habit
        await Promise.all(
            habitIds.map(async (habitId) => {
                streaks[habitId] = await calculateStreak(habitId, userId);
            })
        );

        return streaks;
    } catch (error) {
        console.error('Error calculating streaks for habits:', error);
        return {};
    }
};

/**
 * Get longest streak ever for a habit
 * @param {string} habitId - Habit ID
 * @param {string} userId - User ID
 * @returns {Promise<number>} Longest streak count
 */
export const getLongestStreak = async (habitId, userId) => {
    try {
        // Get all completed logs, sorted by date ascending
        const logs = await HabitLog.find({
            habitId,
            userId,
            completed: true
        })
            .sort({ date: 1 })
            .select('date')
            .lean();

        if (logs.length === 0) {
            return 0;
        }

        let longestStreak = 0;
        let currentStreak = 1;

        // Iterate through logs and find longest consecutive sequence
        for (let i = 1; i < logs.length; i++) {
            const prevDate = new Date(logs[i - 1].date);
            const currDate = new Date(logs[i].date);

            // Calculate day difference
            const dayDiff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));

            if (dayDiff === 1) {
                // Consecutive day
                currentStreak++;
            } else {
                // Streak broken, update longest and reset
                longestStreak = Math.max(longestStreak, currentStreak);
                currentStreak = 1;
            }
        }

        // Check final streak
        longestStreak = Math.max(longestStreak, currentStreak);

        return longestStreak;
    } catch (error) {
        console.error('Error calculating longest streak:', error);
        return 0;
    }
};
