const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @route   POST /api/v1/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res, next) => {
  try {
    const { email, first_name, last_name, role, calpoly_id, phone } = req.body;
    
    // Validate required fields
    if (!email || !role) {
      return next(new AppError('Email and role are required', 400));
    }
    
    // Validate role
    const validRoles = ['student', 'pantry', 'supplier'];
    if (!validRoles.includes(role)) {
      return next(new AppError('Invalid role', 400));
    }
    
    // Check if user already exists
    const existingUser = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return next(new AppError('User already exists', 400));
    }
    
    // Create new user
    const result = await query(
      `INSERT INTO users (email, first_name, last_name, role, calpoly_id, phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, role, created_at`,
      [email, first_name, last_name, role, calpoly_id, phone]
    );
    
    const user = result.rows[0];
    const token = generateToken(user);
    
    logger.info('User registered', { userId: user.id, role: user.role });
    
    res.status(201).json({
      success: true,
      data: { user, token }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/v1/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return next(new AppError('Email is required', 400));
    }
    
    // Find user
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return next(new AppError('Invalid credentials', 401));
    }
    
    const user = result.rows[0];
    const token = generateToken(user);
    
    logger.info('User logged in', { userId: user.id });
    
    res.json({
      success: true,
      data: { user, token }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/auth/callback
// @desc    OAuth2 callback (CalPoly SSO)
// @access  Public
router.get('/callback', async (req, res, next) => {
  try {
    // TODO: Implement OAuth2 callback logic with CalPoly SSO
    // This is a placeholder for OAuth2 integration
    
    const { code } = req.query;
    
    if (!code) {
      return next(new AppError('Authorization code missing', 400));
    }
    
    // Exchange code for access token
    // Fetch user info from CalPoly API
    // Create or update user in database
    // Generate JWT token
    
    res.json({
      success: true,
      message: 'OAuth2 callback - implementation pending'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

