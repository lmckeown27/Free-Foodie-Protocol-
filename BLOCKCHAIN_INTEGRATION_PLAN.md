# FFQ Blockchain Integration Plan
## Web2.5 Architecture: Web2 UX + Web3 Logic

---

## Overview

FFQ operates as a **Web2.5 application**: Students and Supplier interact with a traditional web application (no wallet required), while the Pantry manages a custodial multi-sig wallet that handles all on-chain operations. This provides blockchain benefits (immutability, auditability, NFT ownership) without crypto complexity for end users.

---

## Architecture Components

### 1. User Experience Layer (Web2)
- **Students**: Request allocations, vote on governance, log volunteer hours
- **Supplier**: Create donation listings, view impact metrics
- **Pantry Workers**: Approve allocations, manage inventory, sign blockchain transactions

### 2. Application Layer (Hybrid)
- **Backend API**: Handles all business logic, immediately updates off-chain DB
- **Job Queue**: Asynchronously processes blockchain operations
- **DTL Service**: Calculates POAS scores off-chain

### 3. Blockchain Layer (Web3)
- **Petra Vault**: Multi-sig wallet controlled by Pantry workers
- **Aptos Blockchain**: Stores NFT records immutably
- **Smart Contracts**: Mint, transfer, and burn NFTs

### 4. Synchronization Layer
- **Reconciliation Service**: Ensures DB ↔ Chain consistency
- **Audit Logs**: Immutable record of all state changes

---

## Implementation Phases

### Phase 1: Database Schema (✓ Mostly Complete)
Current tables:
- `users`, `inventory`, `allocations`, `nft_records`
- `governance_proposals`, `governance_votes`
- `volunteer_hours`, `volunteer_nfts`

**New tables needed:**
- `pantry_vaults` - Multi-sig wallet configurations
- `blockchain_proposals` - Petra Vault transaction proposals
- `proposal_signatures` - Signer approval tracking
- `blockchain_jobs` - Queue job tracking
- `reconciliation_logs` - Sync status tracking
- `audit_trail` - Immutable event log

### Phase 2: Job Queue System (NEW)
**Technology**: Bull + Redis
**Purpose**: Async processing of blockchain operations

**Job Types:**
1. `mint_allocation_nft` - Create allocation pickup tickets
2. `burn_allocation_nft` - Redeem allocation after pickup
3. `mint_supplier_nft` - Create donation receipt
4. `mint_volunteer_nft` - Award volunteer badge
5. `mint_governance_nft` - Grant voting rights
6. `batch_mint` - Process multiple mints in one transaction

**Flow:**
```
API Request → Update DB (optimistic) → Enqueue Job → 
Worker Creates Proposal → Pantry Signers Approve → 
Execute on Aptos → Update DB (confirmed) → Notify User
```

### Phase 3: Petra Vault Integration (NEW)
**Purpose**: Multi-sig wallet management for Pantry

**Key Operations:**
1. Create vault with M-of-N signature threshold
2. Propose transactions (mint/burn NFTs)
3. Poll for signer approvals
4. Execute approved transactions
5. Handle rejections and expirations

**Security:**
- Private keys NEVER stored in FFQ backend
- Signers approve via Petra Wallet browser extension
- All proposals have 24-hour expiration
- Failed transactions trigger alerts

### Phase 4: Reconciliation Service (NEW)
**Purpose**: Detect and resolve DB ↔ Chain drift

**Runs every 15 minutes:**
1. Query Aptos Indexer for all FFQ NFTs
2. Compare on-chain state vs. DB state
3. Auto-fix minor discrepancies (update DB status)
4. Alert on major discrepancies (manual review)
5. Generate reconciliation report

**Metrics Tracked:**
- NFTs minted in DB but not on chain
- NFTs on chain but not in DB
- Status mismatches (DB says redeemed, chain says active)
- Orphaned records

### Phase 5: Audit Trail (NEW)
**Purpose**: Immutable log of all state changes

**Events Logged:**
- User actions (request allocation, vote, donate)
- Pantry actions (approve allocation, create proposal)
- Blockchain events (proposal created, signed, executed)
- System events (reconciliation run, job failed)

**Storage:** 
- Append-only PostgreSQL table
- Optional: Push to external audit system (AWS CloudTrail, Splunk)

---

## User Flow Examples

### Example 1: Student Receives Allocation

**Web2 Experience (Student sees):**
1. Student logs in with Cal Poly ID
2. Sees "15 lbs of produce available" notification
3. Clicks "Request Allocation"
4. Receives confirmation: "Allocation approved! Pickup by Friday"
5. Shows QR code at pantry
6. Pantry scans code, student receives food

