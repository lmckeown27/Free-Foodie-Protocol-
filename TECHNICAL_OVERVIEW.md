# Free Foodie Quest (FFQ) - Technical Overview
## Comprehensive Documentation for Developers

---

## Table of Contents
1. [General Overview](#general-overview)
2. [Blockchain Architecture](#blockchain-architecture)
3. [Backend Development](#backend-development)
4. [API Reference](#api-reference)
5. [Database Schema](#database-schema)
6. [Deployment Guide](#deployment-guide)

---

## General Overview

### What is Free Foodie Quest?

Free Foodie Quest (FFQ) is a **Web2.5 decentralized food pantry system** designed for college campuses, combining intuitive web/mobile interfaces with blockchain-based governance, audit trails, and incentive mechanisms. The platform enables students to vote on food preferences, suppliers to donate surplus inventory, and pantry workers to execute fair allocations—all tracked immutably on the Aptos blockchain.

### Core Architecture Principles

**1. Web2-first User Experience**
- Students, pantry workers, and suppliers interact with familiar web interfaces
- No blockchain knowledge required for end users
- All crypto complexity abstracted away from the UI

**2. Web3 for Audit and Incentives**
- Aptos blockchain stores credentials, governance records, and allocation rights
- NFTs represent verifiable credentials (voting rights, pickup tickets, donation receipts)
- Immutable audit trail for compliance and transparency

**3. Custodial Wallet Management**
- Basic Needs Initiative (BNI) holds custodial wallets for all users
- Multi-sig approval system for blockchain operations
- Users never need to manage private keys or pay gas fees

**4. Role-Based Design**
- **Students**: Vote on proposals, claim allocations, earn credentials
- **Pantry Workers (BNI)**: Approve allocations, manage inventory, sign blockchain transactions
- **Suppliers**: Donate food, receive tax-deductible receipts

### Technology Stack Summary

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, Tailwind CSS, Recharts, Petra Wallet SDK |
| **Backend** | Node.js, Express.js, PostgreSQL, Winston logging |
| **Blockchain** | Aptos (Move language), @aptos-labs/ts-sdk |
| **Data Processing** | DTL service (POAS calculator, inventory normalizer) |
| **Authentication** | JWT with role-based access control |
| **Job Queue** | Bull + Redis (planned) |

### Key Features

#### For Students
- **POAS Score**: Priority and Outcome Allocation System calculates fair food distribution
- **Governance Voting**: Influence pantry decisions and earn voting rights NFTs
- **Volunteer Tracking**: Log hours, earn service badges, boost priority
- **QR Code Pickup**: Secure, verified food collection system
- **Personal Analytics**: Track participation, allocations, and impact

#### For Pantry Workers
- **Custodial Wallet Management**: Multi-sig approval for all blockchain operations
- **Allocation Approval**: Review POAS-ranked requests and approve/deny
- **Credential Issuance**: Mint NFTs for voting rights, allocations, and service badges
- **Inventory Management**: Track status (available, reserved, redeemed, expired)
- **Governance Creation**: Submit proposals for student voting
- **Analytics Dashboard**: Platform-wide metrics and engagement tracking

#### For Suppliers
- **Donation Tracking**: Log food donations with type, quantity, and compliance notes
- **Verifiable Receipts**: Receive blockchain-backed donation receipts (NFTs)
- **Tax Compliance**: Export IRS-compliant donation records
- **Impact Metrics**: View students helped and contribution trends

---

## Blockchain Architecture

### Overview: Web2.5 Hybrid Model

FFQ implements a **Web2.5 architecture** where traditional web application patterns are enhanced with blockchain verification and audit trails. Users interact with a standard web API, while blockchain operations happen asynchronously in the background.

---

### Understanding NFTs in FFQ: Digital Proofs vs Physical Assets

**Critical Concept:** It's essential to understand what NFTs actually represent in the Free Foodie Quest system.

#### 1. NFTs Are Digital Proofs, Not Physical Assets

* A Move NFT on Aptos is **purely a digital resource stored on-chain**
* It contains **metadata describing an asset** (e.g., "2 apples at FFQ pantry"), ownership information, and status
* By itself, it **does not contain or store the physical food items**
* The NFT is a **certificate of claim**, not the actual asset

**Example:**
```move
// This NFT metadata describes food, but doesn't contain it
struct AllocationMetadata has store, drop {
    student_address: address,
    item_name: String,        // "Bananas"
    quantity: u64,            // 5
    poas_score: u64,          // 9550
    is_redeemed: bool,        // false
}
```

The NFT itself has **no inherent physical value** — it's purely a digital record on the blockchain.

---

#### 2. Value Comes From the Link to Real-World Systems

For an NFT to **represent real-world value**, there must be a **trusted system enforcing that the NFT corresponds to a tangible asset**. 

**In FFQ, this trust system consists of:**

1. **Physical Inventory Management**
   - Real food exists in the campus pantry warehouse
   - PostgreSQL database tracks actual quantities and locations
   - Pantry staff verify and manage physical stock

2. **Conditional NFT Minting**
   - NFTs are **only minted when inventory is available**
   - POAS algorithm ensures fair allocation of limited resources
   - Pantry workers approve allocations based on real stock levels

3. **Enforced Redemption Workflow**
   ```
   Student shows QR code → Pantry scans code → 
   System verifies NFT ownership → Staff gives physical food → 
   NFT marked as redeemed on-chain → Inventory decremented in DB
   ```

4. **Operational Trust**
   - Basic Needs Initiative (BNI) guarantees fulfillment
   - Custodial wallet system ensures centralized control
   - Pantry staff act as gatekeepers between digital claims and physical assets

> **The NFT acts as a verifiable claim, and the backend + logistics back that claim with real value.**

---

#### 3. Why This Differs From Purely Digital NFTs

**Traditional Digital NFTs (Art, Collectibles):**
- Value is **subjective** — based on community consensus and demand
- No physical redemption required
- Value exists purely in digital ownership and trading

**Claim-Based NFTs (FFQ Allocations):**
- Value is **objective** — redeemable for specific real-world goods
- Physical redemption is the **primary purpose**
- Value exists because of **guaranteed fulfillment** by a trusted entity

**Example Comparison:**

| Aspect | Digital Art NFT | FFQ Allocation NFT |
|--------|----------------|-------------------|
| **What it represents** | Unique digital artwork | Claim to 5 lbs of food |
| **Where value comes from** | Subjective (what people will pay) | Objective (backed by physical inventory) |
| **Primary use case** | Collection/trading | Real-world redemption |
| **Who backs the value** | Community consensus | BNI + pantry operations |
| **What happens if not honored** | Nothing (digital only) | Student doesn't get food (trust broken) |

---

#### 4. Risks and Limitations

**The NFT-to-Physical Link Can Break:**

❌ **Inventory Mismanagement**
```
Problem: Database shows 100 apples, but only 50 exist in pantry
Result: Some NFT holders cannot redeem their claims
Impact: Trust in system destroyed, students go hungry
```

❌ **Backend Failures**
```
Problem: Reconciliation service fails, DB and blockchain drift apart
Result: Students hold "redeemed" NFTs but inventory wasn't decremented
Impact: Food over-allocated, shortages occur
```

❌ **Operational Lapses**
```
Problem: Pantry worker gives food without scanning QR code
Result: Student gets food, but NFT remains "unredeemed" on-chain
Impact: Inventory counts incorrect, duplicate redemptions possible
```

**Critical Understanding:**

> **The NFT doesn't magically create value. It only represents value if the linked system is trusted and enforces redemption.**

If the backend mismanages inventory, or someone redeems more than exists physically, the NFT becomes **worthless** — it's just a digital record pointing to nothing.

---

#### 5. How FFQ Maintains Trust in the NFT-Physical Link

**Technical Safeguards:**

1. **Optimistic Updates with Rollback**
   ```javascript
   // Step 1: Reserve inventory immediately
   await db.query('UPDATE inventory SET status = $1 WHERE id = $2', 
     ['reserved', inventoryId]);
   
   // Step 2: Mint NFT asynchronously
   try {
     await mintAllocationNFT(...);
   } catch (err) {
     // Rollback: unreserve inventory if NFT minting fails
     await db.query('UPDATE inventory SET status = $1 WHERE id = $2', 
       ['available', inventoryId]);
   }
   ```

2. **Reconciliation Service**
   - Runs every 15 minutes
   - Compares blockchain state vs database state
   - Auto-fixes discrepancies or alerts staff
   - Ensures NFT records match physical inventory

3. **Audit Trail**
   - Every action logged immutably
   - Can trace any NFT back to original inventory donation
   - Accountability for staff and automated systems

4. **QR Code Verification**
   - Signed QR codes prevent forgery
   - Real-time ownership verification at pickup
   - Physical handoff only happens after blockchain confirmation

5. **Multi-Sig Approval**
   - Multiple pantry workers must approve NFT minting
   - Prevents single point of failure or fraud
   - Distributed trust model

**Operational Safeguards:**

- Pantry staff trained on redemption protocols
- Physical inventory counts performed weekly
- Automated alerts when inventory drops below thresholds
- Manual review required for large allocations
- BNI oversight and accountability

---

#### 6. Key Takeaways

✅ **NFTs cannot inherently hold physical value** — they are digital records on a blockchain

✅ **Their value comes from trust** — specifically, trust that the issuer (BNI) will honor the claim tied to the NFT

✅ **In FFQ, value is backed by:**
- BNI custodial system (guarantees fulfillment)
- Physical pantry inventory (real food exists)
- Redemption workflow (enforces exchange)
- Reconciliation systems (maintains integrity)

✅ **The blockchain provides:**
- **Immutability**: Can't change allocation history
- **Transparency**: Anyone can verify NFT existence
- **Auditability**: Complete record for compliance
- **Fraud prevention**: Can't claim food twice

✅ **But the blockchain does NOT provide:**
- Physical food (that's the pantry's job)
- Magical value creation (inventory must exist first)
- Automatic trust (BNI must earn and maintain it)

**Analogy:**

Think of FFQ NFTs like **paper gift certificates**:
- The paper itself has no value
- Its value comes from the store's promise to honor it
- If the store goes out of business, the certificate is worthless
- But blockchain makes the certificate **impossible to counterfeit** and provides a **permanent record** of issuance and redemption

**In Summary:**

> FFQ uses blockchain **not to store food**, but to create **verifiable, unforgeable, auditable records** of food allocation claims. The physical value exists in the pantry; the NFT is simply the **most trustworthy way to represent ownership** of that claim digitally.

---

### Aptos Blockchain Integration

**Network:** Mainnet/Testnet/Devnet (configurable)  
**Smart Contract Language:** Move  
**SDK:** @aptos-labs/ts-sdk v1.21.0

#### Why Aptos?

1. **Performance**: Sub-second finality, high throughput
2. **Move Language**: Memory-safe, resource-oriented programming
3. **Low Fees**: Negligible transaction costs (~$0.001 per tx)
4. **Developer Tools**: Rich SDK, indexer, and wallet ecosystem

### Smart Contracts Architecture

FFQ deploys **three Move modules** on Aptos:

#### 1. Governance NFT Module (`governance_nft.move`)

**Purpose:** Tracks student voting participation and governance rights

**Key Functions:**
```move
public entry fun initialize(account: &signer)
public entry fun mint_governance_nft(
    account: &signer,
    student_address: address,
    item_type: String,
    item_name: String,
)
public fun get_total_minted(bni_address: address): u64
```

**Data Structure:**
```move
struct GovernanceNFTStore has key {
    mint_events: EventHandle<MintEvent>,
    total_minted: u64,
    signer_cap: account::SignerCapability,
}
```

**NFT Metadata:**
- Token Name: "Governance Vote #N"
- Description: "Voted for [item_name] ([item_type])"
- Properties: Immutable, stored in custodial wallet
- Use Case: Proof of governance participation, increases POAS score

**Workflow:**
1. Student votes on proposal in web UI
2. Backend creates DB record immediately (optimistic update)
3. Job queue creates blockchain proposal: `mint_governance_nft`
4. Pantry workers approve via Petra Wallet
5. NFT minted to custodial address
6. DB updated with transaction hash

---

#### 2. Allocation NFT Module (`allocation_nft.move`)

**Purpose:** Represents food claim rights (pickup tickets)

**Key Functions:**
```move
public entry fun initialize(account: &signer)
public entry fun mint_allocation_nft(
    account: &signer,
    student_address: address,
    item_name: String,
    quantity: u64,
    poas_score: u64,
)
public entry fun redeem_allocation_nft(
    account: &signer,
    token_id: TokenDataId,
    student_address: address,
)
public fun get_stats(bni_address: address): (u64, u64)
```

**Data Structure:**
```move
struct AllocationNFTStore has key {
    mint_events: EventHandle<MintEvent>,
    redeem_events: EventHandle<RedeemEvent>,
    total_minted: u64,
    total_redeemed: u64,
    signer_cap: account::SignerCapability,
}

struct AllocationMetadata has store, drop {
    student_address: address,
    item_name: String,
    quantity: u64,
    poas_score: u64,
    is_redeemed: bool,
}
```

**NFT Metadata:**
- Token Name: "Allocation #N"
- Description: "Allocation for [quantity]x [item_name] | POAS: [score]"
- Properties: student_address, item_name, quantity, poas_score, is_redeemed
- Use Case: QR code verification at pickup, fraud prevention

**Workflow:**
1. Pantry approves allocation based on POAS ranking
2. Backend creates allocation record
3. Job queue mints allocation NFT
4. Student receives notification with QR code
5. At pickup, pantry scans QR code
6. Backend verifies NFT ownership
7. Job queue burns/redeems NFT
8. Food released to student

---

#### 3. Supplier NFT Module (`supplier_nft.move`)

**Purpose:** Creates verifiable donation receipts for tax compliance

**Key Functions:**
```move
public entry fun initialize(account: &signer)
public entry fun mint_supplier_nft(
    account: &signer,
    supplier_address: address,
    item_name: String,
    quantity: u64,
    donation_type: String,
    compliance_notes: String,
)
public fun get_total_minted(bni_address: address): u64
```

**Data Structure:**
```move
struct SupplierNFTStore has key {
    mint_events: EventHandle<MintEvent>,
    total_minted: u64,
    signer_cap: account::SignerCapability,
}
```

**NFT Metadata:**
- Token Name: "Supplier Donation #N"
- Description: "Donation: [quantity]x [item_name] | Type: [donation_type] | [compliance_notes]"
- Properties: supplier_address, item_name, quantity, donation_type, compliance_notes
- Use Case: IRS tax deduction, SB 1383 compliance, audit trail

**Workflow:**
1. Supplier submits donation form
2. Backend creates inventory record
3. Pantry claims donation
4. Job queue mints supplier NFT
5. NFT appears in supplier's "My Receipts" page
6. Supplier exports for tax filing

---

### Blockchain Operation Flow

#### Synchronous vs Asynchronous Pattern

**Optimistic Updates (Web2 Speed):**
```
User Action → Update Database Immediately → Return Success to User
            → Enqueue Blockchain Job (async)
```

**Blockchain Confirmation (Web3 Verification):**
```
Job Worker → Create Petra Vault Proposal
          → Wait for Pantry Signers (2-of-3 multi-sig)
          → Execute Transaction on Aptos
          → Update Database with txHash
          → Emit Notification
```

#### Multi-Sig Approval System

**Petra Vault Configuration:**
- **Threshold**: 2-of-3 signatures required
- **Signers**: Senior pantry staff with Petra Wallet
- **Proposal Expiry**: 24 hours
- **Automatic Retry**: 3 attempts for failed transactions

**Security Benefits:**
- Single compromised key cannot execute transactions
- Distributed trust model
- Audit trail of all approvals

#### Job Queue Architecture (Planned)

**Technology:** Bull + Redis

**Job Types:**
1. `mint_allocation_nft` - Create pickup tickets
2. `burn_allocation_nft` - Redeem after pickup
3. `mint_supplier_nft` - Create donation receipts
4. `mint_volunteer_nft` - Award service badges
5. `mint_governance_nft` - Grant voting rights
6. `batch_mint` - Process multiple mints efficiently

**Job States:**
- `queued` → `processing` → `completed`
- `failed` → `retrying` (max 3 attempts)

**Monitoring:**
- Job queue length
- Average processing time
- Failure rate
- Proposal approval latency

---

### Reconciliation Service

**Purpose:** Ensure database and blockchain state remain synchronized

**How It Works:**
1. **Scheduled Run** (every 15 minutes)
2. **Query Aptos Indexer** for all FFQ NFTs
3. **Compare States:**
   - NFTs in DB but not on-chain (mint job failed)
   - NFTs on-chain but not in DB (indexing gap)
   - Status mismatches (DB says redeemed, chain says active)
4. **Auto-Fix** minor discrepancies
5. **Alert** on major issues requiring manual review

**Reconciliation Report:**
```json
{
  "run_id": "rec_20250109_1430",
  "db_record_count": 1523,
  "chain_record_count": 1521,
  "discrepancies_found": 2,
  "discrepancies_fixed": 2,
  "discrepancies_pending": 0,
  "details": [
    {
      "type": "missing_on_chain",
      "nft_id": "nft_12345",
      "action": "retried_mint_job"
    }
  ]
}
```

---

### Blockchain Data Flow Examples

#### Example 1: Student Votes on Proposal

**User Perspective:**
1. Student clicks "Vote Yes" on "More Organic Produce?" proposal
2. Receives instant confirmation: "Vote recorded! ✅"
3. Continues browsing platform

**Backend Flow:**
```
POST /api/v1/voting/vote
→ Validate student eligibility
→ Insert vote into `governance_votes` table
→ Return 200 OK { vote_id, status: "pending" }
→ Enqueue job: mint_governance_nft(student_id, proposal_id)
```

**Blockchain Flow:**
```
Job Worker picks up mint_governance_nft job
→ Creates Petra Vault proposal:
  {
    type: "mint_governance_nft",
    payload: {
      student_address: "0xabc...",
      item_type: "Produce",
      item_name: "Organic Apples"
    }
  }
→ Polls for signatures (2-of-3 required)
→ Pantry workers approve in Petra Wallet
→ Executes transaction on Aptos
→ Updates nft_records table:
  {
    nft_id: "gov_nft_456",
    transaction_hash: "0xdef...",
    status: "minted"
  }
→ Student sees "Voting Rights NFT" in credentials page
```

---

#### Example 2: Student Redeems Allocation

**User Perspective:**
1. Student shows QR code at pantry
2. Pantry worker scans with mobile device
3. System verifies allocation
4. Food released to student

**Backend Flow:**
```
POST /api/v1/allocations/:id/redeem
→ Verify QR code signature
→ Check allocation status (must be "approved")
→ Update allocations table: status = "redeemed"
→ Return 200 OK
→ Enqueue job: burn_allocation_nft(allocation_id, token_id)
```

**Blockchain Flow:**
```
Job Worker picks up burn_allocation_nft job
→ Creates Petra Vault proposal to burn NFT
→ Pantry workers approve
→ Executes burn transaction
→ Updates nft_records:
  {
    status: "burned",
    burn_transaction_hash: "0x123...",
    burned_at: "2025-01-09T14:30:00Z"
  }
→ Allocation permanently marked as redeemed on-chain
```

---

## Backend Development

### Architecture Overview

**Pattern:** RESTful API with layered architecture

```
┌─────────────────────────────────────────┐
│           Frontend (React)              │
└──────────────┬──────────────────────────┘
               │ HTTP/REST
┌──────────────▼──────────────────────────┐
│         Express.js Server               │
│  ┌────────────────────────────────┐     │
│  │  Routes (API endpoints)        │     │
│  └──────────┬─────────────────────┘     │
│  ┌──────────▼─────────────────────┐     │
│  │  Middleware (auth, validation) │     │
│  └──────────┬─────────────────────┘     │
│  ┌──────────▼─────────────────────┐     │
│  │  Controllers (business logic)  │     │
│  └──────────┬─────────────────────┘     │
│  ┌──────────▼─────────────────────┐     │
│  │  Services (blockchain, jobs)   │     │
│  └──────────┬─────────────────────┘     │
│  ┌──────────▼─────────────────────┐     │
│  │  Models (database queries)     │     │
│  └────────────────────────────────┘     │
└──────────────┬──────────────────────────┘
               │ SQL
┌──────────────▼──────────────────────────┐
│         PostgreSQL Database             │
└─────────────────────────────────────────┘
```

### Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # PostgreSQL connection pool
│   │   └── aptos.js              # Aptos client configuration
│   │
│   ├── middleware/
│   │   ├── auth.js               # JWT verification + RBAC
│   │   └── errorHandler.js      # Centralized error handling
│   │
│   ├── routes/                   # API route definitions
│   │   ├── auth.js               # /api/v1/auth/*
│   │   ├── users.js              # /api/v1/users/*
│   │   ├── inventory.js          # /api/v1/inventory/*
│   │   ├── allocations.js        # /api/v1/allocations/*
│   │   ├── voting.js             # /api/v1/voting/*
│   │   ├── governance.js         # /api/v1/governance/*
│   │   ├── nft.js                # /api/v1/nft/*
│   │   ├── wallet.js             # /api/v1/wallet/*
│   │   ├── poas.js               # /api/v1/poas/*
│   │   ├── volunteers.js         # /api/v1/volunteers/*
│   │   ├── suppliers.js          # /api/v1/suppliers/*
│   │   ├── analytics.js          # /api/v1/analytics/*
│   │   └── notifications.js      # /api/v1/notifications/*
│   │
│   ├── services/                 # Business logic layer
│   │   ├── aptosService.js       # Aptos blockchain interactions
│   │   ├── nftService.js         # NFT minting/burning logic
│   │   ├── walletService.js      # Custodial wallet management
│   │   ├── petraVaultService.js  # Multi-sig proposal system
│   │   ├── blockchainJobQueue.js # Job queue management
│   │   ├── reconciliationService.js # DB ↔ Chain sync
│   │   └── auditService.js       # Event logging
│   │
│   ├── models/                   # Database models (if using ORM)
│   │
│   ├── database/
│   │   └── migrations/           # SQL migration files
│   │       └── 006_blockchain_integration.sql
│   │
│   ├── scripts/                  # Utility scripts
│   │   ├── setupDatabase.js      # Initialize DB schema
│   │   ├── seedTestUsers.js      # Create test accounts
│   │   └── migrateRolesToPantry.js
│   │
│   ├── utils/
│   │   └── logger.js             # Winston logger configuration
│   │
│   └── server.js                 # Express app entry point
│
├── logs/                         # Application logs
│   ├── combined.log
│   └── error.log
│
├── package.json
├── .env                          # Environment variables
└── README.md
```

---

### Core Backend Services

#### 1. Aptos Service (`aptosService.js`)

**Responsibility:** Low-level blockchain interactions

**Current Status:** Stub implementation (ready for SDK integration)

**Key Methods:**
```javascript
class AptosService {
  async initialize()                  // Connect to Aptos network
  async getAccountBalance(address)    // Check account balance
  async submitTransaction(payload)    // Submit raw transaction
  async waitForTransaction(txHash)    // Wait for confirmation
  async mintNFT(params)               // Mint NFT token
  async burnNFT(tokenId, owner)       // Burn/redeem NFT
  async getNFTMetadata(tokenId)       // Query NFT properties
  async verifyNFTOwnership(tokenId, owner) // Ownership check
}
```

**Usage Example:**
```javascript
const aptosService = require('./services/aptosService');

// Mint allocation NFT
const result = await aptosService.mintNFT({
  collectionName: 'Free Foodie Quest - Allocations',
  tokenName: 'Allocation #123',
  description: 'Allocation for 5x Bananas | POAS: 95',
  uri: 'https://freefoodiequest.io/nft/allocation/123',
  recipientAddress: '0xabc...'
});

console.log(`Minted NFT: ${result.tokenId}`);
console.log(`Transaction: ${result.txHash}`);
```

---

#### 2. NFT Service (`nftService.js`)

**Responsibility:** High-level NFT business logic

**Key Methods:**
```javascript
class NFTService {
  async mintAllocationNFT(studentId, allocationId)
  async redeemAllocationNFT(allocationId, tokenId)
  async mintGovernanceNFT(studentId, voteId)
  async mintSupplierNFT(supplierId, donationId)
  async mintVolunteerBadge(studentId, hours)
  async getUserNFTs(userId, nftType)
  async verifyNFTForPickup(qrCode)
}
```

**Usage Example:**
```javascript
// In allocations route
router.post('/:id/approve', auth, async (req, res) => {
  const allocation = await db.query(
    'UPDATE allocations SET status = $1 WHERE id = $2',
    ['approved', req.params.id]
  );
  
  // Async NFT minting (doesn't block response)
  nftService.mintAllocationNFT(
    allocation.student_id,
    allocation.id
  ).catch(err => logger.error('NFT mint failed', err));
  
  res.json({ success: true, allocation });
});
```

---

#### 3. Petra Vault Service (`petraVaultService.js`)

**Responsibility:** Multi-sig wallet proposal management

**Key Methods:**
```javascript
class PetraVaultService {
  async createVault(owners, threshold)
  async createProposal(vaultId, transactionPayload)
  async getProposalStatus(proposalId)
  async executeProposal(proposalId)
  async listPendingProposals(vaultId)
}
```

**Proposal Lifecycle:**
```javascript
// Step 1: Create proposal
const proposal = await petraVaultService.createProposal(
  'vault_main',
  {
    function: 'ffq::allocation_nft::mint_allocation_nft',
    arguments: [studentAddress, 'Bananas', 5, 9500]
  }
);
// Status: pending

// Step 2: Pantry workers approve in Petra Wallet
// (external to backend)

// Step 3: Poll for signatures
setInterval(async () => {
  const status = await petraVaultService.getProposalStatus(proposal.id);
  if (status.signatures >= status.threshold) {
    await petraVaultService.executeProposal(proposal.id);
  }
}, 5000);
// Status: approved → executed
```

---

#### 4. Blockchain Job Queue (`blockchainJobQueue.js`)

**Responsibility:** Asynchronous blockchain operation processing

**Technology:** Bull + Redis

**Job Schema:**
```javascript
{
  jobId: 'job_abc123',
  jobType: 'mint_allocation_nft',
  payload: {
    studentId: 'user_456',
    allocationId: 'alloc_789',
    itemName: 'Bananas',
    quantity: 5,
    poasScore: 9500
  },
  status: 'queued', // queued | processing | completed | failed
  attempts: 0,
  maxAttempts: 3,
  createdAt: '2025-01-09T14:00:00Z',
  nextRetryAt: null
}
```

**Queue Configuration:**
```javascript
const queueOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 5000 // 5s, 25s, 125s
  },
  removeOnComplete: false, // Keep for audit
  removeOnFail: false
};
```

**Worker Process:**
```javascript
blockchainQueue.process('mint_allocation_nft', async (job) => {
  const { studentId, allocationId, itemName, quantity, poasScore } = job.data;
  
  // Create Petra Vault proposal
  const proposal = await petraVaultService.createProposal(/*...*/);
  
  // Wait for approval (with timeout)
  await waitForApproval(proposal.id, { timeout: 86400000 }); // 24 hours
  
  // Execute transaction
  const txHash = await petraVaultService.executeProposal(proposal.id);
  
  // Update database
  await db.query(
    'UPDATE nft_records SET transaction_hash = $1, status = $2 WHERE allocation_id = $3',
    [txHash, 'minted', allocationId]
  );
  
  return { txHash, proposalId: proposal.id };
});
```

---

#### 5. Reconciliation Service (`reconciliationService.js`)

**Responsibility:** Ensure DB and blockchain consistency

**Schedule:** Runs every 15 minutes via cron

**Algorithm:**
```javascript
async function reconcile() {
  const runId = `rec_${Date.now()}`;
  
  // 1. Get all NFT records from database
  const dbRecords = await db.query(
    'SELECT * FROM nft_records WHERE status = $1',
    ['minted']
  );
  
  // 2. Query Aptos Indexer for all FFQ NFTs
  const chainRecords = await aptosIndexer.query(`
    query {
      current_token_ownerships(
        where: {
          current_collection_data: {
            collection_name: { _like: "Free Foodie Quest%" }
          }
        }
      ) {
        token_data_id_hash
        owner_address
        amount
        property_version
      }
    }
  `);
  
  // 3. Compare and find discrepancies
  const discrepancies = findDiscrepancies(dbRecords, chainRecords);
  
  // 4. Auto-fix where possible
  for (const disc of discrepancies) {
    if (disc.type === 'missing_on_chain') {
      // Retry mint job
      await blockchainJobQueue.add('mint_allocation_nft', disc.record);
    } else if (disc.type === 'missing_in_db') {
      // Index from chain
      await db.query('INSERT INTO nft_records ...');
    }
  }
  
  // 5. Log results
  await db.query(`
    INSERT INTO reconciliation_logs 
    (run_id, db_record_count, chain_record_count, discrepancies_found, discrepancies_fixed)
    VALUES ($1, $2, $3, $4, $5)
  `, [runId, dbRecords.length, chainRecords.length, discrepancies.length, fixedCount]);
}
```

---

#### 6. Audit Service (`auditService.js`)

**Responsibility:** Immutable event logging

**Event Categories:**
- `user_action` - Student/supplier actions
- `pantry_action` - BNI administrative actions
- `blockchain_event` - On-chain transactions
- `system_event` - Automated processes

**Usage:**
```javascript
const auditService = require('./services/auditService');

// Log user action
await auditService.log({
  eventType: 'allocation_requested',
  eventCategory: 'user_action',
  actorId: req.user.id,
  actorType: 'student',
  entityType: 'allocation',
  entityId: allocation.id,
  eventData: {
    itemName: 'Bananas',
    quantity: 5,
    poasScore: 95.5
  },
  ipAddress: req.ip,
  userAgent: req.get('user-agent')
});
```

**Query Audit Trail:**
```javascript
// Get all actions by user
const events = await auditService.getEventsByActor(userId);

// Get all events for entity
const events = await auditService.getEventsByEntity('allocation', allocationId);

// Export for compliance
const csv = await auditService.exportEvents({
  startDate: '2025-01-01',
  endDate: '2025-01-31',
  eventCategory: 'blockchain_event'
});
```

---

### Authentication & Authorization

#### JWT-Based Authentication

**Login Flow:**
```javascript
POST /api/v1/auth/login
{
  "email": "student@calpoly.edu",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "student@calpoly.edu",
    "role": "student",
    "name": "John Doe"
  }
}
```

**Token Payload:**
```json
{
  "userId": "user_123",
  "email": "student@calpoly.edu",
  "role": "student",
  "iat": 1704808800,
  "exp": 1704895200
}
```

#### Role-Based Access Control (RBAC)

**Middleware Implementation:**
```javascript
// middleware/auth.js
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

module.exports = { authenticate, requireRole };
```

**Usage in Routes:**
```javascript
const { authenticate, requireRole } = require('../middleware/auth');

// Student-only endpoint
router.get('/my-allocations', 
  authenticate, 
  requireRole(['student']), 
  getAllocationsController
);

// Pantry-only endpoint
router.post('/allocations/:id/approve', 
  authenticate, 
  requireRole(['pantry', 'bni']), 
  approveAllocationController
);

// Multi-role endpoint
router.get('/inventory', 
  authenticate, 
  requireRole(['student', 'pantry', 'supplier']), 
  getInventoryController
);
```

---

### Error Handling

**Centralized Error Handler:**
```javascript
// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id
  });
  
  // Known error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message, details: err.details });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  if (err.name === 'ForbiddenError') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  // Database errors
  if (err.code === '23505') { // Unique violation
    return res.status(409).json({ error: 'Resource already exists' });
  }
  
  // Generic error
  res.status(500).json({ 
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
};

module.exports = { errorHandler };
```

---

### Logging

**Winston Configuration:**
```javascript
// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }),
    ...(process.env.NODE_ENV !== 'production' 
      ? [new winston.transports.Console({
          format: winston.format.simple()
        })] 
      : []
    )
  ]
});

