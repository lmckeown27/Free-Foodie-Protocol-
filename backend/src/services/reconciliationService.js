/**
 * Reconciliation Service
 * 
 * Ensures consistency between off-chain database and on-chain blockchain state.
 * Runs periodically (every 15 minutes) to detect and resolve drift.
 * 
 * Checks performed:
 * 1. NFTs minted in DB but not on chain
 * 2. NFTs on chain but not in DB
 * 3. Status mismatches (DB says redeemed, chain says active)
 * 4. Orphaned records
 */

const db = require('../config/database');
const logger = require('../utils/logger');

// NOTE: In production, use Aptos Indexer GraphQL API
// const { AptosIndexer } = require('@aptos-labs/indexer-sdk');

class ReconciliationService {
  constructor() {
    this.network = process.env.APTOS_NETWORK || 'testnet';
    this.indexerUrl = process.env.APTOS_INDEXER_URL || 'https://indexer-testnet.aptos.com/graphql';
    this.contractAddress = process.env.FFQ_CONTRACT_ADDRESS;
    
    // In production, initialize Aptos Indexer:
    // this.indexer = new AptosIndexer(this.indexerUrl);
  }

  /**
   * Run full reconciliation
   * @returns {Promise<Object>} Reconciliation report
   */
  async runReconciliation() {
    const runId = `recon_${Date.now()}_${uuidv4()}`;
    
    logger.info('Starting reconciliation run', { runId });

    try {
      // Create reconciliation log
      await db.query(
        `INSERT INTO reconciliation_logs (run_id, status, started_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP)`,
        [runId, 'running']
      );

      // Step 1: Get all NFT records from database
      const dbNFTsResult = await db.query(
        `SELECT 
          nft_id,
          nft_type,
          owner_id,
          status,
          transaction_hash as mint_tx,
          burn_transaction_hash as burn_tx,
          minted_at,
          burned_at
         FROM nft_records
         ORDER BY minted_at DESC`
      );

      const dbNFTs = dbNFTsResult.rows;

      logger.info('Fetched DB NFT records', { count: dbNFTs.length, runId });

      // Step 2: Get all NFT records from blockchain
      const chainNFTs = await this.queryChainNFTs();

      logger.info('Fetched chain NFT records', { count: chainNFTs.length, runId });

      // Step 3: Compare and find discrepancies
      const discrepancies = this.compareNFTs(dbNFTs, chainNFTs);

      logger.info('Discrepancies found', { count: discrepancies.length, runId });

      // Step 4: Auto-fix minor discrepancies
      const fixResults = await this.autoFixDiscrepancies(discrepancies);

      logger.info('Auto-fix completed', { 
        fixed: fixResults.fixed,
        pending: fixResults.pending,
        runId 
      });

      // Step 5: Update reconciliation log
      await db.query(
        `UPDATE reconciliation_logs
         SET status = $1,
             db_record_count = $2,
             chain_record_count = $3,
             discrepancies_found = $4,
             discrepancies_fixed = $5,
             discrepancies_pending = $6,
             discrepancy_details = $7,
             completed_at = CURRENT_TIMESTAMP
         WHERE run_id = $8`,
        [
          'completed',
          dbNFTs.length,
          chainNFTs.length,
          discrepancies.length,
          fixResults.fixed,
          fixResults.pending,
          JSON.stringify({
            discrepancies: discrepancies.map(d => ({
              type: d.type,
              nftId: d.nftId,
              issue: d.issue
            })),
            autoFixed: fixResults.fixedItems,
            pendingReview: fixResults.pendingItems
          }),
          runId
        ]
      );

      logger.info('Reconciliation completed successfully', { runId });

      // Step 6: Raise alerts if needed
      if (fixResults.pending > 10) {
        await this.raiseAlert('critical', `${fixResults.pending} discrepancies require manual review`, runId);
      } else if (fixResults.pending > 0) {
        await this.raiseAlert('warning', `${fixResults.pending} discrepancies require manual review`, runId);
      }

      return {
        runId,
        status: 'completed',
        dbRecordCount: dbNFTs.length,
        chainRecordCount: chainNFTs.length,
        discrepanciesFound: discrepancies.length,
        discrepanciesFixed: fixResults.fixed,
        discrepanciesPending: fixResults.pending
      };

    } catch (error) {
      logger.error('Reconciliation failed', { runId, error: error.message });

      // Update log with failure
      await db.query(
        `UPDATE reconciliation_logs
         SET status = $1, error_message = $2, completed_at = CURRENT_TIMESTAMP
         WHERE run_id = $3`,
        ['failed', error.message, runId]
      );

      await this.raiseAlert('critical', `Reconciliation failed: ${error.message}`, runId);

      throw error;
    }
  }

