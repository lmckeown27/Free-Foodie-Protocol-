# Free Foodie Quest (FFQ) - Decentralized Food Pantry System

A Web2-first, Web3-enabled food pantry system built on Aptos blockchain for college campuses.

## Overview

FFQ combines intuitive web/mobile interfaces with blockchain-based governance, audit trails, and incentive mechanisms. Students vote on food preferences, suppliers donate surplus inventory, and pantry workers execute fair allocations—all tracked immutably on Aptos blockchain.

## Core Principles

1. **Web2-first UX**: Students, pantry workers, and suppliers use intuitive web/mobile apps with no blockchain knowledge required
2. **Web3 for audit and incentives**: Aptos blockchain stores credentials, governance records, and allocation rights
3. **Custodial wallet management**: Basic Needs Initiative (BNI) holds wallets, handling all on-chain interactions
4. **Role-based design**: Digital credentials and functionality specific to each user type
5. **Real-time analytics**: Instant feedback on inventory, demand, allocations, and compliance metrics

## User Roles & Features

### Students
- **Dashboard**: Daily overview of POAS score, pending pickups, voting rights, and volunteer hours
- **My Food**: View personal allocations and browse available inventory tailored to individual eligibility
- **Governance**: Vote on proposals for food types, supplier approvals, policies, and operating hours
- **Volunteer Hub**: Track volunteer hours, earn service badges, and increase POAS priority
- **My Credentials**: View earned credentials (Voting Rights, Pickup Tickets, Service Badges)
- **My Analytics**: Personal metrics including participation trends, food impact, and voting history
- **How It Works**: Role-specific guide to platform usage

### Pantry Workers / Basic Needs Initiative
- **Dashboard**: Overview of total students, available items, custodial credentials, and active proposals
- **Create Proposal**: Submit governance proposals for student community voting
- **Browse Inventory**: Manage pantry inventory with status tracking (available, reserved, redeemed, expired)
- **Allocations**: Review and approve student allocation requests based on POAS scores
- **Credential Management**: Issue and manage student credentials (Voting Rights, Pickup Tickets, Service Badges)
- **Analytics**: Comprehensive platform metrics including credential distribution, inventory health, and engagement
- **Wallet Connect**: Direct connection to Petra wallet for multi-sig operations
- **How It Works**: Pantry-specific operational guide

### Suppliers
- **Dashboard**: Track total donations, monthly contributions, quantities donated, and verified receipts
- **Add Donation**: Record new food donations with type, quantity, location, and handling notes
- **Donation History**: View complete donation timeline with status tracking
- **My Receipts**: Access verified donation receipts (credentials) for compliance and tax purposes
- **How It Works**: Supplier-specific donation guide

## Credential System (Blockchain-Backed)

### Voting Rights (Governance Credentials)
- Earned by students for participating in governance votes
- Stored in BNI custodial wallet
- Increases food priority (POAS score)
- Drives demand-driven governance
- **Displayed as**: Green credential in student views

### Pickup Tickets (Allocation Credentials)
- Represents confirmed right to food allocation
- Issued after POAS calculation and pantry approval
- Includes QR code for pantry pickup verification
- Marked as redeemed on-chain after pickup
- **Displayed as**: Green credential in student views

### Service Badges (Volunteer Credentials)
- Tracks volunteer hours and contributions
- Tiered system (Bronze, Silver, Gold, Platinum)
- Significantly boosts POAS priority
- Immutable record of community service
- **Displayed as**: Green credential in student views

### Donation Receipts (Supplier Credentials)
- Records donation quantity, type, date, and compliance verification
- Immutable audit trail for regulatory reporting
- Supports SB 1383 and Bill Emerson Good Samaritan Act compliance
- Tax-deductible donation record
- **Displayed as**: Blue credential in supplier views

## POAS (Priority and Outcome Allocation System)

POAS is FFQ's fair allocation algorithm that prioritizes students based on:
- **Governance participation**: Voting on proposals
- **Volunteer hours**: Service to the pantry or community
- **Pickup reliability**: Consistent redemption history
- **Need**: Time since last allocation

Students can view their real-time POAS score and rank on their dashboard, encouraging positive participation.

## Technology Stack

### Frontend
- **Web**: React 18 + React Router + Tailwind CSS
- **State Management**: React Context API
- **Charts**: Recharts for data visualization
- **Wallet Integration**: Petra Wallet via Aptos SDK
- **Mobile**: React Native / Expo (iOS/Android) - In Progress

### Backend
- **API**: Node.js + Express.js
- **Database**: PostgreSQL with pg client
- **Authentication**: JWT-based auth with role-based access control (RBAC)
- **Logging**: Winston with daily log rotation
- **Middleware**: Custom auth, error handling, and rate limiting

### Blockchain
- **Network**: Aptos (Mainnet/Testnet/Devnet)
- **Smart Contracts**: Move language (3 contracts: governance, allocation, supplier)
- **Custodial Wallet**: BNI-managed multi-sig wallet
- **Wallet SDK**: @aptos-labs/ts-sdk

