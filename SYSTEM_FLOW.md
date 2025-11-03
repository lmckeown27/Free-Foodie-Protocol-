# Free Foodie Quest (FFQ) - System Flow Documentation

## Overview

Free Foodie Quest is a decentralized food pantry platform built on Aptos blockchain, designed to ensure fair and transparent food distribution for college students experiencing food insecurity. The system involves four key actors working together in a coordinated flow.

---

## System Actors

### 1. **Students** (Grey-Green Theme)
- Primary beneficiaries of the food pantry
- Vote on desired food items
- Claim allocated food
- Receive Governance NFTs (voting rights) and Allocation NFTs (claim rights)

### 2. **Suppliers** (Grey-Blue Theme)
- Local businesses, restaurants, and food distributors
- Donate surplus food to the pantry
- Receive Supplier NFTs as blockchain receipts
- Track impact metrics (pounds donated, meals saved, CO₂ reduced)

### 3. **Pantry Workers** (Grey-Purple Theme)
- Manage day-to-day pantry operations
- Process food donations from suppliers
- Verify student pickups
- Monitor inventory health and allocations

### 4. **Basic Needs Initiative (BNI)** (Orange Theme)
- Institutional governance body (e.g., university department)
- Oversees entire system and holds custodial wallet for all students
- Approves new suppliers and mints NFTs
- Monitors system-wide analytics and compliance
- Operates multi-sig Petra Vault for all blockchain transactions on behalf of students

---

## Complete System Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    BASIC NEEDS INITIATIVE (BNI)                         │
│                                                                         │
│  • System Oversight & Governance                                       │
│  • Multi-Sig Petra Vault Management                                    │
│  • Supplier Approval & NFT Minting                                     │
│  • Custodial Wallet Service (for all students)                         │
│  • Compliance Monitoring                                               │
│                                                                         │
└──────────┬────────────────────────────────────────────────┬─────────────┘
           │                                                │
           │ (1) Approves & Mints NFT                       │ (2) Holds Custodial Wallet
           ↓                                                ↓
┌──────────────────────┐                        ┌───────────────────────┐
│      SUPPLIER        │                        │    STUDENT            │
│                      │                        │                       │
│  Donates Food  ───────(3)────→  PANTRY  ←────(4)──── Votes for Food  │
│  Surplus Items       │         WORKER         │       Items Needed    │
│                      │            │           │                       │
│  Receives:           │            │           │  Receives:            │
│  • Supplier NFT      │         (5) │          │  • Governance NFT     │
│  • Impact Metrics    │      Allocates Food    │  • Allocation NFT     │
│  • Blockchain Receipt│       (POAS-Based)     │  • Food Items         │
│                      │            │           │                       │
└──────────────────────┘            │           └───────────────────────┘
                                    │
                                 (6) │
                              Student Pickup
                              (QR Verification)
                                    │
                                    ↓
                         ┌──────────────────┐
                         │   BLOCKCHAIN     │
                         │   (Aptos)        │
                         │                  │
                         │  Immutable Audit │
                         │  Trail of All    │
                         │  Transactions    │
                         └──────────────────┘
```

---

## Detailed Process Flows

### Flow 1: Supplier Onboarding & Donation

**Step 1: Supplier Application**
```
Supplier (Restaurant/Store) → Applies through Landing Page
                            ↓
                    BNI Dashboard (Pending Approvals)
                            ↓
                    BNI Reviews Application
                            ↓
                BNI Approves & Mints Supplier NFT
                            ↓
            Supplier NFT sent to BNI Custodial Wallet
                            ↓
                Supplier gains access to dashboard
```

**Step 2: Food Donation**
```
Supplier Dashboard → Add Donation Form
                            ↓
                Enters: Item Name, Type, Quantity, Unit
                        Expiration Date, Handling Notes
                            ↓
            Donation saved to Inventory Table (PostgreSQL)
                            ↓
        Pantry Worker receives notification (available)
                            ↓
        Blockchain: Supplier NFT updated with donation record
                            ↓
        Supplier sees impact metrics update:
        - Pounds Donated (calculated from all donations)
        - Meals Saved (~1.2 meals per pound)
        - CO₂ Saved (~3.8kg per pound)