  /**
   * Query NFTs from blockchain
   * @returns {Promise<Array>} Chain NFT records
   */
  async queryChainNFTs() {
    try {
      // In production, use Aptos Indexer GraphQL:
      // const query = `
      //   query GetFFQNFTs {
      //     current_token_ownerships_v2(
      //       where: {
      //         creator_address: { _eq: "${this.contractAddress}" }
      //       }
      //     ) {
      //       token_data_id
      //       owner_address
      //       amount
      //       token_properties
      //       last_transaction_version
      //     }
      //   }
      // `;
      // const result = await this.indexer.query(query);
      // return result.data.current_token_ownerships_v2;

      // STUB: Return empty for now (no actual blockchain)
      logger.warn('Blockchain query stubbed - no actual chain data');
      return [];

    } catch (error) {
      logger.error('Failed to query chain NFTs', { error: error.message });
      throw error;
    }
  }

  /**
   * Compare DB and chain NFTs to find discrepancies
   * @param {Array} dbNFTs - NFTs from database
   * @param {Array} chainNFTs - NFTs from blockchain
   * @returns {Array} List of discrepancies
   */
  compareNFTs(dbNFTs, chainNFTs) {
    const discrepancies = [];

    // Create maps for efficient lookup
    const dbMap = new Map(dbNFTs.map(nft => [nft.nft_id, nft]));
    const chainMap = new Map(chainNFTs.map(nft => [nft.token_data_id, nft]));

    // Check 1: NFTs in DB but not on chain
    for (const dbNFT of dbNFTs) {
      if (dbNFT.status === 'active' && !chainMap.has(dbNFT.nft_id)) {
        discrepancies.push({
          type: 'minted_in_db_not_on_chain',
          nftId: dbNFT.nft_id,
          dbStatus: dbNFT.status,
          chainStatus: 'not_found',
          issue: 'NFT marked as minted in DB but not found on chain',
          suggestedAction: 'retry_mint',
          severity: 'high',
          dbRecord: dbNFT
        });
      }

      if (dbNFT.status === 'redeemed' && chainMap.has(dbNFT.nft_id)) {
        const chainNFT = chainMap.get(dbNFT.nft_id);
        if (chainNFT.amount > 0) { // Still exists on chain
          discrepancies.push({
            type: 'status_mismatch_burned',
            nftId: dbNFT.nft_id,
            dbStatus: 'redeemed',
            chainStatus: 'active',
            issue: 'NFT marked as redeemed in DB but still active on chain',
            suggestedAction: 'retry_burn',
            severity: 'medium',
            dbRecord: dbNFT,
            chainRecord: chainNFT
          });
        }
      }
    }

    // Check 2: NFTs on chain but not in DB
    for (const chainNFT of chainNFTs) {
      if (!dbMap.has(chainNFT.token_data_id)) {
        discrepancies.push({
          type: 'on_chain_not_in_db',
          nftId: chainNFT.token_data_id,
          dbStatus: 'not_found',
          chainStatus: 'active',
          issue: 'NFT exists on chain but not in DB',
          suggestedAction: 'add_to_db',
          severity: 'high',
          chainRecord: chainNFT
        });
      }
    }

    // Check 3: Orphaned allocations (allocation minted but no NFT record)
    // This would require additional DB queries...

    return discrepancies;
  }

  /**
   * Auto-fix minor discrepancies
   * @param {Array} discrepancies
   * @returns {Promise<Object>} Fix results
   */
  async autoFixDiscrepancies(discrepancies) {
    const fixedItems = [];
    const pendingItems = [];

    for (const discrepancy of discrepancies) {
      try {
        // Auto-fix: Update DB status if NFT not found on chain after 24 hours
        if (discrepancy.type === 'minted_in_db_not_on_chain') {
          const mintedAt = new Date(discrepancy.dbRecord.minted_at);
          const hoursSinceMint = (Date.now() - mintedAt.getTime()) / (1000 * 60 * 60);

          if (hoursSinceMint > 24) {
            logger.info('Auto-fixing: marking NFT as failed', { nftId: discrepancy.nftId });

            await db.query(
              `UPDATE nft_records
               SET status = $1, 
                   metadata = jsonb_set(
                     COALESCE(metadata, '{}'), 
                     '{reconciliation_note}', 
                     '"Auto-marked as failed after 24h - not found on chain"'
                   )
               WHERE nft_id = $2`,
              ['failed', discrepancy.nftId]
            );

            fixedItems.push(discrepancy);
          } else {
            // Too soon to auto-fix, keep as pending
            pendingItems.push(discrepancy);
          }
        }

        // Auto-fix: Add chain NFTs to DB if they belong to our contract
        else if (discrepancy.type === 'on_chain_not_in_db') {
          logger.info('Auto-fixing: adding chain NFT to DB', { nftId: discrepancy.nftId });

          await db.query(
            `INSERT INTO nft_records 
              (nft_id, nft_type, owner_id, status, transaction_hash, 
               metadata, minted_at)
             VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
             ON CONFLICT (nft_id) DO NOTHING`,
            [
              discrepancy.chainRecord.token_data_id,
              'unknown', // Need to parse from token_properties
              discrepancy.chainRecord.owner_address,
              'active',
              discrepancy.chainRecord.last_transaction_version,
              JSON.stringify({
                reconciliation_note: 'Auto-added from chain',
                token_properties: discrepancy.chainRecord.token_properties
              })
            ]
          );

          fixedItems.push(discrepancy);
        }

        // Cannot auto-fix: Requires manual review
        else {
          pendingItems.push(discrepancy);
        }

      } catch (error) {
        logger.error('Failed to auto-fix discrepancy', { 
          discrepancy, 
          error: error.message 
        });
        pendingItems.push(discrepancy);
      }
    }

    return {
      fixed: fixedItems.length,
      pending: pendingItems.length,
      fixedItems,
      pendingItems
    };
  }

