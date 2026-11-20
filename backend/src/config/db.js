const mongoose = require('mongoose');

/**
 * Connect to MongoDB asynchronously using Mongoose.
 * 
 * Connection string is loaded from MONGODB_URI in environment variables.
 * Credentials are never hardcoded or logged to the console.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected successfully to database: ${conn.connection.name} (Host: ${conn.connection.host})`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
