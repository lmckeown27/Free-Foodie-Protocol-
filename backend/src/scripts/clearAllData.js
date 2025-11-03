const { pool } = require('../config/database');
const logger = require('../utils/logger');

const clearAllData = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    logger.info('Clearing all data from tables...');
    
    // Delete in reverse order of dependencies
    await client.query('TRUNCATE TABLE blockchain_audit_logs CASCADE');
    await client.query('TRUNCATE TABLE reconciliation_records CASCADE');
    await client.query('TRUNCATE TABLE custodial_mappings CASCADE');
    await client.query('TRUNCATE TABLE proposal_signatures CASCADE');
    await client.query('TRUNCATE TABLE transaction_proposals CASCADE');
    await client.query('TRUNCATE TABLE wallet_transactions CASCADE');
    await client.query('TRUNCATE TABLE pantry_wallets CASCADE');
    await client.query('TRUNCATE TABLE governance_actions CASCADE');
    await client.query('TRUNCATE TABLE multi_sig_approvals CASCADE');
    await client.query('TRUNCATE TABLE governance_votes CASCADE');
    await client.query('TRUNCATE TABLE governance_proposals CASCADE');
    await client.query('TRUNCATE TABLE volunteer_nfts CASCADE');
    await client.query('TRUNCATE TABLE volunteer_hours CASCADE');
    await client.query('TRUNCATE TABLE notifications CASCADE');
    await client.query('TRUNCATE TABLE analytics_events CASCADE');
    await client.query('TRUNCATE TABLE nft_records CASCADE');
    await client.query('TRUNCATE TABLE allocations CASCADE');
    await client.query('TRUNCATE TABLE votes CASCADE');
    await client.query('TRUNCATE TABLE compliance_logs CASCADE');
    await client.query('TRUNCATE TABLE inventory CASCADE');
    await client.query('TRUNCATE TABLE users CASCADE');
    
    await client.query('COMMIT');
    logger.info('✅ All data cleared successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Failed to clear data', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

if (require.main === module) {
  clearAllData()
    .then(() => process.exit(0))
    .catch(err => {
      logger.error(err);
      process.exit(1);
    });
}

module.exports = clearAllData;