```

**API Endpoints Used:**
- `POST /api/v1/inventory` - Create donation
- `GET /api/v1/suppliers/:id/donations` - View donation history
- `GET /api/v1/suppliers/:id/impact` - View impact metrics
- `POST /api/v1/nft/mint` - Mint Supplier NFT (BNI only)

---

### Flow 2: Student Voting & Allocation

**Step 1: Student Voting**
```
Student Dashboard → Browse Available Inventory
                            ↓
                Click "Vote" on desired items
                            ↓
                Select Priority Level (1-5)
                            ↓
            Vote saved to Votes Table (PostgreSQL)
                            ↓
        Student's POAS Score recalculated (DTL Service)
        Components:
        - Vote Weight (how much they voted)
        - Engagement Score (platform activity)
        - Claim History (redemption rate)
        - Urgency Factor (time since last claim)
                            ↓
        Blockchain: Governance NFT voting power updated
```

**Step 2: POAS Calculation (Data Translation Layer)**
```
DTL Service runs periodically or on-demand
                            ↓
        Fetches all student votes and behavior data
                            ↓
        Calculates POAS Score for each student:
        
        POAS = (Vote_Weight × 0.4) + 
               (Engagement × 0.3) + 
               (Need_Factor × 0.2) + 
               (Urgency × 0.1)
                            ↓
        Stores POAS scores in database
                            ↓
        Pantry Worker sees POAS recommendations
```

**Step 3: Pantry Worker Allocation**
```
Pantry Worker Dashboard → View POAS Recommendations
                            ↓
        System suggests students with highest POAS scores
                            ↓
        Pantry Worker allocates food to students
                            ↓
        Allocation saved to Allocations Table
                            ↓
        BNI mints Allocation NFT for student
                            ↓
        Student receives notification: "Food Ready for Pickup"
                            ↓
        Student Dashboard shows Active Claims
```

**API Endpoints Used:**
- `POST /api/v1/voting/vote` - Submit vote
- `GET /api/v1/poas/my-score` - View personal POAS score
- `GET /api/v1/poas/recommendations/:itemId` - Get allocation suggestions
- `POST /api/v1/allocations` - Create allocation (Pantry Worker)
- `GET /api/v1/allocations/my-allocations` - View student's claims

---

### Flow 3: Food Pickup & Verification

**Step 1: Student Pickup Preparation**
```
Student Dashboard → Active Claims Section
                            ↓
        Click "Show QR Code" on allocation
                            ↓
        QR Code generated with:
        - Allocation ID
        - Student ID
        - Verification ID
        - Item details
        - POAS Score
                            ↓
        Student arrives at pantry with QR code
```

**Step 2: Pantry Worker Verification**
```
Pantry Worker Dashboard → Verification Scanner
                            ↓
        Scans student's QR code OR enters PolyCard ID
                            ↓
        System verifies:
        - Valid allocation exists
        - Student identity matches
        - Item is available
                            ↓
        Pantry Worker confirms pickup
                            ↓
        Allocation status updated: approved → redeemed
                            ↓
        Blockchain: Allocation NFT "burned" (marked redeemed)
        Inventory status updated: allocated → redeemed
                            ↓
        Student's claim history updated (affects future POAS)
```

**Step 3: Blockchain Audit Trail**
```
All pickup events recorded on Aptos:
- Transaction Hash
- Timestamp
- Student wallet address (BNI custodial)
- Item details
- POAS score at time of allocation
                            ↓
        Immutable record for compliance:
        - Good Samaritan Act protection
        - SB 1383 compliance
        - Audit trails for funding accountability
```

**API Endpoints Used:**
- `GET /api/v1/allocations/:id` - Fetch allocation details
- `PUT /api/v1/allocations/:id/redeem` - Mark as picked up
- `POST /api/v1/nft/burn` - Burn Allocation NFT (BNI Multi-Sig)

---

### Flow 4: BNI Governance & Oversight

**Daily Operations**
```
BNI Dashboard displays real-time metrics:
- Active Students (served via custodial wallet)
- Verified Suppliers (Supplier NFTs issued)
- Active Pantries (multi-sig vaults configured)
- Total Donations (all food items donated)
- Total Allocations (items allocated to students)
- Blockchain Transactions (on-chain verifications)
```

**Supplier Management**
```
BNI receives supplier application
                ↓
        Review business credentials
        Verify food safety compliance
                ↓
        APPROVE → Mint Supplier NFT via Multi-Sig Petra Vault
        or
        REJECT → Send notification
```

**Student Custodial Wallet Service**
```
Student registers with Cal Poly ID (OAuth2/SSO)
                ↓
        Student account linked to BNI's custodial wallet system
                ↓
        BNI's custodial wallet mints Governance NFT on student's behalf
                ↓
        Student can now vote (1 NFT = 1 vote weight)
                ↓
        More votes = more Governance NFTs = higher influence
        
