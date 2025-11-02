const { pool } = require('../config/database');
const logger = require('../utils/logger');

const migrateToFourRoles = async () => {
  const client = await pool.connect();
  
  try {
    logger.info('Migrating database to four-role system...');
    
    // Step 1: Delete the old admin user
    const deleteResult = await client.query(`
      DELETE FROM users WHERE role = 'admin'
    `);
    logger.info(`Deleted ${deleteResult.rowCount} admin user(s)`);
    
    // Step 2: Drop the old role constraint
    await client.query(`
      ALTER TABLE users 
      DROP CONSTRAINT IF EXISTS users_role_check;
    `);
    logger.info('Dropped old role constraint');
    
    // Step 3: Add the new constraint with BNI role
    await client.query(`
      ALTER TABLE users 
      ADD CONSTRAINT users_role_check 
      CHECK (role IN ('student', 'pantry_worker', 'supplier', 'bni'));
    `);
    logger.info('Added new role constraint with BNI');
    
    // Step 4: Create the BNI test user
    const bniUser = {
      email: 'bni@test.com',
      first_name: 'Basic Needs',
      last_name: 'Initiative',
      role: 'bni',
      verified: true
    };
    
    const existingBni = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [bniUser.email]
    );
    
    if (existingBni.rows.length === 0) {
      const insertQuery = `
        INSERT INTO users (
          email, 
          first_name, 
          last_name, 
          role, 
          verified
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING id, email, role
      `;
      
      const result = await client.query(insertQuery, [
        bniUser.email,
        bniUser.first_name,
        bniUser.last_name,
        bniUser.role,
        bniUser.verified
      ]);
      
      logger.info(`Created BNI test user: ${result.rows[0].email}`);
    } else {
      logger.info('BNI test user already exists');
    }
    
    logger.info('Migration completed successfully!');
    logger.info('\nTest login credentials:');
    logger.info('- Student: student@test.com');
    logger.info('- Pantry Worker: pantry@test.com');
    logger.info('- Supplier: supplier@test.com');
    logger.info('- Basic Needs Initiative: bni@test.com');
    
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
  migrateToFourRoles()
    .then(() => process.exit(0))
    .catch(err => {
      logger.error(err);
      process.exit(1);
    });
}

module.exports = migrateToFourRoles;

