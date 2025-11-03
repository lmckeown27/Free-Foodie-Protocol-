# Free Foodie Quest NFT Guide

## Overview

Free Foodie Quest (FFQ) uses four types of NFTs on the Aptos blockchain to manage governance, food distribution, volunteer recognition, and supplier verification. All NFTs are held in the **Pantry's multi-sig custodial wallet** on behalf of users, eliminating the need for students and suppliers to manage their own crypto wallets.

---

## NFT Types

### 1. Governance NFT 🗳️

**User Type:** **Student**

**Purpose:**
Governance NFTs grant students voting rights in the FFQ platform's decentralized governance system. Each student receives **one Governance NFT** upon registration, representing their voice in platform decisions.

**Key Details:**
- **Voting Power:** 1 vote per NFT
- **Collective Weight:** Students collectively hold 10% of total governance voting power
- **Issuance:** Minted automatically when a student registers via Cal Poly SSO
- **Transferability:** Non-transferable (soul-bound to student account)
- **Status:** Active for duration of student enrollment
- **POAS Impact:** Governance participation (voting frequency, consistency) accounts for 35% of POAS score

**Governance Scope:**
Students can vote on:
- Platform feature changes
- Food distribution policy adjustments
- Supplier approval/removal
- Budget allocation for campus food security initiatives
- Volunteer program structure

**Technical Details:**
- **Contract:** `GovernanceNFT` collection on Aptos
- **Metadata:** Student Cal Poly ID, registration date, voting history hash
- **Minting:** Triggered by Pantry multi-sig upon SSO verification
- **Storage:** Custodial mapping in Pantry Vault
- **On-Chain Events:** Vote submissions recorded as transaction signatures

**Example Use Case:**
When a proposal is created to add a new supplier, all students with active Governance NFTs are eligible to vote. Their votes are aggregated and weighted as 10% of the total decision.

---

### 2. Allocation NFT 🍎

**User Type:** **Student**

**Purpose:**
Allocation NFTs represent a student's **claim right** to a specific food item. They are minted when the POAS algorithm determines a student should receive food and act as a redemption ticket for pickup.

**Key Details:**
- **Issuance:** Minted by Pantry after POAS calculation
- **Quantity:** Variable - students receive NFTs based on their POAS score and need
- **Lifecycle:** Active → Redeemed (upon pickup) → Burned (optional)
- **Expiration:** Typically valid for 7 days from issuance
- **POAS Impact:** Redemption rate (% of allocations picked up) accounts for 10% of POAS score

**Allocation Process:**
1. **POAS Calculation:** Algorithm runs weekly to determine fair distribution
2. **NFT Minting:** Pantry multi-sig mints Allocation NFTs for top-priority students
3. **Notification:** Student receives notification of available food
4. **Pickup:** Student presents Cal Poly ID or QR code at pantry
5. **Redemption:** Pantry worker verifies and marks NFT as "redeemed"
6. **Burn (Optional):** NFT may be burned after successful redemption

**Technical Details:**
- **Contract:** `AllocationNFT` collection on Aptos
- **Metadata:** Item name, item type, quantity, unit, allocation date, expiration date
- **Minting:** Triggered by Pantry after POAS batch calculation
- **Storage:** Custodial mapping links NFT to student account
- **On-Chain Events:** Redemption recorded as transaction with timestamp

**Status Types:**
- **Active:** Ready for pickup
- **Redeemed:** Student picked up food
- **Burned:** NFT destroyed after redemption (for clean ledger)
- **Expired:** Not picked up within validity window

**Example Use Case:**
After the weekly POAS calculation, Student A (score: 84.7) receives 2 Allocation NFTs: one for fresh produce (3 lbs) and one for canned goods (5 cans). They have 7 days to pick up these items at the campus pantry.

---

### 3. Volunteer NFT 🌟

**User Type:** **Student**

**Purpose:**
Volunteer NFTs are **milestone reward badges** earned by students for completing community service hours. They recognize contribution to the FFQ ecosystem and other campus/community initiatives.

