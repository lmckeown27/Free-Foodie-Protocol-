# Free Foodie Quest - Deployment Guide

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Aptos CLI
- Git

## Environment Setup

### 1. Backend Configuration

Create `/backend/.env` file:

```env
# Server
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ffq_database

# JWT
JWT_SECRET=your_secure_jwt_secret_here
JWT_EXPIRES_IN=7d

# Aptos
APTOS_NETWORK=devnet
APTOS_NODE_URL=https://fullnode.devnet.aptoslabs.com/v1
BNI_WALLET_PRIVATE_KEY=your_private_key
BNI_WALLET_ADDRESS=your_wallet_address

# OAuth2 (CalPoly SSO)
OAUTH_CLIENT_ID=your_client_id
OAUTH_CLIENT_SECRET=your_client_secret
OAUTH_CALLBACK_URL=https://your-domain.com/api/v1/auth/callback

# CORS
CORS_ORIGIN=https://your-frontend-domain.com
```

### 2. Frontend Configuration

Create `/frontend/.env`:

```env
REACT_APP_API_URL=https://your-backend-domain.com/api/v1
```

### 3. DTL Configuration

Create `/dtl/.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/ffq_database
LOG_LEVEL=info
```

## Database Setup

1. Create PostgreSQL database:

```bash
createdb ffq_database
```

2. Run migrations:

```bash
cd backend
npm run db:setup
```

## Smart Contract Deployment

1. Initialize Aptos account (if needed):

```bash
cd smart-contracts
aptos init --network devnet
```

2. Compile contracts:

```bash
aptos move compile
```

3. Publish to Aptos:

```bash
aptos move publish --named-addresses ffq=YOUR_ADDRESS
```

4. Initialize contracts:

```bash
# Initialize Governance NFT
aptos move run --function-id 'YOUR_ADDRESS::governance_nft::initialize'

# Initialize Allocation NFT
aptos move run --function-id 'YOUR_ADDRESS::allocation_nft::initialize'

# Initialize Supplier NFT
aptos move run --function-id 'YOUR_ADDRESS::supplier_nft::initialize'
```

## Application Deployment

### Backend

```bash
cd backend
npm install --production
npm start
```

Or with PM2:

```bash
pm2 start src/server.js --name ffq-backend
```

### Frontend

```bash
cd frontend
npm install
npm run build

# Serve static files with Nginx or similar
```

### DTL

```bash
cd dtl
npm install --production
npm start
```

Or with PM2:

```bash
pm2 start src/index.js --name ffq-dtl
```

## Production Checklist

- [ ] Database backups configured
- [ ] SSL/TLS certificates installed
- [ ] Environment variables secured
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Monitoring setup (e.g., Prometheus, Grafana)
- [ ] Error tracking setup (e.g., Sentry)
- [ ] API documentation deployed
- [ ] Smart contracts audited
- [ ] Load balancer configured (if needed)

## Monitoring

### Backend Health Check

```bash
curl https://your-backend-domain.com/health
```

Expected response:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "v1"
}
```

### Database Connection

```bash
cd backend
node -e "require('./src/config/database').query('SELECT NOW()')"
```

### Aptos Connection

```bash
cd backend
node -e "require('./src/config/aptos').client.getAccount('YOUR_ADDRESS')"
```

## Troubleshooting

### Database Connection Issues

- Check PostgreSQL is running: `pg_isready`
- Verify connection string in `.env`
- Check firewall rules

### Aptos Connection Issues

- Verify network in `.env` (devnet/testnet/mainnet)
- Check node URL is accessible
- Ensure wallet has sufficient APT for gas

### Frontend Build Issues

- Clear node_modules: `rm -rf node_modules && npm install`
- Check React version compatibility
- Verify API URL in `.env`

## Scaling Considerations

### Database

- Enable connection pooling (already configured)
- Consider read replicas for analytics
- Set up automated backups

### Backend

- Use load balancer (nginx, HAProxy)
- Deploy multiple instances
- Enable Redis for session management

### DTL

- Run POAS calculations asynchronously
- Use job queue (Bull, BeeQueue)
- Cache frequently accessed data

## Security Best Practices

1. **API Security**
   - Use HTTPS only
   - Implement rate limiting
   - Validate all inputs
   - Use prepared statements (already implemented)

2. **Blockchain Security**
   - Secure BNI custodial wallet private key
   - Use hardware wallet for production
   - Audit smart contracts before deployment

3. **Database Security**
   - Use strong passwords
   - Enable SSL connections
   - Restrict network access
   - Regular security updates

## Support

For issues or questions:
- Check logs: `tail -f backend/logs/combined.log`
- Review error logs: `tail -f backend/logs/error.log`
- Contact BNI development team

## Updates

To update the application:

1. Pull latest code: `git pull origin main`
2. Update dependencies: `npm install`
3. Run migrations: `npm run db:migrate`
4. Restart services: `pm2 restart all`
5. Verify deployment: Check health endpoints

