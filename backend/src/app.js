const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const trademarkRoutes = require('./routes/trademarkRoutes');
const { apiLimiter } = require('./middleware/rateLimiter');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Security Headers (Configure CORP to allow cross-origin image rendering & Cloudinary/uploads)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// NoSQL Injection Prevention (Sanitize req.body, req.query, and req.params)
app.use(mongoSanitize());

// General Rate Limiting for API routes
app.use('/api', apiLimiter);

// Static directory for uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trademarks', trademarkRoutes);

// Base Route
app.get('/api', (req, res) => {
  res.json({ message: 'Trademark Management System API is running' });
});

// Error handling middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app;
