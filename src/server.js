require('dotenv').config();

// Fix: Node.js DNS resolver on this machine cannot resolve Atlas SRV records.
// Force Google Public DNS so mongodb+srv:// connection strings work reliably.
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 3000;

async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[Server] Ayush Jha Personal Blog running at http://localhost:${PORT}`);
    console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
