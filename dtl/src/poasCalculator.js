const { pool } = require('../../backend/src/config/database');
const logger = require('./utils/logger');

/**
 * POAS (Predicted Optimal Allocation Score) Calculator
 * 
 * Algorithm considers:
 * 1. Governance participation (voting on proposals, engagement level)
 * 2. Student need (historical allocations, redemption rate)
 * 3. Volunteer contribution (verified hours, tier NFTs)
 * 4. Inventory availability
 * 5. Time factors (participation recency)
 * 6. Equity factors (ensuring fair distribution)
 */

class POASCalculator {
  constructor() {
    this.pool = pool;
    
    // POAS weights (configurable)
    this.weights = {
      governance_participation: 0.35, // 35% - Participation in governance votes
      need_factor: 0.20,              // 20% - Historical need (fewer past allocations = higher need)
      redemption_rate: 0.10,          // 10% - Student's redemption reliability
      volunteer_contribution: 0.20,   // 20% - Volunteer hours and tier benefits
      recency: 0.10,                  // 10% - Recency of governance participation
      equity: 0.05                    // 5% - Ensures fair distribution across all students
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
      // 1. Governance participation score
      const governanceParticipation = await this.calculateGovernanceParticipation(studentId, client);
      
      // 2. Need factor (inverse of past allocations)
      const needFactor = await this.calculateNeedFactor(studentId, client);
      
      // 3. Redemption rate
      const redemptionRate = await this.calculateRedemptionRate(studentId, client);
      
      // 4. Volunteer contribution
      const volunteerContribution = await this.calculateVolunteerContribution(studentId, client);
      
      // 5. Recency score (governance participation)
      const recency = await this.calculateRecency(studentId, client);
      
      // 6. Equity factor (ensures fairness)
      const equity = await this.calculateEquityFactor(studentId, client);
      
      // Calculate weighted POAS
      const poas = (
        governanceParticipation * this.weights.governance_participation +
        needFactor * this.weights.need_factor +
        redemptionRate * this.weights.redemption_rate +
        volunteerContribution * this.weights.volunteer_contribution +
        recency * this.weights.recency +
        equity * this.weights.equity
      );
      
      logger.debug(`POAS for student ${studentId}:`, {
        governanceParticipation,
        needFactor,
        redemptionRate,
        volunteerContribution,
        recency,
        equity,
        final: poas
      });
      
      return {
        student_id: studentId,
        poas_score: Math.round(poas * 100) / 100, // Round to 2 decimals
        components: {
          governance_participation: governanceParticipation,
          need_factor: needFactor,
          redemption_rate: redemptionRate,
          volunteer_contribution: volunteerContribution,
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
   * Calculate governance participation (0-100)
   * Based on voting in governance proposals, not food preferences
   */
  async calculateGovernanceParticipation(studentId, client) {
    // Get governance votes in last 90 days
    const votesResult = await client.query(`
      SELECT COUNT(*) as vote_count
      FROM governance_votes
      WHERE voter_user_id = $1 
        AND voter_entity = 'student'
        AND voted_at >= CURRENT_TIMESTAMP - INTERVAL '90 days'
    `, [studentId]);
    
    // Get total active proposals in that period
    const proposalsResult = await client.query(`
      SELECT COUNT(*) as total_proposals
      FROM governance_proposals
      WHERE status IN ('active', 'passed', 'failed', 'executed')
        AND voting_starts_at >= CURRENT_TIMESTAMP - INTERVAL '90 days'
    `);
    
    const voteCount = parseInt(votesResult.rows[0].vote_count) || 0;
    const totalProposals = parseInt(proposalsResult.rows[0].total_proposals) || 1;
    
    // Calculate participation rate
    const participationRate = (voteCount / totalProposals) * 100;
    
    // Bonus for consistent voting
    const consistencyBonus = Math.min(voteCount * 5, 20); // Up to 20 bonus points
    
    const totalScore = Math.min(participationRate + consistencyBonus, 100);
    
    logger.debug(`Governance participation for ${studentId}:`, {
      voteCount,
      totalProposals,
      participationRate,
      consistencyBonus,
      totalScore
    });
    
    return totalScore;
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
   * Calculate volunteer contribution - based on verified hours and tier (0-100)
   * Volunteer tiers provide significant POAS boosts:
   * - Bronze (5+ hrs): +10% boost
   * - Silver (15+ hrs): +20% boost
   * - Gold (30+ hrs): +35% boost
   * - Platinum (50+ hrs): +50% boost
   */
  async calculateVolunteerContribution(studentId, client) {
    // Get verified volunteer hours
    const hoursResult = await client.query(`
      SELECT COALESCE(SUM(hours), 0) as total_hours
      FROM volunteer_hours
      WHERE student_id = $1 AND status = 'verified'
    `, [studentId]);
    
    const totalHours = parseFloat(hoursResult.rows[0].total_hours);
    
    // Base score from hours (0-50 points)
    // 50+ hours = max 50 points
    const hoursScore = Math.min((totalHours / 50) * 50, 50);
    
    // Tier bonus (0-50 points)
    let tierBonus = 0;
    if (totalHours >= 50) {
      tierBonus = 50; // Platinum: +50%
    } else if (totalHours >= 30) {
      tierBonus = 35; // Gold: +35%
    } else if (totalHours >= 15) {
      tierBonus = 20; // Silver: +20%
    } else if (totalHours >= 5) {
      tierBonus = 10; // Bronze: +10%
    }
    
    const totalScore = hoursScore + tierBonus;
    
    logger.debug(`Volunteer contribution for ${studentId}:`, {
      totalHours,
      hoursScore,
      tierBonus,
      totalScore
    });
    
    return Math.min(totalScore, 100);
  }
  
  /**
   * Calculate recency score - recent governance participation weighted higher (0-100)
   */
  async calculateRecency(studentId, client) {
    const result = await client.query(`
      SELECT voted_at
      FROM governance_votes
      WHERE voter_user_id = $1 AND voter_entity = 'student'
      ORDER BY voted_at DESC
      LIMIT 1
    `, [studentId]);
    
    if (result.rows.length === 0) return 0;
    
    const lastVote = new Date(result.rows[0].voted_at);
    const daysSinceLastVote = (Date.now() - lastVote.getTime()) / (1000 * 60 * 60 * 24);
    
    // Vote within last 7 days = 100, gradual decay after
    if (daysSinceLastVote <= 7) return 100;
    if (daysSinceLastVote <= 14) return 75;
    if (daysSinceLastVote <= 30) return 50;
    if (daysSinceLastVote <= 60) return 25;
    return 0;
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

