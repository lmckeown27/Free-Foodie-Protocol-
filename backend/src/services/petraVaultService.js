/**
 * Petra Vault Service
 * 
 * Manages multi-sig wallet operations for Pantry custodial wallet.
 * This is a STUB implementation - in production, use the actual Petra Vault SDK.
 * 
 * Key principles:
 * 1. NEVER store private keys in this service
 * 2. All transactions require M-of-N Pantry worker approvals
 * 3. Proposals expire after 24 hours if not approved
 */

const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const logger = require('../config/logger');

// NOTE: In production, import actual Petra Vault SDK
// const { PetraVaultSDK } = require('@petra-wallet/vault-sdk');

class PetraVaultService {
  constructor() {
    this.network = process.env.APTOS_NETWORK || 'testnet';
    this.apiKey = process.env.PETRA_VAULT_API_KEY;
    
    // In production, initialize SDK here:
    // this.sdk = new PetraVaultSDK({
    //   network: this.network,
    //   apiKey: this.apiKey
    // });
  }

  /**
   * Create a new multi-sig vault
   * @param {Object} params
   * @param {string} params.name - Vault name
   * @param {string[]} params.owners - Array of Aptos addresses
   * @param {number} params.threshold - Number of signatures required
   * @param {string} params.createdBy - User ID of creator
   * @returns {Promise<Object>} Vault details
   */
  async createVault({ name, owners, threshold, createdBy }) {
    try {
      logger.info('Creating Petra Vault', { name, owners, threshold });

      // Validate inputs
      if (!owners || owners.length < threshold) {
        throw new Error(`Threshold (${threshold}) cannot exceed number of owners (${owners.length})`);
      }

      if (threshold < 1) {
        throw new Error('Threshold must be at least 1');
      }

      // In production, call Petra Vault SDK:
      // const vaultResponse = await this.sdk.vaults.create({
      //   name,
      //   owners,
      //   signatureThreshold: threshold
      // });

      // STUB: Generate mock vault for testing
      const mockVaultId = `vault_${uuidv4()}`;
      const mockVaultAddress = `0x${Buffer.from(uuidv4()).toString('hex').slice(0, 64)}`;

      // Store in database
      const result = await db.query(
        `INSERT INTO pantry_vaults 
          (vault_id, vault_address, network, owners, signature_threshold, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [mockVaultId, mockVaultAddress, this.network, owners, threshold, createdBy]
      );

      logger.info('Vault created successfully', { vaultId: mockVaultId });

      return {
        vaultId: result.rows[0].vault_id,
        vaultAddress: result.rows[0].vault_address,
        owners: result.rows[0].owners,
        threshold: result.rows[0].signature_threshold,
        network: result.rows[0].network
      };
    } catch (error) {
      logger.error('Failed to create vault', { error: error.message });
      throw error;
    }
  }

  /**
   * Create a transaction proposal
   * @param {Object} params
   * @param {string} params.vaultId - Vault ID
   * @param {string} params.transactionType - Type of transaction
   * @param {Object} params.payload - Aptos transaction payload
   * @param {Object} params.metadata - Additional metadata
   * @returns {Promise<Object>} Proposal details
   */
  async createProposal({ vaultId, transactionType, payload, metadata = {} }) {
    try {
      logger.info('Creating Petra Vault proposal', { vaultId, transactionType });

      // Get vault details
      const vaultResult = await db.query(
        'SELECT * FROM pantry_vaults WHERE vault_id = $1 AND status = $2',
        [vaultId, 'active']
      );

      if (vaultResult.rows.length === 0) {
        throw new Error(`Active vault not found: ${vaultId}`);
      }

      const vault = vaultResult.rows[0];

      // In production, call Petra Vault SDK:
      // const proposalResponse = await this.sdk.proposals.create({
      //   vaultId,
      //   transaction: {
      //     function: payload.function,
      //     typeArguments: payload.typeArguments || [],
      //     arguments: payload.arguments,
      //     maxGasAmount: payload.maxGasAmount || '10000',
      //     gasUnitPrice: payload.gasUnitPrice || '100'
      //   },
      //   title: `FFQ ${transactionType}`,
      //   description: metadata.description || `Automated ${transactionType} proposal`,
      //   expirationTime: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      // });

      // STUB: Generate mock proposal
      const proposalId = `proposal_${uuidv4()}`;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

      // Store in database
      const result = await db.query(
        `INSERT INTO blockchain_proposals
          (proposal_id, vault_id, transaction_type, payload, metadata, 
           required_signatures, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          proposalId,
          vaultId,
          transactionType,
          JSON.stringify(payload),
          JSON.stringify(metadata),
          vault.signature_threshold,
          expiresAt
        ]
      );

      logger.info('Proposal created successfully', { proposalId });

      // Log audit event
      await db.query(
        `SELECT log_audit_event($1, $2, $3, $4, $5, $6, $7)`,
        [
          'proposal_created',
          'blockchain_event',
          null, // system-generated
          'system',
          'blockchain_proposal',
          result.rows[0].id,
          JSON.stringify({
            proposalId,
            vaultId,
            transactionType,
            requiredSignatures: vault.signature_threshold
          })
        ]
      );

      return {
        proposalId: result.rows[0].proposal_id,
        vaultId: result.rows[0].vault_id,
        status: result.rows[0].status,
        requiredSignatures: result.rows[0].required_signatures,
        currentSignatures: result.rows[0].current_signatures,
        expiresAt: result.rows[0].expires_at,
        createdAt: result.rows[0].created_at
      };
    } catch (error) {
      logger.error('Failed to create proposal', { error: error.message });
      throw error;
    }
  }

