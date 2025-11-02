const { pool } = require('../config/database');
const logger = require('../utils/logger');

const addBniRole = async () => {
  const client = await pool.connect();
  
  try {
    logger.info('Updating users table to add BNI role...');
    
    // Drop the old constraint
    await client.query(`
      ALTER TABLE users 
      DROP CONSTRAINT IF EXISTS users_role_check;
    `);
    
    logger.info('Dropped old role constraint');
    
    // Add the new constraint with BNI role included
    await client.query(`
      ALTER TABLE users 
      ADD CONSTRAINT users_role_check 
      CHECK (role IN ('student', 'pantry_worker', 'supplier', 'bni'));
    `);
    
    logger.info('Added new role constraint with BNI role');
    logger.info('Migration completed successfully!');
    
  } catch (error) {
    logger.error('Migration failed', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

// Run migration if called directly
if (require.main === module) {
  addBniRole()
    .then(() => process.exit(0))
    .catch(err => {
      logger.error(err);
      process.exit(1);
    });
}

module.exports = addBniRole;

