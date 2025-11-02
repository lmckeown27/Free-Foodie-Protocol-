# Backend Data Flow Connections

## Overview
Yes! All three dashboards (Student, Pantry Worker, Supplier) **ARE fully connected** through the backend API. Below is a complete breakdown of the data flows between roles.

---

## 🔄 Data Flow Diagram

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│             │         │              │         │              │
│   SUPPLIER  │────────▶│    PANTRY    │◀────────│   STUDENT    │
│             │         │    WORKER    │         │              │
└─────────────┘         └──────────────┘         └──────────────┘
      │                        │                        │
      │                        │                        │
      └────────────────────────┼────────────────────────┘
                               │
                               ▼
                   ┌───────────────────────┐
                   │   BACKEND API SERVER  │
                   │   (PostgreSQL DB)     │
                   └───────────────────────┘
```

---

## 1️⃣ Supplier → Pantry Worker

### **Flow**: Suppliers donate food that Pantry Workers receive and manage

**Supplier Actions:**
- **POST** `/api/v1/inventory` - Add new donation
  ```javascript
  inventoryAPI.addInventory({
    item_name, item_type, quantity, unit,
    expiration_date, location, handling_notes
  })
  ```
- **GET** `/api/v1/suppliers/:id/donations` - View their donation history
- **GET** `/api/v1/suppliers/:id/stats` - View their impact stats

**Pantry Worker Receives:**
- **GET** `/api/v1/inventory` - See ALL inventory (including supplier donations)
- **GET** `/api/v1/analytics/inventory-health` - See inventory status
  - `available_items` (from suppliers)
  - `expiring_soon` (from suppliers)
  - `expired_items` (from suppliers)
- **GET** `/api/v1/analytics/dashboard` - See overall stats including supplier data

**Database Tables Involved:**
- `inventory` - Stores all donations with `supplier_id` foreign key
- `supplier_nfts` - Tracks NFT receipts for donations

✅ **STATUS: FULLY CONNECTED**

---

## 2️⃣ Student → Pantry Worker

### **Flow**: Students vote on items and create allocations that Pantry Workers manage

**Student Actions:**
- **POST** `/api/v1/voting/vote` - Vote on desired items
  ```javascript
  votingAPI.submitVote({
    item_type, preference_level
  })
  ```
- **GET** `/api/v1/voting/my-votes` - View their voting history
- **GET** `/api/v1/voting/trending` - View trending votes

**Pantry Worker Receives:**
- **GET** `/api/v1/allocations?status=approved` - See all student allocations
- **GET** `/api/v1/voting/results` - See voting results from students
- **GET** `/api/v1/analytics/dashboard` - See student count and engagement
- **GET** `/api/v1/analytics/demand` - See demand patterns from student votes
- **GET** `/api/v1/analytics/student-engagement` - See student participation metrics

**Database Tables Involved:**
- `votes` - Stores all student votes with `student_id` foreign key
- `allocations` - Stores allocation requests with `student_id` foreign key
- `users` - Stores student profiles

✅ **STATUS: FULLY CONNECTED**

---

## 3️⃣ Pantry Worker → Student

### **Flow**: Pantry Workers approve allocations that Students can claim

**Pantry Worker Actions:**
- **POST** `/api/v1/allocations` - Create allocations for students
- **PUT** `/api/v1/allocations/:id/redeem` - Mark allocation as redeemed when student picks up
- **GET** `/api/v1/allocations` - View all allocations (to manage)

**Student Receives:**
- **GET** `/api/v1/allocations/my-allocations` - See their approved allocations
  - Filters for `status === 'approved'` allocations
  - Shows POAS scores assigned by pantry system
  - Shows which items are ready for pickup

**Database Tables Involved:**
- `allocations` - Stores allocations with:
  - `student_id` (who gets it)
  - `inventory_id` (what item)
  - `status` (pending/approved/redeemed)
  - `poas_score` (fairness algorithm score)

✅ **STATUS: FULLY CONNECTED**

---

## 4️⃣ Pantry Worker → Supplier

### **Flow**: Pantry Workers redeem inventory which updates Supplier's donation tracking

**Pantry Worker Actions:**
- **PUT** `/api/v1/allocations/:id/redeem` - Redeem allocation (updates inventory)
- **PUT** `/api/v1/inventory/:id` - Update inventory status

**Supplier Receives:**
- **GET** `/api/v1/suppliers/:id/donations` - See donation status updates
  - `status`: `available` → `allocated` → `redeemed`
  - Tracks where their donated food went
  - Shows impact of their donations

**Database Tables Involved:**
- `inventory` - Status changes from `available` → `allocated` → `redeemed`
- `allocations` - Links inventory to students
- `supplier_nfts` - NFT metadata updates with redemption info

✅ **STATUS: FULLY CONNECTED**

---

## 🔗 Shared Backend Resources

All three dashboards share these common backend services:

### **Authentication & Authorization**
- **POST** `/api/v1/auth/login` - All roles login
- **POST** `/api/v1/auth/register` - All roles register
- **Middleware**: `auth.js` - Verifies JWT tokens for all requests

### **User Management**
- **GET** `/api/v1/users/profile` - All roles can view their profile
- **PUT** `/api/v1/users/profile` - All roles can update their profile

### **NFT Tracking**
- **GET** `/api/v1/nft/my-nfts` - All roles can view their NFTs
  - Students: Governance NFTs, Allocation NFTs
  - Pantry Workers: Multi-sig vault records
  - Suppliers: Supplier NFTs (donation receipts)

---

## 📊 Database Schema Connections

### **Key Foreign Key Relationships:**

```sql
inventory
  ├── supplier_id → users(id)           [Supplier who donated]
  └── Used by allocations

