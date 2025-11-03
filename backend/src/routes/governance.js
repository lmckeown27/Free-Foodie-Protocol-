const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const { authenticate, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

// Governance weights
const GOVERNANCE_WEIGHTS = {
  pantry: 70.00,
  supplier: 20.00,
  student: 10.00
};

// @route   POST /api/v1/governance/proposals
// @desc    Create a new governance proposal
// @access  Private (Pantry, Supplier, Student)
router.post('/proposals', authenticate, async (req, res, next) => {
  try {
    const {
      proposal_type,
      title,
      description,
      execution_data,
      voting_duration_days = 7
    } = req.body;
    
    if (!proposal_type || !title || !description) {
      return next(new AppError('Proposal type, title, and description are required', 400));
    }
    
    const validTypes = [
      'supplier_onboarding',
      'supplier_removal',
      'parameter_change',
      'policy_update',
      'distribution_change',
      'emergency_action',
      'community_initiative'
    ];
    
    if (!validTypes.includes(proposal_type)) {
      return next(new AppError('Invalid proposal type', 400));
    }
    
    const votingEndsAt = new Date();
    votingEndsAt.setDate(votingEndsAt.getDate() + voting_duration_days);
    
    const result = await query(
      `INSERT INTO governance_proposals (
        proposal_type, title, description, 
        proposed_by_entity, proposed_by_user,
        voting_ends_at, execution_data, status
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        proposal_type,
        title,
        description,
        req.user.role,
        req.user.id,
        votingEndsAt,
        JSON.stringify(execution_data || {}),
        'active'
      ]
    );
    
    logger.info('Governance proposal created', {
      proposalId: result.rows[0].id,
      type: proposal_type,
      by: req.user.role
    });
    
    // Create notification for all pantry users
    await query(
      `INSERT INTO notifications (user_id, type, title, message, data)
       SELECT id, 'governance_proposal', $1, $2, $3
       FROM users WHERE role = 'pantry'`,
      [
        '🏛️ New Governance Proposal',
        `A new ${proposal_type.replace('_', ' ')} proposal has been submitted: "${title}"`,
        JSON.stringify({ proposal_id: result.rows[0].id })
      ]
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Proposal created successfully. Voting period is now open.'
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/governance/proposals
// @desc    Get all proposals with filters
// @access  Public
router.get('/proposals', async (req, res, next) => {
  try {
    const { status, proposal_type, limit = 50, offset = 0 } = req.query;
    
    let queryStr = `
      SELECT 
        gp.*,
        u.first_name as proposer_first_name,
        u.last_name as proposer_last_name,
        u.email as proposer_email,
        (SELECT COUNT(*) FROM governance_votes WHERE proposal_id = gp.id) as total_votes
      FROM governance_proposals gp
      LEFT JOIN users u ON gp.proposed_by_user = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (status) {
      params.push(status);
      queryStr += ` AND gp.status = $${params.length}`;
    }
    
    if (proposal_type) {
      params.push(proposal_type);
      queryStr += ` AND gp.proposal_type = $${params.length}`;
    }
    
    queryStr += ` ORDER BY gp.created_at DESC`;
    
    params.push(limit, offset);
    queryStr += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;
    
    const result = await query(queryStr, params);
    
    // Get vote tallies for each proposal
    const proposalsWithVotes = await Promise.all(
      result.rows.map(async (proposal) => {
        const voteResult = await query(
          `SELECT 
            voter_entity,
            vote,
            SUM(vote_weight) as total_weight
           FROM governance_votes
           WHERE proposal_id = $1
           GROUP BY voter_entity, vote`,
          [proposal.id]
        );
        
        return {
          ...proposal,
          vote_tallies: voteResult.rows
        };
      })
    );
    
    res.json({
      success: true,
      data: proposalsWithVotes
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/governance/proposals/:id
// @desc    Get proposal details with full vote breakdown
// @access  Public
router.get('/proposals/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const proposalResult = await query(
      `SELECT 
        gp.*,
        u.first_name as proposer_first_name,
        u.last_name as proposer_last_name,
        u.email as proposer_email
       FROM governance_proposals gp
       LEFT JOIN users u ON gp.proposed_by_user = u.id
       WHERE gp.id = $1`,
      [id]
    );
    
    if (proposalResult.rows.length === 0) {
      return next(new AppError('Proposal not found', 404));
    }
    
    const proposal = proposalResult.rows[0];
    
    // Get all votes
    const votesResult = await query(
      `SELECT 
        gv.*,
        u.first_name,
        u.last_name,
        u.email
       FROM governance_votes gv
       LEFT JOIN users u ON gv.voter_user_id = u.id
       WHERE gv.proposal_id = $1
       ORDER BY gv.voted_at DESC`,
      [id]
    );
    
    // Get vote tallies by entity
    const talliesResult = await query(
      `SELECT 
        voter_entity,
        vote,
        SUM(vote_weight) as total_weight,
        COUNT(*) as vote_count
       FROM governance_votes
       WHERE proposal_id = $1
       GROUP BY voter_entity, vote`,
      [id]
    );
    
    // Get multi-sig approvals if applicable
    const approvalsResult = await query(
      `SELECT * FROM multi_sig_approvals 
       WHERE proposal_id = $1 
       ORDER BY signed_at DESC`,
      [id]
    );
    
    // Calculate current status
    const yesVotes = talliesResult.rows
      .filter(t => t.vote === 'yes')
      .reduce((sum, t) => sum + parseFloat(t.total_weight), 0);
    
    const totalVotes = talliesResult.rows
      .reduce((sum, t) => sum + parseFloat(t.total_weight), 0);
    
    const quorumMet = totalVotes >= parseFloat(proposal.quorum_required);
    const approved = quorumMet && (yesVotes / 100) >= 0.60; // 60% threshold
    
    res.json({
      success: true,
      data: {
        proposal,
        votes: votesResult.rows,
        vote_tallies: talliesResult.rows,
        multi_sig_approvals: approvalsResult.rows,
        vote_summary: {
          total_weight: totalVotes,
          yes_weight: yesVotes,
          quorum_met: quorumMet,
          approved: approved,
          quorum_required: parseFloat(proposal.quorum_required)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/v1/governance/proposals/:id/vote
// @desc    Vote on a proposal
// @access  Private
router.post('/proposals/:id/vote', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { vote, reasoning } = req.body;
    
    if (!vote || !['yes', 'no', 'abstain'].includes(vote)) {
      return next(new AppError('Valid vote (yes/no/abstain) is required', 400));
    }
    
    // Check if proposal exists and is active
    const proposalResult = await query(
      'SELECT * FROM governance_proposals WHERE id = $1',
      [id]
    );
    
    if (proposalResult.rows.length === 0) {
      return next(new AppError('Proposal not found', 404));
    }
    
    const proposal = proposalResult.rows[0];
    
    if (proposal.status !== 'active') {
      return next(new AppError('Proposal is not active for voting', 400));
    }
    
    if (new Date() > new Date(proposal.voting_ends_at)) {
      return next(new AppError('Voting period has ended', 400));
    }
    
    // Check if user already voted
    const existingVote = await query(
      'SELECT * FROM governance_votes WHERE proposal_id = $1 AND voter_user_id = $2',
      [id, req.user.id]
    );
    
    if (existingVote.rows.length > 0) {
      return next(new AppError('You have already voted on this proposal', 400));
    }
    
    // Determine vote weight based on user role
    const voteWeight = GOVERNANCE_WEIGHTS[req.user.role] || 0;
    
    if (voteWeight === 0) {
      return next(new AppError('Your role does not have voting rights', 403));
    }
    
    // Record vote
    const voteResult = await query(
      `INSERT INTO governance_votes (
        proposal_id, voter_entity, voter_user_id, vote, vote_weight, reasoning
      )
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, req.user.role, req.user.id, vote, voteWeight, reasoning]
    );
    
    logger.info('Governance vote cast', {
      proposalId: id,
      voter: req.user.role,
      vote,
      weight: voteWeight
    });
    
    // Check if voting is complete and update proposal status
    await checkAndUpdateProposalStatus(id);
    
    res.json({
      success: true,
      data: voteResult.rows[0],
      message: `Your ${vote} vote has been recorded with ${voteWeight}% weight.`
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/v1/governance/proposals/:id/multi-sig
// @desc    Add multi-sig approval (Pantry only)
// @access  Private/Pantry
router.post('/proposals/:id/multi-sig', authenticate, authorize('pantry'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { approved, notes, signature } = req.body;
    
    if (approved === undefined) {
      return next(new AppError('Approval status is required', 400));
    }
    
    // Check if proposal exists
    const proposalResult = await query(
      'SELECT * FROM governance_proposals WHERE id = $1',
      [id]
    );
    
    if (proposalResult.rows.length === 0) {
      return next(new AppError('Proposal not found', 404));
    }
    
    // Check if user already signed
    const existingSignature = await query(
      'SELECT * FROM multi_sig_approvals WHERE proposal_id = $1 AND signer_user_id = $2',
      [id, req.user.id]
    );
    
    if (existingSignature.rows.length > 0) {
      return next(new AppError('You have already signed this proposal', 400));
    }
    
    // Add signature
    const result = await query(
      `INSERT INTO multi_sig_approvals (
        proposal_id, action_type, signer_user_id, signer_name, signature, approved, notes
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        id,
        proposalResult.rows[0].proposal_type,
        req.user.id,
        `${req.user.first_name} ${req.user.last_name}`,
        signature || null,
        approved,
        notes
      ]
    );
    
    logger.info('Multi-sig approval recorded', {
      proposalId: id,
      signer: req.user.id,
      approved
    });
    
    // Check if enough signatures
    const allSignatures = await query(
      'SELECT * FROM multi_sig_approvals WHERE proposal_id = $1',
      [id]
    );
    
    const approvals = allSignatures.rows.filter(s => s.approved).length;
    const requiredApprovals = 3; // Configurable quorum
    
    res.json({
      success: true,
      data: result.rows[0],
      message: `Signature recorded. ${approvals}/${requiredApprovals} required approvals received.`
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/v1/governance/proposals/:id/execute
// @desc    Execute an approved proposal (Pantry only)
// @access  Private/Pantry
router.post('/proposals/:id/execute', authenticate, authorize('pantry'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { transaction_hash } = req.body;
    
    // Get proposal
    const proposalResult = await query(
      'SELECT * FROM governance_proposals WHERE id = $1',
      [id]
    );
    
    if (proposalResult.rows.length === 0) {
      return next(new AppError('Proposal not found', 404));
    }
    
    const proposal = proposalResult.rows[0];
    
    if (proposal.status !== 'passed') {
      return next(new AppError('Proposal must be in passed status to execute', 400));
    }
    
    // Update proposal status
    await query(
      `UPDATE governance_proposals 
       SET status = 'executed', executed_at = NOW(), executed_by = $1, execution_tx_hash = $2
       WHERE id = $3`,
      [req.user.id, transaction_hash, id]
    );
    
    // Log governance action
    await query(
      `INSERT INTO governance_actions (
        proposal_id, action_type, action_data, executed_by_entity, executed_by_user, transaction_hash
      )
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        id,
        proposal.proposal_type,
        proposal.execution_data,
        'pantry',
        req.user.id,
        transaction_hash
      ]
    );
    
    logger.info('Governance proposal executed', {
      proposalId: id,
      executedBy: req.user.id,
      txHash: transaction_hash
    });
    
    res.json({
      success: true,
      message: 'Proposal executed successfully. Transaction submitted to Aptos blockchain.',
      data: {
        proposal_id: id,
        transaction_hash
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/governance/stats
// @desc    Get governance statistics
// @access  Public
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await query(`
      SELECT 
        COUNT(*) as total_proposals,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_proposals,
        COUNT(CASE WHEN status = 'passed' THEN 1 END) as passed_proposals,
        COUNT(CASE WHEN status = 'executed' THEN 1 END) as executed_proposals,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_proposals
      FROM governance_proposals
    `);
    
    const voteStats = await query(`
      SELECT 
        voter_entity,
        COUNT(DISTINCT voter_user_id) as unique_voters,
        COUNT(*) as total_votes
      FROM governance_votes
      GROUP BY voter_entity
    `);
    
    const recentActivity = await query(`
      SELECT 
        gp.id,
        gp.title,
        gp.proposal_type,
        gp.status,
        gp.created_at,
        u.first_name,
        u.last_name
      FROM governance_proposals gp
      LEFT JOIN users u ON gp.proposed_by_user = u.id
      ORDER BY gp.created_at DESC
      LIMIT 10
    `);
    
    res.json({
      success: true,
      data: {
        overview: stats.rows[0],
        vote_participation: voteStats.rows,
        recent_activity: recentActivity.rows,
        governance_weights: GOVERNANCE_WEIGHTS
      }
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to check and update proposal status
async function checkAndUpdateProposalStatus(proposalId) {
  try {
    // Get all votes for proposal
    const votesResult = await query(
      `SELECT 
        voter_entity,
        vote,
        SUM(vote_weight) as total_weight
       FROM governance_votes
       WHERE proposal_id = $1
       GROUP BY voter_entity, vote`,
      [proposalId]
    );
    
    const yesVotes = votesResult.rows
      .filter(v => v.vote === 'yes')
      .reduce((sum, v) => sum + parseFloat(v.total_weight), 0);
    
    const noVotes = votesResult.rows
      .filter(v => v.vote === 'no')
      .reduce((sum, v) => sum + parseFloat(v.total_weight), 0);
    
    const totalVotes = yesVotes + noVotes;
    
    // Check if all entities have voted
    const pantryVoted = votesResult.rows.some(v => v.voter_entity === 'pantry');
    const allVoted = pantryVoted; // Pantry is required
    
    if (allVoted || totalVotes >= 60) { // Quorum reached
      const approved = (yesVotes / totalVotes) >= 0.60;
      const newStatus = approved ? 'passed' : 'failed';
      
      await query(
        'UPDATE governance_proposals SET status = $1 WHERE id = $2',
        [newStatus, proposalId]
      );
      
      logger.info('Proposal status updated', {
        proposalId,
        newStatus,
        yesVotes,
        noVotes,
        totalVotes
      });
    }
  } catch (error) {
    logger.error('Error checking proposal status', error);
  }
}

module.exports = router;

