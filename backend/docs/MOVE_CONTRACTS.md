# Free Foodie Quest - Move Smart Contract Interfaces

This document defines the Move smart contract interfaces needed for FFQ on Aptos blockchain.

## Contract Overview

FFQ requires four main smart contract modules:

1. **Supplier Registry** - Manages verified suppliers
2. **NFT Collections** - Manages all NFT types (Supplier, Allocation, Governance, Volunteer)
3. **Allocation System** - Handles food allocation logic
4. **Governance System** - Multi-sig proposals and voting

---

## 1. Supplier Registry Module

### Purpose
Manages supplier verification, registration, and revocation.

### Functions

#### `register_supplier`
```move
public entry fun register_supplier(
    admin: &signer,
    supplier_address: address,
    business_name: vector<u8>,
    ein: vector<u8>,
    license_number: vector<u8>,
    metadata_uri: vector<u8>
): SupplierNFT
```
**Description**: Registers a new verified supplier and mints Supplier NFT  
**Access**: Pantry wallet (admin) only  
**Emits**: `SupplierRegisteredEvent`

#### `revoke_supplier`
```move
public entry fun revoke_supplier(
    admin: &signer,
    supplier_address: address,
    reason: vector<u8>
)
```
**Description**: Revokes supplier verification  
**Access**: Pantry wallet (admin) only  
**Emits**: `SupplierRevokedEvent`

#### `get_supplier_info`
```move
public fun get_supplier_info(supplier_address: address): SupplierInfo
```
**Description**: Returns supplier registration details  
**Access**: Public (read-only)

### Structs

```move
struct SupplierInfo has store, copy, drop {
    business_name: vector<u8>,
    ein: vector<u8>,
    license_number: vector<u8>,
    registered_at: u64,
    status: u8,  // 0 = pending, 1 = active, 2 = revoked
    metadata_uri: vector<u8>
}
```

---

## 2. NFT Collections Module

### Purpose
Implements all four NFT types using Aptos Token Standard.

### Collections

#### Supplier NFTs
```move
const SUPPLIER_COLLECTION: vector<u8> = b"FFQ_Suppliers";
```

#### Allocation NFTs
```move
const ALLOCATION_COLLECTION: vector<u8> = b"FFQ_Allocations";
```

#### Governance NFTs
```move
const GOVERNANCE_COLLECTION: vector<u8> = b"FFQ_Governance";
```

#### Volunteer NFTs
```move
const VOLUNTEER_COLLECTION: vector<u8> = b"FFQ_Volunteers";
```

### Functions

#### `mint_supplier_nft`
```move
public entry fun mint_supplier_nft(
    admin: &signer,
    recipient: address,
    token_name: vector<u8>,
    description: vector<u8>,
    uri: vector<u8>,
    supplier_data: vector<u8>
): TokenId
```
**Description**: Mints Supplier NFT to custodial wallet  
**Access**: Pantry wallet only

#### `mint_allocation_nft`
```move
public entry fun mint_allocation_nft(
    admin: &signer,
    recipient: address,
    allocation_id: vector<u8>,
    student_id: vector<u8>,
    item_details: vector<u8>,
    poas_score: u64,
    quantity: u64,
    uri: vector<u8>
): TokenId
```
**Description**: Mints Allocation NFT for approved student allocation  
**Access**: Pantry wallet only

#### `mint_governance_nft`
```move
public entry fun mint_governance_nft(
    admin: &signer,
    recipient: address,
    proposal_id: vector<u8>,
    vote_data: vector<u8>,
    uri: vector<u8>
): TokenId
```
**Description**: Mints Governance NFT for student vote participation  
**Access**: Pantry wallet only

#### `mint_volunteer_nft`
```move
public entry fun mint_volunteer_nft(
    admin: &signer,
    recipient: address,
    tier: vector<u8>,  // "bronze", "silver", "gold", "platinum"
    hours: u64,
    uri: vector<u8>
): TokenId
```
**Description**: Mints Volunteer NFT for milestone achievement  
**Access**: Pantry wallet only