  /**
   * Get proposal status
   * @param {string} proposalId
   * @returns {Promise<Object>} Proposal status
   */
  async getProposalStatus(proposalId) {
    try {
      // In production, call Petra Vault SDK:
      // const proposal = await this.sdk.proposals.get(proposalId);

      // Query database
      const result = await db.query(
        `SELECT 
          p.*,
          ARRAY_AGG(
            json_build_object(
              'signer', ps.signer_address,
              'signedAt', ps.signed_at
            )
          ) FILTER (WHERE ps.signer_address IS NOT NULL) AS signatures
         FROM blockchain_proposals p
         LEFT JOIN proposal_signatures ps ON p.proposal_id = ps.proposal_id
         WHERE p.proposal_id = $1
         GROUP BY p.id`,
        [proposalId]
      );

      if (result.rows.length === 0) {
        throw new Error(`Proposal not found: ${proposalId}`);
      }

      const proposal = result.rows[0];

      return {
        proposalId: proposal.proposal_id,
        vaultId: proposal.vault_id,
        status: proposal.status,
        transactionType: proposal.transaction_type,
        requiredSignatures: proposal.required_signatures,
        currentSignatures: proposal.current_signatures,
        signatures: proposal.signatures || [],
        transactionHash: proposal.transaction_hash,
        createdAt: proposal.created_at,
        expiresAt: proposal.expires_at,
        executedAt: proposal.executed_at,
        errorMessage: proposal.error_message
      };
    } catch (error) {
      logger.error('Failed to get proposal status', { proposalId, error: error.message });
      throw error;
    }
  }

