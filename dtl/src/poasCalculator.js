const { pool } = require('../../backend/src/config/database');
const logger = require('./utils/logger');

/**
 * POAS (Predicted Optimal Allocation Score) Calculator
 * 
 * Algorithm considers:
 * 1. Student voting history (frequency, priority)
 * 2. Student need (historical allocations, redemption rate)
 * 3. Inventory availability
 * 4. Time factors (vote recency, expiration urgency)
 * 5. Equity factors (ensuring fair distribution)
 */

class POASCalculator {
  constructor() {
    this.pool = pool;
    
    // POAS weights (configurable)
    this.weights = {
      voting_engagement: 0.25,    // 25% - How actively student votes
      vote_priority: 0.20,         // 20% - Priority given in votes
      need_factor: 0.25,           // 25% - Historical need (fewer past allocations = higher need)
      redemption_rate: 0.15,       // 15% - Student's redemption reliability
      recency: 0.10,               // 10% - Recency of votes
      equity: 0.05                 // 5% - Ensures fair distribution across all students
    };
  }
  
  /**
   * Calculate POAS for all students
   */
  async calculateScores() {
    const client = await this.pool.connect();
    
    try {
      // Get all students
      const studentsResult = await client.query(`
        SELECT id FROM users WHERE role = 'student'
      `);
      
      const scores = [];
      
      for (const student of studentsResult.rows) {
        const score = await this.calculateStudentScore(student.id, client);
        scores.push(score);
      }
      
      // Normalize scores to 0-100 range
      return this.normalizeScores(scores);
    } finally {
      client.release();
    }
  }
  
  /**
   * Calculate POAS for a specific student
   */
  async calculateStudentScore(studentId, existingClient = null) {
    const client = existingClient || await this.pool.connect();
    
    try {
      // 1. Voting engagement score
      const votingEngagement = await this.calculateVotingEngagement(studentId, client);
      
      // 2. Vote priority score
      const votePriority = await this.calculateVotePriority(studentId, client);
      
      // 3. Need factor (inverse of past allocations)
      const needFactor = await this.calculateNeedFactor(studentId, client);
      
      // 4. Redemption rate
      const redemptionRate = await this.calculateRedemptionRate(studentId, client);
      
      // 5. Recency score
      const recency = await this.calculateRecency(studentId, client);
      
      // 6. Equity factor (ensures fairness)
      const equity = await this.calculateEquityFactor(studentId, client);
      
      // Calculate weighted POAS
      const poas = (
        votingEngagement * this.weights.voting_engagement +
        votePriority * this.weights.vote_priority +
        needFactor * this.weights.need_factor +
        redemptionRate * this.weights.redemption_rate +
        recency * this.weights.recency +
        equity * this.weights.equity
      );
      
      logger.debug(`POAS for student ${studentId}:`, {
        votingEngagement,
        votePriority,
        needFactor,
        redemptionRate,
        recency,
        equity,
        final: poas
      });
      
      return {
        student_id: studentId,
        poas_score: Math.round(poas * 100) / 100, // Round to 2 decimals
        components: {
          voting_engagement: votingEngagement,
          vote_priority: votePriority,
          need_factor: needFactor,
          redemption_rate: redemptionRate,
          recency,
          equity
        },
        calculated_at: new Date()
      };
    } finally {
      if (!existingClient) {
        client.release();
      }
    }
  }
  
  /**
   * Calculate voting engagement (0-100)
   */
  async calculateVotingEngagement(studentId, client) {
    const result = await client.query(`
      SELECT COUNT(*) as vote_count
      FROM votes
      WHERE student_id = $1 AND vote_date >= CURRENT_TIMESTAMP - INTERVAL '30 days'
    `, [studentId]);
    
    const voteCount = parseInt(result.rows[0].vote_count);
    // Normalize: 10+ votes in 30 days = 100 score
    return Math.min((voteCount / 10) * 100, 100);
  }
  