#### `burn_allocation_nft`
```move
public entry fun burn_allocation_nft(
    admin: &signer,
    token_id: TokenId
)
```
**Description**: Burns Allocation NFT after redemption  
**Access**: Pantry wallet only

#### `verify_nft_ownership`
```move
public fun verify_nft_ownership(
    token_id: TokenId,
    expected_owner: address
): bool
```
**Description**: Verifies NFT ownership  
**Access**: Public (read-only)

---

## 3. Allocation System Module

### Purpose
Manages food allocation logic and redemption.

### Functions

#### `create_allocation`
```move
public entry fun create_allocation(
    admin: &signer,
    allocation_id: vector<u8>,
    student_address: address,
    item_id: vector<u8>,
    quantity: u64,
    poas_score: u64,
    expiration_timestamp: u64
)
```
**Description**: Creates a food allocation record  
**Access**: Pantry wallet only  
**Emits**: `AllocationCreatedEvent`

#### `redeem_allocation`
```move
public entry fun redeem_allocation(
    admin: &signer,
    allocation_id: vector<u8>,
    token_id: TokenId
)
```
**Description**: Redeems allocation and burns NFT  
**Access**: Pantry wallet only  
**Emits**: `AllocationRedeemedEvent`

#### `get_allocation`
```move
public fun get_allocation(allocation_id: vector<u8>): AllocationInfo
```
**Description**: Returns allocation details  
**Access**: Public (read-only)

### Structs

```move
struct AllocationInfo has store, copy, drop {
    allocation_id: vector<u8>,
    student_address: address,
    item_id: vector<u8>,
    quantity: u64,
    poas_score: u64,
    created_at: u64,
    redeemed_at: u64,
    status: u8,  // 0 = pending, 1 = approved, 2 = redeemed, 3 = expired
    nft_token_id: TokenId
}
```

---

## 4. Governance System Module

### Purpose
Handles multi-sig proposals and governance voting.

### Functions

#### `create_proposal`
```move
public entry fun create_proposal(
    proposer: &signer,
    proposal_type: vector<u8>,
    description: vector<u8>,
    execution_data: vector<u8>,
    required_approvals: u8
): ProposalId
```
**Description**: Creates a governance proposal  
**Access**: Pantry wallet only  
**Emits**: `ProposalCreatedEvent`

#### `approve_proposal`
```move
public entry fun approve_proposal(
    signer: &signer,
    proposal_id: ProposalId,
    signature: vector<u8>
)
```
**Description**: Adds approval signature to proposal  
**Access**: Authorized signers only  
**Emits**: `ProposalApprovedEvent`

#### `execute_proposal`
```move
public entry fun execute_proposal(
    executor: &signer,
    proposal_id: ProposalId
)
```
**Description**: Executes an approved proposal  
**Access**: Pantry wallet only  
**Requires**: Sufficient approvals  
**Emits**: `ProposalExecutedEvent`

#### `get_proposal`
```move
public fun get_proposal(proposal_id: ProposalId): ProposalInfo
```
**Description**: Returns proposal details  
**Access**: Public (read-only)

### Structs

```move
struct ProposalInfo has store, copy, drop {
    proposal_id: ProposalId,
    proposer: address,
    proposal_type: vector<u8>,
    description: vector<u8>,
    execution_data: vector<u8>,
    required_approvals: u8,
    current_approvals: u8,
    created_at: u64,
    executed_at: u64,
    status: u8  // 0 = pending, 1 = approved, 2 = executed, 3 = rejected
}
```

---

## Access Control

### Admin (Pantry Multi-Sig Wallet)
- Register/revoke suppliers
- Mint all NFT types
- Burn allocation NFTs
- Create allocations
- Execute governance proposals

### Authorized Signers
- Approve governance proposals

### Public (Read-Only)
- Get supplier info
- Get allocation info
- Get proposal info
- Verify NFT ownership

