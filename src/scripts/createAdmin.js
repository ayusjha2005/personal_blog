require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function createAdmin() {
  const args = process.argv.slice(2);
  const email = (args[0] || process.env.ADMIN_EMAIL || 'ayush@example.com').toLowerCase().trim();
  const password = args[1] || process.env.ADMIN_PASSWORD || 'adminpassword123';
  const name = args[2] || process.env.ADMIN_NAME || 'Ayush Jha';

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    console.error('[Error] Please provide a valid email address.');
    process.exit(1);
  }

  if (!password || password.length < 8) {
    console.error('[Error] Password must be at least 8 characters long.');
    process.exit(1);
  }

  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ayush_personal_blog';
    await mongoose.connect(mongoURI);
    console.log('[Setup] Connected to database');

    let admin = await User.findOne({ email });
    if (admin) {
      admin.name = name;
      admin.password = password; // Will be hashed by userSchema pre-save hook
      await admin.save();
      console.log(`[Success] Existing administrator updated: ${email}`);
    } else {
      admin = new User({
        name,
        email,
        password,
        role: 'admin',
      });
      await admin.save();
      console.log(`[Success] New administrator created: ${email}`);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('[Error] Failed to create administrator:', err.message);
    process.exit(1);
  }
}

createAdmin();
