const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./src/config/db');
const app = require('./src/app');
const seedAdmin = require('./src/utils/seedAdmin');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Auto seed admin if none exists (using secure seedAdmin module)
  try {
    await seedAdmin();
  } catch (err) {
    console.error('[Server Startup Warning]: Admin seed check failed', err.message);
  }

  // Start HTTP Server
  app.listen(PORT, () => {
    console.log(`[Server Running]: http://localhost:${PORT}`);
  });
};

startServer();