import { aptos, GOVERNANCE_NFT_MODULE, ALLOCATION_NFT_MODULE, SUPPLIER_NFT_MODULE } from './aptos';
import { checkGasBalance, getPetraWallet, waitForTransactionWithTimeout } from './wallet-helpers';

/**
 * ==========================================
 * STUDENT FUNCTIONS - Governance NFTs
 * ==========================================
 */

/**
 * Mint Governance NFT when student votes
 */
export const mintGovernanceNFT = async (itemType, itemName, priority) => {
  const petra = getPetraWallet();
  const account = await petra.account();
  
  console.log("🗳️ Minting Governance NFT for vote...");
  console.log("Item:", itemName, "Type:", itemType, "Priority:", priority);
  
  // Check balance first
  await checkGasBalance(account.address);
  
  const payload = {
    type: "entry_function_payload",
    function: `${GOVERNANCE_NFT_MODULE}::mint_governance_nft`,
    type_arguments: [],
    arguments: [
      account.address,
      itemType,
      itemName
    ],
  };
  
  try {
    console.log("📤 Submitting transaction...");
    const response = await petra.signAndSubmitTransaction(payload);
    console.log("✅ Transaction hash:", response.hash);
    
    await waitForTransactionWithTimeout(response.hash);
    console.log("🎉 Governance NFT minted successfully!");
    
    return response;
  } catch (error) {
    console.error("❌ Governance NFT minting failed:", error);
    throw error;
  }
};

/**
 * Get student's Governance NFT count
 */
export const getGovernanceNFTCount = async (studentAddress) => {
  try {
    // This would query the blockchain for NFT count
    // Implementation depends on your Move contract structure
    const resources = await aptos.getAccountResources({ accountAddress: studentAddress });
    
    // Find governance NFT resource
    const nftResource = resources.find(r => r.type.includes('governance_nft'));
    
    if (nftResource) {
      return nftResource.data.count || 0;
    }
    
    return 0;
  } catch (error) {
    console.error("Failed to get Governance NFT count:", error);
    return 0;
  }
};

/**
 * ==========================================
 * SUPPLIER FUNCTIONS - Supplier NFTs
 * ==========================================
 */

/**
 * Mint Supplier NFT when supplier donates food
 */
export const mintSupplierNFT = async (itemName, quantity, donationType, complianceNotes) => {
  const petra = getPetraWallet();
  const account = await petra.account();
  
  console.log("📦 Minting Supplier NFT for donation...");
  console.log("Item:", itemName, "Quantity:", quantity);
  
  // Check balance first
  await checkGasBalance(account.address);
  
  const payload = {
    type: "entry_function_payload",
    function: `${SUPPLIER_NFT_MODULE}::mint_supplier_nft`,
    type_arguments: [],
    arguments: [
      account.address,
      itemName,
      quantity.toString(),
      donationType,
      complianceNotes
    ],
  };
  
  try {
    console.log("📤 Submitting transaction...");
    const response = await petra.signAndSubmitTransaction(payload);
    console.log("✅ Transaction hash:", response.hash);
    
    await waitForTransactionWithTimeout(response.hash);
    console.log("🎉 Supplier NFT minted successfully!");
    
    return response;
  } catch (error) {
    console.error("❌ Supplier NFT minting failed:", error);
    throw error;
  }
};

/**
 * ==========================================
 * PANTRY WORKER FUNCTIONS - Allocation NFTs
 * ==========================================
 */

/**
 * Mint Allocation NFT after Council approval
 */
export const mintAllocationNFT = async (studentAddress, itemName, quantity, poasScore) => {
  const petra = getPetraWallet();
  const account = await petra.account();
  
  console.log("🎟️ Minting Allocation NFT...");
  console.log("Student:", studentAddress);
  console.log("Item:", itemName, "Quantity:", quantity, "POAS:", poasScore);
  
  // Check balance first
  await checkGasBalance(account.address);
  
  // Convert POAS to integer (multiply by 100 for precision)
  const poasInt = Math.round(poasScore * 100);
  
  const payload = {
    type: "entry_function_payload",
    function: `${ALLOCATION_NFT_MODULE}::mint_allocation_nft`,
    type_arguments: [],
    arguments: [
      studentAddress,
      itemName,
      quantity.toString(),
      poasInt.toString()
    ],
  };
  
  try {
    console.log("📤 Submitting transaction...");
    const response = await petra.signAndSubmitTransaction(payload);
    console.log("✅ Transaction hash:", response.hash);
    
    await waitForTransactionWithTimeout(response.hash);
    console.log("🎉 Allocation NFT minted successfully!");
    
    return response;
  } catch (error) {
    console.error("❌ Allocation NFT minting failed:", error);
    throw error;
  }
};