  /**
   * Record a signature for a proposal
   * NOTE: In production, signatures are recorded via Petra Wallet, not this API
   * This method is for testing/stub purposes
   * @param {Object} params
   * @param {string} params.proposalId
   * @param {string} params.signerAddress
   * @param {string} params.signerUserId
   * @returns {Promise<Object>} Updated proposal status
   */
  async recordSignature({ proposalId, signerAddress, signerUserId }) {
    try {
      logger.info('Recording proposal signature', { proposalId, signerAddress });

      // Get proposal
      const proposalResult = await db.query(
        'SELECT * FROM blockchain_proposals WHERE proposal_id = $1',
        [proposalId]
      );

      if (proposalResult.rows.length === 0) {
        throw new Error(`Proposal not found: ${proposalId}`);
      }

      const proposal = proposalResult.rows[0];

      if (proposal.status !== 'pending') {
        throw new Error(`Proposal is not pending: ${proposal.status}`);
      }

      if (new Date() > new Date(proposal.expires_at)) {
        throw new Error('Proposal has expired');
      }

      // Check if signer is authorized
      const vaultResult = await db.query(
        'SELECT * FROM pantry_vaults WHERE vault_id = $1',
        [proposal.vault_id]
      );

      const vault = vaultResult.rows[0];
      if (!vault.owners.includes(signerAddress)) {
        throw new Error('Signer not authorized for this vault');
      }

      // Insert signature
      await db.query(
        `INSERT INTO proposal_signatures (proposal_id, signer_address, signer_user_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (proposal_id, signer_address) DO NOTHING`,
        [proposalId, signerAddress, signerUserId]
      );

      // Update signature count
      const countResult = await db.query(
        `SELECT COUNT(DISTINCT signer_address) AS count
         FROM proposal_signatures
         WHERE proposal_id = $1`,
        [proposalId]
      );

      const currentSignatures = parseInt(countResult.rows[0].count);

      // Update proposal
      const newStatus = currentSignatures >= proposal.required_signatures ? 'approved' : 'pending';

      await db.query(
        `UPDATE blockchain_proposals
         SET current_signatures = $1, status = $2
         WHERE proposal_id = $3`,
        [currentSignatures, newStatus, proposalId]
      );

      logger.info('Signature recorded', { 
        proposalId, 
        currentSignatures, 
        requiredSignatures: proposal.required_signatures,
        newStatus 
      });

      // Log audit event
      await db.query(
        `SELECT log_audit_event($1, $2, $3, $4, $5, $6, $7)`,
        [
          'proposal_signed',
          'pantry_action',
          signerUserId,
          'pantry',
          'blockchain_proposal',
          proposal.id,
          JSON.stringify({
            proposalId,
            signerAddress,
            currentSignatures,
            requiredSignatures: proposal.required_signatures,
            approved: newStatus === 'approved'
          })
        ]
      );

      return this.getProposalStatus(proposalId);
    } catch (error) {
      logger.error('Failed to record signature', { proposalId, error: error.message });
      throw error;
    }
  }

  /**
   * Execute an approved proposal
   * @param {string} proposalId
   * @returns {Promise<Object>} Transaction result
   */
  async executeProposal(proposalId) {
    try {
      logger.info('Executing approved proposal', { proposalId });

      // Get proposal
      const proposal = await this.getProposalStatus(proposalId);

      if (proposal.status !== 'approved') {
        throw new Error(`Proposal not approved: ${proposal.status}`);
      }

      // In production, call Petra Vault SDK to submit transaction:
      // const txResult = await this.sdk.proposals.execute(proposalId);
      // const aptosClient = new AptosClient(process.env.APTOS_NODE_URL);
      // await aptosClient.waitForTransaction(txResult.hash);

      // STUB: Generate mock transaction hash
      const mockTxHash = `0x${Buffer.from(uuidv4()).toString('hex')}`;

      // Update proposal
      await db.query(
        `UPDATE blockchain_proposals
         SET status = $1, transaction_hash = $2, executed_at = CURRENT_TIMESTAMP
         WHERE proposal_id = $3`,
        ['executed', mockTxHash, proposalId]
      );

      logger.info('Proposal executed successfully', { proposalId, txHash: mockTxHash });

      // Log audit event
      await db.query(
        `SELECT log_audit_event($1, $2, $3, $4, $5, $6, $7)`,
        [
          'proposal_executed',
          'blockchain_event',
          null,
          'system',
          'blockchain_proposal',
          null,
          JSON.stringify({
            proposalId,
            transactionHash: mockTxHash,
            transactionType: proposal.transactionType
          })
        ]
      );

      return {
        proposalId,
        transactionHash: mockTxHash,
        status: 'executed',
        executedAt: new Date()
      };
    } catch (error) {
      // Mark proposal as failed
      await db.query(
        `UPDATE blockchain_proposals
         SET status = $1, error_message = $2
         WHERE proposal_id = $3`,
        ['failed', error.message, proposalId]
      );

      logger.error('Failed to execute proposal', { proposalId, error: error.message });
      throw error;
    }
  }

  /**
   * List all vaults
   * @returns {Promise<Array>} List of vaults
   */
  async listVaults() {
    try {
      const result = await db.query(
        'SELECT * FROM pantry_vaults ORDER BY created_at DESC'
      );
      return result.rows;
    } catch (error) {
      logger.error('Failed to list vaults', { error: error.message });
      throw error;
    }
  }

  /**
   * Get active vault (most recent)
   * @returns {Promise<Object|null>} Active vault or null
   */
  async getActiveVault() {
    try {
      const result = await db.query(
        `SELECT * FROM pantry_vaults 
         WHERE status = $1 
         ORDER BY created_at DESC 
         LIMIT 1`,
        ['active']
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Failed to get active vault', { error: error.message });
      throw error;
    }
  }
}

module.exports = new PetraVaultService();

