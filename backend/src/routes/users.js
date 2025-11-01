const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');

// @route   GET /api/v1/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, email, first_name, last_name, role, calpoly_id, phone, verified, governance_nft_count, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return next(new AppError('User not found', 404));
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/v1/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const { first_name, last_name, phone } = req.body;
    
    const result = await query(
      `UPDATE users 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           phone = COALESCE($3, phone),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, email, first_name, last_name, role, phone, updated_at`,
      [first_name, last_name, phone, req.user.id]
    );
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', authenticate, authorize('admin', 'pantry_worker'), async (req, res, next) => {
  try {
    const { role, limit = 50, offset = 0 } = req.query;
    
    let queryText = 'SELECT id, email, first_name, last_name, role, verified, created_at FROM users';
    const queryParams = [];
    
    if (role) {
      queryText += ' WHERE role = $1';
      queryParams.push(role);
    }
    
    queryText += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(parseInt(limit), parseInt(offset));
    
    const result = await query(queryText, queryParams);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

