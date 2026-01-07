/**
 * Express Server - Habit Tracker Backend
 * 
 * Production-ready MERN backend with comprehensive security.
 * 
 * SECURITY FEATURES (OWASP Compliant):
 * - helmet: Security headers (XSS, clickjacking, MIME sniffing protection)
 * - cors: Cross-origin resource sharing with credentials
 * - express-mongo-sanitize: NoSQL injection prevention
 * - express-rate-limit: Brute force and DoS protection
 * - express-validator: Input validation and sanitization
 * - bcrypt: Password hashing (12 salt rounds)
 * - JWT: Secure authentication with httpOnly cookies
 * - cookie-parser: Secure cookie handling
 * 
 * OWASP Top 10 Coverage:
 * - A1: Injection - MongoDB sanitization, input validation
 * - A2: Broken Authentication - JWT, bcrypt, rate limiting
 * - A3: Sensitive Data Exposure - httpOnly cookies, password hashing
 * - A5: Broken Access Control - User isolation, protected routes
 * - A6: Security Misconfiguration - Helmet, proper error handling
 * - A7: XSS - Input sanitization, httpOnly cookies
 * - A8: Insecure Deserialization - JSON parsing limits
 * - A9: Using Components with Known Vulnerabilities - Updated dependencies
 */

import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import connectDB from './config/db.js';
// import { globalLimiter } from './middleware/rateLimiter.js'; // TEMPORARILY DISABLED FOR DEVELOPMENT

// Import routes
import authRoutes from './routes/auth.js';
import habitRoutes from './routes/habits.js';
import trackingRoutes from './routes/tracking.js';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'PORT'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`❌ ERROR: ${envVar} is not defined in environment variables`);
        process.exit(1);
    }
}

// Validate JWT_SECRET strength
if (process.env.JWT_SECRET.length < 32) {
    console.error('❌ ERROR: JWT_SECRET must be at least 32 characters long');
    console.error('Generate a strong secret with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
    process.exit(1);
}

// Initialize Express app
const app = express();

// Connect to MongoDB Atlas
connectDB();

// ============================================
// SECURITY MIDDLEWARE
// ============================================

/**
 * Helmet - Security headers
 * Protects against:
 * - XSS attacks
 * - Clickjacking
 * - MIME type sniffing
 * - DNS prefetch control
 */
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

/**
 * CORS - Cross-Origin Resource Sharing
 * Allows frontend to make requests with credentials
 */
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true, // Allow cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

/**
 * Body parser middleware
 * Limit payload size to prevent DoS attacks
 */
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

/**
 * Cookie parser
 * Parse cookies for JWT authentication
 */
app.use(cookieParser());

/**
 * MongoDB sanitization
 * Prevents NoSQL injection attacks
 * Removes $ and . from user input
 */
app.use(mongoSanitize());

/**
 * Global rate limiting
 * 100 requests per 15 minutes per IP
 * TEMPORARILY DISABLED FOR DEVELOPMENT
 */
// app.use(globalLimiter);

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/tracking', trackingRoutes);


// ============================================
// ERROR HANDLING
// ============================================

/**
 * Global error handler
 * Catches all errors and returns consistent response
 * 
 * SECURITY: Never expose stack traces in production
 */
app.use((err, req, res, next) => {
    console.error('Error:', err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            message: 'Duplicate field value entered'
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired'
        });
    }

    // Default error
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Server error',
        // Only show stack in development
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve Vite frontend
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// Fallback to index.html
app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../frontend/dist/index.html")
  );
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log('');
    console.log('='.repeat(50));
    console.log('🚀 HABIT TRACKER SERVER');
    console.log('='.repeat(50));
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
    console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
    console.log('='.repeat(50));
    console.log('');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ UNHANDLED REJECTION! Shutting down...');
    console.error(err);
    server.close(() => {
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ UNCAUGHT EXCEPTION! Shutting down...');
    console.error(err);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('✅ Process terminated');
    });
});

export default app;
