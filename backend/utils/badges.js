/**
 * Badge Calculation Utility
 * 
 * Determines which badges a user has earned based on their streak.
 * Badges are NOT stored in database - they are calculated on-the-fly.
 * 
 * BADGE MILESTONES:
 * - 3 days: "3-Day Warrior"
 * - 7 days: "Week Champion"
 * - 14 days: "Two-Week Hero"
 * - 21 days: "21-Day Master"
 * - 30 days: "Month Legend"
 * - 90 days: "Quarter King"
 * - 180 days: "Half-Year Titan"
 * - 365 days: "Year Conqueror"
 * 
 * Each badge can only be earned once per habit.
 */

/**
 * Badge milestone definitions
 * Each badge has a threshold (days) and metadata
 */
export const BADGE_MILESTONES = [
    { days: 3, name: '3-Day Warrior', icon: '🔥', description: 'Completed 3 days in a row' },
    { days: 7, name: 'Week Champion', icon: '⭐', description: 'Completed 7 days in a row' },
    { days: 14, name: 'Two-Week Hero', icon: '💎', description: 'Completed 14 days in a row' },
    { days: 21, name: '21-Day Master', icon: '👑', description: 'Completed 21 days in a row' },
    { days: 30, name: 'Month Legend', icon: '🏆', description: 'Completed 30 days in a row' },
    { days: 90, name: 'Quarter King', icon: '🎖️', description: 'Completed 90 days in a row' },
    { days: 180, name: 'Half-Year Titan', icon: '🌟', description: 'Completed 180 days in a row' },
    { days: 365, name: 'Year Conqueror', icon: '👑', description: 'Completed 365 days in a row' }
];

/**
 * Calculate earned badges based on current streak
 * @param {number} currentStreak - Current streak count
 * @returns {Array<Object>} Array of earned badges
 */
export const calculateBadges = (currentStreak) => {
    // Filter milestones that have been reached
    const earnedBadges = BADGE_MILESTONES.filter(
        badge => currentStreak >= badge.days
    );

    return earnedBadges;
};

/**
 * Calculate badges for multiple habits
 * @param {Object} streaks - Object mapping habitId to streak count
 * @returns {Object} Object mapping habitId to array of earned badges
 */
export const calculateBadgesForHabits = (streaks) => {
    const badges = {};

    for (const [habitId, streak] of Object.entries(streaks)) {
        badges[habitId] = calculateBadges(streak);
    }

    return badges;
};

/**
 * Get next badge to earn
 * @param {number} currentStreak - Current streak count
 * @returns {Object|null} Next badge milestone or null if all earned
 */
export const getNextBadge = (currentStreak) => {
    // Find first milestone not yet reached
    const nextBadge = BADGE_MILESTONES.find(
        badge => currentStreak < badge.days
    );

    if (nextBadge) {
        return {
            ...nextBadge,
            daysRemaining: nextBadge.days - currentStreak
        };
    }

    return null; // All badges earned
};

/**
 * Get badge progress percentage
 * @param {number} currentStreak - Current streak count
 * @returns {number} Progress percentage (0-100)
 */
export const getBadgeProgress = (currentStreak) => {
    const nextBadge = getNextBadge(currentStreak);

    if (!nextBadge) {
        return 100; // All badges earned
    }

    // Find previous badge threshold
    const previousBadges = BADGE_MILESTONES.filter(
        badge => badge.days <= currentStreak
    );

    const previousThreshold = previousBadges.length > 0
        ? previousBadges[previousBadges.length - 1].days
        : 0;

    // Calculate progress between previous and next badge
    const range = nextBadge.days - previousThreshold;
    const progress = currentStreak - previousThreshold;

    return Math.floor((progress / range) * 100);
};
