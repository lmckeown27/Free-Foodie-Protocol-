const express = require('express');
const router = express.Router();
const walletService = require('../services/walletService');
const nftService = require('../services/nftService');
const reconciliationService = require('../services/reconciliationService');
const { authenticate, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * POST /api/v1/wallet/vault/create
 * Create a new Petra Vault multi-sig wallet
 * Pantry only
 */
router.post('/vault/create', authenticate, authorize('pantry'), async (req, res) => {
  try {
    const { vaultName, signerAddresses, threshold } = req.body;
    
    if (!vaultName || !signerAddresses || !threshold) {
      return res.status(400).json({
        error: 'Missing required fields: vaultName, signerAddresses, threshold'
      });
    }
    
    if (signerAddresses.length < threshold) {
      return res.status(400).json({
        error: 'Threshold cannot exceed number of signers'
      });
    }
    
    const vault = await walletService.createPantryVault({
      vaultName,
      signerAddresses,
      threshold,
      createdBy: req.user.id
    });
    
    res.status(201).json({
      message: 'Pantry Vault created successfully',
      vault
    });
  } catch (error) {
    logger.error('Error creating Pantry Vault', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/wallet/vault/active
 * Get the active Pantry wallet
 * Pantry only
 */
router.get('/vault/active', authenticate, authorize('pantry'), async (req, res) => {
  try {
    const wallet = await walletService.getActivePantryWallet();
    res.json(wallet);
  } catch (error) {
    logger.error('Error fetching active Pantry wallet', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v1/wallet/proposals
 * Create a transaction proposal for multi-sig approval
 * Pantry only
 */
router.post('/proposals', authenticate, authorize('pantry'), async (req, res) => {
  try {
    const { proposalType, transactionPayload, notes } = req.body;
    
    if (!proposalType || !transactionPayload) {
      return res.status(400).json({
        error: 'Missing required fields: proposalType, transactionPayload'
      });
    }
    
    const wallet = await walletService.getActivePantryWallet();
    
    const proposal = await walletService.createTransactionProposal({
      walletId: wallet.id,
      proposalType,
      transactionPayload,
      proposedBy: req.user.id,
      notes
    });
    
    res.status(201).json({
      message: 'Transaction proposal created',
      proposal
    });
  } catch (error) {
    logger.error('Error creating transaction proposal', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/wallet/proposals
 * Get all transaction proposals
 * Pantry only
 */
router.get('/proposals', authenticate, authorize('pantry'), async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = 'SELECT * FROM transaction_proposals ORDER BY created_at DESC';
    let params = [];
    
    if (status) {
      query = 'SELECT * FROM transaction_proposals WHERE status = $1 ORDER BY created_at DESC';
      params = [status];
    }
    
    const { pool } = require('../config/database');
    const result = await pool.query(query, params);
    
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching proposals', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/wallet/proposals/:id
 * Get a specific proposal with signatures
 * Pantry only
 */
router.get('/proposals/:id', authenticate, authorize('pantry'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const { pool } = require('../config/database');
    
    // Get proposal
    const proposalResult = await pool.query(
      'SELECT * FROM transaction_proposals WHERE id = $1',
      [id]
    );
    
    if (proposalResult.rows.length === 0) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    
    // Get signatures
    const signaturesResult = await pool.query(
      'SELECT * FROM proposal_signatures WHERE proposal_id = $1 ORDER BY signed_at',
      [id]
    );
    
    const proposal = proposalResult.rows[0];
    proposal.signatures = signaturesResult.rows;
    
    res.json(proposal);
  } catch (error) {
    logger.error('Error fetching proposal', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v1/wallet/proposals/:id/sign
 * Sign a transaction proposal
 * Pantry only
 */
router.post('/proposals/:id/sign', authenticate, authorize('pantry'), async (req, res) => {
  try {
    const { id } = req.params;
    const { signerAddress, signature } = req.body;
    
    if (!signerAddress || !signature) {
      return res.status(400).json({
        error: 'Missing required fields: signerAddress, signature'
      });
    }
    
    const proposal = await walletService.signProposal({
      proposalId: id,
      signerUserId: req.user.id,
      signerAddress,
      signature
    });
    
    res.json({
      message: 'Proposal signed successfully',
      proposal
    });
  } catch (error) {
    logger.error('Error signing proposal', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v1/wallet/proposals/:id/execute
 * Execute an approved proposal
 * Pantry only
 */
router.post('/proposals/:id/execute', authenticate, authorize('pantry'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const transaction = await walletService.executeProposal(id, req.user.id);
    
    res.json({
      message: 'Proposal executed successfully',
      transaction
    });
  } catch (error) {
    logger.error('Error executing proposal', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/wallet/transactions
 * Get wallet transactions
 * Pantry only
 */
router.get('/transactions', authenticate, authorize('pantry'), async (req, res) => {
  try {
    const { status, type, limit = 100 } = req.query;
    
    const { pool } = require('../config/database');
    
    let query = 'SELECT * FROM wallet_transactions WHERE 1=1';
    let params = [];
    let paramIndex = 1;
    
    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (type) {
      query += ` AND transaction_type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }
    
    query += ` ORDER BY submitted_at DESC LIMIT $${paramIndex}`;
    params.push(limit);
    
    const result = await pool.query(query, params);
    
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching transactions', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/wallet/assets/my
 * Get current user's custodial assets
 */
router.get('/assets/my', authenticate, async (req, res) => {
  try {
    const { assetType } = req.query;
    
    const assets = await walletService.getUserAssets(req.user.id, assetType || null);
    
    res.json(assets);
  } catch (error) {
    logger.error('Error fetching user assets', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/wallet/reconciliation/run
 * Run full reconciliation
 * Pantry only
 */
router.post('/reconciliation/run', authenticate, authorize('pantry'), async (req, res) => {
  try {
    const results = await reconciliationService.runFullReconciliation();
    
    res.json({
      message: 'Reconciliation completed',
      results
    });
  } catch (error) {
    logger.error('Error running reconciliation', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/wallet/reconciliation/discrepancies
 * Get unresolved discrepancies
 * Pantry only
 */
router.get('/reconciliation/discrepancies', authenticate, authorize('pantry'), async (req, res) => {
  try {
    const discrepancies = await reconciliationService.getUnresolvedDiscrepancies();
    
    res.json(discrepancies);
  } catch (error) {
    logger.error('Error fetching discrepancies', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v1/wallet/reconciliation/discrepancies/:id/resolve
 * Resolve a discrepancy
 * Pantry only
 */
router.post('/reconciliation/discrepancies/:id/resolve', authenticate, authorize('pantry'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const record = await reconciliationService.resolveDiscrepancy(id, req.user.id);
    
    res.json({
      message: 'Discrepancy resolved',
      record
    });
  } catch (error) {
    logger.error('Error resolving discrepancy', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/wallet/custodial-nfts
 * Get all NFTs held in custody with user details
 * Pantry only
 */
router.get('/custodial-nfts', authenticate, authorize('pantry'), async (req, res) => {
  try {
    const { query } = require('../config/database');
    
    // Get all NFTs with custodial mappings and user details
    const result = await query(`
      SELECT 
        cm.id as mapping_id,
        cm.asset_type,
        cm.asset_identifier,
        cm.status as mapping_status,
        cm.created_at as mapped_at,
        nft.nft_id,
        nft.nft_type,
        nft.metadata,
        nft.status as nft_status,
        nft.minted_at,
        nft.transaction_hash,
        u.id as user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.calpoly_id,
        u.role
      FROM custodial_mappings cm
      JOIN nft_records nft ON cm.asset_identifier = nft.nft_id
      JOIN users u ON cm.user_id = u.id
      WHERE cm.status = 'active'
      ORDER BY cm.created_at DESC
    `);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    logger.error('Error fetching custodial NFTs', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