---

## Events

### `SupplierRegisteredEvent`
```move
struct SupplierRegisteredEvent has drop, store {
    supplier_address: address,
    business_name: vector<u8>,
    timestamp: u64
}
```

### `AllocationCreatedEvent`
```move
struct AllocationCreatedEvent has drop, store {
    allocation_id: vector<u8>,
    student_address: address,
    quantity: u64,
    poas_score: u64,
    timestamp: u64
}
```

### `AllocationRedeemedEvent`
```move
struct AllocationRedeemedEvent has drop, store {
    allocation_id: vector<u8>,
    student_address: address,
    timestamp: u64
}
```

### `ProposalCreatedEvent`
```move
struct ProposalCreatedEvent has drop, store {
    proposal_id: ProposalId,
    proposer: address,
    proposal_type: vector<u8>,
    timestamp: u64
}
```

### `ProposalExecutedEvent`
```move
struct ProposalExecutedEvent has drop, store {
    proposal_id: ProposalId,
    executor: address,
    timestamp: u64
}
```

---

## Deployment

### Testnet Deployment
```bash
# Initialize Aptos CLI
aptos init --network testnet

# Compile contracts
aptos move compile --package-dir ./move/ffq-contracts

# Deploy to testnet
aptos move publish --package-dir ./move/ffq-contracts

# Initialize collections
aptos move run --function-id <MODULE_ADDRESS>::nft::initialize_collections
```

### Mainnet Deployment
```bash
# Use same process but with mainnet network
aptos init --network mainnet
aptos move publish --package-dir ./move/ffq-contracts --network mainnet
```

---

## Integration with Backend

The backend services integrate with these contracts through:

1. **aptosService.js** - Direct blockchain interaction
2. **walletService.js** - Multi-sig proposal creation and signing
3. **nftService.js** - NFT minting and burning operations
4. **reconciliationService.js** - State verification between on-chain and off-chain

### Example Integration Flow

```javascript
// Mint Supplier NFT
const mintResult = await aptosService.mintNFT({
  collectionName: 'FFQ_Suppliers',
  tokenName: `Supplier_${userId}`,
  description: `Verified Supplier: ${businessName}`,
  uri: `https://ffq.app/nft/supplier/${userId}`,
  recipientAddress: pantryWalletAddress
});

// Record in database
await pool.query(`
  INSERT INTO nft_records (nft_type, nft_id, owner_id, transaction_hash)
  VALUES ('supplier', $1, $2, $3)
`, [mintResult.tokenId, userId, mintResult.txHash]);

// Create custodial mapping
await walletService.createCustodialMapping({
  userId,
  assetType: 'supplier_nft',
  assetIdentifier: mintResult.tokenId,
  onChainAddress: pantryWalletAddress
});
```

---

## Security Considerations

1. **Admin Access**: Only Pantry multi-sig wallet can execute privileged operations
2. **Signature Verification**: All multi-sig proposals require threshold signatures
3. **NFT Custody**: All NFTs minted to Pantry custodial wallet, not individual users
4. **Immutable Records**: All on-chain events are immutable audit trail
5. **Emergency Halt**: Implement circuit breaker for emergency situations

---

## Testing

### Unit Tests
```bash
aptos move test --package-dir ./move/ffq-contracts
```

### Integration Tests
```javascript
// Test NFT minting
const result = await aptosService.mintNFT(params);
assert(result.tokenId !== null);
assert(result.txHash !== null);

// Verify ownership
const isOwner = await aptosService.verifyNFTOwnership(
  result.tokenId,
  pantryWalletAddress
);
assert(isOwner === true);
```

---

## Future Enhancements

1. **Token Economics**: Implement fungible token rewards
2. **Staking**: Allow suppliers to stake tokens for reputation
3. **Governance Weights**: On-chain calculation of voting weights
4. **Oracle Integration**: Direct DON (Decentralized Oracle Network) integration
5. **Cross-Chain Bridge**: Support for other blockchain networks

