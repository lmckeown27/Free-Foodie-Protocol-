const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// @route   GET /api/v1/inventory
// @desc    Get all available inventory
// @access  Private
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status = 'available', item_type, limit = 50, offset = 0 } = req.query;
    
    let queryText = `
      SELECT i.*, u.first_name as supplier_first_name, u.last_name as supplier_last_name
      FROM inventory i
      LEFT JOIN users u ON i.supplier_id = u.id
      WHERE i.status = $1
    `;
    const queryParams = [status];
    
    if (item_type) {
      queryText += ` AND i.item_type = $${queryParams.length + 1}`;
      queryParams.push(item_type);
    }
    
    queryText += ` ORDER BY i.donation_date DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
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

// @route   GET /api/v1/inventory/:id
// @desc    Get inventory item by ID
// @access  Private
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT i.*, u.first_name as supplier_first_name, u.last_name as supplier_last_name
       FROM inventory i
       LEFT JOIN users u ON i.supplier_id = u.id
       WHERE i.id = $1`,
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return next(new AppError('Inventory item not found', 404));
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/v1/inventory
// @desc    Add inventory item (supplier only)
// @access  Private/Supplier
router.post('/', authenticate, authorize('supplier', 'admin'), async (req, res, next) => {
  try {
    const {
      item_name,
      item_type,
      quantity,
      unit,
      expiration_date,
      location,
      handling_notes
    } = req.body;
    
    if (!item_name || !quantity) {
      return next(new AppError('Item name and quantity are required', 400));
    }
    
    const result = await query(
      `INSERT INTO inventory (supplier_id, item_name, item_type, quantity, unit, expiration_date, location, handling_notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [req.user.id, item_name, item_type, quantity, unit, expiration_date, location, handling_notes]
    );
    
    logger.info('Inventory item added', { itemId: result.rows[0].id, supplierId: req.user.id });
    
    // TODO: Mint Supplier NFT on Aptos blockchain
    
    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/v1/inventory/:id
// @desc    Update inventory item
// @access  Private/Supplier/Admin
router.put('/:id', authenticate, authorize('supplier', 'pantry_worker', 'admin'), async (req, res, next) => {
  try {
    const { quantity, status, location, handling_notes } = req.body;
    
    // Check if item exists and user has permission
    const itemCheck = await query('SELECT * FROM inventory WHERE id = $1', [req.params.id]);
    
    if (itemCheck.rows.length === 0) {
      return next(new AppError('Inventory item not found', 404));
    }
    
    if (req.user.role === 'supplier' && itemCheck.rows[0].supplier_id !== req.user.id) {
      return next(new AppError('Not authorized to update this item', 403));
    }
    
    const result = await query(
      `UPDATE inventory
       SET quantity = COALESCE($1, quantity),
           status = COALESCE($2, status),
           location = COALESCE($3, location),
           handling_notes = COALESCE($4, handling_notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [quantity, status, location, handling_notes, req.params.id]
    );
    
    logger.info('Inventory item updated', { itemId: req.params.id, userId: req.user.id });
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/v1/inventory/:id
// @desc    Delete inventory item
// @access  Private/Supplier/Admin
router.delete('/:id', authenticate, authorize('supplier', 'admin'), async (req, res, next) => {
  try {
    // Check if item exists and user has permission
    const itemCheck = await query('SELECT * FROM inventory WHERE id = $1', [req.params.id]);
    
    if (itemCheck.rows.length === 0) {
      return next(new AppError('Inventory item not found', 404));
    }
    
    if (req.user.role === 'supplier' && itemCheck.rows[0].supplier_id !== req.user.id) {
      return next(new AppError('Not authorized to delete this item', 403));
    }
    
    await query('DELETE FROM inventory WHERE id = $1', [req.params.id]);
    
    logger.info('Inventory item deleted', { itemId: req.params.id, userId: req.user.id });
    
    res.json({
      success: true,
      message: 'Inventory item deleted'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