Note: BNI holds ONE custodial wallet that executes transactions 
      on behalf of ALL students - students don't manage individual wallets
```

**System Analytics**
```
BNI monitors:
- Inventory health (expiring items, stock levels)
- Student engagement (voting activity, redemption rates)
- Supplier contributions (donation frequency, diversity)
- Compliance logs (food safety checks, audit trails)
                ↓
        Generate reports for:
        - University administration
        - Grant funders
        - Health & safety inspectors
```

**API Endpoints Used:**
- `GET /api/v1/analytics/dashboard` - System overview
- `GET /api/v1/analytics/compliance` - Audit logs
- `POST /api/v1/users/approve-supplier` - Approve supplier
- `GET /api/v1/poas/calculate-all` - Trigger POAS recalculation

---

## Data Flow Architecture

### Web2 Layer (Traditional Backend)
```
PostgreSQL Database
├── users (Students, Suppliers, Pantry Workers, BNI staff)
├── inventory (Donated food items)
├── votes (Student preferences)
├── allocations (Food assigned to students)
├── nft_records (Blockchain transaction logs)
└── compliance_logs (Audit trail)

Node.js/Express Backend (REST API)
├── Authentication (JWT tokens)
├── Role-based access control
├── Business logic
└── Database queries
```

### Web3 Layer (Blockchain - Aptos)
```
Aptos Smart Contracts (Move)
├── governance_nft.move (Student voting rights)
├── allocation_nft.move (Student claim rights)
└── supplier_nft.move (Donation receipts)

BNI Multi-Sig Petra Vault
├── Signs all NFT transactions
├── Holds custodial wallet for all students
├── Ensures decentralized governance
└── Provides audit trail
```

### Data Translation Layer (DTL)
```
Python/Node.js Service
├── Fetches data from PostgreSQL
├── Normalizes food items and units
├── Calculates POAS scores
├── Triggers blockchain events
└── Syncs Web2 ↔ Web3
```

---

## Key System Features

### 1. Fair Distribution (POAS Algorithm)
- AI-powered score ensures equitable food allocation
- Considers student need, engagement, and urgency
- Prevents gaming the system (no hoarding, fair access)

### 2. Transparency (Blockchain Audit Trail)
- Every donation, allocation, and pickup recorded on-chain
- Immutable records for accountability
- Public verification of system fairness

### 3. Compliance (Legal Protection)
- **Good Samaritan Act**: Protects suppliers from liability
- **SB 1383**: California food waste reduction compliance
- **VLCP**: Verifiable Logistics Checklist Protocol for food safety

### 4. Privacy (Custodial Wallet Model)
- BNI holds ONE custodial wallet that executes transactions for ALL students
- Students don't need crypto knowledge or wallet management
- Student identity protected (anonymous on-chain addresses)
- Only authorized parties see personal information

### 5. Gamification (NFT Incentives)
- Students earn Governance NFTs by voting
- Higher voting activity = more allocation priority
- Suppliers earn impact metrics and recognition
- Pantry Workers see efficiency metrics

---

## Security & Access Control

### Role-Based Permissions

| Action | Student | Supplier | Pantry Worker | BNI |
|--------|---------|----------|---------------|-----|
| Vote on items | ✅ | ❌ | ❌ | ❌ |
| Donate food | ❌ | ✅ | ❌ | ❌ |
| Allocate food | ❌ | ❌ | ✅ | ✅ |
| Verify pickups | ❌ | ❌ | ✅ | ✅ |
| Mint NFTs | ❌ | ❌ | ❌ | ✅ |
| Approve suppliers | ❌ | ❌ | ❌ | ✅ |
| View all analytics | ❌ | ❌ | ⚠️ (limited) | ✅ |
| Hold custodial wallet | ❌ | ❌ | ❌ | ✅ |

### Authentication Flow
```
User Login → JWT Token Issued → Role Checked → API Access Granted
                                    ↓
                        Middleware verifies token on every request
                                    ↓
                        Only authorized endpoints accessible