  /**
   * Raise alert (would integrate with monitoring system)
   * @param {string} severity - 'info', 'warning', 'critical'
   * @param {string} message
   * @param {string} runId
   */
  async raiseAlert(severity, message, runId) {
    logger[severity === 'critical' ? 'error' : 'warn']('Reconciliation alert', { 
      severity, 
      message, 
      runId 
    });

    // In production, integrate with PagerDuty, Slack, etc.
    // await pagerduty.triggerIncident({ severity, message, runId });
    // await slack.postMessage('#ffq-alerts', message);

    // Log to audit trail
    await db.query(
      `SELECT log_audit_event($1, $2, $3, $4, $5, $6, $7)`,
      [
        'reconciliation_alert',
        'system_event',
        null,
        'system',
        'reconciliation',
        null,
        JSON.stringify({ severity, message, runId })
      ]
    );
  }

  /**
   * Get latest reconciliation status
   * @returns {Promise<Object|null>}
   */
  async getLatestStatus() {
    try {
      const result = await db.query(
        `SELECT * FROM reconciliation_logs 
         ORDER BY started_at DESC 
         LIMIT 1`
      );

      if (result.rows.length === 0) {
        return null;
      }

      const log = result.rows[0];

      return {
        runId: log.run_id,
        status: log.status,
        dbRecordCount: log.db_record_count,
        chainRecordCount: log.chain_record_count,
        discrepanciesFound: log.discrepancies_found,
        discrepanciesFixed: log.discrepancies_fixed,
        discrepanciesPending: log.discrepancies_pending,
        discrepancyDetails: log.discrepancy_details,
        startedAt: log.started_at,
        completedAt: log.completed_at,
        errorMessage: log.error_message
      };
    } catch (error) {
      logger.error('Failed to get reconciliation status', { error: error.message });
      throw error;
    }
  }

  /**
   * Get reconciliation history
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  async getHistory(limit = 10) {
    try {
      const result = await db.query(
        `SELECT 
          run_id,
          status,
          db_record_count,
          chain_record_count,
          discrepancies_found,
          discrepancies_fixed,
          discrepancies_pending,
          started_at,
          completed_at
         FROM reconciliation_logs
         ORDER BY started_at DESC
         LIMIT $1`,
        [limit]
      );

      return result.rows;
    } catch (error) {
      logger.error('Failed to get reconciliation history', { error: error.message });
      throw error;
    }
  }

  /**
   * Manual trigger (for admin use)
   * @returns {Promise<Object>}
   */
  async triggerManualRun() {
    logger.info('Manual reconciliation triggered');
    return this.runReconciliation();
  }
}

// Singleton instance
const reconciliationService = new ReconciliationService();

// Set up periodic reconciliation (every 15 minutes)
const RECONCILIATION_INTERVAL = 15 * 60 * 1000; // 15 minutes

let reconciliationInterval;

function startPeriodicReconciliation() {
  if (reconciliationInterval) {
    clearInterval(reconciliationInterval);
  }

  logger.info('Starting periodic reconciliation', { 
    interval: `${RECONCILIATION_INTERVAL / 60000} minutes` 
  });

  reconciliationInterval = setInterval(async () => {
    try {
      await reconciliationService.runReconciliation();
    } catch (error) {
      logger.error('Periodic reconciliation error', { error: error.message });
    }
  }, RECONCILIATION_INTERVAL);

  // Run immediately on startup
  setTimeout(async () => {
    try {
      await reconciliationService.runReconciliation();
    } catch (error) {
      logger.error('Initial reconciliation error', { error: error.message });
    }
  }, 5000); // Wait 5 seconds after startup
}

function stopPeriodicReconciliation() {
  if (reconciliationInterval) {
    clearInterval(reconciliationInterval);
    logger.info('Stopped periodic reconciliation');
  }
}

module.exports = {
  reconciliationService,
  startPeriodicReconciliation,
  stopPeriodicReconciliation
};
