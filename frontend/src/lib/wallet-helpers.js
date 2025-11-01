import { aptos } from './aptos';

/**
 * Check if wallet has enough APT for gas fees
 */
export const checkGasBalance = async (walletAddress) => {
  try {
    const resources = await aptos.getAccountResources({ accountAddress: walletAddress });
    const coinResource = resources.find((r) => 
      r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
    );
    
    if (coinResource) {
      const balance = parseInt(coinResource.data.coin.value) / 100000000; // Convert octas to APT
      
      console.log("💰 APT Balance:", balance, "APT");
      
      if (balance < 0.001) {
        throw new Error(
          `Insufficient APT for transaction fees. Balance: ${balance} APT. ` +
          `Get free APT from Aptos Devnet faucet: https://aptoslabs.com/testnet-faucet`
        );
      }
      
      return balance;
    }
    
    throw new Error("Could not fetch wallet balance");
  } catch (error) {
    console.error("⚠️ Balance check error:", error);
    throw error;
  }
};

/**
 * Wait for transaction confirmation with timeout
 */
export const waitForTransactionWithTimeout = async (txHash, timeoutMs = 30000) => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeoutMs) {
    try {
      await aptos.waitForTransaction({ transactionHash: txHash });
      console.log("✅ Transaction confirmed:", txHash);
      return true;
    } catch (error) {
      if (Date.now() - startTime >= timeoutMs) {
        throw new Error(`Transaction confirmation timeout: ${txHash}`);
      }
      // Wait 1 second before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  throw new Error(`Transaction confirmation timeout: ${txHash}`);
};

/**
 * Get Petra wallet instance
 */
export const getPetraWallet = () => {
  const petra = window.aptos;
  if (!petra) {
    throw new Error("Petra wallet not found. Please install the Petra browser extension.");
  }
  return petra;
};

/**
 * Format wallet address for display
 */
export const formatAddress = (address, startLength = 6, endLength = 4) => {
  if (!address) return "";
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

/**
 * Get explorer URL for transaction
 */
export const getExplorerTxUrl = (txHash, network = "devnet") => {
  return `https://explorer.aptoslabs.com/txn/${txHash}?network=${network}`;
};

/**
 * Get explorer URL for account
 */
export const getExplorerAccountUrl = (address, network = "devnet") => {
  return `https://explorer.aptoslabs.com/account/${address}?network=${network}`;
};

