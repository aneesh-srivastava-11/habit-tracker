/**
 * User Model
 * 
 * SECURITY CONSIDERATIONS:
 * - Passwords are hashed using bcrypt (OWASP A2: Broken Authentication)
 * - Email is unique and validated
 * - Password is never returned in queries (select: false)
 * - Pre-save hook ensures password is always hashed
 * 
 * OWASP Best Practices:
 * - A2: Broken Authentication - Strong password hashing with bcrypt
 * - A3: Sensitive Data Exposure - Password field excluded from queries
 * - A5: Broken Access Control - User-specific data isolation via userId
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        /**
         * User's display name
         * Required for personalization
         */
        name: {
            type: String,
            required: [true, 'Please provide your name'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [50, 'Name cannot exceed 50 characters']
        },

        /**
         * User's email address
         * Used for authentication
         * SECURITY: Unique index for fast lookups and preventing duplicates
         */
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email'
            ]
        },

        /**
         * User's password (hashed)
         * SECURITY: Never returned in queries (select: false)
         * Hashed using bcrypt with 12 salt rounds
         */
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false // Never return password in queries
        }
    },
    {
        timestamps: true, // Adds createdAt and updatedAt
        versionKey: false // Remove __v field
    }
);

/**
 * Pre-save hook to hash password before saving
 * Only hashes if password is modified (new user or password change)
 * 
 * SECURITY: Uses bcrypt with salt rounds of 12 (OWASP recommended minimum is 10)
 */
userSchema.pre('save', async function (next) {
    // Only hash password if it has been modified
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Generate salt and hash password
        // Salt rounds: 12 (higher = more secure but slower)
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

/**
 * Instance method to compare password for login
 * @param {string} candidatePassword - Plain text password from login attempt
 * @returns {Promise<boolean>} True if password matches, false otherwise
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        // bcrypt.compare safely compares hashed password
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

/**
 * Transform output to remove sensitive fields
 * This ensures password is never accidentally exposed in API responses
 */
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};

const User = mongoose.model('User', userSchema);

export default User;
