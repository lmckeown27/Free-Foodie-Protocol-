const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');

// @route   GET /api/v1/nft/my-nfts
// @desc    Get current user's NFTs
// @access  Private
router.get('/my-nfts', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT * FROM nft_records 
       WHERE owner_id = $1 AND status = 'active'
       ORDER BY minted_at DESC`,
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

// @route   GET /api/v1/nft/:nft_id
// @desc    Get NFT details
// @access  Private
router.get('/:nft_id', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT * FROM nft_records WHERE nft_id = $1`,
      [req.params.nft_id]
    );
    
    if (result.rows.length === 0) {
      return next(new AppError('NFT not found', 404));
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/nft/type/:nft_type
// @desc    Get NFTs by type
// @access  Private
router.get('/type/:nft_type', authenticate, async (req, res, next) => {
  try {
    const validTypes = ['governance', 'allocation', 'supplier'];
    
    if (!validTypes.includes(req.params.nft_type)) {
      return next(new AppError('Invalid NFT type', 400));
    }
    
    const result = await query(
      `SELECT * FROM nft_records 
       WHERE nft_type = $1 AND owner_id = $2 AND status = 'active'
       ORDER BY minted_at DESC`,
      [req.params.nft_type, req.user.id]
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

