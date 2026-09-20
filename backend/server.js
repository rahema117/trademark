const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./src/config/db');
const app = require('./src/app');
const seedAdmin = require('./src/utils/seedAdmin');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Auto seed default admin if none exists
  try {
    const Admin = require('./src/models/Admin');
    const count = await Admin.countDocuments();
    if (count === 0) {
      console.log('[Server Startup]: No admin found. Seeding initial admin account...');
      const email = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase().trim();
      const password = process.env.ADMIN_PASSWORD || 'admin123456';
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      await Admin.create({ email, passwordHash });
      console.log(`[Server Startup]: Admin account created with email: ${email}`);
    }
  } catch (err) {
    console.error('[Server Startup Warning]: Auto seed check failed', err.message);
  }

  // Start HTTP Server
  app.listen(PORT, () => {
    console.log(`[Server Running]: http://localhost:${PORT}`);
  });
};

startServer();
