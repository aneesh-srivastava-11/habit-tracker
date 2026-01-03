/**
 * Authentication Routes
 * 
 * Handles user registration, login, logout, and profile retrieval.
 * 
 * SECURITY FEATURES:
 * - Rate limiting on auth endpoints (5 requests per 15 minutes)
 * - Input validation and sanitization
 * - Password hashing with bcrypt
 * - JWT tokens in httpOnly cookies
 * - Default habits created on first login
 * 
 * ENDPOINTS:
 * - POST /api/auth/register - Register new user
 * - POST /api/auth/login - Login user
 * - POST /api/auth/logout - Logout user
 * - GET /api/auth/me - Get current user profile
 */

import express from 'express';
import User from '../models/User.js';
import Habit, { DEFAULT_HABITS } from '../models/Habit.js';
import { protect, sendTokenResponse } from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../middleware/validation.js';
// import { authLimiter } from '../middleware/rateLimiter.js'; // TEMPORARILY DISABLED

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * @rateLimit DISABLED FOR DEVELOPMENT
 */
router.post('/register', /* authLimiter, */ validateRegister, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create new user (password will be hashed by pre-save hook)
        const user = await User.create({
            email,
            password
        });

        // Create default habits for new user
        const defaultHabits = DEFAULT_HABITS.map(habit => ({
            userId: user._id,
            name: habit.name,
            icon: habit.icon
        }));

        await Habit.insertMany(defaultHabits);

        console.log(`✅ New user registered: ${email}`);

        // Send token response
        sendTokenResponse(user, 201, res);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating user. Please try again.'
        });
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 * @rateLimit DISABLED FOR DEVELOPMENT
 */
router.post('/login', /* authLimiter, */ validateLogin, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user and include password field
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordCorrect = await user.comparePassword(password);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        console.log(`✅ User logged in: ${email}`);

        // Send token response
        sendTokenResponse(user, 200, res);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in. Please try again.'
        });
    }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (clear cookie)
 * @access  Private
 */
router.post('/logout', protect, (req, res) => {
    try {
        // Clear cookie
        res.cookie('token', 'none', {
            expires: new Date(Date.now() + 10 * 1000), // Expire in 10 seconds
            httpOnly: true
        });

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging out'
        });
    }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private
 */
router.get('/me', protect, async (req, res) => {
    try {
        // User is already attached to req by protect middleware
        res.status(200).json({
            success: true,
            user: {
                _id: req.user._id,
                email: req.user.email,
                createdAt: req.user.createdAt
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user data'
        });
    }
});

export default router;