module.exports = logger;
```

**Usage:**
```javascript
const logger = require('./utils/logger');

logger.info('User logged in', { userId: '123', email: 'user@example.com' });
logger.warn('POAS score unusually low', { userId: '456', score: 12.3 });
logger.error('NFT minting failed', { error: err.message, allocationId: 'alloc_789' });
```

---

## API Reference

### Authentication Endpoints

#### POST `/api/v1/auth/register`
Register a new user account.

**Request:**
```json
{
  "email": "student@calpoly.edu",
  "password": "password123",
  "name": "John Doe",
  "role": "student"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "student@calpoly.edu",
    "name": "John Doe",
    "role": "student",
    "createdAt": "2025-01-09T14:00:00Z"
  }
}
```

---

#### POST `/api/v1/auth/login`
Authenticate user and receive JWT token.

**Request:**
```json
{
  "email": "student@calpoly.edu",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "student@calpoly.edu",
    "role": "student",
    "name": "John Doe"
  }
}
```

---

#### GET `/api/v1/auth/me`
Get current authenticated user profile.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": "user_123",
  "email": "student@calpoly.edu",
  "name": "John Doe",
  "role": "student",
  "walletAddress": "0xabc...",
  "poasScore": 95.5,
  "volunteerHours": 12
}
```