**Key Details:**
- **Issuance:** Minted when a student reaches volunteer hour milestones
- **Quantity:** Multiple - one per tier achieved
- **Tiers:** Bronze (5h), Silver (10h), Gold (25h), Platinum (50h)
- **Transferability:** Non-transferable (soul-bound achievement badges)
- **Status:** Permanent (never burned or expired)
- **POAS Impact:** Volunteer contribution accounts for 20% of POAS score

**Volunteer Tiers:**
| Tier | Hours Required | Bonus Multiplier | POAS Boost |
|------|----------------|------------------|------------|
| Bronze | 5 hours | +10% | Moderate |
| Silver | 10 hours | +15% | Good |
| Gold | 25 hours | +20% | Excellent |
| Platinum | 50 hours | +30% | Outstanding |

**Volunteer Activities:**
- Pantry operations (sorting, stocking, cleaning)
- Food distribution events
- Campus food security advocacy
- Peer education on nutrition and food access
- Community meal preparation
- Food recovery/rescue missions
- Administrative support

**Verification Process:**
1. **Logging:** Student submits volunteer hours via dashboard
2. **Documentation:** Includes date, activity, hours, supervisor contact
3. **Review:** Pantry staff verifies hours with supervisor or documentation
4. **Approval:** Once verified, hours added to student's record
5. **Milestone Check:** System checks if new tier unlocked
6. **NFT Minting:** Pantry multi-sig mints Volunteer NFT for new tier
7. **POAS Update:** Volunteer contribution component recalculated

**Technical Details:**
- **Contract:** `VolunteerNFT` collection on Aptos
- **Metadata:** Tier level, hours at minting, achievement date, activity description
- **Minting:** Triggered by Pantry after hour verification
- **Storage:** Custodial mapping, permanent record
- **On-Chain Events:** Milestone achievement recorded

**Example Use Case:**
Student B logs 12 volunteer hours helping with pantry operations. After verification, they cross the Silver tier threshold (10 hours). The Pantry mints a Silver Volunteer NFT, which increases their volunteer contribution score and boosts their overall POAS by improving their allocation priority.

---

### 4. Supplier NFT 🚚

**User Type:** **Supplier**

**Purpose:**
Supplier NFTs serve as **verification badges** for approved food donors. They track donation history, ensure compliance with food safety standards, and grant governance participation rights.

**Key Details:**
- **Issuance:** Minted after Pantry verification and approval
- **Quantity:** One per approved supplier organization
- **Collective Weight:** Suppliers collectively hold 20% of governance voting power
- **Transferability:** Non-transferable (tied to verified organization)
- **Status:** Active (renewable annually with compliance review)
- **Compliance:** Must maintain Good Samaritan Act and SB 1383 standards

**Supplier Verification Requirements:**
- Valid business license or 501(c)(3) documentation
- Food handler certifications (if applicable)
- Liability insurance (minimum $1M)
- Agreement to Good Samaritan Act protections
- Compliance with California SB 1383 (organic waste diversion)
- Background check on primary contact
- Facility inspection (for food service suppliers)

**Supplier Benefits:**
- **Governance Voice:** 20% collective voting power on platform decisions
- **Tax Deductions:** Documentation for food donation tax benefits
- **Public Recognition:** Profile displayed on FFQ platform
- **Impact Tracking:** Dashboard showing pounds donated, students served
- **Compliance Assistance:** Support with regulatory requirements
- **Networking:** Connection to other sustainable food partners

**Governance Participation:**
Suppliers vote through a **Supplier Vault** (multi-sig representing all suppliers) on:
- Logistics and scheduling improvements
- Incentive program structures
- Platform sustainability initiatives
- Technology and feature enhancements
- New supplier onboarding criteria

**Technical Details:**
- **Contract:** `SupplierNFT` collection on Aptos
- **Metadata:** Organization name, approval date, compliance status, donation stats
- **Minting:** Triggered by Pantry multi-sig after verification
- **Storage:** Custodial mapping links NFT to supplier account
- **On-Chain Events:** Donations recorded as transactions with item metadata

**Donation Tracking:**
Each donation creates an on-chain record:
- Donation date and time
- Item type, name, quantity, unit
- Status: Pending → Available → Allocated → Redeemed
- Weight/volume metrics for impact calculation
- Compliance checklist completion

