const { AptosClient, AptosAccount, FaucetClient, HexString } = require('aptos');
const logger = require('../utils/logger');

// Initialize Aptos client based on network
const APTOS_NETWORK = process.env.APTOS_NETWORK || 'devnet';
const NODE_URL = process.env.APTOS_NODE_URL || 'https://fullnode.devnet.aptoslabs.com/v1';
const FAUCET_URL = process.env.APTOS_FAUCET_URL || 'https://faucet.devnet.aptoslabs.com';

const client = new AptosClient(NODE_URL);
const faucetClient = APTOS_NETWORK === 'devnet' ? new FaucetClient(NODE_URL, FAUCET_URL) : null;

// BNI Custodial Wallet
let bniAccount;
try {
  const privateKeyHex = process.env.BNI_WALLET_PRIVATE_KEY;
  if (privateKeyHex) {
    const privateKey = new HexString(privateKeyHex);
    bniAccount = new AptosAccount(privateKey.toUint8Array());
    logger.info(`BNI Custodial Wallet initialized: ${bniAccount.address().hex()}`);
  } else {
    logger.warn('BNI_WALLET_PRIVATE_KEY not set. Creating new account for development.');
    bniAccount = new AptosAccount();
    logger.info(`New BNI Account created: ${bniAccount.address().hex()}`);
    logger.info(`Private Key: ${HexString.fromUint8Array(bniAccount.signingKey.secretKey).hex()}`);
  }
} catch (error) {
  logger.error('Failed to initialize BNI account', error);
  throw error;
}

// Smart contract module addresses
const GOVERNANCE_NFT_MODULE = process.env.GOVERNANCE_NFT_MODULE || `${bniAccount.address().hex()}::governance_nft`;
const ALLOCATION_NFT_MODULE = process.env.ALLOCATION_NFT_MODULE || `${bniAccount.address().hex()}::allocation_nft`;
const SUPPLIER_NFT_MODULE = process.env.SUPPLIER_NFT_MODULE || `${bniAccount.address().hex()}::supplier_nft`;

// Helper function to check account balance
const getAccountBalance = async (accountAddress) => {
  try {
    const resources = await client.getAccountResources(accountAddress);
    const accountResource = resources.find(r => r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>');
    return accountResource ? parseInt(accountResource.data.coin.value) : 0;
  } catch (error) {
    logger.error(`Failed to get balance for ${accountAddress}`, error);
    return 0;
  }
};

// Helper function to fund account from faucet (devnet only)
const fundAccountFromFaucet = async (accountAddress) => {
  if (APTOS_NETWORK !== 'devnet' || !faucetClient) {
    throw new Error('Faucet only available on devnet');
  }
  
  try {
    await faucetClient.fundAccount(accountAddress, 100_000_000); // 1 APT
    logger.info(`Funded account ${accountAddress} from faucet`);
  } catch (error) {
    logger.error(`Failed to fund account ${accountAddress}`, error);
    throw error;
  }
};

// Helper function to wait for transaction
const waitForTransaction = async (txnHash) => {
  try {
    await client.waitForTransaction(txnHash);
    logger.info(`Transaction confirmed: ${txnHash}`);
    return true;
  } catch (error) {
    logger.error(`Transaction failed: ${txnHash}`, error);
    throw error;
  }
};

module.exports = {
  client,
  faucetClient,
  bniAccount,
  APTOS_NETWORK,
  NODE_URL,
  GOVERNANCE_NFT_MODULE,
  ALLOCATION_NFT_MODULE,
  SUPPLIER_NFT_MODULE,
  getAccountBalance,
  fundAccountFromFaucet,
  waitForTransaction
};

