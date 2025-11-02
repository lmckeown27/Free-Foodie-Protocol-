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

// @route   GET /api/v1/suppliers/:id/impact
// @desc    Get supplier impact metrics
// @access  Private
router.get('/:id/impact', authenticate, async (req, res, next) => {
  try {
    // Calculate total pounds donated (assumes lbs/pounds units, estimates for others)
    const poundsResult = await query(
      `SELECT 
        SUM(CASE 
          WHEN unit IN ('lbs', 'pounds', 'lb') THEN quantity
          WHEN unit IN ('oz', 'ounces') THEN quantity / 16.0
          WHEN unit IN ('kg', 'kilograms') THEN quantity * 2.20462
          WHEN unit IN ('g', 'grams') THEN quantity / 453.592
          ELSE quantity * 0.5 
        END) as total_pounds
       FROM inventory 
       WHERE supplier_id = $1`,
      [req.params.id]
    );
    
    const totalPounds = parseFloat(poundsResult.rows[0].total_pounds) || 0;
    
    // Calculate derived metrics
    const mealsSaved = Math.floor(totalPounds * 1.2); // ~1.2 meals per pound
    const co2Saved = Math.floor(totalPounds * 3.8); // ~3.8kg CO2 per pound of food waste prevented
    
    // Get NFT count
    const nftResult = await query(
      `SELECT COUNT(*) as nft_count
       FROM nft_records
       WHERE owner_id = $1 AND nft_type = 'supplier' AND status = 'active'`,
      [req.params.id]
    );
    
    res.json({
      success: true,
      data: {
        totalPounds: totalPounds.toFixed(1),
        mealsSaved,
        co2Saved,
        nftCount: parseInt(nftResult.rows[0].nft_count)
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

