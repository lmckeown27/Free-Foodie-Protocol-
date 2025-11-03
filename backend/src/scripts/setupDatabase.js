const { pool } = require('../config/database');
const logger = require('../utils/logger');

const setupDatabase = async () => {
  const client = await pool.connect();
  
  try {
    logger.info('Starting database setup...');
    
    // Enable UUID extension
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        calpoly_id VARCHAR(100) UNIQUE,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'pantry', 'supplier')),
        phone VARCHAR(20),
        verified BOOLEAN DEFAULT false,
        governance_nft_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Inventory table
    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        supplier_id UUID REFERENCES users(id) ON DELETE CASCADE,
        item_name VARCHAR(255) NOT NULL,
        item_type VARCHAR(100),
        quantity INTEGER NOT NULL,
        unit VARCHAR(50),
        expiration_date DATE,
        donation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'allocated', 'redeemed', 'expired')),
        location VARCHAR(255),
        temperature_log JSONB,
        handling_notes TEXT,
        supplier_nft_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Votes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS votes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        student_id UUID REFERENCES users(id) ON DELETE CASCADE,
        item_type VARCHAR(100) NOT NULL,
        item_name VARCHAR(255),
        priority INTEGER DEFAULT 1,
        vote_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        governance_nft_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Allocations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS allocations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        student_id UUID REFERENCES users(id) ON DELETE CASCADE,
        inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL,
        allocation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        redemption_date TIMESTAMP,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'redeemed', 'expired', 'cancelled')),
        poas_score DECIMAL(5,2),
        allocation_nft_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // NFT tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS nft_records (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        nft_type VARCHAR(50) NOT NULL CHECK (nft_type IN ('governance', 'allocation', 'supplier')),
        nft_id VARCHAR(255) UNIQUE NOT NULL,
        owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
        metadata JSONB,
        minted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        burned_at TIMESTAMP,
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'burned', 'redeemed')),
        transaction_hash VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Analytics events table
    await client.query(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        event_type VARCHAR(100) NOT NULL,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        event_data JSONB,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Compliance logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS compliance_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
        compliance_type VARCHAR(100) NOT NULL,
        passed BOOLEAN NOT NULL,
        notes TEXT,
        checked_by UUID REFERENCES users(id) ON DELETE SET NULL,
        checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Notifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        data JSONB,
        read BOOLEAN DEFAULT false,
        read_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create indexes for better performance
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_inventory_supplier ON inventory(supplier_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_votes_student ON votes(student_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_allocations_student ON allocations(student_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_allocations_status ON allocations(status);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_nft_records_owner ON nft_records(owner_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_nft_records_type ON nft_records(nft_type);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);');
    
    logger.info('Database setup completed successfully!');
  } catch (error) {
    logger.error('Database setup failed', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

// Run setup if called directly
if (require.main === module) {
  setupDatabase()
    .then(() => process.exit(0))
    .catch(err => {
      logger.error(err);
      process.exit(1);
    });
}

module.exports = setupDatabase;

