const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// @route   GET /api/v1/analytics/dashboard
// @desc    Get dashboard analytics
// @access  Private/PantryWorker/BNI
router.get('/dashboard', authenticate, authorize('pantry_worker', 'bni'), async (req, res, next) => {
  try {
    // Total users by role
    const usersResult = await query(`
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
    `);
    
    // Inventory summary
    const inventoryResult = await query(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(quantity) as total_quantity
      FROM inventory
      GROUP BY status
    `);
    
    // Recent votes
    const votesResult = await query(`
      SELECT COUNT(*) as total_votes
      FROM votes
      WHERE vote_date >= CURRENT_TIMESTAMP - INTERVAL '7 days'
    `);
    
    // Allocations summary
    const allocationsResult = await query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM allocations
      GROUP BY status
    `);
    
    // Active NFTs
    const nftsResult = await query(`
      SELECT 
        nft_type,
        COUNT(*) as count
      FROM nft_records
      WHERE status = 'active'
      GROUP BY nft_type
    `);
    
    // Total donations
    const donationsResult = await query(`
      SELECT COUNT(*) as total_donations
      FROM inventory
    `);
    
    // Total allocations
    const totalAllocationsResult = await query(`
      SELECT COUNT(*) as total_allocations
      FROM allocations
    `);
    
    // Total transactions (blockchain events)
    const transactionsResult = await query(`
      SELECT COUNT(*) as total_transactions
      FROM nft_records
      WHERE status = 'active'
    `);
    
    res.json({
      success: true,
      data: {
        users: usersResult.rows,
        inventory: inventoryResult.rows,
        recent_votes: votesResult.rows[0],
        allocations: allocationsResult.rows,
        nfts: nftsResult.rows,
        total_donations: parseInt(donationsResult.rows[0].total_donations),
        total_allocations: parseInt(totalAllocationsResult.rows[0].total_allocations),
        total_transactions: parseInt(transactionsResult.rows[0].total_transactions)
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/analytics/demand
// @desc    Get demand analytics
// @access  Private
router.get('/demand', authenticate, async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    
    const result = await query(`
      SELECT 
        item_type,
        item_name,
        COUNT(*) as vote_count,
        SUM(priority) as total_priority,
        DATE(vote_date) as vote_day
      FROM votes
      WHERE vote_date >= CURRENT_TIMESTAMP - INTERVAL '${parseInt(days)} days'
      GROUP BY item_type, item_name, DATE(vote_date)
      ORDER BY vote_day DESC, vote_count DESC
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

// @route   GET /api/v1/analytics/inventory-health
// @desc    Get inventory health metrics
// @access  Private/PantryWorker/BNI
router.get('/inventory-health', authenticate, authorize('pantry_worker', 'bni'), async (req, res, next) => {
  try {
    const result = await query(`
      SELECT 
        COUNT(*) as total_items,
        COUNT(CASE WHEN expiration_date < CURRENT_DATE THEN 1 END) as expired_items,
        COUNT(CASE WHEN expiration_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days' THEN 1 END) as expiring_soon,
        COUNT(CASE WHEN status = 'available' THEN 1 END) as available_items,
        SUM(CASE WHEN status = 'available' THEN quantity ELSE 0 END) as available_quantity
      FROM inventory
    `);
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/analytics/student-engagement
// @desc    Get student engagement metrics
// @access  Private/PantryWorker/BNI
router.get('/student-engagement', authenticate, authorize('pantry_worker', 'bni'), async (req, res, next) => {
  try {
    const result = await query(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.governance_nft_count,
        COUNT(DISTINCT v.id) as total_votes,
        COUNT(DISTINCT a.id) as total_allocations,
        COUNT(CASE WHEN a.status = 'redeemed' THEN 1 END) as redeemed_allocations
      FROM users u
      LEFT JOIN votes v ON u.id = v.student_id
      LEFT JOIN allocations a ON u.id = a.student_id
      WHERE u.role = 'student'
      GROUP BY u.id, u.first_name, u.last_name, u.governance_nft_count
      ORDER BY total_votes DESC
      LIMIT 50
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

// @route   GET /api/v1/analytics/compliance
// @desc    Get compliance metrics
// @access  Private/PantryWorker/BNI
router.get('/compliance', authenticate, authorize('pantry_worker', 'bni'), async (req, res, next) => {
  try {
    const result = await query(`
      SELECT 
        compliance_type,
        COUNT(*) as total_checks,
        COUNT(CASE WHEN passed = true THEN 1 END) as passed_checks,
        COUNT(CASE WHEN passed = false THEN 1 END) as failed_checks
      FROM compliance_logs
      WHERE checked_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
      GROUP BY compliance_type
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