---

### Allocation Endpoints

#### GET `/api/v1/allocations/my`
Get student's allocations.

**Auth:** Student role required

**Response:**
```json
{
  "allocations": [
    {
      "id": "alloc_123",
      "itemName": "Bananas",
      "quantity": 5,
      "status": "approved",
      "poasScore": 95.5,
      "qrCode": "data:image/png;base64,...",
      "expiresAt": "2025-01-12T17:00:00Z",
      "nft": {
        "tokenId": "ffq::allocation::123",
        "transactionHash": "0xabc..."
      }
    }
  ]
}
```

---

#### POST `/api/v1/allocations/:id/approve`
Approve an allocation request.

**Auth:** Pantry role required

**Response:**
```json
{
  "success": true,
  "allocation": {
    "id": "alloc_123",
    "status": "approved",
    "approvedBy": "user_pantry_1",
    "approvedAt": "2025-01-09T14:30:00Z"
  },
  "jobId": "job_mint_abc123"
}
```

---

#### POST `/api/v1/allocations/:id/redeem`
Redeem allocation at pickup (QR code scan).

**Auth:** Pantry role required

**Request:**
```json
{
  "qrCode": "eyJhbGxvY2F0aW9uSWQiOiJhbGxvY18xMjMi..."
}
```

**Response:**
```json
{
  "success": true,
  "allocation": {
    "id": "alloc_123",
    "status": "redeemed",
    "redeemedAt": "2025-01-09T15:00:00Z"
  },
  "jobId": "job_burn_def456"
}
```

