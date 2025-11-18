# Free Foodie Protocol - System Interactions

## Overview
The Free Foodie Protocol is a three-way interaction system between Students, Suppliers, and the Pantry. Each role has specific responsibilities and ways to interact with the other roles.

---

## Core User Roles

### 1. **Student**
**Primary Goal:** Earn Allocation Tickets to request food

**How Students Earn Allocation Tickets (ONLY 2 Ways):**
1. **Vote on Governance Proposals** - Earn 1 ticket per vote (created by Pantry)
2. **Complete Volunteer Opportunities** - Earn 1-2 tickets per shift (requires Pantry approval)

**Key Capabilities:**
- Browse available food inventory
- Vote on governance proposals (created by Pantry only)
- Sign up for and complete volunteer opportunities (created by Suppliers)
- Request food using Allocation Tickets
- Track Allocation Ticket balance

**Simplified Navigation:**
- **Dashboard** - Prominent ticket balance display + clear calls-to-action for the 2 ways to earn tickets
- **Earn Tickets Section:**
  - "Vote on Proposals" (Governance page)
  - "Volunteer Opportunities" (Volunteering page)
- **Use Tickets Section:**
  - "Request Food" (My Food page)
- **How This Works** (help page explaining the process)

**Removed/Simplified:**
- ~~My Credentials~~ (ticket balance now prominently shown on Dashboard and Volunteering page)
- ~~My Analytics~~ (removed to focus on core earning/using activities)

---

### 2. **Supplier**
**Primary Goals:** Distribute food donations and recruit volunteers

**Key Capabilities:**
- Donate food to the Pantry
- Track donation history
- Create volunteering opportunities for students
- Mark volunteer work as complete
- Notify Pantry when students complete volunteer work
- View approval status from Pantry for ticket issuance

**Pages:**
- Dashboard
- Add Donation (primary action - green button)
- Donation History
- Volunteering (create & manage opportunities)

**Important Limitation:** Suppliers CANNOT issue Allocation Tickets directly. They can only notify the Pantry of volunteer completion.

---

### 3. **Pantry**
**Primary Goals:** Manage food distribution and coordinate supply chain

**Key Capabilities:**
- Manage food inventory (governance-approved items only)
- Create governance proposals (ONLY role that can create proposals)
- View POAS-based supply recommendations
- Allocate food to students based on ticket balances
- **Receive volunteer completion notifications from Suppliers**
- **Approve or deny Allocation Ticket issuance** (ONLY Pantry can issue tickets)
- Track system-wide metrics and analytics
- Manage blockchain credentials (minimal terminology)

**Pages:**
- Dashboard (includes volunteer completion notifications)
- Create Proposal (exclusive to Pantry)
- Manage Inventory (organized by category tabs)
- Supply Planning (POAS-based ordering recommendations)
- System Analytics
- Credential Management (blockchain backend)

**Exclusive Control:** Only the Pantry can issue Allocation Tickets. This prevents abuse and maintains system integrity.

---

## System Interaction Flows

### Flow 1: Food Distribution Chain (Ticket-Based Request System)
```
Supplier → Pantry → Student Views Ticket Balance → Student Requests Food → Pantry Approves → Student Picks Up → Item Disappears

1. Supplier donates food via "Add Donation"
2. Food enters Pantry inventory system
3. Pantry manages and organizes inventory by category
4. Student views available food on "Request Food" page (shows ticket balance prominently)
5. Student uses 1 Allocation Ticket to request a specific food item
6. Ticket is consumed immediately; request shows as "pending"
7. Pantry reviews and approves request (usually within 24 hours)
8. Request status changes to "approved" - Student receives QR code
9. Student comes to Pantry and shows QR code for pickup
10. Pantry confirms pickup → Item automatically disappears from student's "My Requests"
11. Digital receipt NFT issued to student (backend)
```

**Key Pages Involved:**
- Supplier: `/add-donation`, `/donation-history`
- Pantry: `/inventory`, student request review & approval system
- Student: `/my-food` (Request Food page - displays ticket balance, browse food, request with tickets, track requests)

**Critical Flow Details:**
- ✅ Ticket balance displayed prominently on Request Food page
- ✅ Students MUST have ≥1 Allocation Ticket to request food
- ✅ Each food request consumes 1 ticket immediately (no refunds)
- ✅ Requests show two states: "pending" (awaiting approval) and "approved" (ready for pickup)
- ✅ **Items automatically disappear** from student's view once Pantry confirms pickup
- ✅ Students can view ticket balance on: Dashboard, Volunteering page, and Request Food page

---

