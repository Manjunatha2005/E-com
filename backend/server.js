/**
 * server.js — MycoMart Backend Entry Point
 *
 * Start dev:   npm run dev
 * Start prod:  npm start
 * Seed DB:     npm run seed
 */

const express  = require('express');
const cors     = require('cors');
const morgan   = require('morgan');
const dotenv   = require('dotenv');
const path     = require('path');

// Load env vars first
dotenv.config();

const connectDB             = require('./config/db');
const productRoutes         = require('./routes/products');
const userRoutes            = require('./routes/users');
const orderRoutes           = require('./routes/orders');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// ─── Connect to MongoDB ────────────────────────────────────────────────────────
connectDB();

// ─── App ──────────────────────────────────────────────────────────────────────
const app = express();

// ─── Core Middleware ──────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Static — serve product images ────────────────────────────────────────────
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'MycoMart API',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/products', productRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/orders',   orderRoutes);

// ─── 404 + Error Handling ─────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  🍄  MycoMart API running
  ─────────────────────────────────────
  Environment : ${process.env.NODE_ENV || 'development'}
  Port        : ${PORT}
  Health      : http://localhost:${PORT}/api/health
  Products    : http://localhost:${PORT}/api/products
  Users       : http://localhost:${PORT}/api/users
  Orders      : http://localhost:${PORT}/api/orders
  ─────────────────────────────────────
  `);
});

module.exports = app;