/**
 * Batch mint Allocation NFTs for multiple students
 */
export const batchMintAllocationNFTs = async (allocations) => {
  const petra = getPetraWallet();
  const account = await petra.account();
  
  console.log(`🎟️ Batch minting ${allocations.length} Allocation NFTs...`);
  
  // Check balance first
  await checkGasBalance(account.address);
  
  const studentAddresses = allocations.map(a => a.studentAddress);
  const itemNames = allocations.map(a => a.itemName);
  const quantities = allocations.map(a => a.quantity.toString());
  const poasScores = allocations.map(a => Math.round(a.poasScore * 100).toString());
  
  const payload = {
    type: "entry_function_payload",
    function: `${ALLOCATION_NFT_MODULE}::batch_mint_allocation_nfts`,
    type_arguments: [],
    arguments: [
      studentAddresses,
      itemNames,
      quantities,
      poasScores
    ],
  };
  
  try {
    console.log("📤 Submitting batch transaction...");
    const response = await petra.signAndSubmitTransaction(payload);
    console.log("✅ Transaction hash:", response.hash);
    
    await waitForTransactionWithTimeout(response.hash, 60000); // Longer timeout for batch
    console.log("🎉 Batch Allocation NFTs minted successfully!");
    
    return response;
  } catch (error) {
    console.error("❌ Batch Allocation NFT minting failed:", error);
    throw error;
  }
};

/**
 * Redeem (burn) Allocation NFT when student picks up food
 */
export const redeemAllocationNFT = async (tokenId, studentAddress) => {
  const petra = getPetraWallet();
  const account = await petra.account();
  
  console.log("🔥 Redeeming Allocation NFT...");
  console.log("Token ID:", tokenId, "Student:", studentAddress);
  
  // Check balance first
  await checkGasBalance(account.address);
  
  const payload = {
    type: "entry_function_payload",
    function: `${ALLOCATION_NFT_MODULE}::redeem_allocation_nft`,
    type_arguments: [],
    arguments: [
      tokenId,
      studentAddress
    ],
  };
  
  try {
    console.log("📤 Submitting transaction...");
    const response = await petra.signAndSubmitTransaction(payload);
    console.log("✅ Transaction hash:", response.hash);
    
    await waitForTransactionWithTimeout(response.hash);
    console.log("🎉 Allocation NFT redeemed and burned!");
    
    return response;
  } catch (error) {
    console.error("❌ Allocation NFT redemption failed:", error);
    throw error;
  }
};

/**
 * ==========================================
 * QUERY FUNCTIONS
 * ==========================================
 */

/**
 * Get all NFTs owned by an address
 */
export const getNFTsForAddress = async (address) => {
  try {
    const resources = await aptos.getAccountResources({ accountAddress: address });
    
    // Filter for FFQ NFT resources
    const governanceNFTs = resources.filter(r => r.type.includes('governance_nft'));
    const allocationNFTs = resources.filter(r => r.type.includes('allocation_nft'));
    const supplierNFTs = resources.filter(r => r.type.includes('supplier_nft'));
    
    return {
      governance: governanceNFTs,
      allocation: allocationNFTs,
      supplier: supplierNFTs
    };
  } catch (error) {
    console.error("Failed to fetch NFTs:", error);
    return { governance: [], allocation: [], supplier: [] };
  }
};

/**
 * Get transaction details
 */
export const getTransactionDetails = async (txHash) => {
  try {
    const transaction = await aptos.getTransactionByHash({ transactionHash: txHash });
    return transaction;
  } catch (error) {
    console.error("Failed to get transaction details:", error);
    return null;
  }
};

