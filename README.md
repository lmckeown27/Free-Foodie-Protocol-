# Free Foodie Quest (FFQ)

A Web2.5 food pantry platform built on Aptos blockchain for college campuses.

## Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL v14+
- Redis v6+

### Installation

```bash
# Backend
cd backend
npm install
node src/scripts/setupDatabase.js
node src/scripts/seedTestUsers.js

# Frontend
cd ../frontend
npm install

# DTL
cd ../dtl
npm install
```

### Running

```bash
# Terminal 1: Redis
redis-server

# Terminal 2: Backend
cd backend
npm run dev

# Terminal 3: Frontend
cd frontend
npm start
```

**Frontend:** http://localhost:3000  
**Backend:** http://localhost:5000/api/v1

### Test Users
- **Student:** `student@calpoly.edu` / `password123`
- **Pantry:** `pantry@calpoly.edu` / `password123`
- **Supplier:** `supplier@calpoly.edu` / `password123`

## License

MIT License