```

---

## Example: Complete Journey of a Food Item

### Timeline: Banana Donation to Student Consumption

**Day 1, 9:00 AM - Supplier Donation**
```
Local grocery store (Trader Joe's) has 50 lbs of bananas expiring tomorrow
→ Supplier logs into FFQ dashboard
→ Adds donation: "Bananas, 50 lbs, expires 11/4/2025"
→ Saved to inventory table (status: available)
→ Supplier NFT updated with donation record on Aptos
→ Supplier impact metrics: +50 lbs, +60 meals, +190kg CO₂ saved
```

**Day 1, 10:00 AM - Student Voting**
```
200 students see bananas in "Available Inventory"
→ 150 students vote for bananas (priority levels 3-5)
→ Votes saved to database
→ DTL service recalculates POAS scores for all 150 students
→ Top 50 students (by POAS) identified as candidates
```

**Day 1, 11:00 AM - Pantry Worker Allocation**
```
Pantry Worker sees "50 lbs bananas available"
→ Dashboard shows POAS recommendations (top 50 students)
→ Pantry Worker allocates 1 lb per student to top 50 students
→ 50 allocations created in database (status: approved)
→ BNI Multi-Sig Vault mints 50 Allocation NFTs (one per student)
→ 50 students receive notification: "Bananas ready for pickup!"
```

**Day 1, 2:00 PM - Student Pickup**
```
Student Sarah arrives at pantry
→ Opens FFQ app, clicks "Show QR Code" on banana allocation
→ Pantry Worker scans QR code
→ System verifies: Valid allocation for Sarah, 1 lb bananas, POAS 87.5
→ Pantry Worker hands Sarah 1 lb of bananas
→ Confirms pickup in system
→ Allocation status updated: approved → redeemed
→ Inventory updated: 49 lbs remaining
→ Allocation NFT burned on blockchain
→ Sarah's claim history updated (affects next POAS score)
```

**Day 1, 5:00 PM - Analytics Update**
```
BNI Dashboard updates:
→ Total Allocations: +50
→ Total Transactions: +50 (Allocation NFTs)
→ Student engagement metrics increase
→ Supplier sees impact: "Your bananas fed 50 students today"
→ Blockchain audit trail complete: 50 pickup events recorded
```

---

## Technology Stack Summary

### Frontend (React)
- Student Dashboard (voting, claims, QR codes)
- Supplier Dashboard (donations, impact metrics)
- Pantry Worker Dashboard (allocations, verification)
- BNI Dashboard (governance, analytics)
- Landing Page (marketing, education)

### Backend (Node.js/Express)
- REST API with JWT authentication
- Role-based access control
- PostgreSQL database integration
- Aptos blockchain integration

### Blockchain (Aptos)
- Smart contracts in Move language
- NFT standards for Governance, Allocation, Supplier
- Multi-sig Petra Vault for BNI governance
- Immutable audit trail

### Data Translation Layer (Python/Node.js)
- POAS algorithm calculation
- Inventory normalization
- Web2 ↔ Web3 synchronization
- Scheduled jobs for score updates

### Database (PostgreSQL)
- User authentication and profiles
- Inventory management
- Vote tracking
- Allocation records
- NFT transaction logs
- Compliance audit logs

---

## Future Enhancements

1. **Multi-Pantry Support**: Expand beyond single location
2. **Decentralized Oracle Network (DON)**: Real-time supplier inventory feeds
3. **Mobile App**: React Native for iOS/Android
4. **Student Wallet Graduation**: Option to self-custody wallets
5. **Cross-University Network**: Share resources between campuses
6. **AI Demand Forecasting**: Predict student needs and optimize allocations
7. **Supplier Marketplace**: Connect suppliers with pantries nationwide
8. **Grant Integration**: Automated reporting for funders

---

## Contact & Support

For questions about system flows, integration, or partnerships:
- BNI Staff: Contact your institutional Basic Needs office
- Developers: See README.md for technical setup
- Suppliers: Apply through landing page at `/`
- Students: Register with Cal Poly ID at `/register`

---

## Appendix: Quick Reference

### User Journey Overview

**Student**: Register → Vote → Receive Allocation → Show QR Code → Pick Up Food  
**Supplier**: Apply → Get Approved → Donate Food → Track Impact  
**Pantry Worker**: Accept Donations → View POAS → Allocate Food → Verify Pickups  
**BNI**: Approve Suppliers → Mint NFTs → Monitor System → Generate Reports  

### Core Principles

1. **Fair**: POAS ensures equitable distribution
2. **Transparent**: Blockchain audit trail
3. **Compliant**: Legal protections for all parties
4. **Private**: Custodial wallet model protects student identity (no crypto knowledge needed)
5. **Efficient**: Real-time data flows minimize waste
6. **Scalable**: Architecture supports multi-site deployment

---

**Last Updated**: November 2, 2025  
**Version**: 1.0.0  
**Platform**: Free Foodie Quest MVP

