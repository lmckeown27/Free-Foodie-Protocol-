-- Migration: Blockchain Integration Tables
-- Purpose: Add tables for Petra Vault, proposals, job queue, reconciliation, and audit trail
-- Date: 2025-11-03

-- Petra Vault configurations
CREATE TABLE IF NOT EXISTS pantry_vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id VARCHAR(255) UNIQUE NOT NULL,
  vault_address VARCHAR(66) NOT NULL,
  network VARCHAR(20) NOT NULL CHECK (network IN ('mainnet', 'testnet', 'devnet')),
  owners TEXT[] NOT NULL,
  signature_threshold INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'retired')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id)
);

COMMENT ON TABLE pantry_vaults IS 'Multi-sig wallets managed by Pantry workers';
COMMENT ON COLUMN pantry_vaults.owners IS 'Array of Aptos addresses for vault signers';
COMMENT ON COLUMN pantry_vaults.signature_threshold IS 'Number of signatures required (M in M-of-N)';

-- Blockchain transaction proposals
CREATE TABLE IF NOT EXISTS blockchain_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id VARCHAR(255) UNIQUE NOT NULL,
  vault_id VARCHAR(255) REFERENCES pantry_vaults(vault_id),
  transaction_type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  metadata JSONB,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'executed', 'expired', 'failed')),
  required_signatures INTEGER NOT NULL,
  current_signatures INTEGER DEFAULT 0,
  transaction_hash VARCHAR(66),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  executed_at TIMESTAMP,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_proposals_status ON blockchain_proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_created_at ON blockchain_proposals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proposals_vault ON blockchain_proposals(vault_id);

COMMENT ON TABLE blockchain_proposals IS 'Petra Vault transaction proposals requiring multi-sig approval';
COMMENT ON COLUMN blockchain_proposals.transaction_type IS 'Type: mint_allocation, burn_allocation, mint_supplier, etc.';

-- Proposal signatures
CREATE TABLE IF NOT EXISTS proposal_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id VARCHAR(255) REFERENCES blockchain_proposals(proposal_id) ON DELETE CASCADE,
  signer_address VARCHAR(66) NOT NULL,
  signer_user_id UUID REFERENCES users(id),
  signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  signature_data TEXT,
  UNIQUE(proposal_id, signer_address)
);

CREATE INDEX IF NOT EXISTS idx_signatures_proposal ON proposal_signatures(proposal_id);
CREATE INDEX IF NOT EXISTS idx_signatures_signer ON proposal_signatures(signer_user_id);

COMMENT ON TABLE proposal_signatures IS 'Tracks which Pantry workers have signed each proposal';

-- Job queue tracking
CREATE TABLE IF NOT EXISTS blockchain_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id VARCHAR(255) UNIQUE NOT NULL,
  job_type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'retrying')),
  proposal_id VARCHAR(255) REFERENCES blockchain_proposals(proposal_id),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  next_retry_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON blockchain_jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_next_retry ON blockchain_jobs(next_retry_at) WHERE status = 'retrying';
CREATE INDEX IF NOT EXISTS idx_jobs_type ON blockchain_jobs(job_type);

COMMENT ON TABLE blockchain_jobs IS 'Async job queue for blockchain operations';

-- Reconciliation logs
CREATE TABLE IF NOT EXISTS reconciliation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  db_record_count INTEGER,
  chain_record_count INTEGER,
  discrepancies_found INTEGER DEFAULT 0,
  discrepancies_fixed INTEGER DEFAULT 0,
  discrepancies_pending INTEGER DEFAULT 0,
  discrepancy_details JSONB,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_reconciliation_started_at ON reconciliation_logs(started_at DESC);

COMMENT ON TABLE reconciliation_logs IS 'Tracks database vs blockchain state synchronization';

