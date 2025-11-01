# Free Foodie Quest - API Documentation

Base URL: `http://localhost:5000/api/v1`

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user.

**Body:**
```json
{
  "email": "student@calpoly.edu",
  "first_name": "John",
  "last_name": "Doe",
  "role": "student",
  "calpoly_id": "123456789",
  "phone": "555-0123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

#### POST /auth/login
Login user.

**Body:**
```json
{
  "email": "student@calpoly.edu"
}
```

### Users

#### GET /users/profile
Get current user profile (Protected).

#### PUT /users/profile
Update user profile (Protected).

#### GET /users
Get all users (Admin/PantryWorker only).

### Inventory

#### GET /inventory
Get available inventory.

**Query Parameters:**
- `status`: available|allocated|redeemed
- `item_type`: produce|dairy|meat|etc
- `limit`: number (default: 50)
- `offset`: number (default: 0)

#### POST /inventory
Add inventory item (Supplier only).

**Body:**
```json
{
  "item_name": "Bananas",
  "item_type": "produce",
  "quantity": 50,
  "unit": "lbs",
  "expiration_date": "2024-12-31",
  "location": "Main Pantry",
  "handling_notes": "Keep refrigerated"
}
```

### Voting

#### POST /voting/vote
Submit a vote (Student only).

**Body:**
```json
{
  "item_type": "produce",
  "item_name": "Bananas",
  "priority": 5
}
```

#### GET /voting/my-votes
Get current user's votes (Student only).

#### GET /voting/results
Get voting results.

#### GET /voting/trending
Get trending items (last 7 days).

### Allocations

#### GET /allocations
Get allocations.

**Query Parameters:**
- `status`: pending|approved|redeemed|expired
- `student_id`: UUID (admin/pantry only)
- `limit`: number
- `offset`: number

#### POST /allocations
Create allocation (PantryWorker only).

**Body:**
```json
{
  "student_id": "uuid",
  "inventory_id": "uuid",
  "quantity": 10,
  "poas_score": 85.5
}
```

#### PUT /allocations/:id/redeem
Redeem allocation (PantryWorker only).

#### GET /allocations/my-allocations
Get current student's allocations (Student only).

### Analytics

#### GET /analytics/dashboard
Get dashboard analytics (Admin/PantryWorker only).

#### GET /analytics/demand
Get demand analytics.

**Query Parameters:**
- `days`: number (default: 30)

#### GET /analytics/inventory-health
Get inventory health metrics (Admin/PantryWorker only).

#### GET /analytics/student-engagement
Get student engagement metrics (Admin/PantryWorker only).

#### GET /analytics/compliance
Get compliance metrics (Admin/PantryWorker only).

### NFTs

#### GET /nft/my-nfts
Get current user's NFTs.

#### GET /nft/:nft_id
Get NFT details.

#### GET /nft/type/:nft_type
Get NFTs by type (governance|allocation|supplier).

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

### Common Error Codes

- `400`: Bad Request - Invalid input
- `401`: Unauthorized - Invalid/missing token
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource not found
- `500`: Internal Server Error - Server error

## Rate Limiting

- 100 requests per 15 minutes per IP
- Applies to all `/api/` endpoints

## Pagination

List endpoints support pagination:

```json
{
  "success": true,
  "count": 50,
  "data": [...]
}
```

Use `limit` and `offset` query parameters to paginate.

