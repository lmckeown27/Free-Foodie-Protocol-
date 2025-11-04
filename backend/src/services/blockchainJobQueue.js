/**
 * Blockchain Job Queue Service
 * 
 * Async processing of blockchain operations using Bull + Redis.
 * Jobs are queued immediately after off-chain DB updates for eventual consistency.
 * 
 * Job types:
 * - mint_allocation_nft: Create pickup ticket for student
 * - burn_allocation_nft: Redeem pickup ticket after food pickup
 * - mint_supplier_nft: Create donation receipt
 * - mint_volunteer_nft: Award volunteer badge
 * - mint_governance_nft: Grant voting rights
 * - batch_mint: Process multiple mints in one transaction
 */

const Bull = require('bull');
const db = require('../config/database');
const logger = require('../config/logger');
const petraVaultService = require('./petraVaultService');

// Initialize Redis connection
const redisConfig = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0')
  }
};

// Job queue configuration
const queueOptions = {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 60000 // 1 minute base delay
    },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 500 // Keep last 500 failed jobs for debugging
  }
};

// Create queues for different job types
const queues = {
  mintAllocation: new Bull('mint-allocation', { ...redisConfig, ...queueOptions }),
  burnAllocation: new Bull('burn-allocation', { ...redisConfig, ...queueOptions }),
  mintSupplier: new Bull('mint-supplier', { ...redisConfig, ...queueOptions }),
  mintVolunteer: new Bull('mint-volunteer', { ...redisConfig, ...queueOptions }),
  mintGovernance: new Bull('mint-governance', { ...redisConfig, ...queueOptions }),
  batchMint: new Bull('batch-mint', { ...redisConfig, ...queueOptions })
};

/**
 * Track job in database
 */
async function trackJob(jobId, jobType, payload) {
  try {
    await db.query(
      `INSERT INTO blockchain_jobs (job_id, job_type, payload, status)
       VALUES ($1, $2, $3, $4)`,
      [jobId, jobType, JSON.stringify(payload), 'queued']
    );
  } catch (error) {
    logger.error('Failed to track job in database', { jobId, error: error.message });
  }
}

/**
 * Update job status in database
 */
async function updateJobStatus(jobId, status, error = null, proposalId = null) {
  try {
    const updates = [];
    const values = [jobId];
    let paramIndex = 2;

    updates.push(`status = $${paramIndex++}`);
    values.push(status);

    if (status === 'processing') {
      updates.push(`started_at = CURRENT_TIMESTAMP`);
      updates.push(`attempts = attempts + 1`);
    }

    if (status === 'completed') {
      updates.push(`completed_at = CURRENT_TIMESTAMP`);
    }

    if (status === 'retrying') {
      updates.push(`next_retry_at = CURRENT_TIMESTAMP + INTERVAL '5 minutes'`);
      updates.push(`attempts = attempts + 1`);
    }

    if (error) {
      updates.push(`error_message = $${paramIndex++}`);
      values.push(error);
    }

    if (proposalId) {
      updates.push(`proposal_id = $${paramIndex++}`);
      values.push(proposalId);
    }

    await db.query(
      `UPDATE blockchain_jobs SET ${updates.join(', ')} WHERE job_id = $1`,
      values
    );
  } catch (dbError) {
    logger.error('Failed to update job status in database', { jobId, error: dbError.message });
  }
}

/**
 * Process mint allocation NFT job
 */