### Flow 2: Volunteering & Ticket Earning
```
Supplier ↔ Student → Supplier → Pantry (decision) → Student

1. Supplier creates volunteering opportunity via "Volunteering"
2. Opportunity appears on Student "Volunteering" page
3. Student signs up for opportunity
4. Supplier sees signup in their volunteering dashboard
5. Student completes volunteer work
6. Supplier marks work as "Complete & Notify Pantry"
7. Pantry receives notification: "Student X completed Job Y"
8. Pantry reviews the completion notification
9. Pantry decides to approve or deny ticket issuance
10. If approved: Student receives Allocation Ticket
11. Student can now use ticket to request food from Pantry
```

**Key Pages Involved:**
- Supplier: `/supplier-volunteering` (can notify, cannot issue tickets)
- Student: `/volunteering`
- Pantry: Dashboard notifications + ticket approval system

**Important:** 
- Supplier can ONLY notify the Pantry of completion
- Pantry has FINAL decision on whether to issue tickets
- This prevents abuse and maintains Pantry's control over the credential system

**Terminology:**
- Student/Supplier see: "Allocation Tickets" (no blockchain terms)
- Pantry sees: Minimal blockchain terminology for credential management

---

### Flow 3: Governance & Voting
```
Pantry → Student → Pantry (feedback loop)

1. Pantry creates governance proposal via "Create Proposal"
   - Add new food types
   - Update policies
   - Change allocation rules
2. Proposal appears on Student "Governance" page
3. Students vote on proposals
4. Each vote earns student 1 Allocation Ticket
5. Votes are tallied (Yes/No)
6. Passed proposals become active
7. New food types approved through governance enter inventory system
```

**Key Pages Involved:**
- Pantry: `/create-proposal`
- Student: `/governance`, `/vote`

**Important:** Only Pantry can create proposals. Students can only vote.

---

### Flow 4: Supply Planning (POAS System)
```
Student Demand → Pantry Analysis → Supplier Orders

1. Students vote on food preferences in Governance
2. Students volunteer and engage with the system
3. Pantry views "Supply Planning" page with POAS scores
4. POAS scores show which food items are in highest demand:
   - Critical Priority (POAS 85+)
   - High Priority (POAS 70-84)
   - Medium Priority (POAS 50-69)
   - Low Priority (POAS 30-49)
   - Optional (POAS <30)
5. Pantry uses this data to determine what to order from Suppliers
6. Pantry contacts Suppliers to request high-demand items
```

**POAS Score Components (Pantry view only):**
- Student Demand/Votes (35%)
- Redemption Rate (25%)
- Urgency/Stock Levels (20%)
- Trending Activity (20%)

**Key Pages Involved:**
- Student: `/governance` (voting creates demand data)
- Pantry: `/allocations` (Supply Planning tab with 5 priority tabs)
- Supplier: Receives orders based on Pantry's analysis

---

### Flow 5: Allocation Ticket Economy
```
Multiple Sources → Pantry Approval → Student Ticket Balance → Food Requests

Sources of Allocation Tickets (ALL issued by Pantry):
1. Volunteering: 
   - Student completes volunteer shift with Supplier
   - Supplier notifies Pantry of completion
   - Pantry reviews and approves ticket issuance (1-2 tickets per shift)
2. Governance: 
   - Student votes on proposal
   - Pantry system automatically issues 1 ticket per vote

Using Allocation Tickets:
1. Student accumulates tickets from volunteering + voting (all Pantry-issued)
2. Student views ticket balance on "Volunteering" page
3. Student uses tickets to request food items
4. Pantry processes requests based on ticket availability
5. Student receives allocated food
```

**Ticket Balance Visibility:**
- Student: Sees ticket balance prominently on Volunteering page
- Supplier: Sees when completion notifications are sent; sees Pantry approval status
- Pantry: Controls ALL ticket issuance; sees student ticket balances when allocating food

**Key Control:** Only the Pantry can issue Allocation Tickets. Suppliers can only notify.

---

## Page Navigation Map

### Student Navigation
```
Dashboard (overview)
├── My Food (browse available food)
├── Governance (vote on proposals, earn tickets)
├── Volunteering (browse opportunities, earn tickets)
│   └── Shows ticket balance
├── My Credentials (view earned tickets)
└── My Analytics (personal stats)
```

### Supplier Navigation
```
Dashboard (overview)
├── Add Donation ⭐ (primary action)
├── Donation History (track contributions)
└── Volunteering (create opportunities, issue tickets)
```

### Pantry Navigation
```
Dashboard (system overview)
├── Create Proposal ⭐ (exclusive capability)
├── Manage Inventory (category-organized food)
├── Supply Planning (5 POAS priority tabs)
│   ├── Critical Priority
│   ├── High Priority
│   ├── Medium Priority
│   ├── Low Priority
│   └── Optional
├── System Analytics (metrics)
└── Credential Management (blockchain backend)
```

---

## Key System Rules

