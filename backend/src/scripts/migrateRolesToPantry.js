const { pool } = require('../config/database');
const logger = require('../utils/logger');

const migrateRolesToPantry = async () => {
  const client = await pool.connect();
  
  try {
    logger.info('Starting role migration to unified "pantry" role...');
    
    // Step 1: Drop the old CHECK constraint
    logger.info('Dropping old role constraint...');
    await client.query(`
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
    `);
    
    // Step 2: Update pantry_worker and bni roles to pantry (BEFORE adding new constraint)
    logger.info('Updating user roles...');
    const result = await client.query(`
      UPDATE users 
      SET role = 'pantry' 
      WHERE role IN ('pantry_worker', 'bni')
      RETURNING id, email, role
    `);
    
    // Step 3: Add new CHECK constraint with updated roles
    logger.info('Adding new role constraint...');
    await client.query(`
      ALTER TABLE users ADD CONSTRAINT users_role_check 
      CHECK (role IN ('student', 'pantry', 'supplier'));
    `);
    
    if (result.rowCount > 0) {
      logger.info(`Successfully migrated ${result.rowCount} user(s) to "pantry" role:`);
      result.rows.forEach(user => {
        logger.info(`- ${user.email} (ID: ${user.id})`);
      });
    } else {
      logger.info('No users found with old roles (pantry_worker, bni)');
    }
    
    // Verify the migration
    const verifyResult = await client.query(`
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
    `);
    
    logger.info('\nCurrent role distribution:');
    verifyResult.rows.forEach(row => {
      logger.info(`- ${row.role}: ${row.count} user(s)`);
    });
    
    logger.info('\nRole migration completed successfully!');
    
  } catch (error) {
    logger.error('Role migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

// Run migration if called directly
if (require.main === module) {
  migrateRolesToPantry()
    .then(() => {
      logger.info('Migration script finished');
      process.exit(0);
    })
    .catch(err => {
      logger.error('Migration script failed:', err);
      process.exit(1);
    });
}

module.exports = migrateRolesToPantry;