---

### Voting & Governance Endpoints

#### GET `/api/v1/governance/proposals`
List all governance proposals.

**Query Parameters:**
- `status` (optional): `active`, `passed`, `rejected`
- `limit` (optional): Default 50
- `offset` (optional): Default 0

**Response:**
```json
{
  "proposals": [
    {
      "id": "prop_123",
      "title": "Should we stock more organic produce?",
      "description": "Proposal to increase organic produce allocation by 25%",
      "status": "active",
      "votesYes": 45,
      "votesNo": 12,
      "votesAbstain": 3,
      "createdBy": "user_pantry_1",
      "createdAt": "2025-01-05T10:00:00Z",
      "endsAt": "2025-01-12T17:00:00Z"
    }
  ],
  "total": 15
}
```

---

#### POST `/api/v1/voting/vote`
Submit a vote on a proposal.

**Auth:** Student role required

**Request:**
```json
{
  "proposalId": "prop_123",
  "vote": "yes"
}
```

**Response:**
```json
{
  "success": true,
  "vote": {
    "id": "vote_456",
    "proposalId": "prop_123",
    "vote": "yes",
    "votedAt": "2025-01-09T14:00:00Z"
  },
  "jobId": "job_governance_nft_789"
}
```

---

### Inventory Endpoints

