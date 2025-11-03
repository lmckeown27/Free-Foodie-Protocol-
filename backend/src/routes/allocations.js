const express = require('express');
const router = express.Router();
const { query, getClient } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// @route   GET /api/v1/allocations
// @desc    Get all allocations (with filters)
// @access  Private
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status, student_id, limit = 50, offset = 0 } = req.query;
    
    let queryText = `
      SELECT 
        a.*,
        i.item_name,
        i.item_type,
        u.first_name as student_first_name,
        u.last_name as student_last_name
      FROM allocations a
      JOIN inventory i ON a.inventory_id = i.id
      JOIN users u ON a.student_id = u.id
      WHERE 1=1
    `;
    const queryParams = [];
    
    // Filter by student (students can only see their own allocations)
    if (req.user.role === 'student') {
      queryText += ` AND a.student_id = $${queryParams.length + 1}`;
      queryParams.push(req.user.id);
    } else if (student_id) {
      queryText += ` AND a.student_id = $${queryParams.length + 1}`;
      queryParams.push(student_id);
    }
    
    if (status) {
      queryText += ` AND a.status = $${queryParams.length + 1}`;
      queryParams.push(status);
    }
    
    queryText += ` ORDER BY a.allocation_date DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
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

// @route   POST /api/v1/allocations
// @desc    Create allocation (pantry only)
// @access  Private/Pantry
router.post('/', authenticate, authorize('pantry'), async (req, res, next) => {
  const client = await getClient();
  
  try {
    const { student_id, inventory_id, quantity, poas_score } = req.body;
    
    if (!student_id || !inventory_id || !quantity) {
      return next(new AppError('Student ID, inventory ID, and quantity are required', 400));
    }
    
    await client.query('BEGIN');
    
    // Check inventory availability
    const inventoryCheck = await client.query(
      'SELECT * FROM inventory WHERE id = $1 AND status = $2',
      [inventory_id, 'available']
    );
    
    if (inventoryCheck.rows.length === 0) {
      throw new AppError('Inventory item not available', 400);
    }
    
    if (inventoryCheck.rows[0].quantity < quantity) {
      throw new AppError('Insufficient inventory quantity', 400);
    }
    
    // Create allocation
    const allocationResult = await client.query(
      `INSERT INTO allocations (student_id, inventory_id, quantity, poas_score, status)
       VALUES ($1, $2, $3, $4, 'approved')
       RETURNING *`,
      [student_id, inventory_id, quantity, poas_score]
    );
    
    // Update inventory quantity
    await client.query(
      `UPDATE inventory 
       SET quantity = quantity - $1,
           status = CASE WHEN quantity - $1 = 0 THEN 'allocated' ELSE status END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [quantity, inventory_id]
    );
    
    // TODO: Mint Allocation NFT on Aptos blockchain
    
    // Record analytics event
    await client.query(
      `INSERT INTO analytics_events (event_type, user_id, event_data)
       VALUES ('allocation_created', $1, $2)`,
      [student_id, JSON.stringify({ allocation_id: allocationResult.rows[0].id, quantity })]
    );
    
    await client.query('COMMIT');
    
    logger.info('Allocation created', {
      allocationId: allocationResult.rows[0].id,
      studentId: student_id,
      inventoryId: inventory_id
    });
    
    res.status(201).json({
      success: true,
      data: allocationResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});

// @route   PUT /api/v1/allocations/:id/redeem
// @desc    Redeem allocation (pantry confirms)
// @access  Private/Pantry
router.put('/:id/redeem', authenticate, authorize('pantry'), async (req, res, next) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    
    // Check allocation exists and is approved
    const allocationCheck = await client.query(
      'SELECT * FROM allocations WHERE id = $1 AND status = $2',
      [req.params.id, 'approved']
    );
    
    if (allocationCheck.rows.length === 0) {
      throw new AppError('Allocation not found or not approved', 404);
    }
    
    // Update allocation status
    const result = await client.query(
      `UPDATE allocations
       SET status = 'redeemed',
           redemption_date = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [req.params.id]
    );
    
    // Update inventory status
    await client.query(
      `UPDATE inventory
       SET status = 'redeemed',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [allocationCheck.rows[0].inventory_id]
    );
    
    // TODO: Burn or mark Allocation NFT as redeemed on Aptos blockchain
    
    // Record analytics event
    await client.query(
      `INSERT INTO analytics_events (event_type, user_id, event_data)
       VALUES ('allocation_redeemed', $1, $2)`,
      [allocationCheck.rows[0].student_id, JSON.stringify({ allocation_id: req.params.id })]
    );
    
    await client.query('COMMIT');
    
    logger.info('Allocation redeemed', {
      allocationId: req.params.id,
      redeemedBy: req.user.id
    });
    
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Allocation successfully redeemed'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});

// @route   GET /api/v1/allocations/my-allocations
// @desc    Get current student's allocations
// @access  Private/Student
router.get('/my-allocations', authenticate, authorize('student'), async (req, res, next) => {
  try {
    const result = await query(
      `SELECT 
        a.*,
        i.item_name,
        i.item_type,
        i.unit
      FROM allocations a
      JOIN inventory i ON a.inventory_id = i.id
      WHERE a.student_id = $1
      ORDER BY a.allocation_date DESC`,
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

module.exports = router;

