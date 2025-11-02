const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { pool } = require('../config/database');
const logger = require('../utils/logger');

// @route   GET /api/v1/notifications
// @desc    Get user's notifications
// @access  Private
router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit = 20, unread_only = false } = req.query;

    let query = `
      SELECT * FROM notifications
      WHERE user_id = $1
    `;

    if (unread_only === 'true') {
      query += ` AND read = false`;
    }

    query += ` ORDER BY created_at DESC LIMIT $2`;

    const result = await pool.query(query, [userId, limit]);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    logger.error('Failed to fetch notifications', error);
    next(error);
  }
});

// @route   GET /api/v1/notifications/unread-count
// @desc    Get count of unread notifications
// @access  Private
router.get('/unread-count', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND read = false',
      [userId]
    );

    res.json({
      success: true,
      count: parseInt(result.rows[0].count)
    });
  } catch (error) {
    logger.error('Failed to get unread count', error);
    next(error);
  }
});

// @route   PUT /api/v1/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `UPDATE notifications 
       SET read = true, read_at = CURRENT_TIMESTAMP 
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Failed to mark notification as read', error);
    next(error);
  }
});

// @route   PUT /api/v1/notifications/mark-all-read
// @desc    Mark all notifications as read
// @access  Private
router.put('/mark-all-read', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `UPDATE notifications 
       SET read = true, read_at = CURRENT_TIMESTAMP 
       WHERE user_id = $1 AND read = false
       RETURNING *`,
      [userId]
    );

    res.json({
      success: true,
      message: `${result.rows.length} notifications marked as read`,
      count: result.rows.length
    });
  } catch (error) {
    logger.error('Failed to mark all notifications as read', error);
    next(error);
  }
});

// @route   POST /api/v1/notifications
// @desc    Create a notification (internal use or admin)
// @access  Private
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { user_id, type, title, message, data } = req.body;

    if (!user_id || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        error: 'user_id, type, title, and message are required'
      });
    }

    const result = await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, data, read, created_at)
       VALUES ($1, $2, $3, $4, $5, false, CURRENT_TIMESTAMP)
       RETURNING *`,
      [user_id, type, title, message, data ? JSON.stringify(data) : null]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Failed to create notification', error);
    next(error);
  }
});

// @route   DELETE /api/v1/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    logger.error('Failed to delete notification', error);
    next(error);
  }
});

module.exports = router;

