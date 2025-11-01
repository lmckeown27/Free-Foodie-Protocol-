const express = require('express');
const router = express.Router();
const { query, getClient } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// @route   POST /api/v1/voting/vote
// @desc    Submit a vote for desired food item (student only)
// @access  Private/Student
router.post('/vote', authenticate, authorize('student'), async (req, res, next) => {
  const client = await getClient();
  
  try {
    const { item_type, item_name, priority = 1 } = req.body;
    
    if (!item_type) {
      return next(new AppError('Item type is required', 400));
    }
    
    await client.query('BEGIN');
    
    // Create vote record
    const voteResult = await client.query(
      `INSERT INTO votes (student_id, item_type, item_name, priority)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.id, item_type, item_name, priority]
    );
    
    // Increment user's governance NFT count
    await client.query(
      `UPDATE users SET governance_nft_count = governance_nft_count + 1 WHERE id = $1`,
      [req.user.id]
    );
    
    // TODO: Mint Governance NFT on Aptos blockchain
    
    // Record analytics event
    await client.query(
      `INSERT INTO analytics_events (event_type, user_id, event_data)
       VALUES ('vote_submitted', $1, $2)`,
      [req.user.id, JSON.stringify({ item_type, item_name, priority })]
    );
    
    await client.query('COMMIT');
    
    logger.info('Vote submitted', { 
      voteId: voteResult.rows[0].id, 
      studentId: req.user.id,
      itemType: item_type 
    });
    
    res.status(201).json({
      success: true,
      data: voteResult.rows[0],
      message: 'Vote submitted and Governance NFT earned!'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});

// @route   GET /api/v1/voting/my-votes
// @desc    Get current user's votes
// @access  Private/Student
router.get('/my-votes', authenticate, authorize('student'), async (req, res, next) => {
  try {
    const result = await query(
      `SELECT * FROM votes WHERE student_id = $1 ORDER BY vote_date DESC`,
      [req.user.id]
    );
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/voting/results
// @desc    Get aggregated voting results
// @access  Private
router.get('/results', authenticate, async (req, res, next) => {
  try {
    const { item_type, limit = 20 } = req.query;
    
    let queryText = `
      SELECT 
        item_type,
        item_name,
        COUNT(*) as vote_count,
        SUM(priority) as total_priority,
        AVG(priority) as avg_priority
      FROM votes
    `;
    
    const queryParams = [];
    
    if (item_type) {
      queryText += ' WHERE item_type = $1';
      queryParams.push(item_type);
    }
    
    queryText += ` GROUP BY item_type, item_name ORDER BY vote_count DESC, total_priority DESC LIMIT $${queryParams.length + 1}`;
    queryParams.push(parseInt(limit));
    
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

// @route   GET /api/v1/voting/trending
// @desc    Get trending items (last 7 days)
// @access  Private
router.get('/trending', authenticate, async (req, res, next) => {
  try {
    const result = await query(`
      SELECT 
        item_type,
        item_name,
        COUNT(*) as vote_count,
        SUM(priority) as total_priority
      FROM votes
      WHERE vote_date >= CURRENT_TIMESTAMP - INTERVAL '7 days'
      GROUP BY item_type, item_name
      ORDER BY vote_count DESC, total_priority DESC
      LIMIT 10
    `);
    
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

