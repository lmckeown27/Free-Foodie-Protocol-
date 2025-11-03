const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const { authenticate, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

// Volunteer tier thresholds
const VOLUNTEER_TIERS = {
  bronze: { hours: 5, benefits: 'Priority Level 1: 10% boost in POAS score' },
  silver: { hours: 15, benefits: 'Priority Level 2: 20% boost in POAS score + early access to new inventory' },
  gold: { hours: 30, benefits: 'Priority Level 3: 35% boost in POAS score + early access + priority support' },
  platinum: { hours: 50, benefits: 'Priority Level 4: 50% boost in POAS score + all perks + recognition badge' }
};

// @route   POST /api/v1/volunteers/log
// @desc    Log volunteer hours (student)
// @access  Private/Student
router.post('/log', authenticate, authorize('student'), async (req, res, next) => {
  try {
    const { activity_type, hours, description, date } = req.body;
    
    if (!activity_type || !hours || !date) {
      return next(new AppError('Activity type, hours, and date are required', 400));
    }
    
    if (hours <= 0 || hours > 12) {
      return next(new AppError('Hours must be between 0 and 12 per session', 400));
    }
    
    const result = await query(
      `INSERT INTO volunteer_hours (student_id, activity_type, hours, description, date, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [req.user.id, activity_type, hours, description, date]
    );
    
    logger.info('Volunteer hours logged', { 
      studentId: req.user.id, 
      hours, 
      activityType: activity_type 
    });
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Volunteer hours logged successfully! Awaiting pantry verification.'
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/volunteers/my-hours
// @desc    Get current student's volunteer hours
// @access  Private/Student
router.get('/my-hours', authenticate, authorize('student'), async (req, res, next) => {
  try {
    // Get all volunteer hours
    const hoursResult = await query(
      `SELECT * FROM volunteer_hours 
       WHERE student_id = $1 
       ORDER BY date DESC`,
      [req.user.id]
    );
    
    // Calculate totals
    const totals = await query(
      `SELECT 
        COALESCE(SUM(CASE WHEN status = 'verified' THEN hours ELSE 0 END), 0) as verified_hours,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN hours ELSE 0 END), 0) as pending_hours,
        COUNT(CASE WHEN status = 'verified' THEN 1 END) as verified_sessions,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_sessions
       FROM volunteer_hours
       WHERE student_id = $1`,
      [req.user.id]
    );
    
    // Get earned NFTs
    const nfts = await query(
      `SELECT * FROM volunteer_nfts 
       WHERE student_id = $1 
       ORDER BY minted_at DESC`,
      [req.user.id]
    );
    
    // Calculate current tier and progress
    const verifiedHours = parseFloat(totals.rows[0].verified_hours);
    let currentTier = null;
    let nextTier = null;
    let progress = 0;
    
    if (verifiedHours >= VOLUNTEER_TIERS.platinum.hours) {
      currentTier = 'platinum';
      progress = 100;
    } else if (verifiedHours >= VOLUNTEER_TIERS.gold.hours) {
      currentTier = 'gold';
      nextTier = 'platinum';
      progress = ((verifiedHours - VOLUNTEER_TIERS.gold.hours) / (VOLUNTEER_TIERS.platinum.hours - VOLUNTEER_TIERS.gold.hours)) * 100;
    } else if (verifiedHours >= VOLUNTEER_TIERS.silver.hours) {
      currentTier = 'silver';
      nextTier = 'gold';
      progress = ((verifiedHours - VOLUNTEER_TIERS.silver.hours) / (VOLUNTEER_TIERS.gold.hours - VOLUNTEER_TIERS.silver.hours)) * 100;
    } else if (verifiedHours >= VOLUNTEER_TIERS.bronze.hours) {
      currentTier = 'bronze';
      nextTier = 'silver';
      progress = ((verifiedHours - VOLUNTEER_TIERS.bronze.hours) / (VOLUNTEER_TIERS.silver.hours - VOLUNTEER_TIERS.bronze.hours)) * 100;
    } else {
      nextTier = 'bronze';
      progress = (verifiedHours / VOLUNTEER_TIERS.bronze.hours) * 100;
    }
    
    res.json({
      success: true,
      data: {
        hours: hoursResult.rows,
        summary: {
          ...totals.rows[0],
          current_tier: currentTier,
          next_tier: nextTier,
          progress_to_next: Math.round(progress)
        },
        nfts: nfts.rows,
        tiers: VOLUNTEER_TIERS
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/volunteers/pending
// @desc    Get all pending volunteer hours (pantry)
// @access  Private/Pantry
router.get('/pending', authenticate, authorize('pantry'), async (req, res, next) => {
  try {
    const result = await query(
      `SELECT vh.*, u.first_name, u.last_name, u.email
       FROM volunteer_hours vh
       JOIN users u ON vh.student_id = u.id
       WHERE vh.status = 'pending'
       ORDER BY vh.date DESC, vh.created_at DESC`
    );
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/volunteers/all
// @desc    Get all volunteer hours with filters (pantry)
// @access  Private/Pantry
router.get('/all', authenticate, authorize('pantry'), async (req, res, next) => {
  try {
    const { status, student_id, limit = 100 } = req.query;
    
    let queryStr = `
      SELECT vh.*, u.first_name, u.last_name, u.email,
             verifier.first_name as verifier_first_name,
             verifier.last_name as verifier_last_name
      FROM volunteer_hours vh
      JOIN users u ON vh.student_id = u.id
      LEFT JOIN users verifier ON vh.verified_by = verifier.id
      WHERE 1=1
    `;
    const params = [];
    
    if (status) {
      params.push(status);
      queryStr += ` AND vh.status = $${params.length}`;
    }
    
    if (student_id) {
      params.push(student_id);
      queryStr += ` AND vh.student_id = $${params.length}`;
    }
    
    params.push(limit);
    queryStr += ` ORDER BY vh.date DESC, vh.created_at DESC LIMIT $${params.length}`;
    
    const result = await query(queryStr, params);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/v1/volunteers/:id/verify
// @desc    Verify volunteer hours (pantry)
// @access  Private/Pantry
router.put('/:id/verify', authenticate, authorize('pantry'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { approved, hours_adjustment } = req.body;
    
    if (approved === undefined) {
      return next(new AppError('Approval status is required', 400));
    }
    
    // Get the volunteer entry
    const volunteerResult = await query(
      'SELECT * FROM volunteer_hours WHERE id = $1',
      [id]
    );
    
    if (volunteerResult.rows.length === 0) {
      return next(new AppError('Volunteer entry not found', 404));
    }
    
    const volunteerEntry = volunteerResult.rows[0];
    
    if (volunteerEntry.status !== 'pending') {
      return next(new AppError('This volunteer entry has already been processed', 400));
    }
    
    // Update status
    const newStatus = approved ? 'verified' : 'rejected';
    const finalHours = hours_adjustment !== undefined ? hours_adjustment : volunteerEntry.hours;
    
    await query(
      `UPDATE volunteer_hours 
       SET status = $1, verified_by = $2, verified_at = NOW(), hours = $3, updated_at = NOW()
       WHERE id = $4`,
      [newStatus, req.user.id, finalHours, id]
    );
    
    if (approved) {
      // Check if student earned a new tier NFT
      const totalHours = await query(
        `SELECT COALESCE(SUM(hours), 0) as total_hours
         FROM volunteer_hours
         WHERE student_id = $1 AND status = 'verified'`,
        [volunteerEntry.student_id]
      );
      
      const hours = parseFloat(totalHours.rows[0].total_hours);
      
      // Check existing NFTs
      const existingNFTs = await query(
        `SELECT tier FROM volunteer_nfts WHERE student_id = $1`,
        [volunteerEntry.student_id]
      );
      
      const earnedTiers = existingNFTs.rows.map(r => r.tier);
      
      // Determine new tier to mint
      let newTier = null;
      if (hours >= VOLUNTEER_TIERS.platinum.hours && !earnedTiers.includes('platinum')) {
        newTier = 'platinum';
      } else if (hours >= VOLUNTEER_TIERS.gold.hours && !earnedTiers.includes('gold')) {
        newTier = 'gold';
      } else if (hours >= VOLUNTEER_TIERS.silver.hours && !earnedTiers.includes('silver')) {
        newTier = 'silver';
      } else if (hours >= VOLUNTEER_TIERS.bronze.hours && !earnedTiers.includes('bronze')) {
        newTier = 'bronze';
      }
      
      if (newTier) {
        // Mint volunteer NFT
        const nftId = `VOLUNTEER_NFT_${Date.now()}_${volunteerEntry.student_id.substring(0, 8)}`;
        
        await query(
          `INSERT INTO volunteer_nfts (student_id, nft_id, tier, hours_required, hours_at_mint, metadata)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            volunteerEntry.student_id,
            nftId,
            newTier,
            VOLUNTEER_TIERS[newTier].hours,
            hours,
            JSON.stringify({
              tier: newTier,
              benefits: VOLUNTEER_TIERS[newTier].benefits,
              earned_at: new Date().toISOString()
            })
          ]
        );
        
        // Create notification
        await query(
          `INSERT INTO notifications (user_id, type, title, message, data)
           VALUES ($1, 'volunteer_nft', $2, $3, $4)`,
          [
            volunteerEntry.student_id,
            `🎉 ${newTier.toUpperCase()} Volunteer NFT Earned!`,
            `Congratulations! You've earned the ${newTier} volunteer NFT for completing ${hours} volunteer hours. ${VOLUNTEER_TIERS[newTier].benefits}`,
            JSON.stringify({ tier: newTier, nft_id: nftId, hours })
          ]
        );
        
        logger.info('Volunteer NFT minted', {
          studentId: volunteerEntry.student_id,
          tier: newTier,
          hours,
          nftId
        });
      }
    }
    
    logger.info('Volunteer hours verified', {
      id,
      approved,
      verifiedBy: req.user.id
    });
    
    res.json({
      success: true,
      message: approved ? 'Volunteer hours verified successfully' : 'Volunteer hours rejected',
      data: { status: newStatus, hours: finalHours }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/volunteers/leaderboard
// @desc    Get volunteer leaderboard
// @access  Public
router.get('/leaderboard', async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    
    const result = await query(
      `SELECT 
        u.id,
        u.first_name,
        u.last_name,
        COALESCE(SUM(vh.hours), 0) as total_hours,
        COUNT(CASE WHEN vh.status = 'verified' THEN 1 END) as sessions,
        (SELECT tier FROM volunteer_nfts WHERE student_id = u.id ORDER BY hours_required DESC LIMIT 1) as highest_tier
       FROM users u
       LEFT JOIN volunteer_hours vh ON u.id = vh.student_id AND vh.status = 'verified'
       WHERE u.role = 'student'
       GROUP BY u.id, u.first_name, u.last_name
       HAVING COALESCE(SUM(vh.hours), 0) > 0
       ORDER BY total_hours DESC
       LIMIT $1`,
      [limit]
    );
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/volunteers/opportunities
// @desc    Get available volunteer opportunities
// @access  Private/Student
router.get('/opportunities', authenticate, authorize('student'), async (req, res, next) => {
  try {
    // This would eventually come from a database table
    // For now, returning static opportunities
    const opportunities = [
      {
        id: 1,
        title: 'Food Pantry Sorting',
        description: 'Help organize and sort incoming food donations',
        hours_per_session: 2,
        location: 'Campus Pantry',
        days_available: ['Monday', 'Wednesday', 'Friday']
      },
      {
        id: 2,
        title: 'Inventory Management',
        description: 'Assist with inventory tracking and database entry',
        hours_per_session: 3,
        location: 'Campus Pantry',
        days_available: ['Tuesday', 'Thursday']
      },
      {
        id: 3,
        title: 'Student Outreach',
        description: 'Help spread awareness about FFQ on campus',
        hours_per_session: 2,
        location: 'Various campus locations',
        days_available: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      },
      {
        id: 4,
        title: 'Distribution Support',
        description: 'Assist students during food pickup hours',
        hours_per_session: 2.5,
        location: 'Campus Pantry',
        days_available: ['Wednesday', 'Friday']
      }
    ];
    
    res.json({
      success: true,
      data: opportunities
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/volunteers/stats
// @desc    Get overall volunteer statistics (pantry)
// @access  Private/Pantry
router.get('/stats', authenticate, authorize('pantry'), async (req, res, next) => {
  try {
    const stats = await query(`
      SELECT 
        COUNT(DISTINCT student_id) as total_volunteers,
        COALESCE(SUM(CASE WHEN status = 'verified' THEN hours ELSE 0 END), 0) as total_hours,
        COALESCE(AVG(CASE WHEN status = 'verified' THEN hours END), 0) as avg_hours_per_session,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_verifications,
        COUNT(CASE WHEN status = 'verified' AND date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as sessions_this_month
      FROM volunteer_hours
    `);
    
    const tierDistribution = await query(`
      SELECT tier, COUNT(*) as count
      FROM volunteer_nfts
      GROUP BY tier
      ORDER BY 
        CASE tier
          WHEN 'bronze' THEN 1
          WHEN 'silver' THEN 2
          WHEN 'gold' THEN 3
          WHEN 'platinum' THEN 4
        END
    `);
    
    res.json({
      success: true,
      data: {
        overview: stats.rows[0],
        tier_distribution: tierDistribution.rows,
        tiers: VOLUNTEER_TIERS
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

