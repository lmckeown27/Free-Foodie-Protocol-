const POASCalculator = require('./poasCalculator');
const InventoryNormalizer = require('./inventoryNormalizer');
const logger = require('./utils/logger');

/**
 * Data Translation Layer (DTL) Main Entry Point
 * 
 * Responsibilities:
 * 1. Calculate POAS (Predicted Optimal Allocation Score)
 * 2. Normalize supplier inventory data
 * 3. Aggregate student voting data
 * 4. Support Council decision-making
 */

class DTL {
  constructor() {
    this.poasCalculator = new POASCalculator();
    this.inventoryNormalizer = new InventoryNormalizer();
  }
  
  /**
   * Calculate POAS for all students based on current votes and inventory
   */
  async calculateAllocationScores() {
    logger.info('Starting POAS calculation for all students');
    
    try {
      const scores = await this.poasCalculator.calculateScores();
      logger.info(`POAS calculation complete. Generated ${scores.length} scores.`);
      return scores;
    } catch (error) {
      logger.error('POAS calculation failed', error);
      throw error;
    }
  }
  
  /**
   * Calculate POAS for a specific student
   */
  async calculateStudentScore(studentId) {
    logger.info(`Calculating POAS for student: ${studentId}`);
    
    try {
      const score = await this.poasCalculator.calculateStudentScore(studentId);
      return score;
    } catch (error) {
      logger.error(`POAS calculation failed for student ${studentId}`, error);
      throw error;
    }
  }
  
  /**
   * Normalize inventory data from supplier
   */
  async normalizeInventoryData(rawInventoryData) {
    logger.info('Normalizing inventory data');
    
    try {
      const normalized = await this.inventoryNormalizer.normalize(rawInventoryData);
      return normalized;
    } catch (error) {
      logger.error('Inventory normalization failed', error);
      throw error;
    }
  }
  
  /**
   * Verify inventory data integrity
   */
  async verifyInventoryIntegrity(inventoryId) {
    logger.info(`Verifying inventory integrity: ${inventoryId}`);
    
    try {
      const isValid = await this.inventoryNormalizer.verify(inventoryId);
      return isValid;
    } catch (error) {
      logger.error(`Inventory verification failed for ${inventoryId}`, error);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new DTL();

// If run directly, start DTL service
if (require.main === module) {
  logger.info('DTL Service starting...');
  
  // Example: Run POAS calculation every hour
  const dtl = new DTL();
  
  setInterval(async () => {
    try {
      await dtl.calculateAllocationScores();
    } catch (error) {
      logger.error('Scheduled POAS calculation failed', error);
    }
  }, 60 * 60 * 1000); // Every hour
  
  logger.info('DTL Service running. POAS calculations scheduled every hour.');
}

