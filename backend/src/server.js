const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const inventoryRoutes = require('./routes/inventory');
const votingRoutes = require('./routes/voting');
const allocationRoutes = require('./routes/allocations');
const supplierRoutes = require('./routes/suppliers');
const analyticsRoutes = require('./routes/analytics');
const nftRoutes = require('./routes/nft');

const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || 'v1'
  });
});

// API routes
const API_PREFIX = `/api/${process.env.API_VERSION || 'v1'}`;
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/inventory`, inventoryRoutes);
app.use(`${API_PREFIX}/voting`, votingRoutes);
app.use(`${API_PREFIX}/allocations`, allocationRoutes);
app.use(`${API_PREFIX}/suppliers`, supplierRoutes);
app.use(`${API_PREFIX}/analytics`, analyticsRoutes);
app.use(`${API_PREFIX}/nft`, nftRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`FFQ Backend server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`Aptos Network: ${process.env.APTOS_NETWORK}`);
});

module.exports = app;

