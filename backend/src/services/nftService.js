const { pool } = require('../config/database');
const logger = require('../utils/logger');
const walletService = require('./walletService');
const aptosService = require('./aptosService');
const auditService = require('./auditService');

/**
 * NFT Service
 * Handles minting and management of all NFT types (Supplier, Allocation, Governance, Volunteer)
 */
class NFTService {
  /**
   * Mint a Supplier NFT when supplier is approved
   * @param {Object} params - Minting parameters
   * @returns {Promise<Object>} Minting result
   */
  async mintSupplierNFT({ userId, supplierData, approvedBy }) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get user info
      const userResult = await client.query(
        'SELECT * FROM users WHERE id = $1',
        [userId]
      );
      const user = userResult.rows[0];
      
      // Get pantry wallet
      const wallet = await walletService.getActivePantryWallet();
      
      // Prepare NFT metadata
      const metadata = {
        supplier_name: `${user.first_name} ${user.last_name}`,
        supplier_email: user.email,
        business_name: supplierData.businessName,
        business_type: supplierData.businessType,
        license_number: supplierData.licenseNumber,
        ein: supplierData.ein,
        approved_date: new Date().toISOString(),
        approved_by: approvedBy
      };
      
      // Mint NFT on Aptos
      const mintResult = await aptosService.mintNFT({
        collectionName: 'FFQ_Suppliers',
        tokenName: `Supplier_${user.id}`,
        description: `Verified FFQ Supplier: ${supplierData.businessName}`,
        uri: `https://ffq.app/nft/supplier/${user.id}`,
        recipientAddress: wallet.wallet_address
      });
      