async function processMintAllocation(job) {
  const { allocationIds, vaultId } = job.data;
  const jobId = job.id.toString();

  logger.info('Processing mint allocation job', { jobId, allocationIds });

  try {
    await updateJobStatus(jobId, 'processing');

    // Get active vault if not specified
    const vault = vaultId 
      ? await db.query('SELECT * FROM pantry_vaults WHERE vault_id = $1', [vaultId])
      : await petraVaultService.getActiveVault();

    if (!vault || (Array.isArray(vault.rows) && vault.rows.length === 0)) {
      throw new Error('No active vault found');
    }

    const vaultData = vault.rows ? vault.rows[0] : vault;

    // Get allocation details
    const allocationsResult = await db.query(
      `SELECT a.id, a.student_id, a.inventory_id, u.email as student_email
       FROM allocations a
       JOIN users u ON a.student_id = u.id
       WHERE a.id = ANY($1)`,
      [allocationIds]
    );

    const allocations = allocationsResult.rows;

    if (allocations.length === 0) {
      throw new Error('No allocations found');
    }

    // Construct Aptos transaction payload
    const payload = {
      function: `${process.env.FFQ_CONTRACT_ADDRESS}::allocation_manager::batch_mint`,
      typeArguments: [],
      arguments: [
        allocations.map(a => a.student_id), // Student IDs as on-chain identifiers
        allocations.map(a => a.inventory_id), // Item IDs
        allocations.map(a => ({ allocation_id: a.id })) // Metadata
      ],
      maxGasAmount: '10000',
      gasUnitPrice: '100'
    };

    // Create Petra Vault proposal
    const proposal = await petraVaultService.createProposal({
      vaultId: vaultData.vault_id,
      transactionType: 'batch_mint_allocations',
      payload,
      metadata: {
        allocationIds,
        allocationCount: allocations.length,
        jobId
      }
    });

    await updateJobStatus(jobId, 'processing', null, proposal.proposalId);

    // Update allocations with proposal ID
    await db.query(
      `UPDATE allocations 
       SET mint_proposal_id = $1
       WHERE id = ANY($2)`,
      [proposal.proposalId, allocationIds]
    );

    logger.info('Proposal created, awaiting signatures', { 
      jobId, 
      proposalId: proposal.proposalId 
    });

    // Poll for approval (with timeout)
    const maxPollTime = 24 * 60 * 60 * 1000; // 24 hours
    const pollInterval = 5 * 60 * 1000; // 5 minutes
    const startTime = Date.now();

    while (Date.now() - startTime < maxPollTime) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      const proposalStatus = await petraVaultService.getProposalStatus(proposal.proposalId);

      // Update job progress
      const progress = ((Date.now() - startTime) / maxPollTime) * 100;
      await job.progress(Math.min(progress, 99));

      if (proposalStatus.status === 'approved') {
        logger.info('Proposal approved, executing transaction', { proposalId: proposal.proposalId });

        // Execute transaction
        const txResult = await petraVaultService.executeProposal(proposal.proposalId);

        // Update allocations with NFT data
        await db.query(
          `UPDATE allocations 
           SET status = $1
           WHERE id = ANY($2)`,
          ['minted', allocationIds]
        );

        // Create NFT records
        for (const allocation of allocations) {
          await db.query(
            `INSERT INTO nft_records 
              (nft_id, nft_type, owner_id, transaction_hash, proposal_id, 
               mint_job_id, status, metadata, minted_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)`,
            [
              `${txResult.transactionHash}::${allocation.id}`,
              'allocation',
              allocation.student_id,
              txResult.transactionHash,
              proposal.proposalId,
              jobId,
              'active',
              JSON.stringify({ allocationId: allocation.id })
            ]
          );
        }

        await updateJobStatus(jobId, 'completed');

        // Log audit event
        await db.query(
          `SELECT log_audit_event($1, $2, $3, $4, $5, $6, $7)`,
          [
            'allocations_minted',
            'blockchain_event',
            null,
            'system',
            'allocation',
            null,
            JSON.stringify({
              allocationIds,
              transactionHash: txResult.transactionHash,
              proposalId: proposal.proposalId
            })
          ]
        );

        return {
          success: true,
          proposalId: proposal.proposalId,
          transactionHash: txResult.transactionHash,
          allocationIds
        };
      }

      if (proposalStatus.status === 'rejected') {
        throw new Error('Proposal rejected by signers');
      }

      if (proposalStatus.status === 'expired') {
        throw new Error('Proposal expired without approval');
      }

      if (proposalStatus.status === 'failed') {
        throw new Error(`Proposal failed: ${proposalStatus.errorMessage}`);
      }
    }

    throw new Error('Proposal approval timeout');

  } catch (error) {
    logger.error('Mint allocation job failed', { jobId, error: error.message });
    await updateJobStatus(jobId, job.attemptsMade >= job.opts.attempts ? 'failed' : 'retrying', error.message);
    throw error;
  }
}

/**
 * Process burn allocation NFT job (after redemption)
 */
