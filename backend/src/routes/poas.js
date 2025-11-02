const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const POASCalculator = require('../../../dtl/src/poasCalculator');
const logger = require('../utils/logger');

const poasCalculator = new POASCalculator();

// @route   GET /api/v1/poas/calculate-all
// @desc    Calculate POAS for all students
// @access  Private/PantryWorker/BNI
router.get('/calculate-all', authenticate, authorize('pantry_worker', 'bni'), async (req, res, next) => {
  try {
    logger.info('Calculating POAS for all students');
    const scores = await poasCalculator.calculateScores();
    
    res.json({
      success: true,
      count: scores.length,
      data: scores,
      calculated_at: new Date()
    });
  } catch (error) {
    logger.error('Failed to calculate POAS scores', error);
    next(error);
  }
});

// @route   GET /api/v1/poas/student/:studentId
// @desc    Calculate POAS for specific student
// @access  Private
router.get('/student/:studentId', authenticate, async (req, res, next) => {
  try {
    const { studentId } = req.params;
    
    // Students can only view their own score, others need authorization
    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    logger.info(`Calculating POAS for student: ${studentId}`);
    const score = await poasCalculator.calculateStudentScore(studentId);
    
    res.json({
      success: true,
      data: score
    });
  } catch (error) {
    logger.error(`Failed to calculate POAS for student ${req.params.studentId}`, error);
    next(error);
  }
});

// @route   GET /api/v1/poas/my-score
// @desc    Get current user's POAS score
// @access  Private/Student
router.get('/my-score', authenticate, authorize('student'), async (req, res, next) => {
  try {
    logger.info(`Student ${req.user.id} requested their POAS score`);
    const score = await poasCalculator.calculateStudentScore(req.user.id);
    
    res.json({
      success: true,
      data: score
    });
  } catch (error) {
    logger.error(`Failed to calculate POAS for student ${req.user.id}`, error);
    next(error);
  }
});

// @route   GET /api/v1/poas/recommendations/:itemId
// @desc    Get recommended students for allocation based on POAS
// @access  Private/PantryWorker/BNI
router.get('/recommendations/:itemId', authenticate, authorize('pantry_worker', 'bni'), async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { limit = 10 } = req.query;
    
    // Calculate all student scores
    const scores = await poasCalculator.calculateScores();
    
    // Sort by POAS score (highest first)
    const recommendations = scores
      .sort((a, b) => b.poas_score - a.poas_score)
      .slice(0, parseInt(limit));
    
    res.json({
      success: true,
      count: recommendations.length,
      data: recommendations,
      item_id: itemId
    });
  } catch (error) {
    logger.error(`Failed to get recommendations for item ${req.params.itemId}`, error);
    next(error);
  }
});

// @route   POST /api/v1/poas/calculate-batch
// @desc    Calculate POAS for specific students (batch)
// @access  Private/PantryWorker/BNI
router.post('/calculate-batch', authenticate, authorize('pantry_worker', 'bni'), async (req, res, next) => {
  try {
    const { student_ids } = req.body;
    
    if (!Array.isArray(student_ids) || student_ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'student_ids must be a non-empty array'
      });
    }
    
    logger.info(`Calculating POAS for ${student_ids.length} students`);
    
    const scores = await Promise.all(
      student_ids.map(id => poasCalculator.calculateStudentScore(id))
    );
    
    res.json({
      success: true,
      count: scores.length,
      data: scores
    });
  } catch (error) {
    logger.error('Failed to calculate batch POAS scores', error);
    next(error);
  }
});

module.exports = router;