**Web3 Reality (Behind the scenes):**
1. API creates allocation record (status: pending)
2. Pantry runs POAS algorithm weekly
3. High-priority students get allocations (status: approved)
4. Job queue creates Petra Vault proposal: mint_allocation_nft
5. 2-of-3 Pantry signers approve proposal in Petra Wallet
6. Transaction executes on Aptos blockchain
7. Allocation NFT minted to Pantry's custodial address
8. DB updated (status: minted, txHash: 0x...)
9. Student receives notification
10. At pickup, Pantry worker scans QR code
11. Job queue creates proposal: burn_allocation_nft
12. Signers approve, NFT burned on-chain
13. DB updated (status: redeemed)

### Example 2: Supplier Donates Food

**Web2 Experience (Supplier sees):**
1. Supplier logs in to portal
2. Fills form: "30 lbs of bananas, pickup today"
3. Receives confirmation: "Donation logged"
4. Views dashboard: "Impact: 120 students helped this month"

**Web3 Reality (Behind the scenes):**
1. API creates inventory record (status: pending)
2. Pantry worker claims donation (status: claimed)
3. Job queue creates proposal: mint_supplier_nft
4. Signers approve, NFT minted on Aptos
5. DB updated with transaction hash
6. Supplier views "Donation Receipt #12345" on dashboard
7. Receipt is actually an NFT on Aptos blockchain
8. Supplier can export for tax deduction (IRS-compliant)

---

## Technical Specifications

### Database Schema Extensions

```sql
-- Petra Vault configurations
CREATE TABLE pantry_vaults (
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

-- Blockchain transaction proposals
CREATE TABLE blockchain_proposals (
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

CREATE INDEX idx_proposals_status ON blockchain_proposals(status);
CREATE INDEX idx_proposals_created_at ON blockchain_proposals(created_at DESC);

-- Proposal signatures
CREATE TABLE proposal_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id VARCHAR(255) REFERENCES blockchain_proposals(proposal_id),
  signer_address VARCHAR(66) NOT NULL,
  signer_user_id UUID REFERENCES users(id),
  signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  signature_data TEXT,
  UNIQUE(proposal_id, signer_address)
);

-- Job queue tracking
CREATE TABLE blockchain_jobs (
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

CREATE INDEX idx_jobs_status ON blockchain_jobs(status);
CREATE INDEX idx_jobs_next_retry ON blockchain_jobs(next_retry_at) WHERE status = 'retrying';

-- Reconciliation logs
CREATE TABLE reconciliation_logs (
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

CREATE INDEX idx_reconciliation_started_at ON reconciliation_logs(started_at DESC);

-- Audit trail (append-only)
CREATE TABLE audit_trail (
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

CREATE INDEX idx_audit_timestamp ON audit_trail(timestamp DESC);
CREATE INDEX idx_audit_event_type ON audit_trail(event_type);
CREATE INDEX idx_audit_actor ON audit_trail(actor_id) WHERE actor_id IS NOT NULL;
CREATE INDEX idx_audit_entity ON audit_trail(entity_type, entity_id);

-- Prevent updates/deletes on audit trail
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
```

### API Endpoints

```
# Vault Management
POST   /api/v1/vaults/create              Create new Petra Vault
GET    /api/v1/vaults                     List all vaults
GET    /api/v1/vaults/:vaultId            Get vault details

# Proposal Management  
GET    /api/v1/proposals                  List proposals (filtered by status)
GET    /api/v1/proposals/:proposalId      Get proposal details
POST   /api/v1/proposals/:proposalId/sign Record signature (called by Petra Wallet)

# Job Monitoring
GET    /api/v1/jobs                       List blockchain jobs
GET    /api/v1/jobs/:jobId                Get job status
POST   /api/v1/jobs/:jobId/retry          Manually retry failed job

# Reconciliation
GET    /api/v1/reconciliation/status      Get latest reconciliation status
POST   /api/v1/reconciliation/run         Trigger manual reconciliation run
GET    /api/v1/reconciliation/history     View reconciliation history

# Audit Trail
GET    /api/v1/audit                      Query audit logs (admin only)
GET    /api/v1/audit/export               Export audit logs

# Enhanced existing endpoints
POST   /api/v1/allocations/:id/approve    Now returns jobId for async tracking
POST   /api/v1/allocations/:id/redeem     Now returns jobId for burn operation
POST   /api/v1/suppliers/donate           Now returns jobId for mint operation
```