#### GET `/api/v1/inventory`
Get inventory items.

**Auth:** Any authenticated user

**Query Parameters:**
- `status` (optional): `available`, `reserved`, `redeemed`, `expired`
- `supplierId` (optional): Filter by supplier

**Response:**
```json
{
  "items": [
    {
      "id": "inv_123",
      "itemName": "Bananas",
      "quantity": 50,
      "unit": "lbs",
      "status": "available",
      "donatedBy": "supplier_456",
      "donatedAt": "2025-01-09T08:00:00Z",
      "expiresAt": "2025-01-12T17:00:00Z",
      "location": "Cooler A"
    }
  ],
  "total": 120
}
```

---

#### POST `/api/v1/inventory`
Add new inventory (supplier donation).

**Auth:** Supplier or Pantry role required

**Request:**
```json
{
  "itemName": "Bananas",
  "quantity": 50,
  "unit": "lbs",
  "donationType": "surplus",
  "location": "Campus Dining",
  "handlingNotes": "Keep refrigerated",
  "expiresAt": "2025-01-12T17:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "item": {
    "id": "inv_123",
    "itemName": "Bananas",
    "quantity": 50,
    "status": "available",
    "donatedBy": "supplier_456",
    "donatedAt": "2025-01-09T08:00:00Z"
  },
  "jobId": "job_supplier_nft_abc"
}
```

