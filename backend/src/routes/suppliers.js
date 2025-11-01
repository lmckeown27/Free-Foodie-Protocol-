const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// @route   GET /api/v1/suppliers
// @desc    Get all suppliers
// @access  Private
router.get('/', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, email, first_name, last_name, phone, created_at 
       FROM users 
       WHERE role = 'supplier' 
       ORDER BY created_at DESC`
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

// @route   GET /api/v1/suppliers/:id/donations
// @desc    Get supplier's donation history
// @access  Private
router.get('/:id/donations', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT * FROM inventory 
       WHERE supplier_id = $1 
       ORDER BY donation_date DESC`,
      [req.params.id]
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

// @route   GET /api/v1/suppliers/:id/stats
// @desc    Get supplier statistics
// @access  Private
router.get('/:id/stats', authenticate, async (req, res, next) => {
  try {
    const statsResult = await query(
      `SELECT 
        COUNT(*) as total_donations,
        SUM(quantity) as total_quantity,
        COUNT(DISTINCT item_type) as item_types_donated,
        COUNT(CASE WHEN status = 'redeemed' THEN 1 END) as items_redeemed
       FROM inventory 
       WHERE supplier_id = $1`,
      [req.params.id]
    );
    
    const nftResult = await query(
      `SELECT COUNT(*) as nft_count
       FROM nft_records
       WHERE owner_id = $1 AND nft_type = 'supplier' AND status = 'active'`,
      [req.params.id]
    );
    
    res.json({
      success: true,
      data: {
        ...statsResult.rows[0],
        supplier_nft_count: parseInt(nftResult.rows[0].nft_count)
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

