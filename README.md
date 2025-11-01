# Free Foodie Quest (FFQ) - Decentralized Food Pantry System

A Web2-first, Web3-enabled food pantry system built on Aptos blockchain for college campuses.

## Overview

FFQ combines familiar web/mobile interfaces with blockchain-based governance, audit trails, and incentive mechanisms. Students vote on desired food items, suppliers donate surplus inventory, and pantry workers execute fair allocations—all tracked immutably on Aptos.

## Core Principles

1. **Web2-first UX**: Students, pantry workers, and suppliers use intuitive web/mobile apps
2. **Web3 for audit and incentives**: Aptos blockchain stores NFTs, governance tokens, and allocation rights
3. **Custodial wallet**: BNI holds the wallet, handling all on-chain interactions
4. **Role-based design**: NFTs and functionality specific to user type
5. **Real-time analytics**: Instant feedback on inventory, demand, allocations, and compliance

## User Roles

### Students
- Vote on desired food items
- View real-time inventory
- Bid for allocations
- Redeem food with Allocation NFTs
- Earn Governance NFTs for participation

### Pantry Workers / Council
- Execute allocations based on POAS
- Confirm redemptions
- Manage pantry operations
- Access operational analytics

### Suppliers
- List surplus inventory
- Track donations
- Receive Supplier NFTs (audit record)
- Monitor compliance metrics

## NFT & Token Mechanics

### Governance NFTs
- Earned by students for voting
- Stored in BNI custodial wallet
- Used to bid for allocations
- Drives demand-driven governance

### Allocation NFTs
- Represents confirmed right to food allocation
- Minted after POAS calculation and Council approval
- Redeemed at pantry pickup
- Burned or marked redeemed on-chain

### Supplier NFTs
- Tracks donation quantity, type, and compliance
- Immutable audit trail for regulatory reporting
- Supports SB 1383 and Bill Emerson Act compliance

## Technology Stack

### Frontend
- **Web**: React + Tailwind CSS
- **Mobile**: React Native / Expo (iOS/Android)

### Backend
- **API**: Node.js + Express
- **Database**: PostgreSQL with Supabase (real-time capabilities)
- **Authentication**: CalPoly SSO / OAuth2

### Blockchain
- **Network**: Aptos
- **Smart Contracts**: Move language
- **Custodial Wallet**: BNI-managed

### Data & Analytics
- **DTL**: Python/Node.js for data normalization and POAS calculation
- **DON**: Multiple Aptos nodes for data verification
- **Notifications**: Firebase / OneSignal

## Project Structure

```
/
├── frontend/           # React web app
├── mobile/            # React Native mobile app
├── backend/           # Node.js/Express API
├── smart-contracts/   # Aptos Move contracts
├── dtl/              # Data Translation Layer
└── docs/             # Documentation
```

## Workflows

### Supplier Donation
1. Supplier lists surplus via app
2. DTL normalizes and verifies data
3. Supplier NFT minted in BNI wallet
4. Inventory appears in student view

### Student Demand & Voting
1. Student views inventory
2. Student votes → Governance NFT minted
3. Backend aggregates votes
4. DTL computes POAS
5. Council approves allocation

### Allocation & Redemption
1. BNI wallet mints Allocation NFTs
2. Students notified via push notification
3. Student redeems at pantry
4. Pantry worker confirms pickup
5. Allocation NFT burned/marked redeemed

### Audit & Compliance
- All transactions logged on-chain
- Real-time dashboards for monitoring
- Automated regulatory reporting

## Security & Compliance

- **Custodial Wallet**: BNI-managed, minimizes student blockchain exposure
- **VLCP Compliance**: Temperature, handling, packaging verification
- **Audit Trail**: Immutable on-chain records
- **Role-Based Access**: Enforced in app and backend

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Aptos CLI
- React 18+

### Installation

```bash
# Clone repository
git clone https://github.com/lmckeown27/Free-Foodie-Protocol-.git
cd Free-Foodie-Protocol-

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Set up database
cd ../backend
npm run db:setup

# Deploy smart contracts
cd ../smart-contracts
aptos move compile
aptos move publish
```

### Running the Application

```bash
# Start backend
cd backend
npm run dev

# Start frontend (in new terminal)
cd frontend
npm start

# Start mobile app (in new terminal)
cd mobile
npx expo start
```

## MVP Goals

1. ✅ Students can vote, view inventory, bid, and redeem allocations
2. ✅ Pantry Workers can execute allocations and confirm redemptions
3. ✅ Suppliers can list surplus donations with Supplier NFTs
4. ✅ BNI custodial wallet ensures safe, compliant blockchain interactions
5. ✅ Real-time analytics support governance and operational efficiency
6. ✅ Full audit trail for inventory, voting, allocations, and compliance

## License

MIT

## Contact

For questions or support, contact the BNI team.