### Data & Analytics
- **DTL**: Data Translation Layer for normalization and POAS calculation
- **Analytics API**: Real-time dashboard data, inventory health, engagement metrics
- **Audit Logging**: Comprehensive event tracking for compliance

## Project Structure

```
/
├── frontend/              # React web application
│   ├── src/
│   │   ├── components/    # Reusable UI components (sidebars, wallet, modals)
│   │   ├── pages/         # Main application pages (dashboards, inventory, governance)
│   │   ├── contexts/      # React context providers (wallet)
│   │   ├── services/      # API integration layer
│   │   ├── lib/           # Blockchain helpers (Aptos, contracts)
│   │   └── styles/        # Global CSS and Tailwind config
│   └── build/             # Production build output
│
├── backend/               # Node.js/Express API
│   ├── src/
│   │   ├── config/        # Database and Aptos configuration
│   │   ├── controllers/   # Request handlers
│   │   ├── routes/        # API route definitions
│   │   ├── services/      # Business logic (Aptos, wallet, NFT services)
│   │   ├── middleware/    # Auth, error handling, validation
│   │   ├── models/        # Database models
│   │   ├── scripts/       # Database setup and seeding
│   │   └── database/      # SQL migrations
│   └── logs/              # Application logs
│
├── smart-contracts/       # Aptos Move contracts
│   ├── sources/
│   │   ├── governance_nft.move    # Voting rights management
│   │   ├── allocation_nft.move    # Pickup ticket system
│   │   └── supplier_nft.move      # Donation receipt tracking
│   └── Move.toml          # Contract configuration
│
├── dtl/                   # Data Translation Layer
│   ├── src/
│   │   ├── index.js              # Main DTL service
│   │   ├── poasCalculator.js     # POAS algorithm implementation
│   │   └── inventoryNormalizer.js # Data normalization
│   └── logs/              # DTL-specific logs
│
├── mobile/                # React Native mobile app (In Progress)
│
└── docs/                  # Additional documentation
    ├── MOVE_CONTRACTS.md  # Smart contract documentation
    └── SYSTEM_FLOW.md     # System architecture and data flow
```

## Key Workflows

### Student Registration & Onboarding
1. Student registers with Cal Poly credentials
2. BNI creates custodial wallet for student
3. Student receives welcome to platform and How It Works guide
4. Initial Voting Rights credential issued for first governance participation

### Supplier Donation Flow
1. Supplier logs into dashboard
2. Clicks "Add Donation" and fills out donation form (item, quantity, type, location, notes)
3. DTL normalizes and verifies donation data
4. Donation Receipt credential minted to supplier's account
5. Inventory becomes visible to pantry staff for allocation
6. Supplier can track donation status in Donation History

### Governance & Voting
1. Pantry creates proposal (e.g., "Should we stock more organic produce?")
2. Proposal appears in student Governance view as "Active"
3. Students vote Yes/No/Abstain
4. Each vote earns student a Voting Rights credential
5. Voting Rights credential increases student's POAS score
6. After voting period, proposal is marked as "Passed" or "Rejected"
7. Pantry executes approved proposals

### Food Allocation & Pickup
1. Pantry reviews available inventory and pending allocation requests
2. POAS algorithm calculates student priorities based on participation, need, and reliability
3. Pantry approves allocations for top-priority students
4. Pickup Ticket credentials issued to approved students
5. Students notified and view tickets in "My Food" page
6. At pickup, student shows QR code from Pickup Ticket
7. Pantry scans QR code and marks allocation as "Redeemed"
8. Pickup Ticket credential marked as used on-chain

### Volunteer Hours & Priority Boost
1. Student visits Volunteer Hub
2. Student logs volunteer hours (pending pantry verification)
3. Once verified, hours added to student total
4. Service Badge credential issued at tier milestones (Bronze: 5hrs, Silver: 10hrs, Gold: 20hrs, Platinum: 40hrs)
5. Volunteer hours significantly boost POAS score
6. Student sees updated priority in dashboard

### Analytics & Reporting
- **Student Analytics**: Personal POAS trends, allocation history, voting participation, food impact
- **Pantry Analytics**: Platform-wide metrics including active credentials by type, inventory status, user distribution, proposal activity, and top engaged students
- **Supplier Analytics**: Donation totals, monthly trends, verified receipts, pending verifications

## User Interface Highlights

### Navigation
- **Fixed Sidebar**: Persistent navigation for all user roles with active page highlighting
- **Role-Specific Colors**: Green (Students), Amber/Orange (Pantry), Blue (Suppliers)
- **Dashboard-First**: All users land on their personalized dashboard after login
- **Quick Actions**: Prominent buttons for common tasks (Create Proposal, Add Donation, etc.)

