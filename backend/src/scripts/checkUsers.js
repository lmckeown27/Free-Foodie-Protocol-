const { pool } = require('../config/database');
const logger = require('../utils/logger');

const checkUsers = async () => {
  const client = await pool.connect();
  
  try {
    logger.info('Checking existing users...');
    
    const result = await client.query('SELECT id, email, role FROM users');
    
    logger.info(`Found ${result.rows.length} users:`);
    result.rows.forEach(user => {
      logger.info(`- ${user.email}: ${user.role} (${user.id})`);
    });
    
  } catch (error) {
    logger.error('Check failed', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

// Run if called directly
if (require.main === module) {
  checkUsers()
    .then(() => process.exit(0))
    .catch(err => {
      logger.error(err);
      process.exit(1);
    });
}

module.exports = checkUsers;

