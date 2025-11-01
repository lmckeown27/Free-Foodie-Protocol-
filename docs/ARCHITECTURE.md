# Free Foodie Quest - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Layer                            │
├──────────────┬──────────────┬──────────────┬────────────────┤
│   Students   │   Suppliers  │Pantry Workers│    Admin       │
└──────┬───────┴──────┬───────┴──────┬───────┴────┬───────────┘
       │              │              │            │
       └──────────────┴──────────────┴────────────┘
                      │
       ┌──────────────▼───────────────┐
       │     Frontend (React)         │
       │  - Web App                   │
       │  - Mobile App (React Native) │
       └──────────────┬───────────────┘
                      │
                      │ HTTPS/REST
                      │
       ┌──────────────▼───────────────┐
       │   Backend (Node.js/Express)  │
       │  - API Routes                │
       │  - Authentication            │
       │  - Business Logic            │
       └──────┬───────┬───────┬───────┘
              │       │       │
      ┌───────▼─┐ ┌───▼────┐ ┌▼──────────┐
      │PostgreSQL│ │  DTL   │ │   Aptos   │
      │ Database │ │ Layer  │ │Blockchain │
      └──────────┘ └────────┘ └───────────┘
```

## Component Details

### 1. Frontend Layer

**Web Application (React)**
- Pages: Login, Register, Dashboards, Inventory, Voting, Allocations, Analytics
- State Management: React hooks
- Styling: Tailwind CSS
- Routing: React Router
- API Client: Axios

**Mobile Application (React Native)**
- Cross-platform (iOS/Android)
- Shared codebase with web where possible
- Native features: Push notifications, camera

### 2. Backend Layer

**API Server (Node.js/Express)**
- RESTful API design
- JWT authentication
- Role-based access control
- Rate limiting & security middleware
- Request validation

**Routes:**
- `/auth` - Authentication
- `/users` - User management
- `/inventory` - Inventory operations
- `/voting` - Student voting
- `/allocations` - Allocation management
- `/suppliers` - Supplier operations
- `/analytics` - Analytics & reporting
- `/nft` - NFT tracking

### 3. Data Layer

**PostgreSQL Database**

Tables:
- `users` - User accounts
- `inventory` - Food inventory
- `votes` - Student votes
- `allocations` - Food allocations
- `nft_records` - NFT tracking
- `analytics_events` - Event logging
- `compliance_logs` - Compliance tracking

**Data Translation Layer (DTL)**

Responsibilities:
- POAS calculation
- Inventory normalization
- Data validation
- Compliance checking

**POAS Algorithm:**
- Voting engagement (25%)
- Vote priority (20%)
- Need factor (25%)
- Redemption rate (15%)
- Recency (10%)
- Equity (5%)

### 4. Blockchain Layer

**Aptos Smart Contracts (Move)**

Three NFT collections:

1. **Governance NFTs**
   - Minted when students vote
   - Stored in BNI custodial wallet
   - Tracks participation

2. **Allocation NFTs**
   - Represents food claim rights
   - Minted after Council approval
   - Burned upon redemption

3. **Supplier NFTs**
   - Tracks donations
   - Immutable audit trail
   - Compliance records

**Custodial Wallet (BNI)**
- Holds all NFTs
- Signs all blockchain transactions
- Students never handle private keys

## Data Flow

### Student Voting Flow

```
1. Student submits vote (Frontend)
   ↓
2. Backend validates & stores vote (Database)
   ↓
3. Backend calls blockchain to mint Governance NFT (Aptos)
   ↓
4. DTL aggregates votes for POAS calculation
   ↓
5. Council reviews POAS recommendations
   ↓
6. Backend creates allocations
   ↓
7. Backend mints Allocation NFTs (Aptos)
   ↓
8. Students notified (Push notification)
```

### Supplier Donation Flow

```
1. Supplier lists inventory (Frontend)
   ↓
2. DTL normalizes data
   ↓
3. Backend validates & stores (Database)
   ↓
4. Backend mints Supplier NFT (Aptos)
   ↓
5. Inventory appears in student view
```

### Allocation Redemption Flow

```
1. Pantry worker scans QR/enters allocation ID
   ↓
2. Backend verifies allocation status
   ↓
3. Backend marks as redeemed (Database)
   ↓
4. Backend burns/marks Allocation NFT (Aptos)
   ↓
5. Confirmation sent to student
```

## Security Architecture

### Authentication
- JWT tokens (7-day expiration)
- OAuth2 integration (CalPoly SSO)
- Refresh token rotation

### Authorization
- Role-based access control (RBAC)
- Route-level middleware
- Resource ownership checks

### Data Security
- PostgreSQL prepared statements (SQL injection prevention)
- Input validation (express-validator)
- Rate limiting (100 req/15min)
- CORS configuration
- Helmet.js security headers

### Blockchain Security
- BNI custodial wallet (single authority)
- Private key encryption
- Transaction signing verification
- Audit logs for all NFT operations

## Scalability Considerations

### Horizontal Scaling
- Stateless backend (can run multiple instances)
- Load balancer (Nginx)
- Database connection pooling

### Caching Strategy
- Redis for session management
- API response caching
- Static asset CDN

### Database Optimization
- Indexed columns (user, inventory, allocations)
- Query optimization
- Read replicas for analytics

### Blockchain Optimization
- Batch NFT minting where possible
- Off-chain data storage (IPFS for metadata)
- Gas optimization in Move contracts

## Monitoring & Logging

### Application Logs
- Winston logger (info, error, debug levels)
- Structured JSON logging
- Log rotation

### Metrics
- API response times
- Database query performance
- Error rates
- User engagement

### Alerts
- Database connection failures
- Blockchain transaction failures
- High error rates
- Unusual activity patterns

## Backup & Recovery

### Database Backups
- Daily automated backups
- Point-in-time recovery
- Backup retention: 30 days

### Smart Contract Recovery
- Immutable on-chain
- Admin functions for emergency pause
- Upgrade path via proxy pattern (if needed)

### Data Recovery
- Transaction logs for audit
- Event sourcing for critical operations
- Disaster recovery plan

## Development Workflow

### Local Development
```bash
# Start PostgreSQL
# Start backend: cd backend && npm run dev
# Start frontend: cd frontend && npm start
# Start DTL: cd dtl && npm run dev
```

### Testing
- Unit tests: Jest
- Integration tests: Supertest
- E2E tests: Cypress (planned)
- Smart contract tests: Aptos CLI

### CI/CD
- GitHub Actions (recommended)
- Automated testing
- Linting & code quality checks
- Automated deployments

## Technology Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React, Tailwind CSS, Axios |
| Mobile | React Native, Expo |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Blockchain | Aptos (Move language) |
| Authentication | JWT, OAuth2 |
| Caching | Redis (recommended) |
| Logging | Winston |
| Testing | Jest, Supertest |
| Deployment | PM2, Docker (optional) |