---

### NFT Endpoints

#### GET `/api/v1/nft/my`
Get user's NFTs (credentials).

**Auth:** Any authenticated user

**Response:**
```json
{
  "nfts": [
    {
      "id": "nft_123",
      "type": "governance",
      "tokenId": "ffq::governance::45",
      "name": "Governance Vote #45",
      "description": "Voted for Organic Apples (Produce)",
      "transactionHash": "0xabc...",
      "mintedAt": "2025-01-09T14:00:00Z",
      "metadata": {
        "proposalTitle": "More Organic Produce?",
        "vote": "yes"
      }
    },
    {
      "id": "nft_456",
      "type": "allocation",
      "tokenId": "ffq::allocation::78",
      "name": "Allocation #78",
      "description": "Allocation for 5x Bananas | POAS: 95",
      "transactionHash": "0xdef...",
      "status": "active",
      "mintedAt": "2025-01-09T14:30:00Z"
    }
  ],
  "counts": {
    "governance": 12,
    "allocation": 3,
    "volunteer": 2,
    "supplier": 0
  }
}
```

---

#### GET `/api/v1/wallet/custodial-nfts`
Get all NFTs in custodial wallet (pantry view).

**Auth:** Pantry role required

**Response:**
```json
{
  "nfts": [
    {
      "tokenId": "ffq::allocation::78",
      "owner": "custodial_wallet_main",
      "studentAddress": "0xabc...",
      "itemName": "Bananas",
      "quantity": 5,
      "poasScore": 95.5,
      "status": "active"
    }
  ],
  "totalCount": 342
}
```

---

