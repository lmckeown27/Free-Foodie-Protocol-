import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

// Configure Aptos client
const aptosConfig = new AptosConfig({
  network: Network.DEVNET, // Start with devnet for testing
});

export const aptos = new Aptos(aptosConfig);

// Module address from environment or placeholder
export const MODULE_ADDRESS = process.env.REACT_APP_MODULE_ADDRESS || "0x_module_address_placeholder";

// FFQ Contract module names
export const GOVERNANCE_NFT_MODULE = `${MODULE_ADDRESS}::governance_nft`;
export const ALLOCATION_NFT_MODULE = `${MODULE_ADDRESS}::allocation_nft`;
export const SUPPLIER_NFT_MODULE = `${MODULE_ADDRESS}::supplier_nft`;

// Helper to get Aptos network
export const getNetwork = () => {
  return Network.DEVNET;
};

// Helper to get explorer URL for transaction
export const getExplorerUrl = (txHash) => {
  return `https://explorer.aptoslabs.com/txn/${txHash}?network=devnet`;
};

