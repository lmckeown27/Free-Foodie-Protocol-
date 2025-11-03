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
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'available', 'allocated', 'redeemed')),
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
    
    // Volunteer hours table
    await client.query(`
      CREATE TABLE IF NOT EXISTS volunteer_hours (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        activity_type VARCHAR(100) NOT NULL,
        hours DECIMAL(5,2) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
        verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
        verified_at TIMESTAMP,
        volunteer_nft_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Volunteer NFTs table (tracks milestone NFTs earned)
    await client.query(`
      CREATE TABLE IF NOT EXISTS volunteer_nfts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        nft_id VARCHAR(255) UNIQUE NOT NULL,
        tier VARCHAR(50) NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
        hours_required INTEGER NOT NULL,
        hours_at_mint INTEGER NOT NULL,
        metadata JSONB,
        minted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        transaction_hash VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Governance proposals table
    await client.query(`
      CREATE TABLE IF NOT EXISTS governance_proposals (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        proposal_type VARCHAR(100) NOT NULL CHECK (proposal_type IN (
          'supplier_onboarding',
          'supplier_removal', 
          'parameter_change',
          'policy_update',
          'distribution_change',
          'emergency_action',
          'community_initiative'
        )),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        proposed_by_entity VARCHAR(50) NOT NULL CHECK (proposed_by_entity IN ('pantry', 'supplier', 'student')),
        proposed_by_user UUID REFERENCES users(id) ON DELETE SET NULL,
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'passed', 'failed', 'executed', 'cancelled')),
        voting_starts_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        voting_ends_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days'),
        execution_data JSONB,
        on_chain_hash VARCHAR(255),
        quorum_required DECIMAL(5,2) DEFAULT 60.00,
        executed_at TIMESTAMP,
        executed_by UUID REFERENCES users(id) ON DELETE SET NULL,
        execution_tx_hash VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Governance votes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS governance_votes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        proposal_id UUID NOT NULL REFERENCES governance_proposals(id) ON DELETE CASCADE,
        voter_entity VARCHAR(50) NOT NULL CHECK (voter_entity IN ('pantry', 'supplier', 'student')),
        voter_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        vote VARCHAR(20) NOT NULL CHECK (vote IN ('yes', 'no', 'abstain')),
        vote_weight DECIMAL(5,2) NOT NULL,
        reasoning TEXT,
        signature VARCHAR(512),
        voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(proposal_id, voter_user_id)
      );
    `);
    
    // Multi-sig approvals table (Pantry Vault)
    await client.query(`
      CREATE TABLE IF NOT EXISTS multi_sig_approvals (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        proposal_id UUID REFERENCES governance_proposals(id) ON DELETE CASCADE,
        action_type VARCHAR(100) NOT NULL,
        signer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        signer_name VARCHAR(255) NOT NULL,
        signature VARCHAR(512),
        approved BOOLEAN NOT NULL,
        notes TEXT,
        signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Governance actions audit log
    await client.query(`
      CREATE TABLE IF NOT EXISTS governance_actions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        proposal_id UUID REFERENCES governance_proposals(id) ON DELETE SET NULL,
        action_type VARCHAR(100) NOT NULL,
        action_data JSONB NOT NULL,
        executed_by_entity VARCHAR(50) NOT NULL,
        executed_by_user UUID REFERENCES users(id) ON DELETE SET NULL,
        transaction_hash VARCHAR(255),
        on_chain_confirmed BOOLEAN DEFAULT false,
        result TEXT,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Pantry Wallets (Petra Vault multi-sig)
    await client.query(`
      CREATE TABLE IF NOT EXISTS pantry_wallets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        wallet_address VARCHAR(66) UNIQUE NOT NULL,
        wallet_type VARCHAR(50) DEFAULT 'petra_vault' CHECK (wallet_type IN ('petra_vault', 'single_sig')),
        vault_name VARCHAR(255),
        threshold INTEGER NOT NULL DEFAULT 2,
        total_signers INTEGER NOT NULL DEFAULT 3,
        signer_addresses JSONB NOT NULL,
        metadata JSONB,
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deprecated')),
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Wallet Transactions (all blockchain transactions)
    await client.query(`
      CREATE TABLE IF NOT EXISTS wallet_transactions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        transaction_hash VARCHAR(66) UNIQUE NOT NULL,
        wallet_id UUID REFERENCES pantry_wallets(id) ON DELETE CASCADE,
        transaction_type VARCHAR(100) NOT NULL CHECK (transaction_type IN (
          'mint_supplier_nft',
          'mint_allocation_nft',
          'mint_governance_nft',
          'mint_volunteer_nft',
          'transfer_nft',
          'burn_nft',
          'redeem_allocation',
          'register_supplier',
          'create_listing',
          'other'
        )),
        from_address VARCHAR(66),
        to_address VARCHAR(66),
        related_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        related_entity_type VARCHAR(50),
        related_entity_id UUID,
        payload JSONB NOT NULL,
        gas_used BIGINT,
        gas_price BIGINT,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed', 'cancelled')),
        block_number BIGINT,
        block_timestamp TIMESTAMP,
        error_message TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        confirmed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Transaction Proposals (for multi-sig operations)
    await client.query(`
      CREATE TABLE IF NOT EXISTS transaction_proposals (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        wallet_id UUID NOT NULL REFERENCES pantry_wallets(id) ON DELETE CASCADE,
        proposal_type VARCHAR(100) NOT NULL,
        transaction_payload JSONB NOT NULL,
        proposed_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        required_signatures INTEGER NOT NULL,
        current_signatures INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'executed', 'rejected', 'expired')),
        expiration_date TIMESTAMP,
        executed_transaction_id UUID REFERENCES wallet_transactions(id) ON DELETE SET NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Proposal Signatures (tracking who signed what)
    await client.query(`
      CREATE TABLE IF NOT EXISTS proposal_signatures (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        proposal_id UUID NOT NULL REFERENCES transaction_proposals(id) ON DELETE CASCADE,
        signer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        signer_address VARCHAR(66) NOT NULL,
        signature VARCHAR(512) NOT NULL,
        signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(proposal_id, signer_address)
      );
    `);
    
    // Custodial Mappings (off-chain user to on-chain assets)
    await client.query(`
      CREATE TABLE IF NOT EXISTS custodial_mappings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        asset_type VARCHAR(50) NOT NULL CHECK (asset_type IN (
          'supplier_nft',
          'allocation_nft',
          'governance_nft',
          'volunteer_nft',
          'token_balance'
        )),
        asset_identifier VARCHAR(255) NOT NULL,
        on_chain_address VARCHAR(66),
        custodian_wallet_id UUID REFERENCES pantry_wallets(id) ON DELETE CASCADE,
        metadata JSONB,
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'burned', 'transferred')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, asset_type, asset_identifier)
      );
    `);
    
    // Blockchain Audit Logs (comprehensive audit trail)
    await client.query(`
      CREATE TABLE IF NOT EXISTS blockchain_audit_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        event_type VARCHAR(100) NOT NULL,
        actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        actor_role VARCHAR(50),
        target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        transaction_id UUID REFERENCES wallet_transactions(id) ON DELETE SET NULL,
        action_description TEXT NOT NULL,
        before_state JSONB,
        after_state JSONB,
        ip_address INET,
        user_agent TEXT,
        event_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Reconciliation Records (sync on-chain vs off-chain state)
    await client.query(`
      CREATE TABLE IF NOT EXISTS reconciliation_records (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        reconciliation_type VARCHAR(50) NOT NULL CHECK (reconciliation_type IN (
          'nft_ownership',
          'token_balance',
          'allocation_status',
          'transaction_status'
        )),
        entity_type VARCHAR(50) NOT NULL,
        entity_id UUID NOT NULL,
        off_chain_state JSONB NOT NULL,
        on_chain_state JSONB NOT NULL,
        discrepancy_found BOOLEAN DEFAULT false,
        discrepancy_details TEXT,
        resolution_status VARCHAR(50) DEFAULT 'pending' CHECK (resolution_status IN ('pending', 'resolved', 'ignored')),
        resolved_at TIMESTAMP,
        resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
        checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
    await client.query('CREATE INDEX IF NOT EXISTS idx_volunteer_hours_student ON volunteer_hours(student_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_volunteer_hours_status ON volunteer_hours(status);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_volunteer_nfts_student ON volunteer_nfts(student_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_volunteer_nfts_tier ON volunteer_nfts(tier);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_governance_proposals_status ON governance_proposals(status);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_governance_proposals_type ON governance_proposals(proposal_type);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_governance_proposals_entity ON governance_proposals(proposed_by_entity);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_governance_votes_proposal ON governance_votes(proposal_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_governance_votes_entity ON governance_votes(voter_entity);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_multi_sig_approvals_proposal ON multi_sig_approvals(proposal_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_governance_actions_proposal ON governance_actions(proposal_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_governance_actions_type ON governance_actions(action_type);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_pantry_wallets_address ON pantry_wallets(wallet_address);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_pantry_wallets_status ON pantry_wallets(status);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_wallet_transactions_hash ON wallet_transactions(transaction_hash);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet ON wallet_transactions(wallet_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(transaction_type);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_wallet_transactions_status ON wallet_transactions(status);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user ON wallet_transactions(related_user_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_transaction_proposals_wallet ON transaction_proposals(wallet_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_transaction_proposals_status ON transaction_proposals(status);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_proposal_signatures_proposal ON proposal_signatures(proposal_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_proposal_signatures_signer ON proposal_signatures(signer_user_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_custodial_mappings_user ON custodial_mappings(user_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_custodial_mappings_asset_type ON custodial_mappings(asset_type);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_custodial_mappings_status ON custodial_mappings(status);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_blockchain_audit_logs_actor ON blockchain_audit_logs(actor_user_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_blockchain_audit_logs_target ON blockchain_audit_logs(target_user_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_blockchain_audit_logs_event_type ON blockchain_audit_logs(event_type);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_reconciliation_records_entity ON reconciliation_records(entity_type, entity_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_reconciliation_records_discrepancy ON reconciliation_records(discrepancy_found);');
    
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