allocations
  ├── student_id → users(id)            [Student who receives]
  ├── inventory_id → inventory(id)      [What they get]
  └── approved_by → users(id)           [Pantry worker who approved]

votes
  ├── student_id → users(id)            [Student who voted]
  └── Aggregated for analytics

supplier_nfts
  ├── supplier_id → users(id)           [Supplier who owns NFT]
  └── inventory_id → inventory(id)      [Associated donation]
```

---

## ✅ Data Flow Verification

### **1. Supplier → Pantry → Student (Full Loop)**
```
Supplier adds donation
  ↓
Inventory table updated (status: available)
  ↓
Pantry sees new inventory via GET /inventory
  ↓
Pantry creates allocation via POST /allocations
  ↓
Allocation table updated (status: approved)
  ↓
Student sees allocation via GET /allocations/my-allocations
  ↓
Student picks up food
  ↓
Pantry redeems via PUT /allocations/:id/redeem
  ↓
Inventory updated (status: redeemed)
  ↓
Supplier sees impact via GET /suppliers/:id/donations
```

### **2. Student → Pantry → Supplier (Demand Loop)**
```
Students vote on items
  ↓
Votes table updated
  ↓
Pantry sees demand via GET /analytics/demand
  ↓
Pantry adjusts orders/requests
  ↓
Suppliers see what's needed and donate accordingly
```

---

## 🎯 Summary

**All Required Data Flows Are Connected:**

| From → To | Use Case | API Endpoint | Status |
|-----------|----------|--------------|--------|
| Supplier → Pantry | Donate inventory | POST /inventory | ✅ |
| Pantry → Student | Approve allocations | POST /allocations | ✅ |
| Student → Pantry | Vote & claim | POST /voting/vote | ✅ |
| Pantry → Supplier | Redeem & track | PUT /allocations/:id/redeem | ✅ |

**Backend Database:** PostgreSQL with proper foreign key relationships
**API Server:** Express.js with role-based access control
**Authentication:** JWT tokens with role verification
**Data Sharing:** All data flows through shared backend APIs

---

## 🚀 Next Steps (If Needed)

While all connections exist, you may want to enhance:

1. **Real-time Updates**: Add WebSocket connections for live inventory updates
2. **Better Analytics**: Expand the analytics dashboard with more cross-role metrics
3. **Notification System**: Add alerts when:
   - Suppliers: Your donation was allocated/redeemed
   - Students: Your allocation is approved/ready
   - Pantry Workers: New donations received, expiring items
4. **Audit Trail**: Expand blockchain integration to record all state changes

---

**Last Updated:** 2025-11-02
**Status:** ✅ All three dashboards are fully connected through backend APIs

