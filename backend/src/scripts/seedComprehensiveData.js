const { pool } = require('../config/database');
const logger = require('../utils/logger');

const seedComprehensiveData = async () => {
  const client = await pool.connect();
  
  try {
    logger.info('Starting comprehensive data seeding...');
    
    // Check if data already exists
    const inventoryCheck = await client.query('SELECT COUNT(*) as count FROM inventory');
    if (parseInt(inventoryCheck.rows[0].count) > 0) {
      logger.info('Data already exists. Skipping seed (run once only).');
      return;
    }
    
    // Get test users
    const usersResult = await client.query('SELECT id, email, role FROM users');
    const users = usersResult.rows;
    
    const students = users.filter(u => u.role === 'student');
    const suppliers = users.filter(u => u.role === 'supplier');
    const pantryWorkers = users.filter(u => u.role === 'pantry_worker');
    
    if (students.length === 0 || suppliers.length === 0) {
      logger.error('No test users found. Run seedTestUsers.js first.');
      return;
    }
    
    // 1. Seed Inventory from suppliers
    logger.info('Seeding inventory...');
    const inventoryItems = [
      { name: 'Apples', type: 'produce', quantity: 50, unit: 'lbs', days_until_expiry: 7 },
      { name: 'Bananas', type: 'produce', quantity: 30, unit: 'lbs', days_until_expiry: 5 },
      { name: 'Bread', type: 'bakery', quantity: 20, unit: 'loaves', days_until_expiry: 3 },
      { name: 'Milk', type: 'dairy', quantity: 24, unit: 'gallons', days_until_expiry: 10 },
      { name: 'Chicken Breast', type: 'protein', quantity: 40, unit: 'lbs', days_until_expiry: 5 },
      { name: 'Pasta', type: 'grains', quantity: 60, unit: 'boxes', days_until_expiry: 365 },
      { name: 'Rice', type: 'grains', quantity: 100, unit: 'lbs', days_until_expiry: 365 },
      { name: 'Canned Beans', type: 'canned', quantity: 80, unit: 'cans', days_until_expiry: 730 },
      { name: 'Tomato Sauce', type: 'canned', quantity: 50, unit: 'jars', days_until_expiry: 365 },
      { name: 'Cereal', type: 'breakfast', quantity: 30, unit: 'boxes', days_until_expiry: 180 },
      { name: 'Peanut Butter', type: 'protein', quantity: 25, unit: 'jars', days_until_expiry: 365 },
      { name: 'Carrots', type: 'produce', quantity: 40, unit: 'lbs', days_until_expiry: 14 },
      { name: 'Potatoes', type: 'produce', quantity: 60, unit: 'lbs', days_until_expiry: 30 },
      { name: 'Eggs', type: 'protein', quantity: 36, unit: 'dozens', days_until_expiry: 21 },
      { name: 'Cheese', type: 'dairy', quantity: 20, unit: 'lbs', days_until_expiry: 30 }
    ];
    
    const inventoryIds = [];
    for (const item of inventoryItems) {
      const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + item.days_until_expiry);
      
      const result = await client.query(`
        INSERT INTO inventory (
          supplier_id, item_name, item_type, quantity, unit, 
          expiration_date, status, location, handling_notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `, [
        supplier.id,
        item.name,
        item.type,
        item.quantity,
        item.unit,
        expiryDate,
        'available',
        'Main Pantry Storage',
        'Keep refrigerated' // for perishables
      ]);
      
      inventoryIds.push(result.rows[0].id);
    }
    logger.info(`Created ${inventoryIds.length} inventory items`);
    
    // 2. Seed Votes from students
    logger.info('Seeding votes...');
    const voteTypes = inventoryItems.map(i => ({ name: i.name, type: i.type }));
    let voteCount = 0;
    
    for (const student of students) {
      // Each student votes on 5-10 random items
      const numVotes = Math.floor(Math.random() * 6) + 5;
      const shuffled = [...voteTypes].sort(() => 0.5 - Math.random());
      const selectedItems = shuffled.slice(0, numVotes);
      
      for (const item of selectedItems) {
        const priority = Math.floor(Math.random() * 5) + 1; // 1-5
        const daysAgo = Math.floor(Math.random() * 30); // 0-30 days ago
        const voteDate = new Date();
        voteDate.setDate(voteDate.getDate() - daysAgo);
        
        await client.query(`
          INSERT INTO votes (student_id, item_name, item_type, priority, vote_date)
          VALUES ($1, $2, $3, $4, $5)
        `, [student.id, item.name, item.type, priority, voteDate]);
        voteCount++;
      }
    }
    logger.info(`Created ${voteCount} votes`);
    
    // 3. Seed Allocations
    logger.info('Seeding allocations...');
    let allocationCount = 0;
    
    for (const student of students) {
      // Each student gets 2-4 allocations
      const numAllocations = Math.floor(Math.random() * 3) + 2;
      
      for (let i = 0; i < numAllocations; i++) {
        const inventoryId = inventoryIds[Math.floor(Math.random() * inventoryIds.length)];
        const quantity = Math.floor(Math.random() * 5) + 1;
        const poasScore = (Math.random() * 40 + 60).toFixed(2); // 60-100
        const status = Math.random() > 0.3 ? 'approved' : (Math.random() > 0.5 ? 'redeemed' : 'pending');
        
        await client.query(`
          INSERT INTO allocations (
            student_id, inventory_id, quantity, poas_score, status
          ) VALUES ($1, $2, $3, $4, $5)
        `, [
          student.id,
          inventoryId,
          quantity,
          poasScore,
          status
        ]);
        allocationCount++;
      }
    }
    logger.info(`Created ${allocationCount} allocations`);
    
    // 4. Seed NFT Records
    logger.info('Seeding NFT records...');
    let nftCount = 0;
    
    // Governance NFTs for students
    for (const student of students) {
      const numNFTs = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numNFTs; i++) {
        await client.query(`
          INSERT INTO nft_records (
            owner_id, nft_type, nft_id, metadata, status
          ) VALUES ($1, $2, $3, $4, $5)
        `, [
          student.id,
          'governance',
          `GOV-${student.id.substring(0, 8)}-${i}`,
          JSON.stringify({ voting_power: 1, issued_for: 'Platform participation' }),
          'active'
        ]);
        nftCount++;
      }
      
      // Update governance_nft_count
      await client.query(`
        UPDATE users SET governance_nft_count = $1 WHERE id = $2
      `, [numNFTs, student.id]);
    }
    
    // Supplier NFTs
    for (const supplier of suppliers) {
      await client.query(`
        INSERT INTO nft_records (
          owner_id, nft_type, nft_id, metadata, status
        ) VALUES ($1, $2, $3, $4, $5)
      `, [
        supplier.id,
        'supplier',
        `SUP-${supplier.id.substring(0, 8)}`,
        JSON.stringify({ verified: true, donation_count: inventoryItems.length }),
        'active'
      ]);
      nftCount++;
    }
    
    logger.info(`Created ${nftCount} NFT records`);
    
    // 5. Seed Compliance Logs
    logger.info('Seeding compliance logs...');
    const complianceTypes = ['temperature', 'expiration', 'handling', 'storage'];
    let complianceCount = 0;
    
    for (let i = 0; i < 20; i++) {
      const inventoryId = inventoryIds[Math.floor(Math.random() * inventoryIds.length)];
      const type = complianceTypes[Math.floor(Math.random() * complianceTypes.length)];
      const passed = Math.random() > 0.1; // 90% pass rate
      
      await client.query(`
        INSERT INTO compliance_logs (
          inventory_id, compliance_type, passed, notes, checked_by
        ) VALUES ($1, $2, $3, $4, $5)
      `, [
        inventoryId,
        type,
        passed,
        passed ? 'All checks passed' : 'Requires attention',
        pantryWorkers.length > 0 ? pantryWorkers[0].id : null
      ]);
      complianceCount++;
    }
    logger.info(`Created ${complianceCount} compliance logs`);
    
    // 7. Seed Analytics Events
    logger.info('Seeding analytics events...');
    const eventTypes = [
      'student_login', 'vote_submitted', 'allocation_requested',
      'allocation_redeemed', 'inventory_added', 'nft_minted'
    ];
    let eventCount = 0;
    
    for (let i = 0; i < 50; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      const timestamp = new Date();
      timestamp.setDate(timestamp.getDate() - daysAgo);
      
      await client.query(`
        INSERT INTO analytics_events (event_type, user_id, event_data, timestamp)
        VALUES ($1, $2, $3, $4)
      `, [
        eventType,
        user.id,
        JSON.stringify({ source: 'web', session_id: `sess-${i}` }),
        timestamp
      ]);
      eventCount++;
    }
    logger.info(`Created ${eventCount} analytics events`);
    
    logger.info('Comprehensive data seeding completed successfully!');
    logger.info('\nSummary:');
    logger.info(`- ${inventoryIds.length} inventory items`);
    logger.info(`- ${voteCount} votes`);
    logger.info(`- ${allocationCount} allocations`);
    logger.info(`- ${nftCount} NFT records`);
    logger.info(`- ${complianceCount} compliance logs`);
    logger.info(`- ${eventCount} analytics events`);
    
  } catch (error) {
    logger.error('Comprehensive data seeding failed', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

if (require.main === module) {
  seedComprehensiveData()
    .then(() => process.exit(0))
    .catch(err => {
      logger.error(err);
      process.exit(1);
    });
}

module.exports = seedComprehensiveData;

