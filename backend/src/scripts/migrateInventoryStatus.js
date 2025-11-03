const { pool } = require('../config/database');
const logger = require('../utils/logger');

const migrateInventoryStatus = async () => {
  const client = await pool.connect();
  
  try {
    logger.info('Starting inventory status migration...');
    
    // Step 1: Drop the old CHECK constraint
    logger.info('Dropping old status constraint...');
    await client.query(`
      ALTER TABLE inventory DROP CONSTRAINT IF EXISTS inventory_status_check;
    `);
    
    // Step 2: Update any 'expired' status to 'redeemed' (or 'available' if you prefer)
    logger.info('Updating expired status items...');
    const result = await client.query(`
      UPDATE inventory 
      SET status = 'redeemed' 
      WHERE status = 'expired'
      RETURNING id, item_name, status
    `);
    
    if (result.rowCount > 0) {
      logger.info(`Updated ${result.rowCount} item(s) from 'expired' to 'redeemed':`);
      result.rows.forEach(item => {
        logger.info(`- ${item.item_name} (ID: ${item.id})`);
      });
    } else {
      logger.info('No items found with expired status');
    }
    
    // Step 3: Add new CHECK constraint with updated statuses
    logger.info('Adding new status constraint...');
    await client.query(`
      ALTER TABLE inventory ADD CONSTRAINT inventory_status_check 
      CHECK (status IN ('pending', 'available', 'allocated', 'redeemed'));
    `);
    
    // Verify the migration
    const verifyResult = await client.query(`
      SELECT status, COUNT(*) as count
      FROM inventory
      GROUP BY status
    `);
    
    logger.info('\nCurrent status distribution:');
    verifyResult.rows.forEach(row => {
      logger.info(`- ${row.status}: ${row.count} item(s)`);
    });
    
    logger.info('\nInventory status migration completed successfully!');
    
  } catch (error) {
    logger.error('Inventory status migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

// Run migration if called directly
if (require.main === module) {
  migrateInventoryStatus()
    .then(() => {
      logger.info('Migration script finished');
      process.exit(0);
    })
    .catch(err => {
      logger.error('Migration script failed:', err);
      process.exit(1);
    });
}

module.exports = migrateInventoryStatus;