### Landing Page
- **Role Switcher**: Toggle between Student, Pantry, and Supplier views
- **How It Works**: Step-by-step visual guide for each role with dynamic colors
- **Governance Explanation**: Clear breakdown of voting, proposals, and impact
- **FAQ Section**: Role-specific frequently asked questions with smooth dropdown animations
- **Mobile Responsive**: Fully optimized for all screen sizes

### Dashboard Features
- **Color-Coded Metrics**: Gradient stat cards with icons for quick scanning
- **Quick Action Cards**: Direct navigation to common tasks
- **Recent Activity**: Latest votes, allocations, or donations
- **Real-Time Updates**: Live data refresh for inventory and proposals

## Security & Compliance

- **Custodial Wallet**: BNI-managed, minimizes student blockchain exposure while maintaining audit trail
- **JWT Authentication**: Secure token-based auth with role-based access control
- **VLCP Compliance**: Temperature, handling, and packaging verification for food safety
- **Immutable Audit Trail**: All transactions recorded on Aptos blockchain
- **Role-Based Permissions**: Strict enforcement in frontend, backend, and smart contracts
- **SB 1383 Compliance**: California food waste reduction tracking and reporting
- **Good Samaritan Act**: Liability protection documentation for all donations

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Aptos CLI
- React 18+
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/lmckeown27/Free-Foodie-Protocol-.git
cd Free-Foodie-Protocol-

# Install backend dependencies
cd backend
npm install

# Set up database
node src/scripts/setupDatabase.js
node src/scripts/seedTestUsers.js

# Install frontend dependencies
cd ../frontend
npm install

# Install DTL dependencies
cd ../dtl
npm install

# Deploy smart contracts (optional - already deployed)
cd ../smart-contracts
aptos move compile
aptos move publish
```

### Environment Variables

Create `.env` files in backend and frontend directories:

**Backend `.env`:**
```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/ffq
JWT_SECRET=your_jwt_secret_here
APTOS_NETWORK=devnet
APTOS_PRIVATE_KEY=your_private_key_here
```

**Frontend `.env`:**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APTOS_NETWORK=devnet
```

### Running the Application

```bash
# Start backend (terminal 1)
cd backend
npm run dev

# Start frontend (terminal 2)
cd frontend
npm start

# Start DTL service (terminal 3)
cd dtl
npm start

# Access application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
```

### Test Users

After running seed script:
- **Student**: `student@calpoly.edu` / `password123`
- **Pantry**: `pantry@calpoly.edu` / `password123`
- **Supplier**: `supplier@calpoly.edu` / `password123`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Students
- `GET /api/allocations/my` - Get student's allocations
- `GET /api/nft/my` - Get student's credentials
- `POST /api/voting/vote` - Submit vote on proposal
- `GET /api/poas/my-score` - Get POAS score
- `GET /api/volunteer/my-hours` - Get volunteer hours

### Pantry
- `GET /api/analytics/dashboard` - Get platform analytics
- `GET /api/wallet/custodial-nfts` - Get custodial credentials
- `POST /api/governance/proposals` - Create proposal
- `PUT /api/allocations/:id/approve` - Approve allocation
- `GET /api/inventory` - Get all inventory

### Suppliers
- `POST /api/inventory` - Add donation
- `GET /api/inventory/my` - Get supplier's donations
- `GET /api/nft/my` - Get donation receipts

## MVP Milestones

1. ✅ Role-based authentication and authorization
2. ✅ Unified dashboard system for all user roles
3. ✅ Student voting and governance participation
4. ✅ POAS-based fair allocation system
5. ✅ Volunteer hour tracking and service badges
6. ✅ Supplier donation management
7. ✅ Blockchain credential issuance (Voting Rights, Pickup Tickets, Service Badges, Donation Receipts)
8. ✅ QR code-based pickup verification
9. ✅ Custodial wallet management by BNI
10. ✅ Comprehensive analytics for all roles
11. ✅ Real-time inventory management
12. ✅ Proposal creation and voting system
13. ✅ Mobile-responsive UI with Tailwind CSS
14. ✅ Full audit trail and compliance reporting

## Future Enhancements

- [ ] Mobile app (React Native/Expo)
- [ ] Push notifications for allocations and proposals
- [ ] Multi-language support
- [ ] Advanced POAS algorithms with ML
- [ ] Direct supplier-to-student recommendations
- [ ] Integration with campus dining systems
- [ ] Expanded gamification and rewards
- [ ] Cross-campus network for surplus sharing

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License - See LICENSE file for details

## Contact

For questions, support, or collaboration opportunities:
- **Project Lead**: Liam McKeown
- **Organization**: Cal Poly Basic Needs Initiative
- **GitHub**: https://github.com/lmckeown27/Free-Foodie-Protocol-

## Acknowledgments

- Cal Poly Basic Needs Initiative for project sponsorship
- Aptos Foundation for blockchain infrastructure
- Student volunteers and testers for valuable feedback
- Campus community for adoption and support

---

**Built with ❤️ for food security and student success**