-- Audit trail (append-only)
CREATE TABLE IF NOT EXISTS audit_trail (
  id BIGSERIAL PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  event_category VARCHAR(50) NOT NULL CHECK (event_category IN ('user_action', 'pantry_action', 'blockchain_event', 'system_event')),
  actor_id UUID REFERENCES users(id),
  actor_type VARCHAR(20),
  entity_type VARCHAR(50),
  entity_id UUID,
  event_data JSONB NOT NULL,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_trail(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_event_type ON audit_trail(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_trail(actor_id) WHERE actor_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_trail(entity_type, entity_id);

COMMENT ON TABLE audit_trail IS 'Immutable audit log of all platform events';

-- Prevent updates/deletes on audit trail
DROP RULE IF EXISTS audit_trail_immutable_update ON audit_trail;
DROP RULE IF EXISTS audit_trail_immutable_delete ON audit_trail;

CREATE RULE audit_trail_immutable_update AS ON UPDATE TO audit_trail DO INSTEAD NOTHING;
CREATE RULE audit_trail_immutable_delete AS ON DELETE TO audit_trail DO INSTEAD NOTHING;

-- Update existing nft_records table
ALTER TABLE nft_records ADD COLUMN IF NOT EXISTS proposal_id VARCHAR(255) REFERENCES blockchain_proposals(proposal_id);
ALTER TABLE nft_records ADD COLUMN IF NOT EXISTS mint_job_id VARCHAR(255);
ALTER TABLE nft_records ADD COLUMN IF NOT EXISTS burn_job_id VARCHAR(255);
ALTER TABLE nft_records ADD COLUMN IF NOT EXISTS burn_transaction_hash VARCHAR(66);
ALTER TABLE nft_records ADD COLUMN IF NOT EXISTS burned_at TIMESTAMP;

-- Update allocations table
ALTER TABLE allocations ADD COLUMN IF NOT EXISTS nft_id UUID REFERENCES nft_records(id);
ALTER TABLE allocations ADD COLUMN IF NOT EXISTS mint_proposal_id VARCHAR(255);
ALTER TABLE allocations ADD COLUMN IF NOT EXISTS redeem_proposal_id VARCHAR(255);

-- Update inventory table (for supplier NFTs)
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS nft_id UUID REFERENCES nft_records(id);
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS mint_proposal_id VARCHAR(255);

-- Create view for pending proposals (pantry workers need to sign)
CREATE OR REPLACE VIEW pending_proposals_view AS
SELECT 
  p.proposal_id,
  p.vault_id,
  p.transaction_type,
  p.metadata,
  p.required_signatures,
  p.current_signatures,
  p.created_at,
  p.expires_at,
  EXTRACT(EPOCH FROM (p.expires_at - CURRENT_TIMESTAMP)) / 3600 AS hours_until_expiration,
  ARRAY_AGG(ps.signer_address) FILTER (WHERE ps.signer_address IS NOT NULL) AS signers_who_approved
FROM blockchain_proposals p
LEFT JOIN proposal_signatures ps ON p.proposal_id = ps.proposal_id
WHERE p.status = 'pending'
  AND p.expires_at > CURRENT_TIMESTAMP
GROUP BY p.proposal_id, p.vault_id, p.transaction_type, p.metadata, 
         p.required_signatures, p.current_signatures, p.created_at, p.expires_at
ORDER BY p.created_at ASC;

COMMENT ON VIEW pending_proposals_view IS 'Proposals awaiting Pantry worker signatures';

-- Create view for job queue status
CREATE OR REPLACE VIEW job_queue_status_view AS
SELECT 
  job_type,
  status,
  COUNT(*) AS count,
  AVG(EXTRACT(EPOCH FROM (COALESCE(completed_at, CURRENT_TIMESTAMP) - created_at))) AS avg_processing_time_seconds
FROM blockchain_jobs
WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'
GROUP BY job_type, status
ORDER BY job_type, status;

COMMENT ON VIEW job_queue_status_view IS 'Job queue metrics for monitoring';

-- Function to automatically expire old proposals
CREATE OR REPLACE FUNCTION expire_old_proposals()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE blockchain_proposals
  SET status = 'expired'
  WHERE status = 'pending'
    AND expires_at < CURRENT_TIMESTAMP;
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION expire_old_proposals IS 'Automatically marks expired proposals (run via cron)';

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_event_type VARCHAR,
  p_event_category VARCHAR,
  p_actor_id UUID,
  p_actor_type VARCHAR,
  p_entity_type VARCHAR,
  p_entity_id UUID,
  p_event_data JSONB,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
  new_id BIGINT;
BEGIN
  INSERT INTO audit_trail (
    event_type,
    event_category,
    actor_id,
    actor_type,
    entity_type,
    entity_id,
    event_data,
    ip_address,
    user_agent
  ) VALUES (
    p_event_type,
    p_event_category,
    p_actor_id,
    p_actor_type,
    p_entity_type,
    p_entity_id,
    p_event_data,
    p_ip_address,
    p_user_agent
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION log_audit_event IS 'Helper function to insert audit trail events';

-- Grant permissions (adjust as needed for your user)
-- GRANT SELECT, INSERT ON audit_trail TO ffq_backend;
-- GRANT SELECT, INSERT, UPDATE ON blockchain_proposals TO ffq_backend;
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO ffq_backend;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO ffq_backend;

