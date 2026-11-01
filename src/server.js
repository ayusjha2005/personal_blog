require('dotenv').config();

// Fix: Node.js DNS resolver on this machine cannot resolve Atlas SRV records.
// Force Google Public DNS so mongodb+srv:// connection strings work reliably.
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 3000;

async function startServer() {
  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(`[Server] Ayush Jha Personal Blog running at http://localhost:${PORT}`);
    console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Graceful shutdown handling for Render / cloud deployments
  const gracefulShutdown = (signal) => {
    console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);
    server.close(async () => {
      console.log('[Server] HTTP server closed.');
      try {
        await mongoose.connection.close();
        console.log('[Server] MongoDB connection closed cleanly.');
        process.exit(0);
      } catch (err) {
        console.error('[Server] Error closing MongoDB connection:', err);
        process.exit(1);
      }
    });

    // Force shutdown after 10s timeout
    setTimeout(() => {
      console.error('[Server] Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

startServer();
