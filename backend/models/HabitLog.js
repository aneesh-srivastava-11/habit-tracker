/**
 * HabitLog Model
 * 
 * Tracks daily completion status for each habit.
 * One document per habit per day.
 * 
 * SECURITY CONSIDERATIONS:
 * - User isolation via userId
 * - Unique constraint prevents duplicate logs for same habit/date
 * - Date stored as string (YYYY-MM-DD) for timezone safety
 * 
 * OWASP Best Practices:
 * - A5: Broken Access Control - User-specific data isolation
 * - A1: Injection - Date validation at route level
 */

import mongoose from 'mongoose';

const habitLogSchema = new mongoose.Schema(
    {
        // User who owns this log
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            index: true
        },

        // Habit being tracked
        habitId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Habit',
            required: [true, 'Habit ID is required'],
            index: true
        },

        // Date in YYYY-MM-DD format (UTC)
        // String format ensures timezone safety
        date: {
            type: String,
            required: [true, 'Date is required'],
            match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format']
        },

        // Completion status
        completed: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

/**
 * Compound unique index
 * Ensures only one log per habit per date per user
 * Also optimizes queries for streak calculation
 */
habitLogSchema.index(
    { userId: 1, habitId: 1, date: 1 },
    { unique: true }
);

/**
 * Index for efficient date-range queries
 * Used for streak calculation and monthly charts
 */
habitLogSchema.index({ habitId: 1, date: -1 });

const HabitLog = mongoose.model('HabitLog', habitLogSchema);

export default HabitLog;