### Analytics Endpoints

#### GET `/api/v1/analytics/dashboard`
Get platform-wide analytics.

**Auth:** Pantry role required

**Response:**
```json
{
  "users": {
    "totalStudents": 523,
    "activeStudents": 412,
    "totalSuppliers": 12,
    "activeSuppliers": 8
  },
  "inventory": {
    "totalItems": 1523,
    "availableItems": 342,
    "reservedItems": 89,
    "expiringSoon": 23
  },
  "allocations": {
    "totalAllocations": 4532,
    "pendingApproval": 45,
    "redeemed": 4231,
    "redemptionRate": 0.93
  },
  "governance": {
    "activeProposals": 3,
    "totalVotes": 2341,
    "participationRate": 0.78
  },
  "nfts": {
    "governance": 2341,
    "allocations": 4532,
    "volunteers": 234,
    "suppliers": 523
  }
}
```

---

#### GET `/api/v1/poas/my-score`
Get student's POAS score and ranking.

**Auth:** Student role required

**Response:**
```json
{
  "userId": "user_123",
  "poasScore": 95.5,
  "rank": 23,
  "totalStudents": 523,
  "percentile": 95.6,
  "components": {
    "governance": 35.2,
    "volunteerHours": 42.8,
    "pickupReliability": 12.5,
    "needFactor": 5.0
  },
  "history": [
    { "date": "2025-01-01", "score": 88.3 },
    { "date": "2025-01-08", "score": 95.5 }
  ]
}
```

---

### Volunteer Endpoints

#### GET `/api/v1/volunteers/my-hours`
Get student's volunteer hours.

**Auth:** Student role required

**Response:**
```json
{
  "totalHours": 12.5,
  "verifiedHours": 10.0,
  "pendingHours": 2.5,
  "badgeLevel": "Bronze",
  "nextBadge": {
    "level": "Silver",
    "hoursRequired": 10,
    "hoursRemaining": 0
  },
  "logs": [
    {
      "id": "vol_123",
      "date": "2025-01-05",
      "hours": 3.0,
      "activity": "Pantry stocking",
      "status": "verified",
      "verifiedBy": "user_pantry_1"
    }
  ]
}
```

---

#### POST `/api/v1/volunteers/log-hours`
Log volunteer hours (pending verification).

**Auth:** Student role required

**Request:**
```json
{
  "date": "2025-01-09",
  "hours": 2.5,
  "activity": "Food distribution",
  "notes": "Helped distribute food to 50 students"
}
```

**Response:**
```json
{
  "success": true,
  "log": {
    "id": "vol_456",
    "date": "2025-01-09",
    "hours": 2.5,
    "status": "pending"
  }
}
```

---

## Database Schema

### Core Tables

#### `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'pantry', 'supplier', 'bni')),
  wallet_address VARCHAR(66), -- Custodial wallet address
  poas_score DECIMAL(5, 2) DEFAULT 0.00,
  volunteer_hours DECIMAL(5, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
```

---

#### `inventory`
```sql
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name VARCHAR(255) NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'redeemed', 'expired')),
  donated_by UUID REFERENCES users(id),
  location VARCHAR(255),
  handling_notes TEXT,
  donated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inventory_status ON inventory(status);
CREATE INDEX idx_inventory_donated_by ON inventory(donated_by);
```

---

#### `allocations`
```sql
CREATE TABLE allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id) NOT NULL,
  inventory_id UUID REFERENCES inventory(id),
  item_name VARCHAR(255) NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  poas_score DECIMAL(5, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'redeemed', 'expired', 'cancelled')),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  redeemed_at TIMESTAMP,
  qr_code TEXT, -- Signed QR code data
  nft_id UUID REFERENCES nft_records(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_allocations_student ON allocations(student_id);
CREATE INDEX idx_allocations_status ON allocations(status);
```

---

#### `governance_proposals`
```sql
CREATE TABLE governance_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'passed', 'rejected', 'expired')),
  votes_yes INTEGER DEFAULT 0,
  votes_no INTEGER DEFAULT 0,
  votes_abstain INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ends_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_proposals_status ON governance_proposals(status);
CREATE INDEX idx_proposals_ends_at ON governance_proposals(ends_at);
```

---

#### `governance_votes`
```sql
CREATE TABLE governance_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES governance_proposals(id),
  voter_id UUID REFERENCES users(id),
  vote VARCHAR(20) NOT NULL CHECK (vote IN ('yes', 'no', 'abstain')),
  voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(proposal_id, voter_id)
);

CREATE INDEX idx_votes_proposal ON governance_votes(proposal_id);
CREATE INDEX idx_votes_voter ON governance_votes(voter_id);
```

---

#### `nft_records`
```sql
CREATE TABLE nft_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nft_type VARCHAR(50) NOT NULL CHECK (nft_type IN ('governance', 'allocation', 'volunteer', 'supplier')),
  token_id VARCHAR(255) UNIQUE,
  token_name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES users(id),
  transaction_hash VARCHAR(66),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'minted', 'burned', 'failed')),
  metadata JSONB,
  minted_at TIMESTAMP,
  burned_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_nft_type ON nft_records(nft_type);
CREATE INDEX idx_nft_owner ON nft_records(owner_id);
CREATE INDEX idx_nft_status ON nft_records(status);
```

---

#### `volunteer_hours`
```sql
CREATE TABLE volunteer_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id),
  hours DECIMAL(5, 2) NOT NULL,
  activity VARCHAR(255) NOT NULL,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_volunteer_student ON volunteer_hours(student_id);
CREATE INDEX idx_volunteer_status ON volunteer_hours(status);
```

---

### Blockchain Integration Tables

#### `blockchain_proposals`
```sql
CREATE TABLE blockchain_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id VARCHAR(255) UNIQUE NOT NULL,
  vault_id VARCHAR(255) NOT NULL,
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
```

---

#### `blockchain_jobs`
```sql
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
```

---

#### `audit_trail`
```sql
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

-- Prevent updates/deletes (immutable log)
CREATE RULE audit_trail_immutable_update AS ON UPDATE TO audit_trail DO INSTEAD NOTHING;
CREATE RULE audit_trail_immutable_delete AS ON DELETE TO audit_trail DO INSTEAD NOTHING;
```

---

## Deployment Guide

### Prerequisites

- **Node.js**: v18 or higher
- **PostgreSQL**: v14 or higher
- **Redis**: v6 or higher (for job queue)
- **Aptos CLI**: Latest version
- **Petra Wallet**: Browser extension installed

### Environment Setup

**Backend `.env`:**
```env
# Server
NODE_ENV=production
PORT=5000
API_VERSION=v1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ffq_production
DATABASE_POOL_SIZE=20