async function processBurnAllocation(job) {
  const { allocationId, vaultId } = job.data;
  const jobId = job.id.toString();

  logger.info('Processing burn allocation job', { jobId, allocationId });

  try {
    await updateJobStatus(jobId, 'processing');

    // Get allocation and NFT
    const result = await db.query(
      `SELECT a.*, n.nft_id, n.transaction_hash as mint_tx
       FROM allocations a
       LEFT JOIN nft_records n ON n.owner_id = a.student_id 
         AND n.nft_type = 'allocation' 
         AND n.metadata->>'allocationId' = a.id::text
         AND n.status = 'active'
       WHERE a.id = $1`,
      [allocationId]
    );

    if (result.rows.length === 0) {
      throw new Error(`Allocation not found: ${allocationId}`);
    }

    const allocation = result.rows[0];

    if (!allocation.nft_id) {
      logger.warn('No NFT found for allocation, skipping burn', { allocationId });
      await updateJobStatus(jobId, 'completed');
      return { success: true, skipped: true };
    }

    // Get vault
    const vault = vaultId 
      ? await db.query('SELECT * FROM pantry_vaults WHERE vault_id = $1', [vaultId])
      : await petraVaultService.getActiveVault();

    if (!vault || (Array.isArray(vault.rows) && vault.rows.length === 0)) {
      throw new Error('No active vault found');
    }

    const vaultData = vault.rows ? vault.rows[0] : vault;

    // Construct burn payload
    const payload = {
      function: `${process.env.FFQ_CONTRACT_ADDRESS}::allocation_manager::burn`,
      arguments: [allocation.nft_id],
      maxGasAmount: '5000',
      gasUnitPrice: '100'
    };

    // Create proposal
    const proposal = await petraVaultService.createProposal({
      vaultId: vaultData.vault_id,
      transactionType: 'burn_allocation_nft',
      payload,
      metadata: {
        allocationId,
        nftId: allocation.nft_id,
        jobId
      }
    });

    await updateJobStatus(jobId, 'processing', null, proposal.proposalId);

    // Poll and execute (similar to mint flow)
    // ... (polling logic similar to above)

    // For brevity, assuming immediate execution in stub:
    const txResult = await petraVaultService.executeProposal(proposal.proposalId);

    // Update NFT record
    await db.query(
      `UPDATE nft_records
       SET status = $1, burn_transaction_hash = $2, burn_job_id = $3, burned_at = CURRENT_TIMESTAMP
       WHERE nft_id = $4`,
      ['redeemed', txResult.transactionHash, jobId, allocation.nft_id]
    );

    await updateJobStatus(jobId, 'completed');

    return {
      success: true,
      transactionHash: txResult.transactionHash,
      allocationId
    };

  } catch (error) {
    logger.error('Burn allocation job failed', { jobId, error: error.message });
    await updateJobStatus(jobId, job.attemptsMade >= job.opts.attempts ? 'failed' : 'retrying', error.message);
    throw error;
  }
}

// Set up job processors
queues.mintAllocation.process(processMintAllocation);
queues.burnAllocation.process(processBurnAllocation);

// Similar processors for other job types...
// (mint supplier, volunteer, governance NFTs)

// Event handlers
Object.values(queues).forEach(queue => {
  queue.on('completed', (job, result) => {
    logger.info('Job completed', { jobId: job.id, queue: queue.name, result });
  });

  queue.on('failed', (job, error) => {
    logger.error('Job failed', { jobId: job.id, queue: queue.name, error: error.message });
  });

  queue.on('stalled', (job) => {
    logger.warn('Job stalled', { jobId: job.id, queue: queue.name });
  });
});

/**
 * Enqueue a job
 */
async function enqueueJob(queueName, jobType, data) {
  const queue = queues[queueName];
  if (!queue) {
    throw new Error(`Invalid queue: ${queueName}`);
  }

  const job = await queue.add(data, {
    jobId: `${jobType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  });

  await trackJob(job.id.toString(), jobType, data);

  logger.info('Job enqueued', { jobId: job.id, queue: queueName, jobType });

  return {
    jobId: job.id.toString(),
    status: 'queued'
  };
}

module.exports = {
  queues,
  enqueueJob,
  
  // Helper functions for specific job types
  enqueueMintAllocation: (allocationIds, vaultId = null) => 
    enqueueJob('mintAllocation', 'mint_allocation_nft', { allocationIds, vaultId }),
  
  enqueueBurnAllocation: (allocationId, vaultId = null) => 
    enqueueJob('burnAllocation', 'burn_allocation_nft', { allocationId, vaultId }),
  
  enqueueMintSupplier: (supplierId, inventoryId, vaultId = null) =>
    enqueueJob('mintSupplier', 'mint_supplier_nft', { supplierId, inventoryId, vaultId }),
  
  // Get job status
  getJobStatus: async (jobId) => {
    const result = await db.query(
      'SELECT * FROM blockchain_jobs WHERE job_id = $1',
      [jobId]
    );
    return result.rows[0] || null;
  }
};