  /**
   * Calculate average vote priority (0-100)
   */
  async calculateVotePriority(studentId, client) {
    const result = await client.query(`
      SELECT AVG(priority) as avg_priority
      FROM votes
      WHERE student_id = $1 AND vote_date >= CURRENT_TIMESTAMP - INTERVAL '30 days'
    `, [studentId]);
    
    const avgPriority = parseFloat(result.rows[0].avg_priority) || 0;
    // Normalize: priority 5 = 100 score
    return (avgPriority / 5) * 100;
  }
  
  /**
   * Calculate need factor - students with fewer past allocations have higher need (0-100)
   */
  async calculateNeedFactor(studentId, client) {
    const result = await client.query(`
      SELECT COUNT(*) as allocation_count
      FROM allocations
      WHERE student_id = $1 AND status IN ('approved', 'redeemed')
    `, [studentId]);
    
    const allocationCount = parseInt(result.rows[0].allocation_count);
    // Inverse: fewer allocations = higher need
    // 0 allocations = 100, 10+ allocations = 0
    return Math.max(100 - (allocationCount * 10), 0);
  }
  
  /**
   * Calculate redemption rate - reliability of student (0-100)
   */
  async calculateRedemptionRate(studentId, client) {
    const result = await client.query(`
      SELECT 
        COUNT(*) as total_allocations,
        COUNT(CASE WHEN status = 'redeemed' THEN 1 END) as redeemed_count
      FROM allocations
      WHERE student_id = $1 AND status IN ('redeemed', 'expired')
    `, [studentId]);
    
    const total = parseInt(result.rows[0].total_allocations);
    const redeemed = parseInt(result.rows[0].redeemed_count);
    
    if (total === 0) return 75; // Default score for new students
    
    return (redeemed / total) * 100;
  }
  
  /**
   * Calculate recency score - recent votes weighted higher (0-100)
   */
  async calculateRecency(studentId, client) {
    const result = await client.query(`
      SELECT vote_date
      FROM votes
      WHERE student_id = $1
      ORDER BY vote_date DESC
      LIMIT 1
    `, [studentId]);
    
    if (result.rows.length === 0) return 0;
    
    const lastVote = new Date(result.rows[0].vote_date);
    const daysSinceLastVote = (Date.now() - lastVote.getTime()) / (1000 * 60 * 60 * 24);
    
    // Vote within last day = 100, exponential decay after
    return Math.max(100 - (daysSinceLastVote * 10), 0);
  }
  
  /**
   * Calculate equity factor - ensures fair distribution (0-100)
   */
  async calculateEquityFactor(studentId, client) {
    // Get student's NFT count
    const studentResult = await client.query(`
      SELECT governance_nft_count FROM users WHERE id = $1
    `, [studentId]);
    
    const studentNFTs = parseInt(studentResult.rows[0].governance_nft_count) || 0;
    
    // Get average NFT count across all students
    const avgResult = await client.query(`
      SELECT AVG(governance_nft_count) as avg_nfts FROM users WHERE role = 'student'
    `);
    
    const avgNFTs = parseFloat(avgResult.rows[0].avg_nfts) || 0;
    
    // Students below average get higher equity score
    if (studentNFTs < avgNFTs) {
      return 100;
    } else {
      return Math.max(100 - ((studentNFTs - avgNFTs) * 10), 50);
    }
  }
  
  /**
   * Normalize all scores to 0-100 range
   */
  normalizeScores(scores) {
    if (scores.length === 0) return [];
    
    const minScore = Math.min(...scores.map(s => s.poas_score));
    const maxScore = Math.max(...scores.map(s => s.poas_score));
    
    if (minScore === maxScore) return scores;
    
    return scores.map(score => ({
      ...score,
      poas_score: ((score.poas_score - minScore) / (maxScore - minScore)) * 100
    }));
  }
}

module.exports = POASCalculator;

