const { pool } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Audit Service
 * Comprehensive logging of all blockchain and system operations
 */
class AuditService {
  /**
   * Log a blockchain event
   * @param {Object} params - Event parameters
   * @returns {Promise<Object>} Created audit log
   */
  async logBlockchainEvent({
    eventType,
    actorUserId,
    actorRole,
    targetUserId,
    transactionId,
    actionDescription,
    beforeState,
    afterState,
    ipAddress,
    userAgent
  }) {
    try {
      const result = await pool.query(`
        INSERT INTO blockchain_audit_logs (
          event_type,
          actor_user_id,
          actor_role,
          target_user_id,
          transaction_id,
          action_description,
          before_state,
          after_state,
          ip_address,
          user_agent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        eventType,
        actorUserId || null,
        actorRole || null,
        targetUserId || null,
        transactionId || null,
        actionDescription,
        beforeState ? JSON.stringify(beforeState) : null,
        afterState ? JSON.stringify(afterState) : null,
        ipAddress || null,
        userAgent || null
      ]);
      
      logger.info(`Audit log created: ${eventType}`, {
        actor: actorUserId,
        target: targetUserId
      });
      
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to create audit log', error);
      // Don't throw - audit logging failures shouldn't break the main flow
      return null;
    }
  }
  
  /**
   * Get audit logs for a user
   * @param {string} userId - User ID
   * @param {number} limit - Max results
   * @returns {Promise<Array>} Audit logs
   */
  async getUserAuditLogs(userId, limit = 100) {
    const result = await pool.query(`
      SELECT * FROM blockchain_audit_logs
      WHERE actor_user_id = $1 OR target_user_id = $1
      ORDER BY event_timestamp DESC
      LIMIT $2
    `, [userId, limit]);
    
    return result.rows;
  }
  
  /**
   * Get audit logs for a transaction
   * @param {string} transactionId - Transaction ID
   * @returns {Promise<Array>} Audit logs
   */
  async getTransactionAuditLogs(transactionId) {
    const result = await pool.query(`
      SELECT * FROM blockchain_audit_logs
      WHERE transaction_id = $1
      ORDER BY event_timestamp ASC
    `, [transactionId]);
    
    return result.rows;
  }
  
  /**
   * Get audit logs by event type
   * @param {string} eventType - Event type
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {number} limit - Max results
   * @returns {Promise<Array>} Audit logs
   */
  async getAuditLogsByType(eventType, startDate, endDate, limit = 1000) {
    const result = await pool.query(`
      SELECT * FROM blockchain_audit_logs
      WHERE event_type = $1
        AND event_timestamp >= $2
        AND event_timestamp <= $3
      ORDER BY event_timestamp DESC
      LIMIT $4
    `, [eventType, startDate, endDate, limit]);
    
    return result.rows;
  }
  
  /**
   * Generate audit report
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Object>} Audit report
   */
  async generateAuditReport(startDate, endDate) {
    const result = await pool.query(`
      SELECT 
        event_type,
        COUNT(*) as event_count,
        COUNT(DISTINCT actor_user_id) as unique_actors,
        COUNT(DISTINCT target_user_id) as unique_targets
      FROM blockchain_audit_logs
      WHERE event_timestamp >= $1 AND event_timestamp <= $2
      GROUP BY event_type
      ORDER BY event_count DESC
    `, [startDate, endDate]);
    
    return {
      startDate,
      endDate,
      eventSummary: result.rows,
      totalEvents: result.rows.reduce((sum, row) => sum + parseInt(row.event_count), 0)
    };
  }
}

module.exports = new AuditService();

