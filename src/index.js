
require('dotenv').config();

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = require('./app');
const connectDB = require('./config/database');

let connectionPromise;

module.exports = async (req, res) => {
  try {
    if (!connectionPromise) {
      connectionPromise = connectDB();
    }

    await connectionPromise;
    return app(req, res);
  } catch (error) {
    console.error('[Vercel Handler Error]:', error.message);
    return res.status(500).send('Database connection failed. Check server logs.');
  }
};