---

## Security Considerations

### 1. Key Management
- **❌ NEVER**: Store Pantry multi-sig private keys in FFQ backend
- **✅ DO**: Use Petra Vault SDK to create proposals
- **✅ DO**: Require Pantry workers to approve with their Petra Wallets
- **✅ DO**: Use environment variables for API keys (Petra Vault API key)

### 2. Proposal Safety
- Maximum batch size: 50 NFTs per transaction
- Proposal expiration: 24 hours default
- Automatic rejection of malformed payloads
- Rate limiting: 100 proposals per hour

### 3. Access Control
- Only Pantry role can create proposals
- Only registered signers can approve
- Students/Supplier cannot view proposal details
- Audit trail records all actions

### 4. Data Integrity
- Optimistic DB updates with rollback on failure
- Reconciliation service detects drift
- Alert on critical discrepancies
- Manual review required for large fixes

---

## Monitoring & Alerts

### Critical Alerts (PagerDuty)
- Proposal pending > 12 hours
- Transaction failed after 3 retries
- Reconciliation found > 10 discrepancies
- Vault signer threshold not met for > 24 hours

### Warning Alerts (Slack)
- Job queue backlog > 100 items
- Proposal rejected by signers
- Reconciliation found 1-10 discrepancies
- API rate limit approaching

### Metrics to Track (Datadog)
- Proposals created per day
- Average approval time
- Transaction success rate
- Reconciliation gap size
- Job queue latency
- API response times

---

## Rollout Plan

### Phase 1: Testnet Deployment (Week 1-2)
- Deploy all new services to staging
- Create test Petra Vault with 2-of-2 threshold
- Mint 10 test allocations end-to-end
- Run reconciliation service
- Verify audit logs

### Phase 2: Mainnet Soft Launch (Week 3-4)
- Deploy to production
- Create production Petra Vault (3-of-5 threshold)
- Enable for 10 pilot students
- Monitor closely for 1 week
- Fix any issues discovered

### Phase 3: Full Rollout (Week 5+)
- Enable for all students
- Train Pantry workers on signing flow
- Document processes
- Set up monitoring dashboards

---

## Cost Estimate

### Infrastructure
- Redis instance: $20/month
- Additional DB storage: $10/month
- Aptos transaction fees: ~$0.001 per transaction
  - 1000 allocations/month = $1
- Total: ~$35/month for infrastructure

### Development Time
- Backend services: 40 hours
- Frontend updates: 20 hours
- Testing & QA: 20 hours
- Documentation: 10 hours
- **Total: ~90 hours (2-3 weeks)**

---

## Success Criteria

### Technical
- ✅ 99.9% transaction success rate
- ✅ < 1 minute average proposal approval time
- ✅ < 5 minutes job processing latency
- ✅ Zero reconciliation discrepancies > 1 hour old
- ✅ 100% audit coverage

### User Experience
- ✅ Students never see "blockchain" or "NFT" terminology
- ✅ Allocations appear instant (optimistic updates)
- ✅ QR code redemption works reliably
- ✅ Supplier receive verifiable tax receipts
- ✅ Pantry workers can sign proposals in < 2 minutes

---

## FAQ

**Q: Why not give students their own wallets?**
A: Reduces friction. Students don't need to understand crypto, pay gas fees, or manage private keys. They just use a normal web app.

**Q: What if the Pantry's custodial wallet is compromised?**
A: Multi-sig protection requires multiple Pantry workers to approve. A single compromised key cannot move assets.

**Q: How do we handle blockchain downtime?**
A: Job queue retries failed transactions. UI shows "Processing..." instead of "Confirmed" until on-chain finalization.

**Q: Can students export their NFTs?**
A: Not in MVP. Future: students can request transfer to personal wallet.

**Q: What if reconciliation finds major drift?**
A: Automatic fixes for minor issues. Major discrepancies trigger alerts for manual Pantry review and resolution.

---

## Next Steps

1. **Review this plan** with team and stakeholders
2. **Set up development environment** (Redis, test Petra Vault)
3. **Create database migrations** for new tables
4. **Implement job queue system** (Bull + Redis)
5. **Build Petra Vault service** (proposal creation/polling)
6. **Add reconciliation service** (cron job)
7. **Update API endpoints** to return job IDs
8. **Test end-to-end** on Aptos testnet
9. **Deploy to staging** for internal testing
10. **Launch pilot** with 10 students

---

**Document Version:** 1.0  
**Last Updated:** 2025-11-03  
**Owner:** FFQ Development Team

