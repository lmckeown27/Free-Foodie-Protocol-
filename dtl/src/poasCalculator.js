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
   * Calculate collective POAS score for the entire system
   * This represents the overall student body engagement and helps Pantry
   * determine what food quantities to request from suppliers
   */
  async calculateCollectiveScore() {
    const client = await this.pool.connect();
    
    try {
      // Get all students
      const studentsResult = await client.query(`
        SELECT id FROM users WHERE role = 'student'
      `);
      
      const totalStudents = studentsResult.rows.length;
      
      if (totalStudents === 0) {
        return {
          collective_poas_score: 0,
          total_students: 0,
          aggregate_components: {
            governance_participation: 0,
            volunteer_contribution: 0,
            system_engagement: 0
          },
          interpretation: 'No students in system',
          recommendation: 'Maintain minimal inventory levels'
        };
      }
      
      // Calculate aggregate metrics
      let totalGovernanceParticipation = 0;
      let totalVolunteerContribution = 0;
      let totalRecency = 0;
      
      for (const student of studentsResult.rows) {
        const govScore = await this.calculateGovernanceParticipation(student.id, client);
        const volScore = await this.calculateVolunteerContribution(student.id, client);
        const recencyScore = await this.calculateRecency(student.id, client);
        
        totalGovernanceParticipation += govScore;
        totalVolunteerContribution += volScore;
        totalRecency += recencyScore;
      }
      
      // Calculate average scores across all students
      const avgGovernance = totalGovernanceParticipation / totalStudents;
      const avgVolunteer = totalVolunteerContribution / totalStudents;
      const avgRecency = totalRecency / totalStudents;
      
      // Collective POAS weighs engagement factors
      // Higher collective score = more active student body = request more food
      const collectivePOAS = (
        avgGovernance * 0.40 +      // 40% - Governance participation
        avgVolunteer * 0.40 +        // 40% - Volunteer contribution  
        avgRecency * 0.20            // 20% - Recent activity
      );
      
      // Provide interpretation for Pantry
      let interpretation = '';
      let recommendation = '';
      
      if (collectivePOAS >= 75) {
        interpretation = 'Very High - Highly engaged student body';
        recommendation = 'Request maximum food quantities from suppliers. High redemption expected.';
      } else if (collectivePOAS >= 50) {
        interpretation = 'High - Active student engagement';
        recommendation = 'Request increased food quantities. Good redemption rate expected.';
      } else if (collectivePOAS >= 30) {
        interpretation = 'Moderate - Average student engagement';
        recommendation = 'Request standard food quantities based on historical averages.';
      } else if (collectivePOAS >= 15) {
        interpretation = 'Low - Below average engagement';
        recommendation = 'Request reduced quantities. Consider engagement initiatives.';
      } else {
        interpretation = 'Very Low - Minimal engagement';
        recommendation = 'Request minimal quantities. Focus on student outreach.';
      }
      
      logger.info('Collective POAS calculated:', {
        collectivePOAS,
        totalStudents,
        avgGovernance,
        avgVolunteer,
        avgRecency
      });
      
      return {
        collective_poas_score: Math.round(collectivePOAS * 100) / 100,
        total_students: totalStudents,
        aggregate_components: {
          governance_participation: Math.round(avgGovernance * 100) / 100,
          volunteer_contribution: Math.round(avgVolunteer * 100) / 100,
          recent_activity: Math.round(avgRecency * 100) / 100
        },
        interpretation,
        recommendation,
        calculated_at: new Date()
      };
    } finally {
      client.release();
    }
  }
  
  /**
   * Calculate POAS scores for food items based on student demand and engagement
   * Higher POAS score = Higher priority item that should be stocked/allocated
   */
  async calculateFoodItemScores() {
    const client = await this.pool.connect();
    
    try {
      // Get all available and allocated inventory items
      const itemsResult = await client.query(`
        SELECT DISTINCT 
          item_name,
          item_type,
          id,
          quantity,
          unit,
          status
        FROM inventory
        WHERE status IN ('available', 'allocated', 'pending')
        ORDER BY item_name
      `);
      
      const scores = [];
      
      for (const item of itemsResult.rows) {
        const score = await this.calculateItemScore(item, client);
        scores.push(score);
      }
      
      // Sort by POAS score (highest first)
      scores.sort((a, b) => b.poas_score - a.poas_score);
      
      return scores;
    } finally {
      client.release();
    }
  }
  
  /**
   * Calculate POAS score for a specific food item
   */
  async calculateItemScore(item, client) {
    // 1. Student demand (votes for this item)
    const demandScore = await this.calculateItemDemand(item.item_name, item.item_type, client);
    
    // 2. Redemption rate (how often this item type gets picked up)
    const redemptionScore = await this.calculateItemRedemptionRate(item.item_type, client);
    
    // 3. Urgency (expiring soon, low quantity)
    const urgencyScore = await this.calculateItemUrgency(item, client);
    
    // 4. Trending score (recent votes/interest)
    const trendingScore = await this.calculateItemTrending(item.item_name, item.item_type, client);
    
    // Calculate weighted POAS for the item
    const poas = (
      demandScore * 0.35 +        // 35% - Student demand/votes
      redemptionScore * 0.25 +     // 25% - Redemption reliability
      urgencyScore * 0.20 +        // 20% - Urgency/scarcity
      trendingScore * 0.20         // 20% - Recent trending
    );
    
    return {
      item_id: item.id,
      item_name: item.item_name,
      item_type: item.item_type,
      quantity: item.quantity,
      unit: item.unit,
      status: item.status,
      poas_score: Math.round(poas * 100) / 100,
      components: {
        demand: Math.round(demandScore * 100) / 100,
        redemption_rate: Math.round(redemptionScore * 100) / 100,
        urgency: Math.round(urgencyScore * 100) / 100,
        trending: Math.round(trendingScore * 100) / 100
      },
      calculated_at: new Date()
    };
  }
  
  /**
   * Calculate student demand for this item based on votes
   */
  async calculateItemDemand(itemName, itemType, client) {
    const result = await client.query(`
      SELECT 
        COUNT(*) as vote_count,
        AVG(priority) as avg_priority
      FROM voting
      WHERE (item_name = $1 OR item_type = $2)
        AND created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
    `, [itemName, itemType]);
    
    const voteCount = parseInt(result.rows[0].vote_count) || 0;
    const avgPriority = parseFloat(result.rows[0].avg_priority) || 0;
    
    // Score based on vote count and average priority (1-5)
    const volumeScore = Math.min((voteCount / 10) * 50, 50); // Max 50 points
    const priorityScore = (avgPriority / 5) * 50; // Max 50 points
    
    return Math.min(volumeScore + priorityScore, 100);
  }
  
  /**
   * Calculate redemption rate for this item type
   */
  async calculateItemRedemptionRate(itemType, client) {
    const result = await client.query(`
      SELECT 
        COUNT(*) as total_allocated,
        COUNT(CASE WHEN status = 'redeemed' THEN 1 END) as redeemed_count
      FROM allocations
      WHERE item_type = $1
        AND status IN ('redeemed', 'expired')
    `, [itemType]);
    
    const total = parseInt(result.rows[0].total_allocated);
    const redeemed = parseInt(result.rows[0].redeemed_count);
    
    if (total === 0) return 75; // Default score for new items
    
    return (redeemed / total) * 100;
  }
  
  /**
   * Calculate urgency score based on quantity and expiration
   */
  async calculateItemUrgency(item, client) {
    let urgency = 50; // Base score
    
    // Low quantity increases urgency
    if (item.quantity < 5) {
      urgency += 30;
    } else if (item.quantity < 10) {
      urgency += 15;
    }
    
    // Pending status (coming soon) reduces urgency
    if (item.status === 'pending') {
      urgency -= 20;
    }
    
    return Math.max(0, Math.min(urgency, 100));
  }
  
  /**
   * Calculate trending score based on recent votes
   */
  async calculateItemTrending(itemName, itemType, client) {
    const result = await client.query(`
      SELECT COUNT(*) as recent_votes
      FROM voting
      WHERE (item_name = $1 OR item_type = $2)
        AND created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
    `, [itemName, itemType]);
    
    const recentVotes = parseInt(result.rows[0].recent_votes) || 0;
    
    // 5+ votes in last week = trending
    return Math.min((recentVotes / 5) * 100, 100);
  }
  
  /**
   * Calculate POAS for all students (used for allocation recommendations)
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

