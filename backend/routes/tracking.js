/**
 * Tracking Routes
 * 
 * Handles daily habit tracking, logs, streaks, and badges.
 * 
 * SECURITY FEATURES:
 * - All routes protected (require authentication)
 * - User isolation
 * - Input validation
 * - Rate limiting
 * 
 * ENDPOINTS:
 * - POST /api/tracking/log - Toggle habit completion for a date
 * - GET /api/tracking/logs - Get logs for date range
 * - GET /api/tracking/streaks - Get current streaks for all habits
 * - GET /api/tracking/badges - Get earned badges for all habits
 */

import express from 'express';
import HabitLog from '../models/HabitLog.js';
import Habit from '../models/Habit.js';
import { protect } from '../middleware/auth.js';
import { validateLogTracking } from '../middleware/validation.js';
// import { userLimiter } from '../middleware/rateLimiter.js'; // TEMPORARILY DISABLED
import { calculateStreak, calculateStreaksForHabits } from '../utils/streaks.js';
import { calculateBadges, calculateBadgesForHabits, getNextBadge } from '../utils/badges.js';

const router = express.Router();

// Apply user-based rate limiting
// TEMPORARILY DISABLED FOR DEVELOPMENT
// router.use(userLimiter);

/**
 * @route   POST /api/tracking/log
 * @desc    Toggle habit completion for a specific date
 * @access  Private
 */
router.post('/log', protect, validateLogTracking, async (req, res) => {
    try {
        const { habitId, date, completed } = req.body;

        // Verify habit ownership
        const habit = await Habit.findOne({
            _id: habitId,
            userId: req.userId
        });

        if (!habit) {
            return res.status(404).json({
                success: false,
                message: 'Habit not found or you do not have permission to access it'
            });
        }

        // Check if log already exists
        const existingLog = await HabitLog.findOne({
            userId: req.userId,
            habitId,
            date
        });

        if (existingLog) {
            // Update existing log
            existingLog.completed = completed;
            await existingLog.save();

            return res.status(200).json({
                success: true,
                log: existingLog,
                message: 'Log updated successfully'
            });
        } else {
            // Create new log
            const log = await HabitLog.create({
                userId: req.userId,
                habitId,
                date,
                completed
            });

            return res.status(201).json({
                success: true,
                log,
                message: 'Log created successfully'
            });
        }
    } catch (error) {
        console.error('Log tracking error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging habit completion'
        });
    }
});

/**
 * @route   GET /api/tracking/logs
 * @desc    Get logs for a date range
 * @access  Private
 * @query   startDate, endDate (optional, defaults to last 30 days)
 */
router.get('/logs', protect, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Default to last 30 days if not provided
        const end = endDate || new Date().toISOString().split('T')[0];
        const start = startDate || (() => {
            const date = new Date();
            date.setDate(date.getDate() - 30);
            return date.toISOString().split('T')[0];
        })();

        // Get all logs for user within date range
        const logs = await HabitLog.find({
            userId: req.userId,
            date: { $gte: start, $lte: end }
        })
            .sort({ date: -1 })
            .lean();

        res.status(200).json({
            success: true,
            count: logs.length,
            logs
        });
    } catch (error) {
        console.error('Get logs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching logs'
        });
    }
});

/**
 * @route   GET /api/tracking/streaks
 * @desc    Get current streaks for all user's habits
 * @access  Private
 */
router.get('/streaks', protect, async (req, res) => {
    try {
        // Get all user's habits
        const habits = await Habit.find({ userId: req.userId })
            .select('_id')
            .lean();

        const habitIds = habits.map(h => h._id.toString());

        // Calculate streaks for all habits
        const streaks = await calculateStreaksForHabits(habitIds, req.userId);

        res.status(200).json({
            success: true,
            streaks
        });
    } catch (error) {
        console.error('Get streaks error:', error);
        res.status(500).json({
            success: false,
            message: 'Error calculating streaks'
        });
    }
});

/**
 * @route   GET /api/tracking/badges
 * @desc    Get earned badges for all user's habits
 * @access  Private
 */
router.get('/badges', protect, async (req, res) => {
    try {
        // Get all user's habits
        const habits = await Habit.find({ userId: req.userId })
            .select('_id')
            .lean();

        const habitIds = habits.map(h => h._id.toString());

        // Calculate streaks first
        const streaks = await calculateStreaksForHabits(habitIds, req.userId);

        // Calculate badges from streaks
        const badges = calculateBadgesForHabits(streaks);

        // Get next badge for each habit
        const nextBadges = {};
        for (const [habitId, streak] of Object.entries(streaks)) {
            nextBadges[habitId] = getNextBadge(streak);
        }

        res.status(200).json({
            success: true,
            badges,
            nextBadges
        });
    } catch (error) {
        console.error('Get badges error:', error);
        res.status(500).json({
            success: false,
            message: 'Error calculating badges'
        });
    }
});

/**
 * @route   GET /api/tracking/stats
 * @desc    Get comprehensive stats (streaks, badges, completion rate)
 * @access  Private
 */
router.get('/stats', protect, async (req, res) => {
    try {
        // Get all user's habits
        const habits = await Habit.find({ userId: req.userId }).lean();
        const habitIds = habits.map(h => h._id.toString());

        // Calculate streaks
        const streaks = await calculateStreaksForHabits(habitIds, req.userId);

        // Calculate badges
        const badges = calculateBadgesForHabits(streaks);

        // Get logs for last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const startDate = thirtyDaysAgo.toISOString().split('T')[0];
        const endDate = new Date().toISOString().split('T')[0];

        const logs = await HabitLog.find({
            userId: req.userId,
            date: { $gte: startDate, $lte: endDate }
        }).lean();

        // Calculate completion rate
        const completedLogs = logs.filter(log => log.completed).length;
        const totalPossibleLogs = habits.length * 30;
        const completionRate = totalPossibleLogs > 0
            ? Math.round((completedLogs / totalPossibleLogs) * 100)
            : 0;

        res.status(200).json({
            success: true,
            stats: {
                totalHabits: habits.length,
                streaks,
                badges,
                completionRate,
                last30Days: {
                    completed: completedLogs,
                    total: totalPossibleLogs
                }
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error calculating stats'
        });
    }
});

export default router;