# Authentication
JWT_SECRET=your_secure_jwt_secret_here
JWT_EXPIRY=24h

# Aptos Blockchain
APTOS_NETWORK=mainnet
APTOS_PRIVATE_KEY=your_private_key_here
APTOS_MODULE_ADDRESS=0x...

# Petra Vault
PETRA_VAULT_ID=vault_main
PETRA_VAULT_API_KEY=your_api_key_here

# Redis (Job Queue)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password

# Logging
LOG_LEVEL=info
LOG_DIRECTORY=./logs

# CORS
CORS_ORIGIN=https://freefoodiequest.io

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

---

### Installation Steps

#### 1. Clone Repository
```bash
git clone https://github.com/lmckeown27/Free-Foodie-Protocol-.git
cd Free-Foodie-Protocol-
```

#### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

#### 3. Set Up Database
```bash
# Initialize schema
node src/scripts/setupDatabase.js

# Seed test users (optional)
node src/scripts/seedTestUsers.js
```

#### 4. Deploy Smart Contracts
```bash
cd ../smart-contracts
aptos move compile
aptos move publish --assume-yes
```

#### 5. Start Backend Server
```bash
cd ../backend
npm run dev  # Development
npm start    # Production
```

#### 6. Install Frontend Dependencies
```bash
cd ../frontend
npm install
npm start    # Development
npm run build # Production
```

---

### Production Deployment

#### Using PM2 (Process Manager)
```bash
# Install PM2
npm install -g pm2

# Start backend with PM2
cd backend
pm2 start src/server.js --name ffq-backend

# Start job worker
pm2 start src/services/blockchainJobQueue.js --name ffq-worker

# Save PM2 configuration
pm2 save
pm2 startup
```

#### Using Docker
```dockerfile
# Dockerfile for backend
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src ./src

EXPOSE 5000

CMD ["node", "src/server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: ffq_production
      POSTGRES_USER: ffq_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:6-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
  
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    depends_on:
      - postgres
      - redis
    environment:
      DATABASE_URL: postgresql://ffq_user:${DB_PASSWORD}@postgres:5432/ffq_production
      REDIS_URL: redis://redis:6379
  
  worker:
    build: ./backend
    command: node src/services/blockchainJobQueue.js
    depends_on:
      - postgres
      - redis
    environment:
      DATABASE_URL: postgresql://ffq_user:${DB_PASSWORD}@postgres:5432/ffq_production
      REDIS_URL: redis://redis:6379

volumes:
  postgres_data:
```

---

### Monitoring & Maintenance

#### Health Checks
```bash
# Backend health
curl http://localhost:5000/health

# Database connection
psql $DATABASE_URL -c "SELECT 1"

# Redis connection
redis-cli -u $REDIS_URL PING
```

#### Log Monitoring
```bash
# View backend logs
tail -f backend/logs/combined.log

# View error logs only
tail -f backend/logs/error.log

# View PM2 logs
pm2 logs ffq-backend
```

#### Database Backups
```bash
# Create backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore backup
psql $DATABASE_URL < backup_20250109.sql
```

---

## Testing

### Test Users

After running `seedTestUsers.js`:

| Role | Email | Password |
|------|-------|----------|
| Student | student@calpoly.edu | password123 |
| Pantry | pantry@calpoly.edu | password123 |
| Supplier | supplier@calpoly.edu | password123 |

### API Testing with cURL

```bash
# Register user
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@calpoly.edu","password":"pass123","name":"Test User","role":"student"}'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@calpoly.edu","password":"password123"}'

# Get allocations (with token)
curl -X GET http://localhost:5000/api/v1/allocations/my \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Performance Optimization

### Database Indexing
```sql
-- Already implemented in schema
CREATE INDEX idx_allocations_student ON allocations(student_id);
CREATE INDEX idx_nft_owner ON nft_records(owner_id);
CREATE INDEX idx_audit_timestamp ON audit_trail(timestamp DESC);
```

### Connection Pooling
```javascript
// config/database.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

module.exports = pool;
```

### Caching Strategy
```javascript
// Use Redis for caching
const redis = require('redis');
const client = redis.createClient({ url: process.env.REDIS_URL });

// Cache POAS scores (expire after 1 hour)
async function getPoasScore(userId) {
  const cached = await client.get(`poas:${userId}`);
  if (cached) return JSON.parse(cached);
  
  const score = await calculatePoasScore(userId);
  await client.setEx(`poas:${userId}`, 3600, JSON.stringify(score));
  return score;
}
```

---

## Security Considerations

### Input Validation
```javascript
const { body, validationResult } = require('express-validator');

router.post('/allocations/:id/approve',
  authenticate,
  requireRole(['pantry']),
  [
    body('notes').optional().isString().trim().escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Process request
  }
);
```

### SQL Injection Prevention
```javascript
// ALWAYS use parameterized queries
const result = await db.query(
  'SELECT * FROM allocations WHERE student_id = $1',
  [studentId]
);

// NEVER concatenate user input
// BAD: `SELECT * FROM allocations WHERE student_id = '${studentId}'`
```

### Rate Limiting
```javascript
// Already implemented in server.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Too many requests, please try again later.' }
});

app.use('/api/', limiter);
```

---

## Troubleshooting

### Common Issues

**Issue:** "Database connection refused"
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Verify connection string
psql $DATABASE_URL
```

**Issue:** "JWT token expired"
- Tokens expire after 24 hours by default
- User must re-login to get new token

**Issue:** "NFT minting job stuck"
```bash
# Check job queue status
redis-cli -u $REDIS_URL
> LLEN bull:blockchain:waiting

# Manually retry job
curl -X POST http://localhost:5000/api/v1/jobs/{jobId}/retry \
  -H "Authorization: Bearer <pantry_token>"
```

**Issue:** "Reconciliation found discrepancies"
- Review reconciliation logs
- Check Aptos Indexer status
- Manually verify on-chain state

---

## Contributing

### Development Workflow
1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and test thoroughly
4. Commit with descriptive messages: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open Pull Request

### Code Style
- **JavaScript**: ESLint with Airbnb config
- **Formatting**: Prettier with 2-space indentation
- **Commits**: Conventional Commits format

---

## License

MIT License - See LICENSE file for details.

---

## Support

For questions, issues, or contributions:
- **GitHub**: https://github.com/lmckeown27/Free-Foodie-Protocol-
- **Project Lead**: Liam McKeown
- **Organization**: Cal Poly Basic Needs Initiative

---

**Last Updated:** November 8, 2025  
**Document Version:** 1.0  
**Maintained By:** Liam