**Example Use Case:**
Local Restaurant X applies to become an FFQ supplier. After Pantry verifies their food handler permits, insurance, and facility standards, they mint a Supplier NFT. Restaurant X can now log donations via the dashboard, track their impact (students served, pounds donated), and participate in governance votes through the Supplier Vault.

---

## NFT Distribution Summary

| NFT Type | User Type | Quantity per User | Purpose | Governance Weight | POAS Impact |
|----------|-----------|-------------------|---------|-------------------|-------------|
| **Governance** | Student | 1 (permanent) | Voting rights | 10% collective | 35% (participation) |
| **Allocation** | Student | Variable (weekly) | Food claim right | N/A | 10% (redemption rate) |
| **Volunteer** | Student | 4 max (tiers) | Milestone reward | N/A | 20% (contribution) |
| **Supplier** | Supplier | 1 (renewable) | Verification badge | 20% collective | N/A |

---

## Custodial Wallet Model

**Key Principle:** The Pantry holds ONE multi-sig custodial wallet that manages all NFTs on behalf of users.

### How It Works:

**For Students:**
- No crypto wallet needed
- No gas fees or blockchain knowledge required
- Log in with Cal Poly SSO
- View NFTs in dashboard
- All blockchain transactions handled by Pantry multi-sig
- NFTs are mapped to student account in custodial system

**For Suppliers:**
- No crypto wallet needed
- Log in with email/password
- View Supplier NFT in dashboard
- All blockchain transactions (donation logging, NFT minting) handled by Pantry
- NFTs are mapped to supplier account in custodial system

**For Pantry:**
- Operates Petra Vault (multi-sig wallet) on Aptos
- Requires 3 of 5 signatures for critical actions:
  - Minting new NFTs
  - Burning/transferring NFTs
  - Executing governance proposals
  - Supplier approvals
- Maintains custodial mappings (off-chain user ID → on-chain NFT ID)
- Provides audit trail for all transactions

**Security & Privacy:**
- Students don't expose personal wallet addresses
- On-chain transactions use Pantry wallet address
- Off-chain database maps NFTs to user identities
- Only Pantry staff can access custodial mappings
- Blockchain records show Pantry as owner, not individual students

---

## NFT Lifecycle Examples

### Student Journey:
1. **Registration:** Student registers → Governance NFT minted
2. **Week 1:** POAS calculated → 2 Allocation NFTs minted
3. **Pickup:** Student redeems allocations → NFTs marked "redeemed"
4. **Volunteering:** Student logs 10 hours → Silver Volunteer NFT minted
5. **Governance:** Student votes on supplier proposal → vote recorded on-chain
6. **Week 2:** Higher POAS (due to volunteering) → 3 Allocation NFTs minted

### Supplier Journey:
1. **Application:** Supplier applies with documentation
2. **Verification:** Pantry reviews credentials and facility
3. **Approval:** Supplier NFT minted → supplier can donate
4. **Donation 1:** Logs 50 lbs of produce → recorded on-chain
5. **Donation 2:** Logs 30 lbs of bread → recorded on-chain
6. **Governance:** Supplier Vault votes on logistics change → vote recorded
7. **Annual Review:** Compliance checked → NFT status renewed

---

## Technical Architecture

### Smart Contracts (Move on Aptos):
- `GovernanceNFT` collection
- `AllocationNFT` collection
- `VolunteerNFT` collection
- `SupplierNFT` collection
- `GovernanceSystem` module (voting logic)
- `AllocationSystem` module (POAS integration)

### Off-Chain Components:
- PostgreSQL database (user accounts, POAS scores, volunteer hours)
- Node.js/Express backend (API, authentication, business logic)
- React frontend (user dashboards, NFT display)
- Custodial mapping system (links users to NFTs)
- Audit logging (comprehensive transaction history)
- Reconciliation service (syncs on-chain and off-chain state)

### Data Flow:
1. **User Action** (e.g., student logs volunteer hours)
2. **Off-Chain Processing** (backend verifies and calculates)
3. **Multi-Sig Proposal** (if NFT minting needed)
4. **Pantry Approval** (3 of 5 signers approve)
5. **On-Chain Transaction** (NFT minted on Aptos)
6. **Custodial Mapping** (off-chain link created: user_id → nft_id)
7. **User Notification** (student sees NFT in dashboard)

