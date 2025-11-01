# FFQ Wallet API Quick Reference

**Version:** 1.0.0  
**Network:** Aptos Devnet  
**Last Updated:** November 1, 2025

---

## Table of Contents

- [Import Statements](#import-statements)
- [Wallet Context](#wallet-context)
- [Contract Functions](#contract-functions)
- [Helper Functions](#helper-functions)
- [Error Handling](#error-handling)
- [Code Examples](#code-examples)

---

## Import Statements

```javascript
// Wallet context
import { useDirectWallet } from '../contexts/DirectWalletContext';

// Contract functions
import {
  mintGovernanceNFT,
  mintSupplierNFT,
  mintAllocationNFT,
  batchMintAllocationNFTs,
  redeemAllocationNFT,
  getGovernanceNFTCount,
  getNFTsForAddress,
  getTransactionDetails
} from '../lib/ffq-contracts';

// Helper functions
import {
  checkGasBalance,
  getPetraWallet,
  formatAddress,
  waitForTransactionWithTimeout,
  getExplorerTxUrl,
  getExplorerAccountUrl
} from '../lib/wallet-helpers';

// Aptos SDK
import { aptos, MODULE_ADDRESS } from '../lib/aptos';
```

---

## Wallet Context

### `useDirectWallet()`

**Description:** React hook for accessing wallet state and functions.

**Returns:**
```typescript
{
  connected: boolean,
  address: string,
  petraInstalled: boolean,
  connectWallet: () => Promise<void>,
  disconnectWallet: () => Promise<void>,
  wallet: PetraWallet | null,
  getAccount: () => { address: string } | null
}
```

**Example:**
```javascript
function MyComponent() {
  const { connected, address, connectWallet, disconnectWallet } = useDirectWallet();
  
  if (!connected) {
    return <button onClick={connectWallet}>Connect</button>;
  }
  
  return (
    <div>
      <p>Address: {formatAddress(address)}</p>
      <button onClick={disconnectWallet}>Disconnect</button>
    </div>
  );
}
```

---

## Contract Functions

### Student Functions

#### `mintGovernanceNFT(itemType, itemName, priority)`

**Description:** Mints Governance NFT when student votes.

**Parameters:**
- `itemType` (string): Type of item (e.g., "produce", "protein", "grain")
- `itemName` (string): Name of item (e.g., "Apples", "Chicken")
- `priority` (number): Vote priority (1-5)

**Returns:** `Promise<{ hash: string }>`

**Example:**
```javascript
try {
  const tx = await mintGovernanceNFT("produce", "Apples", 5);
  console.log("Transaction hash:", tx.hash);
  alert("Governance NFT minted!");
} catch (error) {
  console.error("Minting failed:", error);
}
```

---

#### `getGovernanceNFTCount(studentAddress)`

**Description:** Gets count of Governance NFTs owned by student.

**Parameters:**
- `studentAddress` (string): Student's wallet address

**Returns:** `Promise<number>`

**Example:**
```javascript
const count = await getGovernanceNFTCount("0x123...");
console.log(`Student has ${count} Governance NFTs`);
```

---

### Supplier Functions

#### `mintSupplierNFT(itemName, quantity, donationType, complianceNotes)`

**Description:** Mints Supplier NFT when supplier donates food.

**Parameters:**
- `itemName` (string): Name of donated item
- `quantity` (number): Quantity donated
- `donationType` (string): Type (e.g., "produce", "protein")
- `complianceNotes` (string): VLCP compliance notes

**Returns:** `Promise<{ hash: string }>`

**Example:**
```javascript
try {
  const tx = await mintSupplierNFT(
    "Fresh Apples",
    50,
    "produce",
    "VLCP compliant - temp checked, handled properly"
  );
  console.log("Supplier NFT minted:", tx.hash);
} catch (error) {
  console.error("Donation failed:", error);
}
```

---

### Pantry Worker Functions

#### `mintAllocationNFT(studentAddress, itemName, quantity, poasScore)`

**Description:** Mints Allocation NFT for approved student.

**Parameters:**
- `studentAddress` (string): Student's wallet address
- `itemName` (string): Allocated item name
- `quantity` (number): Quantity allocated
- `poasScore` (number): POAS score (0.0 - 1.0)

**Returns:** `Promise<{ hash: string }>`

**Example:**
```javascript
try {
  const tx = await mintAllocationNFT(
    "0x123...",
    "Apples",
    5,
    0.85
  );
  console.log("Allocation NFT minted:", tx.hash);
} catch (error) {
  console.error("Allocation failed:", error);
}
```

---

#### `batchMintAllocationNFTs(allocations)`

**Description:** Batch mints multiple Allocation NFTs.

**Parameters:**
- `allocations` (Array): Array of allocation objects

**Allocation Object:**
```typescript
{
  studentAddress: string,
  itemName: string,
  quantity: number,
  poasScore: number
}
```

**Returns:** `Promise<{ hash: string }>`

**Example:**
```javascript
const allocations = [
  { 
    studentAddress: "0x123...", 
    itemName: "Apples", 
    quantity: 5, 
    poasScore: 0.85 
  },
  { 
    studentAddress: "0x456...", 
    itemName: "Bread", 
    quantity: 2, 
    poasScore: 0.92 
  }
];

try {
  const tx = await batchMintAllocationNFTs(allocations);
  console.log(`Minted ${allocations.length} NFTs:`, tx.hash);
} catch (error) {
  console.error("Batch minting failed:", error);
}
```

---

#### `redeemAllocationNFT(tokenId, studentAddress)`

**Description:** Redeems (burns) Allocation NFT when student picks up food.

**Parameters:**
- `tokenId` (string): NFT token ID
- `studentAddress` (string): Student's wallet address

**Returns:** `Promise<{ hash: string }>`

**Example:**
```javascript
try {
  const tx = await redeemAllocationNFT("token_123", "0x123...");
  console.log("Allocation redeemed:", tx.hash);
} catch (error) {
  console.error("Redemption failed:", error);
}
```

---

### Query Functions

#### `getNFTsForAddress(address)`

**Description:** Gets all FFQ NFTs owned by address.

**Parameters:**
- `address` (string): Wallet address to query

**Returns:**
```typescript
Promise<{
  governance: Array<NFT>,
  allocation: Array<NFT>,
  supplier: Array<NFT>
}>
```

**Example:**
```javascript
const nfts = await getNFTsForAddress("0x123...");
console.log("Governance NFTs:", nfts.governance.length);
console.log("Allocation NFTs:", nfts.allocation.length);
console.log("Supplier NFTs:", nfts.supplier.length);
```

---

#### `getTransactionDetails(txHash)`

**Description:** Gets transaction details from blockchain.

**Parameters:**
- `txHash` (string): Transaction hash

**Returns:** `Promise<Transaction>`

**Example:**
```javascript
const tx = await getTransactionDetails("0xabc...");
console.log("Gas used:", tx.gas_used);
console.log("Status:", tx.success);
console.log("Timestamp:", tx.timestamp);
```

---

## Helper Functions

### `checkGasBalance(walletAddress)`

**Description:** Checks if wallet has sufficient APT for gas.

**Parameters:**
- `walletAddress` (string): Wallet address to check

**Returns:** `Promise<number>` (balance in APT)

**Throws:** Error if balance < 0.001 APT

**Example:**
```javascript
try {
  const balance = await checkGasBalance("0x123...");
  console.log(`Balance: ${balance} APT`);
} catch (error) {
  console.error("Insufficient gas:", error.message);
  // Error includes faucet link
}
```

---

### `getPetraWallet()`

**Description:** Gets Petra wallet instance from `window.aptos`.

**Returns:** `PetraWallet`

**Throws:** Error if Petra not installed

**Example:**
```javascript
try {
  const petra = getPetraWallet();
  const account = await petra.account();
  console.log("Wallet address:", account.address);
} catch (error) {
  console.error("Petra not found:", error.message);
}
```

---

### `formatAddress(address, startLength, endLength)`

**Description:** Formats wallet address for display.

**Parameters:**
- `address` (string): Full wallet address
- `startLength` (number, optional): Characters to show at start (default: 6)
- `endLength` (number, optional): Characters to show at end (default: 4)

**Returns:** `string`

**Example:**
```javascript
const full = "0x1234567890abcdef1234567890abcdef";
const short = formatAddress(full);
// Returns: "0x1234...cdef"

const custom = formatAddress(full, 8, 6);
// Returns: "0x123456...abcdef"
```

---

### `waitForTransactionWithTimeout(txHash, timeoutMs)`

**Description:** Waits for transaction confirmation with timeout.

**Parameters:**
- `txHash` (string): Transaction hash
- `timeoutMs` (number, optional): Timeout in milliseconds (default: 30000)

**Returns:** `Promise<boolean>`

**Throws:** Error on timeout

**Example:**
```javascript
try {
  await waitForTransactionWithTimeout(txHash, 60000); // 60 second timeout
  console.log("Transaction confirmed!");
} catch (error) {
  console.error("Confirmation timeout:", error.message);
  // Transaction may still succeed - check explorer
}
```

---

### `getExplorerTxUrl(txHash, network)`

**Description:** Returns Aptos Explorer URL for transaction.

**Parameters:**
- `txHash` (string): Transaction hash
- `network` (string, optional): Network name (default: "devnet")

**Returns:** `string`

**Example:**
```javascript
const url = getExplorerTxUrl("0xabc...", "devnet");
// Returns: "https://explorer.aptoslabs.com/txn/0xabc...?network=devnet"

// Use in JSX
<a href={url} target="_blank">View on Explorer</a>
```

---

### `getExplorerAccountUrl(address, network)`

**Description:** Returns Aptos Explorer URL for account.

**Parameters:**
- `address` (string): Wallet address
- `network` (string, optional): Network name (default: "devnet")

**Returns:** `string`

**Example:**
```javascript
const url = getExplorerAccountUrl("0x123...", "devnet");
// Returns: "https://explorer.aptoslabs.com/account/0x123...?network=devnet"
```

---

## Error Handling

### Common Error Types

#### 1. Wallet Not Found
```javascript
try {
  const petra = getPetraWallet();
} catch (error) {
  if (error.message.includes("not found")) {
    alert("Please install Petra wallet extension");
    window.open("https://petra.app/", "_blank");
  }
}
```

#### 2. Insufficient Gas
```javascript
try {
  await checkGasBalance(address);
} catch (error) {
  if (error.message.includes("Insufficient APT")) {
    alert("Get APT from faucet: https://aptoslabs.com/testnet-faucet");
  }
}
```

#### 3. User Rejection
```javascript
try {
  const tx = await mintGovernanceNFT(...);
} catch (error) {
  if (error.message.includes("User rejected")) {
    console.log("Transaction cancelled by user");
    // Don't show error - user intentionally cancelled
  }
}
```

#### 4. Network Error
```javascript
try {
  await waitForTransactionWithTimeout(txHash);
} catch (error) {
  if (error.message.includes("timeout")) {
    const explorerUrl = getExplorerTxUrl(txHash);
    alert(`Confirmation timeout. Check explorer: ${explorerUrl}`);
  }
}
```

#### 5. Contract Error
```javascript
try {
  const tx = await mintGovernanceNFT(...);
} catch (error) {
  if (error.message.includes("Module not found")) {
    console.error("Smart contract not deployed");
    alert("Contract not available on this network");
  } else if (error.message.includes("Function not found")) {
    console.error("Contract function missing");
    alert("Contract version mismatch");
  }
}
```

---

## Code Examples

### Complete Voting Flow (Student)

```javascript
import { useDirectWallet } from '../contexts/DirectWalletContext';
import { mintGovernanceNFT } from '../lib/ffq-contracts';
import { getExplorerTxUrl } from '../lib/wallet-helpers';

function VotingComponent() {
  const { connected, address, connectWallet } = useDirectWallet();
  const [loading, setLoading] = useState(false);
  
  const handleVote = async (itemType, itemName, priority) => {
    if (!connected) {
      alert("Please connect your wallet first");
      return;
    }
    
    setLoading(true);
    
    try {
      // Mint Governance NFT
      const tx = await mintGovernanceNFT(itemType, itemName, priority);
      
      // Show success with explorer link
      const explorerUrl = getExplorerTxUrl(tx.hash);
      alert(`Vote successful! View transaction: ${explorerUrl}`);
      
      // Refresh dashboard
      await refreshData();
      
    } catch (error) {
      if (error.message.includes("Insufficient APT")) {
        alert("Get APT from: https://aptoslabs.com/testnet-faucet");
      } else if (error.message.includes("User rejected")) {
        console.log("User cancelled transaction");
      } else {
        alert(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };
  
  if (!connected) {
    return <button onClick={connectWallet}>Connect Wallet to Vote</button>;
  }
  
  return (
    <div>
      <p>Connected: {formatAddress(address)}</p>
      <button 
        onClick={() => handleVote("produce", "Apples", 5)}
        disabled={loading}
      >
        {loading ? "Processing..." : "Vote for Apples"}
      </button>
    </div>
  );
}
```

---

### Complete Donation Flow (Supplier)

```javascript
import { mintSupplierNFT } from '../lib/ffq-contracts';
import { useDirectWallet } from '../contexts/DirectWalletContext';

function DonationForm() {
  const { connected, connectWallet } = useDirectWallet();
  const [formData, setFormData] = useState({
    itemName: '',
    quantity: 0,
    donationType: '',
    complianceNotes: ''
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!connected) {
      alert("Please connect your wallet");
      return;
    }
    
    try {
      const tx = await mintSupplierNFT(
        formData.itemName,
        formData.quantity,
        formData.donationType,
        formData.complianceNotes
      );
      
      alert(`Donation recorded! TX: ${tx.hash}`);
      
      // Reset form
      setFormData({
        itemName: '',
        quantity: 0,
        donationType: '',
        complianceNotes: ''
      });
      
    } catch (error) {
      alert(`Donation failed: ${error.message}`);
    }
  };
  
  if (!connected) {
    return (
      <div>
        <p>Connect wallet to submit donations</p>
        <button onClick={connectWallet}>Connect Petra Wallet</button>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit">Submit Donation</button>
    </form>
  );
}
```

---

### Complete Allocation Flow (Pantry Worker)

```javascript
import { batchMintAllocationNFTs } from '../lib/ffq-contracts';
import { useDirectWallet } from '../contexts/DirectWalletContext';

function AllocationApproval({ pendingAllocations }) {
  const { connected } = useDirectWallet();
  const [loading, setLoading] = useState(false);
  
  const handleBatchApprove = async () => {
    if (!connected) {
      alert("Connect wallet to approve allocations");
      return;
    }
    
    setLoading(true);
    
    try {
      // Format allocations for batch minting
      const allocations = pendingAllocations.map(alloc => ({
        studentAddress: alloc.student_wallet,
        itemName: alloc.item_name,
        quantity: alloc.quantity,
        poasScore: alloc.poas_score
      }));
      
      // Batch mint Allocation NFTs
      const tx = await batchMintAllocationNFTs(allocations);
      
      alert(`Approved ${allocations.length} allocations! TX: ${tx.hash}`);
      
      // Update backend
      await markAllocationsApproved(allocations);
      
      // Refresh data
      await refreshDashboard();
      
    } catch (error) {
      alert(`Approval failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <h2>Pending Allocations: {pendingAllocations.length}</h2>
      <button 
        onClick={handleBatchApprove}
        disabled={loading || !connected}
      >
        {loading ? "Approving..." : "Approve All"}
      </button>
    </div>
  );
}
```

---

## TypeScript Definitions

```typescript
// Wallet Context Types
interface DirectWalletContextType {
  connected: boolean;
  address: string;
  petraInstalled: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  wallet: PetraWallet | null;
  getAccount: () => { address: string } | null;
}

// Transaction Response
interface TransactionResponse {
  hash: string;
  sender?: string;
  success?: boolean;
}

// NFT Types
interface NFT {
  id: string;
  owner: string;
  type: 'governance' | 'allocation' | 'supplier';
  metadata: any;
}

// Allocation Object
interface Allocation {
  studentAddress: string;
  itemName: string;
  quantity: number;
  poasScore: number;
}
```

---

## Environment Variables

```env
# Required
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_APTOS_NETWORK=devnet

# After contract deployment
REACT_APP_MODULE_ADDRESS=0x_your_deployed_contract_address
```

---

## Additional Resources

- **Full Integration Guide:** `docs/PETRA_WALLET_INTEGRATION.md`
- **Quick Start Guide:** `docs/WALLET_QUICKSTART.md`
- **Aptos SDK Docs:** [aptos.dev/sdks/ts-sdk](https://aptos.dev/sdks/ts-sdk)
- **Petra Docs:** [petra.app/docs](https://petra.app/docs)

---

**Last Updated:** November 1, 2025  
**Maintainer:** FFQ Development Team

