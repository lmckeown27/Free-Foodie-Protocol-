const { pool } = require('../config/database');
const logger = require('../utils/logger');
const aptosService = require('./aptosService');
const auditService = require('./auditService');

/**
 * Wallet Service
 * Manages Pantry custodial wallet operations using Petra Vault multi-sig
 */
class WalletService {
  /**
   * Create a new Petra Vault multi-sig wallet
   * @param {string} vaultName - Name for the vault
   * @param {Array<string>} signerAddresses - Array of signer wallet addresses
   * @param {number} threshold - Number of signatures required
   * @param {string} createdBy - User ID who created the vault
   * @returns {Promise<Object>} Created wallet info
   */
  async createPantryVault({ vaultName, signerAddresses, threshold, createdBy }) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // TODO: Integrate with Petra Vault API to create actual multi-sig vault
      // For now, we'll simulate vault creation
      const vaultAddress = `0x${Math.random().toString(16).substr(2, 64)}`;
      
      const result = await client.query(`
        INSERT INTO pantry_wallets (
          wallet_address,
          wallet_type,
          vault_name,
          threshold,
          total_signers,
          signer_addresses,
          created_by,
          metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        vaultAddress,
        'petra_vault',
        vaultName,
        threshold,
        signerAddresses.length,
        JSON.stringify(signerAddresses),
        createdBy,
        JSON.stringify({
          created_via: 'ffq_backend',
          network: process.env.APTOS_NETWORK || 'testnet'
        })
      ]);
      
      await client.query('COMMIT');
      
      logger.info(`Created Pantry Vault: ${vaultAddress}`, {
        vaultName,
        threshold,
        totalSigners: signerAddresses.length
      });
      
      // Audit log
      await auditService.logBlockchainEvent({
        eventType: 'create_pantry_vault',
        actorUserId: createdBy,
        actionDescription: `Created Pantry Vault: ${vaultName}`,
        afterState: result.rows[0]
      });
      
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to create Pantry Vault', error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Get active Pantry wallet
   * @returns {Promise<Object>} Active pantry wallet
   */
  async getActivePantryWallet() {
    const result = await pool.query(`
      SELECT * FROM pantry_wallets
      WHERE status = 'active'
      ORDER BY created_at DESC
      LIMIT 1
    `);
    
    if (result.rows.length === 0) {
      throw new Error('No active Pantry wallet found');
    }
    
    return result.rows[0];
  }
  
  /**
   * Create a transaction proposal for multi-sig approval
   * @param {Object} params - Proposal parameters
   * @returns {Promise<Object>} Created proposal
   */
  async createTransactionProposal({ 
    walletId,
    proposalType, 
    transactionPayload, 
    proposedBy,
    notes 
  }) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get wallet info to determine required signatures
      const walletResult = await client.query(
        'SELECT * FROM pantry_wallets WHERE id = $1',
        [walletId]
      );
      
      if (walletResult.rows.length === 0) {
        throw new Error('Wallet not found');
      }
      
      const wallet = walletResult.rows[0];
      
      // Create proposal
      const result = await client.query(`
        INSERT INTO transaction_proposals (
          wallet_id,
          proposal_type,
          transaction_payload,
          proposed_by,
          required_signatures,
          notes,
          expiration_date
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW() + INTERVAL '7 days')
        RETURNING *
      `, [
        walletId,
        proposalType,
        JSON.stringify(transactionPayload),
        proposedBy,
        wallet.threshold,
        notes
      ]);
      
      await client.query('COMMIT');
      
      logger.info(`Created transaction proposal: ${result.rows[0].id}`, {
        proposalType,
        requiredSignatures: wallet.threshold
      });
      
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to create transaction proposal', error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Sign a transaction proposal
   * @param {Object} params - Signature parameters
   * @returns {Promise<Object>} Updated proposal
   */
  async signProposal({ proposalId, signerUserId, signerAddress, signature }) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Add signature
      await client.query(`
        INSERT INTO proposal_signatures (
          proposal_id,
          signer_user_id,
          signer_address,
          signature
        ) VALUES ($1, $2, $3, $4)
      `, [proposalId, signerUserId, signerAddress, signature]);
      
      // Update signature count
      await client.query(`
        UPDATE transaction_proposals
        SET current_signatures = current_signatures + 1,
            updated_at = NOW()
        WHERE id = $1
      `, [proposalId]);
      
      // Check if proposal now has enough signatures
      const proposalResult = await client.query(`
        SELECT * FROM transaction_proposals
        WHERE id = $1
      `, [proposalId]);
      
      const proposal = proposalResult.rows[0];
      
      if (proposal.current_signatures >= proposal.required_signatures) {
        await client.query(`
          UPDATE transaction_proposals
          SET status = 'approved',
              updated_at = NOW()
          WHERE id = $1
        `, [proposalId]);
        
        logger.info(`Proposal ${proposalId} fully approved and ready for execution`);
      }
      
      await client.query('COMMIT');
      
      return proposalResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to sign proposal', error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Execute an approved transaction proposal
   * @param {string} proposalId - Proposal ID
   * @param {string} executedBy - User ID executing the proposal
   * @returns {Promise<Object>} Transaction result
   */
  async executeProposal(proposalId, executedBy) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get proposal
      const proposalResult = await client.query(
        'SELECT * FROM transaction_proposals WHERE id = $1',
        [proposalId]
      );
      
      if (proposalResult.rows.length === 0) {
        throw new Error('Proposal not found');
      }
      
      const proposal = proposalResult.rows[0];
      
      if (proposal.status !== 'approved') {
        throw new Error('Proposal is not approved for execution');
      }
      
      // Execute transaction on Aptos
      const txPayload = proposal.transaction_payload;
      const txHash = await this.executeTransaction(txPayload);
      
      // Record transaction
      const txResult = await client.query(`
        INSERT INTO wallet_transactions (
          transaction_hash,
          wallet_id,
          transaction_type,
          payload,
          status
        ) VALUES ($1, $2, $3, $4, 'pending')
        RETURNING *
      `, [
        txHash,
        proposal.wallet_id,
        proposal.proposal_type,
        JSON.stringify(txPayload)
      ]);
      
      // Update proposal status
      await client.query(`
        UPDATE transaction_proposals
        SET status = 'executed',
            executed_transaction_id = $1,
            updated_at = NOW()
        WHERE id = $2
      `, [txResult.rows[0].id, proposalId]);
      
      await client.query('COMMIT');
      
      logger.info(`Executed proposal ${proposalId}, transaction ${txHash}`);
      
      return txResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to execute proposal', error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Execute a transaction on Aptos blockchain
   * @param {Object} payload - Transaction payload
   * @returns {Promise<string>} Transaction hash
   */
  async executeTransaction(payload) {
    // TODO: Integrate with Aptos SDK to execute actual transaction
    // For now, return a simulated transaction hash
    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    logger.info(`Simulated transaction execution: ${txHash}`, { payload });
    return txHash;
  }
  
  /**
   * Create a custodial mapping for a user's asset
   * @param {Object} params - Mapping parameters
   * @returns {Promise<Object>} Created mapping
   */
  async createCustodialMapping({
    userId,
    assetType,
    assetIdentifier,
    onChainAddress,
    metadata
  }) {
    const wallet = await this.getActivePantryWallet();
    
    const result = await pool.query(`
      INSERT INTO custodial_mappings (
        user_id,
        asset_type,
        asset_identifier,
        on_chain_address,
        custodian_wallet_id,
        metadata
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      userId,
      assetType,
      assetIdentifier,
      onChainAddress,
      wallet.id,
      JSON.stringify(metadata || {})
    ]);
    
    logger.info(`Created custodial mapping for user ${userId}`, {
      assetType,
      assetIdentifier
    });
    
    return result.rows[0];
  }
  
  /**
   * Get user's custodial assets
   * @param {string} userId - User ID
   * @param {string} assetType - Optional asset type filter
   * @returns {Promise<Array>} User's assets
   */
  async getUserAssets(userId, assetType = null) {
    const query = assetType
      ? 'SELECT * FROM custodial_mappings WHERE user_id = $1 AND asset_type = $2 AND status = $3'
      : 'SELECT * FROM custodial_mappings WHERE user_id = $1 AND status = $2';
    
    const params = assetType
      ? [userId, assetType, 'active']
      : [userId, 'active'];
    
    const result = await pool.query(query, params);
    return result.rows;
  }
  
  /**
   * Update custodial mapping status
   * @param {string} mappingId - Mapping ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated mapping
   */
  async updateMappingStatus(mappingId, status) {
    const result = await pool.query(`
      UPDATE custodial_mappings
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [status, mappingId]);
    
    return result.rows[0];
  }
}

module.exports = new WalletService();

