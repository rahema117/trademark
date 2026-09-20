const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const trademarkRoutes = require('./routes/trademarkRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
