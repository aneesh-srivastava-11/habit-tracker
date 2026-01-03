/**
 * Habit Routes
 * 
 * Handles CRUD operations for habits.
 * 
 * SECURITY FEATURES:
 * - All routes protected (require authentication)
 * - User isolation (users can only access their own habits)
 * - Input validation and sanitization
 * - Rate limiting on creation
 * 
 * ENDPOINTS:
 * - GET /api/habits - Get all habits for current user
 * - POST /api/habits - Create new habit
 * - DELETE /api/habits/:id - Delete habit
 */

import express from 'express';
import Habit from '../models/Habit.js';
import HabitLog from '../models/HabitLog.js';
import { protect } from '../middleware/auth.js';
import { validateCreateHabit } from '../middleware/validation.js';
// import { habitCreationLimiter, userLimiter } from '../middleware/rateLimiter.js'; // TEMPORARILY DISABLED

const router = express.Router();

// Apply user-based rate limiting to all habit routes
// TEMPORARILY DISABLED FOR DEVELOPMENT
// router.use(userLimiter);

/**
 * @route   GET /api/habits
 * @desc    Get all habits for current user
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
    try {
        // Get all habits for current user
        const habits = await Habit.find({ userId: req.userId })
            .sort({ createdAt: 1 }) // Oldest first
            .lean();

        res.status(200).json({
            success: true,
            count: habits.length,
            habits
        });
    } catch (error) {
        console.error('Get habits error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching habits'
        });
    }
});

/**
 * @route   POST /api/habits
 * @desc    Create new habit
 * @access  Private
 * @rateLimit DISABLED FOR DEVELOPMENT
 */
router.post('/', protect, /* habitCreationLimiter, */ validateCreateHabit, async (req, res) => {
    try {
        const { name, icon } = req.body;

        // Check if habit with same name already exists for this user
        const existingHabit = await Habit.findOne({
            userId: req.userId,
            name: { $regex: new RegExp(`^${name}$`, 'i') } // Case-insensitive
        });

        if (existingHabit) {
            return res.status(400).json({
                success: false,
                message: 'You already have a habit with this name'
            });
        }

        // Create habit
        const habit = await Habit.create({
            userId: req.userId,
            name,
            icon
        });

        console.log(`✅ Habit created: ${name} by user ${req.userId}`);

        res.status(201).json({
            success: true,
            habit
        });
    } catch (error) {
        console.error('Create habit error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating habit'
        });
    }
});

/**
 * @route   DELETE /api/habits/:id
 * @desc    Delete habit and all associated logs
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
    try {
        const habitId = req.params.id;

        // Find habit and verify ownership
        const habit = await Habit.findOne({
            _id: habitId,
            userId: req.userId
        });

        if (!habit) {
            return res.status(404).json({
                success: false,
                message: 'Habit not found or you do not have permission to delete it'
            });
        }

        // Delete habit
        await Habit.deleteOne({ _id: habitId });

        // Delete all associated logs
        await HabitLog.deleteMany({ habitId });

        console.log(`✅ Habit deleted: ${habit.name} by user ${req.userId}`);

        res.status(200).json({
            success: true,
            message: 'Habit and all associated logs deleted successfully'
        });
    } catch (error) {
        console.error('Delete habit error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting habit'
        });
    }
});

export default router;
