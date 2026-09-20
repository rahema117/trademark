const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectDB = require('../config/db');
const Admin = require('../models/Admin');

const seedAdmin = async () => {
  try {
    await connectDB();

    const email = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase().trim();
    const password = process.env.ADMIN_PASSWORD || 'admin123456';

    const existingAdmin = await Admin.findOne({});
    if (existingAdmin) {
      console.log(`[Admin Seed]: Admin already exists (${existingAdmin.email})`);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newAdmin = await Admin.create({
      email,
      passwordHash,
    });

    console.log(`[Admin Seed Success]: Single admin account created successfully!`);
    console.log(`Email: ${newAdmin.email}`);
    process.exit(0);
  } catch (error) {
    console.error(`[Admin Seed Failed]:`, error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  seedAdmin();
}

module.exports = seedAdmin;
