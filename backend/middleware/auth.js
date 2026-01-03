/**
 * Authentication Middleware
 * 
 * Verifies JWT tokens and attaches user to request object.
 * Protects routes from unauthorized access.
 * 
 * SECURITY CONSIDERATIONS:
 * - JWT verification with secret key
 * - Token extracted from httpOnly cookie (not localStorage - XSS protection)
 * - User existence verified in database
 * - Proper error handling for expired/invalid tokens
 * 
 * OWASP Best Practices:
 * - A2: Broken Authentication - JWT verification
 * - A5: Broken Access Control - Route protection
 * - A7: XSS - httpOnly cookies prevent JavaScript access
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect routes - verify JWT token
 * @middleware
 * 
 * Usage: Add to any route that requires authentication
 * Example: router.get('/habits', protect, getHabits)
 */
export const protect = async (req, res, next) => {
    try {
        let token;

        // Extract token from httpOnly cookie
        // SECURITY: Cookies are more secure than localStorage (XSS protection)
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route. Please login.'
            });
        }

        try {
            // Verify token with JWT secret
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find user by ID from token payload
            // Exclude password field for security
            req.user = await User.findById(decoded.id).select('-password');

            // Check if user still exists
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User no longer exists. Please login again.'
                });
            }

            // Attach userId for convenience in routes
            req.userId = req.user._id;

            next();
        } catch (error) {
            // Handle specific JWT errors
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token. Please login again.'
                });
            }

            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expired. Please login again.'
                });
            }

            throw error;
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication failed. Please try again.'
        });
    }
};

/**
 * Generate JWT token and set as httpOnly cookie
 * @param {Object} user - User object
 * @param {number} statusCode - HTTP status code
 * @param {Object} res - Express response object
 * 
 * SECURITY: httpOnly cookie prevents XSS attacks
 */
export const sendTokenResponse = (user, statusCode, res) => {
    // Create JWT token
    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRE || '7d'
        }
    );

    // Cookie options
    const options = {
        expires: new Date(
            Date.now() + (parseInt(process.env.COOKIE_EXPIRE) || 7) * 24 * 60 * 60 * 1000
        ),
        httpOnly: true, // Prevents JavaScript access (XSS protection)
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'strict' // CSRF protection
    };

    // Send response with cookie
    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token, // Also send in body for mobile apps if needed
            user: {
                _id: user._id,
                email: user.email
            }
        });
};
