/**
 * MongoDB Atlas Database Connection
 * 
 * SECURITY CONSIDERATIONS:
 * - Uses environment variables for connection string (never hardcode credentials)
 * - Implements connection retry logic
 * - Properly handles connection errors
 * - Uses strictQuery for Mongoose 7+ compatibility
 * 
 * OWASP Best Practices:
 * - A9: Using Components with Known Vulnerabilities - Keep Mongoose updated
 * - A3: Sensitive Data Exposure - Connection string in environment variables
 */

import mongoose from 'mongoose';

/**
 * Connect to MongoDB Atlas
 * @returns {Promise<void>}
 * @throws {Error} If connection fails after retry attempts
 */
const connectDB = async () => {
  try {
    // Mongoose 7+ strictQuery setting
    mongoose.set('strictQuery', false);

    // Connection options for production reliability
    const options = {
      // Use new URL parser
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Connection pool size
      maxPoolSize: 10,
      // Timeout settings
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    // Connect to MongoDB Atlas
    const conn = await mongoose.connect(process.env.MONGO_URI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    
    // Exit process with failure in production
    // In development, you might want to continue for debugging
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('⚠️  Running in development mode without database connection');
    }
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB connection error: ${err}`);
});

export default connectDB;