### Governance
- ✅ Only Pantry can create proposals
- ✅ Students can vote on proposals
- ✅ Each vote earns 1 Allocation Ticket
- ✅ All food items in inventory must be governance-approved

### Inventory
- ✅ Food items are text/token representations
- ✅ Created through Pantry governance proposals
- ✅ Organized by category tabs (Produce, Protein, Dairy, etc.)
- ✅ Suppliers donate these pre-approved food types

### Volunteering
- ✅ Only Suppliers can create volunteering opportunities
- ✅ Students sign up and complete volunteer work
- ✅ Suppliers mark work complete and NOTIFY Pantry
- ✅ Pantry reviews and decides whether to issue tickets
- ✅ Students earn 1-2 tickets per volunteer shift (if Pantry approves)

### Allocation Tickets
- ✅ ONLY Pantry can issue Allocation Tickets
- ✅ Suppliers can only notify Pantry of volunteer completion
- ✅ Earned through volunteering (Pantry-approved) and voting (automatic)
- ✅ Used to request food from Pantry
- ✅ Students see simple "ticket" terminology
- ✅ Suppliers see simple "ticket" terminology + notification/approval status
- ✅ Pantry controls all ticket issuance (minimal blockchain terminology)

### Supply Planning (POAS)
- ✅ Only Pantry can view POAS scores
- ✅ Students cannot see POAS scores (not individualized)
- ✅ POAS is calculated per food item, not per student
- ✅ Based on collective student demand and engagement
- ✅ Helps Pantry decide what to order from Suppliers

---

## Technology Stack (User-Facing)

### Student Experience
- **Terminology:** Allocation Tickets, Food Requests, Volunteering
- **No Blockchain Terms:** Simple credit/ticket system
- **Focus:** Earning tickets and accessing food

### Supplier Experience
- **Terminology:** Donations, Volunteering, Ticket Issuance
- **No Blockchain Terms:** Straightforward volunteer management
- **Focus:** Distributing food and recruiting volunteers

### Pantry Experience
- **Terminology:** Governance, Inventory, Supply Planning, POAS
- **Minimal Blockchain Terms:** Credential Management (backend only)
- **Focus:** System coordination and supply chain optimization

---

## Current Routes

### Student Routes
- `/dashboard` - Student dashboard
- `/my-food` - Food inventory browser
- `/governance` - Governance proposals voting
- `/vote` - Voting interface
- `/volunteering` - Browse & signup for opportunities
- `/credentials` - View earned credentials/tickets
- `/student-analytics` - Personal analytics

### Supplier Routes
- `/dashboard` - Supplier dashboard
- `/add-donation` - Create food donation
- `/donation-history` - View past donations
- `/supplier-volunteering` - Manage volunteer opportunities

### Pantry Routes
- `/dashboard` - Pantry dashboard
- `/create-proposal` - Create governance proposal
- `/inventory` - Manage inventory (category tabs)
- `/allocations` - Supply Planning (5 POAS priority tabs)
- `/analytics` - System analytics
- `/credential-management` - Blockchain credential backend

### Shared Routes
- `/how-it-works` - Platform documentation
- `/login` - Authentication
- `/register` - User registration

---

## Data Flow Summary

### What Flows Where

**Supplier → Pantry:**
- Food donations
- Volunteer opportunity data

**Pantry → Student:**
- Food allocations
- Governance proposals
- Available food inventory
- Allocation Tickets (upon approval of volunteer completion)

**Student → Pantry:**
- Governance votes
- Food demand signals (via POAS)
- Ticket-based food requests

**Supplier → Student:**
- Volunteering opportunities

**Student → Supplier:**
- Volunteer signups
- Completed volunteer work

**Supplier → Pantry:**
- Completion notifications (which student completed which job)

**Pantry → Supplier:**
- Supply Planning recommendations (what to stock)
- Order requests based on POAS analysis

---

## Future Integration Points

### Pending Features (From TODO list)
1. Food request system for Students using tickets (UI needed)
2. Voting system auto-issuing tickets (backend integration)
3. Pantry allocation system considering ticket balances (backend integration)
4. Backend API connections for all mock data currently in pages

---

## Summary

The Free Foodie Protocol creates a closed-loop system where:
1. **Suppliers** provide food and volunteer opportunities, notify Pantry of volunteer completions
2. **Students** engage through volunteering and governance, earning tickets (issued by Pantry)
3. **Pantry** coordinates the system, controls all ticket issuance, and uses student demand data to optimize supply

**Key Control Point:** The Pantry is the ONLY entity that can issue Allocation Tickets. This ensures:
- System integrity and prevents abuse
- Fair distribution of food access
- Centralized credential management
- Quality control over volunteer completion claims

All three roles are interdependent, creating a sustainable food distribution ecosystem driven by student engagement and Pantry oversight.

