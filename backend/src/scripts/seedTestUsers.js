const { pool } = require('../config/database');
const logger = require('../utils/logger');

const seedTestUsers = async () => {
  const client = await pool.connect();
  
  try {
    logger.info('Starting test user seeding...');
    
    // Test users for each role
    const testUsers = [
      {
        email: 'student@test.com',
        calpoly_id: 'TEST001',
        first_name: 'Test',
        last_name: 'Student',
        role: 'student',
        verified: true
      },
      {
        email: 'pantry@test.com',
        first_name: 'Test',
        last_name: 'Pantry',
        role: 'pantry',
        verified: true
      },
      {
        email: 'supplier@test.com',
        first_name: 'Test',
        last_name: 'Supplier',
        role: 'supplier',
        phone: '555-0123',
        verified: true
      }
    ];
    
    for (const user of testUsers) {
      // Check if user already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [user.email]
      );
      
      if (existingUser.rows.length > 0) {
        logger.info(`User ${user.email} already exists, skipping...`);
        continue;
      }
      
      // Insert new user
      const insertQuery = `
        INSERT INTO users (
          email, 
          calpoly_id, 
          first_name, 
          last_name, 
          role, 
          phone, 
          verified
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, email, role
      `;
      
      const result = await client.query(insertQuery, [
        user.email,
        user.calpoly_id || null,
        user.first_name,
        user.last_name,
        user.role,
        user.phone || null,
        user.verified
      ]);
      
      logger.info(`Created test user: ${result.rows[0].email} (${result.rows[0].role})`);
    }
    
    logger.info('Test user seeding completed successfully!');
    logger.info('\nTest login credentials:');
    logger.info('- Student: student@test.com');
    logger.info('- Pantry: pantry@test.com');
    logger.info('- Supplier: supplier@test.com');
    
  } catch (error) {
    logger.error('Test user seeding failed', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedTestUsers()
    .then(() => process.exit(0))
    .catch(err => {
      logger.error(err);
      process.exit(1);
    });
}

module.exports = seedTestUsers;

