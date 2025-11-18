const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

/**
 * Run a specific migration file
 * Usage: node src/scripts/runMigration.js 007_restrict_proposal_creation_to_pantry.sql
 */

const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('❌ Please provide a migration file name');
  console.error('Usage: node src/scripts/runMigration.js <migration-file.sql>');
  process.exit(1);
}

const migrationPath = path.join(__dirname, '../database/migrations', migrationFile);

if (!fs.existsSync(migrationPath)) {
  console.error(`❌ Migration file not found: ${migrationPath}`);
  process.exit(1);
}

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log(`📄 Reading migration: ${migrationFile}`);
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('🔄 Running migration...');
    await client.query(sql);
    
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();

