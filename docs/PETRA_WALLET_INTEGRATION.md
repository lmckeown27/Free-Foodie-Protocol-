# Petra Wallet Integration Guide

## Overview

The Free Foodie Quest (FFQ) platform has integrated **Petra Wallet** for secure blockchain interactions on the Aptos network. This integration enables students, suppliers, and pantry workers to interact with smart contracts, mint NFTs, and manage on-chain transactions.

---

## Table of Contents

1. [Installation](#installation)
2. [Architecture](#architecture)
3. [User Flow](#user-flow)
4. [Developer Guide](#developer-guide)
5. [API Reference](#api-reference)
6. [Troubleshooting](#troubleshooting)

---

## Installation

### Prerequisites

- **Petra Wallet Browser Extension**: Users must install Petra from [https://petra.app/](https://petra.app/)
- **Aptos Devnet Access**: The platform currently operates on Aptos Devnet
- **Test APT**: Users need devnet APT for gas fees (get from [Aptos Faucet](https://aptoslabs.com/testnet-faucet))

### Dependencies Installed

The following npm packages have been added to the frontend:

```json
{
  "@aptos-labs/ts-sdk": "^5.1.1",
  "@aptos-labs/wallet-adapter-react": "latest",
  "petra-plugin-wallet-adapter": "latest",
  "@pontem/wallet-adapter-plugin": "latest",
  "@martianwallet/aptos-wallet-adapter": "latest",
  "fewcha-plugin-wallet-adapter": "latest"
}
```

---

## Architecture

### Component Structure

```
frontend/
├── src/
│   ├── lib/
│   │   ├── aptos.js              # Aptos SDK configuration
│   │   ├── wallet-helpers.js     # Wallet utility functions
│   │   └── ffq-contracts.js      # FFQ smart contract interactions
│   ├── contexts/
│   │   ├── WalletProvider.js     # Multi-wallet adapter provider
│   │   └── DirectWalletContext.js # Direct Petra integration context
│   └── components/
│       └── WalletConnect.js      # UI component for wallet connection
```

### Wallet Providers

**Two layers of wallet integration:**

1. **WalletProvider** (`@aptos-labs/wallet-adapter-react`)
   - Multi-wallet support (Petra, Pontem, Martian, Fewcha)
   - Official Aptos adapter
   - Used for compatibility

2. **DirectWalletProvider** (Custom)
   - Direct Petra integration
   - More control over connection state
   - Auto-reconnect functionality
   - Persistent connection via localStorage

---

## User Flow

### 1. Connect Wallet

**User Action:**
- Clicks "Connect Petra Wallet" button
- Browser extension popup appears
- User approves connection

**Technical Flow:**
```javascript
// DirectWalletContext.js
const connectWallet = async () => {
  const petra = window.aptos;
  const response = await petra.connect();
  setAddress(response.address);
  setConnected(true);
  localStorage.setItem("ffqWalletConnected", "true");
};
```

### 2. Sign Transactions

**User Action:**
- Student votes on item → triggers Governance NFT mint
- Supplier donates food → triggers Supplier NFT mint
- Pantry Worker approves allocation → triggers Allocation NFT mint

**Technical Flow:**
```javascript
// ffq-contracts.js
export const mintGovernanceNFT = async (itemType, itemName, priority) => {
  const petra = getPetraWallet();
  const account = await petra.account();
  
  // Check balance
  await checkGasBalance(account.address);
  
  // Construct payload
  const payload = {
    type: "entry_function_payload",
    function: `${GOVERNANCE_NFT_MODULE}::mint_governance_nft`,
    arguments: [account.address, itemType, itemName],
  };
  
  // Sign and submit
  const response = await petra.signAndSubmitTransaction(payload);
  await waitForTransactionWithTimeout(response.hash);
  
  return response;
};
```

### 3. Transaction Confirmation

**User sees:**
- Loading state during transaction submission
- Success notification with transaction hash
- Link to Aptos Explorer for details

---

## Developer Guide

### Configuration

Create a `.env` file in the `frontend/` directory:

```env
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_APTOS_NETWORK=devnet
REACT_APP_MODULE_ADDRESS=0x_your_deployed_contract_address
```

### Using the Wallet Context

```javascript
import { useDirectWallet } from '../contexts/DirectWalletContext';

function YourComponent() {
  const { 
    connected, 
    address, 
    connectWallet, 
    disconnectWallet,
    wallet 
  } = useDirectWallet();
  
  if (!connected) {
    return <button onClick={connectWallet}>Connect Wallet</button>;
  }
  
  return (
    <div>
      <p>Connected: {address}</p>
      <button onClick={disconnectWallet}>Disconnect</button>
    </div>
  );
}
```

### Making Contract Calls

```javascript
import { mintGovernanceNFT } from '../lib/ffq-contracts';

// In your component
const handleVote = async (itemType, itemName) => {
  try {
    const tx = await mintGovernanceNFT(itemType, itemName, priority);
    console.log("Transaction hash:", tx.hash);
    alert("Vote successful! Governance NFT minted.");
  } catch (error) {
    console.error("Vote failed:", error);
    alert(`Error: ${error.message}`);
  }
};
```

### Error Handling

Common error scenarios and handling:

```javascript
try {
  await mintGovernanceNFT(...);
} catch (error) {
  if (error.message.includes("Insufficient APT")) {
    alert("You need APT for gas fees. Get devnet APT from faucet.");
  } else if (error.message.includes("User rejected")) {
    alert("Transaction was cancelled.");
  } else if (error.message.includes("timeout")) {
    alert("Transaction confirmation timeout. Check Aptos Explorer.");
  } else {
    alert(`Transaction failed: ${error.message}`);
  }
}
```

---

## API Reference

### Wallet Helper Functions

#### `checkGasBalance(walletAddress)`
Verifies wallet has sufficient APT for gas fees.

```javascript
const balance = await checkGasBalance("0x123...");
// Returns: balance in APT (throws error if < 0.001 APT)
```

#### `getPetraWallet()`
Gets the Petra wallet instance from `window.aptos`.

```javascript
const petra = getPetraWallet();
const account = await petra.account();
```

#### `formatAddress(address, startLength, endLength)`
Formats wallet address for display.

```javascript
const display = formatAddress("0x1234567890abcdef", 6, 4);
// Returns: "0x1234...cdef"
```

#### `getExplorerTxUrl(txHash, network)`
Returns Aptos Explorer URL for transaction.

```javascript
const url = getExplorerTxUrl(txHash, "devnet");
// Returns: "https://explorer.aptoslabs.com/txn/0x...?network=devnet"
```

### Contract Functions

#### Student Functions

**`mintGovernanceNFT(itemType, itemName, priority)`**
Mints Governance NFT when student votes.

```javascript
const tx = await mintGovernanceNFT("produce", "Apples", 5);
```

**`getGovernanceNFTCount(studentAddress)`**
Returns number of Governance NFTs owned.

```javascript
const count = await getGovernanceNFTCount("0x123...");
```

#### Supplier Functions

**`mintSupplierNFT(itemName, quantity, donationType, complianceNotes)`**
Mints Supplier NFT when supplier donates.

```javascript
const tx = await mintSupplierNFT(
  "Fresh Apples",
  50,
  "produce",
  "VLCP compliant, temp checked"
);
```

#### Pantry Worker Functions

**`mintAllocationNFT(studentAddress, itemName, quantity, poasScore)`**
Mints Allocation NFT for approved student.

```javascript
const tx = await mintAllocationNFT(
  "0x123...",
  "Apples",
  5,
  0.85
);
```

**`batchMintAllocationNFTs(allocations)`**
Batch mints multiple Allocation NFTs.

```javascript
const allocations = [
  { studentAddress: "0x123...", itemName: "Apples", quantity: 5, poasScore: 0.85 },
  { studentAddress: "0x456...", itemName: "Bread", quantity: 2, poasScore: 0.92 }
];

const tx = await batchMintAllocationNFTs(allocations);
```

**`redeemAllocationNFT(tokenId, studentAddress)`**
Redeems (burns) Allocation NFT when student picks up food.

```javascript
const tx = await redeemAllocationNFT("token_123", "0x123...");
```

#### Query Functions

**`getNFTsForAddress(address)`**
Gets all FFQ NFTs owned by address.

```javascript
const nfts = await getNFTsForAddress("0x123...");
// Returns: { governance: [...], allocation: [...], supplier: [...] }
```

**`getTransactionDetails(txHash)`**
Gets transaction details from blockchain.

```javascript
const txDetails = await getTransactionDetails("0xabc...");
```

---

## Troubleshooting

### Issue: "Petra wallet not detected"

**Solution:**
1. Install Petra extension from [petra.app](https://petra.app/)
2. Refresh the page
3. Click "Connect Petra Wallet" again

### Issue: "Insufficient APT for transaction fees"

**Solution:**
1. Visit [Aptos Devnet Faucet](https://aptoslabs.com/testnet-faucet)
2. Enter your wallet address
3. Request devnet APT
4. Wait for confirmation
5. Retry transaction

### Issue: "Transaction confirmation timeout"

**Solution:**
- Transaction may still be pending
- Check [Aptos Explorer](https://explorer.aptoslabs.com/?network=devnet)
- Search for your transaction hash
- If successful, the blockchain state is updated (safe to ignore timeout)

### Issue: "User rejected the request"

**Solution:**
- User cancelled the transaction in Petra popup
- Click the action again to retry

### Issue: "Module not found" or "Function not found"

**Solution:**
- Ensure smart contracts are deployed to devnet
- Verify `REACT_APP_MODULE_ADDRESS` in `.env` matches deployed address
- Check that contract functions exist in Move modules

### Issue: "Network mismatch"

**Solution:**
1. Open Petra wallet
2. Click network dropdown (top right)
3. Select "Devnet"
4. Refresh FFQ page

---

## Security Best Practices

### For Users

1. **Never share your private key or seed phrase**
2. **Verify transaction details before signing**
3. **Only connect to trusted applications**
4. **Use Petra's built-in security features**

### For Developers

1. **Always validate transaction payloads**
2. **Check gas balance before submitting transactions**
3. **Implement proper error handling**
4. **Use timeout mechanisms for transaction confirmation**
5. **Never store private keys in code or localStorage**
6. **Validate user input before constructing contract calls**

---

## Next Steps

### Phase 2: Multi-Sig Integration (Upcoming)

Petra Vault multi-sig support for Pantry Workers:
- Requires 2-of-3 approvals for critical operations
- Enhanced security for fund management
- Transparent governance

### Phase 3: NFT Gallery (Upcoming)

Display NFTs in user dashboards:
- Governance NFT collection view
- Allocation NFT history
- Supplier donation badges

---

## Resources

- [Petra Wallet Docs](https://petra.app/docs)
- [Aptos SDK Docs](https://aptos.dev/sdks/ts-sdk)
- [Aptos Explorer](https://explorer.aptoslabs.com)
- [Aptos Devnet Faucet](https://aptoslabs.com/testnet-faucet)
- [FFQ Smart Contracts](../smart-contracts/)

---

## Support

For technical support or questions:
- Check this documentation first
- Review error messages in browser console
- Check Aptos Explorer for transaction details
- Contact FFQ development team

---

**Last Updated:** November 1, 2025  
**Version:** 1.0.0  
**Network:** Aptos Devnet

