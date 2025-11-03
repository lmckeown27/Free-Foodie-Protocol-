const { pool } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Comprehensive Mock Data Seeding Script
 * Creates realistic data for Students, Pantry, and Suppliers to show active platform
 */

const seedMockData = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    logger.info('Starting comprehensive mock data seeding...');
    
    // ============================================
    // 1. CREATE USERS (Students, Pantry, Suppliers)
    // ============================================
    
    // Students (20 students + 1 test user)
    const studentEmails = [
      'student@test.com', // Test login user - MUST BE FIRST
      'alice.student@calpoly.edu',
      'bob.garcia@calpoly.edu',
      'carol.martinez@calpoly.edu',
      'david.rodriguez@calpoly.edu',
      'emma.wilson@calpoly.edu',
      'frank.anderson@calpoly.edu',
      'grace.thomas@calpoly.edu',
      'henry.jackson@calpoly.edu',
      'iris.white@calpoly.edu',
      'jack.harris@calpoly.edu',
      'kate.martin@calpoly.edu',
      'leo.thompson@calpoly.edu',
      'mia.moore@calpoly.edu',
      'noah.taylor@calpoly.edu',
      'olivia.johnson@calpoly.edu',
      'peter.williams@calpoly.edu',
      'quinn.brown@calpoly.edu',
      'ruby.davis@calpoly.edu',
      'sam.miller@calpoly.edu',
      'tara.wilson@calpoly.edu'
    ];
    
    const studentIds = [];
    for (let i = 0; i < studentEmails.length; i++) {
      let firstName, lastName;
      
      if (i === 0) {
        // Special handling for test user
        firstName = 'Test';
        lastName = 'Student';
      } else {
        firstName = studentEmails[i].split('.')[0].charAt(0).toUpperCase() + studentEmails[i].split('.')[0].slice(1);
        lastName = studentEmails[i].split('.')[1].split('@')[0].charAt(0).toUpperCase() + studentEmails[i].split('.')[1].split('@')[0].slice(1);
      }
      
      const result = await client.query(`
        INSERT INTO users (email, calpoly_id, first_name, last_name, role, verified, governance_nft_count)
        VALUES ($1, $2, $3, $4, 'student', true, $5)
        RETURNING id
      `, [
        studentEmails[i],
        i === 0 ? 'TEST001' : `CP${100000 + i}`,
        firstName,
        lastName,
        Math.floor(Math.random() * 10)
      ]);
      studentIds.push(result.rows[0].id);
    }
    
    // Pantry workers (3 pantry staff + 1 test user)
    const pantryEmails = ['pantry@test.com', 'pantry1@calpoly.edu', 'pantry2@calpoly.edu', 'pantry3@calpoly.edu'];
    const pantryIds = [];
    for (let i = 0; i < pantryEmails.length; i++) {
      const result = await client.query(`
        INSERT INTO users (email, first_name, last_name, role, verified)
        VALUES ($1, $2, $3, 'pantry', true)
        RETURNING id
      `, [
        pantryEmails[i],
        i === 0 ? 'Test' : `Pantry${i}`,
        i === 0 ? 'Pantry' : 'Staff'
      ]);
      pantryIds.push(result.rows[0].id);
    }
    
    // Suppliers (8 suppliers + 1 test user)
    const suppliers = [
      { email: 'supplier@test.com', name: 'Test', business: 'Test Supplier Market' }, // Test login user - MUST BE FIRST
      { email: 'trader.joes@ffq.app', name: 'Trader Joes', business: 'Trader Joes SLO' },
      { email: 'albertsons@ffq.app', name: 'Albertsons', business: 'Albertsons Market' },
      { email: 'costco@ffq.app', name: 'Costco', business: 'Costco Wholesale' },
      { email: 'whole.foods@ffq.app', name: 'Whole Foods', business: 'Whole Foods Market' },
      { email: 'campus.dining@ffq.app', name: 'Campus Dining', business: 'Cal Poly Dining' },
      { email: 'farmers.market@ffq.app', name: 'Farmers Market', business: 'SLO Farmers Market' },
      { email: 'smart.final@ffq.app', name: 'Smart & Final', business: 'Smart & Final Extra' },
      { email: 'sprouts@ffq.app', name: 'Sprouts', business: 'Sprouts Farmers Market' }
    ];
    
    const supplierIds = [];
    for (const supplier of suppliers) {
      const result = await client.query(`
        INSERT INTO users (email, first_name, last_name, role, verified)
        VALUES ($1, $2, $3, 'supplier', true)
        RETURNING id
      `, [
        supplier.email,
        supplier.name.split(' ')[0],
        supplier.name.split(' ').slice(1).join(' ') || 'Market'
      ]);
      supplierIds.push(result.rows[0].id);
    }
    
    logger.info(`Created ${studentIds.length} students, ${pantryIds.length} pantry staff, ${supplierIds.length} suppliers`);
    
    // ============================================
    // 2. CREATE PANTRY WALLET
    // ============================================
    
    const walletResult = await client.query(`
      INSERT INTO pantry_wallets (
        wallet_address,
        wallet_type,
        vault_name,
        threshold,
        total_signers,
        signer_addresses,
        created_by,
        status
      ) VALUES (
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        'petra_vault',
        'FFQ Main Custodial Vault',
        2,
        3,
        '["0xsigner1", "0xsigner2", "0xsigner3"]',
        $1,
        'active'
      )
      RETURNING id
    `, [pantryIds[0]]);
    
    const walletId = walletResult.rows[0].id;
    logger.info('Created pantry wallet');
    
    // ============================================
    // 3. CREATE INVENTORY (40+ items from different suppliers)
    // ============================================
    
    const inventoryItems = [
      // Trader Joes
      { supplier: 0, name: 'Organic Apples', type: 'Produce', qty: 50, unit: 'lbs', status: 'available' },
      { supplier: 0, name: 'Bananas', type: 'Produce', qty: 30, unit: 'lbs', status: 'available' },
      { supplier: 0, name: 'Mandarin Oranges', type: 'Produce', qty: 25, unit: 'lbs', status: 'available' },
      { supplier: 0, name: 'Bagged Salad Mix', type: 'Produce', qty: 20, unit: 'bags', status: 'pending' },
      { supplier: 0, name: 'Whole Grain Bread', type: 'Bakery', qty: 15, unit: 'loaves', status: 'available' },
      
      // Albertsons
      { supplier: 1, name: 'Chicken Breast', type: 'Protein', qty: 40, unit: 'lbs', status: 'available' },
      { supplier: 1, name: 'Ground Beef', type: 'Protein', qty: 35, unit: 'lbs', status: 'available' },
      { supplier: 1, name: 'Canned Tomatoes', type: 'Canned Goods', qty: 50, unit: 'cans', status: 'available' },
      { supplier: 1, name: 'Pasta', type: 'Grains', qty: 60, unit: 'boxes', status: 'available' },
      { supplier: 1, name: 'Rice', type: 'Grains', qty: 80, unit: 'lbs', status: 'available' },
      
      // Costco
      { supplier: 2, name: 'Rotisserie Chicken', type: 'Prepared Food', qty: 12, unit: 'whole', status: 'available' },
      { supplier: 2, name: 'Mixed Vegetables', type: 'Produce', qty: 45, unit: 'lbs', status: 'available' },
      { supplier: 2, name: 'Milk', type: 'Dairy', qty: 30, unit: 'gallons', status: 'available' },
      { supplier: 2, name: 'Eggs', type: 'Dairy', qty: 40, unit: 'dozens', status: 'available' },
      { supplier: 2, name: 'Butter', type: 'Dairy', qty: 25, unit: 'lbs', status: 'available' },
      
      // Whole Foods
      { supplier: 3, name: 'Organic Spinach', type: 'Produce', qty: 20, unit: 'lbs', status: 'available' },
      { supplier: 3, name: 'Quinoa', type: 'Grains', qty: 15, unit: 'lbs', status: 'available' },
      { supplier: 3, name: 'Almond Butter', type: 'Pantry', qty: 10, unit: 'jars', status: 'pending' },
      { supplier: 3, name: 'Greek Yogurt', type: 'Dairy', qty: 30, unit: 'containers', status: 'available' },
      { supplier: 3, name: 'Fresh Salmon', type: 'Protein', qty: 18, unit: 'lbs', status: 'available' },
      
      // Campus Dining
      { supplier: 4, name: 'Pizza Slices', type: 'Prepared Food', qty: 50, unit: 'slices', status: 'available' },
      { supplier: 4, name: 'Sandwiches', type: 'Prepared Food', qty: 25, unit: 'sandwiches', status: 'available' },
      { supplier: 4, name: 'Fruit Cups', type: 'Produce', qty: 40, unit: 'cups', status: 'available' },
      { supplier: 4, name: 'Bagels', type: 'Bakery', qty: 30, unit: 'bagels', status: 'pending' },
      { supplier: 4, name: 'Cookies', type: 'Bakery', qty: 60, unit: 'cookies', status: 'available' },
      
      // Farmers Market
      { supplier: 5, name: 'Fresh Tomatoes', type: 'Produce', qty: 35, unit: 'lbs', status: 'available' },
      { supplier: 5, name: 'Bell Peppers', type: 'Produce', qty: 20, unit: 'lbs', status: 'available' },
      { supplier: 5, name: 'Lettuce', type: 'Produce', qty: 25, unit: 'heads', status: 'available' },
      { supplier: 5, name: 'Fresh Herbs', type: 'Produce', qty: 10, unit: 'bunches', status: 'pending' },
      { supplier: 5, name: 'Honey', type: 'Pantry', qty: 15, unit: 'jars', status: 'available' },
      
      // Smart & Final
      { supplier: 6, name: 'Canned Beans', type: 'Canned Goods', qty: 70, unit: 'cans', status: 'available' },
      { supplier: 6, name: 'Peanut Butter', type: 'Pantry', qty: 30, unit: 'jars', status: 'available' },
      { supplier: 6, name: 'Cereal', type: 'Grains', qty: 40, unit: 'boxes', status: 'available' },
      { supplier: 6, name: 'Canned Soup', type: 'Canned Goods', qty: 55, unit: 'cans', status: 'available' },
      { supplier: 6, name: 'Crackers', type: 'Snacks', qty: 35, unit: 'boxes', status: 'pending' },
      
      // Sprouts
      { supplier: 7, name: 'Fresh Broccoli', type: 'Produce', qty: 28, unit: 'lbs', status: 'available' },
      { supplier: 7, name: 'Carrots', type: 'Produce', qty: 32, unit: 'lbs', status: 'available' },
      { supplier: 7, name: 'Orange Juice', type: 'Beverages', qty: 20, unit: 'bottles', status: 'available' },
      { supplier: 7, name: 'Granola', type: 'Snacks', qty: 25, unit: 'bags', status: 'available' },
      { supplier: 7, name: 'Trail Mix', type: 'Snacks', qty: 30, unit: 'bags', status: 'available' }
    ];
    
    // Unique donation receipt names
    const donationReceiptNames = [
      'Bread Donation Receipt',
      'Milk Donation Receipt',
      'Apple Donation Receipt',
      'Pasta Donation Receipt',
      'Rice Donation Receipt',
      'Banana Donation Receipt',
      'Peanut Butter Receipt',
      'Canned Soup Receipt',
      'Cereal Donation Receipt',
      'Cheese Donation Receipt',
      'Apple Juice Receipt',
      'Crackers Donation Receipt',
      'Broccoli Donation Receipt',
      'Carrots Donation Receipt',
      'Orange Juice Receipt',
      'Granola Donation Receipt',
      'Trail Mix Receipt',
      'Tomato Donation Receipt',
      'Chicken Donation Receipt',
      'Spinach Donation Receipt',
      'Ground Beef Receipt',
      'Yogurt Donation Receipt',
      'Eggs Donation Receipt',
      'Butter Donation Receipt',
      'Lettuce Donation Receipt',
      'Canned Beans Receipt',
      'Oatmeal Donation Receipt',
      'Turkey Donation Receipt',
      'Strawberries Receipt',
      'Potatoes Donation Receipt',
      'Onions Donation Receipt',
      'Salsa Donation Receipt',
      'Tortillas Receipt',
      'Green Beans Receipt',
      'Corn Donation Receipt',
      'Pears Donation Receipt',
      'Canned Tuna Receipt',
      'Spaghetti Sauce Receipt',
      'Bagels Donation Receipt',
      'Cream Cheese Receipt'
    ];

    const inventoryIds = [];
    for (let idx = 0; idx < inventoryItems.length; idx++) {
      const item = inventoryItems[idx];
      const supplierId = supplierIds[item.supplier];
      
      // Create unique NFT ID for this donation
      const nftId = `SUPPLIER_NFT_${supplierId}_DONATION_${idx}`;
      const receiptNumber = String(idx + 1).padStart(3, '0');
      const nftName = donationReceiptNames[idx] || `${item.name} Donation Receipt #${receiptNumber}`;
      
      // First create the NFT record for this donation
      await client.query(`
        INSERT INTO nft_records (
          nft_type,
          nft_id,
          owner_id,
          metadata,
          status,
          transaction_hash
        ) VALUES ('supplier', $1, $2, $3, 'active', $4)
      `, [
        nftId,
        supplierId,
        JSON.stringify({
          nft_name: nftName,
          purpose: 'donation_receipt',
          donation_item: item.name,
          donation_type: item.type,
          donation_quantity: item.qty,
          donation_unit: item.unit,
          receipt_number: receiptNumber
        }),
        `0xtx_supplier_donation_${Date.now()}_${idx}`
      ]);
      
      // Create custodial mapping for this NFT
      await client.query(`
        INSERT INTO custodial_mappings (
          user_id,
          asset_type,
          asset_identifier,
          on_chain_address,
          custodian_wallet_id,
          status
        ) VALUES ($1, 'supplier_nft', $2, $3, $4, 'active')
      `, [
        supplierId,
        nftId,
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        walletId
      ]);
      
      // Now create the inventory item with the NFT ID
      const result = await client.query(`
        INSERT INTO inventory (
          supplier_id,
          item_name,
          item_type,
          quantity,
          unit,
          status,
          location,
          donation_date,
          supplier_nft_id
        ) VALUES ($1, $2, $3, $4, $5, $6, 'Pantry Storage A', NOW() - INTERVAL '${Math.floor(Math.random() * 7)} days', $7)
        RETURNING id
      `, [
        supplierId,
        item.name,
        item.type,
        item.qty,
        item.unit,
        item.status,
        nftId
      ]);
      inventoryIds.push(result.rows[0].id);
    }
    
    logger.info(`Created ${inventoryIds.length} inventory items with ${inventoryIds.length} donation receipt NFTs`);
    
    // ============================================
    // 4. CREATE GOVERNANCE PROPOSALS & VOTES
    // ============================================
    
    const proposals = [
      {
        type: 'supplier_onboarding',
        title: 'Approve New Supplier: Target',
        description: 'Proposal to approve Target as a new food supplier for FFQ',
        entity: 'pantry',
        status: 'active'
      },
      {
        type: 'policy_update',
        title: 'Update Allocation Hours',
        description: 'Extend pantry pickup hours to 8pm on weekdays',
        entity: 'student',
        status: 'passed'
      },
      {
        type: 'distribution_change',
        title: 'Add Weekend Distribution',
        description: 'Open pantry on Saturdays 10am-2pm',
        entity: 'pantry',
        status: 'active'
      }
    ];
    
    const proposalIds = [];
    for (const proposal of proposals) {
      const result = await client.query(`
        INSERT INTO governance_proposals (
          proposal_type,
          title,
          description,
          proposed_by_entity,
          proposed_by_user,
          status,
          voting_starts_at,
          voting_ends_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW() - INTERVAL '3 days', NOW() + INTERVAL '4 days')
        RETURNING id
      `, [
        proposal.type,
        proposal.title,
        proposal.description,
        proposal.entity,
        proposal.entity === 'pantry' ? pantryIds[0] : studentIds[0],
        proposal.status
      ]);
      proposalIds.push(result.rows[0].id);
      
      // Add votes from students
      for (let i = 0; i < Math.min(10, studentIds.length); i++) {
        const vote = ['yes', 'no', 'abstain'][Math.floor(Math.random() * 3)];
        await client.query(`
          INSERT INTO governance_votes (
            proposal_id,
            voter_entity,
            voter_user_id,
            vote,
            vote_weight,
            voted_at
          ) VALUES ($1, 'student', $2, $3, 10.00, NOW() - INTERVAL '${Math.floor(Math.random() * 48)} hours')
        `, [result.rows[0].id, studentIds[i], vote]);
      }
    }
    
    logger.info(`Created ${proposalIds.length} governance proposals with votes`);
    
    // ============================================
    // 5. CREATE VOLUNTEER HOURS & NFTs
    // ============================================
    
    // Give some students volunteer hours
    for (let i = 0; i < 10; i++) {
      const hours = Math.floor(Math.random() * 30) + 5;
      const tier = hours >= 50 ? 'platinum' : hours >= 30 ? 'gold' : hours >= 15 ? 'silver' : 'bronze';
      
      // Log volunteer hours
      await client.query(`
        INSERT INTO volunteer_hours (
          student_id,
          activity_type,
          hours,
          description,
          date,
          status,
          verified_by,
          verified_at
        ) VALUES ($1, $2, $3, $4, CURRENT_DATE - ${Math.floor(Math.random() * 30)}, 'verified', $5, NOW())
      `, [
        studentIds[i],
        'Pantry Assistance',
        hours,
        'Helped organize food donations and assist with distribution',
        pantryIds[0]
      ]);
      
      // Mint volunteer NFT if threshold reached
      if (hours >= 5) {
        await client.query(`
          INSERT INTO volunteer_nfts (
            student_id,
            nft_id,
            tier,
            hours_required,
            hours_at_mint,
            transaction_hash,
            metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          studentIds[i],
          `VOLUNTEER_NFT_${tier}_${studentIds[i]}`,
          tier,
          tier === 'platinum' ? 50 : tier === 'gold' ? 30 : tier === 'silver' ? 15 : 5,
          hours,
          `0xtx_volunteer_${Date.now()}`,
          JSON.stringify({ tier, hours, student_id: studentIds[i] })
        ]);
      }
    }
    
    logger.info('Created volunteer hours and NFTs');
    
    // ============================================
    // 6. CREATE ALLOCATIONS
    // ============================================
    
    // Create allocations for students (mix of approved, redeemed, pending)
    const allocationStatuses = ['pending', 'approved', 'approved', 'redeemed', 'redeemed', 'redeemed'];
    
    for (let i = 0; i < studentIds.length; i++) {
      // Each student gets 2-4 allocations
      const numAllocations = Math.floor(Math.random() * 3) + 2;
      
      for (let j = 0; j < numAllocations; j++) {
        const status = allocationStatuses[Math.floor(Math.random() * allocationStatuses.length)];
        const inventoryIdx = Math.floor(Math.random() * inventoryIds.length);
        const poasScore = (Math.random() * 40 + 50).toFixed(2); // 50-90
        const quantity = Math.floor(Math.random() * 5) + 1;
        
        const daysAgo = Math.floor(Math.random() * 14);
        const redemptionDaysAgo = status === 'redeemed' ? Math.floor(Math.random() * 7) : null;
        
        const allocationResult = await client.query(`
          INSERT INTO allocations (
            student_id,
            inventory_id,
            quantity,
            allocation_date,
            redemption_date,
            status,
            poas_score,
            allocation_nft_id
          ) VALUES ($1, $2, $3, NOW() - INTERVAL '${daysAgo} days', ${redemptionDaysAgo !== null ? `NOW() - INTERVAL '${redemptionDaysAgo} days'` : 'NULL'}, $4, $5, $6)
          RETURNING id
        `, [
          studentIds[i],
          inventoryIds[inventoryIdx],
          quantity,
          status,
          poasScore,
          status !== 'pending' ? `ALLOCATION_NFT_${studentIds[i]}_${j}` : null
        ]);
        
        // Create NFT record if approved or redeemed
        if (status !== 'pending') {
          await client.query(`
            INSERT INTO nft_records (
              nft_type,
              nft_id,
              owner_id,
              metadata,
              status,
              transaction_hash
            ) VALUES ('allocation', $1, $2, $3, $4, $5)
          `, [
            `ALLOCATION_NFT_${studentIds[i]}_${j}`,
            studentIds[i],
            JSON.stringify({ allocation_id: allocationResult.rows[0].id, quantity, poas_score: poasScore }),
            status === 'redeemed' ? 'redeemed' : 'active',
            `0xtx_allocation_${Date.now()}_${j}`
          ]);
          
          // Create custodial mapping
          await client.query(`
            INSERT INTO custodial_mappings (
              user_id,
              asset_type,
              asset_identifier,
              on_chain_address,
              custodian_wallet_id,
              status
            ) VALUES ($1, 'allocation_nft', $2, $3, $4, $5)
          `, [
            studentIds[i],
            `ALLOCATION_NFT_${studentIds[i]}_${j}`,
            '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            walletId,
            status === 'redeemed' ? 'redeemed' : 'active'
          ]);
        }
      }
    }
    
    logger.info('Created allocations for all students');
    
    // ============================================
    // 7. SUPPLIER NFTs ALREADY CREATED
    // ============================================
    // NOTE: Supplier NFTs (donation receipts) are now created 
    // per-donation in section 3, not per-supplier organization
    
    // ============================================
    // 8. CREATE GOVERNANCE NFTs FOR ACTIVE VOTERS
    // ============================================
    
    for (let i = 0; i < 15; i++) {
      const nftId = `GOVERNANCE_NFT_${studentIds[i]}_${Date.now()}`;
      
      await client.query(`
        INSERT INTO nft_records (
          nft_type,
          nft_id,
          owner_id,
          metadata,
          status,
          transaction_hash
        ) VALUES ('governance', $1, $2, $3, 'active', $4)
      `, [
        nftId,
        studentIds[i],
        JSON.stringify({ proposal_count: Math.floor(Math.random() * 5) + 1 }),
        `0xtx_governance_${Date.now()}_${i}`
      ]);
      
      await client.query(`
        INSERT INTO custodial_mappings (
          user_id,
          asset_type,
          asset_identifier,
          on_chain_address,
          custodian_wallet_id,
          status
        ) VALUES ($1, 'governance_nft', $2, $3, $4, 'active')
      `, [
        studentIds[i],
        nftId,
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        walletId
      ]);
    }
    
    logger.info('Created governance NFTs');
    
    // ============================================
    // 9. CREATE ANALYTICS EVENTS
    // ============================================
    
    const eventTypes = ['page_view', 'allocation_request', 'vote_cast', 'food_pickup', 'donation_logged'];
    
    for (let i = 0; i < 200; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      await client.query(`
        INSERT INTO analytics_events (
          event_type,
          user_id,
          event_data,
          timestamp
        ) VALUES ($1, $2, $3, NOW() - INTERVAL '${daysAgo} days')
      `, [
        eventTypes[Math.floor(Math.random() * eventTypes.length)],
        [...studentIds, ...supplierIds][Math.floor(Math.random() * (studentIds.length + supplierIds.length))],
        JSON.stringify({ page: 'dashboard', action: 'view' })
      ]);
    }
    
    logger.info('Created analytics events');
    
    // ============================================
    // 10. CREATE NOTIFICATIONS
    // ============================================
    
    for (let i = 0; i < studentIds.length; i++) {
      // Allocation approved notification
      await client.query(`
        INSERT INTO notifications (
          user_id,
          type,
          title,
          message,
          read,
          created_at
        ) VALUES ($1, 'allocation_approved', 'Food Allocation Approved!', 'Your request for Organic Apples has been approved. Pick up at the pantry.', ${Math.random() > 0.5}, NOW() - INTERVAL '2 days')
      `, [studentIds[i]]);
      
      // New governance proposal
      await client.query(`
        INSERT INTO notifications (
          user_id,
          type,
          title,
          message,
          read,
          created_at
        ) VALUES ($1, 'governance_proposal', 'New Governance Proposal', 'New proposal: Add Weekend Distribution. Vote now!', ${Math.random() > 0.3}, NOW() - INTERVAL '1 day')
      `, [studentIds[i]]);
    }
    
    logger.info('Created notifications');
    
    // ============================================
    // 11. CREATE AUDIT LOGS
    // ============================================
    
    for (let i = 0; i < 50; i++) {
      const daysAgo = Math.floor(Math.random() * 14);
      await client.query(`
        INSERT INTO blockchain_audit_logs (
          event_type,
          actor_user_id,
          actor_role,
          target_user_id,
          action_description
        ) VALUES ($1, $2, $3, $4, $5)
      `, [
        ['mint_supplier_nft', 'mint_allocation_nft', 'redeem_allocation_nft', 'mint_governance_nft'][Math.floor(Math.random() * 4)],
        pantryIds[0],
        'pantry',
        [...studentIds, ...supplierIds][Math.floor(Math.random() * (studentIds.length + supplierIds.length))],
        'Blockchain operation executed successfully'
      ]);
    }
    
    logger.info('Created audit logs');
    
    await client.query('COMMIT');
    logger.info('✅ Mock data seeding completed successfully!');
    
    // Print summary
    console.log('\n========================================');
    console.log('MOCK DATA SEEDING SUMMARY');
    console.log('========================================');
    console.log(`Students: ${studentIds.length}`);
    console.log(`Pantry Staff: ${pantryIds.length}`);
    console.log(`Suppliers: ${supplierIds.length}`);
    console.log(`Inventory Items: ${inventoryIds.length}`);
    console.log(`Governance Proposals: ${proposalIds.length}`);
    console.log(`Allocations: ~${studentIds.length * 3}`);
    console.log(`Donation Receipt NFTs: ${inventoryIds.length} (one per donation)`);
    console.log(`Allocation NFTs: ~${Math.floor(studentIds.length * 2.5)}`);
    console.log(`Governance NFTs: 15`);
    console.log(`Volunteer NFTs: ${Math.floor(studentIds.length / 3)}`);
    console.log(`Total NFTs: ~${inventoryIds.length + Math.floor(studentIds.length * 2.5) + 15 + Math.floor(studentIds.length / 3)}`);
    console.log(`Notifications: ${studentIds.length * 2}`);
    console.log('========================================\n');
    
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Mock data seeding failed', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedMockData()
    .then(() => {
      console.log('✅ Seeding complete!');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    });
}

module.exports = seedMockData;

