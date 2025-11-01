# Free Foodie Quest - Quick Start Guide

Welcome to Free Foodie Quest! This guide will help you get the entire MVP up and running in minutes.

## Prerequisites

Before you begin, ensure you have:

- ✅ Node.js 18+ installed (`node --version`)
- ✅ PostgreSQL 14+ installed and running (`psql --version`)
- ✅ Aptos CLI installed (optional for local testing)
- ✅ Git installed

## Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# DTL
cd ../dtl
npm install

# Smart Contracts (optional - already compiled)
cd ../smart-contracts
# aptos move compile
```

## Step 2: Set Up Database

1. Create the database:

```bash
createdb ffq_database
```

2. Run the database setup script:

```bash
cd backend
npm run db:setup
```

This will create all necessary tables with proper schemas.

## Step 3: Configure Environment Variables

### Backend (.env)

Create `backend/.env`:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ffq_database
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DATABASE_URL=postgresql://your_db_username:your_db_password@localhost:5432/ffq_database

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Aptos (for devnet testing)
APTOS_NETWORK=devnet
APTOS_NODE_URL=https://fullnode.devnet.aptoslabs.com/v1
APTOS_FAUCET_URL=https://faucet.devnet.aptoslabs.com
BNI_WALLET_PRIVATE_KEY=0x_your_private_key_here
BNI_WALLET_ADDRESS=0x_your_wallet_address_here

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)

Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api/v1
```

### DTL (.env)

Create `dtl/.env`:

```env
DATABASE_URL=postgresql://your_db_username:your_db_password@localhost:5432/ffq_database
LOG_LEVEL=debug
```

## Step 4: Generate Aptos Wallet (Optional)

If you don't have an Aptos wallet yet:

```bash
cd smart-contracts
aptos init --network devnet
```

This will create a `.aptos/config.yaml` file with your wallet details. Copy the private key and address to your backend `.env` file.

## Step 5: Fund Your Wallet (Devnet Only)

```bash
aptos account fund-with-faucet --account YOUR_ADDRESS
```

## Step 6: Start the Application

Open 3 terminal windows:

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

Backend will start on `http://localhost:5000`

### Terminal 2 - Frontend
```bash
cd frontend
npm start
```

Frontend will start on `http://localhost:3000`

### Terminal 3 - DTL (Optional)
```bash
cd dtl
npm run dev
```

## Step 7: Access the Application

Open your browser and navigate to `http://localhost:3000`

### Create Test Accounts

1. **Student Account:**
   - Click "Register"
   - Email: `student@calpoly.edu`
   - Role: Student
   - Fill in other details

2. **Supplier Account:**
   - Click "Register"
   - Email: `supplier@calpoly.edu`
   - Role: Supplier
   - Fill in other details

3. **Pantry Worker Account:**
   - Click "Register"
   - Email: `pantry@calpoly.edu`
   - Role: Pantry Worker
   - Fill in other details

## Test the Workflow

### As a Supplier:
1. Login with supplier account
2. Add inventory items (e.g., "50 lbs of Bananas")
3. Check that Supplier NFT is minted (backend logs)

### As a Student:
1. Login with student account
2. View available inventory
3. Go to "Vote for Items"
4. Submit votes for desired items
5. Check your Governance NFT count increase

### As a Pantry Worker:
1. Login with pantry worker account
2. View analytics dashboard
3. Create allocations based on votes
4. Redeem allocations when students pick up food

## Verify Everything Works

### Check Backend
```bash
curl http://localhost:5000/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "version": "v1"
}
```

### Check Database
```bash
psql ffq_database -c "SELECT COUNT(*) FROM users;"
```

### Check Frontend
Open `http://localhost:3000` - should see the login page

## Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
pg_isready

# If not running, start it
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

### Port Already in Use
```bash
# Find and kill process using port 5000
lsof -ti:5000 | xargs kill -9

# Or change PORT in backend/.env
```

### React Build Errors
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### Aptos Connection Issues
- Make sure you're using devnet: `APTOS_NETWORK=devnet`
- Check the node URL is accessible
- Verify your wallet has APT (use faucet)

## Next Steps

Now that everything is running:

1. 📖 Read the [API Documentation](docs/API.md)
2. 🏗️ Review the [Architecture](docs/ARCHITECTURE.md)
3. 🚀 Check [Deployment Guide](docs/DEPLOYMENT.md) for production
4. 🧪 Run tests: `npm test` in backend directory

## Project Structure

```
/
├── backend/           # Node.js/Express API
│   ├── src/
│   │   ├── routes/    # API endpoints
│   │   ├── config/    # Database & Aptos config
│   │   ├── middleware/# Auth & validation
│   │   └── scripts/   # Database setup
│   └── package.json
│
├── frontend/          # React web app
│   ├── src/
│   │   ├── pages/     # Dashboard pages
│   │   ├── services/  # API client
│   │   └── styles/    # CSS
│   └── package.json
│
├── smart-contracts/   # Aptos Move contracts
│   ├── sources/       # NFT contracts
│   └── Move.toml
│
├── dtl/              # Data Translation Layer
│   ├── src/
│   │   ├── poasCalculator.js
│   │   └── inventoryNormalizer.js
│   └── package.json
│
└── docs/             # Documentation
    ├── API.md
    ├── ARCHITECTURE.md
    └── DEPLOYMENT.md
```

## Key Features Implemented

✅ **User Roles**: Students, Suppliers, Pantry Workers, Admin  
✅ **Authentication**: JWT-based with role-based access  
✅ **Inventory Management**: Full CRUD with status tracking  
✅ **Voting System**: Students vote, earn Governance NFTs  
✅ **POAS Algorithm**: Fair allocation calculation  
✅ **Allocations**: Create, approve, redeem with NFTs  
✅ **Analytics Dashboard**: Real-time metrics and insights  
✅ **Smart Contracts**: 3 NFT types on Aptos blockchain  
✅ **Custodial Wallet**: BNI-managed, no student key management  
✅ **Compliance Tracking**: VLCP compliance logging  

## Support

Having issues? Check:
- Backend logs: `backend/logs/combined.log`
- Frontend console: Browser DevTools
- Database logs: PostgreSQL logs

## Contributing

To contribute to the project:
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT License - See LICENSE file for details

---

**🎉 Congratulations! Your Free Foodie Quest MVP is now running!**

Happy coding! 🚀🍎

