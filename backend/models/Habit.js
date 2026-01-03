/**
 * Habit Model
 * 
 * SECURITY CONSIDERATIONS:
 * - Each habit is tied to a specific user (userId reference)
 * - Prevents unauthorized access to other users' habits
 * - Input sanitization handled at route level
 * 
 * OWASP Best Practices:
 * - A5: Broken Access Control - User isolation via userId
 * - A1: Injection - MongoDB sanitization at middleware level
 */

import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema(
    {
        // User who owns this habit
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            index: true // Index for faster queries
        },

        // Habit name
        name: {
            type: String,
            required: [true, 'Habit name is required'],
            trim: true,
            maxlength: [100, 'Habit name cannot exceed 100 characters']
        },

        // Icon (emoji or identifier)
        icon: {
            type: String,
            required: [true, 'Habit icon is required'],
            trim: true,
            maxlength: [10, 'Icon cannot exceed 10 characters']
        }
    },
    {
        timestamps: true, // Adds createdAt and updatedAt
        versionKey: false
    }
);

/**
 * Compound index for efficient user-specific queries
 * Ensures fast retrieval of all habits for a user
 */
habitSchema.index({ userId: 1, createdAt: -1 });

/**
 * Default habits to create for new users
 * These are created automatically on first login
 */
export const DEFAULT_HABITS = [
    { name: 'Wake up early', icon: '🌅' },
    { name: 'No snoozing', icon: '⏰' },
    { name: 'Drink water', icon: '💧' },
    { name: 'Gym', icon: '💪' },
    { name: 'Stretching', icon: '🧘' },
    { name: 'Reading', icon: '📚' },
    { name: 'Meditation', icon: '🧘‍♂️' },
    { name: 'Study', icon: '📖' },
    { name: 'Skincare', icon: '✨' },
    { name: 'Limit social media', icon: '📱' },
    { name: 'No alcohol', icon: '🚫' },
    { name: 'Track expenses', icon: '💰' }
];

const Habit = mongoose.model('Habit', habitSchema);

export default Habit;
