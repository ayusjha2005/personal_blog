const dns = require('dns');
dns.setServers(['8.8.8.8']);

const mongoose = require('mongoose');



async function connectDB() {
  try {
    if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is required in production.');
    }

    const mongoURI =
      process.env.MONGODB_URI ||
      'mongodb://127.0.0.1:27017/ayush_personal_blog';

    const conn = await mongoose.connect(mongoURI, {
      autoIndex: process.env.NODE_ENV !== 'production',
      serverSelectionTimeoutMS: 15000,
    });

    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] ${error.message}`);
    process.exit(1);
  }
}

module.exports = connectDB;
