const { pool } = require('../config/database');
const logger = require('../utils/logger');
const aptosService = require('./aptosService');
const walletService = require('./walletService');

/**
 * Reconciliation Service
 * Syncs on-chain and off-chain state to ensure consistency
 */
class ReconciliationService {
  /**
   * Reconcile NFT ownership for all users
   * @returns {Promise<Object>} Reconciliation results
   */
  async reconcileNFTOwnership() {
    logger.info('Starting NFT ownership reconciliation...');
    
    try {
      // Get all active custodial mappings for NFTs
      const mappingsResult = await pool.query(`
        SELECT * FROM custodial_mappings
        WHERE asset_type IN ('supplier_nft', 'allocation_nft', 'governance_nft', 'volunteer_nft')
          AND status = 'active'
      `);
      
      const results = {
        total: mappingsResult.rows.length,
        matched: 0,
        discrepancies: 0,
        errors: 0
      };
      
      for (const mapping of mappingsResult.rows) {
        try {
          // Get off-chain state
          const offChainState = {
            user_id: mapping.user_id,
            asset_type: mapping.asset_type,
            asset_identifier: mapping.asset_identifier,
            status: mapping.status
          };
          
          // Get on-chain state
          const onChainState = await this.getOnChainNFTState(
            mapping.asset_identifier,
            mapping.on_chain_address
          );
          
          // Compare states
          const isMatch = this.compareNFTStates(offChainState, onChainState);
          
          if (isMatch) {
            results.matched++;
          } else {
            results.discrepancies++;
            
            // Record discrepancy
            await this.recordDiscrepancy({
              reconciliationType: 'nft_ownership',
              entityType: 'custodial_mapping',
              entityId: mapping.id,
              offChainState,
              onChainState,
              discrepancyDetails: 'NFT state mismatch between off-chain and on-chain'
            });
          }
        } catch (error) {
          logger.error(`Error reconciling mapping ${mapping.id}`, error);
          results.errors++;
        }
      }
      
      logger.info('NFT ownership reconciliation complete', results);
      return results;
    } catch (error) {
      logger.error('Failed to reconcile NFT ownership', error);
      throw error;
    }
  }
  
  /**
   * Reconcile transaction statuses
   * @returns {Promise<Object>} Reconciliation results
   */
  async reconcileTransactions() {
    logger.info('Starting transaction status reconciliation...');
    
    try {
      // Get all pending transactions older than 5 minutes
      const transactionsResult = await pool.query(`
        SELECT * FROM wallet_transactions
        WHERE status = 'pending'
          AND submitted_at < NOW() - INTERVAL '5 minutes'
      `);
      
      const results = {
        total: transactionsResult.rows.length,
        confirmed: 0,
        failed: 0,
        stillPending: 0,
        errors: 0
      };
      
      for (const tx of transactionsResult.rows) {
        try {
          // Check on-chain status
          const onChainStatus = await aptosService.getTransactionStatus(tx.transaction_hash);
          
          if (onChainStatus.status === 'confirmed') {
            // Update transaction to confirmed
            await pool.query(`
              UPDATE wallet_transactions
              SET status = 'confirmed',
                  block_number = $1,
                  confirmed_at = NOW()
              WHERE id = $2
            `, [onChainStatus.blockNumber, tx.id]);
            
            results.confirmed++;
          } else if (onChainStatus.status === 'failed') {
            // Update transaction to failed
            await pool.query(`
              UPDATE wallet_transactions
              SET status = 'failed',
                  error_message = $1
              WHERE id = $2
            `, [onChainStatus.error || 'Transaction failed', tx.id]);
            
            results.failed++;
          } else {
            results.stillPending++;
          }
        } catch (error) {
          logger.error(`Error reconciling transaction ${tx.id}`, error);
          results.errors++;
        }
      }
      
      logger.info('Transaction status reconciliation complete', results);
      return results;
    } catch (error) {
      logger.error('Failed to reconcile transactions', error);
      throw error;
    }
  }
  
  /**
   * Reconcile allocation statuses
   * @returns {Promise<Object>} Reconciliation results
   */
  async reconcileAllocations() {
    logger.info('Starting allocation status reconciliation...');
    
    try {
      // Get all approved allocations with NFTs
      const allocationsResult = await pool.query(`
        SELECT a.*, n.status as nft_status, n.nft_id
        FROM allocations a
        LEFT JOIN nft_records n ON n.owner_id = a.student_id 
          AND n.nft_id = a.allocation_nft_id
        WHERE a.status IN ('approved', 'pending')
          AND a.allocation_nft_id IS NOT NULL
      `);
      
      const results = {
        total: allocationsResult.rows.length,
        matched: 0,
        discrepancies: 0,
        errors: 0
      };
      
      for (const allocation of allocationsResult.rows) {
        try {
          const offChainState = {
            allocation_status: allocation.status,
            nft_status: allocation.nft_status
          };
          
          // If NFT is redeemed but allocation isn't, or vice versa, record discrepancy
          const isMatch = (
            (allocation.status === 'redeemed' && allocation.nft_status === 'redeemed') ||
            (allocation.status === 'approved' && allocation.nft_status === 'active') ||
            (allocation.status === 'pending' && !allocation.nft_id)
          );
          
          if (isMatch) {
            results.matched++;
          } else {
            results.discrepancies++;
            
            await this.recordDiscrepancy({
              reconciliationType: 'allocation_status',
              entityType: 'allocation',
              entityId: allocation.id,
              offChainState,
              onChainState: { nft_status: allocation.nft_status },
              discrepancyDetails: 'Allocation status does not match NFT status'
            });
          }
        } catch (error) {
          logger.error(`Error reconciling allocation ${allocation.id}`, error);
          results.errors++;
        }
      }
      
      logger.info('Allocation status reconciliation complete', results);
      return results;
    } catch (error) {
      logger.error('Failed to reconcile allocations', error);
      throw error;
    }
  }
  