---

## Governance Model Recap

**Three-Entity Structure:**

| Entity | Voting Power | Representation |
|--------|-------------|----------------|
| **Pantry** | 70% | Multi-sig Petra Vault (5 staff members) |
| **Suppliers** | 20% | Supplier Vault (collective multi-sig) |
| **Students** | 10% | Individual Governance NFTs (aggregated) |

**Decision Types:**
- **Operational:** Pantry executes with 70% authority
- **Strategic:** Requires majority across all three entities
- **Platform Changes:** Weighted voting with proposal threshold
- **Supplier Onboarding:** Pantry approval required, supplier input considered

---

## Compliance & Legal

### Good Samaritan Act Protection:
- Supplier NFTs document donation for liability protection
- On-chain records serve as legal documentation
- Pantry maintains compliance checklist for each donation

### California SB 1383:
- Organic waste diversion requirements
- Supplier NFTs track compliance metrics
- On-chain audit trail for regulatory reporting

### Student Privacy:
- FERPA compliance (no PII on blockchain)
- Cal Poly IDs hashed in metadata
- Custodial model prevents blockchain tracking of students

### Data Retention:
- NFT records: Permanent on Aptos blockchain
- Custodial mappings: Retained for 7 years post-graduation
- Volunteer hours: Permanent record for resume verification
- Allocation history: 2 years for audit purposes

---

## Future Enhancements

### Planned NFT Features:
- **Nutrition Education NFT:** Badge for completing food literacy courses
- **Zero Waste NFT:** Recognition for sustainable practices
- **Peer Support NFT:** Badge for mentoring other students
- **Recipe Challenge NFT:** Awards for creative food usage
- **Community Builder NFT:** Recognition for organizing food security events

### Technical Roadmap:
- **NFT Marketplace:** Trade volunteer NFTs for allocation priority
- **Cross-Campus Integration:** UC-wide recognition of volunteer badges
- **Alumni Network:** Lifetime governance participation for engaged graduates
- **Dynamic Metadata:** Real-time POAS score display in NFT metadata
- **Fractional Governance:** Split large proposals into weighted sub-votes

---

## FAQ

**Q: Can students sell their NFTs?**
A: No. All FFQ NFTs are soul-bound and non-transferable.

**Q: What happens to NFTs when a student graduates?**
A: Governance NFTs expire. Volunteer NFTs remain as permanent achievement records. Allocation NFTs are burned.

**Q: Can suppliers lose their NFT?**
A: Yes, if compliance lapses or food safety violations occur. Annual renewal required.

**Q: Who pays gas fees for minting NFTs?**
A: The Pantry's multi-sig wallet covers all gas fees. Users never pay.

**Q: Can I view my NFTs on the Aptos blockchain explorer?**
A: Yes, but they're owned by the Pantry wallet address. Use the FFQ dashboard to see your mapped NFTs.

**Q: What happens if the Pantry's wallet is compromised?**
A: Multi-sig protection requires 3 of 5 approvals. Social recovery mechanisms and time-locks prevent theft.

**Q: Are NFTs required to receive food?**
A: Technically no - emergency food access never requires blockchain interaction. NFTs optimize fair distribution.

**Q: Can I opt out of the NFT system?**
A: Yes, but you lose governance rights, volunteer recognition, and allocation priority optimization.

---

## Contact & Support

**Technical Questions:** tech@freefoodiequest.org
**Governance Inquiries:** governance@freefoodiequest.org
**Supplier Onboarding:** suppliers@freefoodiequest.org
**Student Support:** help@freefoodiequest.org

**Developer Resources:**
- GitHub: https://github.com/free-foodie-quest
- Aptos Explorer: https://explorer.aptoslabs.com (search for FFQ contracts)
- API Documentation: https://docs.freefoodiequest.org
- Move Contract Code: https://github.com/free-foodie-quest/move-contracts

---

*Last Updated: November 2025*
*Free Foodie Quest — Decentralized Food Security on Aptos*

