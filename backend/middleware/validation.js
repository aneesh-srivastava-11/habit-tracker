/**
 * Input Validation Middleware
 * 
 * Uses express-validator to validate and sanitize all user inputs.
 * Prevents injection attacks and ensures data integrity.
 * 
 * SECURITY CONSIDERATIONS:
 * - Validates all user inputs before processing
 * - Sanitizes inputs to prevent XSS and injection attacks
 * - Returns clear validation error messages
 * 
 * OWASP Best Practices:
 * - A1: Injection - Input validation and sanitization
 * - A3: Sensitive Data Exposure - Password strength validation
 * - A7: XSS - Input sanitization
 */

import { body, validationResult } from 'express-validator';

/**
 * Validation error handler
 * Extracts validation errors and returns formatted response
 */
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Format errors for client
        const formattedErrors = errors.array().map(err => ({
            field: err.path,
            message: err.msg
        }));

        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: formattedErrors
        });
    }

    next();
};

/**
 * Validation for user registration
 * OWASP: Input validation prevents injection attacks
 */
export const validateRegister = [
    // Name validation
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
        .escape(), // Sanitize HTML

    // Email validation
    body('email')
        .trim()
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),

    // Password validation
    body('password')
        .trim()
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number'),

    handleValidationErrors
];

/**
 * Login validation rules
 */
export const validateLogin = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),

    body('password')
        .trim()
        .notEmpty()
        .withMessage('Password is required'),

    handleValidationErrors
];

/**
 * Create habit validation rules
 * 
 * SECURITY:
 * - Sanitize habit name (prevent XSS)
 * - Limit name and icon length
 */
export const validateCreateHabit = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Habit name is required')
        .isLength({ min: 1, max: 100 })
        .withMessage('Habit name must be between 1 and 100 characters')
        .escape(), // Escape HTML characters to prevent XSS

    body('icon')
        .trim()
        .notEmpty()
        .withMessage('Habit icon is required')
        .isLength({ min: 1, max: 10 })
        .withMessage('Icon must be between 1 and 10 characters'),

    handleValidationErrors
];

/**
 * Log tracking validation rules
 * 
 * SECURITY:
 * - Validate habitId format (prevent injection)
 * - Validate date format (YYYY-MM-DD)
 * - Validate completed boolean
 */
export const validateLogTracking = [
    body('habitId')
        .trim()
        .notEmpty()
        .withMessage('Habit ID is required')
        .isMongoId()
        .withMessage('Invalid habit ID format'),

    body('date')
        .trim()
        .notEmpty()
        .withMessage('Date is required')
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage('Date must be in YYYY-MM-DD format')
        .custom((value) => {
            // Validate date is not in the future
            const inputDate = new Date(value);
            const today = new Date();
            today.setHours(23, 59, 59, 999);

            if (inputDate > today) {
                throw new Error('Date cannot be in the future');
            }

            return true;
        }),

    body('completed')
        .isBoolean()
        .withMessage('Completed must be a boolean value'),

    handleValidationErrors
];

/**
 * Delete habit validation rules
 */
export const validateDeleteHabit = [
    body('habitId')
        .optional()
        .trim()
        .isMongoId()
        .withMessage('Invalid habit ID format'),

    handleValidationErrors
];