      // Record NFT in database
      const nftResult = await client.query(`
        INSERT INTO nft_records (
          nft_type,
          nft_id,
          owner_id,
          metadata,
          transaction_hash,
          status
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        'supplier',
        mintResult.tokenId,
        userId,
        JSON.stringify(metadata),
        mintResult.txHash,
        'active'
      ]);
      
      // Create custodial mapping
      await walletService.createCustodialMapping({
        userId,
        assetType: 'supplier_nft',
        assetIdentifier: mintResult.tokenId,
        onChainAddress: wallet.wallet_address,
        metadata
      });
      
      // Update inventory with NFT ID if this is for a specific donation
      if (supplierData.inventoryId) {
        await client.query(`
          UPDATE inventory
          SET supplier_nft_id = $1
          WHERE id = $2
        `, [mintResult.tokenId, supplierData.inventoryId]);
      }
      
      await client.query('COMMIT');
      
      logger.info(`Minted Supplier NFT for user ${userId}`, {
        tokenId: mintResult.tokenId,
        txHash: mintResult.txHash
      });
      
      // Audit log
      await auditService.logBlockchainEvent({
        eventType: 'mint_supplier_nft',
        actorUserId: approvedBy,
        actorRole: 'pantry',
        targetUserId: userId,
        actionDescription: `Minted Supplier NFT for ${supplierData.businessName}`,
        afterState: nftResult.rows[0]
      });
      
      return {
        nft: nftResult.rows[0],
        transaction: mintResult
      };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to mint Supplier NFT', error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Mint an Allocation NFT when student allocation is approved
   * @param {Object} params - Minting parameters
   * @returns {Promise<Object>} Minting result
   */
  async mintAllocationNFT({ allocationId, approvedBy }) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get allocation details
      const allocResult = await client.query(`
        SELECT a.*, u.first_name, u.last_name, u.email, i.item_name, i.quantity
        FROM allocations a
        JOIN users u ON a.student_id = u.id
        JOIN inventory i ON a.inventory_id = i.id
        WHERE a.id = $1
      `, [allocationId]);
      
      if (allocResult.rows.length === 0) {
        throw new Error('Allocation not found');
      }
      
      const allocation = allocResult.rows[0];
      
      // Get pantry wallet
      const wallet = await walletService.getActivePantryWallet();
      
      // Prepare NFT metadata
      const metadata = {
        student_name: `${allocation.first_name} ${allocation.last_name}`,
        student_email: allocation.email,
        item_name: allocation.item_name,
        quantity: allocation.quantity,
        allocation_date: allocation.allocation_date,
        poas_score: allocation.poas_score,
        qr_code: `FFQ-ALLOC-${allocationId}`
      };
      
      // Mint NFT on Aptos
      const mintResult = await aptosService.mintNFT({
        collectionName: 'FFQ_Allocations',
        tokenName: `Allocation_${allocationId}`,
        description: `FFQ Food Allocation: ${allocation.quantity}x ${allocation.item_name}`,
        uri: `https://ffq.app/nft/allocation/${allocationId}`,
        recipientAddress: wallet.wallet_address
      });
      
      // Record NFT in database
      const nftResult = await client.query(`
        INSERT INTO nft_records (
          nft_type,
          nft_id,
          owner_id,
          metadata,
          transaction_hash,
          status
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        'allocation',
        mintResult.tokenId,
        allocation.student_id,
        JSON.stringify(metadata),
        mintResult.txHash,
        'active'
      ]);
      
      // Create custodial mapping
      await walletService.createCustodialMapping({
        userId: allocation.student_id,
        assetType: 'allocation_nft',
        assetIdentifier: mintResult.tokenId,
        onChainAddress: wallet.wallet_address,
        metadata
      });
      
      // Update allocation with NFT ID
      await client.query(`
        UPDATE allocations
        SET allocation_nft_id = $1,
            status = 'approved',
            updated_at = NOW()
        WHERE id = $2
      `, [mintResult.tokenId, allocationId]);
      
      await client.query('COMMIT');
      
      logger.info(`Minted Allocation NFT for allocation ${allocationId}`, {
        tokenId: mintResult.tokenId,
        txHash: mintResult.txHash
      });
      
      // Audit log
      await auditService.logBlockchainEvent({
        eventType: 'mint_allocation_nft',
        actorUserId: approvedBy,
        actorRole: 'pantry',
        targetUserId: allocation.student_id,
        actionDescription: `Minted Allocation NFT: ${allocation.quantity}x ${allocation.item_name}`,
        afterState: nftResult.rows[0]
      });
      
      return {
        nft: nftResult.rows[0],
        transaction: mintResult
      };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to mint Allocation NFT', error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Mint a Governance NFT when student participates in governance
   * @param {Object} params - Minting parameters
   * @returns {Promise<Object>} Minting result
   */
  async mintGovernanceNFT({ userId, proposalId }) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get user info
      const userResult = await client.query(
        'SELECT * FROM users WHERE id = $1',
        [userId]
      );
      const user = userResult.rows[0];
      
      // Get pantry wallet
      const wallet = await walletService.getActivePantryWallet();
      
      // Prepare NFT metadata
      const metadata = {
        student_name: `${user.first_name} ${user.last_name}`,
        proposal_id: proposalId,
        vote_date: new Date().toISOString(),
        governance_nft_count: user.governance_nft_count + 1
      };
      
      // Mint NFT on Aptos
      const mintResult = await aptosService.mintNFT({
        collectionName: 'FFQ_Governance',
        tokenName: `Governance_${userId}_${Date.now()}`,
        description: `FFQ Governance Participation NFT`,
        uri: `https://ffq.app/nft/governance/${userId}/${Date.now()}`,
        recipientAddress: wallet.wallet_address
      });
      
      // Record NFT in database
      const nftResult = await client.query(`
        INSERT INTO nft_records (
          nft_type,
          nft_id,
          owner_id,
          metadata,
          transaction_hash,
          status
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        'governance',
        mintResult.tokenId,
        userId,
        JSON.stringify(metadata),
        mintResult.txHash,
        'active'
      ]);
      
      // Create custodial mapping
      await walletService.createCustodialMapping({
        userId,
        assetType: 'governance_nft',
        assetIdentifier: mintResult.tokenId,
        onChainAddress: wallet.wallet_address,
        metadata
      });
      
      // Update user's governance NFT count
      await client.query(`
        UPDATE users
        SET governance_nft_count = governance_nft_count + 1
        WHERE id = $1
      `, [userId]);
      
      // Update vote with NFT ID
      if (proposalId) {
        await client.query(`
          UPDATE governance_votes
          SET signature = $1
          WHERE proposal_id = $2 AND voter_user_id = $3
        `, [mintResult.tokenId, proposalId, userId]);
      }
      
      await client.query('COMMIT');
      
      logger.info(`Minted Governance NFT for user ${userId}`, {
        tokenId: mintResult.tokenId,
        txHash: mintResult.txHash
      });
      
      // Audit log
      await auditService.logBlockchainEvent({
        eventType: 'mint_governance_nft',
        targetUserId: userId,
        actionDescription: `Minted Governance NFT for proposal participation`,
        afterState: nftResult.rows[0]
      });
      
      return {
        nft: nftResult.rows[0],
        transaction: mintResult
      };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to mint Governance NFT', error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Mint a Volunteer NFT when student reaches milestone
   * @param {Object} params - Minting parameters
   * @returns {Promise<Object>} Minting result
   */
  async mintVolunteerNFT({ userId, tier, hours, verifiedBy }) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get user info
      const userResult = await client.query(
        'SELECT * FROM users WHERE id = $1',
        [userId]
      );
      const user = userResult.rows[0];
      
      // Get pantry wallet
      const wallet = await walletService.getActivePantryWallet();
      
      // Prepare NFT metadata
      const metadata = {
        student_name: `${user.first_name} ${user.last_name}`,
        tier,
        hours_required: hours,
        minted_date: new Date().toISOString(),
        verified_by: verifiedBy
      };
      
      // Mint NFT on Aptos
      const mintResult = await aptosService.mintNFT({
        collectionName: 'FFQ_Volunteers',
        tokenName: `Volunteer_${tier}_${userId}`,
        description: `FFQ ${tier.toUpperCase()} Volunteer Badge - ${hours} hours`,
        uri: `https://ffq.app/nft/volunteer/${userId}/${tier}`,
        recipientAddress: wallet.wallet_address
      });
      
      // Record NFT in database
      const nftResult = await client.query(`
        INSERT INTO nft_records (
          nft_type,
          nft_id,
          owner_id,
          metadata,
          transaction_hash,
          status
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        'volunteer',
        mintResult.tokenId,
        userId,
        JSON.stringify(metadata),
        mintResult.txHash,
        'active'
      ]);
      
      // Create custodial mapping
      await walletService.createCustodialMapping({
        userId,
        assetType: 'volunteer_nft',
        assetIdentifier: mintResult.tokenId,
        onChainAddress: wallet.wallet_address,
        metadata
      });
      
      // Record in volunteer_nfts table
      await client.query(`
        INSERT INTO volunteer_nfts (
          student_id,
          nft_id,
          tier,
          hours_required,
          hours_at_mint,
          transaction_hash,
          metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        userId,
        mintResult.tokenId,
        tier,
        hours,
        hours,
        mintResult.txHash,
        JSON.stringify(metadata)
      ]);
      
      await client.query('COMMIT');
      
      logger.info(`Minted Volunteer NFT for user ${userId}`, {
        tier,
        hours,
        tokenId: mintResult.tokenId
      });
      
      // Audit log
      await auditService.logBlockchainEvent({
        eventType: 'mint_volunteer_nft',
        actorUserId: verifiedBy,
        actorRole: 'pantry',
        targetUserId: userId,
        actionDescription: `Minted ${tier.toUpperCase()} Volunteer NFT - ${hours} hours`,
        afterState: nftResult.rows[0]
      });
      
      return {
        nft: nftResult.rows[0],
        transaction: mintResult
      };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to mint Volunteer NFT', error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Redeem (burn) an Allocation NFT after pickup
   * @param {string} allocationId - Allocation ID
   * @param {string} redeemedBy - User ID who processed redemption
   * @returns {Promise<Object>} Redemption result
   */
  async redeemAllocationNFT(allocationId, redeemedBy) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get allocation and NFT
      const allocResult = await client.query(`
        SELECT a.*, n.nft_id, n.id as nft_record_id
        FROM allocations a
        JOIN nft_records n ON n.owner_id = a.student_id 
          AND n.nft_id = a.allocation_nft_id
        WHERE a.id = $1
      `, [allocationId]);
      
      if (allocResult.rows.length === 0) {
        throw new Error('Allocation or NFT not found');
      }
      
      const allocation = allocResult.rows[0];
      
      // Get pantry wallet
      const wallet = await walletService.getActivePantryWallet();
      
      // Burn NFT on Aptos
      const burnTxHash = await aptosService.burnNFT(
        allocation.nft_id,
        wallet.wallet_address
      );
      
      // Update NFT record
      await client.query(`
        UPDATE nft_records
        SET status = 'redeemed',
            burned_at = NOW()
        WHERE id = $1
      `, [allocation.nft_record_id]);
      
      // Update allocation
      await client.query(`
        UPDATE allocations
        SET status = 'redeemed',
            redemption_date = NOW(),
            updated_at = NOW()
        WHERE id = $1
      `, [allocationId]);
      
      // Update custodial mapping
      const mappings = await walletService.getUserAssets(
        allocation.student_id,
        'allocation_nft'
      );
      const mapping = mappings.find(m => m.asset_identifier === allocation.nft_id);
      if (mapping) {
        await walletService.updateMappingStatus(mapping.id, 'redeemed');
      }
      
      await client.query('COMMIT');
      
      logger.info(`Redeemed Allocation NFT for allocation ${allocationId}`, {
        nftId: allocation.nft_id,
        burnTxHash
      });
      
      // Audit log
      await auditService.logBlockchainEvent({
        eventType: 'redeem_allocation_nft',
        actorUserId: redeemedBy,
        actorRole: 'pantry',
        targetUserId: allocation.student_id,
        actionDescription: `Redeemed Allocation NFT after pickup`,
        beforeState: { status: allocation.status },
        afterState: { status: 'redeemed', burnTxHash }
      });
      
      return {
        allocationId,
        nftId: allocation.nft_id,
        burnTxHash
      };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to redeem Allocation NFT', error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Get user's NFTs
   * @param {string} userId - User ID
   * @param {string} nftType - Optional NFT type filter
   * @returns {Promise<Array>} User's NFTs
   */
  async getUserNFTs(userId, nftType = null) {
    const query = nftType
      ? 'SELECT * FROM nft_records WHERE owner_id = $1 AND nft_type = $2 ORDER BY minted_at DESC'
      : 'SELECT * FROM nft_records WHERE owner_id = $1 ORDER BY minted_at DESC';
    
    const params = nftType ? [userId, nftType] : [userId];
    
    const result = await pool.query(query, params);
    return result.rows;
  }
}

module.exports = new NFTService();

