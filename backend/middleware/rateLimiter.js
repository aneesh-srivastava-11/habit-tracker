/**
 * Rate Limiting Middleware
 * 
 * Implements multiple rate limiting strategies to prevent abuse.
 * 
 * SECURITY CONSIDERATIONS:
 * - IP-based rate limiting for all routes
 * - Stricter limits for authentication endpoints (brute force protection)
 * - User-based rate limiting for authenticated routes
 * - Graceful 429 responses with Retry-After header
 * 
 * OWASP Best Practices:
 * - A2: Broken Authentication - Brute force protection on auth routes
 * - A6: Security Misconfiguration - Proper rate limiting configuration
 * - API4:2023 - Unrestricted Resource Consumption
 */

import rateLimit from 'express-rate-limit';

/**
 * Global rate limiter for all routes
 * Prevents general API abuse
 * 
 * Limit: 100 requests per 15 minutes per IP
 */
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes.'
    },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    // Custom handler for rate limit exceeded
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many requests from this IP, please try again later.',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000) // Seconds until reset
        });
    }
});

/**
 * Strict rate limiter for authentication routes
 * Prevents brute force attacks on login/register
 * 
 * Limit: 5 requests per 15 minutes per IP
 * 
 * SECURITY: Protects against credential stuffing and brute force attacks
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    skipSuccessfulRequests: false, // Count all requests
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        console.warn(`⚠️  Rate limit exceeded for IP: ${req.ip} on ${req.path}`);
        res.status(429).json({
            success: false,
            message: 'Too many authentication attempts. Please try again later.',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
        });
    }
});

/**
 * User-based rate limiter for authenticated routes
 * Limits requests per authenticated user
 * 
 * Limit: 200 requests per 15 minutes per user
 * 
 * NOTE: This should be applied AFTER authentication middleware
 * so that req.userId is available
 */
export const userLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Limit each user to 200 requests per windowMs
    // Use userId as key instead of IP
    keyGenerator: (req) => {
        // Use userId if authenticated, otherwise fall back to IP
        return req.userId ? req.userId.toString() : req.ip;
    },
    skipFailedRequests: false,
    message: {
        success: false,
        message: 'Too many requests from this account, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        console.warn(`⚠️  User rate limit exceeded for user: ${req.userId || req.ip}`);
        res.status(429).json({
            success: false,
            message: 'Too many requests from your account. Please try again later.',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
        });
    }
});

/**
 * Rate limiter for habit creation
 * Prevents spam creation of habits
 * 
 * Limit: 20 habits per hour per user
 */
export const habitCreationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    keyGenerator: (req) => req.userId ? req.userId.toString() : req.ip,
    message: {
        success: false,
        message: 'Too many habits created. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'You have created too many habits. Please try again in an hour.',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
        });
    }
});