  /**
   * Run full reconciliation
   * @returns {Promise<Object>} Combined results
   */
  async runFullReconciliation() {
    logger.info('Starting full reconciliation...');
    
    const results = {
      startTime: new Date(),
      nftOwnership: await this.reconcileNFTOwnership(),
      transactions: await this.reconcileTransactions(),
      allocations: await this.reconcileAllocations(),
      endTime: new Date()
    };
    
    results.duration = results.endTime - results.startTime;
    
    logger.info('Full reconciliation complete', {
      duration: `${results.duration}ms`,
      totalDiscrepancies: 
        results.nftOwnership.discrepancies +
        results.allocations.discrepancies
    });
    
    return results;
  }
  
  /**
   * Get on-chain NFT state
   * @param {string} tokenId - Token ID
   * @param {string} expectedOwner - Expected owner address
   * @returns {Promise<Object>} On-chain state
   */
  async getOnChainNFTState(tokenId, expectedOwner) {
    try {
      const metadata = await aptosService.getNFTMetadata(tokenId);
      const ownershipVerified = await aptosService.verifyNFTOwnership(tokenId, expectedOwner);
      
      return {
        tokenId,
        exists: true,
        owner: expectedOwner,
        ownershipVerified,
        metadata
      };
    } catch (error) {
      logger.warn(`Could not get on-chain state for token ${tokenId}`, error);
      return {
        tokenId,
        exists: false,
        error: error.message
      };
    }
  }
  
  /**
   * Compare NFT states
   * @param {Object} offChainState - Off-chain state
   * @param {Object} onChainState - On-chain state
   * @returns {boolean} True if states match
   */
  compareNFTStates(offChainState, onChainState) {
    // If NFT doesn't exist on-chain but we have it off-chain, that's a problem
    if (!onChainState.exists && offChainState.status === 'active') {
      return false;
    }
    
    // If ownership can't be verified, that's a problem
    if (onChainState.exists && !onChainState.ownershipVerified) {
      return false;
    }
    
    // Otherwise, assume match (in production, do more thorough checks)
    return true;
  }
  
  /**
   * Record a discrepancy
   * @param {Object} params - Discrepancy parameters
   * @returns {Promise<Object>} Created record
   */
  async recordDiscrepancy({
    reconciliationType,
    entityType,
    entityId,
    offChainState,
    onChainState,
    discrepancyDetails
  }) {
    const result = await pool.query(`
      INSERT INTO reconciliation_records (
        reconciliation_type,
        entity_type,
        entity_id,
        off_chain_state,
        on_chain_state,
        discrepancy_found,
        discrepancy_details
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      reconciliationType,
      entityType,
      entityId,
      JSON.stringify(offChainState),
      JSON.stringify(onChainState),
      true,
      discrepancyDetails
    ]);
    
    logger.warn('Discrepancy recorded', {
      type: reconciliationType,
      entity: entityType,
      id: entityId
    });
    
    return result.rows[0];
  }
  
  /**
   * Get unresolved discrepancies
   * @returns {Promise<Array>} Unresolved discrepancies
   */
  async getUnresolvedDiscrepancies() {
    const result = await pool.query(`
      SELECT * FROM reconciliation_records
      WHERE discrepancy_found = true
        AND resolution_status = 'pending'
      ORDER BY checked_at DESC
    `);
    
    return result.rows;
  }
  
  /**
   * Resolve a discrepancy
   * @param {string} recordId - Record ID
   * @param {string} resolvedBy - User ID who resolved it
   * @returns {Promise<Object>} Updated record
   */
  async resolveDiscrepancy(recordId, resolvedBy) {
    const result = await pool.query(`
      UPDATE reconciliation_records
      SET resolution_status = 'resolved',
          resolved_at = NOW(),
          resolved_by = $1
      WHERE id = $2
      RETURNING *
    `, [resolvedBy, recordId]);
    
    logger.info(`Discrepancy ${recordId} resolved by ${resolvedBy}`);
    
    return result.rows[0];
  }
}

module.exports = new ReconciliationService();

